"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children?: React.ReactNode;
  /** Action row, right-aligned on desktop, stacked on mobile. */
  footer?: React.ReactNode;
  className?: string;
}

/**
 * Modal built on the native <dialog> element: focus is trapped and Escape is
 * handled by the browser; clicking the backdrop closes it.
 */
export function Dialog({ open, onOpenChange, title, description, children, footer, className }: DialogProps) {
  const ref = React.useRef<HTMLDialogElement>(null);
  const titleId = React.useId();
  const descriptionId = React.useId();

  React.useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onCancel={(event) => {
        event.preventDefault();
        onOpenChange(false);
      }}
      onClick={(event) => {
        if (event.target === ref.current) onOpenChange(false);
      }}
      className={cn(
        "m-auto w-[min(100%-2rem,28rem)] rounded-overlay border border-line bg-panel p-0 text-fg shadow-overlay [backdrop-filter:var(--surface-backdrop)]",
        "backdrop:bg-inverse/45",
        "motion-safe:transition-[opacity,translate] motion-safe:duration-(--duration-slow) motion-safe:ease-enter",
        "motion-safe:starting:translate-y-2 motion-safe:starting:opacity-0",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4 p-5 pb-0 sm:p-6 sm:pb-0">
        <div className="flex flex-col gap-1.5">
          <h2 id={titleId} className="text-heading text-fg">
            {title}
          </h2>
          {description && (
            <p id={descriptionId} className="text-body text-fg-muted">
              {description}
            </p>
          )}
        </div>
        <button
          type="button"
          aria-label="Close"
          onClick={() => onOpenChange(false)}
          className="-mr-1.5 -mt-1 inline-flex size-8 shrink-0 items-center justify-center rounded-control text-fg-subtle transition-[color,background-color,border-color] hover:bg-sunken hover:text-fg focus-ring"
        >
          <X aria-hidden strokeWidth={1.75} className="size-4" />
        </button>
      </div>
      {children && <div className="px-5 pt-4 sm:px-6">{children}</div>}
      {footer && (
        <div className="flex flex-col-reverse gap-2 p-5 sm:flex-row sm:justify-end sm:p-6">{footer}</div>
      )}
    </dialog>
  );
}
