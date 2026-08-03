import path from 'node:path'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import express from 'express'
import { SEO_DATA, getFullTitle } from '../src/seoData.js'
import discordLogin from '../api/auth/discord/login.js'
import discordCallback from '../api/auth/discord/callback.js'
import authMe from '../api/auth/me.js'
import authLogout from '../api/auth/logout.js'
import adminRestrict from '../api/admin/restrict.js'
import adminUnrestrict from '../api/admin/unrestrict.js'
import adminRestriction from '../api/admin/restriction.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const isProduction = process.env.NODE_ENV === 'production'
const port = process.env.PORT || 3000

// Discord 등 링크 미리보기 크롤러는 JS를 실행하지 않아 react-helmet-async가
// 붙이는 og:title/og:description을 못 본다. 그래서 서버가 직접 index.html의
// 기본 태그를 요청 경로에 맞는 값으로 치환해서 내려준다.
function escapeHtml(str) {
  return str.replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[c])
}

function injectSeo(html, pathname) {
  const meta = SEO_DATA[pathname] || SEO_DATA['/']
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

async function createServer() {
  const app = express()
  app.use(express.json())

  // 로컬 dev/프로덕션 테스트용 — 실제 Vercel 배포에서는 /api 아래의 같은
  // 파일들이 서버리스 함수로 각각 독립 실행된다. (api/_lib/discordAuth.js 공유)
  app.get('/api/auth/discord/login', discordLogin)
  app.get('/api/auth/discord/callback', discordCallback)
  app.get('/api/auth/me', authMe)
  app.get('/api/auth/logout', authLogout)
  app.post('/api/admin/restrict', adminRestrict)
  app.post('/api/admin/unrestrict', adminUnrestrict)
  app.get('/api/admin/restriction', adminRestriction)

  if (isProduction) {
    const distPath = path.join(root, 'dist')
    const template = await readFile(path.join(distPath, 'index.html'), 'utf-8')

    // index: false → express.static이 '/'에서 index.html을 먼저 가로채지 않게 해서
    // 아래 커스텀 핸들러가 항상 경로별 메타 태그를 치환할 수 있게 한다.
    app.use(express.static(distPath, { index: false }))
    app.use((req, res) => {
      res.set('Content-Type', 'text/html; charset=utf-8')
      res.send(injectSeo(template, req.path))
    })
  } else {
    const { createServer: createViteServer } = await import('vite')
    const vite = await createViteServer({
      root,
      server: { middlewareMode: true },
      appType: 'spa',
    })
    app.use(vite.middlewares)
  }

  app.listen(port, () => {
    console.log(
      `FDT ${isProduction ? '(production)' : '(development)'} server → http://localhost:${port}`,
    )
  })
}

createServer()
