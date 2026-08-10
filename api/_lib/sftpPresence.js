import { withSftp, readJson } from './sftpClient.js'

// 봇 저장소의 src/utils/presenceSnapshot.js가 2분마다 써주는 스냅샷을 읽는다.
// GuildPresences 인텐트가 새로 추가된 거라, 봇이 그 코드로 재배포되기 전까지는
// 파일 자체가 없거나 값이 없을 수 있다 — 그런 경우 null을 돌려주고, 프런트에서
// "집계 준비 중" 같은 문구로 처리한다.
const PRESENCE_PATH = 'data/presence.json'

export async function getGuildOnlineHumans(guildId) {
  return withSftp(async (client) => {
    const all = await readJson(client, PRESENCE_PATH)
    return all[guildId] ?? null
  })
}
