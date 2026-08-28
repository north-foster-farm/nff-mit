// Copies the dashboard shell into build/ and stamps it with live counts.
// The dashboard is the site root; VitePress owns everything under it.
//
// Each tile carries exactly one datum, and every datum is read from the
// data it describes. A stamp that has to be edited by hand is a stamp
// that will go stale, so a section with nothing in it says so.

import { readFile, writeFile, mkdir, cp, readdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const out = join(root, 'build')

const read = async (p) => JSON.parse(await readFile(join(root, p), 'utf8'))
const has = (p) => existsSync(join(root, p))

/** Markdown files under a directory, recursively. */
async function countMarkdown(dir) {
  if (!existsSync(dir)) return 0
  let n = 0
  for (const e of await readdir(dir, { withFileTypes: true })) {
    if (e.name.startsWith('.')) continue
    const p = join(dir, e.name)
    if (e.isDirectory()) n += await countMarkdown(p)
    else if (e.name.endsWith('.md')) n++
  }
  return n
}

/** A page with nothing on it yet reports that, rather than reporting 1. */
const written = async (dir, unbuilt = 'Not built') => {
  const n = await countMarkdown(join(root, dir))
  if (!n) return unbuilt
  const body = await readFile(join(root, dir, 'index.md'), 'utf8')
    .catch(() => '')
  if (/Not yet written|Not yet built/.test(body)) return unbuilt
  return `${n} ${n === 1 ? 'page' : 'pages'}`
}

const hm = (m) => {
  const h = Math.floor(m / 60)
  const r = Math.round(m % 60)
  return r ? `${h} h ${String(r).padStart(2, '0')}` : `${h} h`
}

/* ---------- labor ---------- */
let laborStamp = 'Not built'
if (has('data/labor.json')) {
  const d = await read('data/labor.json')
  const fleet = Object.fromEntries(
    Object.entries(d.meta.units).map(([k, v]) => [k, v.default]),
  )
  const count = (t) => (t.scalesWith === 'fixed' ? 1 : fleet[t.scalesWith] ?? 0)
  const daily = d.tasks
    .filter((t) => !t.handsOff)
    .reduce((n, t) => n + t.minutes * count(t), 0)
  laborStamp = `${hm(daily)} a day`
}

const STAMPS = {
  labor: laborStamp,
  goods: await written('measures', 'Not built').then(() =>
    has('data/goods.json') ? 'Built' : 'Not built',
  ),
  costs: has('data/costs.json') ? 'Built' : 'Not built',
  calculations: await written('calculations'),
  model: await written('model'),
  scenarios: has('apps/scenarios') ? 'Built' : 'Not built',
  wiki: await written('wiki'),
  presentations: await written('presentations'),
}

await mkdir(out, { recursive: true })
let html = await readFile(join(root, 'dashboard', 'index.html'), 'utf8')
for (const [k, v] of Object.entries(STAMPS)) {
  html = html.replaceAll(`{{${k}}}`, v)
}
const left = html.match(/\{\{(\w+)\}\}/g)
if (left) throw new Error(`unstamped tokens in the shell: ${left.join(', ')}`)
await writeFile(join(out, 'index.html'), html)

for (const f of ['logo.svg', 'mark.png', '_headers', 'robots.txt']) {
  const src = join(root, 'dashboard', f)
  if (existsSync(src)) await cp(src, join(out, f))
}

console.log('shell  → build/index.html')
for (const [k, v] of Object.entries(STAMPS)) {
  console.log(`       ${k.padEnd(14)}${v}`)
}
