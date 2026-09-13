import { CompetitionCategory } from "./CompetitionCategory";
import { groupByType } from "@/lib/ranking";
import type { CompanyOverview, CompetitorEntry } from "@/types/competitor";

export function CompetitionMap({
  overview,
  positioning,
  competitors,
}: {
  overview: CompanyOverview;
  positioning: string;
  competitors: CompetitorEntry[];
}) {
  const groups = groupByType(competitors);

  return (
    <div className="space-y-8">
      <div className="rounded-md border border-[var(--border)] bg-[var(--surface)] p-4">
        <h2 className="font-display text-2xl italic text-[var(--ink)]">{overview.name}</h2>
        <p className="mt-1.5 text-sm leading-relaxed text-[var(--ink)]">{overview.description}</p>
        <dl className="mt-3 grid grid-cols-1 gap-x-6 gap-y-2 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-xs uppercase tracking-wide text-[var(--muted)]">Sells</dt>
            <dd className="text-[var(--ink)]">{overview.sells}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-[var(--muted)]">Target customer</dt>
            <dd className="text-[var(--ink)]">{overview.targetCustomer}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-[var(--muted)]">Category</dt>
            <dd className="text-[var(--ink)]">{overview.category}</dd>
          </div>
        </dl>
        {positioning && (
          <p className="mt-3 border-t border-[var(--border)] pt-3 text-sm italic text-[var(--muted)]">
            {positioning}
          </p>
        )}
      </div>

      <div className="space-y-6">
        {groups.map((g) => (
          <CompetitionCategory key={g.type} type={g.type} items={g.items} />
        ))}
      </div>
    </div>
  );
}
