// The confidence ladder and its decorations, shared by every renderer.
//
// Seven rungs. Marks ride as a superscript to the right of whatever they
// qualify:
//
//   +3        verified
//   +2 −2     assumed, high and low confidence
//   −3        unknown
//   ?         a guess
//   ↱F ↱P     derived rather than observed: forecast, projection
//   ⧉KPI      a measure of how well the plan is being executed
//
// +1 and −1 are deliberately unallocated. The scheme has more slots than
// the ladder uses, which leaves room to add a rung later without
// renumbering the ones above it. Do not invent rungs to fill them.

export const LADDER = [
  'verified',
  'forecast',
  'projected',
  'assumed-high',
  'assumed-low',
  'guess',
  'unknown',
]

export const MARK = {
  verified: '+3',
  forecast: '↱F',
  projected: '↱P',
  'assumed-high': '+2',
  'assumed-low': '−2',
  guess: '?',
  unknown: '−3',
}

export const LABEL = {
  verified: 'Verified',
  forecast: 'Forecast',
  projected: 'Projected',
  'assumed-high': 'Assumed, high confidence',
  'assumed-low': 'Assumed, low confidence',
  guess: 'Guess',
  unknown: 'Unknown',
}

// Examples, not tests. A figure that fits none of these still belongs
// somewhere on the ladder, and the nearest rung wins.
export const NOTE = {
  verified: 'A receipt, an invoice, a document, a citable source.',
  forecast: 'Calculated, and nothing underneath it is assumed.',
  projected: 'Calculated, with one or more assumed inputs.',
  'assumed-high':
    'Partly calculated, or resting on strong first-hand evidence.',
  'assumed-low': 'An industry standard, or a number recalled from memory.',
  guess: 'Low-confidence assumptions stacked, or an unbounded range.',
  unknown: 'No basis at all. A slot with a name and nothing in it.',
}

export const rank = (k) => LADDER.indexOf(k)
export const MAX_RANK = LADDER.length - 1

/** A confidence decoration, as inline HTML for the markdown renderers. */
export const dec = (k) =>
  `<sup class="dec d-${k}" title="${LABEL[k]}">${MARK[k]}</sup>`

/** The KPI decoration. Orthogonal to confidence, so it stacks. */
export const KPI = '<sup class="dec d-kpi" title="Key performance ' +
  'indicator">⧉KPI</sup>'

/** Load, one to five, as a decoration of the same family. */
export const load = (n) =>
  `<sup class="dec d-load" title="Load ${n} of 5">L${n}</sup>`
