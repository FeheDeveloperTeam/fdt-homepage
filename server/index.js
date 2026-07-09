import path from 'node:path'
import { fileURLToPath } from 'node:url'
import express from 'express'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const isProduction = process.env.NODE_ENV === 'production'
const port = process.env.PORT || 3000

async function createServer() {
  const app = express()
  app.use(express.json())

  if (isProduction) {
    const distPath = path.join(root, 'dist')
    app.use(express.static(distPath))
    app.use((req, res) => {
      res.sendFile(path.join(distPath, 'index.html'))
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
