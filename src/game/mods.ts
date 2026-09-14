import { SKILLS } from "./skills";
import type { Mods } from "./types";

export const BASE_HULL = 40;
export const BASE_HEAT_CAP = 100;

export function emptyMods(): Mods {
  return {
    startRevealed: 1,
    startHullHit: 0,
    maxHullAdd: 0,
    hullRegen: 0,
    extractYield: 1,
    clickYield: 1,
    isotopeChance: 0.28,
    riftDamage: 1,
    riftDamageAdd: 0,
    heatPerExtract: 6,
    heatCap: BASE_HEAT_CAP,
    comboWindow: 2.4,
    comboYield: 0.12,
    droneRevealInterval: 0,
    droneExtractInterval: 0,
    droneYieldKeep: 1,
    droneIntervalMul: 1,
    offlineMult: 1,
    shardGain: 1,
    sectorSizeBonus: 0,
    extraRifts: 0,
    extraLodes: 0,
    ghostRiftHint: false,
    numberJitter: 0,
    rePing: false,
    densityPreview: false,
    allNumbersStart: false,
    chainExtract: false,
    perfectTriple: false,
    failPenalty: 0,
    hungerAuto: false,
    cannotRecallUntil: 0,
    riftTemper: false,
    deathKeep: 0,
    droneClickHull: 0,
    colonyFlagAccuracy: 0,
    startHullFrac: 1,
    heatHullDrain: false,
    lowHullYield: 0,
    mutinyChance: 0,
    slowMoOnHover: false,
    disableAutoWhileHover: false,
    missCostsHull: false,
    skillCostMul: 1,
    permYield: 0,
    nextExtractCut: 0,
  };
}

export function computeMods(owned: string[], trueFolds: number, skillDiscount: number): Mods {
  const m = emptyMods();
  for (const id of owned) {
    const node = SKILLS.find((s) => s.id === id);
    if (!node) continue;
    const e = node.effects;
    if (e.startRevealed) m.startRevealed += e.startRevealed;
    if (e.startHullHit) m.startHullHit += e.startHullHit;
    if (e.maxHullAdd) m.maxHullAdd += e.maxHullAdd;
    if (e.hullRegen) m.hullRegen += e.hullRegen;
    if (e.extractYield) m.extractYield += e.extractYield;
    if (e.clickYield) m.clickYield += e.clickYield;
    if (e.isotopeChance) m.isotopeChance += e.isotopeChance;
    if (e.riftDamage) m.riftDamage += e.riftDamage;
    if (e.riftDamageAdd) m.riftDamageAdd += e.riftDamageAdd;
    if (e.heatPerExtract) m.heatPerExtract += e.heatPerExtract;
    if (e.comboWindow) m.comboWindow += m.comboWindow * e.comboWindow;
    if (e.comboYield) m.comboYield += e.comboYield;
    if (e.droneRevealInterval) m.droneRevealInterval = e.droneRevealInterval;
    if (e.droneExtractInterval) m.droneExtractInterval = e.droneExtractInterval;
    if (e.droneYieldKeep) m.droneYieldKeep += e.droneYieldKeep;
    if (e.droneIntervalMul) m.droneIntervalMul += e.droneIntervalMul;
    if (e.offlineMult) m.offlineMult += e.offlineMult;
    if (e.shardGain) m.shardGain += e.shardGain;
    if (e.sectorSizeBonus) m.sectorSizeBonus += e.sectorSizeBonus;
    if (e.extraRifts) m.extraRifts += e.extraRifts;
    if (e.extraLodes) m.extraLodes += e.extraLodes;
    if (e.ghostRiftHint) m.ghostRiftHint = true;
    if (e.numberJitter) m.numberJitter += e.numberJitter;
    if (e.rePing) m.rePing = true;
    if (e.densityPreview) m.densityPreview = true;
    if (e.allNumbersStart) m.allNumbersStart = true;
    if (e.chainExtract) m.chainExtract = true;
    if (e.perfectTriple) m.perfectTriple = true;
    if (e.failPenalty) m.failPenalty += e.failPenalty;
    if (e.hungerAuto) m.hungerAuto = true;
    if (e.cannotRecallUntil) m.cannotRecallUntil = Math.max(m.cannotRecallUntil, e.cannotRecallUntil);
    if (e.riftTemper) m.riftTemper = true;
    if (e.deathKeep) m.deathKeep = Math.max(m.deathKeep, e.deathKeep);
    if (e.droneClickHull) m.droneClickHull += e.droneClickHull;
    if (e.colonyFlagAccuracy) m.colonyFlagAccuracy = e.colonyFlagAccuracy;
    if (e.startHullFrac) m.startHullFrac += e.startHullFrac;
    if (e.heatHullDrain) m.heatHullDrain = true;
    if (e.lowHullYield) m.lowHullYield += e.lowHullYield;
    if (e.mutinyChance) m.mutinyChance += e.mutinyChance;
    if (e.slowMoOnHover) m.slowMoOnHover = true;
    if (e.disableAutoWhileHover) m.disableAutoWhileHover = true;
    if (e.missCostsHull) m.missCostsHull = true;
    if (e.skillCostMul) m.skillCostMul += e.skillCostMul;
  }
  m.permYield = trueFolds * 0.02;
  m.skillCostMul *= 1 - Math.min(0.4, skillDiscount);
  m.extractYield = Math.max(0.2, m.extractYield + m.permYield);
  m.clickYield = Math.max(0.2, m.clickYield);
  m.droneYieldKeep = Math.max(0.4, m.droneYieldKeep);
  m.droneIntervalMul = Math.max(0.35, m.droneIntervalMul);
  m.comboWindow = Math.max(0.6, m.comboWindow);
  m.heatPerExtract = Math.max(1, m.heatPerExtract);
  m.hullRegen = Math.max(0, m.hullRegen);
  m.isotopeChance = Math.min(0.85, Math.max(0, m.isotopeChance));
  m.startHullFrac = Math.min(1, Math.max(0.3, m.startHullFrac));
  m.offlineMult = Math.max(0.25, m.offlineMult);
  m.shardGain = Math.max(0.15, m.shardGain);
  m.riftDamage = Math.max(0.5, m.riftDamage);
  return m;
}

export function maxHull(mods: Mods): number {
  return BASE_HULL + mods.maxHullAdd;
}
