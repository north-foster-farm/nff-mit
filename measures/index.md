---
prev: false
next: { text: 'Labor', link: '/measures/labor' }
---

# Measures

**Measures** are the datasets everything else is built from. Labor holds
what each farm activity costs in time. Goods holds every product at every
weight band, with its price and its share of production. Costs holds every
expense the business pays.

They are the only place a number is allowed to originate. Everything
downstream cites a measure rather than restating it, so a figure can be
corrected once, where it was taken, and the correction reaches every
equation and every scenario that leans on it.

## Shapes

Each dataset is separate because a row means something different in each
one. A single schema would have to flatten those differences before it
could hold them.

| Dataset | A row is | What it settles |
|---|---|---|
| [Labor](/measures/labor) | An activity, a duration, a scaling rule | What the day costs, and what new equipment does to it |
| [Goods](/measures/goods) | A product at one weight band | Revenue per bird, and the shape of it |
| [Costs](/measures/costs) | A vendor, an amount, a cadence | Which costs scale with the bird and which do not |

The datasets are held together by their job rather than by their
structure. Each one emits figures into the [calculations](/calculations/)
register, and the model cites the register.

## Chore blocks

Labor comes first because more of the model reads it than reads anything
else, and all of it needs labor recorded as blocks rather than as a total.
A [chore block](/measures/labor) is a visit, with an hour at which it must
happen and a person who has to be standing there.

That single object is read three ways.

- The *time study* measures the blocks.
- A *capacity option* transforms them. Automatic feed and water remove the
  reason to arrive at noon.
- The *schedule builder* assigns them to a person and a day.

Recorded as a flat annual figure, labor can answer none of that. Capital
deletes a block or it leaves the block intact, and a total carries nothing
that can be deleted.

## Confidence

Every figure carries a mark showing how far it sits from proof. The scale
runs from a receipt down to a slot with a name and nothing in it, and the
mark travels with the figure wherever it appears, so a number recalled
from memory never passes as a number somebody checked.

Nothing moves up that scale by argument. A figure is promoted when a
document is produced.
