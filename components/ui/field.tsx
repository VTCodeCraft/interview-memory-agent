import * as React from "react";
import { CircleAlert } from "lucide-react";
import { cn } from "@/lib/utils";

/** Label above the control (never placeholder-as-label). */
export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("text-small font-semibold text-fg", className)} {...props} />;
}

/** Helper text below the control; link it with aria-describedby. */
export function FieldHint({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-small text-fg-muted", className)} {...props} />;
}

/** Inline validation message below the control; pair with aria-invalid on the control. */
export function FieldError({ className, children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("flex items-center gap-1.5 text-small font-medium text-danger", className)} {...props}>
      <CircleAlert aria-hidden strokeWidth={2} className="size-3.5 shrink-0" />
      {children}
    </p>
  );
}

/** Vertical label / control / hint / error stack with the standard gap. */
export function Field({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col gap-2", className)} {...props} />;
}
