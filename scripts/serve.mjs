// Serves build/ and opens the dashboard. No dependencies.

import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { join, extname, normalize, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawn } from 'node:child_process'

const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'build')
const PORT = Number(process.env.PORT || 4321)

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.pdf': 'application/pdf',
  '.txt': 'text/plain; charset=utf-8',
}

async function resolve(urlPath) {
  const clean = decodeURIComponent(urlPath.split('?')[0])
  let p = join(root, normalize(clean).replace(/^(\.\.[/\\])+/, ''))
  try {
    if ((await stat(p)).isDirectory()) p = join(p, 'index.html')
    return p
  } catch {}
  // VitePress cleanUrls: /docs/wiki/people/jim → …/jim.html
  if (!extname(p)) {
    try {
      const withExt = `${p}.html`
      await stat(withExt)
      return withExt
    } catch {}
  }
  return null
}

createServer(async (req, res) => {
  const file = await resolve(req.url)
  if (!file) {
    res.writeHead(404, { 'content-type': 'text/plain' })
    return res.end('Not found')
  }
  try {
    const body = await readFile(file)
    res.writeHead(200, {
      'content-type': TYPES[extname(file)] || 'application/octet-stream',
      'cache-control': 'no-cache',
    })
    res.end(body)
  } catch {
    res.writeHead(500, { 'content-type': 'text/plain' })
    res.end('Read error')
  }
}).listen(PORT, () => {
  const url = `http://localhost:${PORT}/`
  console.log(`\n  North Foster Farm — Model Integration Tool\n  ${url}\n`)
  console.log('  Ctrl-C to stop\n')
  if (!process.env.NO_OPEN) spawn('open', [url], { stdio: 'ignore' })
})
