const HTTP_RTT_ATTEMPTS = 8
const REQUEST_TIMEOUT_MS = 15_000
const DOWNLOAD_CHUNK_BYTES = 3_000_000
const DOWNLOAD_DURATION_MS = 10_000
const DOWNLOAD_CONCURRENCY = 3
const DOWNLOAD_MAX_ROUNDS = 60

function noStoreUrl(path) {
  return `${path}${path.includes('?') ? '&' : '?'}_=${Date.now()}-${Math.random().toString(36).slice(2)}`
}

async function fetchWithTimeout(url, { timeoutMs = REQUEST_TIMEOUT_MS, ...fetchOptions } = {}) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(url, { cache: 'no-store', signal: controller.signal, ...fetchOptions })
  } finally {
    clearTimeout(timer)
  }
}

export async function fetchPublicIp() {
  try {
    const res = await fetchWithTimeout(noStoreUrl('/api/network-test?type=ip'), { timeoutMs: 5_000 })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    return data.ip || null
  } catch {
    return null
  }
}

function standardDeviation(values) {
  if (values.length < 2) return 0
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length
  const variance = values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length
  return Math.sqrt(variance)
}

function median(values) {
  const sorted = [...values].sort((a, b) => a - b)
  const middle = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0 ? (sorted[middle - 1] + sorted[middle]) / 2 : sorted[middle]
}

// HTTP 요청의 왕복 시간을 측정한다. ICMP ping과는 목적과 경로가 달라 별도로 표기한다.
export async function runLatencyTest(attempts = HTTP_RTT_ATTEMPTS) {
  const samples = []
  let failures = 0

  for (let index = 0; index < attempts; index += 1) {
    const start = performance.now()
    try {
      const res = await fetchWithTimeout(noStoreUrl('/api/network-test?type=ping'), { timeoutMs: 3_000 })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      await res.json()
      samples.push(performance.now() - start)
    } catch {
      failures += 1
    }
  }

  const lossPercent = Math.round((failures / attempts) * 100)
  if (!samples.length) return { samples: [], avg: null, median: null, min: null, max: null, jitter: null, lossPercent }

  return {
    samples,
    avg: samples.reduce((sum, value) => sum + value, 0) / samples.length,
    median: median(samples),
    min: Math.min(...samples),
    max: Math.max(...samples),
    jitter: standardDeviation(samples),
    lossPercent,
  }
}

async function readDownloadResponse(response, onChunk) {
  if (!response.body || typeof response.body.getReader !== 'function') {
    const blob = await response.blob()
    onChunk(blob.size)
    return
  }

  const reader = response.body.getReader()
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { done, value } = await reader.read()
    if (done) return
    onChunk(value.byteLength)
  }
}

// 워밍업으로 연결 준비 비용을 본 측정에서 제외하고, 병렬 다운로드로 순차 요청의 RTT 병목을 줄인다.
export async function runDownloadSpeedTest(onProgress) {
  const warmup = await fetchWithTimeout(noStoreUrl('/api/network-test?type=download&bytes=50000'), { timeoutMs: 5_000 })
  if (!warmup.ok) throw new Error(`HTTP ${warmup.status}`)
  await warmup.arrayBuffer()

  const testStart = performance.now()
  let totalBytes = 0
  let rounds = 0
  let lastProgressAt = testStart

  const reportProgress = () => {
    const now = performance.now()
    if (now - lastProgressAt < 180) return
    const seconds = (now - testStart) / 1_000
    if (seconds > 0) onProgress?.((totalBytes * 8) / 1_000_000 / seconds)
    lastProgressAt = now
  }

  const worker = async () => {
    while (performance.now() - testStart < DOWNLOAD_DURATION_MS && rounds < DOWNLOAD_MAX_ROUNDS) {
      rounds += 1
      const res = await fetchWithTimeout(noStoreUrl(`/api/network-test?type=download&bytes=${DOWNLOAD_CHUNK_BYTES}`))
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      await readDownloadResponse(res, (byteLength) => {
        totalBytes += byteLength
        reportProgress()
      })
    }
  }

  await Promise.all(Array.from({ length: DOWNLOAD_CONCURRENCY }, worker))
  const seconds = (performance.now() - testStart) / 1_000
  const mbps = seconds > 0 ? (totalBytes * 8) / 1_000_000 / seconds : 0
  onProgress?.(mbps)
  return { mbps, bytes: totalBytes, seconds, rounds, concurrency: DOWNLOAD_CONCURRENCY }
}

const CONNECTION_TYPE_LABELS = {
  ethernet: '유선 (이더넷)', wifi: '무선 (Wi-Fi)', cellular: '무선 (모바일 데이터)', bluetooth: '무선 (블루투스)', wimax: '무선 (WiMAX)', none: '연결 없음', other: '기타', unknown: '확인 불가',
}

export function detectConnectionInfo() {
  const connection = navigator.connection || navigator.webkitConnection || navigator.mozConnection || null
  if (!connection) return { supported: false, type: null, label: null, effectiveType: null, downlinkMbps: null, rttMs: null }
  const type = connection.type || null
  return { supported: true, type, label: type && type !== 'unknown' ? CONNECTION_TYPE_LABELS[type] || type : null, effectiveType: connection.effectiveType || null, downlinkMbps: typeof connection.downlink === 'number' ? connection.downlink : null, rttMs: typeof connection.rtt === 'number' ? connection.rtt : null }
}

const EFFECTIVE_TYPE_LABELS = { 'slow-2g': '2G 이하', '2g': '2G급', '3g': '3G급', '4g': '4G급 이상' }

export function describeConnection(connectionInfo, latency) {
  if (connectionInfo.label) return connectionInfo.label
  if (connectionInfo.effectiveType) {
    const grade = EFFECTIVE_TYPE_LABELS[connectionInfo.effectiveType] || connectionInfo.effectiveType
    const downlink = typeof connectionInfo.downlinkMbps === 'number' ? ` · 브라우저 추정 ${connectionInfo.downlinkMbps}Mbps` : ''
    return `${grade}${downlink}`
  }
  if (latency?.median !== null && latency?.median < 40 && latency.jitter < 8) return '안정적 연결로 추정'
  return '브라우저에서 확인 불가'
}

export function diagnose({ online, ip, latency, speed, speedError }) {
  if (!online) return { label: '오프라인', severity: 'critical', detail: '기기가 인터넷에 연결되어 있지 않습니다. Wi-Fi 또는 유선 연결 상태를 확인해 주세요.' }
  if (!ip && latency.lossPercent === 100) return { label: '서버에 연결할 수 없음', severity: 'critical', detail: '테스트 서버로 요청이 전달되지 않았습니다. 네트워크 연결이나 방화벽 상태를 확인해 주세요.' }
  if (latency.lossPercent >= 25) return { label: 'HTTP 요청 실패 감지', severity: 'critical', detail: `측정 요청 중 ${latency.lossPercent}%가 응답하지 않았습니다. 무선 신호, 공유기 또는 회선 상태를 확인해 주세요.` }
  if (speedError) return { label: '다운로드 측정 실패', severity: 'warning', detail: '속도 측정 요청이 중간에 끊겼습니다. 잠시 후 다시 시도해 주세요.' }
  if (latency.median !== null && latency.median > 200) return { label: '높은 HTTP 왕복 시간', severity: 'warning', detail: `이 사이트 서버까지의 중앙 HTTP 왕복 시간이 ${Math.round(latency.median)}ms입니다. 실시간 서비스에서 지연을 느낄 수 있습니다.` }
  if (latency.jitter !== null && latency.jitter > 40) return { label: '응답 시간 변동이 큼', severity: 'warning', detail: 'HTTP 응답 시간이 일정하지 않습니다. 무선 신호 간섭이나 네트워크 혼잡 가능성이 있습니다.' }
  if (speed && speed.mbps < 5) return { label: '낮은 다운로드 처리량', severity: 'warning', detail: `이 사이트 서버 기준 다운로드 처리량이 ${speed.mbps.toFixed(1)}Mbps입니다. 다른 기기의 사용량과 회선 상태를 확인해 주세요.` }
  return { label: '측정 완료', severity: 'ok', detail: '이 사이트 서버 경로에서의 HTTP 왕복 시간과 다운로드 처리량을 정상적으로 측정했습니다.' }
}
