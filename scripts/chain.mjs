// The derivation chain, evaluated.
//
// Imported by the build, which renders the chain into the equations page,
// and by the browser, which re-runs it whenever somebody moves an input
// on the model page. One implementation, so the live answer and the
// printed answer cannot disagree.
//
// Steps are data rather than expressions. A step names an operation and
// two operands, each of which is either an earlier step or an input, so
// nothing has to parse or evaluate a string.

export const OPS = {
  add: (a, b) => a + b,
  sub: (a, b) => a - b,
  mul: (a, b) => a * b,
  div: (a, b) => (b === 0 ? Infinity : a / b),
}

export const SYMBOL = { add: '+', sub: '−', mul: '×', div: '÷' }

/**
 * Run the chain.
 *
 * steps:  [{ id, label, op, a, b }]
 * values: { D01: 70000, F10: 47.54, ... }
 *
 * Returns a map of every id to its number, inputs included, so a caller
 * can read any step or any input from one object.
 */
export function runChain(steps, values) {
  const out = { ...values }
  for (const s of steps) {
    const fn = OPS[s.op]
    if (!fn) throw new Error(`${s.id}: unknown operation ${s.op}`)
    for (const ref of [s.a, s.b]) {
      if (!(ref in out)) throw new Error(`${s.id}: ${ref} is not defined yet`)
    }
    out[s.id] = fn(out[s.a], out[s.b])
  }
  return out
}

/** The step as it reads on the page: `D01 ÷ D02`. */
export const formula = (s) => `${s.a} ${SYMBOL[s.op]} ${s.b}`
