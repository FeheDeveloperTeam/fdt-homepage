import { requireAdmin } from '../_lib/adminAuth.js'
import { unrestrictUser } from '../_lib/restrictions.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.statusCode = 405
    res.end('Method Not Allowed')
    return
  }

  const admin = requireAdmin(req, res)
  if (!admin) return

  const { userId } = req.body || {}
  if (!userId) {
    res.statusCode = 400
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ error: 'userId가 필요해요.' }))
    return
  }

  try {
    const existed = await unrestrictUser(userId)
    res.statusCode = 200
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ ok: true, existed }))
  } catch (err) {
    console.error('[admin/unrestrict]', err)
    res.statusCode = 500
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ error: '이용제한 해제에 실패했어요. 잠시 후 다시 시도해주세요.' }))
  }
}
