"use client";

import { useEffect, useState } from "react";

const STEPS = [
  "Reading the company's site…",
  "Working out what they actually sell…",
  "Mapping direct and adjacent competitors…",
  "Checking for non-obvious alternatives…",
];

export function ResearchStatus() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setStep((s) => Math.min(s + 1, STEPS.length - 1));
    }, 1100);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      className="flex items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-3 text-sm text-[var(--muted)]"
      role="status"
      aria-live="polite"
    >
      <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--accent)]" aria-hidden />
      {STEPS[step]}
    </div>
  );
}
