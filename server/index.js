import path from 'node:path'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import express from 'express'
import { SEO_DATA, getFullTitle } from '../src/seoData.js'

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

  return html
    .replace(/<title>.*?<\/title>/, `<title>${fullTitle}</title>`)
    .replace(/(<meta name="description" content=")[^"]*(")/, `$1${description}$2`)
    .replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${fullTitle}$2`)
    .replace(/(<meta property="og:description" content=")[^"]*(")/, `$1${description}$2`)
    .replace(/(<meta name="twitter:title" content=")[^"]*(")/, `$1${fullTitle}$2`)
    .replace(/(<meta name="twitter:description" content=")[^"]*(")/, `$1${description}$2`)
}

async function createServer() {
  const app = express()
  app.use(express.json())

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
