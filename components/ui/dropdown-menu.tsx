"use client";

import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DropdownMenuItem {
  label: string;
  icon?: LucideIcon;
  href?: string;
  onSelect?: () => void;
  tone?: "default" | "danger";
  /** Draw a divider above this item. */
  separatorBefore?: boolean;
}

interface DropdownMenuProps {
  /** Accessible name for the trigger button. */
  label: string;
  trigger: React.ReactNode;
  items: DropdownMenuItem[];
  /** Optional non-interactive block at the top (e.g. name + email). */
  header?: React.ReactNode;
  align?: "start" | "end";
  triggerClassName?: string;
}

/**
 * Menu button (WAI-ARIA menu pattern): Enter/Space/ArrowDown open and focus
 * the first item, arrows/Home/End move, Escape closes and returns focus,
 * Tab or an outside click closes.
 */
export function DropdownMenu({
  label,
  trigger,
  items,
  header,
  align = "end",
  triggerClassName,
}: DropdownMenuProps) {
  const [open, setOpen] = React.useState(false);
  /** True when the preferred alignment would overflow the viewport. */
  const [flipped, setFlipped] = React.useState(false);
  const resolvedAlign = flipped ? (align === "end" ? "start" : "end") : align;
  const menuId = React.useId();
  const rootRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const itemRefs = React.useRef<Array<HTMLElement | null>>([]);

  const openMenu = () => {
    setFlipped(false);
    setOpen(true);
  };

  // Measured when the menu mounts (before paint): flip to the other edge if
  // the preferred alignment would leave the viewport.
  const measureMenu = React.useCallback(
    (node: HTMLDivElement | null) => {
      if (!node) return;
      const rect = node.getBoundingClientRect();
      const margin = 8;
      const overflows =
        align === "end" ? rect.left < margin : rect.right > window.innerWidth - margin;
      if (overflows) setFlipped(true);
    },
    [align],
  );

  const focusItem = (index: number) => {
    const count = items.length;
    itemRefs.current[((index % count) + count) % count]?.focus();
  };

  React.useEffect(() => {
    if (!open) return;
    focusItem(0);
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const close = (returnFocus: boolean) => {
    setOpen(false);
    if (returnFocus) triggerRef.current?.focus();
  };

  const onMenuKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const current = itemRefs.current.findIndex((el) => el === document.activeElement);
    if (event.key === "ArrowDown") {
      event.preventDefault();
      focusItem(current + 1);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      focusItem(current - 1);
    } else if (event.key === "Home") {
      event.preventDefault();
      focusItem(0);
    } else if (event.key === "End") {
      event.preventDefault();
      focusItem(items.length - 1);
    } else if (event.key === "Escape") {
      event.preventDefault();
      close(true);
    } else if (event.key === "Tab") {
      setOpen(false);
    }
  };

  const itemClass = (tone: DropdownMenuItem["tone"]) =>
    cn(
      "flex w-full items-center gap-2.5 rounded-item px-2.5 py-2 text-left text-small font-medium outline-none",
      "transition-[color,background-color,border-color] duration-(--duration-fast) ease-standard",
      tone === "danger"
        ? "text-danger hover:bg-danger-soft focus-visible:bg-danger-soft"
        : "text-fg hover:bg-sunken focus-visible:bg-sunken",
      "[&_svg]:size-4 [&_svg]:shrink-0",
    );

  return (
    <div ref={rootRef} className="relative inline-flex">
      <button
        ref={triggerRef}
        type="button"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => (open ? setOpen(false) : openMenu())}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown") {
            event.preventDefault();
            openMenu();
          }
        }}
        className={cn("focus-ring", triggerClassName)}
      >
        {trigger}
      </button>

      {open && (
        <div
          ref={measureMenu}
          id={menuId}
          role="menu"
          aria-label={label}
          onKeyDown={onMenuKeyDown}
          className={cn(
            "absolute top-full z-(--z-dropdown) mt-2 min-w-56 rounded-overlay border border-line bg-panel p-1.5 shadow-raised [backdrop-filter:var(--surface-backdrop)]",
            "motion-safe:transition-[opacity,translate] motion-safe:duration-(--duration-base) motion-safe:ease-enter",
            "motion-safe:starting:-translate-y-1 motion-safe:starting:opacity-0",
            resolvedAlign === "end" ? "right-0" : "left-0",
          )}
        >
          {header && (
            <div className="mb-1 border-b border-line-subtle px-2.5 pb-2.5 pt-1.5">{header}</div>
          )}
          {items.map((item, index) => {
            const Icon = item.icon;
            const content = (
              <>
                {Icon && <Icon aria-hidden strokeWidth={1.75} />}
                {item.label}
              </>
            );
            return (
              <React.Fragment key={item.label}>
                {item.separatorBefore && (
                  <div role="separator" className="my-1 h-px bg-line-subtle" />
                )}
                {item.href ? (
                  <a
                    ref={(el) => {
                      itemRefs.current[index] = el;
                    }}
                    role="menuitem"
                    tabIndex={-1}
                    href={item.href}
                    onClick={() => {
                      item.onSelect?.();
                      setOpen(false);
                    }}
                    className={itemClass(item.tone)}
                  >
                    {content}
                  </a>
                ) : (
                  <button
                    ref={(el) => {
                      itemRefs.current[index] = el;
                    }}
                    type="button"
                    role="menuitem"
                    tabIndex={-1}
                    onClick={() => {
                      item.onSelect?.();
                      close(true);
                    }}
                    className={itemClass(item.tone)}
                  >
                    {content}
                  </button>
                )}
              </React.Fragment>
            );
          })}
        </div>
      )}
    </div>
  );
}
