import { ArrowRight } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { MemoryCanvas } from "./MemoryCanvas";

export function Hero() {
  return (
    <section id="top" className="ds-container pt-14 sm:pt-20 lg:pt-24">
      <div className="grid gap-8 lg:grid-cols-12 lg:items-end lg:gap-12">
        <div className="lg:col-span-8">
          <p className="inline-flex items-center gap-2 text-small font-medium text-fg-muted">
            <span aria-hidden className="size-1.5 rounded-full bg-memory" />
            Voice interview practice with memory
          </p>
          <h1 className="ds-display mt-5 max-w-[15ch] text-balance text-display text-fg sm:mt-6">
            Your next interview starts where the last one <em>ended.</em>
          </h1>
        </div>

        <p className="max-w-[34rem] text-lead text-fg-muted lg:col-span-4 lg:pb-3">
          Clutchly runs realistic voice interviews, remembers where you struggled, and builds every new
          session around it.
        </p>
      </div>

      <div className="mt-8 flex flex-col gap-4 sm:mt-10 sm:flex-row sm:items-center sm:gap-6">
        <div className="flex flex-col gap-3 sm:flex-row">
          <a href="#get-started" className={buttonVariants({ variant: "primary", size: "lg" })}>
            Start practicing
            <ArrowRight aria-hidden strokeWidth={1.75} />
          </a>
          <a href="#reports" className={buttonVariants({ variant: "secondary", size: "lg" })}>
            See a sample report
          </a>
        </div>
        <p className="text-small text-fg-subtle">Runs in your browser. Nothing to install.</p>
      </div>

      <div className="mt-12 sm:mt-16 lg:mt-20">
        <MemoryCanvas />
      </div>
    </section>
  );
}
