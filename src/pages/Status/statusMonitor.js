/*
  /status 실시간 점검 로직.

  같은 오리진의 대표 경로 세 곳을 주기적으로 요청해 응답 시간과 성공 여부를 모은다.
  세 경로는 배포 상 서로 다른 계층을 지난다 —
  문서는 렌더 함수(api/render.js), robots.txt는 정적 파일 전송, ping은 Node API 핸들러라
  한 곳만 느려져도 어디가 문제인지 구분할 수 있다.

  측정은 방문자 브라우저에서 이뤄지므로 서버 상태뿐 아니라 방문자의 회선 상태도 함께 반영된다.
  서버 측 가동률 통계가 아니라는 점을 화면에도 밝혀 둔다.
*/

export const POLL_INTERVAL_MS = 5_000
export const HISTORY_SIZE = 36
export const SLOW_MS = 600
export const TIMEOUT_MS = 8_000

export const TARGETS = [
  { id: 'page', label: '웹 페이지', purpose: 'fehe.dev 문서 응답', path: '/' },
  { id: 'asset', label: '정적 파일', purpose: '정적 자원 전송 경로', path: '/robots.txt' },
  { id: 'api', label: 'API 서버', purpose: '대시보드·진단 API', path: '/api/network-test?type=ping' },
]

function noStoreUrl(path) {
  const separator = path.includes('?') ? '&' : '?'
  return `${path}${separator}_=${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export async function probe(path, timeoutMs = TIMEOUT_MS) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  const start = performance.now()

  try {
    const res = await fetch(noStoreUrl(path), { cache: 'no-store', signal: controller.signal })
    // 본문까지 다 읽어야 전송 완료 시점이 포함된 왕복 시간이 된다.
    await res.arrayBuffer()
    const ms = performance.now() - start
    if (!res.ok) return { ok: false, ms: null, at: Date.now(), reason: `HTTP ${res.status}` }
    return { ok: true, ms, at: Date.now(), reason: null }
  } catch (error) {
    const reason = error.name === 'AbortError' ? '응답 시간 초과' : '연결 실패'
    return { ok: false, ms: null, at: Date.now(), reason }
  } finally {
    clearTimeout(timer)
  }
}

export function stateOf(sample) {
  if (!sample) return 'checking'
  if (!sample.ok) return 'down'
  return sample.ms >= SLOW_MS ? 'slow' : 'ok'
}

const STATE_RANK = { ok: 0, checking: 1, slow: 2, down: 3 }

export function worstState(states) {
  return states.reduce((worst, state) => (STATE_RANK[state] > STATE_RANK[worst] ? state : worst), 'ok')
}

export function summarize(history) {
  const succeeded = history.filter((sample) => sample.ok)
  const times = succeeded.map((sample) => sample.ms)
  const latest = history.length ? history[history.length - 1] : null

  return {
    latest,
    state: stateOf(latest),
    avg: times.length ? times.reduce((sum, value) => sum + value, 0) / times.length : null,
    min: times.length ? Math.min(...times) : null,
    max: times.length ? Math.max(...times) : null,
    successRate: history.length ? (succeeded.length / history.length) * 100 : null,
    samples: history.length,
  }
}

export const STATE_LABELS = {
  ok: '정상',
  slow: '지연',
  down: '응답 없음',
  checking: '확인 중',
}

export const OVERALL_LABELS = {
  ok: '모든 서비스 정상',
  slow: '일부 응답 지연',
  down: '응답하지 않는 서비스 있음',
  checking: '상태 확인 중',
}
