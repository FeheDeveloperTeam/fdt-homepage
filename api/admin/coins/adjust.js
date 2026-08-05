import { requireAdmin } from '../../_lib/adminAuth.js'
import { adjustCreditBalance } from '../../_lib/sftpCredits.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.statusCode = 405
    res.end('Method Not Allowed')
    return
  }

  const admin = await requireAdmin(req, res)
  if (!admin) return

  const { userId, delta } = req.body || {}
  const parsedDelta = Number(delta)

  if (!userId || !Number.isFinite(parsedDelta) || parsedDelta === 0) {
    res.statusCode = 400
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ error: 'userId와 0이 아닌 delta가 필요해요.' }))
    return
  }

  try {
    const balance = await adjustCreditBalance(userId, Math.trunc(parsedDelta))
    res.statusCode = 200
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ ok: true, balance }))
  } catch (err) {
    console.error('[admin/coins/adjust]', err)
    res.statusCode = 500
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ error: '코인 조정에 실패했어요. 잠시 후 다시 시도해주세요.' }))
  }
}
