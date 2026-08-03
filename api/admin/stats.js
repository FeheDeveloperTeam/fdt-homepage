import { requireAdmin } from '../_lib/adminAuth.js'
import { getSupabase } from '../_lib/supabase.js'

const MEMORIES_DAYS = 14
const TOP_GUILD_LIMIT = 8
const FALLBACK_GUILD_LIMIT = 25
const CACHE_TTL_MS = 60 * 1000

let cache = null
let cacheAt = 0

function requireEnv(name) {
  const value = process.env[name]
  if (!value) throw new Error(`${name} 환경변수가 설정되지 않았습니다.`)
  return value
}

async function discordApi(path) {
  const res = await fetch(`https://discord.com/api/v10${path}`, {
    headers: { Authorization: `Bot ${requireEnv('DISCORD_TOKEN')}` },
  })
  if (!res.ok) throw new Error(`디스코드 API 호출 실패 (${path}): ${res.status}`)
  return res.json()
}

async function fetchGuilds() {
  const guilds = await discordApi('/users/@me/guilds?with_counts=true&limit=200')

  const needsFallback = guilds.length > 0 && guilds.every((g) => g.approximate_member_count == null)
  if (!needsFallback) return guilds

  const withCounts = []
  for (const g of guilds.slice(0, FALLBACK_GUILD_LIMIT)) {
    try {
      const detail = await discordApi(`/guilds/${g.id}?with_counts=true`)
      withCounts.push({ ...g, approximate_member_count: detail.approximate_member_count })
    } catch {
      withCounts.push(g)
    }
  }
  return [...withCounts, ...guilds.slice(FALLBACK_GUILD_LIMIT)]
}

async function fetchMemoriesPerDay(days) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
  const { data, error } = await getSupabase()
    .from('memories')
    .select('created_at')
    .gte('created_at', since)
    .order('created_at', { ascending: true })
    .limit(5000)
  if (error) throw new Error(`기억 데이터 조회 실패: ${error.message}`)

  const buckets = new Map()
  for (let i = days - 1; i >= 0; i--) {
    const key = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
    buckets.set(key, 0)
  }
  for (const row of data) {
    const key = row.created_at.slice(0, 10)
    if (buckets.has(key)) buckets.set(key, buckets.get(key) + 1)
  }
  return Array.from(buckets, ([date, count]) => ({ date, count }))
}

async function fetchRestrictedCount() {
  const { count, error } = await getSupabase()
    .from('restrictions')
    .select('*', { count: 'exact', head: true })
  if (error) throw new Error(`이용제한 인원 조회 실패: ${error.message}`)
  return count ?? 0
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.statusCode = 405
    res.end('Method Not Allowed')
    return
  }

  const admin = requireAdmin(req, res)
  if (!admin) return

  if (cache && Date.now() - cacheAt < CACHE_TTL_MS) {
    res.statusCode = 200
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify(cache))
    return
  }

  try {
    const [guilds, memoriesPerDay, restrictedCount] = await Promise.all([
      fetchGuilds(),
      fetchMemoriesPerDay(MEMORIES_DAYS),
      fetchRestrictedCount(),
    ])

    const totalMembers = guilds.reduce((sum, g) => sum + (g.approximate_member_count || 0), 0)
    const topGuilds = [...guilds]
      .sort((a, b) => (b.approximate_member_count || 0) - (a.approximate_member_count || 0))
      .slice(0, TOP_GUILD_LIMIT)
      .map((g) => ({
        id: g.id,
        name: g.name,
        icon: g.icon ? `https://cdn.discordapp.com/icons/${g.id}/${g.icon}.png?size=64` : null,
        memberCount: g.approximate_member_count || 0,
      }))

    const payload = {
      serverCount: guilds.length,
      totalMembers,
      restrictedCount,
      topGuilds,
      memoriesPerDay,
    }
    cache = payload
    cacheAt = Date.now()

    res.statusCode = 200
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify(payload))
  } catch (err) {
    res.statusCode = 500
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ error: err.message }))
  }
}
