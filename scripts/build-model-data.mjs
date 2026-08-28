// Writes public/model.json, the numbers the live model loads.
//
// It is generated from the same registers the static pages render, so the
// page you read and the page you adjust start from identical values. The
// browser never recomputes a measure. It re-runs the chain over values it
// was handed, and every one of those carries the id it is known by
// everywhere else.

import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadFigures } from './figures-model.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const eq = JSON.parse(
  await readFile(join(root, 'data', 'equations.json'), 'utf8'),
)
const { by, M } = await loadFigures()

const num = (f) => {
  if (typeof f.n !== 'number') {
    throw new Error(`${f.id} has no numeric value to hand the browser`)
  }
  return f.n
}

const cited = ['F10', 'F20', 'F25'].map(by)

const groups = [
  {
    id: 'decisions',
    label: 'Decisions',
    note: 'Chosen rather than measured. Change these to ask a different '
      + 'question.',
    items: eq.decisions.map((d) => ({
      id: d.id, label: d.label, value: d.value, kind: 'decision',
      unit: d.unit,
      min: d.unit === 'money' ? 0 : 1,
      max: d.unit === 'money' ? d.value * 3 : 6,
      step: d.unit === 'money' ? 1000 : 1,
      note: d.note ?? null,
    })),
  },
  {
    id: 'inputs',
    label: 'Inputs',
    note: 'Estimated and adjustable. These carry no confidence mark, '
      + 'because moving one says more than a mark would.',
    items: eq.inputs.map((i) => ({
      id: i.id, label: i.label, value: i.value, kind: 'input',
      unit: i.unit,
      min: i.range[0], max: i.range[1], step: i.step,
      note: i.note ?? null,
    })),
  },
  {
    id: 'figures',
    label: 'Figures',
    note: 'Measured elsewhere. Changing one here asks what if the '
      + 'measurement were different, and it does not change the measure.',
    items: cited.map((f) => ({
      id: f.id, label: f.label, value: num(f), kind: 'figure',
      unit: f.id === 'F25' ? 'money' : 'cents',
      min: 0, max: Math.round(num(f) * 2),
      step: f.id === 'F25' ? 100 : 0.5,
      confidence: f.confidence, from: f.from,
      note: f.note ?? null,
    })),
  },
]

groups.push({
  id: 'fleet',
  label: 'Fleet',
  note: 'What the equipment holds at once. Raising it is what the '
    + 'capacity options buy.',
  items: [{
    id: 'CAP',
    label: 'Birds on pasture at once',
    value: M.capacity(),
    kind: 'figure',
    unit: 'birds',
    min: 0,
    max: 2100,
    step: 60,
    from: '/calculations/options',
    note: 'The fleet as it stands. A coop raises it by '
      + `${M.units.coop600.birds} and a tractor by ${M.units.tractor.birds}.`,
  }],
})

const base = {}
for (const g of groups) for (const it of g.items) base[it.id] = it.value

/* A stamp of the values an overlay was built against. An overlay carrying
   a different stamp was written when a measure said something else, and
   the page says so rather than applying it silently. */
const version = createHash('sha256')
  .update(JSON.stringify(base))
  .digest('hex')
  .slice(0, 12)

const model = {
  version,
  groups,
  steps: eq.steps,
  capacity: M.capacity(),
  fleet: Object.fromEntries(
    Object.entries(M.units).map(([k, v]) => [k, {
      label: v.label, count: M.fleet[k], birds: v.birds ?? null,
    }]),
  ),
}

await mkdir(join(root, 'public'), { recursive: true })
await writeFile(
  join(root, 'public', 'model.json'),
  `${JSON.stringify(model, null, 2)}\n`,
)

console.log('model  → public/model.json')
console.log(
  `       ${groups.reduce((n, g) => n + g.items.length, 0)} values, ` +
    `${eq.steps.length} steps, base ${version}`,
)
