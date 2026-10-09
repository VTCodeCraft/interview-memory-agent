import { Check } from "lucide-react";

import AuthCta, { type AuthState } from "./AuthCta";
import type { UsageWindow } from "@/lib/config/limits";
import SectionHeading from "./SectionHeading";

// Mirrors the product today: one free plan; the limit comes from
// lib/config/limits.ts via app/page.tsx.
const INCLUDED = [
  "Voice interviews: technical, behavioral and system design",
  "Questions based on your resume, role, company and level",
  "Interview memory that shapes each new interview",
  "A scored report after every interview",
  "Progress tracking on your Memory page",
];

export default function PricingSection({
  limit,
  period,
  ...auth
}: AuthState & { limit: number; period: UsageWindow }) {
  return (
    <section id="pricing" aria-labelledby="pricing-title" className="ds-container scroll-mt-20 pt-(--spacing-section)">
      <SectionHeading
        id="pricing-title"
        title="Simple, free to start."
        intro="Clutchly currently has one plan. No payment details are needed to sign up."
      />

      <div className="ds-surface mt-10 grid overflow-hidden rounded-card sm:mt-14 md:grid-cols-12">
        <div className="flex flex-col justify-between gap-8 border-b border-line-subtle p-6 sm:p-8 md:col-span-5 md:border-r md:border-b-0">
          <div>
            <p className="text-small font-semibold text-fg">Free</p>
            <p className="mt-3 flex items-baseline gap-2">
              <span className="ds-display text-metric text-fg">{limit}</span>
              <span className="text-body text-fg-muted">interviews per {period}</span>
            </p>
            <p className="mt-3 text-small text-fg-muted">
              Cancelled interviews count toward the limit. One interview can be in progress at a time.
            </p>
          </div>
          <AuthCta {...auth} size="md" signedOutLabel="Create a free account" className="self-start" />
        </div>
        <div className="p-6 sm:p-8 md:col-span-7">
          <p className="text-label font-semibold text-fg-subtle">Included</p>
          <ul className="mt-4 flex flex-col gap-3">
            {INCLUDED.map((item) => (
              <li key={item} className="flex gap-3 text-body text-fg">
                <Check aria-hidden strokeWidth={2} className="mt-1 size-4 shrink-0 text-brand" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
