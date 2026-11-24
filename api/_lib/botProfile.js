// 서버별 치유미 봇 프로필(별명·프로필 사진·배너·소개글) — 디스코드 「Modify Current Member」(PATCH /guilds/{id}/members/@me).
// 2025-09부터 봇도 서버마다 avatar·banner·bio를 따로 둘 수 있다. 값에 null을 보내면 그 서버 설정이 지워져 기본 치유미로 돌아간다.
// 이미지는 data URI(PNG·JPEG·GIF)로 보낸다.

import { deflateSync } from 'node:zlib'

const API = 'https://discord.com/api/v10'

// ---- 「아예 빼기」: null을 보내면 기본 치유미 값(소개글·사진·배너)으로 돌아가므로, 빈 것처럼 보이는 값을 대신 넣는다.
//  소개글: 한글 채움 문자(U+3164) 한 글자 → 화면에는 빈칸. (빈 문자열은 기본값으로 되돌아갈 수 있어 쓰지 않는다)
//  프로필 사진: 투명 PNG, 배너: 고른 색 한 가지로 채운 PNG. (디스코드에 이름은 빈칸이 안 되어 이름 빼기는 없다)
export const BLANK_BIO = 'ㅤ'

function crc32(buf) {
  let crc = 0xffffffff
  for (const byte of buf) {
    let c = (crc ^ byte) & 0xff
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    crc = (crc >>> 8) ^ c
  }
  return (crc ^ 0xffffffff) >>> 0
}

function pngChunk(type, data) {
  const length = Buffer.alloc(4)
  length.writeUInt32BE(data.length)
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(body))
  return Buffer.concat([length, body, crc])
}

function solidPngDataUri(width, height, [r, g, b, a]) {
  const header = Buffer.alloc(13)
  header.writeUInt32BE(width, 0)
  header.writeUInt32BE(height, 4)
  header[8] = 8 // 8bit
  header[9] = 6 // RGBA
  const row = Buffer.alloc(1 + width * 4)
  for (let x = 0; x < width; x++) row.set([r, g, b, a], 1 + x * 4)
  const raw = Buffer.concat(Array.from({ length: height }, () => row))
  const png = Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    pngChunk('IHDR', header),
    pngChunk('IDAT', deflateSync(raw)),
    pngChunk('IEND', Buffer.alloc(0)),
  ])
  return `data:image/png;base64,${png.toString('base64')}`
}

export const blankAvatarDataUri = () => solidPngDataUri(128, 128, [0, 0, 0, 0])

export function solidBannerDataUri(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec(String(hex || ''))
  if (!m) return null
  const n = parseInt(m[1], 16)
  return solidPngDataUri(600, 240, [(n >> 16) & 255, (n >> 8) & 255, n & 255, 255])
}

function botHeaders(json) {
  const token = process.env.DISCORD_TOKEN
  if (!token) throw new Error('DISCORD_TOKEN 환경변수가 설정되지 않았습니다.')
  return { Authorization: `Bot ${token}`, ...(json ? { 'Content-Type': 'application/json' } : {}) }
}

let botUserCache = null
async function getBotUser() {
  if (botUserCache && Date.now() - botUserCache.at < 10 * 60_000) return botUserCache.user
  const res = await fetch(`${API}/users/@me`, { headers: botHeaders(false) })
  if (!res.ok) throw new Error(`봇 정보 조회 실패: ${res.status}`)
  const user = await res.json()
  botUserCache = { user, at: Date.now() }
  return user
}

const ext = (hash) => (hash.startsWith('a_') ? 'gif' : 'png')

export async function fetchBotProfile(guildId) {
  const bot = await getBotUser()
  const res = await fetch(`${API}/guilds/${guildId}/members/${bot.id}`, { headers: botHeaders(false) })
  if (!res.ok) throw new Error(`봇 멤버 정보 조회 실패: ${res.status}`)
  const member = await res.json()
  const base = `https://cdn.discordapp.com/guilds/${guildId}/users/${bot.id}`
  return {
    botId: bot.id,
    defaultName: bot.global_name || bot.username,
    defaultAvatarUrl: bot.avatar
      ? `https://cdn.discordapp.com/avatars/${bot.id}/${bot.avatar}.${ext(bot.avatar)}?size=256`
      : 'https://cdn.discordapp.com/embed/avatars/0.png',
    defaultBannerUrl: bot.banner ? `https://cdn.discordapp.com/banners/${bot.id}/${bot.banner}.${ext(bot.banner)}?size=600` : null,
    nick: member.nick || '',
    avatarUrl: member.avatar ? `${base}/avatars/${member.avatar}.${ext(member.avatar)}?size=256` : null,
    bannerUrl: member.banner ? `${base}/banners/${member.banner}.${ext(member.banner)}?size=600` : null,
  }
}

// 기본으로 되돌릴 때 실제로 바뀌어 있는 항목만 보낸다. 프로필 사진·배너는 디스코드가 변경 횟수를 제한해서(AVATAR_RATE_LIMIT)
// 바꾸지도 않은 사진까지 null로 보내면 그 제한에 걸려 이름·소개글 되돌리기까지 함께 실패할 수 있다.
// recordBio: 시트 「봇프로필」의 소개글 칸(디스코드 API로는 봇의 서버별 소개글을 읽을 수 없어서 기록으로 판단).
export async function resetBotProfile(guildId, recordBio) {
  const live = await fetchBotProfile(guildId)
  const body = {}
  if (live.nick) body.nick = null
  if (live.avatarUrl) body.avatar = null
  if (live.bannerUrl) body.banner = null
  if (recordBio) body.bio = null
  if (Object.keys(body).length === 0) body.bio = null // 기록이 없어도 소개글은 한 번 비워 둔다(제한 없음)
  return patchBotMember(guildId, body)
}

// 성공하면 { ok: true }, 실패하면 화면에 보여 줄 문장과 상태 코드를 돌려준다.
export async function patchBotMember(guildId, body) {
  const res = await fetch(`${API}/guilds/${guildId}/members/@me`, {
    method: 'PATCH',
    headers: botHeaders(true),
    body: JSON.stringify(body),
  })
  if (res.ok) return { ok: true }

  const detail = await res.json().catch(() => ({}))
  if (res.status === 429) {
    const wait = Math.ceil(Number(detail.retry_after) || 60)
    return { ok: false, status: 429, error: `디스코드가 잠시 변경을 막았어요. ${wait}초 뒤에 다시 시도해주세요.` }
  }
  if (res.status === 403) {
    return { ok: false, status: 403, error: '치유미에게 이 서버에서 별명을 바꿀 권한이 없어요. 서버 설정에서 치유미 역할에 「별명 변경」 권한을 주세요.' }
  }
  console.error('[botProfile] PATCH 실패', res.status, JSON.stringify(detail).slice(0, 500))
  const firstError = detail?.errors ? Object.values(detail.errors)[0]?._errors?.[0] : null
  // 디스코드는 프로필 사진·배너를 짧은 시간에 여러 번 바꾸면 AVATAR_RATE_LIMIT 등으로 막는다.
  if (/RATE_LIMIT/.test(firstError?.code || '')) {
    return { ok: false, status: 429, error: '디스코드가 프로필 사진·배너를 너무 자주 바꾸지 못하게 막았어요. 몇 분 뒤에 다시 시도해주세요.' }
  }
  const fieldError = firstError?.message || null
  return {
    ok: false,
    status: 400,
    error: fieldError ? `디스코드가 거절했어요: ${fieldError}` : '디스코드가 이 값을 받지 않았어요. 다른 이미지나 문구로 다시 시도해주세요.',
  }
}
