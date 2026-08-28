---
prev: { text: 'Costs', link: '/measures/costs' }
next: { text: 'Capacity options', link: '/calculations/options' }
---

# Calculations

**Calculations** are the machinery between the measures and the model.
They name the counted things, combine them, and turn them into the
choices the argument runs on.

Three kinds of object live here.

| Object | What it is | Example |
|---|---|---|
| Figure | A named value, carrying how far it sits from proof | Feed price per pallet |
| Equation | A formula over figures | Contribution per bird |
| [Option](/calculations/options) | A choice, with a cost and a consequence | A purchase that raises how many birds the farm can hold |

## Options

An option is the one that does not reduce to a number. A figure holds a
value and an equation combines figures, but neither can say that past
some bird count the farm runs out of room, that there are two ways to buy
more, and that the two do opposite things to the working day.

A decision with a discontinuity in it carries four consequences at once:
money spent now, hours spent building, birds the farm can then hold, and
what every day afterward costs.

## Labor effects

An option does not store the fourth of those. It names the equipment it
adds, and the length of the day is then computed from the time study with
that equipment in the fleet.

Storing the effect would mean writing down a second answer to a question
the [labor measure](/measures/labor) already answers. Two answers drift,
and the one nobody updated is the one that gets quoted.
