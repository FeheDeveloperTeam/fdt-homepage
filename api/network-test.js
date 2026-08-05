import crypto from 'node:crypto'

const MIN_BYTES = 50_000
const MAX_BYTES = 3_000_000
const DEFAULT_BYTES = 2_000_000

function resolveClientIp(req) {
  const forwarded = req.headers['x-forwarded-for']
  if (forwarded) {
    // 여러 프록시를 거치면 콤마로 이어지므로 클라이언트와 가장 가까운 첫 값을 쓴다.
    const first = forwarded.split(',')[0].trim()
    if (first) return first
  }

  const realIp = req.headers['x-real-ip']
  if (realIp) return realIp

  return req.socket?.remoteAddress || null
}

function handleIp(req, res) {
  res.statusCode = 200
  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Cache-Control', 'no-store')
  res.end(JSON.stringify({ ip: resolveClientIp(req) }))
}

function handlePing(req, res) {
  res.statusCode = 200
  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Cache-Control', 'no-store')
  res.end(JSON.stringify({ time: Date.now() }))
}

function handleDownload(req, res) {
  const requested = Number.parseInt(req.query?.bytes, 10)
  const size = Number.isFinite(requested)
    ? Math.min(Math.max(requested, MIN_BYTES), MAX_BYTES)
    : DEFAULT_BYTES

  // 압축이 잘 안 되는 랜덤 바이트를 보내야 실제 전송량 기준으로
  // 다운로드 속도를 측정할 수 있다.
  const payload = crypto.randomBytes(size)

  res.statusCode = 200
  res.setHeader('Content-Type', 'application/octet-stream')
  res.setHeader('Content-Length', payload.length)
  res.setHeader('Cache-Control', 'no-store')
  res.end(payload)
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.statusCode = 405
    res.end('Method Not Allowed')
    return
  }

  const type = req.query?.type
  if (type === 'ip') return handleIp(req, res)
  if (type === 'ping') return handlePing(req, res)
  if (type === 'download') return handleDownload(req, res)

  res.statusCode = 400
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify({ error: 'type 파라미터가 올바르지 않아요. (ip | ping | download)' }))
}
