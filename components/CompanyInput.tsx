"use client";

interface CompanyInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
}

export function CompanyInput({ value, onChange, onSubmit, disabled }: CompanyInputProps) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="space-y-3"
    >
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder="https://company.com"
          className="flex-1 rounded-md border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2.5 font-mono text-base sm:text-sm text-[var(--ink)] placeholder:text-[var(--muted)] outline-none transition focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={disabled || !value.trim()}
          className="inline-flex h-11 items-center justify-center whitespace-nowrap rounded-md bg-[var(--accent)] px-5 text-sm font-medium text-[var(--accent-fg)] transition duration-200 hover:bg-[var(--accent-hover)] hover:-translate-y-0.5 hover:shadow-[0_10px_24px_-8px_var(--accent)] active:translate-y-0 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none"
        >
          Map the competition
        </button>
      </div>
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange("https://linear.app")}
        className="rounded border border-[var(--border)] bg-transparent px-2.5 py-1 text-xs text-[var(--muted)] transition hover:border-[var(--accent-soft)] hover:text-[var(--ink)] disabled:opacity-50"
      >
        Try linear.app
      </button>
    </form>
  );
}
