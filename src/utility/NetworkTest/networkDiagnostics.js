const PING_ATTEMPTS = 8
const PING_TIMEOUT_MS = 3000
const DOWNLOAD_BYTES = 2_000_000

function noStoreUrl(path) {
  return `${path}${path.includes('?') ? '&' : '?'}_=${Date.now()}`
}

async function fetchWithTimeout(url, { timeoutMs = PING_TIMEOUT_MS, ...fetchOptions } = {}) {
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
    const res = await fetchWithTimeout(noStoreUrl('/api/network-test?type=ip'), { timeoutMs: 5000 })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    return data.ip || null
  } catch {
    return null
  }
}

function standardDeviation(values) {
  if (values.length < 2) return 0
  const mean = values.reduce((sum, v) => sum + v, 0) / values.length
  const variance = values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length
  return Math.sqrt(variance)
}

export async function runLatencyTest(attempts = PING_ATTEMPTS) {
  const samples = []
  let failures = 0

  for (let i = 0; i < attempts; i += 1) {
    const start = performance.now()
    try {
      const res = await fetchWithTimeout(noStoreUrl('/api/network-test?type=ping'))
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      await res.json()
      samples.push(performance.now() - start)
    } catch {
      failures += 1
    }
  }

  const lossPercent = Math.round((failures / attempts) * 100)

  if (samples.length === 0) {
    return { samples: [], avg: null, min: null, max: null, jitter: null, lossPercent }
  }

  return {
    samples,
    avg: samples.reduce((sum, v) => sum + v, 0) / samples.length,
    min: Math.min(...samples),
    max: Math.max(...samples),
    jitter: standardDeviation(samples),
    lossPercent,
  }
}

export async function runDownloadSpeedTest(bytes = DOWNLOAD_BYTES) {
  const start = performance.now()
  const res = await fetchWithTimeout(noStoreUrl(`/api/network-test?type=download&bytes=${bytes}`), {
    timeoutMs: 15000,
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const blob = await res.blob()
  const seconds = (performance.now() - start) / 1000
  const mbps = (blob.size * 8) / 1_000_000 / seconds
  return { mbps, bytes: blob.size, seconds }
}

const COMMON_GATEWAY_IPS = ['192.168.1.1', '192.168.0.1', '192.168.1.254', '10.0.0.1', '192.168.29.1']
const GATEWAY_TIMEOUT_MS = 1200

// 브라우저가 사설망(공유기 등) 접근을 지원/허용하는지는 실제로 fetch를
// 시도해보기 전까지 알 수 없다 (Chrome의 Local Network Access 권한 프롬프트가
// 이 시점에 뜬다). 흔한 공유기 기본 IP를 순서대로 하나씩 시도하고,
// 동시에 여러 개를 시도해 권한 프롬프트가 중복으로 뜨지 않게 한다.
export async function checkGatewayAccess() {
  if (typeof fetch !== 'function') {
    return { supported: false, reachable: false, ip: null, ms: null }
  }

  for (const ip of COMMON_GATEWAY_IPS) {
    const start = performance.now()
    try {
      await fetchWithTimeout(`http://${ip}/`, { timeoutMs: GATEWAY_TIMEOUT_MS, mode: 'no-cors' })
      return { supported: true, reachable: true, ip, ms: Math.round(performance.now() - start) }
    } catch {
      // 이 IP는 실패 — 다음 후보로 넘어간다. (권한 거부/차단/타임아웃 모두 동일하게 처리)
    }
  }

  return { supported: true, reachable: false, ip: null, ms: null }
}

const CONNECTION_TYPE_LABELS = {
  ethernet: '유선 (이더넷)',
  wifi: '무선 (Wi-Fi)',
  cellular: '무선 (모바일 데이터)',
  bluetooth: '무선 (블루투스)',
  wimax: '무선 (WiMAX)',
  none: '연결 없음',
  other: '기타',
  unknown: '확인 불가',
}

export function detectConnectionInfo() {
  const conn =
    navigator.connection || navigator.webkitConnection || navigator.mozConnection || null

  if (!conn) {
    return { supported: false, type: null, label: null, effectiveType: null, downlinkMbps: null, rttMs: null }
  }

  const type = conn.type || null
  const label = type && type !== 'unknown' ? CONNECTION_TYPE_LABELS[type] || type : null

  return {
    supported: true,
    type,
    label,
    effectiveType: conn.effectiveType || null,
    downlinkMbps: typeof conn.downlink === 'number' ? conn.downlink : null,
    rttMs: typeof conn.rtt === 'number' ? conn.rtt : null,
  }
}

export function estimateConnectionType(latency) {
  if (!latency || latency.avg === null) return null
  // 유선 회선은 보통 지연 시간이 낮고 흔들림(지터)도 작다.
  // 정밀한 판별은 아니고 어디까지나 참고용 추정치다.
  if (latency.avg < 40 && latency.jitter < 8) return '유선일 가능성이 높음 (추정)'
  if (latency.jitter > 25) return '무선(Wi-Fi 등)일 가능성이 높음 (추정)'
  return '판단하기 어려움 (추정)'
}

export function diagnose({ online, ip, latency, speed, speedError }) {
  if (!online) {
    return {
      label: '오프라인',
      severity: 'critical',
      detail: '기기가 인터넷에 연결되어 있지 않습니다. Wi-Fi 또는 유선 케이블 연결 상태를 확인해주세요.',
    }
  }

  if (!ip && latency.lossPercent === 100) {
    return {
      label: '인터넷 연결 없음 / 서버 응답 없음',
      severity: 'critical',
      detail: '외부 서버로 요청이 전혀 도달하지 못했습니다. 공유기 재부팅이나 통신사 회선 상태를 확인해주세요.',
    }
  }

  if (latency.lossPercent >= 25) {
    return {
      label: '패킷 손실 감지 (연결 불안정)',
      severity: 'critical',
      detail: `측정 요청 중 ${latency.lossPercent}%가 응답하지 않았습니다. 무선 신호 간섭, 공유기 과부하, 회선 불량 등을 의심해볼 수 있습니다.`,
    }
  }

  if (speedError) {
    return {
      label: '다운로드 속도 측정 실패',
      severity: 'warning',
      detail: '속도 측정 요청이 중간에 끊겼습니다. 연결이 불안정할 가능성이 있으니 다시 시도해보세요.',
    }
  }

  if (latency.avg !== null && latency.avg > 200) {
    return {
      label: '높은 지연 시간 (High Latency)',
      severity: 'warning',
      detail: `평균 응답 시간이 ${Math.round(latency.avg)}ms로 높은 편입니다. 화상통화나 게임 등 실시간성이 중요한 서비스에서 끊김이 느껴질 수 있습니다.`,
    }
  }

  if (latency.jitter !== null && latency.jitter > 40) {
    return {
      label: '지연 시간 변동 심함 (지터 과다)',
      severity: 'warning',
      detail: '응답 시간의 편차가 큽니다. 무선 신호 간섭이나 혼잡한 네트워크 환경일 가능성이 있습니다.',
    }
  }

  if (speed && speed.mbps < 5) {
    return {
      label: '낮은 대역폭 (다운로드 속도 저하)',
      severity: 'warning',
      detail: `다운로드 속도가 약 ${speed.mbps.toFixed(1)}Mbps로 낮게 측정되었습니다. 여러 기기가 동시에 사용 중이거나 회선 자체가 느릴 수 있습니다.`,
    }
  }

  return {
    label: '정상',
    severity: 'ok',
    detail: '측정된 지연 시간, 손실률, 다운로드 속도 모두 양호한 범위입니다.',
  }
}
