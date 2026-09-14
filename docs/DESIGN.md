# Lodewake — Design

Living document. Rewrite in place when the system changes. Do not append a changelog here.

## Pitch

Classic minesweeper punishes touching mines. **Lodewake reverses the incentive.** The mines are lodestones. You read the Compact’s marks, then extract the deposits. Rifts share the same hidden space and do not always announce themselves. Survival is hull. Ambition is six keels that always charge interest.

## World

After the Veil Collapse, Euclidean space failed. What remains can be surveyed only as **lattices** — two-dimensional sectors whose cells remember neighboring mass. The Lode Compact mined them until the rifts learned to bite.

You inherited a license, the survey ship *Keelson*, and six structural philosophies (the keels). Doctrine: the numbers never lie, but every true thing you pull from the grid makes the next grid hungrier.

## Core loop

1. Drop into a sector lattice (hidden grid).
2. Probe empty cells to reveal **lode-marks** (adjacent lodestone counts).
3. Extract lodestones for scrap / isotopes. Mark rifts. Chord satisfied numbers.
4. Recall with loot, or push for a perfect clear (fold shards). Hull at 0 forces a limp home.
5. Spend scrap on drones and foundries (idle). Spend isotopes on keels (skills).
6. Fold when the curve flattens — prestige, keep the keels, reset the run.

Hook (first minutes): first click is safe, zeros flood, extracting a lode pops yield.  
Habit: drones keep surveying while you think.  
Hobby: six interlocking double-edge trees, prestige folds, constraint chording.

## Reverse minesweeper

| Classic | Lodewake |
| --- | --- |
| Avoid mines | **Extract** lodestones (the mines) |
| Open every safe cell | Open empties for **information**; win by taking lodes |
| Flag danger | Mark lodes and rifts as a plan; marks do not harvest |
| One bomb = death | Rifts damage **hull**; death is a costly recall |
| Numbers = adjacent mines | Numbers = adjacent **lodes** (rifts are unmarked hazards unless Sonar Ghost Count) |

First probe cannot be a rift (relocated). Zeros flood through empty cells only — they never auto-extract lodes or reveal rifts.

**Chord:** click a revealed mark whose adjacent extracted + lode-marked cells equal the number. Remaining neighbors probe at once. An unsatisfied chord ticks instead of guessing.

**Recall:** cash out current loot, abandon remaining lodes. Next lattice drops immediately (no folding flash).  
**Perfect:** every lode extracted, hull > 0 → shard bonus, next lattice.

**Death:** extracted loot is clawed back (the lattice keeps the take). Hull-5 (Unbreakable) returns 30% of that sector loot. “Back to helm” returns to the title, not another drop.

## Controls

| Input | Action |
| --- | --- |
| Tap / Enter / Space | Probe (extract lode, flood empty, or chord a number) |
| Long-press / right-click / M / F | Cycle mark (lode ◆ → rift × → none) |
| Arrows / WASD | Move cursor |
| R | Recall |
| 1–4 | Lattice / Keels / Bay / Codex |
| Esc | Close panel or modal |
| ? | Doctrine |
| Enter (title) | Drop the lattice |

Marks are glyphs, not pin dots. Keyboard cursor is a pale ring.

## Survival

- **Hull** — rifts, some keel debuffs, Heat overflow.
- **Heat** — rises on extract. At cap, hull drains (Nerve / overclock).
- **Combo** — consecutive extracts inside a window multiply yield.

## Incremental

Resources: **scrap** (run), **isotopes** (keel fuel, 1 per extract), **fold shards** (prestige).

Generators (exponential cost, multiplier ~1.14):

- Scout mites — auto-reveal empty cells
- Harvest bees — auto-extract marked / known lodes
- Hull weaves — regen
- Foundries — idle scrap from last density

Offline: production continues up to 8 hours at the Swarm multiplier. Active play still pays (click yield, combos, chording).

Number format: compact K/M/B then scientific.

## Six keels (30 double-edge nodes)

Five tiers each. Cross-tree `requires` bind them. Every node has a buff **and** a debuff. See `src/game/skills.ts` (source of truth).

| Keel | Want | Cost |
| --- | --- | --- |
| Sonar | Information | Noise, wrong marks, heat |
| Lode | Yield | Extra rifts, recall locks, fail penalty |
| Hull | Survive | Slower extract, weaker combos, fewer shards |
| Swarm | Idle | Yield cut, heat, weaker clicking |
| Fold | Prestige / scale | Harder sectors, rift bite, skill reset (True Fold) |
| Nerve | Active multiplier | Heat, hull on misses, forced recall |

Buying a keel is a stance, not a stat stick. The interesting builds are the illegal-feeling combinations (Omniscient + Hunger, Silent Fleet + Hot Hands, Unbreakable + Mutiny).

## Sectors

Star (difficulty) grows width/height, lode count, rift count, base yield. Fold can skip stars (Lattice Skip) at the cost of meaner rifts.

## Save

`localStorage`, versioned blob, migrate sequentially, merge over defaults, backup previous, throttle writes, flush on `visibilitychange`. No accounts.

## Feel

Simulation is the grid + numbers. Presentation is trauma² shake, hitstop, extract pop, floating yield, layered synth SFX (unlocked on the title tap). Reduced-motion and shake toggles ship.

## Stack

TanStack Start, React 19, Zustand, DOM grid (not canvas — this is a constraint board). Auth and database off.
