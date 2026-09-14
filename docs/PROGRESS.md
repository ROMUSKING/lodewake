# Progress

**Updated:** 2026-09-14  
**Status:** Playable. Dev and production builds verified. Source on GitHub.

## Now

Live in the preview. Next work if requested: more sector events, visual drone ticks, polish Bay checkboxes.

## Done

- Reverse-minesweeper lattice: probe, extract, mark, chord, flood zeros
- Six keels / 30 double-edge nodes with cross-tree requires
- Idle bay, offline catch-up, Fold prestige, local save
- Title, HUD, board, keels, bay, codex — desktop and mobile
- First-session pacing: 1 isotope per extract, cheaper T1 keels
- Typecheck + production build + built-output smoke (no console errors, no brand warnings)
- Source: [github.com/ROMUSKING/lodewake](https://github.com/ROMUSKING/lodewake)

## Open issues

- Native checkbox styling in Bay is plain (functional)
- Board unit tests are not on `npm test` (Node ESM vs extensionless imports)

## Known constraints

- Grid is DOM/CSS
- Auth/db off
