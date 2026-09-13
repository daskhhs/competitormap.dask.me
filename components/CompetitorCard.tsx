import type { CompetitorEntry } from "@/types/competitor";

const TYPE_COLOR: Record<CompetitorEntry["type"], string> = {
  direct: "var(--direct)",
  adjacent: "var(--adjacent)",
  alternative: "var(--alternative)",
  unconventional: "var(--unconventional)",
};

export function CompetitorCard({ competitor }: { competitor: CompetitorEntry }) {
  const color = TYPE_COLOR[competitor.type];
  return (
    <div className="rounded-md border border-[var(--border)] bg-[var(--surface)] p-3.5">
      <div className="flex items-center justify-between gap-2">
        <span className="font-medium text-[var(--ink)]">{competitor.name}</span>
        <span
          className="rounded-full px-2 py-0.5 font-mono text-[11px]"
          style={{ color, backgroundColor: `color-mix(in srgb, ${color} 15%, transparent)` }}
        >
          {competitor.relevance}
        </span>
      </div>
      <p className="mt-1.5 text-sm leading-relaxed text-[var(--muted)]">{competitor.reason}</p>
    </div>
  );
}
