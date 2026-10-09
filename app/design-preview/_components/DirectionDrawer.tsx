"use client";

import { useEffect, useId, useRef } from "react";
import { Check, Minus, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { DIRECTIONS, type Direction, type DirectionId } from "./directions";

/**
 * Right-hand sheet with the rationale for the selected direction and a
 * side-by-side summary. Native <dialog>: focus trap and Escape for free.
 * Rendered inside the themed wrapper, so it uses the direction's tokens.
 */
export function DirectionDrawer({
  open,
  onOpenChange,
  direction,
  onSelect,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  direction: Direction;
  onSelect: (id: DirectionId) => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        onOpenChange(false);
      }}
      onClick={(event) => {
        if (event.target === ref.current) onOpenChange(false);
      }}
      className={cn(
        "m-0 ml-auto h-dvh max-h-none w-full max-w-[30rem] overflow-y-auto border-0 border-l border-line bg-canvas p-0 text-fg shadow-overlay",
        "ds-page [background-attachment:scroll]",
        "backdrop:bg-inverse/40",
        "motion-safe:transition-[opacity,translate] motion-safe:duration-(--duration-slow) motion-safe:ease-enter",
        "motion-safe:starting:translate-x-4 motion-safe:starting:opacity-0",
      )}
    >
      <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-line-subtle bg-canvas/90 px-6 py-4 backdrop-blur-md">
        <p className="text-small font-medium text-fg-muted">Direction details</p>
        <button
          type="button"
          aria-label="Close details"
          onClick={() => onOpenChange(false)}
          className="-mr-2 inline-flex size-9 items-center justify-center rounded-control text-fg-subtle hover:bg-sunken hover:text-fg focus-ring"
        >
          <X aria-hidden strokeWidth={1.75} className="size-4" />
        </button>
      </div>

      <div className="flex flex-col gap-8 px-6 py-6">
        <div>
          <p className="text-small text-fg-subtle">{direction.category}</p>
          <div className="mt-1 flex flex-wrap items-center gap-3">
            <h2 id={titleId} className="ds-display text-title text-fg">
              {direction.name}
            </h2>
            {direction.recommended && <Badge tone="brand">Recommended</Badge>}
          </div>
          <p className="mt-3 text-body text-fg">{direction.oneLiner}</p>
          <p className="mt-2 text-small text-fg-muted">{direction.concept}</p>
        </div>

        <section aria-label="Typefaces" className="flex flex-col divide-y divide-line-subtle border-y border-line-subtle">
          <div className="flex items-baseline justify-between gap-4 py-3">
            <span className="text-label font-semibold text-fg-subtle">Display</span>
            <span className="ds-display text-[1.375rem] leading-tight text-fg [font-weight:var(--text-title--font-weight)]">
              {direction.fonts.display}
            </span>
          </div>
          <div className="flex items-baseline justify-between gap-4 py-3">
            <span className="text-label font-semibold text-fg-subtle">Interface</span>
            <span className="text-body font-medium text-fg">{direction.fonts.ui}</span>
          </div>
          <div className="flex items-baseline justify-between gap-4 py-3">
            <span className="text-label font-semibold text-fg-subtle">Data</span>
            <span className="font-data text-small text-fg">{direction.fonts.data} 0123456789</span>
          </div>
        </section>

        <section aria-labelledby={`${titleId}-colors`}>
          <h3 id={`${titleId}-colors`} className="text-label font-semibold text-fg-subtle">
            Key colours
          </h3>
          <ul className="mt-3 grid grid-cols-2 gap-3">
            {direction.keyColors.map((swatch) => (
              <li key={swatch.label} className="flex items-center gap-3">
                <span aria-hidden className="size-9 shrink-0 rounded-control ring-1 ring-fg/10 ring-inset" style={{ backgroundColor: swatch.value }} />
                <span>
                  <span className="block text-small font-medium text-fg">{swatch.label}</span>
                  <span className="block font-data text-label text-fg-subtle">{swatch.value}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby={`${titleId}-why`}>
          <h3 id={`${titleId}-why`} className="text-label font-semibold text-fg-subtle">
            Strengths
          </h3>
          <ul className="mt-3 flex flex-col gap-2.5">
            {direction.why.map((text) => (
              <li key={text} className="flex gap-2.5 text-small text-fg">
                <Check aria-hidden strokeWidth={2} className="mt-0.5 size-4 shrink-0 text-success" />
                {text}
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby={`${titleId}-tradeoffs`}>
          <h3 id={`${titleId}-tradeoffs`} className="text-label font-semibold text-fg-subtle">
            Trade-offs
          </h3>
          <ul className="mt-3 flex flex-col gap-2.5">
            {direction.tradeoffs.map((text) => (
              <li key={text} className="flex gap-2.5 text-small text-fg">
                <Minus aria-hidden strokeWidth={2} className="mt-0.5 size-4 shrink-0 text-fg-subtle" />
                {text}
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby={`${titleId}-compare`}>
          <h3 id={`${titleId}-compare`} className="text-label font-semibold text-fg-subtle">
            Compare directions
          </h3>
          <ul className="mt-3 flex flex-col gap-2">
            {DIRECTIONS.map((d) => {
              const current = d.id === direction.id;
              return (
                <li key={d.id}>
                  <button
                    type="button"
                    aria-current={current || undefined}
                    onClick={() => onSelect(d.id)}
                    className={cn(
                      "flex w-full items-center justify-between gap-4 rounded-card border px-4 py-3 text-left transition-[background-color,border-color] duration-(--duration-fast) focus-ring",
                      current ? "border-line-strong bg-panel" : "border-line hover:bg-sunken",
                    )}
                  >
                    <span className="min-w-0">
                      <span className="flex items-center gap-2 text-small font-semibold text-fg">
                        {d.name}
                        {d.recommended && <span className="text-label font-medium text-brand-ink">Recommended</span>}
                      </span>
                      <span className="block text-label font-normal text-fg-subtle">{d.oneLiner}</span>
                    </span>
                    <span aria-hidden className="flex shrink-0 -space-x-1.5">
                      {d.keyColors.slice(0, 3).map((swatch) => (
                        <span
                          key={swatch.label}
                          className="size-5 rounded-full ring-2 ring-panel"
                          style={{ backgroundColor: swatch.value }}
                        />
                      ))}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          <p className="mt-4 text-label font-normal text-fg-subtle">
            Switching here changes only this preview. Shortcut: press 1, 2 or 3 on the page.
          </p>
        </section>
      </div>
    </dialog>
  );
}
