// Vercel 서버리스 함수는 warm 인스턴스가 살아있는 동안만 메모리를 공유하므로
// 완벽한 분산 rate limit은 아니지만, 별도 인프라(Redis 등) 없이 단일 요청자가
// 짧은 시간에 대량 요청을 퍼붓는 걸 막는 데는 충분하다.
const buckets = new Map()

function resolveIp(req) {
  const forwarded = req.headers['x-forwarded-for']
  if (forwarded) {
    const first = forwarded.split(',')[0].trim()
    if (first) return first
  }
  return req.headers['x-real-ip'] || req.socket?.remoteAddress || 'unknown'
}

// 버킷이 무한정 쌓이는 걸 막기 위해 호출될 때마다 만료된 항목을 조금씩 정리한다.
function sweep(now) {
  for (const [key, bucket] of buckets) {
    if (now > bucket.resetAt) buckets.delete(key)
  }
}

let sweepCounter = 0

/**
 * @param {string} scope - 엔드포인트별로 버킷을 분리하기 위한 이름
 * @param {{ windowMs: number, max: number }} options
 * @returns {boolean} true면 통과, false면 이미 429 응답을 보낸 상태
 */
export function rateLimit(req, res, scope, { windowMs, max }) {
  const now = Date.now()
  if (++sweepCounter % 50 === 0) sweep(now)

  const key = `${scope}:${resolveIp(req)}`
  const bucket = buckets.get(key)

  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return true
  }

  if (bucket.count >= max) {
    res.statusCode = 429
    res.setHeader('Content-Type', 'application/json')
    res.setHeader('Retry-After', Math.ceil((bucket.resetAt - now) / 1000))
    res.end(JSON.stringify({ error: '요청이 너무 많아요. 잠시 후 다시 시도해주세요.' }))
    return false
  }

  bucket.count++
  return true
}
