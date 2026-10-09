import { useId } from "react";
import { cn } from "@/lib/utils";

export interface ChartPoint {
  label: string;
  value: number;
  /** A session where the coach applied a remembered weakness. */
  memory?: boolean;
}

/**
 * Line chart drawn only from tokens: accent line with a soft area, dashed
 * neutral baseline at the first value, axis labels, memory rings. Set
 * `width` close to the rendered width so strokes and text stay 1:1.
 * `endLabel` prints the latest value when no metric sits next to the chart.
 */
export function LineChart({
  points,
  ariaLabel,
  min = 30,
  max = 90,
  width = 320,
  height = 140,
  showLabels = true,
  endLabel = false,
  className,
}: {
  points: ChartPoint[];
  ariaLabel: string;
  min?: number;
  max?: number;
  width?: number;
  height?: number;
  showLabels?: boolean;
  endLabel?: boolean;
  className?: string;
}) {
  const gradientId = useId();
  const pad = { top: 22, right: 18, bottom: showLabels ? 24 : 8, left: 12 };
  const x = (i: number) => pad.left + (i * (width - pad.left - pad.right)) / Math.max(1, points.length - 1);
  const y = (v: number) => pad.top + ((max - v) * (height - pad.top - pad.bottom)) / (max - min);
  const line = points.map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(p.value).toFixed(1)}`).join(" ");
  const area = `${line} L${x(points.length - 1).toFixed(1)},${height - pad.bottom} L${x(0).toFixed(1)},${height - pad.bottom} Z`;
  const last = points[points.length - 1];

  return (
    <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={ariaLabel} className={cn("h-auto w-full overflow-visible", className)}>
      <defs>
        <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" style={{ stopColor: "var(--color-brand)", stopOpacity: 0.16 }} />
          <stop offset="100%" style={{ stopColor: "var(--color-brand)", stopOpacity: 0 }} />
        </linearGradient>
      </defs>
      {[0.33, 0.66].map((t) => (
        <line
          key={t}
          x1={pad.left}
          x2={width - pad.right}
          y1={pad.top + t * (height - pad.top - pad.bottom)}
          y2={pad.top + t * (height - pad.top - pad.bottom)}
          className="stroke-chart-grid"
          strokeWidth={1}
        />
      ))}
      <line
        x1={pad.left}
        x2={width - pad.right}
        y1={y(points[0].value)}
        y2={y(points[0].value)}
        className="stroke-chart-baseline"
        strokeWidth={1}
        strokeDasharray="3 4"
      />
      <path d={area} fill={`url(#${gradientId})`} />
      <path d={line} fill="none" className="stroke-brand" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
      {points.map((p, i) => (
        <g key={p.label}>
          {p.memory && <circle cx={x(i)} cy={y(p.value)} r={7.5} className="fill-memory-soft stroke-memory" strokeWidth={1.25} />}
          <circle cx={x(i)} cy={y(p.value)} r={i === points.length - 1 ? 4 : 3} className="fill-panel stroke-brand" strokeWidth={2} />
          {showLabels && (
            <text x={x(i)} y={height - 6} textAnchor="middle" className="fill-fg-subtle font-brand text-[10.5px] font-medium">
              {p.label}
            </text>
          )}
        </g>
      ))}
      {endLabel && (
        <text x={x(points.length - 1)} y={y(last.value) - 12} textAnchor="end" className="fill-fg font-brand text-[12px] font-semibold tabular-nums">
          {last.value}
        </text>
      )}
    </svg>
  );
}

/** Labelled horizontal score bar (product views only). */
export function Meter({ label, value, tone = "bg-brand" }: { label: string; value: number; tone?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-3 text-small">
        <span className="text-fg-muted">{label}</span>
        <span className="font-semibold tabular-nums text-fg">{value}</span>
      </div>
      <div
        role="meter"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={value}
        className="h-1 overflow-hidden rounded-full bg-sunken"
      >
        <div className={cn("h-full rounded-full", tone)} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

/** Static voice level bars (decorative; the state is always also given in text). */
export function Waveform({ className, bars = 28 }: { className?: string; bars?: number }) {
  const heights = Array.from({ length: bars }, (_, i) => 0.25 + 0.75 * Math.abs(Math.sin(i * 1.7) * Math.cos(i * 0.6)));
  return (
    <div aria-hidden className={cn("flex h-6 items-center gap-[3px]", className)}>
      {heights.map((h, i) => (
        <span key={i} className="w-[3px] rounded-full bg-current" style={{ height: `${Math.round(h * 100)}%`, opacity: 0.35 + h * 0.65 }} />
      ))}
    </div>
  );
}
