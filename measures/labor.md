---
prev: { text: 'Measures', link: '/measures/' }
next: { text: 'Goods', link: '/measures/goods' }
---

# Labor

**Labor** is the time the farm costs to run. It is recorded as chore blocks
rather than as a total number of hours, because the limit that binds is how
many separate times a day somebody has to be standing in a particular place.

A chore block is one of those times. Each block has an hour at which it must
happen, a length that grows with the number of coops or tractors, and a
person who has to be there. Shortening a block saves time inside the block.
The block still has to be covered, and the shape of the day is unchanged.

## Daily blocks

A market departure and sundown fix two of the blocks, so an ordinary day
cannot be rearranged freely.

| Block | Anchor | Length | Can it slide |
|---|---|---:|---|
| Morning | 07:00 | 2 h 57 | No |
| Noon | 12:00 | 45 min | A little |
| Afternoon | 15:00 | 1 h 12.5 | A little |
| Closing | dark | 37.5 min | No |
| **Day** |  | **5 h 32** |  |

## Line purge

The line purge is the wait for standing water to clear before the birds can
drink. Water in a long hose run holds heat, the wait comes at every pasture
visit, and it does not go away without a buried line.

What changes across the day is how much of that wait can be spent on
something else.

| Block | Wait | Overlapped | Counted | What overlaps it |
|---|---:|---:|---:|---|
| Morning | 10 min | 10 min | 0 min | The feeding and the tractor moves run alongside it. |
| Noon | 10 min | 0 min | 10 min | Nothing else is in hand, so the wait is the whole of it. |
| Afternoon | 10 min | 2.5 min | 7.5 min | Some feed can be topped off during the wait, but most of it is still waiting. |
| Closing | 10 min | 0 min | 10 min | Nothing runs alongside it at this hour. |
| **Total** | **40 min** | **12.5 min** | **27.5 min** |  |

Only the counted column reaches the day. The rest is real time that a buried
line would return.

## Units

Durations are measured against a single unit, and the counts are kept here
rather than folded into the times.

| Unit | Count | Birds each |
|---|---:|---:|
| Salatin tractor | 5 | 60 |
| Model 600 | 0 | 900 |
| Layer coop | 2 | n/a |
| Brooder | 1 | 900 |

Holding the two apart is what lets a change of equipment re-cost the whole
day. Add a tractor and the morning grows by one round. Replace the tractors
with a coop that holds 900 birds and the round is rewritten instead of
multiplied.

## Inside the blocks

Every block breaks down into tasks, and each task names the thing it scales
with. The count column reads from the table above.

### Morning

| Task | Per unit | Scales with | Count | Total |
|---|---:|---|---:|---:|
| Brooder check<sup class="dec d-assumed-high" data-tip="Assumed, high confidence" tabindex="0">+2</sup> | 15 min | Brooder | 1 | 15 min |
| Layer coop round<sup class="dec d-assumed-high" data-tip="Assumed, high confidence" tabindex="0">+2</sup> *(six days)* | 16 min | Layer coop | 2 | 32 min |
| Broiler tractor round<sup class="dec d-assumed-high" data-tip="Assumed, high confidence" tabindex="0">+2</sup> | 25 min | Salatin tractor | 5 | 2 h 05 |
| Electric fence<sup class="dec d-assumed-high" data-tip="Assumed, high confidence" tabindex="0">+2</sup> | 5 min | Nothing | 1 | 5 min |
| Model 600 move<sup class="dec d-assumed-low" data-tip="Assumed, low confidence" tabindex="0">−2</sup> | 30 min | Model 600 | 0 | 0 min |
| Line purge<sup class="dec d-assumed-high" data-tip="Assumed, high confidence" tabindex="0">+2</sup> *(10 min overlapped)* | 10 min | Nothing | 1 | 0 min |
| **Block** |  |  |  | **2 h 57** |

The broiler tractor round breaks down further.

- Prep, 10 min.
- Move, 5 min.
- Fill feeders, 5 min.
- Refill water bucket, 5 min.

The observed morning runs shorter than this, because one tractor is
undersized and is quicker to fill and move. The modeled figure is the one
that projects.

The move replaces the tractor round rather than shortening it. A coop
carries its own feed and water, so nothing else in the day is spent on the
birds it holds.

### Noon

Broilers are checked at every pasture visit, because they drink fast enough
that a missed check matters.

| Task | Per unit | Scales with | Count | Total |
|---|---:|---|---:|---:|
| Egg collection<sup class="dec d-assumed-high" data-tip="Assumed, high confidence" tabindex="0">+2</sup> | 10 min | Layer coop | 2 | 20 min |
| Broiler water top-off<sup class="dec d-assumed-low" data-tip="Assumed, low confidence" tabindex="0">−2</sup> | 15 min | Nothing | 1 | 15 min |
| Line purge<sup class="dec d-assumed-high" data-tip="Assumed, high confidence" tabindex="0">+2</sup> | 10 min | Nothing | 1 | 10 min |
| **Block** |  |  |  | **45 min** |

The top-off was recorded as a range, and it is carried at the top of that
range.

### Afternoon

The afternoon block starts between 3:00 and 3:30 pm.

| Task | Per unit | Scales with | Count | Total |
|---|---:|---|---:|---:|
| Broiler water<sup class="dec d-assumed-high" data-tip="Assumed, high confidence" tabindex="0">+2</sup> | 10 min | Nothing | 1 | 10 min |
| Layer water<sup class="dec d-assumed-high" data-tip="Assumed, high confidence" tabindex="0">+2</sup> | 10 min | Nothing | 1 | 10 min |
| Egg collection<sup class="dec d-assumed-high" data-tip="Assumed, high confidence" tabindex="0">+2</sup> | 10 min | Layer coop | 2 | 20 min |
| Broiler feed top-off<sup class="dec d-assumed-high" data-tip="Assumed, high confidence" tabindex="0">+2</sup> | 5 min | Salatin tractor | 5 | 25 min |
| Line purge<sup class="dec d-assumed-high" data-tip="Assumed, high confidence" tabindex="0">+2</sup> *(2.5 min overlapped)* | 10 min | Nothing | 1 | 7.5 min |
| **Block** |  |  |  | **1 h 12.5** |

Raising the perches in the nest boxes runs concurrently with the collection.

### Closing

The closing block falls between 8:30 and 9:00 pm in summer, and it moves
with the light.

| Task | Per unit | Scales with | Count | Total |
|---|---:|---|---:|---:|
| Line purge<sup class="dec d-assumed-high" data-tip="Assumed, high confidence" tabindex="0">+2</sup> | 10 min | Nothing | 1 | 10 min |
| Broiler water<sup class="dec d-assumed-high" data-tip="Assumed, high confidence" tabindex="0">+2</sup> | 3.5 min | Salatin tractor | 5 | 17.5 min |
| Close layer coops<sup class="dec d-assumed-high" data-tip="Assumed, high confidence" tabindex="0">+2</sup> | 10 min | Nothing | 1 | 10 min |
| **Block** |  |  |  | **37.5 min** |

Closing the coops is mostly travel time. Layer waterers are larger than the
broiler buckets and are not refilled in the evening.

## Broilers and layers

Because every task names an enterprise, the day divides between broilers and
layers. The split shows what the laying flock costs on an ordinary day,
before a single egg is washed.

| Enterprise | Daily | Share |
|---|---:|---:|
| Broilers | 3 h 55 | 70% |
| Layers | 1 h 32 | 28% |
| Neither | 5 min | 2% |
| **Day** | **5 h 32** |  |

Egg washing and the annual collection figure sit outside this table, because
they are counted once a year rather than inside a block.

## Weekly load

A week of blocks comes to 41 h, and its days are not identical. One weekday
carries the layer move, which swallows work that would otherwise stand on
its own.

Work that happens inside other work is absorbed, and it is counted once.

The layer coop round runs six mornings instead of seven. On the layer move
day it happens inside the move, which is 32 min that must not be counted
twice.

An ordinary day is untouched. Absorption changes the weekly and annual
roll-ups, where a double count would otherwise go unnoticed.

## Move day

Move day is the longest day in an ordinary week. The coops are towed to
fresh grass, the fence goes with them, and the waterers are washed and
sanitized.

### Move

| Step | Per unit | Units | Counted | Absorbed |
|---|---:|---:|---:|---:|
| Move fence | 22.5 min | 2 | 45 min | n/a |
| Drawbar hookup | 8 min | 1 | 8 min | n/a |
| Tow coop | 10 min | 2 | 20 min | n/a |
| Shift feeders, waterers, grit | 15 min | 2 | n/a | 30 min |
| **Move** |  |  | **1 h 13** |  |

**Move fence.** The fence moves as a single unit rather than per coop, but
it grows with coop count, so it is modeled per coop.

**Drawbar hookup.** The hookup was recorded as a range and is carried near
its midpoint, because a flat step held to the half minute is false
precision.

### Wash and sanitize

| Step | Per unit | Units | Counted | Absorbed |
|---|---:|---:|---:|---:|
| Power washer setup | 15 min | 1 | 15 min | n/a |
| Power wash waterers | 30 min | 2 | 1 h | n/a |
| Mix sanitizer | 5 min | 2 | 10 min | n/a |
| Soak waterers | 10 min | 2 | 10 min | 10 min |
| **Wash and sanitize** |  |  | **1 h 35** |  |

**Power washer setup.** Fuel and water line.

**Power wash waterers.** The figure covers every waterer the coop carries.

**Mix sanitizer.** A low-concentration bleach solution.

**Soak waterers.** The soak is per coop rather than per waterer, and all but
one of the soaks happen inside the power wash.

### Day total

| Part | Time |
|---|---:|
| Ordinary chores, less what the move absorbs | 5 h |
| Move, wash and sanitize | 2 h 48 |
| **Move day** | **7 h 48** |

40 min of the move is absorbed, because these steps happen inside another
one rather than after it.

- Shift feeders, waterers, grit, inside move fence.
- Soak waterers, inside power wash waterers.

A third layer coop would add 1 h 08 to move day.

## Periodic work

The rest of the work arrives on its own schedule rather than daily.

| Activity | Figure | Cadence | Who |
|---|---:|---|---|
| Layer move day<sup class="dec d-assumed-high" data-tip="Assumed, high confidence" tabindex="0">+2</sup> | 7 h 48 | weekly | both |
| Per-coop scaling cost<sup class="dec d-projected" data-tip="Projected" tabindex="0">P</sup> | 1 h 08 | per added layer coop | shared |
| Brooder clean-out<sup class="dec d-assumed-high" data-tip="Assumed, high confidence" tabindex="0">+2</sup> | 1 h | per batch | shared |
| Brooder setup<sup class="dec d-assumed-high" data-tip="Assumed, high confidence" tabindex="0">+2</sup> | 1 h 30 | per batch | shared |
| Litter top-dress<sup class="dec d-assumed-high" data-tip="Assumed, high confidence" tabindex="0">+2</sup> | 30 min | every 10 days brooding | shared |
| Chick move-out<sup class="dec d-assumed-high" data-tip="Assumed, high confidence" tabindex="0">+2</sup> | 2 h 10 | per batch | shared |
| Catch and load<sup class="dec d-assumed-high" data-tip="Assumed, high confidence" tabindex="0">+2</sup> | 2 h | per batch | both |
| On site at drop-off and pickup<sup class="dec d-assumed-high" data-tip="Assumed, high confidence" tabindex="0">+2</sup> | 1 h | per batch | shared |
| Post-processing cleanup<sup class="dec d-assumed-high" data-tip="Assumed, high confidence" tabindex="0">+2</sup> | 2 h 10 | per batch | shared |
| Market cash-out<sup class="dec d-assumed-high" data-tip="Assumed, high confidence" tabindex="0">+2</sup> | 20 min | per market day | shared |
| Feed delivery<sup class="dec d-assumed-low" data-tip="Assumed, low confidence" tabindex="0">−2</sup> | 45 min | per delivery | shared |
| Bedding collection run<sup class="dec d-assumed-low" data-tip="Assumed, low confidence" tabindex="0">−2</sup> | 1 h 22 | as needed | shared |
| Egg collection<sup class="dec d-assumed-high" data-tip="Assumed, high confidence" tabindex="0">+2</sup> | 254 h | annual | shared |
| Egg washing<sup class="dec d-assumed-high" data-tip="Assumed, high confidence" tabindex="0">+2</sup> | 403 h | annual | jim |
| Markets<sup class="dec d-assumed-high" data-tip="Assumed, high confidence" tabindex="0">+2</sup> | 392 h | annual | shared |
| Mowing<sup class="dec d-assumed-low" data-tip="Assumed, low confidence" tabindex="0">−2</sup> | 195 h | annual | shared |

**Chick move-out.** Move-out runs at about ten seconds a bird by hand
whatever the equipment, so it grows with the flock and is one of the few
costs capital does not remove.

**Catch and load.** Measured on a full batch with two people.

**Egg collection.** Twice daily is the baseline. Collection rises to three
times through July, and to four in extreme heat.

## Locked blocks

Some blocks are settled before anyone sits down to plan a week. On a day off
every block carries the other person's name, and there are 28 blocks in a
week to name.

| When | Whose | Because |
|---|---|---|
| Saturday, Morning | James | Jim leaves for market at 6:30 and cannot cover it. |
| Sunday, Morning | James | Jim leaves for market at 6:30 and cannot cover it. |
| Wednesday, Closing | Jim | James is at Tilted Barn until 8:30. |
| One weekday, Layer move | Both | The move cannot be done by one person. |

Both days off have to fall on weekdays, because the weekend mornings are
already assigned. The layer move takes one of the five, which leaves four to
carry James' day off, Jim's day off, and two consecutive desk days.

## Conventions

These are James' estimates from a season of doing the work rather than
stopwatch measurements, and they are recorded at the precision they were
given.

- Durations are recorded per unit, with the counts held separately. A change
  in count then re-costs the day without anyone measuring it again.
- Fixed per-visit overhead is recorded apart, because it does not scale with
  unit count and gets cheaper per bird as the farm grows.
- Overlap is recorded per task. Time that runs alongside other work is real,
  and adding it to the total would say the day is longer than it is.
- *Who* is recorded as shared, Jim, or James. Nearly everything is shared,
  because there are no assigned chore blocks and work falls to whoever is
  present.

## Still blank

- Maintenance is blocked rather than unknown, because building the schedule
  is one afternoon's work and the operation has no way to allocate an
  afternoon.
- Administrative hours are unknowable without Jim.
- *Available* has not been defined against *possible*. If available is set
  at the maximum two people can sustain, the calculation will conclude that
  no capital is needed.
