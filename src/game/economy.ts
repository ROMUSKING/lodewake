import type { GeneratorId, Mods } from "./types";

export const GEN_COST_BASE: Record<GeneratorId, number> = {
  scout: 40,
  bees: 90,
  weave: 70,
  foundry: 55,
};

export const GEN_GROWTH = 1.14;

export const GEN_META: Record<
  GeneratorId,
  { name: string; blurb: string; unit: string }
> = {
  scout: { name: "Scout mites", blurb: "Reveal empty plates on their own.", unit: "mite" },
  bees: { name: "Harvest bees", blurb: "Take marked lodestones while you think.", unit: "bee" },
  weave: { name: "Hull weaves", blurb: "Knit plates between bites.", unit: "weave" },
  foundry: { name: "Scrap foundries", blurb: "Smelt last density into idle scrap.", unit: "vat" },
};

export function genCost(id: GeneratorId, owned: number): number {
  return Math.ceil(GEN_COST_BASE[id] * Math.pow(GEN_GROWTH, owned));
}

export function starYield(star: number, mods: Mods, combo: number, click: boolean): number {
  const base = 10 * Math.pow(1.2, star);
  const comboMul = 1 + Math.max(0, combo - 1) * mods.comboYield;
  const clickMul = click ? mods.clickYield : 1;
  return base * mods.extractYield * clickMul * comboMul;
}

export function foundryRate(owned: number, star: number, lastLoot: number): number {
  if (owned <= 0) return 0;
  const density = Math.max(4, lastLoot / 8);
  return owned * 0.35 * (1 + star * 0.12) * Math.log10(density + 10);
}

export function weaveRegen(owned: number, mods: Mods): number {
  return mods.hullRegen + owned * 0.22;
}

export function shardFromRecall(
  star: number,
  extracted: number,
  total: number,
  perfect: boolean,
  mods: Mods,
): number {
  const frac = total === 0 ? 0 : extracted / total;
  let n = (0.4 + star * 0.25) * frac;
  if (perfect) n += 1 + star * 0.15;
  return Math.max(0, n * mods.shardGain);
}

export function foldBonus(wake: number): number {
  return 1 + wake * 0.04;
}
