import { readSession } from '../_lib/discordAuth.js'

export default function handler(req, res) {
  const user = readSession(req)
  res.statusCode = 200
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify({ user }))
}
