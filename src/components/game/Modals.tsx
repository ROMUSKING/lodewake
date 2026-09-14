import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { useGame } from "@/game/store";

export function Modals() {
  const modal = useGame((s) => s.modal);
  const dismiss = useGame((s) => s.dismissModal);
  const drop = useGame((s) => s.dropSector);
  const start = useGame((s) => s.startRun);

  if (modal === "none") return null;

  if (modal === "help") {
    return (
      <Overlay>
        <h2 className="font-display text-2xl text-fg">Three rules</h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-muted">
          <li>The numbers count lodestones next door. You want those lodestones.</li>
          <li>Rifts share the dark and bite the hull. Mark them. Do not tap them.</li>
          <li>Every keel you fit helps with one hand and taxes with the other.</li>
        </ol>
        <p className="mt-3 text-sm text-subtle">Tap to probe. Long-press to mark. Chord a satisfied number.</p>
        <Button className="mt-6 w-full" onClick={dismiss}>
          Understood
        </Button>
      </Overlay>
    );
  }

  if (modal === "death") {
    return (
      <Overlay>
        <h2 className="font-display text-2xl text-fg">Hull zero</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          The lattice kept what you had not already stowed. The Keelson limps. Drop again, or fold if the curve has
          gone flat.
        </p>
        <div className="mt-6 flex flex-col gap-2">
          <Button onClick={() => drop()}>Drop another lattice</Button>
          <Button variant="secondary" onClick={() => { dismiss(); start(); }}>
            Back to helm
          </Button>
        </div>
      </Overlay>
    );
  }

  return null;
}

function Overlay({ children }: { children: ReactNode }) {
  return (
    <div className="absolute inset-0 z-40 grid place-items-center bg-bg/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-[var(--radius-xl)] bg-bg-elevated p-6 shadow-[var(--shadow-border)]">
        {children}
      </div>
    </div>
  );
}
