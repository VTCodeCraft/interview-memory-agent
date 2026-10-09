import { cn } from "@/lib/utils";

/** Labelled 0-100 score bar. */
export function ScoreMeter({ label, value, delta }: { label: string; value: number; delta?: number }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-3 text-small">
        <span className="text-fg-muted">{label}</span>
        <span className="font-semibold tabular-nums text-fg">
          {value}
          {delta !== undefined && (
            <span className="ml-1.5 text-label font-semibold text-success">
              {delta > 0 ? "+" : ""}
              {delta}
            </span>
          )}
        </span>
      </div>
      <div
        role="meter"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={value}
        className="h-1 overflow-hidden rounded-full bg-sunken"
      >
        <div className="h-full rounded-full bg-brand" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

/** Static voice-level bars. Decorative: state is always also given in text. */
export function Waveform({ className, bars = 24 }: { className?: string; bars?: number }) {
  const heights = Array.from({ length: bars }, (_, i) => 0.25 + 0.75 * Math.abs(Math.sin(i * 1.7) * Math.cos(i * 0.6)));
  return (
    <div aria-hidden className={cn("flex h-6 items-center gap-[3px]", className)}>
      {heights.map((h, i) => (
        <span key={i} className="w-[3px] rounded-full bg-current" style={{ height: `${Math.round(h * 100)}%`, opacity: 0.35 + h * 0.65 }} />
      ))}
    </div>
  );
}
