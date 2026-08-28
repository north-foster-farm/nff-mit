// Renders data/costs.json into the costs article.
//
// The page settles one question: which costs grow with the bird and which
// are paid whether or not a bird is raised. Every line names the thing it
// scales with, so the split is a property of the data.
//
// That split is the arithmetic hazard in the whole model. A contribution
// figure missing half the cost list still divides cleanly into a draw
// goal and still produces the wrong number of birds.
//
// The feed rate is computed from the pallet invoice rather than stored
// beside it, so the figures on the page reconcile by construction.

import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { dec } from './confidence.mjs'
import { emitter, R, Ln, nav } from './markdown.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const c = JSON.parse(await readFile(join(root, 'data', 'costs.json'), 'utf8'))
const { P, LI, table, push, text } = emitter()
const m = c.meta
const F = c.feed

const cents = (n) => `$${n.toFixed(2)}`
const rate = (n) => `$${n.toFixed(4)}`
const money = (n) => `$${Math.round(n).toLocaleString('en-US')}`
const lb = (n) => `${Math.round(n * 10) / 10} lb`

const WORDS = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven',
  'eight', 'nine', 'ten']
const say = (n) => WORDS[n] ?? String(n)
const Say = (n) => say(n)[0].toUpperCase() + say(n).slice(1)

/** The rate is the pallet plus its shipping over the pallet weight. It is
 *  derived rather than recorded, because a stored rate beside a stored
 *  invoice is two numbers that can stop agreeing. */
const perLb = (kind) => (F.pallet[kind] + F.shipping) / F.palletLb

/** The rate is invoiced. The quantity is a published standard, because
 *  what the farm actually fed cannot be recovered: neither a season's
 *  feed spend nor the number of birds it fed was recorded, and dividing
 *  one unrecorded figure by another produces an invention. */
const feedPerBird = F.perBird * perLb('broiler')

const amountFor = (l) => (l.derived === 'feed' ? feedPerBird : l.amount)
const inClass = (k) => c.lines.filter((l) => l.scalesWith === k && !l.optional)

const perBird = inClass('bird').filter((l) => !l.excludeFromPerBird)
const perBirdTotal = perBird.reduce((n, l) => n + (amountFor(l) ?? 0), 0)
const invoiced = perBird.filter((l) => l.confidence === 'verified').length

const fixed = inClass('year')
const fixedTotal = fixed
  .filter((l) => l.amount != null)
  .reduce((n, l) => n + l.amount, 0)
const fixedUnknown = fixed.filter((l) => l.amount == null)
const selling = [...inClass('marketDay'), ...inClass('revenue')]
const optional = c.lines.filter((l) => l.optional)
const sausage = c.lines.find((l) => l.excludeFromPerBird)

const value = (l) => {
  const a = amountFor(l)
  if (a == null) return 'Not costed'
  return l.scalesWith === 'bird' ? cents(a) : money(a)
}

/* ---------- front matter and lead ---------- */
push(...nav(m.nav))
push('# Costs', '')

P(`**Costs** are what the farm pays, sorted by what makes them grow. A
chick costs the same whether the farm raises three hundred birds or three
thousand, and the insurance costs the same whether it raises any.`)

P(`The sorting decides what contribution means. Subtracting the costs that
grow with the flock from revenue leaves what each bird earns toward the
bills arriving regardless. Put one of those bills in the wrong class and
the contribution figure still divides cleanly into a draw goal, and still
produces the wrong number of birds.`)

/* ---------- classes ---------- */
push('## Cost classes', '')
const used = new Set(c.lines.map((l) => l.scalesWith))
table(
  ['Class', 'What moves it'],
  [Ln, Ln],
  Object.entries(m.classes)
    .filter(([k]) => used.has(k))
    .map(([, k]) => [k.label, k.note]),
)

/* ---------- per bird ---------- */
push('## Per bird', '')
P(`Three costs follow the bird from the hatchery to the freezer.`)
table(
  ['Cost', 'Per bird'],
  [Ln, R],
  perBird.map((l) => [`${l.label}${dec(l.confidence)}`, value(l)]),
  ['**Per bird**', `**${cents(perBirdTotal)}**`],
)
P(`${Say(invoiced)} of the ${say(perBird.length)} are invoiced. Feed is
the exception, and its own section says why.`)
if (sausage) {
  P(`${sausage.label} costs ${cents(sausage.amount)} a
bird${dec(sausage.confidence)}. ${sausage.note}`)
}

/* ---------- feed ---------- */
push('### Feed', '')
P(`${F.priceNote} A ${F.palletLb.toLocaleString('en-US')} lb pallet costs
${cents(F.pallet.broiler)} for broiler mash and ${cents(F.pallet.layer)}
for layer pellets, with ${cents(F.shipping)} of shipping on either, which
puts the rate at ${rate(perLb('broiler'))} and ${rate(perLb('layer'))} a
pound${dec(F.priceConfidence)}.`)
P(`The quantity is the other half, and it is not invoiced. A bird is
carried at ${lb(F.perBird)}${dec(F.perBirdConfidence)}, which at that rate
is ${cents(feedPerBird)} of feed. ${F.perBirdNote}`)
P(m.invoiceRuling)

/* ---------- per year ---------- */
push('## Per year', '')
P(`These arrive on a calendar instead of on a bird.`)
table(
  ['Cost', 'A year'],
  [Ln, R],
  fixed.map((l) => [`${l.label}${dec(l.confidence)}`, value(l)]),
  ['**Costed so far**', `**${money(fixedTotal)}**`],
)
P(`${Say(fixedUnknown.length)} of those ${say(fixed.length)} lines carry no
figure, so the total is a floor and not a sum. They are listed and left
blank, because a list with an invented number in it reads as finished and a
list with a hole in it does not.`)
for (const l of fixed) if (l.note) P(l.note)

/* ---------- selling ---------- */
push('## Selling costs', '')
P(`${Say(selling.length)} costs grow with selling instead of with raising,
so neither belongs in the per-bird total or the per-year one.`)
for (const l of selling) P(`${l.note}${dec(l.confidence)}`)

/* ---------- held out ---------- */
if (optional.length) {
  push('## Held out', '')
  for (const l of optional) {
    P(`A part-time helper at ${say(l.hoursPerWeek)} hours a week costs
${money(l.amount)} a year${dec(l.confidence)}. ${l.note}`)
  }
}

push('## Still open', '')
for (const b of c.blank) LI(b)
push('')

/* Every line has to land somewhere. A cost that scales with a class the
   page does not render disappears in silence. */
const shown = new Set(
  [...perBird, ...fixed, ...selling, ...optional,
    ...(sausage ? [sausage] : [])].map((l) => l.id),
)
const lost = c.lines.filter((l) => !shown.has(l.id))
if (lost.length) {
  throw new Error(
    `costs: ${lost.map((l) => l.id).join(', ')} reach no section.`,
  )
}

/* Authored prose that no section renders is prose nobody will read. */
const rendered = new Set(
  [...fixed, ...selling, ...optional, ...(sausage ? [sausage] : [])]
    .filter((l) => l.note).map((l) => l.id),
)
const mute = c.lines.filter((l) => l.note && !rendered.has(l.id))
if (mute.length) {
  throw new Error(
    `costs: notes on ${mute.map((l) => l.id).join(', ')} reach no page.`,
  )
}

await mkdir(join(root, 'measures'), { recursive: true })
await writeFile(join(root, 'measures', 'costs.md'), text())

console.log('costs  → measures/costs.md')
console.log(
  `       ${cents(perBirdTotal)} per bird`,
)
console.log(
  `       feed ${rate(perLb('broiler'))}/lb derived from the pallet`,
)
console.log(
  `       ${money(fixedTotal)} costed a year, ` +
    `${fixedUnknown.length} of ${fixed.length} lines blank`,
)
