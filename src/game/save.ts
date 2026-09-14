import type { SaveBlob, Settings } from "./types";

export const SAVE_KEY = "lodewake.save.v1";
export const BACKUP_KEY = "lodewake.save.bak";
export const SAVE_VERSION = 1;

export const defaultSettings = (): Settings => ({
  shake: true,
  sound: true,
  reducedMotion: false,
});

export function defaultSave(): SaveBlob {
  return {
    version: SAVE_VERSION,
    scrap: 0,
    isotopes: 0,
    shards: 0,
    hull: 40,
    heat: 0,
    combo: 0,
    wake: 0,
    star: 0,
    sectorsCleared: 0,
    totalExtracted: 0,
    ownedSkills: [],
    generators: { scout: 0, bees: 0, weave: 0, foundry: 0 },
    trueFolds: 0,
    skillDiscount: 0,
    lastTick: Date.now(),
    settings: defaultSettings(),
    seenTutorial: false,
    paleSectorsLeft: 0,
    sector: null,
  };
}

function migrate(raw: SaveBlob): SaveBlob {
  const base = defaultSave();
  const s = { ...base, ...raw };
  s.settings = { ...base.settings, ...(raw.settings ?? {}) };
  s.generators = { ...base.generators, ...(raw.generators ?? {}) };
  s.ownedSkills = Array.isArray(raw.ownedSkills) ? raw.ownedSkills : [];
  if (s.version < SAVE_VERSION) s.version = SAVE_VERSION;
  return s;
}

export function loadSave(): SaveBlob {
  if (typeof localStorage === "undefined") return defaultSave();
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return defaultSave();
    const parsed = JSON.parse(raw) as SaveBlob;
    return migrate(parsed);
  } catch {
    try {
      const bak = localStorage.getItem(BACKUP_KEY);
      if (bak) return migrate(JSON.parse(bak) as SaveBlob);
    } catch {
      /* empty */
    }
    return defaultSave();
  }
}

export function writeSave(blob: SaveBlob) {
  if (typeof localStorage === "undefined") return;
  try {
    const prev = localStorage.getItem(SAVE_KEY);
    if (prev) localStorage.setItem(BACKUP_KEY, prev);
    localStorage.setItem(SAVE_KEY, JSON.stringify({ ...blob, version: SAVE_VERSION }));
  } catch {
    /* quota / private mode */
  }
}

export function exportSave(blob: SaveBlob): string {
  return JSON.stringify({ ...blob, version: SAVE_VERSION }, null, 2);
}

export function importSave(text: string): SaveBlob | null {
  try {
    const parsed = JSON.parse(text) as SaveBlob;
    if (typeof parsed !== "object" || parsed === null) return null;
    return migrate(parsed);
  } catch {
    return null;
  }
}

export function clearSaves() {
  if (typeof localStorage === "undefined") return;
  localStorage.removeItem(SAVE_KEY);
  localStorage.removeItem(BACKUP_KEY);
}
