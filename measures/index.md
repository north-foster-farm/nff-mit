# Measures

Three datasets, one row per thing. Labor is the time every farm activity
takes. Goods is every SKU at every weight band, with its price and its
share of production. Costs is every expense the business pays.

They are separate because they are shaped differently — a labor row is an
activity, a duration and a scaling rule; a goods row is a SKU, a band, a
price and a share; a cost row is a vendor, an amount and a cadence. What
they share is what they are for: **each one emits figures into the
[calculations](/calculations/) register**, and the model cites the
register rather than citing any of these directly.

That indirection is deliberate. It means a number can be corrected once,
where it was measured, and every equation, scenario and slide that leans
on it moves with it.

| Dataset | Rows | What it settles |
|---|---|---|
| [Labor](/measures/labor) | Chore blocks, tasks, periodic work | What the day costs, and what a change of fleet does to it |
| [Goods](/measures/goods) | SKU × weight band | Revenue per bird, and the shape of it |
| [Costs](/measures/costs) | Expenses | COGS against overhead, and the stack above the draw |

## The chore block is the shared object

Labor is first among the three because two other things read it.

A chore block is not an hours total. It is a named visit with a time it
must happen, a duration that scales with something, and a person who has
to be standing there. Capital does not reduce a block by a percentage —
it **deletes the block, or it doesn't**. Automatic feed and water do not
make the noon visit shorter; they remove the reason to arrive.

So the same object is read three ways: the time study measures it, a
capacity option transforms it, and the schedule builder assigns it to a
person and a day. Record labor as a flat annual figure and the first two
become impossible.
