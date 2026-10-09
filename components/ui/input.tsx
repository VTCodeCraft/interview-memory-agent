import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

/** Shared look for text-like controls: 3.3:1 border, brand border + tint ring on focus, danger when aria-invalid. */
const controlBase = [
  "w-full rounded-control border border-line-control bg-panel text-body text-fg shadow-control",
  "placeholder:text-fg-subtle",
  "transition-[border-color,box-shadow] duration-(--duration-fast) ease-standard",
  "focus-visible:border-brand focus-visible:shadow-[0_0_0_3px_var(--color-brand-tint)] focus-visible:outline-none",
  "aria-invalid:border-danger aria-invalid:focus-visible:shadow-[0_0_0_3px_var(--color-danger-soft)]",
  "disabled:cursor-not-allowed disabled:border-line disabled:bg-sunken disabled:text-fg-disabled disabled:shadow-none",
].join(" ");

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type = "text", ...props }, ref) => (
  <input ref={ref} type={type} className={cn(controlBase, "h-10 px-3", className)} {...props} />
));
Input.displayName = "Input";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, rows = 4, ...props }, ref) => (
  <textarea
    ref={ref}
    rows={rows}
    className={cn(controlBase, "min-h-24 resize-y px-3 py-2.5", className)}
    {...props}
  />
));
Textarea.displayName = "Textarea";

/** Native select (keyboard + screen-reader behaviour for free) with system styling. */
export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => (
  <div className="relative">
    <select
      ref={ref}
      className={cn(controlBase, "h-10 cursor-pointer appearance-none pl-3 pr-9", className)}
      {...props}
    >
      {children}
    </select>
    <ChevronDown
      aria-hidden
      strokeWidth={1.75}
      className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-fg-subtle"
    />
  </div>
));
Select.displayName = "Select";
