import { withSftp, readJson } from './sftpClient.js'

// 봇 저장소의 src/utils/levels.js·voiceTime.js와 데이터 스키마·레벨 공식을 맞춘다.
// 둘 다 누적 총량만 저장돼 있어서(일별 기록 없음) "활동량"은 지금까지의 순위로만
// 보여줄 수 있다.
const LEVELS_PATH = 'data/levels.json'
const VOICE_PATH = 'data/voiceTime.json'

function xpForLevel(level) {
  return 5 * level * level + 50 * level + 100
}

export function levelFromXp(xp) {
  let level = 0
  let remaining = xp
  while (remaining >= xpForLevel(level)) {
    remaining -= xpForLevel(level)
    level += 1
  }
  return level
}

export async function getGuildChatLeaderboard(guildId, limit = 10) {
  return withSftp(async (client) => {
    const all = await readJson(client, LEVELS_PATH)
    const entries = Object.entries(all[guildId] ?? {})
      .map(([userId, value]) => ({ userId, xp: value.xp ?? 0 }))
      .sort((a, b) => b.xp - a.xp)
      .slice(0, limit)
    return entries.map((e) => ({ ...e, level: levelFromXp(e.xp) }))
  })
}

export async function getGuildVoiceLeaderboard(guildId, limit = 10) {
  return withSftp(async (client) => {
    const all = await readJson(client, VOICE_PATH)
    return Object.entries(all[guildId] ?? {})
      .map(([userId, ms]) => ({ userId, ms }))
      .sort((a, b) => b.ms - a.ms)
      .slice(0, limit)
  })
}
