export type TreeId = "sonar" | "lode" | "hull" | "swarm" | "fold" | "nerve";

export type CellKind = "empty" | "lode" | "rift";
export type Mark = "none" | "lode" | "rift";

export type Cell = {
  kind: CellKind;
  revealed: boolean;
  extracted: boolean;
  ruptured: boolean;
  mark: Mark;
  adjLodes: number;
  adjRifts: number;
  shown: number;
};

export type Sector = {
  w: number;
  h: number;
  star: number;
  seed: number;
  cells: Cell[];
  lodeTotal: number;
  lodeLeft: number;
  riftTotal: number;
  firstClick: boolean;
  startedAt: number;
  lootScrap: number;
  lootIsotopes: number;
  tempered: boolean;
  paleSectorsLeft: number;
};

export type LogKind = "extract" | "rift" | "recall" | "fold" | "skill" | "drone" | "system";

export type LogEntry = {
  id: number;
  kind: LogKind;
  text: string;
  at: number;
};

export type Floater = {
  id: number;
  text: string;
  x: number;
  y: number;
  tone: "lode" | "rift" | "combo" | "mute";
};

export type GeneratorId = "scout" | "bees" | "weave" | "foundry";

export type Settings = {
  shake: boolean;
  sound: boolean;
  reducedMotion: boolean;
};

export type Screen = "title" | "play";

export type PlayPanel = "none" | "keels" | "bay" | "codex";

export type Mods = {
  startRevealed: number;
  startHullHit: number;
  maxHullAdd: number;
  hullRegen: number;
  extractYield: number;
  clickYield: number;
  isotopeChance: number;
  riftDamage: number;
  riftDamageAdd: number;
  heatPerExtract: number;
  heatCap: number;
  comboWindow: number;
  comboYield: number;
  droneRevealInterval: number;
  droneExtractInterval: number;
  droneYieldKeep: number;
  droneIntervalMul: number;
  offlineMult: number;
  shardGain: number;
  sectorSizeBonus: number;
  extraRifts: number;
  extraLodes: number;
  ghostRiftHint: boolean;
  numberJitter: number;
  rePing: boolean;
  densityPreview: boolean;
  allNumbersStart: boolean;
  chainExtract: boolean;
  perfectTriple: boolean;
  failPenalty: number;
  hungerAuto: boolean;
  cannotRecallUntil: number;
  riftTemper: boolean;
  deathKeep: number;
  droneClickHull: number;
  colonyFlagAccuracy: number;
  startHullFrac: number;
  heatHullDrain: boolean;
  lowHullYield: number;
  mutinyChance: number;
  slowMoOnHover: boolean;
  disableAutoWhileHover: boolean;
  missCostsHull: boolean;
  skillCostMul: number;
  permYield: number;
  nextExtractCut: number;
};

export type SaveBlob = {
  version: number;
  scrap: number;
  isotopes: number;
  shards: number;
  hull: number;
  heat: number;
  combo: number;
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
  sector: {
    w: number;
    h: number;
    star: number;
    seed: number;
    cells: Cell[];
    lodeTotal: number;
    lodeLeft: number;
    riftTotal: number;
    firstClick: boolean;
    startedAt: number;
    lootScrap: number;
    lootIsotopes: number;
    tempered: boolean;
    paleSectorsLeft: number;
  } | null;
};
