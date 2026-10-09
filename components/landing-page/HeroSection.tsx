import AuthCta, { type AuthState } from "./AuthCta";
import type { UsageWindow } from "@/lib/config/limits";
import { buttonVariants } from "@/components/ui/button";
import CoachOverview from "./coach-overview/CoachOverview";

export default function HeroSection({
  limit,
  period,
  ...auth
}: AuthState & { limit: number; period: UsageWindow }) {
  return (
    <section aria-labelledby="hero-title" className="pt-14 sm:pt-20 lg:pt-24">
      <div className="ds-container">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end lg:gap-12">
          <div className="lg:col-span-8">
            <p className="inline-flex items-center gap-2 text-small font-medium text-fg-muted">
              <span aria-hidden className="size-1.5 rounded-full bg-brand" />
              AI voice interview coach with memory
            </p>
            <h1 id="hero-title" className="ds-display mt-5 max-w-[15ch] text-balance text-display text-fg sm:mt-6">
              Your next interview starts where the last one <em>ended.</em>
            </h1>
          </div>
          <p className="max-w-[34rem] text-lead text-fg-muted lg:col-span-4 lg:pb-3">
            Clutchly runs realistic voice mock interviews, remembers your strengths and gaps from each one, and uses
            that history to shape the next session.
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-4 sm:mt-10 sm:flex-row sm:items-center sm:gap-6">
          <div className="flex flex-col gap-3 sm:flex-row">
            <AuthCta {...auth} />
            <a href="#how-it-works" className={buttonVariants({ variant: "secondary", size: "lg" })}>
              See how it works
            </a>
          </div>
          <p className="text-small text-fg-subtle">
            Free plan with {limit} interviews a {period}. Runs in your browser.
          </p>
        </div>
      </div>

      <figure className="ds-container mt-12 sm:mt-16 lg:mt-20">
        <div className="ds-bezel">
          <div className="ds-surface ds-bezel-core overflow-hidden">
            <CoachOverview />
          </div>
        </div>
        <figcaption className="mt-4 text-small text-fg-subtle">Illustration with sample data.</figcaption>
      </figure>
    </section>
  );
}
