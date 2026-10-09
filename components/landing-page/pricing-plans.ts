import type { UsageWindow } from "@/lib/config/limits";

/**
 * Landing-page pricing.
 *
 * DEMO CONTENT: only the Free plan reflects the product today (its interview
 * limit comes from lib/config/limits.ts). Pro and Premium are placeholders:
 * update their prices and features, then set `available: true`, before
 * they are sold.
 */
export interface Plan {
  name: string;
  tagline: string;
  price: string;
  period: string;
  features: string[];
  available: boolean;
  /** Visually emphasised card. */
  featured?: boolean;
}

export function getPlans(limit: number, period: UsageWindow): Plan[] {
  return [
    {
      name: "Free",
      tagline: "For getting started",
      price: "$0",
      period: "/month",
      features: [
        `${limit} interviews per ${period}`,
        "Technical, behavioral and system design interviews",
        "Questions based on your resume, role and level",
        "Interview memory across sessions",
        "A scored report after every interview",
      ],
      available: true,
    },
    {
      name: "Pro",
      tagline: "For an active job search",
      price: "$19",
      period: "/month",
      features: [
        "Everything in Free",
        "50 interviews per month",
        "Deeper progress tracking",
        "Priority report processing",
        "Email support",
      ],
      available: false,
      featured: true,
    },
    {
      name: "Premium",
      tagline: "For intensive preparation",
      price: "$39",
      period: "/month",
      features: [
        "Everything in Pro",
        "Unlimited interviews",
        "Company-focused practice plans",
        "Early access to new features",
        "Priority support",
      ],
      available: false,
    },
  ];
}
