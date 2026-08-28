// Renders the figures register.
//
// The register itself lives in figures-model.mjs, because the equations
// page cites it too, and rebuilding three of its figures by hand there is
// how they came to be printed with no marks at all.

import { writeFile, mkdir } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { dec, LADDER, LABEL } from './confidence.mjs'
import { emitter, R, Ln, nav } from './markdown.mjs'
import { loadFigures } from './figures-model.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const { figures } = await loadFigures()
const { P, table, push, text } = emitter()

const WORDS = ['No', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven',
  'Eight', 'Nine', 'Ten']
const Say = (n) => WORDS[n] ?? String(n)

const verified = figures.filter((f) => f.confidence === 'verified')
const load = figures.filter((f) => f.loadBearing)
const loadVerified = load.filter((f) => f.confidence === 'verified')

push(...nav({
  prev: { text: 'Calculations', link: '/calculations/' },
  next: { text: 'Equations', link: '/calculations/equations' },
}))
push('# Figures', '')

P(`**Figures** are the values the model is allowed to cite. Every figure
is read from a measure or computed from one, so this register holds
nothing of its own and nothing can be corrected on it. A figure changes
where it was measured.`)

P(`Each figure carries a mark for how far it sits from proof. A figure
computed from more than one measured value takes the worst mark among
them, because arithmetic does not improve evidence. Where a measure rates
all of its own figures together, that rating carries.`)

for (const src of ['Labor', 'Goods', 'Costs', 'Options']) {
  const rows = figures.filter((f) => f.source === src)
  if (!rows.length) continue
  push(`## ${src}`, '')
  table(
    ['#', 'Figure', 'Value'],
    [Ln, Ln, R],
    rows.map((f) => [
      f.id, `[${f.label}](${f.from})${dec(f.confidence)}`, f.value,
    ]),
  )
  for (const f of rows) if (f.note) P(`${f.id}. ${f.note}`)
}

/* ---------- spread ---------- */
push('## Spread of the marks', '')
const earns = new Set(['Goods'])
const verifiedEarned = verified.filter((f) => earns.has(f.source))
P(verifiedEarned.length
  ? `Verification reaches both sides of the ledger.`
  : `Verification is not spread evenly. Every figure resting on a document
is something the farm pays. Nothing it earns is evidenced by one.`)
table(
  ['Mark', 'Rung', 'Figures'],
  [Ln, Ln, R],
  LADDER.map((k) => ({
    k, n: figures.filter((f) => f.confidence === k).length,
  }))
    .filter((x) => x.n)
    .map((x) => [dec(x.k), LABEL[x.k], x.n]),
  ['', '**Total**', `**${figures.length}**`],
)

/* ---------- what carries the weight ---------- */
push('## What carries the weight', '')
P(`${Say(load.length)} figures carry the derivation. An error in any of
them moves the number of birds the farm has to raise, while an error
elsewhere moves a detail.`)
table(
  ['#', 'Figure', 'Value', 'Decides', 'How it enters'],
  [Ln, Ln, R, Ln, Ln],
  load.map((f) => [
    f.id, `${f.label}${dec(f.confidence)}`, f.value, f.decides, f.enters,
  ]),
)
P(loadVerified.length === load.length
  ? `All of them rest on a document.`
  : `${loadVerified.length === 0 ? 'None' : `Only ${loadVerified.length}`} of
them rests on a document. Precision downstream cannot repair that.`)

await mkdir(join(root, 'calculations'), { recursive: true })
await writeFile(join(root, 'calculations', 'figures.md'), text())

console.log('figures → calculations/figures.md')
console.log(
  `       ${figures.length} figures, ${verified.length} verified, ` +
    `${load.length} load-bearing of which ${loadVerified.length} verified`,
)
