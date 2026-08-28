// Renders the figures register.
//
// The page makes two promises, and both are kept here rather than
// asserted there. It holds no number of its own: every value is read from
// a measure or computed from one. And no mark is typed: a figure declares
// the inputs it was computed from, and its confidence is the worst among
// them.
//
// Both promises were broken on the first pass, by a hand-typed count and
// four hand-typed marks that happened to be right. A promise the file
// makes and quietly breaks is worse than no promise, because the register
// is the page most likely to be trusted.

import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { dec, LADDER, LABEL, rank } from './confidence.mjs'
import { emitter, R, Ln, nav, commas } from './markdown.mjs'
import { loadLabor, hm } from './labor-model.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const read = async (f) =>
  JSON.parse(await readFile(join(root, 'data', f), 'utf8'))

const M = await loadLabor()
const goods = await read('goods.json')
const costs = await read('costs.json')
const options = await read('options.json')
const { P, table, push, text } = emitter()

const cents = (n) => `$${n.toFixed(2)}`
const rate = (n) => `$${n.toFixed(4)}`
const money = (n) => `$${commas(Math.round(n))}`
const WORDS = ['No', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven',
  'Eight', 'Nine', 'Ten']
const Say = (n) => WORDS[n] ?? String(n)

/** The worst rung among a figure's inputs. An unrecognised key fails the
 *  build rather than scoring below verified, which is what a missing
 *  confidence field used to do silently. */
const floor = (...ks) => {
  const bad = ks.filter((k) => rank(k) < 0)
  if (bad.length) throw new Error(`unknown confidence: ${bad.join(', ')}`)
  return LADDER[Math.max(...ks.map(rank))]
}

/** Confidence is never passed in. It is computed from the inputs, so a
 *  figure cannot claim a mark its sources do not support. */
const fig = ({ inputs, ...rest }) => ({ ...rest, confidence: floor(...inputs) })

/* ---------- labor inputs ---------- */
const taskConf = (pred) => M.d.tasks.filter(pred).map((t) => t.confidence)
/** A move step without its own mark inherits the move day's. */
const stepConf = () =>
  M.steps.map((s) => s.confidence ?? M.moveDay.confidence)
const layer = (t) => t.enterprise === 'layer'
const broiler = (t) => t.enterprise === 'broiler'
const tractorish = (t) => t.scalesWith === 'tractor' || t.dependsOn === 'tractor'
const coopish = (t) => t.scalesWith === 'coop600'

/* ---------- goods ---------- */
const packsOf = (s) => s.bands.reduce((n, b) => n + b.packs, 0)
const revOf = (s) => s.bands.reduce((n, b) => n + b.packs * b.price, 0)
const gPacks = goods.skus.reduce((n, s) => n + packsOf(s), 0)
const gRevenue = goods.skus.reduce((n, s) => n + revOf(s), 0)
const grossPerBird = gRevenue / goods.meta.modeledAt

/* ---------- costs ---------- */
const F = costs.feed
const perLb = (k) => (F.pallet[k] + F.shipping) / F.palletLb
const feedActual = F.perBirdActual * perLb('broiler')
const feedRequired = F.perBirdRequirement * perLb('broiler')
const line = (id) => costs.lines.find((l) => l.id === id)
const birdLines = costs.lines.filter(
  (l) => l.scalesWith === 'bird' && !l.excludeFromPerBird && !l.optional,
)
const costPerBird = birdLines.reduce(
  (n, l) => n + (l.derived === 'feed' ? feedActual : l.amount), 0,
)
const costInputs = [
  ...birdLines.map((l) => l.confidence), F.priceConfidence,
  F.perBirdConfidence,
]
const fixedLines = costs.lines.filter(
  (l) => l.scalesWith === 'year' && !l.optional,
)
const fixedBlank = fixedLines.filter((l) => l.amount == null)
const fixedTotal = fixedLines
  .filter((l) => l.amount != null)
  .reduce((n, l) => n + l.amount, 0)

/* ---------- options ---------- */
const capitalOf = (o) =>
  o.capital.reduce((n, x) => n + x.amount * (x.count ?? 1), 0)

/* ---------- the register ---------- */
const figures = [
  fig({
    id: 'F01', label: 'Chore time, an ordinary day', value: hm(M.dayTotal()),
    inputs: taskConf(() => true), from: '/measures/labor', source: 'Labor',
  }),
  fig({
    id: 'F02', label: 'Chore time, a week', value: hm(M.weekTotal()),
    inputs: [...taskConf(() => true), ...stepConf()],
    from: '/measures/labor', source: 'Labor',
  }),
  fig({
    id: 'F03', label: 'Move day', value: hm(M.moveDayTotal()),
    inputs: [...taskConf(() => true), ...stepConf()],
    from: '/measures/labor', source: 'Labor',
  }),
  fig({
    id: 'F04', label: 'Layer share of the day',
    value: hm(M.byEnterprise().layer),
    inputs: taskConf(layer), from: '/measures/labor', source: 'Labor',
  }),
  fig({
    id: 'F05', label: 'Broiler share of the day',
    value: hm(M.byEnterprise().broiler),
    inputs: taskConf(broiler), from: '/measures/labor', source: 'Labor',
  }),
  fig({
    id: 'F06', label: 'One more tractor, a day',
    value: hm(
      M.dayTotal({ ...M.fleet, tractor: M.fleet.tractor + 1 }) - M.dayTotal(),
    ),
    inputs: taskConf(tractorish), from: '/measures/labor', source: 'Labor',
  }),
  fig({
    id: 'F07', label: 'One more coop, a day',
    value: hm(
      M.dayTotal({ ...M.fleet, coop600: M.fleet.coop600 + 1 }) - M.dayTotal(),
    ),
    inputs: taskConf(coopish), from: '/measures/labor', source: 'Labor',
  }),

  fig({
    id: 'F10', label: 'Gross revenue a bird', value: cents(grossPerBird),
    inputs: [goods.meta.confidence], from: '/measures/goods', source: 'Goods',
    note: 'The figure is gross, before sell-through.',
    loadBearing: true, decides: 'What a bird earns',
    enters: 'multiplied by the bird count',
  }),
  fig({
    id: 'F11', label: 'Packs a bird',
    value: (gPacks / goods.meta.modeledAt).toFixed(2),
    inputs: [goods.meta.confidence], from: '/measures/goods', source: 'Goods',
  }),
  fig({
    id: 'F12', label: 'Carcass weight',
    value: `${goods.meta.carcass.weight} lb`,
    inputs: [goods.meta.carcass.confidence], from: '/measures/goods',
    source: 'Goods',
  }),
  fig({
    id: 'F13', label: 'Weight spread', value: `${goods.meta.carcass.cv}%`,
    inputs: [goods.meta.carcass.confidence], from: '/measures/goods',
    source: 'Goods',
  }),

  fig({
    id: 'F20', label: 'Cost a bird', value: cents(costPerBird),
    inputs: costInputs, from: '/measures/costs', source: 'Costs',
    loadBearing: true, decides: 'What a bird costs',
    enters: 'subtracted from what it earns',
  }),
  fig({
    id: 'F21', label: 'Cost a bird, fed to standard',
    value: cents(costPerBird - feedActual + feedRequired),
    inputs: costInputs, from: '/measures/costs', source: 'Costs',
  }),
  fig({
    id: 'F22', label: 'Feed, broiler mash',
    value: `${rate(perLb('broiler'))} a lb`,
    inputs: [F.priceConfidence], from: '/measures/costs', source: 'Costs',
  }),
  fig({
    id: 'F23', label: 'Chick, delivered', value: cents(line('K01').amount),
    inputs: [line('K01').confidence], from: '/measures/costs',
    source: 'Costs',
  }),
  fig({
    id: 'F24', label: 'Processing a bird', value: cents(line('K03').amount),
    inputs: [line('K03').confidence], from: '/measures/costs',
    source: 'Costs',
  }),
  fig({
    id: 'F25', label: 'Costs paid by the year', value: money(fixedTotal),
    inputs: fixedLines.map((l) => l.confidence), from: '/measures/costs',
    source: 'Costs',
    note: `The total is a floor, because ${fixedBlank.length} of the ` +
      `${fixedLines.length} yearly lines carry no figure.`,
    loadBearing: true, decides: 'What the year costs before anyone is paid',
    enters: 'added on top of what the birds have to cover',
  }),

  ...options.options.map((o, i) => fig({
    id: `F3${i}`, label: `${o.label}, capital`, value: money(capitalOf(o)),
    inputs: o.capital.map((x) => x.confidence),
    from: '/calculations/options', source: 'Options',
  })),
  fig({
    id: `F3${options.options.length}`, label: 'Borrowing rate',
    value: `${options.meta.financing.rate}%`,
    inputs: [options.meta.financing.confidence],
    from: '/calculations/options', source: 'Options',
    note: `${options.meta.financing.product}, read in ` +
      `${options.meta.financing.asOf}.`,
  }),
]

/* An id assigned by position is an id that can collide. */
const ids = figures.map((f) => f.id)
const dupes = ids.filter((id, i) => ids.indexOf(id) !== i)
if (dupes.length) throw new Error(`duplicate figure ids: ${dupes.join(', ')}`)

const verified = figures.filter((f) => f.confidence === 'verified')
const load = figures.filter((f) => f.loadBearing)

/* ---------- page ---------- */
push(...nav({
  prev: { text: 'Calculations', link: '/calculations/' },
  next: { text: 'Capacity options', link: '/calculations/options' },
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

/** Read rather than asserted: is anything the farm earns evidenced? */
const earns = new Set(['Goods'])
const verifiedEarned = verified.filter((f) => earns.has(f.source))
P(verifiedEarned.length
  ? `Verification reaches both sides of the ledger.`
  : `Verification is not spread evenly. Every figure resting on a document
is something the farm pays. Nothing it earns is evidenced by one.`)
table(
  ['Mark', 'Rung', 'Figures'],
  [Ln, Ln, R],
  LADDER.map((k) => ({ k, n: figures.filter((f) => f.confidence === k).length }))
    .filter((x) => x.n)
    .map((x) => [dec(x.k), LABEL[x.k], x.n]),
  ['', '**Total**', `**${figures.length}**`],
)

/* ---------- what carries the weight ---------- */
push('## What carries the weight', '')
P(`${Say(load.length)} figures carry the derivation. An error in any of them
moves the number of birds the farm has to raise, while an error elsewhere
moves a detail.`)
table(
  ['#', 'Figure', 'Value', 'Decides', 'How it enters'],
  [Ln, Ln, R, Ln, Ln],
  load.map((f) => [
    f.id, `${f.label}${dec(f.confidence)}`, f.value, f.decides, f.enters,
  ]),
)
const loadVerified = load.filter((f) => f.confidence === 'verified')
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
