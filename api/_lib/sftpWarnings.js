import { withSftp, readJson, writeJson } from './sftpClient.js'

// 봇 저장소의 src/utils/warnData.js와 스키마를 맞춘다.
const REMOTE_PATH = 'data/warnings.json'
const key = (guildId, userId) => `${guildId}:${userId}`

export async function getUserWarnings(guildId, userId) {
  return withSftp(async (client) => {
    const all = await readJson(client, REMOTE_PATH)
    return all[key(guildId, userId)] ?? { count: 0, history: [] }
  })
}

export async function addWarning(guildId, userId, reason, moderatorId) {
  return withSftp(async (client) => {
    const all = await readJson(client, REMOTE_PATH)
    const k = key(guildId, userId)
    const entry = all[k] ?? { count: 0, history: [] }
    entry.count += 1
    entry.history.push({
      id: entry.count,
      reason,
      moderatorId,
      timestamp: Math.floor(Date.now() / 1000),
    })
    all[k] = entry
    await writeJson(client, REMOTE_PATH, all)
    return entry
  })
}

export async function removeWarning(guildId, userId, amount = 1) {
  return withSftp(async (client) => {
    const all = await readJson(client, REMOTE_PATH)
    const k = key(guildId, userId)
    const entry = all[k] ?? { count: 0, history: [] }
    const removed = Math.min(amount, entry.count)
    entry.count -= removed
    entry.history = entry.history.slice(0, Math.max(0, entry.history.length - removed))
    all[k] = entry
    await writeJson(client, REMOTE_PATH, all)
    return entry
  })
}

export async function resetWarnings(guildId, userId) {
  return withSftp(async (client) => {
    const all = await readJson(client, REMOTE_PATH)
    all[key(guildId, userId)] = { count: 0, history: [] }
    await writeJson(client, REMOTE_PATH, all)
  })
}
