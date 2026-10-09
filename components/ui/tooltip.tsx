"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface TooltipProps {
  content: string;
  /** A single focusable element (button, link). Receives aria-describedby. */
  children: React.ReactElement<{ "aria-describedby"?: string }>;
  side?: "top" | "bottom";
}

const EDGE = 8;

/**
 * Short supplementary label on hover and keyboard focus. Escape dismisses it
 * (WCAG 1.4.13) and it is nudged to stay inside the viewport. Never put
 * essential information only in a tooltip.
 */
export function Tooltip({ content, children, side = "top" }: TooltipProps) {
  const id = React.useId();
  const tipRef = React.useRef<HTMLSpanElement>(null);
  const [dismissed, setDismissed] = React.useState(false);
  const [shift, setShift] = React.useState(0);

  const reposition = () => {
    const tip = tipRef.current;
    if (!tip) return;
    // Measure the centred position (without the current shift) and clamp it.
    const rect = tip.getBoundingClientRect();
    const left = rect.left - shift;
    const right = rect.right - shift;
    let next = 0;
    if (left < EDGE) next = EDGE - left;
    else if (right > window.innerWidth - EDGE) next = window.innerWidth - EDGE - right;
    setShift(next);
  };

  return (
    <span
      className="group/tooltip relative inline-flex"
      onKeyDown={(event) => {
        if (event.key === "Escape") setDismissed(true);
      }}
      onPointerEnter={reposition}
      onFocus={reposition}
      onMouseLeave={() => setDismissed(false)}
      onBlur={() => setDismissed(false)}
    >
      {React.cloneElement(children, { "aria-describedby": id })}
      <span
        ref={tipRef}
        role="tooltip"
        id={id}
        style={{ translate: `calc(-50% + ${shift}px) 0` }}
        className={cn(
          "pointer-events-none invisible absolute left-1/2 z-(--z-dropdown) w-max max-w-64 rounded-[6px] bg-inverse px-2 py-1 text-label font-medium text-fg-inverse opacity-0 shadow-raised",
          "transition-opacity duration-(--duration-base) ease-standard",
          side === "top" ? "bottom-full mb-2" : "top-full mt-2",
          !dismissed &&
            "group-hover/tooltip:visible group-hover/tooltip:opacity-100 group-focus-within/tooltip:visible group-focus-within/tooltip:opacity-100",
        )}
      >
        {content}
      </span>
    </span>
  );
}
