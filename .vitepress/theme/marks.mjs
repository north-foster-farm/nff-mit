// The confidence marks, for the client.
//
// scripts/confidence.mjs is the source and the build imports it directly.
// This mirrors only the two maps a component needs, because the build
// module also pulls in Node paths the browser has no use for.

export const MARK = {
  verified: '+3',
  forecast: 'F',
  projected: 'P',
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

export const dec = (k) =>
  MARK[k]
    ? `<sup class="dec d-${k}" data-tip="${LABEL[k]}" tabindex="0">`
      + `${MARK[k]}</sup>`
    : ''
