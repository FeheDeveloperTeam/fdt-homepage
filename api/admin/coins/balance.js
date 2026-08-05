import { requireAdmin } from '../../_lib/adminAuth.js'
import { getCreditBalance } from '../../_lib/sftpCredits.js'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.statusCode = 405
    res.end('Method Not Allowed')
    return
  }

  const admin = await requireAdmin(req, res)
  if (!admin) return

  const userId = req.query?.userId
  if (!userId) {
    res.statusCode = 400
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ error: 'userId가 필요해요.' }))
    return
  }

  try {
    const balance = await getCreditBalance(userId)
    res.statusCode = 200
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ balance }))
  } catch (err) {
    console.error('[admin/coins/balance]', err)
    res.statusCode = 500
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ error: '잔액을 불러오지 못했어요. 잠시 후 다시 시도해주세요.' }))
  }
}
