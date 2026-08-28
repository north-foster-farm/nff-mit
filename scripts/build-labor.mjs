// Renders data/labor.json into the labor article.
//
// The JSON is the single source of truth. This article, the model's labor
// lines and the schedule builder are three presentations of it, and none
// of them keeps its own copy.
//
// No figure is typed into the prose. Every one is read from the data or
// derived from it, so a sentence cannot contradict the table beneath it.
// Any count that appears in a sentence must come through a template hole.
//
// Table convention, applied everywhere: a header row naming every column,
// and a total row whose first cell says what is being totalled.

import { writeFile, mkdir } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { dec } from './confidence.mjs'
import { loadLabor, hm } from './labor-model.mjs'
import { emitter, R, Ln, nav } from './markdown.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const M = await loadLabor()
const d = M.d
const U = M.units
const E = d.meta.enterprises
const W = d.meta.week

const WORDS = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven',
  'eight', 'nine', 'ten']
const say = (n) => WORDS[n] ?? String(n)
const Say = (n) => say(n)[0].toUpperCase() + say(n).slice(1)

const { P, LI, table, push, text } = emitter()

const { fleet, countFor, total, elapsed, overlapOf, tasksIn, blockTotal } = M

const daily = M.dayTotal()
const purges = d.tasks.filter((t) => t.purge)
const lockedBlocks = d.blocks.filter((b) => b.slide === 'none')

/* ---------- move day ---------- */
const stepCount = (s, f = fleet) =>
  s.scalesWith === 'fixed' ? 1 : (f[s.scalesWith] ?? 0)

/** Instances that add to the day. An absorbed step happens inside another
 *  one, so it is real work that must not be counted a second time. */
const stepBilled = (s, f = fleet) => {
  const n = stepCount(s, f)
  return s.absorbedBy ? Math.min(s.absorbedExcept ?? 0, n) : n
}
const billed = (s, f = fleet) => s.minutes * stepBilled(s, f)
const swallowed = (s, f = fleet) =>
  s.minutes * (stepCount(s, f) - stepBilled(s, f))
const sum = (xs, fn) => xs.reduce((n, x) => n + fn(x), 0)

const moveDay = d.periodic.find((p) => p.id === 'P01')
const steps = (moveDay.phases ?? []).flatMap((ph) => ph.steps)

const choresOnMoveDay =
  daily -
  d.tasks
    .filter((t) => t.absorbedBy === moveDay.id)
    .reduce((n, t) => n + total(t), 0)

const moveWork = sum(steps, (s) => billed(s))
const moveDayTotal = choresOnMoveDay + moveWork

const plusOne = { ...fleet, layerCoop: fleet.layerCoop + 1 }
const marginal = Math.round(
  sum(steps, (s) => billed(s, plusOne)) - sum(steps, (s) => billed(s)),
)

const perWeek = d.tasks.reduce(
  (n, t) => n + total(t) * (t.daysPerWeek ?? 7), 0,
)
const weekTotal = perWeek + moveWork
const absorbedTasks = d.tasks.filter((t) => t.absorbedBy)
const absorbedSteps = steps.filter((s) => swallowed(s))

/* Weekdays left once the move takes one. The needs against them are
   named in the prose, so the count has to come from the data. */
const moveWeekdays = d.locks.filter((k) => k.day === 'One weekday').length
const freeWeekdays = W.weekdays - moveWeekdays

/* ---------- front matter and lead ---------- */
push(...nav(d.meta.nav))
push('# Labor', '')

P(`**Labor** is the time the farm costs to run. It is recorded as chore
blocks rather than as a total number of hours, because the limit that
binds is how many separate times a day somebody has to be standing in a
particular place.`)

P(`A chore block is one of those times. Each block has an hour at which it
must happen, a length that grows with the number of coops or tractors, and
a person who has to be there. Shortening a block saves time inside the
block. The block still has to be covered, and the shape of the day is
unchanged.`)

/* ---------- daily blocks ---------- */
push('## Daily blocks', '')
P(`A market departure and sundown fix ${say(lockedBlocks.length)} of the
blocks, so an ordinary day cannot be rearranged freely.`)
table(
  ['Block', 'Anchor', 'Length', 'Can it slide'],
  [Ln, Ln, R, Ln],
  d.blocks.map((b) => [
    b.name, b.anchor, hm(blockTotal(b)),
    b.slide === 'none' ? 'No' : 'A little',
  ]),
  ['**Day**', '', `**${hm(daily)}**`, ''],
)

/* ---------- the purge ---------- */
push('## Line purge', '')
P(`The line purge is the wait for standing water to clear before the birds
can drink. Water in a long hose run holds heat, the wait comes at every
pasture visit, and it does not go away without a buried line.`)
P(`What changes across the day is how much of that wait can be spent on
something else.`)
table(
  ['Block', 'Wait', 'Overlapped', 'Counted', 'What overlaps it'],
  [Ln, R, R, R, Ln],
  purges.map((t) => {
    const b = d.blocks.find((x) => x.id === t.block)
    return [
      b.name, hm(elapsed(t)), hm(overlapOf(t)), hm(total(t)),
      t.overlapNote ?? '',
    ]
  }),
  [
    '**Total**',
    `**${hm(sum(purges, (t) => elapsed(t)))}**`,
    `**${hm(sum(purges, (t) => overlapOf(t)))}**`,
    `**${hm(sum(purges, (t) => total(t)))}**`,
    '',
  ],
)
P(`Only the counted column reaches the day. The rest is real time that a
buried line would return.`)

/* ---------- coops ---------- */
push('## Units', '')
P(`Durations are measured against a single unit, and the counts are kept
here rather than folded into the times.`)
table(
  ['Unit', 'Count', 'Birds each'],
  [Ln, R, R],
  Object.values(U).map((v) => [v.label, v.default, v.birds ?? 'n/a']),
)
P(`Holding the two apart is what lets a change of equipment re-cost the
whole day. Add a tractor and the morning grows by one round. Replace the
tractors with a coop that holds ${U.coop600.birds} birds and the round is
rewritten instead of multiplied.`)

/* ---------- inside the blocks ---------- */
push('## Inside the blocks', '')
P(`Every block breaks down into tasks, and each task names the thing it
scales with. The count column reads from the table above.`)
for (const b of d.blocks) {
  const ts = tasksIn(b)
  if (!ts.length) continue
  push(`### ${b.name}`, '')
  if (b.note) P(b.note)
  table(
    ['Task', 'Per unit', 'Scales with', 'Count', 'Total'],
    [Ln, R, Ln, R, R],
    ts.map((t) => {
      const scale = t.scalesWith === 'fixed'
        ? 'Nothing'
        : U[t.scalesWith]?.label ?? t.scalesWith
      const flag = t.overlap
        ? ` *(${hm(overlapOf(t))} overlapped)*`
        : t.absorbedBy ? ` *(${say(t.daysPerWeek)} days)*` : ''
      return [
        `${t.label}${dec(t.confidence)}${flag}`, hm(t.minutes), scale,
        countFor(t), hm(total(t)),
      ]
    }),
    ['**Block**', '', '', '', `**${hm(blockTotal(b))}**`],
  )
  for (const t of ts) {
    if (t.steps?.length) {
      P(`The ${t.label.toLowerCase()} breaks down further.`)
      for (const s of t.steps) LI(`${s.label}, ${hm(s.minutes)}.`)
      push('')
    }
    if (t.note) P(t.note)
  }
}

/* ---------- enterprise split ---------- */
const byEnt = {}
for (const t of d.tasks) {
  const k = t.enterprise ?? 'shared'
  byEnt[k] = (byEnt[k] ?? 0) + total(t)
}
/** Shares must sum to 100, so the largest absorbs the rounding. */
const entRows = Object.entries(E).filter(([k]) => byEnt[k])
const shares = entRows.map(([k]) => Math.round((byEnt[k] / daily) * 100))
const biggest = shares.indexOf(Math.max(...shares))
shares[biggest] += 100 - shares.reduce((a, b) => a + b, 0)

push('## Broilers and layers', '')
P(`Because every task names an enterprise, the day divides between
broilers and layers. The split shows what the laying flock costs on an
ordinary day, before a single egg is washed.`)
table(
  ['Enterprise', 'Daily', 'Share'],
  [Ln, R, R],
  entRows.map(([k, label], i) => [label, hm(byEnt[k]), `${shares[i]}%`]),
  ['**Day**', `**${hm(daily)}**`, ''],
)
P(`Egg washing and the annual collection figure sit outside this table,
because they are counted once a year rather than inside a block.`)

/* ---------- weekly ---------- */
push('## Weekly load', '')
P(`A week of blocks comes to ${hm(weekTotal)}, and its days are not
identical. ${Say(moveWeekdays)} weekday carries the layer move, which
swallows work that would otherwise stand on its own.`)
P(`Work that happens inside other work is absorbed, and it is counted
once.`)
for (const t of absorbedTasks) {
  const p = d.periodic.find((x) => x.id === t.absorbedBy)
  P(`The ${t.label.toLowerCase()} runs ${say(t.daysPerWeek)} mornings
instead of ${say(7)}. On the ${p.label.toLowerCase()} it happens inside the
move, which is ${hm(total(t))} that must not be counted twice.`)
}
P(`An ordinary day is untouched. Absorption changes the weekly and annual
roll-ups, where a double count would otherwise go unnoticed.`)

/* ---------- move day ---------- */
push('## Move day', '')
P(`Move day is the longest day in an ordinary week. The coops are towed to
fresh grass, the fence goes with them, and the waterers are washed and
sanitized.`)
for (const ph of moveDay.phases) {
  push(`### ${ph.label}`, '')
  table(
    ['Step', 'Per unit', 'Units', 'Counted', 'Absorbed'],
    [Ln, R, R, R, R],
    ph.steps.map((s) => {
      const a = swallowed(s)
      return [
        s.label, hm(s.minutes), stepCount(s),
        billed(s) ? hm(billed(s)) : 'n/a', a ? hm(a) : 'n/a',
      ]
    }),
    [
      `**${ph.label}**`, '', '',
      `**${hm(sum(ph.steps, (s) => billed(s)))}**`, '',
    ],
  )
  for (const s of ph.steps) if (s.note) P(`**${s.label}.** ${s.note}`)
}
push('### Day total', '')
table(
  ['Part', 'Time'],
  [Ln, R],
  [
    ['Ordinary chores, less what the move absorbs', hm(choresOnMoveDay)],
    ['Move, wash and sanitize', hm(moveWork)],
  ],
  ['**Move day**', `**${hm(moveDayTotal)}**`],
)

if (absorbedSteps.length) {
  P(`${hm(sum(absorbedSteps, (s) => swallowed(s)))} of the move is absorbed,
because these steps happen inside another one rather than after it.`)
  for (const s of absorbedSteps) {
    const into = steps.find((x) => x.id === s.absorbedBy)
    LI(`${s.label}, inside ${into?.label.toLowerCase()}.`)
  }
  push('')
}
P(`A third layer coop would add ${hm(marginal)} to move day.`)

/* ---------- periodic ---------- */
push('## Periodic work', '')
P(`The rest of the work arrives on its own schedule rather than daily.`)
table(
  ['Activity', 'Figure', 'Cadence', 'Who'],
  [Ln, R, Ln, Ln],
  d.periodic.map((p) => {
    const m = p.id === 'P01'
      ? hm(moveDayTotal)
      : p.id === 'P02' ? hm(marginal) : hm(p.minutes)
    return [`${p.label}${dec(p.confidence)}`, m, p.cadence, p.who]
  }),
)
for (const p of d.periodic) {
  if (p.note && p.id !== 'P01') P(`**${p.label}.** ${p.note}`)
}

/* ---------- locks ---------- */
push('## Locked blocks', '')
P(`Some blocks are settled before anyone sits down to plan a week. On a
day off every block carries the other person's name, and there are
${d.blocks.length * 7} blocks in a week to name.`)
table(
  ['When', 'Whose', 'Because'],
  [Ln, Ln, Ln],
  d.locks.map((k) => [`${k.day}, ${k.block}`, k.who, k.because]),
)
P(`Both days off have to fall on weekdays, because the weekend mornings
are already assigned. The layer move takes one of the
${say(W.weekdays)}, which leaves ${say(freeWeekdays)} to carry James' day
off, Jim's day off, and two consecutive desk days.`)

/* ---------- conventions ---------- */
push('## Conventions', '')
P(d.meta.basis)
for (const c of d.meta.conventions) LI(c)
push('')

/* ---------- blank ---------- */
push('## Still blank', '')
for (const b of d.blank) LI(b)
push('')

await mkdir(join(root, 'measures'), { recursive: true })
await writeFile(join(root, 'measures', 'labor.md'), text())

const ent = Object.entries(byEnt).map(([k, m]) => `${k} ${hm(m)}`).join(', ')
console.log('labor  → measures/labor.md')
console.log(
  `       ${d.blocks.length} blocks, ${d.tasks.length} tasks, ` +
    `${d.periodic.length} periodic`,
)
console.log(`       ${hm(daily)} a day (${ent}), ${hm(weekTotal)} a week`)
