import { useEffect, type ReactNode } from "react";
import { Radar, Zap, Bug, Orbit, Undo2 } from "lucide-react";
import { useGame } from "@/game/store";
import { extractedRatio } from "@/game/board";
import { TitleScreen } from "./TitleScreen";
import { Hud } from "./Hud";
import { SectorBoard } from "./SectorBoard";
import { SkillForest } from "./SkillForest";
import { Bay } from "./Bay";
import { Codex } from "./Codex";
import { Modals } from "./Modals";
import { cn } from "@/lib/utils";

export function GameApp() {
  const hydrated = useGame((s) => s.hydrated);
  const hydrate = useGame((s) => s.hydrate);
  const persist = useGame((s) => s.persist);
  const tick = useGame((s) => s.tick);
  const screen = useGame((s) => s.screen);
  const panel = useGame((s) => s.panel);
  const setPanel = useGame((s) => s.setPanel);
  const recall = useGame((s) => s.recall);
  const sector = useGame((s) => s.sector);
  const mods = useGame((s) => s.mods);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    let id = 0;
    let acc = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      acc += dt;
      const step = 1 / 20;
      while (acc >= step) {
        tick(step);
        acc -= step;
      }
      id = requestAnimationFrame(loop);
    };
    id = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(id);
  }, [tick]);

  useEffect(() => {
    const onHide = () => {
      if (document.visibilityState === "hidden") persist();
    };
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("pagehide", persist);
    return () => {
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("pagehide", persist);
    };
  }, [persist]);

  if (screen === "title" || !hydrated) return <TitleScreen />;

  const recallLocked = Boolean(
    sector && mods.cannotRecallUntil > 0 && extractedRatio(sector) < mods.cannotRecallUntil,
  );

  return (
    <div className="relative flex h-dvh flex-col overflow-hidden bg-bg text-fg">
      <Hud />
      <div className="flex min-h-0 flex-1">
        <main className="relative min-h-0 flex-1 overflow-auto p-3 sm:p-5">
          <SectorBoard />
        </main>
        <aside className="hidden w-[min(100%,380px)] shrink-0 border-l border-border bg-bg p-4 lg:flex lg:flex-col">
          {panel === "keels" ? <SkillForest /> : null}
          {panel === "codex" ? <Codex /> : null}
          {panel === "bay" || panel === "none" ? <Bay /> : null}
        </aside>
      </div>

      {panel !== "none" ? (
        <div className="absolute inset-x-0 bottom-14 top-auto z-20 flex max-h-[70%] flex-col border-t border-border bg-bg p-4 lg:hidden">
          {panel === "keels" ? <SkillForest /> : null}
          {panel === "bay" ? <Bay /> : null}
          {panel === "codex" ? <Codex /> : null}
        </div>
      ) : null}

      <nav className="flex border-t border-border bg-bg-elevated pb-[env(safe-area-inset-bottom)] lg:hidden">
        <Tab icon={<Radar className="size-4" />} label="Lattice" active={panel === "none"} onClick={() => setPanel("none")} />
        <Tab icon={<Zap className="size-4" />} label="Keels" active={panel === "keels"} onClick={() => setPanel("keels")} />
        <Tab icon={<Bug className="size-4" />} label="Bay" active={panel === "bay"} onClick={() => setPanel("bay")} />
        <Tab icon={<Orbit className="size-4" />} label="Codex" active={panel === "codex"} onClick={() => setPanel("codex")} />
        <button
          type="button"
          disabled={recallLocked}
          onClick={recall}
          className="flex min-h-14 min-w-0 flex-1 flex-col items-center justify-center gap-0.5 text-[11px] text-muted disabled:opacity-40"
        >
          <Undo2 className="size-4" />
          Recall
        </button>
      </nav>
      <Modals />
    </div>
  );
}

function Tab({
  icon,
  label,
  active,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex min-h-14 min-w-0 flex-1 flex-col items-center justify-center gap-0.5 text-[11px]",
        active ? "text-fg" : "text-muted",
      )}
    >
      {icon}
      {label}
    </button>
  );
}
