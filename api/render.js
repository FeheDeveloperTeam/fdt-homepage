import path from 'node:path'
import { readFile } from 'node:fs/promises'
import { injectSeo } from './_lib/seoRender.js'

// 콜드 스타트당 한 번만 읽고 이후 요청부터는 메모리에 캐시된 템플릿을 재사용한다.
let cachedTemplate = null

async function loadTemplate() {
  if (!cachedTemplate) {
    const templatePath = path.join(process.cwd(), 'dist', 'index.html')
    cachedTemplate = await readFile(templatePath, 'utf-8')
  }
  return cachedTemplate
}

export default async function handler(req, res) {
  const template = await loadTemplate()
  const pathname = req.url.split('?')[0]
  const html = injectSeo(template, pathname)

  res.statusCode = 200
  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  res.end(html)
}
