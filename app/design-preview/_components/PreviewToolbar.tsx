"use client";

import { useEffect, useRef } from "react";
import { PanelRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { DIRECTIONS, type DirectionId } from "./directions";

/**
 * Floating direction switcher. Deliberately neutral chrome that never takes
 * on a direction's tokens, so it reads as the tool, not the design.
 * Keyboard: arrow keys inside the group; 1, 2, 3 anywhere on the page.
 */
export function PreviewToolbar({
  value,
  onChange,
  onOpenDetails,
}: {
  value: DirectionId;
  onChange: (id: DirectionId) => void;
  onOpenDetails: () => void;
}) {
  const radios = useRef<Array<HTMLButtonElement | null>>([]);
  const index = DIRECTIONS.findIndex((d) => d.id === value);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey || event.defaultPrevented) return;
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable='true'], dialog[open]")) return;
      const n = Number(event.key);
      if (n >= 1 && n <= DIRECTIONS.length) onChange(DIRECTIONS[n - 1].id);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onChange]);

  const onGroupKeyDown = (event: React.KeyboardEvent) => {
    const step = event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : event.key === "ArrowLeft" || event.key === "ArrowUp" ? -1 : 0;
    if (!step) return;
    event.preventDefault();
    const next = (index + step + DIRECTIONS.length) % DIRECTIONS.length;
    onChange(DIRECTIONS[next].id);
    radios.current[next]?.focus();
  };

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-(--z-overlay) flex justify-center px-3 font-[family-name:var(--font-geist-sans)] sm:bottom-6">
      <div className="pointer-events-auto flex items-center gap-1 rounded-[14px] bg-[#111216]/95 p-1 text-white shadow-[0_12px_32px_-12px_rgb(0_0_0/0.45),0_0_0_1px_rgb(255_255_255/0.08)_inset] backdrop-blur-md">
        <span className="hidden px-3 text-[12px] font-medium text-white/60 md:block">Direction</span>
        <div role="radiogroup" aria-label="Design direction" onKeyDown={onGroupKeyDown} className="flex gap-1">
          {DIRECTIONS.map((d, i) => {
            const checked = d.id === value;
            return (
              <button
                key={d.id}
                ref={(el) => {
                  radios.current[i] = el;
                }}
                type="button"
                role="radio"
                aria-checked={checked}
                tabIndex={checked ? 0 : -1}
                onClick={() => onChange(d.id)}
                className={cn(
                  "flex flex-col items-start rounded-[10px] px-3 py-1.5 text-left outline-none transition-[background-color,color] duration-150 sm:px-3.5",
                  "focus-visible:ring-2 focus-visible:ring-white/80",
                  checked ? "bg-white text-[#111216]" : "text-white/80 hover:bg-white/10 hover:text-white",
                )}
              >
                <span className="flex items-center gap-1.5 text-[13px] font-semibold leading-5">
                  <span aria-hidden className="font-[family-name:var(--font-geist-mono)] text-[11px] opacity-50">
                    {i + 1}
                  </span>
                  {d.name}
                  {d.recommended && (
                    <>
                      <span aria-hidden className={cn("size-1.5 rounded-full", checked ? "bg-[#3541e2]" : "bg-[#9aa1ff]")} />
                      <span className="sr-only">(recommended)</span>
                    </>
                  )}
                </span>
                <span className={cn("hidden text-[11px] leading-4 sm:block", checked ? "text-[#111216]/65" : "text-white/55")}>
                  {d.category}
                </span>
              </button>
            );
          })}
        </div>
        <button
          type="button"
          onClick={onOpenDetails}
          aria-label="Direction details"
          className="ml-0.5 inline-flex h-10 items-center gap-2 rounded-[10px] px-2.5 text-[13px] font-medium text-white/80 outline-none transition-[background-color,color] duration-150 hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-white/80 sm:h-12 sm:px-3"
        >
          <PanelRight aria-hidden strokeWidth={1.75} className="size-4" />
          <span className="hidden sm:inline">Details</span>
        </button>
      </div>
    </div>
  );
}
