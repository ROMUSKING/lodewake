import { Button } from "@/components/ui/button";
import { formatNum } from "@/game/format";
import { useGame } from "@/game/store";

export function TitleScreen() {
  const scrap = useGame((s) => s.scrap);
  const wake = useGame((s) => s.wake);
  const sectors = useGame((s) => s.sectorsCleared);
  const start = useGame((s) => s.startRun);
  const hasWake = wake > 0 || sectors > 0 || scrap > 0;

  return (
    <div className="relative flex min-h-screen min-h-dvh flex-col overflow-hidden bg-bg text-fg">
      <img
        src="/art/veil.jpg"
        alt=""
        className="absolute inset-0 size-full object-cover opacity-70"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/70 to-bg/20" />
      <div className="relative z-10 flex flex-1 flex-col justify-end px-5 pb-[max(2rem,env(safe-area-inset-bottom))] pt-16 sm:justify-center sm:px-10">
        <p className="mb-3 text-xs font-medium tracking-[0.22em] text-accent uppercase">Survey license · Keelson</p>
        <h1 className="font-display text-5xl leading-[0.95] tracking-[-0.03em] text-fg sm:text-7xl">Lodewake</h1>
        <p className="mt-4 max-w-md text-pretty text-base leading-relaxed text-muted">
          The mines are the yield. Read the Compact’s marks, take the lodestones, and fit keels that always charge
          interest.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button size="lg" onClick={start} className="min-w-44">
            {hasWake ? "Continue survey" : "Drop the lattice"}
          </Button>
          {hasWake ? (
            <p className="text-sm text-subtle tabular-nums">
              Wake {wake} · {formatNum(scrap)} scrap · {sectors} sectors
            </p>
          ) : (
            <p className="text-sm text-subtle">Tap a plate. Extract the ore. Do not trust a quiet cell. Enter to drop.</p>
          )}
        </div>
      </div>
    </div>
  );
}
