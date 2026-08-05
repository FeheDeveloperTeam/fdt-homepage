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

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.statusCode = 405
    res.end('Method Not Allowed')
    return
  }

  const ip = resolveClientIp(req)

  res.statusCode = 200
  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Cache-Control', 'no-store')
  res.end(JSON.stringify({ ip }))
}
