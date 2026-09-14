import { SKILLS, TREE_META, TREES } from "@/game/skills";

export function Codex() {
  return (
    <div className="h-full min-h-0 space-y-6 overflow-y-auto pr-1 text-sm leading-relaxed text-muted">
      <section>
        <h2 className="font-display text-xl text-fg">The Veil Collapse</h2>
        <p className="mt-2">
          Euclidean space failed. What remains can be surveyed only as lattices — two-dimensional sectors whose
          cells remember neighboring mass. The Lode Compact mined them until the rifts learned to bite. You inherited
          a license, the survey ship <em className="text-fg">Keelson</em>, and six keels.
        </p>
      </section>
      <section>
        <h2 className="font-display text-xl text-fg">Doctrine</h2>
        <ul className="mt-2 list-disc space-y-1 pl-4">
          <li>Numbers count adjacent lodestones, not rifts.</li>
          <li>Tap a hidden plate: empty reveals a mark, lode extracts, rift bites hull.</li>
          <li>Right-click or long-press to mark a plan. Marks do not harvest.</li>
          <li>Click a satisfied number to chord the rest of its neighbors.</li>
          <li>Recall to keep the take. Perfect clear pays shards. Hull 0 is a limp home.</li>
          <li>Every keel is a stance: a buff with a tax.</li>
        </ul>
      </section>
      {TREES.map((tree) => (
        <section key={tree}>
          <h2 className="font-display text-xl text-fg">{TREE_META[tree].name}</h2>
          <p className="mt-1 text-subtle">{TREE_META[tree].keel}</p>
          <ul className="mt-2 space-y-2">
            {SKILLS.filter((s) => s.tree === tree).map((s) => (
              <li key={s.id}>
                <span className="text-fg">{s.name}.</span> {s.lore}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
