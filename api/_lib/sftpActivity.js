import { withSftp, readJson } from './sftpClient.js'

// 봇 저장소의 src/utils/levels.js·voiceTime.js·credits.js(claims)와 데이터
// 스키마·레벨 공식을 맞춘다. 채팅/음성은 누적 총량만, 출석은 마지막으로 기록된
// 날짜·연속일수만 저장돼 있어서(둘 다 일별 기록 없음) "활동량"은 지금까지의
// 순위·참여 여부로만 보여줄 수 있다. 출석(claims.json)은 길드 구분 없이
// 봇 전체에서 공유되는 데이터라, 길드별로 보려면 그 서버 멤버 id 목록과
// 교집합을 내야 한다(guild.js의 handleOverview에서 처리).
const LEVELS_PATH = 'data/levels.json'
const VOICE_PATH = 'data/voiceTime.json'
const CLAIMS_PATH = 'data/claims.json'

function xpForLevel(level) {
  return 5 * level * level + 50 * level + 100
}

function levelFromXp(xp) {
  let level = 0
  let remaining = xp
  while (remaining >= xpForLevel(level)) {
    remaining -= xpForLevel(level)
    level += 1
  }
  return level
}

export async function getGuildActivity(guildId, limit = 10) {
  const [levels, voice] = await withSftp(async (client) => {
    const [levelsAll, voiceAll] = await Promise.all([
      readJson(client, LEVELS_PATH),
      readJson(client, VOICE_PATH),
    ])
    return [levelsAll[guildId] ?? {}, voiceAll[guildId] ?? {}]
  })

  const chatEntries = Object.entries(levels).map(([userId, value]) => ({ userId, xp: value.xp ?? 0 }))
  const voiceEntries = Object.entries(voice).map(([userId, ms]) => ({ userId, ms }))

  return {
    topChat: chatEntries
      .sort((a, b) => b.xp - a.xp)
      .slice(0, limit)
      .map((e) => ({ ...e, level: levelFromXp(e.xp) })),
    topVoice: voiceEntries.sort((a, b) => b.ms - a.ms).slice(0, limit),
    chatParticipantIds: new Set(chatEntries.filter((e) => e.xp > 0).map((e) => e.userId)),
    voiceParticipantIds: new Set(voiceEntries.filter((e) => e.ms > 0).map((e) => e.userId)),
  }
}

export async function getAllClaims() {
  return withSftp((client) => readJson(client, CLAIMS_PATH))
}
