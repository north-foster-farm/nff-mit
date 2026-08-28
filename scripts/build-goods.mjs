// Renders data/goods.json into the goods article.
//
// One row per product per weight band, carrying its price and its share
// of production. Price and share multiply on that row, which is why they
// belong on the same row and not on two pages.
//
// Shares are derived from the pack counts rather than stored beside them,
// so a change in production cannot leave a percentage behind. Nothing in
// the prose is typed: a figure that appears in a sentence comes from the
// data or is computed from it.

import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { dec } from './confidence.mjs'
import { emitter, R, Ln, nav, commas } from './markdown.mjs'
import { barChart } from './charts.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const g = JSON.parse(await readFile(join(root, 'data', 'goods.json'), 'utf8'))
const { P, LI, table, push, text } = emitter()
const m = g.meta

const money = (n) => `$${commas(Math.round(n))}`
const cents = (n) => `$${n.toFixed(2)}`
const pct = (n) => `${n.toFixed(1)}%`
const lb = (n) => `${n.toFixed(2)} lb`

const WORDS = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven',
  'eight', 'nine', 'ten']
const say = (n) => WORDS[n] ?? String(n)

const packsOf = (s) => s.bands.reduce((n, b) => n + b.packs, 0)
const revenueOf = (s) => s.bands.reduce((n, b) => n + b.packs * b.price, 0)
const banded = g.skus.filter((s) => s.banded !== false)
const flat = g.skus.filter((s) => s.banded === false)

const totalPacks = g.skus.reduce((n, s) => n + packsOf(s), 0)
const totalRevenue = g.skus.reduce((n, s) => n + revenueOf(s), 0)
const birds = m.modeledAt
const perBird = totalRevenue / birds

/** Shares are computed per product and must close on 100. The last band
 *  carrying packs absorbs the rounding, so the column always sums to the
 *  total it claims. */
const sharesFor = (s) => {
  const packs = packsOf(s)
  if (!packs) return s.bands.map(() => 0)
  const out = s.bands.map((b) => Math.round((b.packs / packs) * 1000) / 10)
  let last = -1
  for (let i = 0; i < out.length; i++) if (out[i] > 0) last = i
  if (last >= 0) {
    const drift = 100 - out.reduce((a, b) => a + b, 0)
    out[last] = Math.round((out[last] + drift) * 10) / 10
  }
  return out
}

/** The band holding the most packs, and the one priced above it. This is
 *  where the distribution is most exposed to a change in carcass weight,
 *  and both figures are read rather than asserted. */
const crowded = (s) => {
  const shares = sharesFor(s)
  let i = 0
  for (let j = 1; j < s.bands.length; j++) {
    if (s.bands[j].packs > s.bands[i].packs) i = j
  }
  return { band: s.bands[i], share: shares[i], next: s.bands[i + 1] }
}

/* ---------- front matter and lead ---------- */
push(...nav(m.nav))
push('# Goods', '')

P(`**Goods** are what a bird is sold as. A bird leaves the farm as a whole
roaster, or as two breast packs and a thigh pack and a share of a sausage
batch, and each of those carries its own price and its own weight band.`)

P(`A band is a weight range with a price attached. Because a heavier pack
costs more, what the farm earns from a bird depends on where its cuts fall
across the bands, and that distribution is the shape of the revenue side.`)

/* ---------- headline ---------- */
push('## Gross per bird', '')
table(
  ['Measure', 'Value'],
  [Ln, R],
  [
    ['Birds the distribution was modeled at', commas(birds)],
    ['Packs', commas(totalPacks)],
    ['Gross revenue', money(totalRevenue)],
  ],
  ['**Gross per bird**', `**${cents(perBird)}**`],
)
P(`Every figure on this page is gross. The model applies sell-through.`)

/* ---------- pack spec ---------- */
push('## Packs', '')
P(`A pack is a fixed number of pieces, so the band distribution is a
property of the whole batch rather than of any single carcass.`)
table(
  ['Product', 'Pieces', 'Birds', 'Average pack'],
  [Ln, R, R, R],
  g.packSpec.map((p) => [p.sku, p.pieces, p.birds, lb(p.avgPack)]),
)
P(`Pack weights carry a shift of ${say(m.shiftSd)} standard deviation
${m.shift}${dec(m.shiftConfidence)}.`)

/* ---------- diversions ---------- */
push('## Diversions', '')
P(`Not every cut is sold in its most obvious form. A diversion sends a
share of one cut to a different product, and it is where most of the
choice in the catalog lives.`)
table(
  ['Diversion', 'Share'],
  [Ln, R],
  g.diversions.map((d) => [`${d.label}${dec(d.confidence)}`, `${d.share}%`]),
)
for (const d of g.diversions) if (d.note) P(d.note)

/* ---------- the bands ---------- */
push('## Bands', '')
P(`Bands are not a shared axis. Each product has its own ranges and they
do not line up, so a share is always a share of its own product.`)

for (const s of banded) {
  const shares = sharesFor(s)
  push(`### ${s.label}`, '')
  push(
    barChart(
      s.bands.map((b, i) => ({
        label: b.label.split(' ')[0],
        value: shares[i],
        muted: !b.packs,
        title: b.packs
          ? `${b.label} lb at ${money(b.price)}. ` +
            `${commas(b.packs)} packs, ${pct(shares[i])} of ${s.label.toLowerCase()}, ` +
            `${money(b.packs * b.price)}.`
          : `${b.label} lb at ${money(b.price)}. No production.`,
      })),
      {
        format: (n) => `${n}%`,
        yLabel: `Share of ${s.label.toLowerCase()} by weight band`,
        caption: `Share of packs by pack weight, in pounds`,
      },
    ),
    '',
  )
  table(
    ['Band', 'Price', 'Packs', 'Share', 'Revenue'],
    [Ln, R, R, R, R],
    s.bands.map((b, i) => [
      b.label, money(b.price), commas(b.packs),
      b.packs ? pct(shares[i]) : 'n/a', money(b.packs * b.price),
    ]),
    [
      `**${s.label}**`, '', `**${commas(packsOf(s))}**`, '**100%**',
      `**${money(revenueOf(s))}**`,
    ],
  )
}

/* ---------- unbanded ---------- */
if (flat.length) {
  push('## Sold by the pack', '')
  P(`${say(flat.length).replace(/^./, (c) => c.toUpperCase())} products
carry no bands, because they are made to a pack weight rather than sorted
into one.`)
  table(
    ['Product', 'Pack', 'Price', 'Packs', 'Revenue'],
    [Ln, Ln, R, R, R],
    flat.map((s) => [
      s.label, s.bands[0].label, money(s.bands[0].price),
      commas(packsOf(s)), money(revenueOf(s)),
    ]),
  )
  for (const s of flat) if (s.note) P(s.note)
}

/* ---------- carcass ---------- */
push('## Carcass', '')
P(`The distribution is modeled from a ${lb(m.carcass.weight)} carcass and
a ${m.carcass.cv} percent coefficient of variation${dec(m.carcass.confidence)}.
${m.carcass.note}`)

const bb = banded.find((s) => s.label === 'Boneless breasts')
if (bb) {
  const c = crowded(bb)
  P(`The exposure is easiest to see on the boneless breasts.
${pct(c.share)} of those packs sit in the ${c.band.label} band at
${money(c.band.price)}, and the band above it pays
${money(c.next.price - c.band.price)} more. A carcass heavier than
modeled moves packs across that line.`)
}

/* ---------- prices ---------- */
push('## Prices', '')
P(m.basis)
P(m.priceNote)
P(`Source: ${m.source}.`)

push('## Still open', '')
for (const b of g.blank) LI(b)
push('')

await mkdir(join(root, 'measures'), { recursive: true })
await writeFile(join(root, 'measures', 'goods.md'), text())

for (const s of banded) {
  const sum = sharesFor(s).reduce((a, b) => a + b, 0)
  if (Math.abs(sum - 100) > 0.05) {
    throw new Error(`${s.label} shares sum to ${sum}, not 100`)
  }
}

console.log('goods  → measures/goods.md')
console.log(
  `       ${g.skus.length} products, ` +
    `${g.skus.reduce((n, s) => n + s.bands.length, 0)} bands, ` +
    `${commas(totalPacks)} packs`,
)
console.log(`       ${money(totalRevenue)} gross, ${cents(perBird)} a bird`)
console.log('       every band distribution closes on 100%')
