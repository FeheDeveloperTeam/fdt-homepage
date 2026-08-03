import { readSession, isAdminUser } from '../_lib/discordAuth.js'

export default async function handler(req, res) {
  const user = readSession(req)
  const payload = user ? { ...user, isAdmin: await isAdminUser(user.id) } : null
  res.statusCode = 200
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify({ user: payload }))
}
