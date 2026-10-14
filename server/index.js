import path from 'node:path'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import express from 'express'
import { injectSeo } from '../api/_lib/seoRender.js'
import { isForeignRequest, isAdminPagePath, GEO_BLOCK_HTML } from '../api/_lib/geoBlock.js'
import { isFeheDocument, applyReloadHint, FEHE_DOCUMENT_CACHE_CONTROL } from '../api/_lib/reloadHint.js'
import discordLogin from '../api/auth/discord/login.js'
import discordCallback from '../api/auth/discord/callback.js'
import authMe from '../api/auth/me.js'
import authLogout from '../api/auth/logout.js'
import adminRestrictions from '../api/admin/restrictions.js'
import adminStats from '../api/admin/stats.js'
import adminAdmins from '../api/admin/admins.js'
import adminSheet from '../api/admin/sheet.js'
import adminCoins from '../api/admin/coins.js'
import networkTest from '../api/network-test.js'
import guild from '../api/guild.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const isProduction = process.env.NODE_ENV === 'production'
const port = process.env.PORT || 3000

async function createServer() {
  const app = express()
  app.use(express.json())

  // 로컬 dev/프로덕션 테스트용 — 실제 Vercel 배포에서는 /api 아래의 같은
  // 파일들이 서버리스 함수로 각각 독립 실행된다. (api/_lib/discordAuth.js 공유)
  app.get('/api/auth/discord/login', discordLogin)
  app.get('/api/auth/discord/callback', discordCallback)
  app.get('/api/auth/me', authMe)
  app.get('/api/auth/logout', authLogout)
  app.get('/api/admin/restrictions', adminRestrictions)
  app.post('/api/admin/restrictions', adminRestrictions)
  app.delete('/api/admin/restrictions', adminRestrictions)
  app.get('/api/admin/stats', adminStats)
  app.get('/api/admin/admins', adminAdmins)
  app.post('/api/admin/admins', adminAdmins)
  app.delete('/api/admin/admins', adminAdmins)
  app.get('/api/admin/sheet', adminSheet)
  app.get('/api/admin/coins', adminCoins)
  app.post('/api/admin/coins', adminCoins)
  app.get('/api/network-test', networkTest)
  app.get('/api/guild', guild)
  app.post('/api/guild', guild)

  if (isProduction) {
    const distPath = path.join(root, 'dist')
    const template = await readFile(path.join(distPath, 'index.html'), 'utf-8')

    // index: false → express.static이 '/'에서 index.html을 먼저 가로채지 않게 해서
    // 아래 커스텀 핸들러가 항상 경로별 메타 태그를 치환할 수 있게 한다.
    app.use(express.static(distPath, { index: false }))
    app.use((req, res) => {
      if (isAdminPagePath(req.path) && isForeignRequest(req)) {
        res.status(403).set('Content-Type', 'text/html; charset=utf-8').send(GEO_BLOCK_HTML)
        return
      }
      res.set('Content-Type', 'text/html; charset=utf-8')
      let html = injectSeo(template, req.path)
      if (isFeheDocument(req.path)) {
        html = applyReloadHint(html, req.headers)
        res.set('Cache-Control', FEHE_DOCUMENT_CACHE_CONTROL)
      }
      res.send(html)
    })
  } else {
    const { createServer: createViteServer } = await import('vite')
    const vite = await createViteServer({
      root,
      server: { middlewareMode: true },
      appType: 'spa',
    })
    // 개발 모드에서도 페헤 페이지 문서에는 강력 새로고침 표시를 붙여야 인트로 동작을 확인할 수 있다.
    // 그 외 경로와 모듈 요청은 지금처럼 Vite가 그대로 처리한다.
    app.use(async (req, res, next) => {
      if (req.method !== 'GET' || !isFeheDocument(req.path) || !req.headers.accept?.includes('text/html')) {
        next()
        return
      }
      try {
        const raw = await readFile(path.join(root, 'index.html'), 'utf-8')
        const html = await vite.transformIndexHtml(req.originalUrl, raw)
        res.set('Content-Type', 'text/html; charset=utf-8')
        res.set('Cache-Control', FEHE_DOCUMENT_CACHE_CONTROL)
        res.send(applyReloadHint(html, req.headers))
      } catch (error) {
        next(error)
      }
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
