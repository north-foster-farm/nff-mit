// Charts, rendered to SVG at build time from the same data the tables
// read.
//
// Nothing ships to the browser. A chart is markup in the page, so it
// inherits the theme's colors through CSS variables, its labels are real
// text that the site's search can find and a screen reader can announce,
// and it stays sharp in a screenshot or a deck. It also cannot disagree
// with the table beside it, because both are rendered from one array in
// one pass.
//
// d3 does the scale arithmetic. It is a build dependency here and never
// reaches the client.

import { scaleLinear } from 'd3-scale'

const esc = (s) =>
  String(s)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')

/** A rectangle with only its top corners rounded, which is the shape a
 *  bar wants: square where it meets the axis, soft where it does not. */
const barPath = (x, y, w, h, r) => {
  const rad = Math.max(0, Math.min(r, h, w / 2))
  if (!h) return ''
  return [
    `M${x} ${y + h}`,
    `V${y + rad}`,
    `A${rad} ${rad} 0 0 1 ${x + rad} ${y}`,
    `H${x + w - rad}`,
    `A${rad} ${rad} 0 0 1 ${x + w} ${y + rad}`,
    `V${y + h}`,
    'Z',
  ].join(' ')
}

/**
 * A vertical bar chart.
 *
 * bars: [{ label, value, title, muted }]
 *   label  short text under the bar
 *   value  the number the bar height encodes
 *   title  the full sentence a hover or a screen reader gets
 *   muted  drawn as a ghost, for a category that exists at zero
 */
export function barChart(bars, opts = {}) {
  const {
    width = 720,
    height = 210,
    margin = { top: 26, right: 6, bottom: 38, left: 46 },
    format = (n) => `${n}`,
    yLabel = '',
    caption = '',
  } = opts

  const w = width - margin.left - margin.right
  const h = height - margin.top - margin.bottom
  const max = Math.max(...bars.map((b) => b.value), 0)

  const y = scaleLinear().domain([0, max || 1]).nice(4).range([h, 0])
  const ticks = y.ticks(4)

  const step = w / bars.length
  const pad = step * 0.22
  const bw = step - pad * 2

  const out = []
  out.push(
    `<figure class="chart">`,
    `<svg viewBox="0 0 ${width} ${height}" role="img"` +
      (yLabel ? ` aria-label="${esc(yLabel)}"` : '') + `>`,
    `<g transform="translate(${margin.left} ${margin.top})">`,
  )

  // Gridlines first, so every bar sits on top of them.
  for (const t of ticks) {
    out.push(
      `<line class="chart-grid" x1="0" x2="${w}" ` +
        `y1="${y(t).toFixed(1)}" y2="${y(t).toFixed(1)}"/>`,
      `<text class="chart-tick" x="-10" y="${y(t).toFixed(1)}" ` +
        `dy="0.32em" text-anchor="end">${esc(format(t))}</text>`,
    )
  }

  bars.forEach((b, i) => {
    const x = i * step + pad
    const bh = h - y(b.value)
    out.push(`<g class="chart-col${b.muted ? ' is-muted' : ''}">`)
    if (b.title) out.push(`<title>${esc(b.title)}</title>`)
    // A full-height target so the hover area is the column, not the bar.
    out.push(
      `<rect class="chart-hit" x="${(i * step).toFixed(1)}" y="${-margin.top}" ` +
        `width="${step.toFixed(1)}" height="${(h + margin.top).toFixed(1)}"/>`,
    )
    if (bh > 0) {
      out.push(
        `<path class="chart-bar" d="${barPath(x, y(b.value), bw, bh, 4)}"/>`,
        `<text class="chart-value" x="${(x + bw / 2).toFixed(1)}" ` +
          `y="${(y(b.value) - 8).toFixed(1)}" text-anchor="middle">` +
          `${esc(format(b.value))}</text>`,
      )
    } else {
      out.push(
        `<line class="chart-zero" x1="${x.toFixed(1)}" ` +
          `x2="${(x + bw).toFixed(1)}" y1="${h}" y2="${h}"/>`,
      )
    }
    out.push(
      `<text class="chart-label" x="${(x + bw / 2).toFixed(1)}" ` +
        `y="${h + 20}" text-anchor="middle">${esc(b.label)}</text>`,
      `</g>`,
    )
  })

  out.push(`<line class="chart-axis" x1="0" x2="${w}" y1="${h}" y2="${h}"/>`)
  out.push('</g>', '</svg>')
  if (caption) out.push(`<figcaption>${esc(caption)}</figcaption>`)
  out.push('</figure>')
  return out.join('')
}
