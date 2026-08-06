import { SEO_DATA, getFullTitle } from '../../src/seoData.js'

// Discord 등 링크 미리보기 크롤러는 JS를 실행하지 않아 react-helmet-async가
// 붙이는 og:title/og:description을 못 본다. 그래서 index.html의 기본 태그를
// 요청 경로에 맞는 값으로 직접 치환해서 내려준다.
export function escapeHtml(str) {
  return str.replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[c])
}

export function injectSeo(html, pathname) {
  // 경로가 퍼센트 인코딩된 그대로 들어오므로(예: 한글 경로) 디코딩 후 조회한다.
  let decodedPathname = pathname
  try {
    decodedPathname = decodeURIComponent(pathname)
  } catch {
    // 잘못된 인코딩이면 원본 그대로 사용
  }
  const meta = SEO_DATA[decodedPathname] || SEO_DATA['/']
  const fullTitle = escapeHtml(getFullTitle(meta.title))
  const description = escapeHtml(meta.description)

  let out = html
    .replace(/<title>.*?<\/title>/, `<title>${fullTitle}</title>`)
    .replace(/(<meta name="description" content=")[^"]*(")/, `$1${description}$2`)
    .replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${fullTitle}$2`)
    .replace(/(<meta property="og:description" content=")[^"]*(")/, `$1${description}$2`)
    .replace(/(<meta name="twitter:title" content=")[^"]*(")/, `$1${fullTitle}$2`)
    .replace(/(<meta name="twitter:description" content=")[^"]*(")/, `$1${description}$2`)

  // 프로필 사진처럼 페이지 전용 이미지가 있으면 기본 로고 대신 그걸 쓴다.
  if (meta.image) {
    const image = escapeHtml(meta.image)
    const imageAlt = escapeHtml(meta.imageAlt || fullTitle)
    out = out
      .replace(/(<meta property="og:image" content=")[^"]*(")/, `$1${image}$2`)
      .replace(/(<meta property="og:image:width" content=")[^"]*(")/, `$1${meta.imageWidth}$2`)
      .replace(/(<meta property="og:image:height" content=")[^"]*(")/, `$1${meta.imageHeight}$2`)
      .replace(/(<meta property="og:image:alt" content=")[^"]*(")/, `$1${imageAlt}$2`)
      .replace(/(<meta name="twitter:image" content=")[^"]*(")/, `$1${image}$2`)
  }

  return out
}
