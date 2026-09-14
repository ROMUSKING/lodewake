import { useRef } from "react";
import { cn } from "@/lib/utils";
import { neighbors } from "@/game/board";
import { useGame } from "@/game/store";

export function SectorBoard() {
  const sector = useGame((s) => s.sector);
  const flash = useGame((s) => s.flash);
  const hover = useGame((s) => s.hover);
  const mods = useGame((s) => s.mods);
  const trauma = useGame((s) => s.trauma);
  const shakeOn = useGame((s) => s.settings.shake);
  const reduced = useGame((s) => s.settings.reducedMotion);
  const probe = useGame((s) => s.probe);
  const mark = useGame((s) => s.mark);
  const setHover = useGame((s) => s.setHover);
  const floaters = useGame((s) => s.floaters);
  const dismissFloater = useGame((s) => s.dismissFloater);
  const hold = useRef<{ t: number; at: number } | null>(null);

  if (!sector) {
    return (
      <div className="grid min-h-64 place-items-center text-sm text-muted">
        Lattice folding…
      </div>
    );
  }

  const { w, h, cells } = sector;
  const shake = shakeOn && !reduced ? trauma * trauma * 6 : 0;
  const ox = shake ? (Math.random() - 0.5) * shake : 0;
  const oy = shake ? (Math.random() - 0.5) * shake : 0;

  const highlight = new Set<number>();
  if (mods.slowMoOnHover && hover !== null) {
    const r = Math.floor(hover / w);
    const c = hover % w;
    const cell = cells[hover];
    if (cell?.revealed && cell.kind === "empty") {
      for (const [nr, nc] of neighbors(r, c, w, h)) highlight.add(nr * w + nc);
    }
  }

  return (
    <div className="relative mx-auto w-full max-w-[min(100%,720px)]">
      <div
        className="relative grid gap-[3px] p-1 sm:gap-1"
        style={{
          gridTemplateColumns: `repeat(${w}, minmax(0, 1fr))`,
          transform: `translate(${ox}px, ${oy}px)`,
        }}
      >
        {cells.map((cell, at) => {
          const nClass = cell.revealed && cell.kind === "empty" && cell.shown > 0 ? `n${cell.shown}` : "";
          const cls = cell.extracted
            ? "cell-lode"
            : cell.ruptured
              ? "cell-rift"
              : cell.revealed
                ? "cell-empty"
                : "cell-hidden";
          const label = cell.extracted
            ? "Lode extracted"
            : cell.ruptured
              ? "Rift"
              : cell.revealed && cell.kind === "empty"
                ? `${cell.shown} adjacent lodestones`
                : "Hidden plate";
          return (
            <button
              key={at}
              type="button"
              aria-label={label}
              className={cn(
                "cell aspect-square min-h-0 w-full min-w-0 text-[11px] sm:text-sm",
                cls,
                nClass,
                flash.includes(at) && "cell-flash",
                highlight.has(at) && "ring-1 ring-accent/50",
                hover === at && "cell-cursor",
              )}
              onPointerDown={(e) => {
                if (e.pointerType === "touch") {
                  hold.current = { t: window.setTimeout(() => mark(at), 380), at };
                }
              }}
              onPointerUp={() => {
                if (hold.current) {
                  clearTimeout(hold.current.t);
                  hold.current = null;
                }
              }}
              onPointerLeave={() => {
                if (hold.current) {
                  clearTimeout(hold.current.t);
                  hold.current = null;
                }
                setHover(null);
              }}
              onClick={() => probe(at)}
              onContextMenu={(e) => {
                e.preventDefault();
                mark(at);
              }}
              onMouseEnter={() => setHover(at)}
            >
              {cell.revealed && cell.kind === "empty" && cell.shown > 0 ? cell.shown : null}
              {!cell.revealed && cell.mark === "lode" ? (
                <span className="pointer-events-none text-[10px] leading-none text-lode sm:text-xs">◆</span>
              ) : null}
              {!cell.revealed && cell.mark === "rift" ? (
                <span className="pointer-events-none text-[11px] leading-none text-rift sm:text-sm">×</span>
              ) : null}
              {mods.ghostRiftHint && cell.revealed && cell.kind === "empty" && cell.adjRifts > 0 ? (
                <span className="absolute bottom-0.5 left-0.5 size-1 rounded-full bg-rift/70" />
              ) : null}
            </button>
          );
        })}
      </div>
      {floaters.map((f) => (
        <span
          key={f.id}
          className={cn(
            "floater absolute z-10",
            f.tone === "rift" ? "text-rift" : f.tone === "combo" ? "text-accent" : "text-lode",
          )}
          style={{ left: `${(f.x + 0.5 / w) * 100}%`, top: `${f.y * 100}%` }}
          onAnimationEnd={() => dismissFloater(f.id)}
        >
          {f.text}
        </span>
      ))}
    </div>
  );
}
