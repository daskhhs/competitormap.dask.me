import { CompetitorCard } from "./CompetitorCard";
import type { CompetitorEntry, CompetitorType } from "@/types/competitor";

const LABELS: Record<CompetitorType, string> = {
  direct: "Direct",
  adjacent: "Adjacent",
  alternative: "Alternatives",
  unconventional: "Unconventional alternatives",
};

const COLORS: Record<CompetitorType, string> = {
  direct: "var(--direct)",
  adjacent: "var(--adjacent)",
  alternative: "var(--alternative)",
  unconventional: "var(--unconventional)",
};

export function CompetitionCategory({ type, items }: { type: CompetitorType; items: CompetitorEntry[] }) {
  return (
    <div className="space-y-3">
      <h3 className="flex items-center gap-2 text-sm font-medium" style={{ color: COLORS[type] }}>
        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[type] }} aria-hidden />
        {LABELS[type]}
      </h3>
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {items.map((c) => (
          <CompetitorCard key={c.name} competitor={c} />
        ))}
      </div>
    </div>
  );
}
