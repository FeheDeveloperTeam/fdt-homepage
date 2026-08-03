import { requireAdmin } from '../_lib/adminAuth.js'
import { getRestriction } from '../_lib/restrictions.js'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.statusCode = 405
    res.end('Method Not Allowed')
    return
  }

  const admin = requireAdmin(req, res)
  if (!admin) return

  const userId = req.query?.userId
  if (!userId) {
    res.statusCode = 400
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ error: 'userId가 필요해요.' }))
    return
  }

  try {
    const restriction = await getRestriction(userId)
    res.statusCode = 200
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ restricted: Boolean(restriction), restriction }))
  } catch (err) {
    console.error('[admin/restriction]', err)
    res.statusCode = 500
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ error: '이용제한 조회에 실패했어요. 잠시 후 다시 시도해주세요.' }))
  }
}
