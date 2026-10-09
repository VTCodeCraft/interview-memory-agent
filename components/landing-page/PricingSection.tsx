import { Check } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import type { UsageWindow } from "@/lib/config/limits";
import { cn } from "@/lib/utils";
import AuthCta, { type AuthState } from "./AuthCta";
import { getPlans } from "./pricing-plans";
import SectionHeading from "./SectionHeading";

/** Three-tier pricing. Plan content lives in pricing-plans.ts (paid tiers are demo content). */
export default function PricingSection({
  limit,
  period,
  ...auth
}: AuthState & { limit: number; period: UsageWindow }) {
  const plans = getPlans(limit, period);

  return (
    <section id="pricing" aria-labelledby="pricing-title" className="ds-container mt-(--spacing-section) scroll-mt-22">
      <SectionHeading
        id="pricing-title"
        title="Simple pricing. Start free."
        intro="Practice for free today. Paid plans with more interviews are on the way."
      />

      <ul className="mt-10 grid gap-4 sm:mt-14 sm:gap-5 lg:grid-cols-3">
        {plans.map((plan) => (
          <li
            key={plan.name}
            className={cn(
              "flex flex-col rounded-card border bg-panel p-6 sm:p-8",
              plan.featured ? "border-fg shadow-raised" : "border-line shadow-card",
            )}
          >
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-heading text-fg">{plan.name}</h3>
              <span
                className={cn(
                  "inline-flex h-6 items-center rounded-badge border px-2 text-label",
                  plan.available
                    ? "border-success-line bg-success-soft text-success"
                    : "border-line bg-sunken text-fg-muted",
                )}
              >
                {plan.available ? "Available now" : "Coming soon"}
              </span>
            </div>
            <p className="mt-1 text-small text-fg-muted">{plan.tagline}</p>

            <p className="mt-6 flex items-baseline gap-1">
              {plan.price ? (
                <>
                  <span className="ds-display text-metric text-fg">{plan.price}</span>
                  <span className="text-body text-fg-muted">{plan.period}</span>
                </>
              ) : (
                <span className="ds-display text-title text-fg-muted">To be announced</span>
              )}
            </p>

            <ul className="mt-6 flex flex-1 flex-col gap-3 border-t border-line-subtle pt-6">
              {plan.features.map((feature) => (
                <li key={feature} className="flex gap-3 text-body text-fg">
                  <Check aria-hidden strokeWidth={2} className="mt-1 size-4 shrink-0 text-brand" />
                  {feature}
                </li>
              ))}
            </ul>

            <div className="mt-8">
              {plan.available ? (
                <AuthCta {...auth} size="md" signedOutLabel="Start for free" className="w-full" />
              ) : (
                <button type="button" disabled className={cn(buttonVariants({ variant: "secondary" }), "w-full")}>
                  Coming soon
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>

      <p className="mt-5 text-small text-fg-subtle">
        Pro and Premium are planned and not available yet. There are no paid plans today.
      </p>
    </section>
  );
}
