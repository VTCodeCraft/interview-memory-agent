import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * tailwind-merge must know the design-system tokens (app/globals.css), or it
 * reads `text-small` and `text-on-brand` as two conflicting colours and drops
 * one of them.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        {
          text: [
            "display",
            "headline",
            "title",
            "heading",
            "subheading",
            "lead",
            "body",
            "small",
            "label",
            "metric",
            "metric-sm",
          ],
        },
      ],
      rounded: [{ rounded: ["control", "button", "card", "overlay", "badge", "bezel", "item"] }],
      shadow: [{ shadow: ["control", "card", "raised", "overlay"] }],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function uid(prefix = "id"): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

export function nowISO(): string {
  return new Date().toISOString();
}
