/*
  페헤 페이지 인트로는 강력 새로고침에서만 다시 보여 준다.
  브라우저 JS로는 일반 새로고침(F5)과 강력 새로고침(Ctrl+F5, Ctrl+Shift+R)을 구분할 수 없지만,
  문서 요청 헤더에는 차이가 있다 — 강력 새로고침은 캐시를 건너뛰라고
  Pragma: no-cache / Cache-Control: no-cache를 붙이고, 일반 새로고침은 Cache-Control: max-age=0만 보낸다.
  그래서 서버가 이 헤더를 보고 HTML에 표시(meta)를 남기고, 인트로는 그 표시를 읽는다.
*/

export function isFeheDocument(pathname) {
  return pathname === '/member/fehe' || pathname.startsWith('/member/fehe/')
}

export function isHardReload(headers) {
  const pragma = String(headers.pragma || '').toLowerCase()
  const cacheControl = String(headers['cache-control'] || '').toLowerCase()
  return pragma.includes('no-cache') || /(^|[\s,])no-cache([\s,]|$)/.test(cacheControl)
}

export function applyReloadHint(html, headers) {
  if (!isHardReload(headers)) return html
  return html.replace('</head>', '    <meta name="fdt-reload" content="hard" />\n  </head>')
}

// 표시가 붙은 응답이 캐시돼 일반 새로고침 때 재사용되면 안 되므로 매번 서버에 확인하게 한다.
export const FEHE_DOCUMENT_CACHE_CONTROL = 'private, no-cache'
