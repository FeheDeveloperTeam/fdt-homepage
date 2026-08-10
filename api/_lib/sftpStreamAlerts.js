import { randomUUID } from 'node:crypto'
import { withSftp, readJson, writeJson } from './sftpClient.js'

// 봇 저장소의 src/utils/streamAlert.js와 스키마·플랫폼별 채널ID 추출 로직을 맞춘다.
const REMOTE_PATH = 'data/streamAlerts.json'

export function extractChannelId(platform, link) {
  try {
    switch (platform) {
      case 'youtube':
      case 'youtube_upload': {
        const m1 = link.match(/youtube\.com\/@([^/?&#\s]+)/)
        if (m1) return `@${m1[1]}`
        const m2 = link.match(/youtube\.com\/channel\/([^/?&#\s]+)/)
        if (m2) return m2[1]
        break
      }
      case 'chzzk': {
        const m = link.match(/chzzk\.naver\.com\/([a-f0-9A-F]{32,})/)
        if (m) return m[1]
        break
      }
      case 'soop': {
        const m1 = link.match(/sooplive\.co\.kr\/([^/?&#\s]+)/)
        if (m1) return m1[1]
        const m2 = link.match(/afreecatv\.com\/([^/?&#\s]+)/)
        if (m2) return m2[1]
        break
      }
    }
  } catch {
    // 링크 형식이 안 맞으면 null로 떨어뜨린다
  }
  return null
}

export async function resolveYouTubeChannelId(handle) {
  if (!handle.startsWith('@')) return handle
  try {
    const res = await fetch(`https://www.youtube.com/${handle}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8',
      },
    })
    const html = await res.text()
    const m =
      html.match(/"channelId":"(UC[^"]{22})"/) || html.match(/"externalId":"(UC[^"]{22})"/)
    return m ? m[1] : null
  } catch {
    return null
  }
}

export async function getGuildAlerts(guildId) {
  return withSftp(async (client) => {
    const all = await readJson(client, REMOTE_PATH)
    return all[guildId] ?? []
  })
}

export async function isDuplicate(guildId, platform, channelId) {
  const alerts = await getGuildAlerts(guildId)
  return alerts.some((a) => a.platform === platform && a.channelId === channelId)
}

export async function addAlert(guildId, alert) {
  return withSftp(async (client) => {
    const all = await readJson(client, REMOTE_PATH)
    if (!all[guildId]) all[guildId] = []
    const entry = { ...alert, id: randomUUID(), isLive: false }
    all[guildId].push(entry)
    await writeJson(client, REMOTE_PATH, all)
    return entry
  })
}

export async function removeAlert(guildId, alertId) {
  return withSftp(async (client) => {
    const all = await readJson(client, REMOTE_PATH)
    if (!all[guildId]) return false
    const before = all[guildId].length
    all[guildId] = all[guildId].filter((a) => a.id !== alertId)
    await writeJson(client, REMOTE_PATH, all)
    return all[guildId].length < before
  })
}

export async function updateAlert(guildId, alertId, updates) {
  return withSftp(async (client) => {
    const all = await readJson(client, REMOTE_PATH)
    const alert = all[guildId]?.find((a) => a.id === alertId)
    if (!alert) return false
    Object.assign(alert, updates)
    await writeJson(client, REMOTE_PATH, all)
    return true
  })
}
