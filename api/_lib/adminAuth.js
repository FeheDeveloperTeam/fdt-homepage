import { readSession, isAdminUser } from './discordAuth.js'
import { isForeignRequest } from './geoBlock.js'

export async function requireAdmin(req, res) {
  if (isForeignRequest(req)) {
    res.statusCode = 403
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ error: '한국 IP에서만 이용할 수 있어요.' }))
    return null
  }

  const user = readSession(req)
  if (!user || !(await isAdminUser(user.id))) {
    res.statusCode = 403
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ error: '권한이 없어요.' }))
    return null
  }
  return user
}
