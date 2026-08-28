// Renders data/labor.json into the labor register.
//
// The JSON is the single source of truth. This page, the model's labor
// lines and the schedule builder are three presentations of it, and none
// of them keeps its own copy.

import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { dec, LABEL } from './confidence.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const d = JSON.parse(await readFile(join(root, 'data', 'labor.json'), 'utf8'))
const U = d.meta.units

/** Minutes as h/min, the way the farm says them. */
const hm = (m) => {
  const h = Math.floor(m / 60)
  const r = Math.round(m % 60)
  if (!h) return `${r} min`
  return r ? `${h} h ${String(r).padStart(2, '0')}` : `${h} h`
}

const fleet = Object.fromEntries(
  Object.entries(U).map(([k, v]) => [k, v.default]),
)

/** Unit count for a task, from the fleet. A fixed task is one of one. */
const countFor = (task, f = fleet) =>
  task.scalesWith === 'fixed' ? 1 : (f[task.scalesWith] ?? 0)

const total = (task, f = fleet) => task.minutes * countFor(task, f)
const tasksIn = (b) => d.tasks.filter((t) => t.block === b.id)
const blockTotal = (b, f = fleet) =>
  tasksIn(b)
    .filter((t) => !t.handsOff)
    .reduce((n, t) => n + total(t, f), 0)

const L = []
L.push('# ' + d.meta.title, '', `**${d.meta.subtitle}.**`, '')

const daily = d.blocks.reduce((n, b) => n + blockTotal(b), 0)
const offHands = d.tasks
  .filter((t) => t.handsOff)
  .reduce((n, t) => n + total(t), 0)

L.push(
  `> **${d.blocks.length} time-locked blocks a day, ${hm(daily)} of them**, ` +
    'before market prep, egg washing, processing or maintenance. The floor ' +
    'is not made of minutes; it is made of visits, and a block that shrinks ' +
    'to five minutes still owns the hour it sits in.',
  '',
)
L.push(d.meta.basis, '')

/* ---------- the fleet the page is costed against ---------- */
L.push('## The fleet this is costed against', '')
L.push('| Unit | Count | Birds each |', '|---|---:|---:|')
for (const [k, v] of Object.entries(U)) {
  L.push(`| ${v.label} | ${v.default} | ${v.birds ?? '—'} |`)
}
L.push(
  '',
  'Every duration below is recorded **per unit**, with the count held here',
  'and nowhere else. Change the count and nothing needs re-measuring, which',
  'is the only version of this table that answers the scale question.',
  '',
)

/* ---------- the daily blocks ---------- */
L.push('## The daily blocks', '')
L.push('| Block | Anchor | Duration | Slide |', '|---|---|---:|---|')
for (const b of d.blocks) {
  L.push(
    `| **${b.name}** | ${b.anchor} | ${hm(blockTotal(b))} | ` +
      `${b.slide === 'none' ? 'Locked' : 'Narrow'} |`,
  )
}
L.push(`| | | **${hm(daily)}** | |`, '')
if (offHands) {
  L.push(
    `Plus ${hm(offHands)} of hands-off time, which runs concurrently with`,
    'other work and is therefore not added to the day.',
    '',
  )
}

/* ---------- the week ---------- */
const perWeek = d.tasks
  .filter((t) => !t.handsOff)
  .reduce((n, t) => n + total(t) * (t.daysPerWeek ?? 7), 0)
const absorbed = d.tasks.filter((t) => t.absorbedBy)
const moveDay = d.periodic.find((p) => p.id === 'P01')

L.push('## The same blocks, across a week', '')
L.push(
  `Seven days of blocks is **${hm(perWeek)}**, plus ${hm(moveDay.minutes)} for`,
  'the layer move. The two do not simply add:',
  '',
)
for (const t of absorbed) {
  const p = d.periodic.find((x) => x.id === t.absorbedBy)
  L.push(
    `- **${t.label}** runs ${t.daysPerWeek} mornings, not seven. On the`,
    `  ${p.label.toLowerCase()} it happens inside the move rather than on top`,
    `  of it, which is ${hm(total(t))} that must not be counted twice.`,
    '',
  )
}
L.push(
  `Daily totals are unaffected — an ordinary morning is still ${hm(blockTotal(d.blocks[0]))}.`,
  'The correction lands in the weekly and annual roll-ups, which is exactly',
  'where a double count would otherwise have gone unnoticed.',
  '',
)

/* ---------- the decomposition ---------- */
L.push('## What is inside each block', '')
for (const b of d.blocks) {
  const ts = tasksIn(b)
  if (!ts.length) continue
  L.push(`### ${b.name}`, '')
  if (b.note) L.push(`*${b.note}*`, '')
  L.push(
    '| # | Task | Per unit | Scales with | Count | Total |',
    '|---|---|---:|---|---:|---:|',
  )
  for (const t of ts) {
    const n = countFor(t)
    const scale = t.scalesWith === 'fixed'
      ? 'Nothing'
      : U[t.scalesWith]?.label ?? t.scalesWith
    const flag = t.handsOff
      ? ' *(hands-off)*'
      : t.absorbedBy
        ? ` *(${t.daysPerWeek}/7)*`
        : ''
    L.push(
      `| ${t.id} | ${t.label}${dec(t.confidence)}${flag} | ${hm(t.minutes)} | ` +
        `${scale} | ${n} | ${t.handsOff ? '—' : hm(total(t))} |`,
    )
  }
  L.push('')
  for (const t of ts) {
    if (t.steps?.length) {
      L.push(
        `**${t.label}**, ${hm(t.minutes)} per unit: ` +
          t.steps.map((s) => `${s.label.toLowerCase()} ${s.minutes}`).join(', ') +
          '.',
        '',
      )
    }
    if (t.note) L.push(`> ${t.note}`, '')
  }
}

/* ---------- what does not scale ---------- */
const undecomposed = d.tasks.filter((t) => t.confidence === 'unknown')
if (undecomposed.length) {
  L.push('## The part that cannot yet be scaled', '')
  L.push(
    `${undecomposed.length} of ${d.blocks.length} daily blocks have never`,
    'been broken into per-unit lines. They carry a duration and nothing',
    'else, so they cannot be attributed between broilers and layers, and',
    'they do not respond to a change of fleet. **Between them they are',
    `${hm(undecomposed.reduce((n, t) => n + total(t), 0))} of the ` +
      `${hm(daily)} day.**`,
    '',
  )
  L.push('| # | Block | Duration |', '|---|---|---:|')
  for (const t of undecomposed) {
    const b = d.blocks.find((x) => x.id === t.block)
    L.push(`| ${t.id} | ${b?.name ?? t.block} | ${hm(t.minutes)} |`)
  }
  L.push('')
}

/* ---------- periodic ---------- */
L.push('## Weekly, per batch, and per season', '')
L.push('| # | Activity | Figure | Cadence | Who |', '|---|---|---:|---|---|')
for (const p of d.periodic) {
  L.push(
    `| ${p.id} | ${p.label}${dec(p.confidence)} | ${hm(p.minutes)} | ` +
      `${p.cadence} | ${p.who} |`,
  )
}
L.push('')
for (const p of d.periodic) if (p.note) L.push(`**${p.label}.** ${p.note}`, '')

/* ---------- locks ---------- */
L.push('## What is locked before anyone chooses anything', '')
L.push(
  'A day off is not a day with no work. It is a day where every block',
  "carries the other person's name. With",
  `${d.blocks.length} blocks a day, that is **${d.blocks.length * 7} blocks`,
  'a week, every one needing a name on it** — and four of them are settled',
  'before the week is planned.',
  '',
)
L.push('| # | When | Whose | Because |', '|---|---|---|---|')
for (const k of d.locks) {
  L.push(`| ${k.id} | ${k.day}, ${k.block} | ${k.who} | ${k.because} |`)
}
L.push(
  '',
  '**Both days off must therefore be weekdays.** There are five, one is the',
  'layer move, and four remain against four needs: James\' day off, Jim\'s',
  'day off, and two consecutive desk days. Zero slack, before an hour of',
  'maintenance, demand generation or CSA build has been placed anywhere.',
  '',
)

/* ---------- conventions ---------- */
L.push('## Conventions', '')
for (const c of d.meta.conventions) L.push(`- ${c}`, '')

/* ---------- blank ---------- */
L.push('## What is still blank', '')
for (const b of d.blank) L.push(`- ${b}`, '')
L.push('', `*Source: ${d.meta.source}.*`, '')

await mkdir(join(root, 'measures'), { recursive: true })
await writeFile(join(root, 'measures', 'labor.md'), L.join('\n'))

console.log(`labor  → measures/labor.md`)
console.log(
  `       ${d.blocks.length} blocks, ${d.tasks.length} tasks, ` +
    `${d.periodic.length} periodic, ${hm(daily)} a day`,
)
