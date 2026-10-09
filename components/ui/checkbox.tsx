import * as React from "react";
import { cn } from "@/lib/utils";

/** Native checkbox tinted with the brand colour (keeps native a11y and keyboard behaviour). */
export const Checkbox = React.forwardRef<
  HTMLInputElement,
  Omit<React.InputHTMLAttributes<HTMLInputElement>, "type">
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    type="checkbox"
    className={cn(
      "size-4 shrink-0 cursor-pointer rounded-[4px] accent-brand focus-ring disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    {...props}
  />
));
Checkbox.displayName = "Checkbox";
