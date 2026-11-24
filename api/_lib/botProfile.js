// 서버별 치유미 봇 프로필(별명·프로필 사진·배너·소개글) — 디스코드 「Modify Current Member」(PATCH /guilds/{id}/members/@me).
// 2025-09부터 봇도 서버마다 avatar·banner·bio를 따로 둘 수 있다. 값에 null을 보내면 그 서버 설정이 지워져 기본 치유미로 돌아간다.
// 이미지는 data URI(PNG·JPEG·GIF)로 보낸다.

const API = 'https://discord.com/api/v10'

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
  const fieldError = detail?.errors ? Object.values(detail.errors)[0]?._errors?.[0]?.message : null
  return {
    ok: false,
    status: 400,
    error: fieldError ? `디스코드가 거절했어요: ${fieldError}` : '디스코드가 이 값을 받지 않았어요. 다른 이미지나 문구로 다시 시도해주세요.',
  }
}
