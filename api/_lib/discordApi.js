function requireEnv(name) {
  const value = process.env[name]
  if (!value) throw new Error(`${name} 환경변수가 설정되지 않았습니다.`)
  return value
}

export async function discordApi(path, options = {}) {
  const res = await fetch(`https://discord.com/api/v10${path}`, {
    ...options,
    headers: {
      Authorization: `Bot ${requireEnv('DISCORD_TOKEN')}`,
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
  })
  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    throw new Error(`디스코드 API 호출 실패 (${path}): ${res.status} ${detail}`.trim())
  }
  // 204 No Content 응답(밴/킥 등)엔 바디가 없다.
  if (res.status === 204) return null
  return res.json()
}

// 봇이 실제로 들어가 있는 길드 id 목록. 유저 OAuth 길드 목록과 교집합을 내서
// "사용자가 관리 권한을 가진 + 봇도 있는" 서버만 걸러내는 데 쓴다.
export async function fetchBotGuildIds() {
  const guilds = await discordApi('/users/@me/guilds?limit=200')
  return new Set(guilds.map((g) => g.id))
}

export async function fetchGuildInfo(guildId) {
  const g = await discordApi(`/guilds/${guildId}?with_counts=true`)
  return {
    id: g.id,
    name: g.name,
    icon: g.icon ? `https://cdn.discordapp.com/icons/${g.id}/${g.icon}.png?size=128` : null,
    memberCount: g.approximate_member_count ?? null,
    onlineCount: g.approximate_presence_count ?? null,
    boostLevel: g.premium_tier ?? 0,
    boostCount: g.premium_subscription_count ?? 0,
  }
}

const TEXT_CHANNEL_TYPES = new Set([0, 5]) // GUILD_TEXT, GUILD_ANNOUNCEMENT

export async function fetchGuildChannels(guildId) {
  const channels = await discordApi(`/guilds/${guildId}/channels`)
  return channels
    .filter((c) => TEXT_CHANNEL_TYPES.has(c.type))
    .sort((a, b) => a.position - b.position)
    .map((c) => ({ id: c.id, name: c.name }))
}

// 참여율·인원 통계용 — 사람 멤버 id 목록과 봇 수를 나눠서 돌려준다. 1000명까지만
// 가져오고(한 번의 REST 호출 한도) 그 이상은 페이지네이션하지 않아 대형
// 서버에서는 근사치가 된다.
// (REST API는 멤버의 온라인 상태를 안 줘서 — 그건 게이트웨이 프레즌스 인텐트가
// 있어야만 알 수 있고 이 봇엔 없음 — "현재 접속 중 X명" 자체를 사람/봇으로
// 나누는 건 불가능하다. 대신 정확히 셀 수 있는 전체 인원의 사람/봇 구성을 준다.)
export async function fetchGuildMembers(guildId) {
  const members = await discordApi(`/guilds/${guildId}/members?limit=1000`)
  const humanIds = []
  let botCount = 0
  for (const m of members) {
    if (m.user?.bot) botCount += 1
    else humanIds.push(m.user.id)
  }
  return { humanIds, botCount }
}

export async function fetchGuildRoles(guildId) {
  const roles = await discordApi(`/guilds/${guildId}/roles`)
  return roles
    .filter((r) => r.name !== '@everyone')
    .sort((a, b) => b.position - a.position)
    .map((r) => ({ id: r.id, name: r.name, color: r.color }))
}

export async function banGuildMember(guildId, userId, reason) {
  await discordApi(`/guilds/${guildId}/bans/${userId}`, {
    method: 'PUT',
    headers: reason ? { 'X-Audit-Log-Reason': encodeURIComponent(reason) } : {},
    body: JSON.stringify({}),
  })
}

export async function kickGuildMember(guildId, userId, reason) {
  await discordApi(`/guilds/${guildId}/members/${userId}`, {
    method: 'DELETE',
    headers: reason ? { 'X-Audit-Log-Reason': encodeURIComponent(reason) } : {},
  })
}

export async function sendChannelMessage(channelId, payload) {
  return discordApi(`/channels/${channelId}/messages`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function fetchDiscordProfile(id) {
  try {
    const data = await discordApi(`/users/${id}`)
    return {
      id: data.id,
      username: data.global_name || data.username,
      avatar: data.avatar
        ? `https://cdn.discordapp.com/avatars/${data.id}/${data.avatar}.png?size=64`
        : `https://cdn.discordapp.com/embed/avatars/${Number(data.discriminator || 0) % 5}.png`,
    }
  } catch {
    return { id, username: id, avatar: 'https://cdn.discordapp.com/embed/avatars/0.png' }
  }
}
