import { Button } from "@/components/ui/button";
import { GEN_META, genCost } from "@/game/economy";
import { formatNum } from "@/game/format";
import { useGame } from "@/game/store";
import type { GeneratorId } from "@/game/types";

const ORDER: GeneratorId[] = ["scout", "bees", "weave", "foundry"];

export function Bay() {
  const gens = useGame((s) => s.generators);
  const scrap = useGame((s) => s.scrap);
  const buy = useGame((s) => s.buyGen);
  const fold = useGame((s) => s.fold);
  const shards = useGame((s) => s.shards);
  const wake = useGame((s) => s.wake);
  const log = useGame((s) => s.log);
  const settings = useGame((s) => s.settings);
  const setSetting = useGame((s) => s.setSetting);
  const resetAll = useGame((s) => s.resetAll);
  const trueFolds = useGame((s) => s.trueFolds);
  const owned = useGame((s) => s.ownedSkills);
  const skipStar = useGame((s) => s.skipStar);
  const setSkip = (v: boolean) => useGame.setState({ skipStar: v });

  return (
    <div className="flex h-full min-h-0 flex-col gap-4 overflow-y-auto pr-1">
      <section>
        <h2 className="font-display text-xl">Bay</h2>
        <p className="mt-1 text-sm text-muted">Commission drones. They keep working when you look away.</p>
        <div className="mt-3 space-y-2">
          {ORDER.map((id) => {
            const cost = genCost(id, gens[id]);
            const meta = GEN_META[id];
            return (
              <div
                key={id}
                className="flex items-center justify-between gap-3 rounded-[var(--radius-lg)] bg-bg-elevated p-3 shadow-[var(--shadow-border)]"
              >
                <div>
                  <p className="text-sm text-fg">
                    {meta.name}{" "}
                    <span className="font-mono text-xs text-subtle tabular-nums">×{gens[id]}</span>
                  </p>
                  <p className="text-xs text-muted">{meta.blurb}</p>
                </div>
                <Button size="sm" variant="secondary" disabled={scrap < cost} onClick={() => buy(id)}>
                  {formatNum(cost)}
                </Button>
              </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-[var(--radius-lg)] bg-bg-elevated p-4 shadow-[var(--shadow-border)]">
        <h2 className="font-display text-xl">Fold</h2>
        <p className="mt-1 text-sm text-muted">
          Burn the run. Keep the keels. Wake {wake}
          {trueFolds ? ` · True ${trueFolds}` : ""}. Costs nothing but the bay.
        </p>
        <Button className="mt-3" variant="secondary" disabled={shards < 1 && wake === 0 && scrap < 80} onClick={fold}>
          Fold the wake
        </Button>
        {owned.includes("fold-3") ? (
          <label className="mt-3 flex items-center justify-between text-sm">
            Next drop skips a star
            <input type="checkbox" checked={skipStar} onChange={(e) => setSkip(e.target.checked)} />
          </label>
        ) : null}
      </section>

      <section>
        <h2 className="font-display text-xl">Deck log</h2>
        <ul className="mt-2 space-y-1 text-sm text-muted">
          {log.slice(0, 12).map((e) => (
            <li key={e.id} className="font-mono text-xs">
              {e.text}
            </li>
          ))}
          {log.length === 0 ? <li>The bay is quiet.</li> : null}
        </ul>
      </section>

      <section className="space-y-2 pb-4">
        <h2 className="font-display text-xl">Helm</h2>
        <label className="flex items-center justify-between text-sm">
          Screen shake
          <input
            type="checkbox"
            checked={settings.shake}
            onChange={(e) => setSetting("shake", e.target.checked)}
          />
        </label>
        <label className="flex items-center justify-between text-sm">
          Sound
          <input
            type="checkbox"
            checked={settings.sound}
            onChange={(e) => setSetting("sound", e.target.checked)}
          />
        </label>
        <label className="flex items-center justify-between text-sm">
          Reduced motion
          <input
            type="checkbox"
            checked={settings.reducedMotion}
            onChange={(e) => setSetting("reducedMotion", e.target.checked)}
          />
        </label>
        <Button variant="ghost" size="sm" onClick={resetAll}>
          New license
        </Button>
      </section>
    </div>
  );
}
