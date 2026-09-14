import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { generateSector, idx, lodeSatisfied, remainingLodes, revealEmpty } from "./board.ts";
import { emptyMods } from "./mods.ts";
import { SKILLS, TREES, skillsInTree } from "./skills.ts";

describe("sector generation", () => {
  it("places the requested lodes and rifts", () => {
    const mods = emptyMods();
    const sector = generateSector(0, 42, mods, 0);
    const lodes = sector.cells.filter((c) => c.kind === "lode").length;
    const rifts = sector.cells.filter((c) => c.kind === "rift").length;
    assert.equal(lodes, sector.lodeTotal);
    assert.equal(rifts, sector.riftTotal);
    assert.equal(sector.lodeLeft, sector.lodeTotal);
    assert.ok(sector.cells.length === sector.w * sector.h);
  });

  it("is deterministic for a seed", () => {
    const mods = emptyMods();
    const a = generateSector(3, 99, mods, 0);
    const b = generateSector(3, 99, mods, 0);
    assert.deepEqual(
      a.cells.map((c) => c.kind),
      b.cells.map((c) => c.kind),
    );
  });

  it("counts adjacent lodes on empties", () => {
    const sector = generateSector(0, 7, emptyMods(), 0);
    for (let r = 0; r < sector.h; r++) {
      for (let c = 0; c < sector.w; c++) {
        const cell = sector.cells[idx(r, c, sector.w)]!;
        let n = 0;
        for (const [dr, dc] of [
          [-1, -1],
          [-1, 0],
          [-1, 1],
          [0, -1],
          [0, 1],
          [1, -1],
          [1, 0],
          [1, 1],
        ] as const) {
          const nr = r + dr;
          const nc = c + dc;
          if (nr < 0 || nc < 0 || nr >= sector.h || nc >= sector.w) continue;
          if (sector.cells[idx(nr, nc, sector.w)]!.kind === "lode") n += 1;
        }
        assert.equal(cell.adjLodes, n);
      }
    }
  });

  it("floods zeros without revealing lodes or rifts", () => {
    const sector = generateSector(0, 1, emptyMods(), 0);
    const zero = sector.cells.findIndex((c) => c.kind === "empty" && c.adjLodes === 0);
    assert.ok(zero >= 0);
    revealEmpty(sector, zero);
    for (const cell of sector.cells) {
      if (cell.kind !== "empty") assert.equal(cell.revealed, false);
    }
  });

  it("chord satisfaction counts extracted and marked lodes", () => {
    const sector = generateSector(0, 2, emptyMods(), 0);
    const at = sector.cells.findIndex((c) => c.kind === "empty" && c.adjLodes > 0);
    assert.ok(at >= 0);
    const r = Math.floor(at / sector.w);
    const c = at % sector.w;
    sector.cells[at]!.revealed = true;
    assert.equal(lodeSatisfied(sector, r, c), false);
  });

  it("remaining lodes shrinks only conceptually via extracted flag", () => {
    const sector = generateSector(0, 3, emptyMods(), 0);
    const left = remainingLodes(sector);
    assert.equal(left.length, sector.lodeTotal);
  });
});

describe("keels", () => {
  it("has six trees of five double-edge nodes", () => {
    assert.equal(TREES.length, 6);
    assert.equal(SKILLS.length, 30);
    for (const t of TREES) assert.equal(skillsInTree(t).length, 5);
    for (const s of SKILLS) {
      assert.ok(s.buff.length > 0);
      assert.ok(s.debuff.length > 0);
      assert.ok(s.isotopes > 0);
    }
  });

  it("cross-links at least eight nodes across trees", () => {
    const cross = SKILLS.filter((s) => s.requires.some((id) => id.split("-")[0] !== s.tree));
    assert.ok(cross.length >= 8);
  });
});
