import { requireAdmin } from '../_lib/adminAuth.js'
import { getSheetValues } from '../_lib/googleSheets.js'

const ALLOWED_SHEETS = [
  '코인',
  '레벨',
  '음성시간',
  '출석',
  '서버설정',
  '서버목록',
  '주식시세',
  '주식포트폴리오',
]

const CACHE_TTL_MS = 30 * 1000
const cache = new Map()

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.statusCode = 405
    res.end('Method Not Allowed')
    return
  }

  const admin = await requireAdmin(req, res)
  if (!admin) return

  const name = req.query?.name
  if (!name || !ALLOWED_SHEETS.includes(name)) {
    res.statusCode = 400
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ error: '올바르지 않은 시트 이름이에요.', sheets: ALLOWED_SHEETS }))
    return
  }

  const cached = cache.get(name)
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) {
    res.statusCode = 200
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify(cached.data))
    return
  }

  try {
    const data = await getSheetValues(name)
    cache.set(name, { data, at: Date.now() })
    res.statusCode = 200
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify(data))
  } catch (err) {
    console.error('[admin/sheet]', err)
    res.statusCode = 500
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ error: '시트 데이터를 불러오지 못했어요. 잠시 후 다시 시도해주세요.' }))
  }
}
