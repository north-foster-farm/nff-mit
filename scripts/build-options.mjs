// Renders data/options.json into the capacity options article.
//
// An option is the third kind of object in the model. A figure holds a
// value and an equation combines figures, but neither can say that at
// some bird count something has to be bought, that there are two ways to
// buy it, and that the two do opposite things to the working day.
//
// Labor effects are not stored here. They are computed by asking the
// labor model what a different fleet costs, so this page cannot disagree
// with the time study.

import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { dec } from './confidence.mjs'
import { loadLabor, hm } from './labor-model.mjs'
import { emitter, R, Ln, nav, commas } from './markdown.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const o = JSON.parse(await readFile(join(root, 'data', 'options.json'), 'utf8'))
const M = await loadLabor()
const F = o.meta.financing

const money = (n) =>
  `$${Math.round(n).toLocaleString('en-US')}`
const pct = (n) => `${n}%`
const hrs = (h) => `${Number.isInteger(h) ? h : h.toFixed(1)} h`

const { P, LI, table, push, text } = emitter()

const sum = (xs, fn) => xs.reduce((n, x) => n + fn(x), 0)
const capitalOf = (opt) => sum(opt.capital, (c) => c.amount * (c.count ?? 1))
const laborOf = (opt) => sum(opt.buildLabor, (b) => b.hours * (b.count ?? 1))
const birdsOf = (opt) => M.units[opt.unit].birds

/** A fleet built from the article's defaults, overridden per scenario. */
const fleetOf = (spec) => ({ ...M.fleet, ...spec })

/** What one more of a unit does to the day, asked of the labor model
 *  rather than restated. Both options are measured from the fleet as it
 *  stands, because a first tractor also switches on the per-visit costs
 *  of running a hose to pasture, and charging those to the sixth tractor
 *  would make it look four times more expensive than it is. */
const dailyPerUnit = (unit) => {
  const more = { ...M.fleet, [unit]: (M.fleet[unit] ?? 0) + 1 }
  return M.dayTotal(more) - M.dayTotal(M.fleet)
}

/** Level payment on an amortizing loan. */
const monthlyPayment = (principal, annualRate, years) => {
  const r = annualRate / 100 / 12
  const n = years * 12
  if (!principal) return 0
  if (!r) return principal / n
  return (principal * r) / (1 - Math.pow(1 + r, -n))
}

/* ---------- front matter and lead ---------- */
push(...nav(o.meta.nav))
push('# Capacity options', '')

P(`A **capacity option** is a purchase the farm makes to hold more birds.
It carries four consequences at once: money out now, hours spent
building, birds it lets the farm hold, and what it does to every day
afterward. The four tables below are those four consequences.`)

P(`The last of them is what separates the two options. One adds a chore
round to the morning and the other takes the round away, so price alone
does not order them.`)

P(o.meta.basis)

/* ---------- each option ---------- */
for (const opt of o.options) {
  push(`## ${opt.label}`, '')
  P(opt.summary)

  table(
    ['Cost', 'Each', 'Count', 'Total'],
    [Ln, R, R, R],
    opt.capital.map((c) => [
      `${c.label}${dec(c.confidence)}`, money(c.amount), c.count ?? 1,
      money(c.amount * (c.count ?? 1)),
    ]),
    ['**Capital**', '', '', `**${money(capitalOf(opt))}**`],
  )
  table(
    ['Build labor', 'Each', 'Count', 'Total'],
    [Ln, R, R, R],
    opt.buildLabor.map((b) => [
      `${b.label}${dec(b.confidence)}`, hrs(b.hours), b.count ?? 1,
      hrs(b.hours * (b.count ?? 1)),
    ]),
    ['**Hours**', '', '', `**${hrs(laborOf(opt))}**`],
  )
  for (const c of [...opt.capital, ...opt.buildLabor]) {
    if (c.note) P(c.note)
  }
  if (opt.halvedNote) P(opt.halvedNote)
  if (opt.power === 'battery') {
    P(`The coop runs on a battery and asks for nothing from the pasture.
The coop and the [buried line](/measures/labor) can therefore be argued,
funded and timed one at a time.`)
  }
}

/** What the final tractor returns, as against any other one. Removing it
 *  also removes the flat per-visit cost of watering birds on pasture. */
const lastTractor =
  M.dayTotal({ ...M.fleet, tractor: 1 }) - M.dayTotal({ ...M.fleet, tractor: 0 })

/* ---------- cost of capacity ---------- */
push('## Cost of capacity', '')
table(
  ['Option', 'Birds', 'Capital', 'Per bird', 'Daily labor', 'Per 100 birds'],
  [Ln, R, R, R, R, R],
  o.options.map((opt) => {
    const birds = birdsOf(opt)
    const daily = dailyPerUnit(opt.unit)
    return [
      opt.label, commas(birds), money(capitalOf(opt)),
      money(capitalOf(opt) / birds), hm(daily),
      hm(Math.round((daily / birds) * 100 * 10) / 10),
    ]
  }),
)
P(`Per bird, the two capital costs are the same order. The daily labor is
not, because a tractor needs somebody to carry feed and water to it and a
coop does not.`)
P(`Both daily figures are measured against the fleet as it stands, which
matters because the first tractor costs more than any that follow it. It
switches on the per-visit cost of running a hose out to pasture, and that
cost is charged once however many tractors come after. Removing the last
tractor therefore returns ${hm(lastTractor)} rather than the
${hm(dailyPerUnit('tractor'))} that any other one returns.`)

/* ---------- effect on the day ---------- */
push('## Effect on the day', '')
table(
  ['Fleet', 'Capacity', 'Day', 'Blocks'],
  [Ln, R, R, R],
  o.fleets.map((f) => {
    const fl = fleetOf(f)
    return [
      f.label, commas(M.capacity(fl)), hm(M.dayTotal(fl)),
      M.liveBlocks(fl).length,
    ]
  }),
)
const layersOnly = fleetOf({ tractor: 0, coop600: 0, brooder: 0 })
const now = M.fleet
const twoCoops = fleetOf({ tractor: 0, coop600: 2 })
P(`Housing every broiler takes
${hm(M.dayTotal(now) - M.dayTotal(twoCoops))} out of the day and leaves
all ${M.liveBlocks(twoCoops).length} blocks standing. Feed and water can
be automated away. The eggs still have to be collected, and somebody still
has to shut the coops at dark.`)
P(`What survives is the laying flock. Of the day that remains,
${hm(M.dayTotal(layersOnly))} would be there with no broilers on the farm
at all, brooder included.`)

/* ---------- financing ---------- */
push('## Financing', '')
P(`A tractor is bought outright. A coop is large enough to borrow
against, and the ${F.product} rate is ${pct(F.rate)} as of
${F.asOf}${dec(F.confidence)}.`)

const loanOpt = o.options.find((x) => x.financing.includes('loan'))
const unit = loanOpt.quotedPrice / (loanOpt.max ?? 1)
const rows = []
for (const buy of o.purchases) {
  for (const share of o.splits) {
    const price = unit * buy.of
    const p = price * share
    const m = monthlyPayment(p, F.rate, F.term)
    rows.push([
      buy.label, money(p), money(price - p), money(m), money(m * 12),
      money(m * 12 * F.term - p),
    ])
  }
}
table(
  ['Buying', 'Borrowed', 'Owner puts in', 'Monthly', 'A year', 'Interest'],
  [Ln, R, R, R, R, R],
  rows,
)
P(`The term is ${F.term} years throughout. The owner share is adjustable,
so each pair of rows is the ends of a range rather than two choices.`)
P(`${F.note} The alternatives are not interchangeable products.`)

table(
  ['Alternative', 'Rate'],
  [Ln, R],
  F.alternatives.map((a) => [
    a.label,
    a.low === a.high ? pct(a.low) : `${pct(a.low)} to ${pct(a.high)}`,
  ]),
)

/* ---------- blank ---------- */
push('## Still open', '')
for (const b of o.blank) LI(b)
push('')

await mkdir(join(root, 'calculations'), { recursive: true })
await writeFile(join(root, 'calculations', 'options.md'), text())

console.log('options → calculations/options.md')
for (const opt of o.options) {
  console.log(
    `       ${opt.label.padEnd(16)}${money(capitalOf(opt)).padStart(8)}  ` +
      `${hrs(laborOf(opt)).padStart(7)}  ${birdsOf(opt)} birds  ` +
      `${hm(dailyPerUnit(opt.unit))}/day`,
  )
}
