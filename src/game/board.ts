import { mulberry32, shuffleInPlace } from "./rng";
import type { Cell, Mark, Mods, Sector } from "./types";

export const DIRS: [number, number][] = [
  [-1, -1],
  [-1, 0],
  [-1, 1],
  [0, -1],
  [0, 1],
  [1, -1],
  [1, 0],
  [1, 1],
];

export function idx(r: number, c: number, w: number): number {
  return r * w + c;
}

export function inBounds(r: number, c: number, w: number, h: number): boolean {
  return r >= 0 && c >= 0 && r < h && c < w;
}

export function neighbors(r: number, c: number, w: number, h: number): [number, number][] {
  const out: [number, number][] = [];
  for (const [dr, dc] of DIRS) {
    const nr = r + dr;
    const nc = c + dc;
    if (inBounds(nr, nc, w, h)) out.push([nr, nc]);
  }
  return out;
}

export function starSpec(star: number, mods: Mods) {
  const size = Math.min(16, 6 + Math.floor(star / 2) + mods.sectorSizeBonus);
  const cells = size * size;
  const lodes = Math.min(
    Math.floor(cells * 0.42),
    6 + star * 2 + mods.extraLodes + Math.floor(star / 3),
  );
  const rifts = Math.min(
    Math.floor(cells * 0.22),
    2 + Math.floor(star * 1.2) + mods.extraRifts,
  );
  const base = 8 * Math.pow(1.22, star);
  return { w: size, h: size, lodes, rifts, base };
}

export function generateSector(
  star: number,
  seed: number,
  mods: Mods,
  paleSectorsLeft: number,
): Sector {
  const spec = starSpec(star, mods);
  const extraRift = paleSectorsLeft > 0 ? 1 : 0;
  const w = spec.w;
  const h = spec.h;
  const total = w * h;
  const rng = mulberry32(seed);
  const order = shuffleInPlace(
    Array.from({ length: total }, (_, i) => i),
    rng,
  );
  const riftCount = Math.min(total - spec.lodes - 1, spec.rifts + extraRift);
  const lodeCount = Math.min(total - riftCount - 1, spec.lodes);

  const cells: Cell[] = Array.from({ length: total }, () => ({
    kind: "empty" as const,
    revealed: false,
    extracted: false,
    ruptured: false,
    mark: "none" as const,
    adjLodes: 0,
    adjRifts: 0,
    shown: 0,
  }));

  for (let i = 0; i < lodeCount; i++) cells[order[i]!]!.kind = "lode";
  for (let i = lodeCount; i < lodeCount + riftCount; i++) cells[order[i]!]!.kind = "rift";

  for (let r = 0; r < h; r++) {
    for (let c = 0; c < w; c++) {
      const cell = cells[idx(r, c, w)]!;
      let lodes = 0;
      let rifts = 0;
      for (const [nr, nc] of neighbors(r, c, w, h)) {
        const n = cells[idx(nr, nc, w)]!;
        if (n.kind === "lode") lodes += 1;
        if (n.kind === "rift") rifts += 1;
      }
      cell.adjLodes = lodes;
      cell.adjRifts = rifts;
      let shown = lodes;
      if (cell.kind === "empty" && mods.numberJitter > 0 && rng() < mods.numberJitter) {
        shown = Math.max(0, Math.min(8, lodes + (rng() < 0.5 ? -1 : 1)));
      }
      cell.shown = shown;
    }
  }

  const sector: Sector = {
    w,
    h,
    star,
    seed,
    cells,
    lodeTotal: lodeCount,
    lodeLeft: lodeCount,
    riftTotal: riftCount,
    firstClick: true,
    startedAt: Date.now(),
    lootScrap: 0,
    lootIsotopes: 0,
    tempered: false,
    paleSectorsLeft,
  };

  applyOpening(sector, mods, rng);
  return sector;
}

function applyOpening(sector: Sector, mods: Mods, rng: () => number) {
  const empties: number[] = [];
  sector.cells.forEach((c, i) => {
    if (c.kind === "empty") empties.push(i);
  });
  if (mods.allNumbersStart) {
    for (const cell of sector.cells) {
      if (cell.kind === "empty") cell.revealed = true;
    }
    return;
  }
  const n = Math.min(mods.startRevealed, empties.length);
  for (let i = 0; i < n; i++) {
    const k = Math.floor(rng() * empties.length);
    const at = empties.splice(k, 1)[0];
    if (at === undefined) break;
    revealEmpty(sector, at);
  }
}

function relocateKind(sector: Sector, from: number, kind: Cell["kind"]) {
  const dest = sector.cells.findIndex((c, i) => i !== from && c.kind === "empty" && !c.revealed);
  if (dest < 0) return false;
  sector.cells[from]!.kind = "empty";
  sector.cells[dest]!.kind = kind;
  recount(sector);
  return true;
}

export function recount(sector: Sector) {
  const { w, h, cells } = sector;
  for (let r = 0; r < h; r++) {
    for (let c = 0; c < w; c++) {
      const cell = cells[idx(r, c, w)]!;
      let lodes = 0;
      let rifts = 0;
      for (const [nr, nc] of neighbors(r, c, w, h)) {
        const n = cells[idx(nr, nc, w)]!;
        if (n.kind === "lode") lodes += 1;
        if (n.kind === "rift") rifts += 1;
      }
      cell.adjLodes = lodes;
      cell.adjRifts = rifts;
      if (cell.kind === "empty") cell.shown = lodes;
    }
  }
}

export function revealEmpty(sector: Sector, at: number) {
  const cell = sector.cells[at];
  if (!cell || cell.kind !== "empty") return;
  cell.revealed = true;
  if (cell.adjLodes !== 0) return;
  const { w, h } = sector;
  const r = Math.floor(at / w);
  const c = at % w;
  const stack = neighbors(r, c, w, h);
  const seen = new Set<number>([at]);
  while (stack.length) {
    const [nr, nc] = stack.pop()!;
    const ni = idx(nr, nc, w);
    if (seen.has(ni)) continue;
    seen.add(ni);
    const n = sector.cells[ni]!;
    if (n.kind !== "empty" || n.revealed) continue;
    n.revealed = true;
    n.mark = "none";
    if (n.adjLodes === 0) stack.push(...neighbors(nr, nc, w, h));
  }
}

export type ProbeResult =
  | { type: "noop" }
  | { type: "empty"; flooded: number }
  | { type: "extract"; chained: number }
  | { type: "rift"; damage: number; tempered: boolean }
  | { type: "chord"; probes: ProbeResult[] };

export function ensureFirstClickSafe(sector: Sector, at: number) {
  if (!sector.firstClick) return;
  sector.firstClick = false;
  const cell = sector.cells[at]!;
  if (cell.kind === "rift") relocateKind(sector, at, "rift");
}

export function cycleMark(cell: Cell): Mark {
  if (cell.revealed || cell.extracted || cell.ruptured) return cell.mark;
  cell.mark = cell.mark === "none" ? "lode" : cell.mark === "lode" ? "rift" : "none";
  return cell.mark;
}

export function lodeSatisfied(sector: Sector, r: number, c: number): boolean {
  const cell = sector.cells[idx(r, c, sector.w)]!;
  if (!cell.revealed || cell.kind !== "empty") return false;
  let accounted = 0;
  for (const [nr, nc] of neighbors(r, c, sector.w, sector.h)) {
    const n = sector.cells[idx(nr, nc, sector.w)]!;
    if (n.extracted || n.mark === "lode") accounted += 1;
  }
  return accounted === cell.shown;
}

export function remainingLodes(sector: Sector): number[] {
  const out: number[] = [];
  sector.cells.forEach((c, i) => {
    if (c.kind === "lode" && !c.extracted) out.push(i);
  });
  return out;
}

export function hiddenEmpties(sector: Sector): number[] {
  const out: number[] = [];
  sector.cells.forEach((c, i) => {
    if (c.kind === "empty" && !c.revealed) out.push(i);
  });
  return out;
}

export function markedUnextractedLodes(sector: Sector): number[] {
  const out: number[] = [];
  sector.cells.forEach((c, i) => {
    if (c.kind === "lode" && !c.extracted && c.mark === "lode") out.push(i);
  });
  return out;
}

export function unmarkedHidden(sector: Sector): number[] {
  const out: number[] = [];
  sector.cells.forEach((c, i) => {
    if (!c.revealed && !c.extracted && !c.ruptured && c.mark === "none") out.push(i);
  });
  return out;
}

export function cloneSector(s: Sector): Sector {
  return {
    ...s,
    cells: s.cells.map((c) => ({ ...c })),
  };
}

export function extractedRatio(sector: Sector): number {
  if (sector.lodeTotal === 0) return 1;
  return (sector.lodeTotal - sector.lodeLeft) / sector.lodeTotal;
}

export function isPerfect(sector: Sector): boolean {
  return sector.lodeLeft === 0;
}
