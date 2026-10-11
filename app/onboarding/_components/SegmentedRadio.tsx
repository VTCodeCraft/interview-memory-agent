import { cn } from "@/lib/utils";

/**
 * Single-choice segmented control built from native radios (arrow keys move
 * the selection, the group is one tab stop). Meant for a few short labels.
 * The chosen segment is raised (white, shadow, semibold), not colour alone.
 */
export function SegmentedRadio<T extends string>({
  name,
  value,
  options,
  onChange,
  describedBy,
}: {
  name: string;
  value: T;
  options: readonly { value: T; label: string }[];
  onChange: (value: T) => void;
  describedBy?: string;
}) {
  return (
    <div
      className="grid gap-1 rounded-control border border-line bg-sunken p-1"
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
