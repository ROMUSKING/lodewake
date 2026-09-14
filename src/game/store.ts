import { create } from "zustand";
import { sfx, setSoundEnabled, unlockAudio } from "./audio";
import {
  cloneSector,
  cycleMark,
  extractedRatio,
  generateSector,
  hiddenEmpties,
  idx,
  isPerfect,
  lodeSatisfied,
  markedUnextractedLodes,
  neighbors,
  remainingLodes,
  revealEmpty,
  starSpec,
  unmarkedHidden,
} from "./board";
import { foldBonus, foundryRate, genCost, GEN_META, shardFromRecall, starYield, weaveRegen } from "./economy";
import { computeMods, maxHull } from "./mods";
import { SKILL_BY_ID, canBuy } from "./skills";
import { defaultSave, loadSave, writeSave } from "./save";
import type {
  Cell,
  Floater,
  GeneratorId,
  LogEntry,
  LogKind,
  Mods,
  PlayPanel,
  SaveBlob,
  Screen,
  Sector,
  Settings,
} from "./types";

type Toast = { id: number; text: string };

type GameStore = {
  hydrated: boolean;
  screen: Screen;
  panel: PlayPanel;
  scrap: number;
  isotopes: number;
  shards: number;
  hull: number;
  heat: number;
  combo: number;
  comboT: number;
  wake: number;
  star: number;
  sectorsCleared: number;
  totalExtracted: number;
  ownedSkills: string[];
  generators: Record<GeneratorId, number>;
  trueFolds: number;
  skillDiscount: number;
  lastTick: number;
  settings: Settings;
  seenTutorial: boolean;
  paleSectorsLeft: number;
  sector: Sector | null;
  mods: Mods;
  log: LogEntry[];
  floaters: Floater[];
  toasts: Toast[];
  trauma: number;
  hover: number | null;
  flash: number[];
  nextExtractCut: boolean;
  hungerT: number;
  droneRevealT: number;
  droneExtractT: number;
  droneFlagT: number;
  lastLoot: number;
  modal: "none" | "recall" | "death" | "fold" | "help";
  skipStar: boolean;

  hydrate: () => void;
  persist: () => void;
  applyMods: () => void;
  startRun: () => void;
  dropSector: (opts?: { skip?: boolean }) => void;
  probe: (at: number, opts?: { drone?: boolean; chain?: boolean }) => void;
  chord: (at: number) => void;
  mark: (at: number) => void;
  recall: () => void;
  confirmDeath: () => void;
  buySkill: (id: string) => void;
  buyGen: (id: GeneratorId) => void;
  fold: () => void;
  tick: (dt: number) => void;
  setPanel: (p: PlayPanel) => void;
  setHover: (at: number | null) => void;
  setSetting: <K extends keyof Settings>(k: K, v: Settings[K]) => void;
  pushLog: (kind: LogKind, text: string) => void;
  dismissModal: () => void;
  dismissToast: (id: number) => void;
  dismissFloater: (id: number) => void;
  resetAll: () => void;
  snapshot: () => SaveBlob;
  toTitle: () => void;
  openHelp: () => void;
};

let logSeq = 1;
let floatSeq = 1;
let toastSeq = 1;
let lastSave = 0;

function bankFrom(s: SaveBlob): Pick<
  GameStore,
  | "scrap"
  | "isotopes"
  | "shards"
  | "hull"
  | "heat"
  | "combo"
  | "wake"
  | "star"
  | "sectorsCleared"
  | "totalExtracted"
  | "ownedSkills"
  | "generators"
  | "trueFolds"
  | "skillDiscount"
  | "lastTick"
  | "settings"
  | "seenTutorial"
  | "paleSectorsLeft"
  | "sector"
  | "lastLoot"
> {
  return {
    scrap: s.scrap,
    isotopes: s.isotopes,
    shards: s.shards,
    hull: s.hull,
    heat: s.heat,
    combo: s.combo,
    wake: s.wake,
    star: s.star,
    sectorsCleared: s.sectorsCleared,
    totalExtracted: s.totalExtracted,
    ownedSkills: s.ownedSkills,
    generators: s.generators,
    trueFolds: s.trueFolds,
    skillDiscount: s.skillDiscount,
    lastTick: s.lastTick,
    settings: s.settings,
    seenTutorial: s.seenTutorial,
    paleSectorsLeft: s.paleSectorsLeft,
    sector: s.sector,
    lastLoot: s.sector?.lootScrap ?? 0,
  };
}

export const useGame = create<GameStore>((set, get) => ({
  hydrated: false,
  screen: "title",
  panel: "none",
  ...bankFrom(defaultSave()),
  comboT: 0,
  mods: computeMods([], 0, 0),
  log: [],
  floaters: [],
  toasts: [],
  trauma: 0,
  hover: null,
  flash: [],
  nextExtractCut: false,
  hungerT: 0,
  droneRevealT: 0,
  droneExtractT: 0,
  droneFlagT: 0,
  modal: "none",
  skipStar: false,

  hydrate: () => {
    if (get().hydrated) return;
    try {
      const blob = loadSave();
      const mods = computeMods(blob.ownedSkills, blob.trueFolds, blob.skillDiscount);
      const now = Date.now();
      const away = Math.min(8 * 3600, Math.max(0, (now - blob.lastTick) / 1000));
      let scrap = blob.scrap;
      let hull = blob.hull;
      const mh = maxHull(mods);
      if (away > 2) {
        const rate = foundryRate(blob.generators.foundry, blob.star, blob.sector?.lootScrap ?? 12);
        scrap += rate * away * mods.offlineMult;
        hull = Math.min(mh, hull + weaveRegen(blob.generators.weave, mods) * away * 0.35);
      }
      set({
        ...bankFrom(blob),
        scrap,
        hull,
        lastTick: now,
        mods,
        hydrated: true,
        screen: "title",
        comboT: 0,
      });
      setSoundEnabled(blob.settings.sound);
      if (away > 30 && rateScrap(away, scrap - blob.scrap)) {
        get().pushLog("system", `The bay worked ${Math.floor(away / 60)}m without you.`);
      }
    } catch {
      set({ hydrated: true, screen: "title" });
    }
  },

  snapshot: () => {
    const s = get();
    return {
      version: 1,
      scrap: s.scrap,
      isotopes: s.isotopes,
      shards: s.shards,
      hull: s.hull,
      heat: s.heat,
      combo: s.combo,
      wake: s.wake,
      star: s.star,
      sectorsCleared: s.sectorsCleared,
      totalExtracted: s.totalExtracted,
      ownedSkills: s.ownedSkills,
      generators: s.generators,
      trueFolds: s.trueFolds,
      skillDiscount: s.skillDiscount,
      lastTick: Date.now(),
      settings: s.settings,
      seenTutorial: s.seenTutorial,
      paleSectorsLeft: s.paleSectorsLeft,
      sector: s.sector,
    };
  },

  persist: () => {
    writeSave(get().snapshot());
  },

  applyMods: () => {
    const s = get();
    set({ mods: computeMods(s.ownedSkills, s.trueFolds, s.skillDiscount) });
  },

  pushLog: (kind, text) => {
    set((s) => ({
      log: [{ id: logSeq++, kind, text, at: Date.now() }, ...s.log].slice(0, 40),
    }));
  },

  startRun: () => {
    unlockAudio();
    if (!get().hydrated) get().hydrate();
    const s = get();
    if (!s.sector) get().dropSector();
    set({
      screen: "play",
      modal: s.seenTutorial ? "none" : "help",
      seenTutorial: true,
    });
    sfx.ui();
    queueMicrotask(() => get().persist());
  },

  dropSector: (opts) => {
    const s = get();
    const star = s.star + ((opts?.skip ?? s.skipStar) && s.ownedSkills.includes("fold-3") ? 1 : 0);
    const seed = (Math.floor(Math.random() * 1e9) ^ Date.now()) >>> 0;
    const pale = s.paleSectorsLeft;
    const sector = generateSector(star, seed, s.mods, pale);
    const mh = maxHull(s.mods);
    let hull = s.hull;
    if (!s.sector && s.hull <= 0) hull = Math.round(mh * s.mods.startHullFrac);
    hull = Math.max(1, hull - s.mods.startHullHit);
    const spec = starSpec(star, s.mods);
    set({
      sector,
      star,
      hull: Math.min(mh, hull),
      heat: Math.max(0, s.heat * 0.35),
      combo: 0,
      comboT: 0,
      skipStar: false,
      paleSectorsLeft: Math.max(0, pale - (pale > 0 ? 1 : 0)),
      hungerT: 0,
      droneRevealT: 0,
      droneExtractT: 0,
      droneFlagT: 0,
      nextExtractCut: false,
      hover: (() => {
        const first = sector.cells.findIndex((c) => c.revealed && c.kind === "empty");
        return first >= 0 ? first : 0;
      })(),
      flash: [],
      modal: "none",
    });
    get().pushLog(
      "system",
      `Lattice ${star + 1} · ${spec.w}×${spec.h} · ${spec.lodes} lodes · ${sector.riftTotal} rifts`,
    );
  },

  probe: (at, opts) => {
    const s = get();
    const sector = s.sector;
    if (!sector || s.modal !== "none") return;
    if (at < 0 || at >= sector.cells.length) return;
    const next = cloneSector(sector);
    const cell = next.cells[at]!;
    if (cell.extracted || cell.ruptured) return;
    if (cell.mark !== "none" && !opts?.drone) return;
    if (cell.revealed && cell.kind === "empty") {
      get().chord(at);
      return;
    }
    if (cell.revealed) return;

    if (next.firstClick) {
      next.firstClick = false;
      if (cell.kind === "rift") {
        const dest = next.cells.findIndex((c, i) => i !== at && c.kind === "empty" && !c.revealed);
        if (dest >= 0) {
          next.cells[at]!.kind = "empty";
          next.cells[dest]!.kind = "rift";
          rec(next);
        }
      }
    }

    const live = next.cells[at]!;
    if (s.mods.droneClickHull > 0 && !opts?.drone && s.generators.scout > 0) {
      set({ hull: Math.max(0, s.hull - s.mods.droneClickHull) });
    }

    if (live.kind === "empty") {
      revealEmpty(next, at);
      live.mark = "none";
      sfx.probe();
      let hull = get().hull;
      let combo = s.combo;
      let comboT = s.comboT;
      if (s.mods.missCostsHull) {
        hull = Math.max(0, hull - 1);
        combo = 0;
        comboT = 0;
      }
      set({ sector: next, hull, combo, comboT });
      if (hull <= 0) get().confirmDeath();
      return;
    }

    if (live.kind === "lode") {
      extractAt(get, set, next, at, { click: !opts?.drone, chain: Boolean(opts?.chain) });
      return;
    }

    if (live.kind === "rift") {
      live.ruptured = true;
      live.revealed = true;
      live.mark = "none";
      let dmg = Math.round(8 * s.mods.riftDamage + s.star + s.mods.riftDamageAdd);
      let tempered = false;
      if (s.mods.riftTemper && !next.tempered) {
        dmg = 1;
        next.tempered = true;
        tempered = true;
        set({ nextExtractCut: true });
      }
      const hull = Math.max(0, get().hull - dmg);
      sfx.rift();
      set({
        sector: next,
        hull,
        combo: 0,
        comboT: 0,
        trauma: Math.min(1, s.trauma + 0.55),
        flash: [at],
      });
      get().pushLog("rift", tempered ? "Rift kissed the plates." : `Rift · −${dmg} hull`);
      addFloater(set, `−${dmg}`, at, next, "rift");
      if (hull <= 0) get().confirmDeath();
    }
  },

  chord: (at) => {
    const s = get();
    const sector = s.sector;
    if (!sector) return;
    const r = Math.floor(at / sector.w);
    const c = at % sector.w;
    if (!lodeSatisfied(sector, r, c)) {
      if (s.mods.rePing) {
        const flash: number[] = [];
        for (const [nr, nc] of neighbors(r, c, sector.w, sector.h)) {
          const n = sector.cells[idx(nr, nc, sector.w)]!;
          if (!n.revealed && !n.extracted && !n.ruptured) flash.push(idx(nr, nc, sector.w));
        }
        set({ flash, heat: Math.min(s.mods.heatCap, s.heat + 2) });
        sfx.ui();
      } else {
        sfx.miss();
      }
      return;
    }
    sfx.chord();
    const targets: number[] = [];
    for (const [nr, nc] of neighbors(r, c, sector.w, sector.h)) {
      const ni = idx(nr, nc, sector.w);
      const n = sector.cells[ni]!;
      if (!n.revealed && !n.extracted && !n.ruptured && n.mark === "none") targets.push(ni);
    }
    for (const t of targets) get().probe(t);
  },

  mark: (at) => {
    const s = get();
    if (!s.sector || s.modal !== "none") return;
    const next = cloneSector(s.sector);
    const cell = next.cells[at];
    if (!cell) return;
    cycleMark(cell);
    sfx.mark();
    set({ sector: next });
  },

  recall: () => {
    const s = get();
    const sector = s.sector;
    if (!sector) return;
    if (s.mods.cannotRecallUntil > 0 && extractedRatio(sector) < s.mods.cannotRecallUntil) {
      get().pushLog("system", "Hunger Protocol will not leave the table.");
      return;
    }
    settleRecall(get, set, false);
  },

  confirmDeath: () => {
    const s = get();
    if (s.modal === "death") return;
    sfx.death();
    set({ modal: "death", trauma: 1 });
    const sector = s.sector;
    if (!sector) return;
    const clawScrap = sector.lootScrap;
    const clawIso = sector.lootIsotopes;
    const keep = s.mods.deathKeep * (1 - s.mods.failPenalty);
    set({
      scrap: Math.max(0, s.scrap - clawScrap + clawScrap * keep),
      isotopes: Math.max(0, s.isotopes - clawIso + Math.floor(clawIso * keep)),
      hull: Math.max(1, Math.round(maxHull(s.mods) * 0.25 * s.mods.startHullFrac)),
      heat: 0,
      combo: 0,
      sector: null,
    });
    get().pushLog(
      "rift",
      keep > 0 ? "Crippled. A third of the take stayed in the bay." : "Hull zero. The lattice kept the take.",
    );
    queueMicrotask(() => get().persist());
  },

  buySkill: (id) => {
    const s = get();
    const node = SKILL_BY_ID[id];
    if (!node) return;
    const costMul = s.mods.skillCostMul;
    const check = canBuy(s.ownedSkills, node, s.isotopes, s.shards, costMul);
    if (!check.ok) {
      get().pushLog("system", check.reason ?? "Cannot fit");
      return;
    }
    const iso = Math.ceil(node.isotopes * costMul);
    const owned = [...s.ownedSkills, id];
    const mods = computeMods(owned, s.trueFolds, s.skillDiscount);
    sfx.buy();
    set({
      ownedSkills: owned,
      isotopes: s.isotopes - iso,
      shards: s.shards - (node.shards ?? 0),
      mods,
      hull: Math.min(maxHull(mods), s.hull + (node.effects.maxHullAdd ?? 0)),
    });
    get().pushLog("skill", `Fitted ${node.name}`);
    get().persist();
  },

  buyGen: (id) => {
    const s = get();
    const cost = genCost(id, s.generators[id]);
    if (s.scrap < cost) return;
    sfx.buy();
    set({
      scrap: s.scrap - cost,
      generators: { ...s.generators, [id]: s.generators[id] + 1 },
    });
    get().pushLog("drone", `Commissioned ${GEN_META[id].name}`);
    get().persist();
  },

  fold: () => {
    const s = get();
    const trueFold = s.ownedSkills.includes("fold-5");
    const pale = s.ownedSkills.includes("fold-4") ? 3 : 0;
    const discount = s.ownedSkills.includes("fold-2") ? s.skillDiscount + 0.2 : s.skillDiscount;
    const shards = s.shards;
    const wake = s.wake + 1;
    const hull = maxHull(s.mods);
    sfx.recall();
    set({
      wake,
      scrap: 0,
      isotopes: Math.floor(s.isotopes * 0.15),
      shards,
      hull: trueFold || s.ownedSkills.includes("fold-4") ? hull : Math.round(hull * s.mods.startHullFrac),
      heat: 0,
      combo: 0,
      star: Math.max(0, Math.floor(s.star * 0.25)),
      generators: { scout: 0, bees: 0, weave: 0, foundry: 0 },
      ownedSkills: trueFold ? [] : s.ownedSkills,
      trueFolds: s.trueFolds + (trueFold ? 1 : 0),
      skillDiscount: Math.min(0.4, discount),
      sector: null,
      paleSectorsLeft: pale,
      modal: "none",
      panel: "none",
    });
    get().applyMods();
    get().pushLog("fold", trueFold ? `True Fold ${get().trueFolds}. Keels burned.` : `Fold ${wake}. The keels remember.`);
    get().dropSector();
    get().persist();
  },

  tick: (dt) => {
    const s = get();
    if (!s.hydrated || s.screen !== "play") return;
    const mods = s.mods;
    let heat = Math.max(0, s.heat - dt * 3.2);
    let hull = s.hull;
    const mh = maxHull(mods);
    hull = Math.min(mh, hull + weaveRegen(s.generators.weave, mods) * dt);
    if (mods.heatHullDrain && heat >= mods.heatCap - 0.1) hull -= 2.2 * dt;
    let combo = s.combo;
    let comboT = s.comboT - dt;
    if (comboT <= 0) {
      combo = 0;
      comboT = 0;
    }
    const scrap = s.scrap + foundryRate(s.generators.foundry, s.star, s.lastLoot) * dt;
    let trauma = Math.max(0, s.trauma - dt * 1.8);

    let droneRevealT = s.droneRevealT + dt;
    let droneExtractT = s.droneExtractT + dt;
    let droneFlagT = s.droneFlagT + dt;
    let hungerT = s.hungerT + dt;

    const hoverPaused = mods.disableAutoWhileHover && s.hover !== null;
    const sector = s.sector;

    set({ heat, hull, combo, comboT, scrap, trauma, lastTick: Date.now() });

    if (hull <= 0 && s.modal !== "death") {
      get().confirmDeath();
      return;
    }

    if (!sector || s.modal !== "none" || hoverPaused) {
      set({ droneRevealT, droneExtractT, droneFlagT, hungerT });
      return;
    }

    const revealIv =
      mods.droneRevealInterval > 0
        ? (mods.droneRevealInterval / Math.max(1, s.generators.scout)) * mods.droneIntervalMul
        : s.generators.scout > 0
          ? (8 / s.generators.scout) * mods.droneIntervalMul
          : 0;
    if (revealIv > 0 && droneRevealT >= revealIv) {
      droneRevealT = 0;
      const empties = hiddenEmpties(sector);
      if (empties.length) {
        const at = empties[Math.floor(Math.random() * empties.length)]!;
        get().probe(at, { drone: true });
      }
    }

    const extractIv =
      mods.droneExtractInterval > 0
        ? (mods.droneExtractInterval / Math.max(1, s.generators.bees || 1)) * mods.droneIntervalMul
        : s.generators.bees > 0
          ? (10 / s.generators.bees) * mods.droneIntervalMul
          : 0;
    if (s.generators.bees > 0 && extractIv > 0 && droneExtractT >= extractIv) {
      droneExtractT = 0;
      const marked = markedUnextractedLodes(get().sector ?? sector);
      if (marked.length) get().probe(marked[0]!, { drone: true });
    }

    if (mods.colonyFlagAccuracy > 0 && droneFlagT >= 5 * mods.droneIntervalMul) {
      droneFlagT = 0;
      const pool = unmarkedHidden(get().sector ?? sector);
      if (pool.length) {
        const at = pool[Math.floor(Math.random() * pool.length)]!;
        const live = get().sector;
        if (live) {
          const next = cloneSector(live);
          const cell = next.cells[at]!;
          const correct = cell.kind === "lode";
          if (Math.random() < mods.colonyFlagAccuracy) {
            cell.mark = cell.kind === "rift" ? "rift" : "lode";
          } else {
            cell.mark = "lode";
            if (!correct) {
              set({ hull: Math.max(0, get().hull - 4) });
              get().pushLog("drone", "Colony guessed wrong.");
            }
          }
          set({ sector: next });
        }
      }
    }

    if (mods.hungerAuto && hungerT >= 8) {
      hungerT = 0;
      const left = remainingLodes(get().sector ?? sector);
      if (left.length) get().probe(left[0]!, { drone: true });
    }

    set({ droneRevealT, droneExtractT, droneFlagT, hungerT });

    const now = Date.now();
    if (now - lastSave > 4000) {
      lastSave = now;
      get().persist();
    }
  },

  setPanel: (p) => set({ panel: p }),
  setHover: (at) => set({ hover: at }),
  setSetting: (k, v) => {
    const settings = { ...get().settings, [k]: v };
    set({ settings });
    if (k === "sound") setSoundEnabled(Boolean(v));
    get().persist();
  },
  dismissModal: () => set({ modal: "none" }),
  toTitle: () => set({ screen: "title", modal: "none", panel: "none" }),
  openHelp: () => set({ modal: "help" }),
  dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
  dismissFloater: (id) => set((s) => ({ floaters: s.floaters.filter((f) => f.id !== id) })),
  resetAll: () => {
    const fresh = defaultSave();
    set({
      ...bankFrom(fresh),
      mods: computeMods([], 0, 0),
      screen: "title",
      panel: "none",
      modal: "none",
      log: [],
      sector: null,
    });
    writeSave(fresh);
  },
}));

function rec(sector: Sector) {
  const { w, h, cells } = sector;
  for (let r = 0; r < h; r++) {
    for (let c = 0; c < w; c++) {
      const cell = cells[r * w + c]!;
      let lodes = 0;
      let rifts = 0;
      for (const [nr, nc] of neighbors(r, c, w, h)) {
        const n = cells[nr * w + nc]!;
        if (n.kind === "lode") lodes += 1;
        if (n.kind === "rift") rifts += 1;
      }
      cell.adjLodes = lodes;
      cell.adjRifts = rifts;
      if (cell.kind === "empty") cell.shown = lodes;
    }
  }
}

function extractAt(
  get: () => GameStore,
  set: (p: Partial<GameStore> | ((s: GameStore) => Partial<GameStore>)) => void,
  next: Sector,
  at: number,
  opts: { click: boolean; chain: boolean },
) {
  const s = get();
  const cell = next.cells[at]!;
  if (cell.kind !== "lode" || cell.extracted) return;
  cell.extracted = true;
  cell.revealed = true;
  cell.mark = "none";
  next.lodeLeft = Math.max(0, next.lodeLeft - 1);

  let combo = s.combo + 1;
  const yield0 = starYield(next.star, s.mods, combo, opts.click);
  const cut = s.nextExtractCut ? 0.5 : 1;
  let amount = yield0 * cut;
  if (!opts.click) amount *= s.mods.droneYieldKeep;
  if (s.mods.lowHullYield > 0 && s.hull / maxHull(s.mods) < 0.3) amount *= 1 + s.mods.lowHullYield;
  amount *= foldBonus(s.wake);
  next.lootScrap += amount;
  let iso = 1;
  if (Math.random() < s.mods.isotopeChance) {
    iso += 1 + Math.floor(next.star / 3);
  }
  next.lootIsotopes += iso;
  sfx.extract(combo);
  const heat = Math.min(s.mods.heatCap, s.heat + s.mods.heatPerExtract);
  set({
    sector: next,
    scrap: s.scrap + amount,
    isotopes: s.isotopes + iso,
    combo,
    comboT: s.mods.comboWindow,
    heat,
    totalExtracted: s.totalExtracted + 1,
    lastLoot: next.lootScrap,
    nextExtractCut: false,
    flash: [at],
    trauma: Math.min(1, s.trauma + 0.12),
  });
  addFloater(set, `+${Math.floor(amount)}${combo > 1 ? ` ×${combo}` : ""}`, at, next, combo > 3 ? "combo" : "lode");
  if (iso > 1) get().pushLog("extract", `Isotope ×${iso}`);

  if (s.mods.mutinyChance > 0 && Math.random() < s.mods.mutinyChance && s.hull / maxHull(s.mods) < 0.3) {
    get().pushLog("system", "Mutiny Engine folded you home.");
    get().recall();
    return;
  }

  if (s.mods.chainExtract && !opts.chain) {
    const r = Math.floor(at / next.w);
    const c = at % next.w;
    for (const [nr, nc] of neighbors(r, c, next.w, next.h)) {
      const n = next.cells[idx(nr, nc, next.w)]!;
      if (n.kind === "lode" && !n.extracted) {
        extractAt(get, set, get().sector ? cloneSector(get().sector!) : next, idx(nr, nc, next.w), {
          click: false,
          chain: true,
        });
        break;
      }
    }
  }

  if (isPerfect(get().sector ?? next) && get().hull > 0) {
    const live = get().sector ?? next;
    let bonus = live.lootScrap * (s.mods.perfectTriple ? 2 : 0.25);
    const shards = shardFromRecall(live.star, live.lodeTotal, live.lodeTotal, true, s.mods);
    set((st) => ({
      scrap: st.scrap + bonus,
      shards: st.shards + shards,
      sectorsCleared: st.sectorsCleared + 1,
      star: st.star + 1,
    }));
    get().pushLog("extract", s.mods.perfectTriple ? "Gilded Core. The sector paid thrice." : "Perfect lattice. Shards in the wake.");
    set({ lastLoot: live.lootScrap + bonus });
    get().dropSector();
    get().persist();
  }
}

function settleRecall(
  get: () => GameStore,
  set: (p: Partial<GameStore> | ((s: GameStore) => Partial<GameStore>)) => void,
  death: boolean,
) {
  const s = get();
  const sector = s.sector;
  if (!sector) return;
  const extracted = sector.lodeTotal - sector.lodeLeft;
  const shards = death ? 0 : shardFromRecall(sector.star, extracted, sector.lodeTotal, false, s.mods);
  sfx.recall();
  set({
    shards: s.shards + shards,
    combo: 0,
    comboT: 0,
    heat: s.heat * 0.5,
    lastLoot: sector.lootScrap,
    modal: "none",
    star: extracted > 0 ? s.star : Math.max(0, s.star),
    sectorsCleared: extracted > 0 ? s.sectorsCleared + (extracted === sector.lodeTotal ? 1 : 0) : s.sectorsCleared,
  });
  get().pushLog("recall", `Recall · ${extracted}/${sector.lodeTotal} lodes · +${shards.toFixed(1)} shards`);
  get().dropSector();
  get().persist();
}

function addFloater(
  set: (p: Partial<GameStore> | ((s: GameStore) => Partial<GameStore>)) => void,
  text: string,
  at: number,
  sector: Sector,
  tone: Floater["tone"],
) {
  const x = (at % sector.w) / sector.w;
  const y = Math.floor(at / sector.w) / sector.h;
  const id = floatSeq++;
  set((s) => ({ floaters: [...s.floaters, { id, text, x, y, tone }].slice(-12) }));
}

function rateScrap(away: number, gained: number) {
  return away > 30 && gained > 0;
}

export function cellAt(sector: Sector, at: number): Cell {
  return sector.cells[at]!;
}
