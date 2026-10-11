import type { ReactNode } from "react";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Selectable card backed by a native checkbox, so keyboard, screen-reader and
 * form semantics come from the browser. The input is visually hidden; the
 * card shows its checked and focus states.
 *
 * `tag` sits on the card's top edge (outside the content flow), so adding or
 * removing it never changes the card's size or the grid around it.
 */
export function ChoiceCard({
  name,
  value,
  checked,
  onChange,
  label,
  description,
  tag,
  className,
}: {
  name: string;
  value: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: ReactNode;
  tag?: string;
  className?: string;
}) {
  return (
    <label
      className={cn(
        "relative flex min-h-11 cursor-pointer items-start gap-3 rounded-control border bg-panel px-3.5 py-3 transition-[border-color,background-color,box-shadow] duration-(--duration-fast) ease-standard",
        "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-focus",
        checked ? "border-brand bg-brand-soft shadow-control" : "border-line hover:border-line-control",
        className,
      )}
    >
      <input
        type="checkbox"
        name={name}
        value={value}
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="sr-only"
      />
      <span
        aria-hidden
        className={cn(
          "mt-0.5 inline-flex size-4 shrink-0 items-center justify-center rounded-[4px] border transition-[background-color,border-color] duration-(--duration-fast)",
          checked ? "border-brand bg-brand text-on-brand" : "border-line-control bg-panel",
        )}
      >
        {checked && <Check strokeWidth={3} className="size-3" />}
      </span>
      <span className="min-w-0">
        <span className="block text-small font-semibold text-fg">{label}</span>
        {description && <span className="mt-0.5 block text-small text-fg-muted">{description}</span>}
      </span>
      {tag && (
        <span className="absolute -top-2 right-2.5 inline-flex h-4 items-center rounded-badge bg-brand px-1.5 text-[0.6875rem] leading-none font-semibold text-on-brand">
          <span className="sr-only">, </span>
          {tag}
        </span>
      )}
    </label>
  );
}
