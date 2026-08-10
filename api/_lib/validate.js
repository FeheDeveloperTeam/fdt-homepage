const DISCORD_ID_PATTERN = /^\d{17,20}$/

export function isDiscordId(value) {
  return typeof value === 'string' && DISCORD_ID_PATTERN.test(value)
}
