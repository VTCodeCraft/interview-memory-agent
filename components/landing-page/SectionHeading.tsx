import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  id: string;
  eyebrow?: string;
  title: ReactNode;
  intro?: ReactNode;
  className?: string;
}

/** Section headline (left) with an optional intro paragraph (right on large screens). */
export default function SectionHeading({ id, eyebrow, title, intro, className }: SectionHeadingProps) {
  return (
    <div className={cn("grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-12", className)}>
      <div className="lg:col-span-7">
        {eyebrow && <p className="mb-4 text-small font-medium text-fg-muted">{eyebrow}</p>}
        <h2 id={id} className="ds-display text-balance text-headline text-fg">
          {title}
        </h2>
      </div>
      {intro && <p className="max-w-[34rem] text-lead text-fg-muted lg:col-span-5">{intro}</p>}
    </div>
  );
}
