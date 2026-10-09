"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface TabItem {
  value: string;
  label: React.ReactNode;
  /** Optional panel. Omit to use Tabs as a pure selector (e.g. a view switch). */
  content?: React.ReactNode;
  disabled?: boolean;
}

interface TabsProps {
  items: TabItem[];
  /** Accessible name of the tab list. */
  label: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  variant?: "underline" | "segmented";
  className?: string;
  panelClassName?: string;
}

/**
 * WAI-ARIA tabs with roving focus: Arrow keys / Home / End move and select
 * (automatic activation). Controlled or uncontrolled.
 */
export function Tabs({
  items,
  label,
  value,
  defaultValue,
  onValueChange,
  variant = "underline",
  className,
  panelClassName,
}: TabsProps) {
  const baseId = React.useId();
  const [internal, setInternal] = React.useState(defaultValue ?? items[0]?.value);
  const selected = value ?? internal;
  const tabRefs = React.useRef<Array<HTMLButtonElement | null>>([]);

  const select = (next: string) => {
    if (value === undefined) setInternal(next);
    onValueChange?.(next);
  };

  const enabled = items.filter((item) => !item.disabled);

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const current = enabled.findIndex((item) => item.value === selected);
    let nextIndex: number | null = null;
    if (event.key === "ArrowRight") nextIndex = (current + 1) % enabled.length;
    if (event.key === "ArrowLeft") nextIndex = (current - 1 + enabled.length) % enabled.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = enabled.length - 1;
    if (nextIndex === null) return;
    event.preventDefault();
    const next = enabled[nextIndex];
    select(next.value);
    tabRefs.current[items.indexOf(next)]?.focus();
  };

  const activeItem = items.find((item) => item.value === selected);

  return (
    <div className={className}>
      <div
        role="tablist"
        aria-label={label}
        onKeyDown={onKeyDown}
        className={cn(
          variant === "underline"
            ? "scrollbar-hidden flex gap-6 overflow-x-auto border-b border-line"
            : "scrollbar-hidden inline-flex max-w-full gap-1 overflow-x-auto rounded-control bg-sunken p-1",
        )}
      >
        {items.map((item, index) => {
          const isSelected = item.value === selected;
          return (
            <button
              key={item.value}
              ref={(el) => {
                tabRefs.current[index] = el;
              }}
              type="button"
              role="tab"
              id={`${baseId}-tab-${item.value}`}
              aria-selected={isSelected}
              aria-controls={item.content !== undefined ? `${baseId}-panel-${item.value}` : undefined}
              tabIndex={isSelected ? 0 : -1}
              disabled={item.disabled}
              onClick={() => select(item.value)}
              className={cn(
                "shrink-0 whitespace-nowrap font-semibold transition-[color,background-color,border-color] duration-(--duration-base) ease-standard focus-ring disabled:cursor-not-allowed disabled:text-fg-disabled",
                variant === "underline"
                  ? cn(
                      "relative h-10 text-body",
                      "after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:rounded-full after:transition-[color,background-color,border-color]",
                      isSelected
                        ? "text-fg after:bg-brand"
                        : "text-fg-muted after:bg-transparent hover:text-fg",
                    )
                  : cn(
                      "h-8 rounded-item px-3 text-small",
                      isSelected
                        ? "bg-panel text-fg shadow-control"
                        : "text-fg-muted hover:text-fg",
                    ),
              )}
            >
              {item.label}
            </button>
          );
        })}
      </div>
      {activeItem?.content !== undefined && (
        <div
          role="tabpanel"
          id={`${baseId}-panel-${activeItem.value}`}
          aria-labelledby={`${baseId}-tab-${activeItem.value}`}
          tabIndex={0}
          className={cn("focus-ring rounded-control", panelClassName)}
        >
          {activeItem.content}
        </div>
      )}
    </div>
  );
}
