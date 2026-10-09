import * as React from "react";
import { LoaderCircle } from "lucide-react";
import { cn } from "@/lib/utils";

/** Inline progress indicator for short waits; prefer Skeleton when layout is known. */
export function Spinner({ label = "Loading", showLabel = false, className }: { label?: string; showLabel?: boolean; className?: string }) {
  return (
    <span role="status" className={cn("inline-flex items-center gap-2 text-small text-fg-muted", className)}>
      <LoaderCircle aria-hidden strokeWidth={2} className="size-4 text-brand motion-safe:animate-spin" />
      <span className={showLabel ? undefined : "sr-only"}>{label}</span>
    </span>
  );
}

/** Placeholder block that matches the shape of the content being loaded. */
export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn("rounded-control bg-sunken motion-safe:animate-pulse", className)} />;
}
