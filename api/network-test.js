import crypto from 'node:crypto'
import { rateLimit } from './_lib/rateLimit.js'

const MIN_BYTES = 50_000
const MAX_BYTES = 3_000_000
const DEFAULT_BYTES = 2_000_000

// 요청마다 새로 생성하면 다운로드 속도 측정에 랜덤 생성 시간까지 섞여
// 들어가므로, 콜드 스타트 시 한 번만 만들어두고 요청마다 잘라 쓴다.
let sharedPayload = null
function getPayload(size) {
  if (!sharedPayload) sharedPayload = crypto.randomBytes(MAX_BYTES)
  return sharedPayload.subarray(0, size)
}

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
  // 실제 다운로드 테스트는 10초 동안 최대 60회까지 연속 요청하므로, 그 정상
  // 사용량에 여유를 두면서도 무제한 대역폭 남용은 막을 수 있는 선에서 제한한다.
  if (!rateLimit(req, res, 'network-test-download', { windowMs: 60_000, max: 150 })) return
  const requested = Number.parseInt(req.query?.bytes, 10)
  const size = Number.isFinite(requested)
    ? Math.min(Math.max(requested, MIN_BYTES), MAX_BYTES)
    : DEFAULT_BYTES

  // 압축이 잘 안 되는 랜덤 바이트를 보내야 실제 전송량 기준으로
  // 다운로드 속도를 측정할 수 있다.
  const payload = getPayload(size)

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
