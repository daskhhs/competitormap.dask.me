import type { CompetitorEntry, CompetitorType } from "@/types/competitor";

const TYPE_ORDER: CompetitorType[] = ["direct", "adjacent", "alternative", "unconventional"];

export function rankAndDedupe(competitors: CompetitorEntry[]): CompetitorEntry[] {
  const seen = new Set<string>();
  const deduped: CompetitorEntry[] = [];

  for (const c of competitors) {
    const key = c.name.trim().toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(c);
  }

  return deduped.sort((a, b) => {
    const typeDiff = TYPE_ORDER.indexOf(a.type) - TYPE_ORDER.indexOf(b.type);
    if (typeDiff !== 0) return typeDiff;
    return b.relevance - a.relevance;
  });
}

export function groupByType(competitors: CompetitorEntry[]): { type: CompetitorType; items: CompetitorEntry[] }[] {
  const ranked = rankAndDedupe(competitors);
  return TYPE_ORDER.map((type) => ({
    type,
    items: ranked.filter((c) => c.type === type),
  })).filter((g) => g.items.length > 0);
}
