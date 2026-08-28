---
prev: { text: 'Capacity options', link: '/calculations/options' }
next: false
---

# Model

The **model** is the derivation behind North Foster Farm's 2027 plan. It
runs from the wage the owners want back to the number of birds that pays
it, and every value in it can be changed to see what moves.

Every figure is read from the register the model loads, so changing one
changes the sentences that cite it.

## What the owners take

The draw is where the chain starts, because it is the figure the plan
exists to reach. The <Fig id="D02" /> owners take <Fig id="D01" /> between
them. It is a decision rather than a measurement, and it is provisional.
The chain prices it.

<Modify group="decisions" label="Modify the decisions" />

## What a bird is worth

A bird earns <Fig id="F10" /> if everything it becomes is sold, and not
everything is. Sell-through, the share that sells, is <Fig id="I01" />, so
the revenue that arrives is <Fig id="E02" />.

Against that, raising the bird costs <Fig id="F20" />, and it costs that
whether or not the meat leaves the freezer. What remains is the
contribution each bird makes toward the bills that arrive regardless.

Sell-through has never been measured, and the
[equations](/calculations/equations) page sweeps it.

<Modify group="inputs" label="Modify sell-through" />

## What the year costs

Before anyone draws anything, the year has its own bills, and those come
to <Fig id="F25" /> so far. That total is incomplete: lines on the
[costs](/measures/costs) page carry no figure at all, and neither tax nor
a capital reserve has been set.

<Modify group="figures" label="Modify the figures" />

## Birds required

<Chain />

That count is a floor, for the same reasons the margin above it is. No
figure the chain cites rests on a document.

## Against the equipment

A bird count is a demand on the equipment as much as on the market. The
fleet holds <Fig id="CAP" /> at a time, so reaching the count above means
filling and emptying it <Fig id="E06" /> times in a season.

Whether that is a batch calendar or a wall is the question the
[capacity options](/calculations/options) answer, and raising what the
fleet holds is what they buy. Move the fleet and watch the last row.

<Modify group="fleet" label="Modify the fleet" />
