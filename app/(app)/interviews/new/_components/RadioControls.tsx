import { cn } from "@/lib/utils";

/**
 * Single-choice card backed by a native radio (arrow keys move the choice,
 * the group is one tab stop). The checked card shows a brand border, tint and
 * a filled dot, so state never relies on colour alone.
 */
export function OptionCard({
  name,
  value,
  checked,
  onSelect,
  label,
  description,
  describedBy,
  className,
}: {
  name: string;
  value: string;
  checked: boolean;
  onSelect: () => void;
  label: string;
  description?: string;
  describedBy?: string;
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
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onSelect}
        aria-describedby={describedBy}
        className="sr-only"
      />
      <span
        aria-hidden
        className={cn(
          "mt-0.5 inline-flex size-4 shrink-0 items-center justify-center rounded-full border transition-[background-color,border-color] duration-(--duration-fast)",
          checked ? "border-brand bg-brand" : "border-line-control bg-panel",
        )}
      >
        {checked && <span className="size-1.5 rounded-full bg-on-brand" />}
      </span>
      <span className="min-w-0">
        <span className="block text-small font-semibold text-fg">{label}</span>
        {description && <span className="mt-0.5 block text-small text-fg-muted">{description}</span>}
      </span>
    </label>
  );
}

/** Segmented single choice for a few short labels; the chosen segment is raised. */
export function Segmented<T extends string>({
  name,
  value,
  options,
  onChange,
  describedBy,
  invalid,
}: {
  name: string;
  value: T | "";
  options: readonly { value: T; label: string }[];
  onChange: (value: T) => void;
  describedBy?: string;
  invalid?: boolean;
}) {
  return (
    <div
      className={cn("grid gap-1 rounded-control border bg-sunken p-1", invalid ? "border-danger" : "border-line")}
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
    >
      {options.map((option) => {
        const checked = option.value === value;
        return (
          <label
            key={option.value}
            className={cn(
              "relative flex h-10 cursor-pointer items-center justify-center rounded-item px-2 text-center text-small transition-[background-color,color,box-shadow] duration-(--duration-fast) ease-standard",
              "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-focus",
              checked ? "bg-panel font-semibold text-fg shadow-control ring-1 ring-line" : "font-medium text-fg-muted hover:text-fg",
            )}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={checked}
              onChange={() => onChange(option.value)}
              aria-describedby={describedBy}
              className="sr-only"
            />
            {option.label}
          </label>
        );
      })}
    </div>
  );
}
