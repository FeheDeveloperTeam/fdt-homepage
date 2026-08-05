import { requireAdmin } from '../_lib/adminAuth.js'
import { getRestriction, restrictUser, unrestrictUser } from '../_lib/restrictions.js'

async function handleGet(req, res) {
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
    console.error('[admin/restrictions GET]', err)
    res.statusCode = 500
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ error: '이용제한 조회에 실패했어요. 잠시 후 다시 시도해주세요.' }))
  }
}

async function handlePost(req, res, admin) {
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
    console.error('[admin/restrictions POST]', err)
    res.statusCode = 500
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ error: '이용제한 처리에 실패했어요. 잠시 후 다시 시도해주세요.' }))
  }
}

async function handleDelete(req, res) {
  const userId = req.query?.userId
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
    console.error('[admin/restrictions DELETE]', err)
    res.statusCode = 500
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ error: '이용제한 해제에 실패했어요. 잠시 후 다시 시도해주세요.' }))
  }
}

export default async function handler(req, res) {
  const admin = await requireAdmin(req, res)
  if (!admin) return

  if (req.method === 'GET') return handleGet(req, res)
  if (req.method === 'POST') return handlePost(req, res, admin)
  if (req.method === 'DELETE') return handleDelete(req, res)

  res.statusCode = 405
  res.end('Method Not Allowed')
}
