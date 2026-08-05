import { requireAdmin } from '../_lib/adminAuth.js'
import { getCreditBalance, adjustCreditBalance } from '../_lib/sftpCredits.js'

async function handleGet(req, res) {
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
    console.error('[admin/coins GET]', err)
    res.statusCode = 500
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ error: '잔액을 불러오지 못했어요. 잠시 후 다시 시도해주세요.' }))
  }
}

async function handlePost(req, res) {
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
    console.error('[admin/coins POST]', err)
    res.statusCode = 500
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ error: '코인 조정에 실패했어요. 잠시 후 다시 시도해주세요.' }))
  }
}

export default async function handler(req, res) {
  const admin = await requireAdmin(req, res)
  if (!admin) return

  if (req.method === 'GET') return handleGet(req, res)
  if (req.method === 'POST') return handlePost(req, res)

  res.statusCode = 405
  res.end('Method Not Allowed')
}
