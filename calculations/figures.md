---
prev: { text: 'Calculations', link: '/calculations/' }
next: { text: 'Equations', link: '/calculations/equations' }
---

# Figures

**Figures** are the values the model is allowed to cite. Every figure is
read from a measure or computed from one, so this register holds nothing of
its own and nothing can be corrected on it. A figure changes where it was
measured.

Each figure carries a mark for how far it sits from proof. A figure computed
from more than one measured value takes the worst mark among them, because
arithmetic does not improve evidence. Where a measure rates all of its own
figures together, that rating carries.

## Labor

| # | Figure | Value |
|---|---|---:|
| F01 | [Chore time, an ordinary day](/measures/labor)<sup class="dec d-assumed-low" data-tip="Assumed, low confidence" tabindex="0">−2</sup> | 5 h 32 |
| F02 | [Chore time, a week](/measures/labor)<sup class="dec d-assumed-low" data-tip="Assumed, low confidence" tabindex="0">−2</sup> | 41 h |
| F03 | [Move day](/measures/labor)<sup class="dec d-assumed-low" data-tip="Assumed, low confidence" tabindex="0">−2</sup> | 7 h 48 |
| F04 | [Layer share of the day](/measures/labor)<sup class="dec d-assumed-high" data-tip="Assumed, high confidence" tabindex="0">+2</sup> | 1 h 32 |
| F05 | [Broiler share of the day](/measures/labor)<sup class="dec d-assumed-low" data-tip="Assumed, low confidence" tabindex="0">−2</sup> | 3 h 55 |
| F06 | [One more tractor, a day](/measures/labor)<sup class="dec d-assumed-low" data-tip="Assumed, low confidence" tabindex="0">−2</sup> | 33.5 min |
| F07 | [One more coop, a day](/measures/labor)<sup class="dec d-assumed-low" data-tip="Assumed, low confidence" tabindex="0">−2</sup> | 30 min |

## Goods

| # | Figure | Value |
|---|---|---:|
| F10 | [Gross revenue a bird](/measures/goods)<sup class="dec d-assumed-low" data-tip="Assumed, low confidence" tabindex="0">−2</sup> | $47.54 |
| F11 | [Packs a bird](/measures/goods)<sup class="dec d-assumed-low" data-tip="Assumed, low confidence" tabindex="0">−2</sup> | 2.14 |
| F12 | [Carcass weight](/measures/goods)<sup class="dec d-assumed-low" data-tip="Assumed, low confidence" tabindex="0">−2</sup> | 4.25 lb |
| F13 | [Weight spread](/measures/goods)<sup class="dec d-assumed-low" data-tip="Assumed, low confidence" tabindex="0">−2</sup> | 12% |

F10. The figure is gross, before sell-through.

## Costs

| # | Figure | Value |
|---|---|---:|
| F20 | [Cost a bird](/measures/costs)<sup class="dec d-assumed-low" data-tip="Assumed, low confidence" tabindex="0">−2</sup> | $19.89 |
| F22 | [Feed, broiler mash](/measures/costs)<sup class="dec d-verified" data-tip="Verified" tabindex="0">+3</sup> | $0.4206 a lb |
| F23 | [Chick, delivered](/measures/costs)<sup class="dec d-verified" data-tip="Verified" tabindex="0">+3</sup> | $2.20 |
| F24 | [Processing a bird](/measures/costs)<sup class="dec d-verified" data-tip="Verified" tabindex="0">+3</sup> | $11.38 |
| F25 | [Costs paid by the year](/measures/costs)<sup class="dec d-unknown" data-tip="Unknown" tabindex="0">−3</sup> | $2,190 |

F25. The total is a floor, because 3 of the 6 yearly lines carry no figure.

## Options

| # | Figure | Value |
|---|---|---:|
| F30 | [Salatin tractor, capital](/calculations/options)<sup class="dec d-assumed-low" data-tip="Assumed, low confidence" tabindex="0">−2</sup> | $1,163 |
| F31 | [Model 600, capital](/calculations/options)<sup class="dec d-assumed-low" data-tip="Assumed, low confidence" tabindex="0">−2</sup> | $28,150 |
| F32 | [Borrowing rate](/calculations/options)<sup class="dec d-verified" data-tip="Verified" tabindex="0">+3</sup> | 5.25% |

F32. FSA direct Farm Operating, read in August 2026.

## Spread of the marks

Verification is not spread evenly. Every figure resting on a document is
something the farm pays. Nothing it earns is evidenced by one.

| Mark | Rung | Figures |
|---|---|---:|
| <sup class="dec d-verified" data-tip="Verified" tabindex="0">+3</sup> | Verified | 4 |
| <sup class="dec d-assumed-high" data-tip="Assumed, high confidence" tabindex="0">+2</sup> | Assumed, high confidence | 1 |
| <sup class="dec d-assumed-low" data-tip="Assumed, low confidence" tabindex="0">−2</sup> | Assumed, low confidence | 13 |
| <sup class="dec d-unknown" data-tip="Unknown" tabindex="0">−3</sup> | Unknown | 1 |
|  | **Total** | **19** |

## What carries the weight

Three figures carry the derivation. An error in any of them moves the number
of birds the farm has to raise, while an error elsewhere moves a detail.

| # | Figure | Value | Decides | How it enters |
|---|---|---:|---|---|
| F10 | Gross revenue a bird<sup class="dec d-assumed-low" data-tip="Assumed, low confidence" tabindex="0">−2</sup> | $47.54 | What a bird earns | multiplied by the bird count |
| F20 | Cost a bird<sup class="dec d-assumed-low" data-tip="Assumed, low confidence" tabindex="0">−2</sup> | $19.89 | What a bird costs | subtracted from what it earns |
| F25 | Costs paid by the year<sup class="dec d-unknown" data-tip="Unknown" tabindex="0">−3</sup> | $2,190 | What the year costs before anyone is paid | added on top of what the birds have to cover |

None of them rests on a document. Precision downstream cannot repair that.
