import type { UsageWindow } from "@/lib/config/limits";

/**
 * Landing-page pricing.
 *
 * Only the Free plan exists today (its interview limit comes from
 * lib/config/limits.ts). Pro and Premium are not launched: they show no
 * price (`price: null` renders "To be announced") and no specific features.
 * Fill in real prices and features and set `available: true` only when a
 * plan can actually be bought.
 */
export interface Plan {
  name: string;
  tagline: string;
  /** null = not decided yet (shown as "To be announced"). */
  price: string | null;
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
      featured: true,
    },
    {
      name: "Pro",
      tagline: "For an active job search",
      price: null,
      period: "",
      features: ["Everything in Free", "A higher monthly interview limit", "Plan details to be announced"],
      available: false,
    },
    {
      name: "Premium",
      tagline: "For intensive preparation",
      price: null,
      period: "",
      features: ["Everything in Pro", "The highest monthly interview limit", "Plan details to be announced"],
      available: false,
    },
  ];
}
