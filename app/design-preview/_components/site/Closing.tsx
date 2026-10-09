import { ArrowRight } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Brand } from "./Brand";

export function ClosingCta() {
  return (
    <section id="get-started" aria-labelledby="cta-title" className="ds-container scroll-mt-20 pt-(--spacing-section)">
      <div className="rounded-bezel bg-inverse px-6 py-12 text-fg-inverse shadow-raised [--color-focus:var(--color-fg-inverse)] sm:px-12 sm:py-16 lg:px-16">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
          <h2 id="cta-title" className="ds-display text-balance text-headline text-fg-inverse lg:col-span-8">
            Walk into the room already prepared.
          </h2>
          <div className="flex flex-col gap-3 sm:flex-row lg:col-span-4 lg:justify-end">
            <a
              href="#top"
              className={cn(
                buttonVariants({ size: "lg" }),
                "bg-fg-inverse text-inverse shadow-none hover:bg-fg-inverse/90 active:bg-fg-inverse/80",
              )}
            >
              Start practicing
              <ArrowRight aria-hidden strokeWidth={1.75} />
            </a>
            <a
              href="#reports"
              className={cn(
                buttonVariants({ variant: "ghost", size: "lg" }),
                "border border-fg-inverse/25 text-fg-inverse hover:bg-fg-inverse/10 hover:text-fg-inverse active:bg-fg-inverse/15",
              )}
            >
              See a sample report
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

const FOOTER_COLUMNS = [
  { title: "Product", links: ["Interviews", "Reports", "Memory", "Analytics"] },
  { title: "Company", links: ["About", "Privacy", "Terms"] },
];

export function SiteFooter() {
  return (
    <footer className="ds-container pt-(--spacing-section)">
      <div className="grid gap-10 border-t border-line pt-10 pb-12 md:grid-cols-12">
        <div className="md:col-span-6">
          <Brand />
          <p className="mt-4 max-w-[32ch] text-small text-fg-muted">
            Voice interview practice that remembers, so every session starts ahead of the last.
          </p>
        </div>
        {FOOTER_COLUMNS.map((column) => (
          <nav key={column.title} aria-label={column.title} className="md:col-span-3">
            <p className="text-label font-semibold text-fg">{column.title}</p>
            <ul className="mt-3 flex flex-col gap-2">
              {column.links.map((link) => (
                <li key={link}>
                  <a href="#top" className="rounded-control text-small text-fg-muted hover:text-fg focus-ring">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <p className="border-t border-line-subtle py-6 text-label font-normal text-fg-subtle">
        &copy; 2026 Clutchly. Preview content.
      </p>
    </footer>
  );
}
