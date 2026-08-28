---
prev: { text: 'Figures', link: '/calculations/figures' }
next: { text: 'Capacity options', link: '/calculations/options' }
---

# Equations

The **equations** are five steps from the wage the owners want to the number
of birds that pays it. The chain runs backwards, from the wage the owners
want to the number of birds that pays it. Working forwards tells you what
happens if things go well. Working backwards tells you what has to be true.

They mix three kinds of number. A decision is chosen and can be changed. An
input is estimated and adjustable. A figure is measured on another page and
carries a mark for how far it sits from proof.

## Inputs

| # | Kind | Name | Value |
|---|---|---|---:|
| D01 | Decision | Owner draw | $70,000 |
| D02 | Decision | Owners | 2 |
| I01 | Input | Sell-through | 85% |
| F10 | Figure | [Gross revenue a bird](/calculations/figures)<sup class="dec d-assumed-low" data-tip="Assumed, low confidence" tabindex="0">−2</sup> | $47.54 |
| F20 | Figure | [Cost a bird](/calculations/figures)<sup class="dec d-assumed-low" data-tip="Assumed, low confidence" tabindex="0">−2</sup> | $19.89 |
| F25 | Figure | [Costs paid by the year](/calculations/figures)<sup class="dec d-unknown" data-tip="Unknown" tabindex="0">−3</sup> | $2,190 |

Only the figures carry marks. An input takes none, because a single rung
would say less about it than the sweep further down.

D01. The wage the owners take out of the business in a year. The figure is
provisional. The chain shows what it costs, not whether it is right.

I01. The share of what is raised that is eventually sold. It has never been
measured. Everything raised is paid for whether or not it sells.

## The chain

Every step is a decision, a figure, or the result of a step above it.

| # | Step | From | Result |
|---|---|---|---:|
| E01 | Draw a person | D01 ÷ D02 | $35,000 |
| E02 | Revenue a bird sold | F10 × I01 | $40.41 |
| E03 | [Contribution a bird](/measures/costs) | E02 − F20 | $20.52 |
| E04 | Margin the year must clear | D01 + F25 | $72,190 |
| E05 | Birds required | E04 ÷ E03 | 3,518 |

The bird count is a floor. tax and a capital reserve are both missing from
E04, and no figure the chain cites rests on a document.

## Sell-through

Everything raised is fed and processed whether or not it sells, so the share
that sells changes what a bird contributes without changing what it cost.
Below 42% a bird returns less than it cost, and no volume repairs that.

<figure class="chart"><svg viewBox="0 0 720 230" role="img" aria-label="Birds required against sell-through"><g transform="translate(58 22)"><line class="chart-grid" x1="0" x2="648" y1="168.0" y2="168.0"/><text class="chart-tick" x="-10" y="168.0" dy="0.32em" text-anchor="end">0</text><line class="chart-grid" x1="0" x2="648" y1="134.4" y2="134.4"/><text class="chart-tick" x="-10" y="134.4" dy="0.32em" text-anchor="end">2,000</text><line class="chart-grid" x1="0" x2="648" y1="100.8" y2="100.8"/><text class="chart-tick" x="-10" y="100.8" dy="0.32em" text-anchor="end">4,000</text><line class="chart-grid" x1="0" x2="648" y1="67.2" y2="67.2"/><text class="chart-tick" x="-10" y="67.2" dy="0.32em" text-anchor="end">6,000</text><line class="chart-grid" x1="0" x2="648" y1="33.6" y2="33.6"/><text class="chart-tick" x="-10" y="33.6" dy="0.32em" text-anchor="end">8,000</text><line class="chart-grid" x1="0" x2="648" y1="0.0" y2="0.0"/><text class="chart-tick" x="-10" y="0.0" dy="0.32em" text-anchor="end">10,000</text><text class="chart-label" x="0.0" y="188" text-anchor="middle">60%</text><text class="chart-label" x="81.0" y="188" text-anchor="middle">65%</text><text class="chart-label" x="162.0" y="188" text-anchor="middle">70%</text><text class="chart-label" x="243.0" y="188" text-anchor="middle">75%</text><text class="chart-label" x="324.0" y="188" text-anchor="middle">80%</text><text class="chart-label" x="405.0" y="188" text-anchor="middle">85%</text><text class="chart-label" x="486.0" y="188" text-anchor="middle">90%</text><text class="chart-label" x="567.0" y="188" text-anchor="middle">95%</text><text class="chart-label" x="648.0" y="188" text-anchor="middle">100%</text><line class="chart-mark" x1="405.0" x2="405.0" y1="0" y2="168"/><text class="chart-marklabel" x="405.0" y="-8" text-anchor="middle">85%</text><path class="chart-line" d="M0,27.519C27,38.526,54,49.532,81,57.847C108,66.161,135,71.868,162,77.405C189,82.941,216,87.108,243,91.065C270,95.022,297,98.174,324,101.145C351,104.116,378,106.576,405,108.89C432,111.204,459,113.174,486,115.027C513,116.88,540,118.491,567,120.009C594,121.527,621,122.831,648,124.135"/><g class="chart-pt"><title>60% sell-through. $8.63 a bird, 8,362 birds.</title><circle class="chart-dot" cx="0.0" cy="27.5" r="3.5"/><circle class="chart-hit" cx="0.0" cy="27.5" r="14"/></g><g class="chart-pt"><title>65% sell-through. $11.01 a bird, 6,557 birds.</title><circle class="chart-dot" cx="81.0" cy="57.8" r="3.5"/><circle class="chart-hit" cx="81.0" cy="57.8" r="14"/></g><g class="chart-pt"><title>70% sell-through. $13.39 a bird, 5,393 birds.</title><circle class="chart-dot" cx="162.0" cy="77.4" r="3.5"/><circle class="chart-hit" cx="162.0" cy="77.4" r="14"/></g><g class="chart-pt"><title>75% sell-through. $15.76 a bird, 4,579 birds.</title><circle class="chart-dot" cx="243.0" cy="91.1" r="3.5"/><circle class="chart-hit" cx="243.0" cy="91.1" r="14"/></g><g class="chart-pt"><title>80% sell-through. $18.14 a bird, 3,979 birds.</title><circle class="chart-dot" cx="324.0" cy="101.1" r="3.5"/><circle class="chart-hit" cx="324.0" cy="101.1" r="14"/></g><g class="chart-pt"><title>85% sell-through. $20.52 a bird, 3,518 birds.</title><circle class="chart-dot" cx="405.0" cy="108.9" r="3.5"/><circle class="chart-hit" cx="405.0" cy="108.9" r="14"/></g><g class="chart-pt"><title>90% sell-through. $22.89 a bird, 3,153 birds.</title><circle class="chart-dot" cx="486.0" cy="115.0" r="3.5"/><circle class="chart-hit" cx="486.0" cy="115.0" r="14"/></g><g class="chart-pt"><title>95% sell-through. $25.27 a bird, 2,857 birds.</title><circle class="chart-dot" cx="567.0" cy="120.0" r="3.5"/><circle class="chart-hit" cx="567.0" cy="120.0" r="14"/></g><g class="chart-pt"><title>100% sell-through. $27.65 a bird, 2,611 birds.</title><circle class="chart-dot" cx="648.0" cy="124.1" r="3.5"/><circle class="chart-hit" cx="648.0" cy="124.1" r="14"/></g><line class="chart-axis" x1="0" x2="648" y1="168" y2="168"/></g></svg><figcaption>Birds required, against the share of what is raised that sells</figcaption></figure>

The curve is shallow at the top and steep at the bottom. Between 60% and
100% the answer moves from 8,362 birds to 2,611, and most of that movement
happens in the lower half of the range.

## Against the fleet

The bird count is a demand on the equipment as much as on the market, and
the fleet as it stands holds 300 at a time. Whether the gap between those
two numbers matters depends on how often the pasture turns over in a season,
which nothing in the model settles yet.

## Still open

- Tax and a capital reserve are both missing from the margin the year has to
  clear.
- Debt service enters only if a coop is financed. The [capacity
  options](/calculations/options) carry that arithmetic.
- How many times the pasture turns over in a season is not settled anywhere
  in the model, so the bird count has no batch calendar behind it yet.
- Tax. In a pass-through entity tax is owed on business profit whether or
  not the cash reached anyone, so it cannot be an afterthought. No rate has
  been set.
- Capital reserve. The next coop, the next freezer, the truck when it dies.
  No figure has been set.
