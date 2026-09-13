import { callGemini } from "./ai/gemini";
import { callGroq } from "./ai/groq";
import { callOpenRouter } from "./ai/openrouter";
import {
  AiProviderError,
  MissingApiKeyError,
  resolveProvider,
  type AiProviderName,
  type ChatMessage,
} from "./ai/provider";
import type { CompanySnapshot } from "./research";
import type { CompanyOverview, CompetitorEntry } from "@/types/competitor";

export {
  resolveProvider,
  getPreferredProvider,
  getAvailableProviders,
  providerEnvVar,
  MissingApiKeyError,
  AiProviderError,
} from "./ai/provider";

const SYSTEM_PROMPT = `You are CompetitorMap. Given a snapshot of a company's own website, map out who it
really competes with — using your general knowledge of markets and companies, grounded in what the
snapshot tells you about what this company actually sells.

Explicitly include non-software alternatives where relevant: spreadsheets, agencies, internal teams,
email, WhatsApp, manual processes, or "nobody has replaced this yet". A workflow tool's real competitor
is often a spreadsheet, not another SaaS product.

Return ONLY valid JSON with this exact shape:
{
  "overview": {
    "name": string,
    "description": string,
    "sells": string,
    "targetCustomer": string,
    "category": string
  },
  "positioning": string,
  "competitors": [
    { "name": string, "type": "direct" | "adjacent" | "alternative" | "unconventional", "relevance": number, "reason": string }
  ]
}

Rules:
- overview.name: the company's name as best you can tell from the snapshot.
- overview fields: short, specific, based on the snapshot — don't invent facts not implied by it.
- positioning: 1-2 sentences on how this company positions itself in its market.
- competitors: 6-12 entries total, spanning all four types. Include at least one "alternative" or
  "unconventional" entry (a non-software or informal way customers solve the same problem) unless
  the category genuinely has none (rare).
- relevance: 0-100, how relevant/similar this competitor is to the company being analyzed.
- reason: one specific sentence on why this belongs on the map — not generic.
- Use real, plausible company names you're reasonably confident exist. If you're not sure a company
  is real, prefer a well-known one you are sure about, or use a category-level alternative instead
  (e.g. "A dedicated ops person in a spreadsheet" rather than inventing a fake startup name).`;

function buildUserPrompt(snapshot: CompanySnapshot): string {
  return [
    `URL: ${snapshot.url}`,
    `Title: ${snapshot.title || "(none found)"}`,
    `Meta description: ${snapshot.metaDescription || "(none found)"}`,
    snapshot.headings.length > 0 ? `Headings: ${snapshot.headings.join(" | ")}` : "",
    "",
    "Visible page text (truncated):",
    snapshot.bodyText || "(no readable body text found)",
  ]
    .filter(Boolean)
    .join("\n");
}

async function callProvider(provider: AiProviderName, messages: ChatMessage[]): Promise<string> {
  switch (provider) {
    case "gemini":
      return callGemini(messages);
    case "groq":
      return callGroq(messages);
    case "openrouter":
      return callOpenRouter(messages);
  }
}

function extractJson(text: string): unknown {
  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (fenced?.[1]) return JSON.parse(fenced[1].trim());
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start >= 0 && end > start) return JSON.parse(trimmed.slice(start, end + 1));
    throw new Error("Model response was not valid JSON.");
  }
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function normalizeOverview(raw: unknown): CompanyOverview {
  const obj = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  return {
    name: asString(obj.name, "This company"),
    description: asString(obj.description),
    sells: asString(obj.sells),
    targetCustomer: asString(obj.targetCustomer),
    category: asString(obj.category),
  };
}

function normalizeCompetitors(raw: unknown): CompetitorEntry[] {
  if (!Array.isArray(raw)) return [];
  const validTypes = new Set(["direct", "adjacent", "alternative", "unconventional"]);

  return raw
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const obj = item as Record<string, unknown>;
      const name = asString(obj.name);
      const type = validTypes.has(obj.type as string) ? (obj.type as CompetitorEntry["type"]) : null;
      const reason = asString(obj.reason);
      const relevance =
        typeof obj.relevance === "number" && Number.isFinite(obj.relevance)
          ? Math.max(0, Math.min(100, Math.round(obj.relevance)))
          : 50;

      if (!name || !type || !reason) return null;
      return { name, type, relevance, reason };
    })
    .filter((c): c is CompetitorEntry => c !== null);
}

export async function analyzeCompetition(
  snapshot: CompanySnapshot
): Promise<{ overview: CompanyOverview; positioning: string; competitors: CompetitorEntry[]; provider: string }> {
  const provider = resolveProvider();
  if (!provider) {
    throw new MissingApiKeyError("gemini", "GEMINI_API_KEY");
  }

  const messages: ChatMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: buildUserPrompt(snapshot) },
  ];

  try {
    const rawText = await callProvider(provider, messages);
    const raw = extractJson(rawText) as Record<string, unknown>;
    const overview = normalizeOverview(raw.overview);
    const positioning = asString(raw.positioning);
    const competitors = normalizeCompetitors(raw.competitors);

    if (!overview.description || competitors.length === 0) {
      throw new Error("Model returned incomplete competitive analysis.");
    }

    return { overview, positioning, competitors, provider };
  } catch (err) {
    if (err instanceof MissingApiKeyError || err instanceof AiProviderError) {
      throw err;
    }
    const message = err instanceof Error ? err.message : "Something went sideways mapping the market.";
    throw new AiProviderError(provider, message);
  }
}
