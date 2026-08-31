import { mkdir, writeFile } from 'node:fs/promises'
import { randomBytes } from 'node:crypto'
import { fileURLToPath } from 'node:url'

const assetDirectory = fileURLToPath(new URL('../assets/', import.meta.url))
const assetPath = fileURLToPath(new URL('../assets/network-test.bin', import.meta.url))
const assetSize = 25 * 1024 * 1024

await mkdir(assetDirectory, { recursive: true })
await writeFile(assetPath, randomBytes(assetSize))
console.log(`Created ${(assetSize / 1024 / 1024).toFixed(0)} MiB test asset: ${assetPath}`)
