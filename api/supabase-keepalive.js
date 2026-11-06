/*
  Supabase 무료 프로젝트 일시정지 방지.

  Supabase 무료 플랜은 일정 기간(현재 7일) 동안 활동이 없으면 프로젝트를 일시정지한다.
  방문이 뜸한 주에도 멈추지 않도록 Vercel Cron(vercel.json의 crons)이 하루 한 번 이 경로를 부르고,
  여기서 방문자 수 읽기 함수(fehe_visitors_today)를 한 번 호출해 실제 DB 쿼리를 일으킨다.
  읽기 전용 함수라 방문자 숫자는 오르지 않는다.

  - 브라우저와 같은 공개 키(VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)를 서버에서 읽어 쓴다.
  - CRON_SECRET이 설정돼 있으면 Vercel Cron이 보내는 `Authorization: Bearer <CRON_SECRET>`만 받는다.
    설정하지 않아도 동작하며, 이 경로는 읽기 한 번만 하므로 노출돼도 해가 없다.
*/
const TIMEOUT_MS = 10_000

function send(res, status, body) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Cache-Control', 'no-store')
  res.end(JSON.stringify(body))
}

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD')
    return send(res, 405, { ok: false, error: 'method_not_allowed' })
  }

  const secret = process.env.CRON_SECRET
  if (secret && req.headers.authorization !== `Bearer ${secret}`) {
    return send(res, 401, { ok: false, error: 'unauthorized' })
  }

  const url = process.env.VITE_SUPABASE_URL?.replace(/\/$/, '')
  const key = process.env.VITE_SUPABASE_ANON_KEY
  if (!url || !key) return send(res, 503, { ok: false, error: 'supabase_not_configured' })

  const started = Date.now()
  try {
    const r = await fetch(`${url}/rest/v1/rpc/fehe_visitors_today`, {
      method: 'POST',
      headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: '{}',
      signal: AbortSignal.timeout(TIMEOUT_MS),
    })
    const ms = Date.now() - started
    if (!r.ok) {
      // 404(PGRST202/205)는 SQL 미실행, 401은 키 오류나 이미 일시정지된 프로젝트
      console.error(`[supabase-keepalive] HTTP ${r.status} in ${ms}ms`)
      return send(res, 502, { ok: false, status: r.status, ms })
    }
    await r.json()
    return send(res, 200, { ok: true, ms })
  } catch (error) {
    console.error('[supabase-keepalive] request failed:', error?.name || error)
    return send(res, 504, { ok: false, error: 'request_failed' })
  }
}
