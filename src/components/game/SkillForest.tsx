import { TREES, TREE_META, SKILL_BY_ID, canBuy, skillsInTree } from "@/game/skills";
import { formatNum } from "@/game/format";
import { useGame } from "@/game/store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { TreeId } from "@/game/types";
import { useState } from "react";

export function SkillForest() {
  const [tree, setTree] = useState<TreeId>("sonar");
  const owned = useGame((s) => s.ownedSkills);
  const isotopes = useGame((s) => s.isotopes);
  const shards = useGame((s) => s.shards);
  const mods = useGame((s) => s.mods);
  const buy = useGame((s) => s.buySkill);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex gap-1 overflow-x-auto pb-2">
        {TREES.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => setTree(id)}
            className={cn(
              "h-9 shrink-0 rounded-[var(--radius-sm)] px-3 text-sm",
              tree === id ? "bg-bg-subtle text-fg" : "text-muted hover:text-fg",
            )}
          >
            {TREE_META[id].name}
          </button>
        ))}
      </div>
      <p className="mb-3 text-sm text-muted">{TREE_META[tree].blurb}</p>
      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
        {skillsInTree(tree).map((node) => {
          const fitted = owned.includes(node.id);
          const check = canBuy(owned, node, isotopes, shards, mods.skillCostMul);
          const iso = Math.ceil(node.isotopes * mods.skillCostMul);
          return (
            <article
              key={node.id}
              className={cn(
                "rounded-[var(--radius-lg)] bg-bg-elevated p-3 shadow-[var(--shadow-border)]",
                fitted && "opacity-90",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] tracking-wide text-subtle uppercase">
                    {TREE_META[node.tree].keel} · T{node.tier}
                  </p>
                  <h3 className="font-display text-lg leading-tight">{node.name}</h3>
                </div>
                {fitted ? (
                  <span className="text-xs text-ok">Fitted</span>
                ) : (
                  <Button size="sm" disabled={!check.ok} onClick={() => buy(node.id)}>
                    Fit · {formatNum(iso)}
                    {node.shards ? ` + ${node.shards}Δ` : ""}
                  </Button>
                )}
              </div>
              <p className="mt-2 text-sm leading-relaxed text-muted">{node.lore}</p>
              <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                <div className="rounded-[var(--radius-sm)] bg-bg-subtle px-3 py-2">
                  <dt className="text-[10px] tracking-wide text-subtle uppercase">Buff</dt>
                  <dd className="text-fg">{node.buff}</dd>
                </div>
                <div className="rounded-[var(--radius-sm)] bg-bg-subtle px-3 py-2">
                  <dt className="text-[10px] tracking-wide text-subtle uppercase">Debuff</dt>
                  <dd className="text-rift">{node.debuff}</dd>
                </div>
              </dl>
              {!fitted && node.requires.length > 0 ? (
                <p className="mt-2 text-xs text-subtle">
                  Needs {node.requires.map((id) => SKILL_BY_ID[id]?.name ?? id).join(" · ")}
                </p>
              ) : null}
              {!fitted && !check.ok && check.reason ? (
                <p className="mt-1 text-xs text-muted">{check.reason}</p>
              ) : null}
            </article>
          );
        })}
      </div>
    </div>
  );
}
