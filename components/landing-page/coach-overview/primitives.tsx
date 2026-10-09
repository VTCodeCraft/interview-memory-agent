import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, Check } from "lucide-react";

import { cn } from "@/lib/utils";
import type { StatusTone, Tone } from "./data";

// Precision: ink by default; ultramarine marks memory and intelligence.
export const toneIcon: Record<Tone, string> = {
  neutral: "text-fg",
  memory: "text-memory",
};

const toneTile: Record<Tone, string> = {
  neutral: "bg-sunken",
  memory: "bg-memory-soft",
};

const statusPill: Record<StatusTone, string> = {
  success: "bg-success-soft text-success",
  memory: "bg-memory-soft text-brand-ink",
};

/** White card used throughout the diagram. */
export function Panel({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("rounded-card border border-line bg-panel shadow-card", className)}>{children}</div>;
}

/** "1. You Provide" style step header. */
export function StepPill({ n, children }: { n: number; children: string }) {
  return (
    <p className="inline-flex items-center gap-2.5 self-start rounded-full border border-line bg-panel px-4 py-1.5 text-small font-semibold text-fg shadow-control @min-[68rem]:gap-2 @min-[68rem]:px-3.5 @min-[68rem]:py-1 @min-[68rem]:text-[0.8125rem]">
      <span className="font-data text-small leading-none font-medium text-brand">{String(n).padStart(2, "0")}</span>
      {children}
    </p>
  );
}

/** Rounded square icon background. */
export function IconTile({ icon: Icon, tone = "neutral", className }: { icon: LucideIcon; tone?: Tone; className?: string }) {
  return (
    <span aria-hidden className={cn("inline-flex size-10 shrink-0 items-center justify-center rounded-control", toneTile[tone], className)}>
      <Icon strokeWidth={1.75} className={cn("size-5", toneIcon[tone])} />
    </span>
  );
}

/** Small status badge with a check, e.g. "Parsed". */
export function StatusPill({ tone, children }: { tone: StatusTone; children: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-badge px-2 py-0.5 text-[0.6875rem] font-medium", statusPill[tone])}>
      {children}
      <Check aria-hidden strokeWidth={2.25} className="size-3" />
    </span>
  );
}

/** Memory-tinted caption box under a column. */
export function NoteBox({ children, className }: { children: string; className?: string }) {
  return (
    <p
      className={cn(
        "rounded-control bg-memory-soft px-4 py-3 text-center text-label font-medium text-brand-ink ring-1 ring-memory-line ring-inset @min-[68rem]:px-3 @min-[68rem]:py-2.5 @min-[68rem]:text-[0.6875rem]",
        className,
      )}
    >
      {children}
    </p>
  );
}

/** Dotted connector with an arrowhead pointing right (or left). */
export function DottedArrow({ direction = "right", className }: { direction?: "right" | "left"; className?: string }) {
  return (
    <span aria-hidden className={cn("flex items-center text-fg-subtle", direction === "left" && "flex-row-reverse", className)}>
      <span className="h-0 flex-1 border-t-2 border-dotted border-line-control" />
      <ArrowRight strokeWidth={2} className={cn("-mx-1 size-4 shrink-0", direction === "left" && "rotate-180")} />
    </span>
  );
}

/** Two-line label sitting on a connector. */
export function LinkLabel({ lines }: { lines: string[] }) {
  return (
    <p className="text-center text-label leading-tight font-semibold text-fg-muted @min-[68rem]:text-[0.6875rem]">
      {lines.map((line) => (
        <span key={line} className="block">
          {line}
        </span>
      ))}
    </p>
  );
}

/** Symmetric voice waveform: dots at the edges, peaks towards the middle. */
export function Waveform({ className }: { className?: string }) {
  const heights = [3, 4, 5, 4, 7, 10, 16, 11, 7, 5, 9, 15, 22, 14, 8, 6, 9, 17, 26, 17, 9, 6, 8, 14, 22, 15, 9, 5, 7, 11, 16, 10, 7, 4, 5, 4, 3];
  return (
    <div aria-hidden className={cn("flex h-7 items-center justify-center gap-[3px]", className)}>
      {heights.map((h, i) => (
        <span
          key={i}
          className="w-[3px] rounded-full bg-brand"
          style={{ height: `${h}px`, opacity: h < 6 ? 0.45 : 0.7 + Math.min(h, 26) / 104 }}
        />
      ))}
    </div>
  );
}
