// The figures register, as data.
//
// The register page renders this, and the equations page cites it. Both
// read the same array, so a figure quoted in the chain carries the same
// value and the same mark as the figure listed in the register. Before
// this existed the equations page rebuilt three of them by hand and
// printed them without marks at all.
//
// Confidence is never passed in. A figure declares the inputs it came
// from and takes the worst mark among them, because arithmetic does not
// improve evidence.

import { readFile } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { LADDER, rank } from './confidence.mjs'
import { loadLabor, hm } from './labor-model.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const read = async (f) =>
  JSON.parse(await readFile(join(root, 'data', f), 'utf8'))

const commas = (n) => n.toLocaleString('en-US')
const cents = (n) => `$${n.toFixed(2)}`
const rate = (n) => `$${n.toFixed(4)}`
const money = (n) => `$${commas(Math.round(n))}`

/** The worst rung among a figure's inputs. An unrecognised key fails the
 *  build rather than scoring below verified, which is what a missing
 *  confidence field used to do silently. */
export const floor = (...ks) => {
  const bad = ks.filter((k) => rank(k) < 0)
  if (bad.length) throw new Error(`unknown confidence: ${bad.join(', ')}`)
  return LADDER[Math.max(...ks.map(rank))]
}

export async function loadFigures() {
  const M = await loadLabor()
  const goods = await read('goods.json')
  const costs = await read('costs.json')
  const options = await read('options.json')

  const fig = ({ inputs, ...rest }) =>
    ({ ...rest, confidence: floor(...inputs) })

  const taskConf = (p) => M.d.tasks.filter(p).map((t) => t.confidence)
  const stepConf = () =>
    M.steps.map((s) => s.confidence ?? M.moveDay.confidence)
  const layer = (t) => t.enterprise === 'layer'
  const broiler = (t) => t.enterprise === 'broiler'
  const tractorish = (t) =>
    t.scalesWith === 'tractor' || t.dependsOn === 'tractor'
  const coopish = (t) => t.scalesWith === 'coop600'

  const packsOf = (s) => s.bands.reduce((n, b) => n + b.packs, 0)
  const revOf = (s) => s.bands.reduce((n, b) => n + b.packs * b.price, 0)
  const gPacks = goods.skus.reduce((n, s) => n + packsOf(s), 0)
  const gRevenue = goods.skus.reduce((n, s) => n + revOf(s), 0)
  const grossPerBird = gRevenue / goods.meta.modeledAt

  const F = costs.feed
  const perLb = (k) => (F.pallet[k] + F.shipping) / F.palletLb
  const feedPerBird = F.perBird * perLb('broiler')
  const line = (id) => costs.lines.find((l) => l.id === id)
  const birdLines = costs.lines.filter(
    (l) => l.scalesWith === 'bird' && !l.excludeFromPerBird && !l.optional,
  )
  const costPerBird = birdLines.reduce(
    (n, l) => n + (l.derived === 'feed' ? feedPerBird : l.amount), 0,
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

  const capitalOf = (o) =>
    o.capital.reduce((n, x) => n + x.amount * (x.count ?? 1), 0)

  const figures = [
    fig({
      id: 'F01', label: 'Chore time, an ordinary day',
      value: hm(M.dayTotal()), n: M.dayTotal(),
      inputs: taskConf(() => true), from: '/measures/labor', source: 'Labor',
    }),
    fig({
      id: 'F02', label: 'Chore time, a week', value: hm(M.weekTotal()),
      n: M.weekTotal(),
      inputs: [...taskConf(() => true), ...stepConf()],
      from: '/measures/labor', source: 'Labor',
    }),
    fig({
      id: 'F03', label: 'Move day', value: hm(M.moveDayTotal()),
      n: M.moveDayTotal(),
      inputs: [...taskConf(() => true), ...stepConf()],
      from: '/measures/labor', source: 'Labor',
    }),
    fig({
      id: 'F04', label: 'Layer share of the day',
      value: hm(M.byEnterprise().layer), n: M.byEnterprise().layer,
      inputs: taskConf(layer), from: '/measures/labor', source: 'Labor',
    }),
    fig({
      id: 'F05', label: 'Broiler share of the day',
      value: hm(M.byEnterprise().broiler), n: M.byEnterprise().broiler,
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
      n: grossPerBird,
      inputs: [goods.meta.confidence], from: '/measures/goods',
      source: 'Goods', note: 'The figure is gross, before sell-through.',
      loadBearing: true, decides: 'What a bird earns',
      enters: 'multiplied by the bird count',
    }),
    fig({
      id: 'F11', label: 'Packs a bird',
      value: (gPacks / goods.meta.modeledAt).toFixed(2),
      inputs: [goods.meta.confidence], from: '/measures/goods',
      source: 'Goods',
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
      n: costPerBird,
      inputs: costInputs, from: '/measures/costs', source: 'Costs',
      loadBearing: true, decides: 'What a bird costs',
      enters: 'subtracted from what it earns',
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
      n: fixedTotal,
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

  const by = (id) => {
    const f = figures.find((x) => x.id === id)
    if (!f) throw new Error(`no such figure: ${id}`)
    return f
  }

  return { figures, by, M }
}
