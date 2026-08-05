import crypto from 'node:crypto'

const MIN_BYTES = 50_000
const MAX_BYTES = 3_000_000
const DEFAULT_BYTES = 2_000_000

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.statusCode = 405
    res.end('Method Not Allowed')
    return
  }

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
