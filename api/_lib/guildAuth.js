import { readSession, fetchUserGuilds } from './discordAuth.js'
import { fetchBotGuildIds } from './discordApi.js'

// 팀 관리자 전용인 requireAdmin과 달리, 여긴 "이 유저가 이 길드에서 서버 관리
// 권한(또는 그 이상)을 갖고 있고, 치유미 봇도 그 길드에 들어가 있는지"를 확인한다.
// 봇이 없는 길드거나 권한이 없으면 그 서버의 설정을 아예 볼 수 없어야 한다.
const PERMISSION_BITS = {
  MANAGE_GUILD: 0x20n,
  BAN_MEMBERS: 0x4n,
  KICK_MEMBERS: 0x2n,
}

function deny(res, status, error) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify({ error }))
  return null
}

export async function requireGuildManager(req, res, guildId, requiredBit = 'MANAGE_GUILD') {
  const session = readSession(req)
  if (!session) return deny(res, 401, '로그인이 필요해요.')
  // guilds 스코프 추가 전에 로그인해서 세션에 accessToken이 없는 경우 — 재로그인 필요.
  if (!session.accessToken) return deny(res, 401, '다시 로그인해주세요.')
  if (!guildId) return deny(res, 400, 'guildId가 필요해요.')

  try {
    const [userGuilds, botGuildIds] = await Promise.all([
      fetchUserGuilds(session.accessToken),
      fetchBotGuildIds(),
    ])

    const guild = userGuilds.find((g) => g.id === guildId)
    const bit = PERMISSION_BITS[requiredBit]
    const hasPermission = Boolean(guild) && (guild.permissions & bit) === bit

    if (!guild || !hasPermission || !botGuildIds.has(guildId)) {
      return deny(res, 403, '이 서버를 관리할 권한이 없거나 치유미가 없는 서버예요.')
    }

    return { user: session, guild }
  } catch (err) {
    console.error('[requireGuildManager]', err)
    return deny(res, 500, '권한 확인에 실패했어요. 잠시 후 다시 시도해주세요.')
  }
}

// 길드 피커(목록) 페이지용 — "봇이 있고 + ManageGuild 권한이 있는" 길드만 추려서 돌려준다.
export async function listManageableGuilds(session) {
  const [userGuilds, botGuildIds] = await Promise.all([
    fetchUserGuilds(session.accessToken),
    fetchBotGuildIds(),
  ])

  return userGuilds
    .filter((g) => botGuildIds.has(g.id) && (g.permissions & PERMISSION_BITS.MANAGE_GUILD) === PERMISSION_BITS.MANAGE_GUILD)
    .map((g) => ({ id: g.id, name: g.name, icon: g.icon }))
}
