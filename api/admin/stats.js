import { requireAdmin } from '../_lib/adminAuth.js'
import { getRestrictedCount } from '../_lib/restrictions.js'
import { discordApi, fetchDiscordProfile } from '../_lib/discordApi.js'
import { getSheetValues } from '../_lib/googleSheets.js'

const FALLBACK_GUILD_LIMIT = 25
const CACHE_TTL_MS = 60 * 1000

let cache = null
let cacheAt = 0

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

async function fetchTopCoinHolders() {
  const { rows } = await getSheetValues('코인')
  const holders = rows
    .map(([id, balance]) => ({ id, balance: Number(balance) || 0 }))
    .filter((r) => r.id)
    .sort((a, b) => b.balance - a.balance)

  const profiles = await Promise.all(holders.map((r) => fetchDiscordProfile(r.id)))
  return holders.map((r, i) => ({
    id: r.id,
    name: profiles[i].username,
    icon: profiles[i].avatar,
    value: r.balance,
  }))
}

async function fetchRestrictedCount() {
  return getRestrictedCount()
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.statusCode = 405
    res.end('Method Not Allowed')
    return
  }

  const admin = await requireAdmin(req, res)
  if (!admin) return

  if (cache && Date.now() - cacheAt < CACHE_TTL_MS) {
    res.statusCode = 200
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify(cache))
    return
  }

  try {
    const [guilds, topCoinHolders, restrictedCount] = await Promise.all([
      fetchGuilds(),
      fetchTopCoinHolders(),
      fetchRestrictedCount(),
    ])

    const totalMembers = guilds.reduce((sum, g) => sum + (g.approximate_member_count || 0), 0)
    const topGuilds = [...guilds]
      .sort((a, b) => (b.approximate_member_count || 0) - (a.approximate_member_count || 0))
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
      topCoinHolders,
    }
    cache = payload
    cacheAt = Date.now()

    res.statusCode = 200
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify(payload))
  } catch (err) {
    console.error('[admin/stats]', err)
    res.statusCode = 500
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ error: '통계를 불러오지 못했어요. 잠시 후 다시 시도해주세요.' }))
  }
}
