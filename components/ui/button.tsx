import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { LoaderCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  [
    "relative inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-button font-brand font-semibold tracking-[-0.005em]",
    "select-none transition-[background-color,border-color,color,box-shadow,transform] duration-(--duration-fast) ease-standard",
    "focus-ring motion-safe:active:translate-y-px",
    "disabled:pointer-events-none aria-busy:pointer-events-none",
    "[&_svg]:size-4 [&_svg]:shrink-0",
  ],
  {
    variants: {
      variant: {
        // Primary action uses the direction's action colour (ink in Precision).
        primary:
          "bg-action text-on-action shadow-control hover:bg-action-hover active:bg-action-active disabled:bg-sunken disabled:text-fg-disabled disabled:shadow-none",
        // Accent-filled button for rare brand moments.
        accent:
          "bg-brand text-on-brand shadow-control hover:bg-brand-hover active:bg-brand-active disabled:bg-sunken disabled:text-fg-disabled disabled:shadow-none",
        secondary:
          "border border-line-strong bg-panel text-fg shadow-control [backdrop-filter:var(--surface-backdrop)] hover:border-line-control hover:bg-sunken active:bg-sunken disabled:border-line disabled:bg-panel disabled:text-fg-disabled disabled:shadow-none",
        ghost:
          "text-fg-muted hover:bg-sunken hover:text-fg active:bg-line-subtle disabled:text-fg-disabled",
        danger:
          "bg-danger text-white shadow-control hover:bg-danger-hover disabled:bg-sunken disabled:text-fg-disabled disabled:shadow-none",
        link:
          "h-auto px-0 text-brand underline-offset-4 hover:text-brand-hover hover:underline motion-safe:active:translate-y-0 disabled:text-fg-disabled",
        // Legacy names kept so older components keep compiling.
        default:
          "bg-action text-on-action shadow-control hover:bg-action-hover active:bg-action-active disabled:bg-sunken disabled:text-fg-disabled disabled:shadow-none",
        outline:
          "border border-line-strong bg-panel text-fg shadow-control hover:border-line-control hover:bg-canvas active:bg-sunken disabled:text-fg-disabled",
        destructive:
          "bg-danger text-white shadow-control hover:bg-danger-hover disabled:bg-sunken disabled:text-fg-disabled",
      },
      size: {
        sm: "h-8 px-3 text-small",
        md: "h-10 px-4 text-body",
        lg: "h-12 px-6 text-[0.96875rem] [&_svg]:size-[1.125rem]",
        icon: "size-10",
        "icon-sm": "size-8",
        default: "h-10 px-4 text-body",
      },
    },
    compoundVariants: [{ variant: "link", class: "h-auto px-0" }],
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** Shows a spinner, keeps the label for layout stability and blocks clicks. */
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading = false, disabled, children, type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(buttonVariants({ variant, size, className }))}
      disabled={disabled}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && (
        <LoaderCircle aria-hidden className="motion-safe:animate-spin" strokeWidth={2} />
      )}
      {children}
    </button>
  ),
);
Button.displayName = "Button";

export { buttonVariants };
