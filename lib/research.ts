export type CompanySnapshot = {
  url: string;
  title: string;
  metaDescription: string;
  headings: string[];
  bodyText: string;
};

const PRIVATE_HOST_PATTERNS = [
  /^localhost$/i,
  /^127\./,
  /^0\.0\.0\.0$/,
  /^10\./,
  /^192\.168\./,
  /^172\.(1[6-9]|2\d|3[0-1])\./,
  /^::1$/,
  /\.local$/i,
  /^169\.254\./,
];

export class InvalidUrlError extends Error {}
export class FetchFailedError extends Error {}

export function normalizeUrl(input: string): URL {
  let candidate = input.trim();
  if (!/^https?:\/\//i.test(candidate)) {
    candidate = `https://${candidate}`;
  }

  let url: URL;
  try {
    url = new URL(candidate);
  } catch {
    throw new InvalidUrlError("That doesn't look like a valid URL.");
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new InvalidUrlError("Only http and https URLs are supported.");
  }

  if (PRIVATE_HOST_PATTERNS.some((p) => p.test(url.hostname))) {
    throw new InvalidUrlError("Can't research local or private addresses.");
  }

  return url;
}

function stripTags(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&[a-z0-9#]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export async function fetchCompanySnapshot(url: URL): Promise<CompanySnapshot> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const res = await fetch(url.toString(), {
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; CompetitorMapBot/1.0; +https://competitormap.dask.me)",
        Accept: "text/html,application/xhtml+xml",
      },
    });

    if (!res.ok) {
      throw new FetchFailedError(`Site responded with ${res.status}.`);
    }

    const html = await res.text();

    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const title = titleMatch ? stripTags(titleMatch[1]).slice(0, 200) : "";

    const descMatch = html.match(/<meta\s+[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i);
    const ogDescMatch = html.match(/<meta\s+[^>]*property=["']og:description["'][^>]*content=["']([^"']*)["']/i);
    const metaDescription = stripTags(descMatch?.[1] || ogDescMatch?.[1] || "").slice(0, 400);

    const headings: string[] = [];
    const headingRegex = /<h[12][^>]*>([\s\S]*?)<\/h[12]>/gi;
    let match: RegExpExecArray | null;
    while ((match = headingRegex.exec(html)) && headings.length < 10) {
      const text = stripTags(match[1]);
      if (text) headings.push(text);
    }

    const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    const bodyText = stripTags(bodyMatch?.[1] || html).slice(0, 4000);

    return { url: url.toString(), title, metaDescription, headings, bodyText };
  } catch (err) {
    if (err instanceof FetchFailedError) throw err;
    if (err instanceof Error && err.name === "AbortError") {
      throw new FetchFailedError("The site took too long to respond.");
    }
    throw new FetchFailedError(err instanceof Error ? err.message : "Could not reach that site.");
  } finally {
    clearTimeout(timeout);
  }
}
