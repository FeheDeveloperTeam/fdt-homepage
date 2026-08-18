import { buildAuthorizeUrl, createStateCookie, randomState } from '../../_lib/discordAuth.js'
import { rateLimit } from '../../_lib/rateLimit.js'
import { verifyTurnstileToken } from '../../_lib/turnstile.js'

export default async function handler(req, res) {
  if (!rateLimit(req, res, 'discord-login', { windowMs: 5 * 60_000, max: 20 })) return

  if (!process.env.DISCORD_CLIENT_ID) {
    res.statusCode = 500
    res.end('DISCORD_CLIENT_ID가 설정되지 않았습니다.')
    return
  }

  const remoteIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim()
  const verified = await verifyTurnstileToken(req.query?.token, remoteIp)
  if (!verified) {
    res.statusCode = 403
    res.setHeader('Content-Type', 'text/plain; charset=utf-8')
    res.end('사람인지 확인이 필요해요. 다시 시도해주세요.')
    return
  }

  const state = randomState()
  res.setHeader('Set-Cookie', createStateCookie(state))
  res.writeHead(302, { Location: buildAuthorizeUrl(req, state) })
  res.end()
}
