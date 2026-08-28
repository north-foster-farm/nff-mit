// The labor arithmetic, in one place.
//
// The article, the dashboard tile and anything that costs a change of
// equipment all need the same answer to "how long is the day". They used
// to each carry their own copy, and the copies disagreed: the dashboard
// filtered on a field the data had stopped using and quietly advertised a
// day thirteen minutes longer than the article did.
//
// So the rules live here and nothing else implements them.

import { readFile } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

/** Minutes as h/min, the way the farm says them. Half minutes survive,
 *  because a per-unit figure of 22.5 rounded to 23 stops reconciling
 *  against the total it was measured from. */
export const mins = (m) => (Number.isInteger(m) ? `${m}` : m.toFixed(1))
export const hm = (m) => {
  const h = Math.floor(m / 60)
  const r = m % 60
  if (!h) return `${mins(r)} min`
  return r ? `${h} h ${r < 10 ? `0${mins(r)}` : mins(r)}` : `${h} h`
}

export async function loadLabor() {
  const raw = await readFile(join(root, 'data', 'labor.json'), 'utf8')
  return laborModel(JSON.parse(raw))
}

export function laborModel(d) {
  const units = d.meta.units

  /** The fleet as it stands. Any caller may pass a different one. */
  const fleet = Object.fromEntries(
    Object.entries(units).map(([k, v]) => [k, v.default]),
  )

  /** A task can depend on a unit it does not scale with. The line purge
   *  is the per-visit cost of running a hose to birds on pasture, so it
   *  is a flat charge while tractors exist and nothing once they do not. */
  const live = (t, f = fleet) => !t.dependsOn || (f[t.dependsOn] ?? 0) > 0

  const countFor = (t, f = fleet) =>
    !live(t, f) ? 0 : t.scalesWith === 'fixed' ? 1 : (f[t.scalesWith] ?? 0)

  /** Minutes that add to the day. Overlap runs alongside other work, so
   *  it is real time and it is not additive. */
  const perUnit = (t) => t.minutes - (t.overlap ?? 0)
  const total = (t, f = fleet) => perUnit(t) * countFor(t, f)
  const elapsed = (t, f = fleet) => t.minutes * countFor(t, f)
  const overlapOf = (t, f = fleet) => (t.overlap ?? 0) * countFor(t, f)

  const tasksIn = (b) => d.tasks.filter((t) => t.block === b.id)
  const blockTotal = (b, f = fleet) =>
    tasksIn(b).reduce((n, t) => n + total(t, f), 0)
  const dayTotal = (f = fleet) =>
    d.blocks.reduce((n, b) => n + blockTotal(b, f), 0)

  /** Blocks that still need somebody to arrive. A block costing nothing
   *  is a visit that no longer happens, which is the only saving that
   *  changes the shape of a day. */
  const liveBlocks = (f = fleet) =>
    d.blocks.filter((b) => blockTotal(b, f) > 0)

  /** Birds that can be on pasture at once, from the units that hold them. */
  const capacity = (f = fleet) =>
    Object.entries(units)
      .filter(([, v]) => v.pasture)
      .reduce((n, [k, v]) => n + (v.birds ?? 0) * (f[k] ?? 0), 0)

  const byEnterprise = (f = fleet) => {
    const out = {}
    for (const t of d.tasks) {
      const k = t.enterprise ?? 'shared'
      out[k] = (out[k] ?? 0) + total(t, f)
    }
    return out
  }

  return {
    d, units, fleet, live, countFor, perUnit, total, elapsed, overlapOf,
    tasksIn, blockTotal, dayTotal, liveBlocks, capacity, byEnterprise,
  }
}
