import { buildAuthorizeUrl, createStateCookie, randomState } from '../../_lib/discordAuth.js'
import { rateLimit } from '../../_lib/rateLimit.js'

export default function handler(req, res) {
  if (!rateLimit(req, res, 'discord-login', { windowMs: 5 * 60_000, max: 20 })) return

  if (!process.env.DISCORD_CLIENT_ID) {
    res.statusCode = 500
    res.end('DISCORD_CLIENT_ID가 설정되지 않았습니다.')
    return
  }

  const state = randomState()
  res.setHeader('Set-Cookie', createStateCookie(state))
  res.writeHead(302, { Location: buildAuthorizeUrl(req, state) })
  res.end()
}
