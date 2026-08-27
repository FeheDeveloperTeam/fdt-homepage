import { withSftp, readJson, writeJson } from './sftpClient.js'

// 봇 저장소의 src/utils/restrictions.js(data/restrictions.json)와 스키마를 맞춘다.
// Supabase는 AI 기능(memories 테이블) 전용으로 쓰기로 했고, 봇도 이 기능은 애초에
// Supabase가 아니라 이 파일을 직접 읽고 있었어서 SFTP JSON으로 통일한다.
const REMOTE_PATH = 'data/restrictions.json'

export async function getRestriction(userId) {
  return withSftp(async (client) => {
    const all = await readJson(client, REMOTE_PATH)
    return all[userId] ?? null
  })
}

export async function restrictUser(userId, reason, byId) {
  return withSftp(async (client) => {
    const all = await readJson(client, REMOTE_PATH)
    all[userId] = {
      reason: reason || '사유 없음',
      restrictedBy: byId,
      restrictedAt: new Date().toISOString(),
    }
    await writeJson(client, REMOTE_PATH, all)
  })
}

export async function unrestrictUser(userId) {
  return withSftp(async (client) => {
    const all = await readJson(client, REMOTE_PATH)
    if (!all[userId]) return false
    delete all[userId]
    await writeJson(client, REMOTE_PATH, all)
    return true
  })
}

export async function getRestrictedCount() {
  return withSftp(async (client) => {
    const all = await readJson(client, REMOTE_PATH)
    return Object.keys(all).length
  })
}
