function requireEnv(name) {
  const value = process.env[name]
  if (!value) throw new Error(`${name} 환경변수가 설정되지 않았습니다.`)
  return value
}

export async function discordApi(path) {
  const res = await fetch(`https://discord.com/api/v10${path}`, {
    headers: { Authorization: `Bot ${requireEnv('DISCORD_TOKEN')}` },
  })
  if (!res.ok) throw new Error(`디스코드 API 호출 실패 (${path}): ${res.status}`)
  return res.json()
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
