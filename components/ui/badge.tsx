import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/** Status labels. Always text (plus optional icon) - never colour alone. */
const badgeVariants = cva(
  "inline-flex h-6 items-center gap-1 whitespace-nowrap rounded-badge border px-2 text-label [&_svg]:size-3.5 [&_svg]:shrink-0",
  {
    variants: {
      tone: {
        neutral: "border-line bg-sunken text-fg-muted",
        brand: "border-transparent bg-brand-tint text-brand-ink",
        success: "border-success-line bg-success-soft text-success",
        warning: "border-warning-line bg-warning-soft text-warning",
        danger: "border-danger-line bg-danger-soft text-danger",
        info: "border-info-line bg-info-soft text-info",
        // "The coach remembered this": ink text on the memory tint.
        memory: "border-memory-line bg-memory-soft text-fg",
      },
    },
    defaultVariants: { tone: "neutral" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, tone, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}

export { badgeVariants };
