import { reactive, computed } from 'vue'
import { runChain } from '../../scripts/chain.mjs'

// The live model's state.
//
// Two layers, kept apart on purpose. The base is what the measures say,
// loaded from the build. The overlay is what somebody typed. Nothing ever
// writes into the base, so "reset" is deleting a key rather than
// remembering an original, and an export carries only what was changed.
//
// That separation is also why an exported scenario ages well. Save a full
// snapshot and re-import it later and you quietly reinstate every figure
// as it was, undoing corrections made since. Save the overrides and the
// corrections flow through underneath them.

const KEY = 'nff.model.overrides.v1'

export const store = reactive({
  loaded: false,
  failed: false,
  base: {},
  overrides: {},
  groups: [],
  steps: [],
  version: null,
  capacity: 0,
  fleet: {},
  openPane: null,
})

/** localStorage is absent in SSR and can throw in a locked-down browser. */
const safe = (fn, fallback = null) => {
  try {
    return fn()
  } catch {
    return fallback
  }
}

const persist = () =>
  safe(() =>
    window.localStorage.setItem(
      KEY,
      JSON.stringify({ version: store.version, overrides: store.overrides }),
    ),
  )

const restore = () => {
  const raw = safe(() => window.localStorage.getItem(KEY))
  if (!raw) return
  const saved = safe(() => JSON.parse(raw))
  if (!saved || typeof saved.overrides !== 'object') return
  // A stale overlay is still applied, because the values somebody typed
  // are still what they meant. The page says the base moved underneath.
  store.overrides = saved.overrides
  store.staleFrom = saved.version !== store.version ? saved.version : null
}

export async function loadModel() {
  if (store.loaded || typeof window === 'undefined') return
  try {
    const res = await fetch('/model.json')
    if (!res.ok) throw new Error(String(res.status))
    const m = await res.json()
    store.groups = m.groups
    store.steps = m.steps
    store.version = m.version
    store.capacity = m.capacity
    store.fleet = m.fleet
    store.base = Object.fromEntries(
      m.groups.flatMap((g) => g.items.map((i) => [i.id, i.value])),
    )
    restore()
    store.loaded = true
  } catch {
    store.failed = true
  }
}

/** Every value the chain needs, overlay on top of base. */
export const values = computed(() => ({ ...store.base, ...store.overrides }))

/** The chain, re-run on every change. */
export const results = computed(() => {
  if (!store.loaded) return {}
  try {
    return runChain(store.steps, values.value)
  } catch {
    return {}
  }
})

/** `id in obj` goes through the proxy's `has` trap, which Vue tracks.
 *  `hasOwnProperty` does not, so a fresh override changed the numbers
 *  without ever showing the mark that says they were changed. */
export const isOverridden = (id) => id in store.overrides

export const setValue = (id, v) => {
  const n = Number(v)
  if (!Number.isFinite(n)) return
  if (n === store.base[id]) {
    delete store.overrides[id]
  } else {
    store.overrides[id] = n
  }
  persist()
}

export const reset = (id) => {
  delete store.overrides[id]
  persist()
}

export const resetAll = () => {
  store.overrides = {}
  store.staleFrom = null
  persist()
}

export const overrideCount = computed(
  () => Object.keys(store.overrides).length,
)

/** An overlay, not a snapshot. See the note at the top of this file. */
export const exportOverlay = () =>
  JSON.stringify(
    { base: store.version, overrides: store.overrides },
    null,
    2,
  )

export const importOverlay = (text) => {
  const parsed = safe(() => JSON.parse(text))
  if (!parsed || typeof parsed.overrides !== 'object') {
    return { ok: false, message: 'That file carries no overrides.' }
  }
  const unknown = Object.keys(parsed.overrides).filter(
    (id) => !(id in store.base),
  )
  store.overrides = Object.fromEntries(
    Object.entries(parsed.overrides).filter(([id]) => id in store.base),
  )
  store.staleFrom = parsed.base !== store.version ? parsed.base : null
  persist()
  return {
    ok: true,
    message: unknown.length
      ? `Applied. ${unknown.length} value${unknown.length > 1 ? 's' : ''} `
        + 'in that file no longer exist and were dropped.'
      : 'Applied.',
  }
}

/* ---------- formatting, shared by every component ---------- */
const commas = (n) => n.toLocaleString('en-US')

export const format = (n, unit) => {
  if (!Number.isFinite(n)) return '—'
  switch (unit) {
    case 'money': return `$${commas(Math.round(n))}`
    case 'cents': return `$${n.toFixed(2)}`
    case 'share': return `${Math.round(n * 100)}%`
    case 'birds': return commas(Math.round(n))
    case 'times': return `${n.toFixed(1)}`
    case 'count': return commas(n)
    default: return commas(Math.round(n * 100) / 100)
  }
}
