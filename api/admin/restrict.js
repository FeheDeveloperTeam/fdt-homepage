import { requireAdmin } from '../_lib/adminAuth.js'
import { restrictUser } from '../_lib/restrictions.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.statusCode = 405
    res.end('Method Not Allowed')
    return
  }

  const admin = await requireAdmin(req, res)
  if (!admin) return

  const { userId, reason } = req.body || {}
  if (!userId) {
    res.statusCode = 400
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ error: 'userId가 필요해요.' }))
    return
  }

  try {
    await restrictUser(userId, reason, admin.id)
    res.statusCode = 200
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ ok: true }))
  } catch (err) {
    console.error('[admin/restrict]', err)
    res.statusCode = 500
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ error: '이용제한 처리에 실패했어요. 잠시 후 다시 시도해주세요.' }))
  }
}
