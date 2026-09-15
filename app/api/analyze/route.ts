import { NextResponse } from "next/server";
import { normalizeUrl, fetchCompanySnapshot, FetchFailedError } from "@/lib/research";
import { analyzeCompetition, MissingApiKeyError, AiProviderError } from "@/lib/competitor-analysis";
import { rankAndDedupe } from "@/lib/ranking";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Request body must be JSON." }, { status: 400 });
  }

  const rawUrl = (body as { url?: unknown })?.url;
  if (typeof rawUrl !== "string" || !rawUrl.trim()) {
    return NextResponse.json({ error: "Enter a company URL first.", code: "EMPTY_INPUT" }, { status: 400 });
  }

  let url: URL;
  try {
    url = normalizeUrl(rawUrl);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Invalid URL.", code: "INVALID_URL" },
      { status: 400 }
    );
  }

  let snapshot;
  try {
    snapshot = await fetchCompanySnapshot(url);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof FetchFailedError ? err.message : "Couldn't reach that site.", code: "FETCH_FAILED" },
      { status: 502 }
    );
  }

  try {
    const { overview, positioning, competitors, provider } = await analyzeCompetition(snapshot);
    return NextResponse.json({
      url: url.toString(),
      overview,
      positioning,
      competitors: rankAndDedupe(competitors),
      provider,
    });
  } catch (err) {
    if (err instanceof MissingApiKeyError) {
      console.error("CompetitorMap: missing API key", err);
      return NextResponse.json(
        { error: "This tool isn't fully set up yet — please check back soon.", code: "MISSING_API_KEY" },
        { status: 503 }
      );
    }
    if (err instanceof AiProviderError) {
      console.error("CompetitorMap: upstream AI provider error", err);
      return NextResponse.json(
        { error: "Something went wrong while mapping the competition. Please try again in a moment.", code: "UPSTREAM_ERROR" },
        { status: 502 }
      );
    }
    return NextResponse.json(
      { error: "Couldn't map the competition for that company.", code: "UPSTREAM_ERROR" },
      { status: 500 }
    );
  }
}
