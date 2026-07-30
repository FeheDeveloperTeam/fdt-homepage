import { clearSessionCookie } from '../../server/discordAuth.js'

export default function handler(req, res) {
  res.setHeader('Set-Cookie', clearSessionCookie())
  res.writeHead(302, { Location: '/DiscordBot/Chiyumi' })
  res.end()
}
