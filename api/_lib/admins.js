import { withSftp, readJson, writeJson } from './sftpClient.js'

// 이 사이트 관리자 대시보드 접근 권한자 목록 — 봇은 이 데이터를 쓰지 않는, 웹 전용 개념이라
// 봇 저장소의 다른 data/*.json과는 별도 파일로 둔다.
const REMOTE_PATH = 'data/webAdmins.json'

export async function listDbAdmins() {
  return withSftp(async (client) => {
    const all = await readJson(client, REMOTE_PATH)
    return Object.entries(all)
      .map(([userId, entry]) => ({ userId, addedBy: entry.addedBy, addedAt: entry.addedAt }))
      .sort((a, b) => new Date(a.addedAt) - new Date(b.addedAt))
  })
}

export async function isDbAdmin(userId) {
  return withSftp(async (client) => {
    const all = await readJson(client, REMOTE_PATH)
    return Boolean(all[userId])
  })
}

export async function addAdmin(userId, byId) {
  return withSftp(async (client) => {
    const all = await readJson(client, REMOTE_PATH)
    all[userId] = { addedBy: byId, addedAt: new Date().toISOString() }
    await writeJson(client, REMOTE_PATH, all)
  })
}

export async function removeAdmin(userId) {
  return withSftp(async (client) => {
    const all = await readJson(client, REMOTE_PATH)
    delete all[userId]
    await writeJson(client, REMOTE_PATH, all)
  })
}
