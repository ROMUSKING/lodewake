# Progress

**Updated:** 2026-09-14  
**Status:** Playable. Keyboard + mouse. Playtested.

## Now

Live in the preview. Play: Enter to drop, arrows to move, Enter to probe, M to mark, R to recall. Fit a T1 keel after the first extracts.

## Done

- Reverse-minesweeper lattice: probe, extract, mark, chord, flood zeros
- Six keels / 30 double-edge nodes with cross-tree requires
- Idle bay, offline catch-up, Fold prestige, local save
- Keyboard helm: arrows/WASD, Enter/Space, M, R, 1–4, Esc, ?
- Visible marks (◆ / ×), cursor ring, helm switches instead of native checkboxes
- Death claws back sector loot (Unbreakable keeps 30%); Back to helm returns to title
- Recall/perfect drop the next lattice without a “folding…” flash
- First-session pacing: 1 isotope per extract, cheaper T1 keels
- Local fonts (no Google Fonts block)
- Typecheck clean
- Source: [github.com/ROMUSKING/lodewake](https://github.com/ROMUSKING/lodewake)

## Open issues

- Board unit tests are not on `npm test` (Node ESM vs extensionless imports)
- Long-press mark still needs a dedicated mobile QA pass after these changes
- Chord on an unsatisfied number is quiet besides a miss tick

## Known constraints

- Grid is DOM/CSS
- Auth/db off
