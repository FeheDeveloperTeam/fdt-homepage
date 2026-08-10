import { randomBytes } from 'node:crypto'
import jwt from 'jsonwebtoken'
import { serialize, parse } from 'cookie'
import { getSupabase } from './supabase.js'

const SESSION_COOKIE = 'fdt_session'
const STATE_COOKIE = 'fdt_oauth_state'
const SESSION_MAX_AGE = 60 * 60 * 24 * 7 // 7일

function requireEnv(name) {
  const value = process.env[name]
  if (!value) throw new Error(`${name} 환경변수가 설정되지 않았습니다.`)
  return value
}

function getRedirectUri(req) {
  const host = req.headers['x-forwarded-host'] || req.headers.host
  const proto = req.headers['x-forwarded-proto'] || (host?.includes('localhost') ? 'http' : 'https')
  return `${proto}://${host}/api/auth/discord/callback`
}

export function randomState() {
  return randomBytes(16).toString('hex')
}

export function buildAuthorizeUrl(req, state) {
  const params = new URLSearchParams({
    client_id: requireEnv('DISCORD_CLIENT_ID'),
    redirect_uri: getRedirectUri(req),
    response_type: 'code',
    scope: 'identify guilds',
    state,
  })
  return `https://discord.com/oauth2/authorize?${params.toString()}`
}

export async function exchangeCodeForToken(req, code) {
  const body = new URLSearchParams({
    client_id: requireEnv('DISCORD_CLIENT_ID'),
    client_secret: requireEnv('DISCORD_CLIENT_SECRET'),
    grant_type: 'authorization_code',
    code,
    redirect_uri: getRedirectUri(req),
  })
  const res = await fetch('https://discord.com/api/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })
  if (!res.ok) throw new Error(`디스코드 토큰 교환 실패: ${res.status}`)
  return res.json()
}

export async function fetchDiscordUser(accessToken) {
  const res = await fetch('https://discord.com/api/users/@me', {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!res.ok) throw new Error(`디스코드 유저 정보 조회 실패: ${res.status}`)
  const data = await res.json()
  return {
    id: data.id,
    username: data.global_name || data.username,
    avatar: data.avatar
      ? `https://cdn.discordapp.com/avatars/${data.id}/${data.avatar}.png?size=128`
      : `https://cdn.discordapp.com/embed/avatars/${Number(data.discriminator || 0) % 5}.png`,
  }
}

// 서버 대시보드용 — 유저 액세스 토큰으로 "이 유저가 속한 길드 + 그 안에서의 권한
// 비트"를 가져온다. 봇이 그 길드에 있는지는 이걸로 알 수 없어서, api/_lib/discordApi.js
// 쪽의 봇 토큰 기반 fetchBotGuildIds()와 교집합을 내서 써야 한다.
export async function fetchUserGuilds(accessToken) {
  const res = await fetch('https://discord.com/api/users/@me/guilds', {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!res.ok) throw new Error(`디스코드 길드 목록 조회 실패: ${res.status}`)
  const data = await res.json()
  return data.map((g) => ({
    id: g.id,
    name: g.name,
    icon: g.icon
      ? `https://cdn.discordapp.com/icons/${g.id}/${g.icon}.png?size=64`
      : null,
    permissions: BigInt(g.permissions ?? 0),
  }))
}

export function createSessionCookie(user) {
  const token = jwt.sign(user, requireEnv('SESSION_SECRET'), { expiresIn: SESSION_MAX_AGE })
  return serialize(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  })
}

export function clearSessionCookie() {
  return serialize(SESSION_COOKIE, '', { httpOnly: true, path: '/', maxAge: 0 })
}

export function readSession(req) {
  const cookies = parse(req.headers.cookie || '')
  const token = cookies[SESSION_COOKIE]
  if (!token) return null
  try {
    const { iat: _iat, exp: _exp, ...user } = jwt.verify(token, requireEnv('SESSION_SECRET'))
    return user
  } catch {
    return null
  }
}

export function createStateCookie(state) {
  return serialize(STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 300,
  })
}

export function readStateCookie(req) {
  const cookies = parse(req.headers.cookie || '')
  return cookies[STATE_COOKIE] || null
}

export function clearStateCookie() {
  return serialize(STATE_COOKIE, '', { httpOnly: true, path: '/', maxAge: 0 })
}

export function getRootAdminIds() {
  return (process.env.ADMIN_DISCORD_IDS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

export async function isAdminUser(id) {
  const strId = String(id)
  if (getRootAdminIds().includes(strId)) return true

  const { data, error } = await getSupabase()
    .from('admins')
    .select('user_id')
    .eq('user_id', strId)
    .maybeSingle()
  if (error) {
    console.error('[isAdminUser]', error)
    return false
  }
  return Boolean(data)
}
