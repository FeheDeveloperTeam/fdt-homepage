import { requireAdmin } from '../_lib/adminAuth.js'
import { getRootAdminIds } from '../_lib/discordAuth.js'
import { listDbAdmins, addAdmin, removeAdmin } from '../_lib/admins.js'
import { fetchDiscordProfile } from '../_lib/discordApi.js'

async function handleGet(res) {
  const rootIds = getRootAdminIds()
  const dbAdmins = await listDbAdmins()

  const ids = [...new Set([...rootIds, ...dbAdmins.map((a) => a.userId)])]
  const profiles = await Promise.all(ids.map(fetchDiscordProfile))
  const profileMap = new Map(profiles.map((p) => [p.id, p]))

  const admins = [
    ...rootIds.map((id) => ({
      ...(profileMap.get(id) || { id, username: id, avatar: null }),
      source: 'root',
    })),
    ...dbAdmins.map((a) => ({
      ...(profileMap.get(a.userId) || { id: a.userId, username: a.userId, avatar: null }),
      source: 'db',
      addedBy: a.addedBy,
      addedAt: a.addedAt,
    })),
  ]

  res.statusCode = 200
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify({ admins }))
}

async function handlePost(req, res, admin) {
  const { userId } = req.body || {}
  if (!userId) {
    res.statusCode = 400
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ error: 'userId가 필요해요.' }))
    return
  }

  await addAdmin(userId, admin.id)
  res.statusCode = 200
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify({ ok: true }))
}

async function handleDelete(req, res) {
  const userId = req.query?.userId
  if (!userId) {
    res.statusCode = 400
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ error: 'userId가 필요해요.' }))
    return
  }

  if (getRootAdminIds().includes(String(userId))) {
    res.statusCode = 400
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ error: '기본 관리자는 제거할 수 없어요.' }))
    return
  }

  await removeAdmin(userId)
  res.statusCode = 200
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify({ ok: true }))
}

export default async function handler(req, res) {
  const admin = await requireAdmin(req, res)
  if (!admin) return

  try {
    if (req.method === 'GET') return await handleGet(res)
    if (req.method === 'POST') return await handlePost(req, res, admin)
    if (req.method === 'DELETE') return await handleDelete(req, res)

    res.statusCode = 405
    res.end('Method Not Allowed')
  } catch (err) {
    console.error('[admin/admins]', err)
    res.statusCode = 500
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ error: '요청 처리에 실패했어요. 잠시 후 다시 시도해주세요.' }))
  }
}
