import {
  exchangeCodeForToken,
  fetchDiscordUser,
  createSessionCookie,
  readStateCookie,
  clearStateCookie,
} from '../../_lib/discordAuth.js'

function redirectTo(res, path) {
  res.writeHead(302, { Location: path })
  res.end()
}

export default async function handler(req, res) {
  const { code, state, error } = req.query || {}

  if (error) {
    redirectTo(res, '/DiscordBot/Chiyumi?login=cancelled')
    return
  }

  const expectedState = readStateCookie(req)
  if (!code || !state || state !== expectedState) {
    redirectTo(res, '/DiscordBot/Chiyumi?login=error')
    return
  }

  try {
    const { access_token: accessToken } = await exchangeCodeForToken(req, code)
    const user = await fetchDiscordUser(accessToken)
    res.setHeader('Set-Cookie', [createSessionCookie(user), clearStateCookie()])
    redirectTo(res, '/DiscordBot/Chiyumi?login=success')
  } catch (err) {
    console.error('[discord-auth] callback failed:', err)
    redirectTo(res, '/DiscordBot/Chiyumi?login=error')
  }
}
