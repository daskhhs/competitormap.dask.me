# CompetitorMap

**Give it a company. See who they're really competing with — including the spreadsheet nobody wants to replace.**

Part of the [dask.me](https://dask.me) tool collection.

---

## What it does

Paste in a company's URL and CompetitorMap reads their own site to understand what they actually sell, then maps out the competitive landscape across four categories: **direct** competitors, **adjacent** ones, **alternatives**, and — deliberately — **unconventional alternatives**. A workflow tool's real competition is often a spreadsheet, an agency, or "the way the team has always done it," not another SaaS product, and this tool is built to surface that instead of only listing other startups.

Each entry gets a relevance score and a specific, one-sentence reason it belongs on the map.

## How it works

1. **Research** — the company's own site is fetched server-side and reduced to its meaningful content: title, meta description, headings, and visible body text. No fabricated data — if the site is unreachable, the tool says so rather than guessing.
2. **Analyze (AI)** — that snapshot is handed to an LLM instructed to ground its overview of the company in what the page actually says, then map competitors using its general knowledge of the market — explicitly required to include non-software alternatives, not just other startups in the same category.
3. **Rank** — results are deduplicated and sorted deterministically (by category, then relevance score) before rendering, so the same input produces a stable, organized map rather than a shuffled list.

Worth being upfront about: unlike the technology-fingerprinting in [HowThisWorks](https://howthisworks.dask.me), this tool doesn't do live web search on each individual competitor — it grounds the *subject company* in real fetched content, then reasons about the market using the model's own knowledge. That's a reasoning task, not a verified-data task, and the architecture is deliberately left open (`lib/research.ts`) to plug in a real search/research provider later.

## Tech stack

- Next.js (App Router) + TypeScript
- Tailwind CSS
- A small provider abstraction (`lib/ai/`) supporting Gemini, Groq, and OpenRouter

## Running locally

```bash
npm install
cp .env.example .env.local
# add at least one API key to .env.local
npm run dev
```

Environment variables (see `.env.example`):

| Variable | Required | Notes |
|---|---|---|
| `AI_PROVIDER` | No | `gemini` \| `groq` \| `openrouter`. Defaults to `gemini`. |
| `GEMINI_API_KEY` | One of these three | |
| `GROQ_API_KEY` | | |
| `OPENROUTER_API_KEY` | | |

## Design notes

A bolder, dark navy theme with a coral accent and an italic serif wordmark — closer to a map legend than a dashboard, with each competitor category color-coded and labeled rather than dumped into one undifferentiated list.
