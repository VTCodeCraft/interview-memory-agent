"use client";

import type { ReactNode } from "react";
import { useLinkStatus } from "next/link";
import { LoaderCircle } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Inline feedback while the parent <Link> navigates (Next's useLinkStatus),
 * for routes without a loading.js. Must be rendered inside a Link. Fixed size
 * and always rendered, so toggling it never shifts the layout: it shows
 * `idle` (for example a chevron) and swaps it for a spinner while pending.
 */
export function LinkPending({ idle, className }: { idle?: ReactNode; className?: string }) {
  const { pending } = useLinkStatus();
  return (
    <span aria-hidden className={cn("relative inline-flex size-4 shrink-0 items-center justify-center", className)}>
      {idle && (
        <span className={cn("inline-flex transition-opacity duration-(--duration-fast) ease-standard", pending && "opacity-0")}>
          {idle}
        </span>
      )}
      <LoaderCircle
        strokeWidth={2}
        className={cn(
          "absolute size-full text-brand opacity-0 transition-opacity duration-(--duration-fast) ease-standard",
          pending && "opacity-100 motion-safe:animate-spin",
        )}
      />
    </span>
  );
}
