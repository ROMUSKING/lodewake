import type { ReactNode } from "react";
import { Radar, Gem, Shield, Bug, Orbit, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatNum } from "@/game/format";
import { extractedRatio, starSpec } from "@/game/board";
import { maxHull } from "@/game/mods";
import { useGame } from "@/game/store";
import { cn } from "@/lib/utils";

export function Hud() {
  const scrap = useGame((s) => s.scrap);
  const isotopes = useGame((s) => s.isotopes);
  const shards = useGame((s) => s.shards);
  const hull = useGame((s) => s.hull);
  const heat = useGame((s) => s.heat);
  const combo = useGame((s) => s.combo);
  const mods = useGame((s) => s.mods);
  const sector = useGame((s) => s.sector);
  const star = useGame((s) => s.star);
  const panel = useGame((s) => s.panel);
  const setPanel = useGame((s) => s.setPanel);
  const recall = useGame((s) => s.recall);
  const mh = maxHull(mods);
  const spec = starSpec(star, mods);
  const ratio = sector ? extractedRatio(sector) : 0;
  const recallLocked = mods.cannotRecallUntil > 0 && ratio < mods.cannotRecallUntil;

  return (
    <header className="border-b border-border bg-bg/90 px-3 pt-[max(0.5rem,env(safe-area-inset-top))] pb-2 backdrop-blur-sm sm:px-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="font-display text-lg leading-none tracking-tight">Lodewake</p>
          <p className="mt-1 text-[11px] tracking-wide text-subtle uppercase">
            Lattice {star + 1}
            {mods.densityPreview && sector
              ? ` · ${sector.lodeTotal} lodes · ${sector.riftTotal} rifts`
              : ` · ${spec.w}×${spec.h}`}
          </p>
        </div>
        <div className="flex gap-3 text-right font-mono text-xs tabular-nums">
          <Stat label="Scrap" value={formatNum(scrap)} />
          <Stat label="Isotopes" value={formatNum(isotopes)} />
          <Stat label="Shards" value={formatNum(shards, 1)} />
        </div>
      </div>
      <div className="mt-2 flex items-center gap-3">
        <Bar label="Hull" value={hull} max={mh} tone="ok" />
        <Bar label="Heat" value={heat} max={mods.heatCap} tone="rift" />
        {combo > 1 ? (
          <span className="shrink-0 font-mono text-xs tabular-nums text-accent">×{combo}</span>
        ) : null}
      </div>
      {sector ? (
        <p className="mt-1 font-mono text-[11px] text-subtle tabular-nums">
          {sector.lodeTotal - sector.lodeLeft}/{sector.lodeTotal} extracted
        </p>
      ) : null}
      <nav className="mt-2 hidden gap-1 sm:flex">
        <NavBtn active={panel === "none"} onClick={() => setPanel("none")} icon={<Radar className="size-3.5" />}>
          Lattice
        </NavBtn>
        <NavBtn active={panel === "keels"} onClick={() => setPanel("keels")} icon={<Zap className="size-3.5" />}>
          Keels
        </NavBtn>
        <NavBtn active={panel === "bay"} onClick={() => setPanel("bay")} icon={<Bug className="size-3.5" />}>
          Bay
        </NavBtn>
        <NavBtn active={panel === "codex"} onClick={() => setPanel("codex")} icon={<Orbit className="size-3.5" />}>
          Codex
        </NavBtn>
        <Button size="sm" variant="secondary" className="ml-auto" disabled={recallLocked} onClick={recall}>
          Recall
        </Button>
      </nav>
      <div className="mt-2 hidden text-[11px] text-subtle sm:flex sm:gap-4">
        <span className="inline-flex items-center gap-1"><Gem className="size-3 text-lode" /> Tap hidden lode to extract</span>
        <span className="inline-flex items-center gap-1"><Shield className="size-3 text-rift" /> Long-press / right-click to mark</span>
      </div>
    </header>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] tracking-wide text-subtle uppercase">{label}</div>
      <div className="text-fg">{value}</div>
    </div>
  );
}

function Bar({
  label,
  value,
  max,
  tone,
}: {
  label: string;
  value: number;
  max: number;
  tone: "ok" | "rift";
}) {
  const pct = Math.max(0, Math.min(100, (value / Math.max(1, max)) * 100));
  return (
    <div className="min-w-0 flex-1">
      <div className="mb-0.5 flex justify-between font-mono text-[10px] text-subtle tabular-nums">
        <span>{label}</span>
        <span>
          {Math.ceil(value)}/{Math.ceil(max)}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-bg-subtle">
        <div
          className={cn("h-full rounded-full", tone === "ok" ? "bg-ok" : "bg-rift")}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function NavBtn({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex h-9 items-center gap-1.5 rounded-[var(--radius-sm)] px-3 text-sm",
        active ? "bg-bg-subtle text-fg" : "text-muted hover:text-fg",
      )}
    >
      {icon}
      {children}
    </button>
  );
}
