"use client";

import { useCallback, useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { CompanyInput } from "@/components/CompanyInput";
import { CompetitionMap } from "@/components/CompetitionMap";
import { ResearchStatus } from "@/components/ResearchStatus";
import type { AnalyzeErrorBody, CompetitionMapResult } from "@/types/competitor";

type Status = "idle" | "loading" | "error" | "missing-key" | "result";

export default function Home() {
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [result, setResult] = useState<CompetitionMapResult | null>(null);

  const handleAnalyze = useCallback(async () => {
    const trimmed = url.trim();
    if (!trimmed) return;

    setStatus("loading");
    setMessage(null);
    setResult(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: trimmed }),
      });

      if (!res.ok) {
        const body = (await res.json()) as AnalyzeErrorBody;
        setMessage(body.error);
        setStatus(body.code === "MISSING_API_KEY" ? "missing-key" : "error");
        return;
      }

      const body = (await res.json()) as CompetitionMapResult;
      setResult(body);
      setStatus("result");
    } catch {
      setMessage("Network error — could not reach the analyze API.");
      setStatus("error");
    }
  }, [url]);

  return (
    <div className="flex min-h-full flex-1 flex-col bg-[var(--bg)] text-[var(--ink)]">
      <AppHeader />

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-5 py-10">
        <p className="max-w-xl text-[var(--muted)]">
          Give it a company and see who they&apos;re really competing with — including the spreadsheet
          nobody wants to replace.
        </p>

        <CompanyInput
          value={url}
          onChange={(v) => {
            setUrl(v);
            if (status === "error") {
              setStatus("idle");
              setMessage(null);
            }
          }}
          onSubmit={handleAnalyze}
          disabled={status === "loading"}
        />

        {status === "loading" && <ResearchStatus />}

        {status === "error" && message && (
          <div className="rounded-md border border-[var(--danger-border)] bg-[var(--danger-bg)] px-3 py-2.5 text-sm text-[var(--danger)]" role="alert">
            {message}
          </div>
        )}

        {status === "missing-key" && message && (
          <div className="rounded-md border border-[var(--warn-border)] bg-[var(--warn-bg)] px-3 py-2.5 text-sm text-[var(--warn)]" role="status">
            {message}
          </div>
        )}

        {status === "result" && result && (
          <div className="border-t border-[var(--border)] pt-8">
            <CompetitionMap
              overview={result.overview}
              positioning={result.positioning}
              competitors={result.competitors}
            />
          </div>
        )}
      </main>

      <footer className="border-t border-[var(--border)] py-4 text-center text-xs text-[var(--muted)]">
        {result?.provider ? `Mapped via ${result.provider}` : "Sometimes your biggest competitor is a spreadsheet."}
      </footer>
    </div>
  );
}
