/**
 * Feature switches for UI that isn't ready to show.
 *
 * pricing: the landing-page pricing section and its "Pricing" nav link.
 * Hidden until payments are integrated; the section and plan data stay in
 * components/landing-page/PricingSection.tsx and pricing-plans.ts.
 */
export const FEATURES = {
  pricing: false,
} as const;
