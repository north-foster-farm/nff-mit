// Renders the derivation chain.
//
// The steps come from data/equations.json and the figures come from the
// register, so this page cites F10 rather than recomputing it. It used to
// rebuild three figures by hand and print them bare, on a page that
// claimed figures are the only numbers carrying a mark.
//
// The chain mixes three kinds of number and the page names the
// difference. A decision is chosen. An input is estimated and adjustable.
// A figure is measured elsewhere and carries a mark. An input gets no
// mark, because a single rung says less about it than the sweep below
// does.

import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { dec } from './confidence.mjs'
import { emitter, R, Ln, nav, commas } from './markdown.mjs'
import { loadFigures } from './figures-model.mjs'
import { lineChart } from './charts.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const eq = JSON.parse(
  await readFile(join(root, 'data', 'equations.json'), 'utf8'),
)
const { by, M } = await loadFigures()
const { P, LI, table, push, text } = emitter()

const money = (n) => `$${commas(Math.round(n))}`
const cents = (n) => `$${n.toFixed(2)}`
const pct = (n) => `${Math.round(n * 100)}%`
const birds = (n) => commas(Math.round(n))
const WORDS = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven',
  'eight', 'nine', 'ten']
const say = (n) => WORDS[n] ?? String(n)

const F10 = by('F10')
const F20 = by('F20')
const F25 = by('F25')
const D01 = eq.decisions.find((d) => d.id === 'D01')
const D02 = eq.decisions.find((d) => d.id === 'D02')
const I01 = eq.inputs.find((i) => i.id === 'I01')

/* ---------- the chain ---------- */
const run = (sellThrough) => {
  const E01 = D01.value / D02.value
  const E02 = F10.n * sellThrough
  const E03 = E02 - F20.n
  const E04 = D01.value + F25.n
  return { E01, E02, E03, E04, E05: E03 > 0 ? E04 / E03 : Infinity }
}
const now = run(I01.value)

/** Below this rate a bird returns less than it cost, and no number of
 *  birds repairs that. Rounded up, so the sentence is true of every rate
 *  it excludes. */
const breakEven = Math.ceil((F20.n / F10.n) * 100) / 100

const shown = { E01: money, E02: cents, E03: cents, E04: money, E05: birds }
const pretty = (e) =>
  e.replaceAll('/', '÷').replaceAll('*', '×').replaceAll('-', '−')

/* ---------- page ---------- */
push(...nav(eq.meta.nav))
push(`# ${eq.meta.title}`, '')

P(`The **${eq.meta.title.toLowerCase()}** are ${say(eq.steps.length)} steps
from the wage the owners want to the number of birds that pays it.
${eq.meta.direction}`)

P(`They mix three kinds of number. A decision is chosen and can be
changed. An input is estimated and adjustable. A figure is measured on
another page and carries a mark for how far it sits from proof.`)

/* ---------- inputs ---------- */
push('## Inputs', '')
table(
  ['#', 'Kind', 'Name', 'Value'],
  [Ln, Ln, Ln, R],
  [
    ...eq.decisions.map((d) => [
      d.id, 'Decision', d.label,
      d.unit === 'money' ? money(d.value) : commas(d.value),
    ]),
    [I01.id, 'Input', I01.label, pct(I01.value)],
    ...[F10, F20, F25].map((f) => [
      f.id, 'Figure',
      `[${f.label}](/calculations/figures)${dec(f.confidence)}`, f.value,
    ]),
  ],
)
P(`Only the figures carry marks. An input takes none, because a single
rung would say less about it than the sweep further down.`)
for (const d of eq.decisions) if (d.note) P(`${d.id}. ${d.note}`)
P(`${I01.id}. ${I01.note}`)

/* ---------- the chain ---------- */
push('## The chain', '')
P(`Every step is a decision, a figure, or the result of a step above it.`)
table(
  ['#', 'Step', 'From', 'Result'],
  [Ln, Ln, Ln, R],
  eq.steps.map((s) => [
    s.id,
    s.id === 'E03'
      ? `[${s.label}](/measures/costs)`
      : s.label,
    pretty(s.expr), shown[s.id](now[s.id]),
  ]),
)
P(`The bird count is a floor. ${eq.unset.map((u) => u.label.toLowerCase())
  .join(' and a ')} are both missing from
${eq.steps.find((s) => s.id === 'E04').id}, and no figure the chain cites
rests on a document.`)

/* ---------- sensitivity ---------- */
push('## Sell-through', '')
P(`Everything raised is fed and processed whether or not it sells, so the
share that sells changes what a bird contributes without changing what it
cost. Below ${pct(breakEven)} a bird returns less than it cost, and no
volume repairs that.`)

const curve = []
for (let s = I01.range[0]; s <= I01.range[1] + 1e-9; s += I01.step) {
  const r = run(s)
  curve.push({
    x: Math.round(s * 100),
    y: r.E05,
    title: `${pct(s)} sell-through. ${cents(r.E03)} a bird, ` +
      `${birds(r.E05)} birds.`,
  })
}
push(lineChart(curve, {
  formatX: (n) => `${n}%`,
  formatY: (n) => commas(n),
  yLabel: 'Birds required against sell-through',
  mark: { x: Math.round(I01.value * 100), label: pct(I01.value) },
  caption: 'Birds required, against the share of what is raised that sells',
}), '')

const worst = curve[0]
const best = curve[curve.length - 1]
P(`The curve is shallow at the top and steep at the bottom. Between
${worst.x}% and ${best.x}% the answer moves from ${birds(worst.y)} birds
to ${birds(best.y)}, and most of that movement happens in the lower half
of the range.`)

/* ---------- against the fleet ---------- */
push('## Against the fleet', '')
const cap = M.capacity()
P(`The bird count is a demand on the equipment as much as on the market,
and the fleet as it stands holds ${commas(cap)} at a time. Whether the gap
between those two numbers matters depends on how often the pasture turns
over in a season, which nothing in the model settles yet.`)

push('## Still open', '')
for (const b of eq.blank) LI(b)
for (const u of eq.unset) LI(`${u.label}. ${u.note}`)
push('')

await mkdir(join(root, 'calculations'), { recursive: true })
await writeFile(join(root, 'calculations', 'equations.md'), text())

console.log('equations → calculations/equations.md')
console.log(
  `       ${cents(now.E03)} a bird at ${pct(I01.value)}, ` +
    `${birds(now.E05)} birds required`,
)
console.log(`       break-even sell-through ${pct(breakEven)}`)
