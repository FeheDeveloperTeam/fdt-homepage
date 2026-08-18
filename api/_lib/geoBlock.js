// 관리자 대시보드(치유미 봇 admin 페이지·API)는 한국 IP에서만 쓸 수 있게 제한한다.
// Vercel은 엣지에서 모든 요청에 x-vercel-ip-country 헤더를 붙여주는데, 로컬 개발
// 환경처럼 이 헤더가 아예 없는 경우엔 판단할 수 없으니 막지 않는다(그래도 관리자
// API는 Discord 세션 + 관리자 ID 검증이 별도로 남아있어서 안전하다).
// 도메인이 Cloudflare 프록시를 거치면 Vercel이 보는 "접속 IP"가 방문자가 아니라
// Cloudflare 릴레이가 되어 x-vercel-ip-country가 부정확해질 수 있다 — Cloudflare가
// 붙여주는 cf-ipcountry(실제 방문자 국가)를 우선 쓰고, 없을 때만 x-vercel-ip-country로
// 대체한다.
const ALLOWED_COUNTRY = 'KR'
const ADMIN_PAGE_PREFIX = '/DiscordBot/Chiyumi/admin'

export function isForeignRequest(req) {
  const country = req.headers['cf-ipcountry'] || req.headers['x-vercel-ip-country']
  return Boolean(country) && country !== ALLOWED_COUNTRY
}

export function isAdminPagePath(pathname) {
  return pathname.startsWith(ADMIN_PAGE_PREFIX)
}

export const GEO_BLOCK_HTML = `<!doctype html>
<meta charset="utf-8" />
<title>접근 제한</title>
<body style="font-family:'Malgun Gothic',sans-serif;padding:4rem 2rem;text-align:center;color:#333">
  <h1>접근이 제한된 페이지예요</h1>
  <p>이 관리자 페이지는 한국 IP에서만 접근할 수 있어요.</p>
</body>`
