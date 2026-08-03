import { readSession, isAdminUser } from './discordAuth.js'

export function requireAdmin(req, res) {
  const user = readSession(req)
  if (!user || !isAdminUser(user.id)) {
    res.statusCode = 403
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ error: '권한이 없어요.' }))
    return null
  }
  return user
}
