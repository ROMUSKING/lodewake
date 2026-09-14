import type { Mods, TreeId } from "./types";

export type SkillEffects = Partial<Mods>;

export type SkillNode = {
  id: string;
  tree: TreeId;
  tier: 1 | 2 | 3 | 4 | 5;
  name: string;
  lore: string;
  buff: string;
  debuff: string;
  isotopes: number;
  shards?: number;
  requires: string[];
  effects: SkillEffects;
};

export const TREE_META: Record<
  TreeId,
  { name: string; keel: string; blurb: string }
> = {
  sonar: {
    name: "Sonar",
    keel: "The listening keel",
    blurb: "Marks become readable. The lattice notices you listening.",
  },
  lode: {
    name: "Lode",
    keel: "The greedy keel",
    blurb: "Take more. The next sector grows teeth.",
  },
  hull: {
    name: "Hull",
    keel: "The iron keel",
    blurb: "Endure. Every plate you bolt on slows the take.",
  },
  swarm: {
    name: "Swarm",
    keel: "The many keel",
    blurb: "Hands you do not have. They keep a cut, and they hum.",
  },
  fold: {
    name: "Fold",
    keel: "The leaving keel",
    blurb: "Jump farther. Arrive in a meaner grid.",
  },
  nerve: {
    name: "Nerve",
    keel: "The hot keel",
    blurb: "Hands faster than doctrine. Heat follows.",
  },
};

export const TREES: TreeId[] = ["sonar", "lode", "hull", "swarm", "fold", "nerve"];

export const SKILLS: SkillNode[] = [
  {
    id: "sonar-1",
    tree: "sonar",
    tier: 1,
    name: "Wide Ping",
    lore: "The first shout across a new lattice. Three plates answer. The hull answers too.",
    buff: "Reveal 3 extra empty cells at drop",
    debuff: "Drop costs 2 hull",
    isotopes: 6,
    requires: [],
    effects: { startRevealed: 3, startHullHit: 2 },
  },
  {
    id: "sonar-2",
    tree: "sonar",
    tier: 2,
    name: "Ghost Count",
    lore: "Rifts leave a smear on the mark. Sometimes the smear is a lie.",
    buff: "Empty cells hint adjacent rifts as a faint pip",
    debuff: "10% of marks are off by one",
    isotopes: 36,
    requires: ["sonar-1"],
    effects: { ghostRiftHint: true, numberJitter: 0.1 },
  },
  {
    id: "sonar-3",
    tree: "sonar",
    tier: 3,
    name: "Deep Echo",
    lore: "Ping a revealed plate again to confirm its neighbors. The lattice warms.",
    buff: "Re-ping a revealed mark to flash its unprobed neighbors",
    debuff: "Each extract raises Heat more",
    isotopes: 110,
    requires: ["sonar-2"],
    effects: { rePing: true, heatPerExtract: 3 },
  },
  {
    id: "sonar-4",
    tree: "sonar",
    tier: 4,
    name: "Lattice Memory",
    lore: "You carry the last density like a bruise. The new grid underpays you for the warning.",
    buff: "See lode and rift counts before you drop",
    debuff: "−15% extract yield",
    isotopes: 340,
    requires: ["sonar-3", "lode-1"],
    effects: { densityPreview: true, extractYield: -0.15 },
  },
  {
    id: "sonar-5",
    tree: "sonar",
    tier: 5,
    name: "Omniscient Veil",
    lore: "Every empty plate is already speaking. The rifts hate being seen this clearly.",
    buff: "Start with every number revealed",
    debuff: "Rifts deal double damage",
    isotopes: 1200,
    requires: ["sonar-4", "hull-2"],
    effects: { allNumbersStart: true, riftDamage: 1 },
  },
  {
    id: "lode-1",
    tree: "lode",
    tier: 1,
    name: "Overdraw",
    lore: "Pull the vein past the Compact’s old limit. Something else slides in to fill the gap.",
    buff: "+40% scrap per lodestone",
    debuff: "+1 rift in every sector",
    isotopes: 8,
    requires: [],
    effects: { extractYield: 0.4, extraRifts: 1 },
  },
  {
    id: "lode-2",
    tree: "lode",
    tier: 2,
    name: "Vein Chain",
    lore: "One take tugs the next. The window to string them shutters sooner.",
    buff: "Extracting a lode may auto-take one adjacent guaranteed lode",
    debuff: "Combo window 30% shorter",
    isotopes: 42,
    requires: ["lode-1"],
    effects: { chainExtract: true, comboWindow: -0.3 },
  },
  {
    id: "lode-3",
    tree: "lode",
    tier: 3,
    name: "Isotope Bleed",
    lore: "The ore sweats rare matter. Weaves drink slower after.",
    buff: "Lodestones often drop isotopes",
    debuff: "Hull regen 30% slower",
    isotopes: 130,
    requires: ["lode-2", "sonar-1"],
    effects: { isotopeChance: 0.35, hullRegen: -0.3 },
  },
  {
    id: "lode-4",
    tree: "lode",
    tier: 4,
    name: "Gilded Core",
    lore: "A perfect sector pays like three. A failed one takes the wake with it.",
    buff: "Perfect clear triples sector loot",
    debuff: "Death discards 50% more of the take",
    isotopes: 420,
    requires: ["lode-3"],
    effects: { perfectTriple: true, failPenalty: 0.5 },
  },
  {
    id: "lode-5",
    tree: "lode",
    tier: 5,
    name: "Hunger Protocol",
    lore: "The ship will not leave a full table. It eats without you.",
    buff: "Auto-extract a remaining lode every 8s",
    debuff: "Cannot recall until 70% of lodes are taken",
    isotopes: 1500,
    requires: ["lode-4", "swarm-2", "nerve-1"],
    effects: { hungerAuto: true, cannotRecallUntil: 0.7 },
  },
  {
    id: "hull-1",
    tree: "hull",
    tier: 1,
    name: "Ablative Skin",
    lore: "Plates that flake instead of split. The extractor has to push through them too.",
    buff: "+25 max hull",
    debuff: "−10% extract yield",
    isotopes: 6,
    requires: [],
    effects: { maxHullAdd: 25, extractYield: -0.1 },
  },
  {
    id: "hull-2",
    tree: "hull",
    tier: 2,
    name: "Rift Temper",
    lore: "The first bite in a sector is only a kiss. The next take is shy.",
    buff: "First rift each sector deals 1 damage",
    debuff: "The following extract is halved",
    isotopes: 40,
    requires: ["hull-1"],
    effects: { riftTemper: true },
  },
  {
    id: "hull-3",
    tree: "hull",
    tier: 3,
    name: "Cold Iron",
    lore: "Heat bleeds into the plates. Combos go dull.",
    buff: "Heat from extracts −40%",
    debuff: "Combo yield halved",
    isotopes: 120,
    requires: ["hull-2"],
    effects: { heatPerExtract: -4, comboYield: -0.5 },
  },
  {
    id: "hull-4",
    tree: "hull",
    tier: 4,
    name: "Bulkhead Choir",
    lore: "The ship sings itself closed. Drones wait for the hymn to finish.",
    buff: "Hull regenerates while you wait",
    debuff: "Drones 20% slower",
    isotopes: 380,
    requires: ["hull-3", "swarm-1"],
    effects: { hullRegen: 0.55, droneIntervalMul: 0.2 },
  },
  {
    id: "hull-5",
    tree: "hull",
    tier: 5,
    name: "Unbreakable",
    lore: "You do not die. You limp. The Fold records the limp as a lesser story.",
    buff: "On hull 0, keep 30% of sector loot",
    debuff: "−40% fold shards",
    isotopes: 1400,
    requires: ["hull-4", "fold-1"],
    effects: { deathKeep: 0.3, shardGain: -0.4 },
  },
  {
    id: "swarm-1",
    tree: "swarm",
    tier: 1,
    name: "Scout Mite",
    lore: "A listener the size of a thumbnail. It hates sharing the lattice with your finger.",
    buff: "A drone reveals a safe empty every 4s",
    debuff: "Probing while it works costs 1 hull",
    isotopes: 10,
    requires: [],
    effects: { droneRevealInterval: 4, droneClickHull: 1 },
  },
  {
    id: "swarm-2",
    tree: "swarm",
    tier: 2,
    name: "Harvest Bees",
    lore: "They take what you marked. They keep a taste.",
    buff: "Drones extract marked lodestones",
    debuff: "8% of that yield is theirs",
    isotopes: 55,
    requires: ["swarm-1"],
    effects: { droneExtractInterval: 6, droneYieldKeep: -0.08 },
  },
  {
    id: "swarm-3",
    tree: "swarm",
    tier: 3,
    name: "Swarm Mind",
    lore: "More bodies, shorter waits. The air in the bay gets hot.",
    buff: "All drone intervals 30% faster",
    debuff: "Extracts raise Heat more",
    isotopes: 160,
    requires: ["swarm-2", "sonar-2"],
    effects: { droneIntervalMul: -0.3, heatPerExtract: 2 },
  },
  {
    id: "swarm-4",
    tree: "swarm",
    tier: 4,
    name: "Silent Fleet",
    lore: "They work in the dark while you sleep. Your own hands forget the weight.",
    buff: "Offline production ×2",
    debuff: "−25% click extract yield",
    isotopes: 480,
    requires: ["swarm-3"],
    effects: { offlineMult: 1, clickYield: -0.25 },
  },
  {
    id: "swarm-5",
    tree: "swarm",
    tier: 5,
    name: "Colony Drop",
    lore: "They guess. They are usually right. When they are wrong, the hull knows.",
    buff: "Drones auto-mark suspected lodes at 70% accuracy",
    debuff: "A wrong mark costs 4 hull",
    isotopes: 1600,
    requires: ["swarm-4", "lode-3", "sonar-3"],
    effects: { colonyFlagAccuracy: 0.7 },
  },
  {
    id: "fold-1",
    tree: "fold",
    tier: 1,
    name: "Near Fold",
    lore: "Leave a little earlier, arrive a little larger.",
    buff: "+15% fold shards on recall",
    debuff: "Sectors grow +1 on a side",
    isotopes: 12,
    shards: 1,
    requires: [],
    effects: { shardGain: 0.15, sectorSizeBonus: 1 },
  },
  {
    id: "fold-2",
    tree: "fold",
    tier: 2,
    name: "Echo Inherit",
    lore: "A bruise of the last wake stays in the plates. You arrive already hurt.",
    buff: "Keel costs −20% after each Fold",
    debuff: "New runs start at 80% hull",
    isotopes: 70,
    shards: 3,
    requires: ["fold-1"],
    effects: { startHullFrac: -0.2 },
  },
  {
    id: "fold-3",
    tree: "fold",
    tier: 3,
    name: "Lattice Skip",
    lore: "Skip a kind star. The meaner one is waiting.",
    buff: "You may jump +1 star when dropping",
    debuff: "Rifts deal +1 damage",
    isotopes: 200,
    shards: 8,
    requires: ["fold-2", "hull-2"],
    effects: { riftDamageAdd: 1 },
  },
  {
    id: "fold-4",
    tree: "fold",
    tier: 4,
    name: "Pale Wake",
    lore: "A full mend, bought with three angry grids.",
    buff: "Folding fully repairs hull",
    debuff: "Next 3 sectors spawn +1 rift",
    isotopes: 600,
    shards: 20,
    requires: ["fold-3"],
    effects: {},
  },
  {
    id: "fold-5",
    tree: "fold",
    tier: 5,
    name: "True Fold",
    lore: "Burn the keels. Keep the scar. Permanent take, empty bay.",
    buff: "Folding now also resets keels; +2% yield per True Fold forever",
    debuff: "Lose all drones on that Fold",
    isotopes: 2200,
    shards: 60,
    requires: ["fold-4", "sonar-3", "lode-3", "nerve-3"],
    effects: {},
  },
  {
    id: "nerve-1",
    tree: "nerve",
    tier: 1,
    name: "Hot Hands",
    lore: "The plate is still ringing when you take it. So is the bay.",
    buff: "+20% click extract yield",
    debuff: "Each click extract adds Heat",
    isotopes: 8,
    requires: [],
    effects: { clickYield: 0.2, heatPerExtract: 3 },
  },
  {
    id: "nerve-2",
    tree: "nerve",
    tier: 2,
    name: "Streak Wire",
    lore: "The combo lasts. An empty plate, touched in greed, bites.",
    buff: "Combo window +50%",
    debuff: "Probing an empty cell costs 1 hull and breaks combo",
    isotopes: 48,
    requires: ["nerve-1"],
    effects: { comboWindow: 0.5, missCostsHull: true },
  },
  {
    id: "nerve-3",
    tree: "nerve",
    tier: 3,
    name: "Adrenal Ping",
    lore: "Streaks pay more. At the cap, the hull cooks.",
    buff: "Combo multiplies yield harder",
    debuff: "At max Heat, hull drains",
    isotopes: 150,
    requires: ["nerve-2", "lode-1"],
    effects: { comboYield: 0.35, heatHullDrain: true },
  },
  {
    id: "nerve-4",
    tree: "nerve",
    tier: 4,
    name: "Quiet Watch",
    lore: "Hover a mark and the bay slows. The swarm waits for your eye to leave.",
    buff: "Hovering a number highlights legal neighbors",
    debuff: "Drones pause while you hover",
    isotopes: 440,
    requires: ["nerve-3", "sonar-2"],
    effects: { slowMoOnHover: true, disableAutoWhileHover: true },
  },
  {
    id: "nerve-5",
    tree: "nerve",
    tier: 5,
    name: "Mutiny Engine",
    lore: "At the edge of breaking, the take doubles. Sometimes the crew folds you home.",
    buff: "Below 30% hull, extract yield ×2",
    debuff: "5% chance each extract to force Recall",
    isotopes: 1550,
    requires: ["nerve-4", "hull-3"],
    effects: { lowHullYield: 1, mutinyChance: 0.05 },
  },
];

export const SKILL_BY_ID: Record<string, SkillNode> = Object.fromEntries(
  SKILLS.map((s) => [s.id, s]),
);

export function skillsInTree(tree: TreeId): SkillNode[] {
  return SKILLS.filter((s) => s.tree === tree).sort((a, b) => a.tier - b.tier);
}

export function isOwned(owned: string[], id: string): boolean {
  return owned.includes(id);
}

export function missingRequires(owned: string[], node: SkillNode): string[] {
  return node.requires.filter((id) => !owned.includes(id));
}

export function canBuy(
  owned: string[],
  node: SkillNode,
  isotopes: number,
  shards: number,
  costMul: number,
): { ok: boolean; reason?: string } {
  if (owned.includes(node.id)) return { ok: false, reason: "Already fitted" };
  const miss = missingRequires(owned, node);
  if (miss.length) {
    const names = miss.map((id) => SKILL_BY_ID[id]?.name ?? id).join(", ");
    return { ok: false, reason: `Needs ${names}` };
  }
  const iso = Math.ceil(node.isotopes * costMul);
  if (isotopes < iso) return { ok: false, reason: `${iso} isotopes` };
  if ((node.shards ?? 0) > shards) return { ok: false, reason: `${node.shards} shards` };
  return { ok: true };
}
