import type { CSSProperties } from "react";

export type DirectionId = "precision" | "editorial" | "spatial";

export interface Direction {
  id: DirectionId;
  name: string;
  /** The brief's category this direction answers. */
  category: string;
  oneLiner: string;
  concept: string;
  fonts: { display: string; ui: string; data: string };
  recommended: boolean;
  /** Headline colours for the details drawer and the comparison summary. */
  keyColors: { label: string; value: string }[];
  why: string[];
  tradeoffs: string[];
  /**
   * Token overrides for the preview subtree. Precision is the default system
   * in app/globals.css, so it overrides nothing.
   */
  vars: Record<string, string>;
}

export const DIRECTIONS: Direction[] = [
  {
    id: "precision",
    name: "Precision",
    category: "Premium AI SaaS",
    oneLiner: "Quiet, exact and confident. Ink and ultramarine on porcelain.",
    concept:
      "Refined neutral surfaces, ink primary actions and a single ultramarine accent that marks every remembered moment. Mona Sans at a slightly expanded width gives headlines presence without decoration; the product does the talking.",
    fonts: { display: "Mona Sans, 108% width", ui: "Mona Sans", data: "Geist Mono" },
    recommended: true,
    keyColors: [
      { label: "Canvas", value: "#F8F8F6" },
      { label: "Ink", value: "#0C0D10" },
      { label: "Ultramarine", value: "#3541E2" },
      { label: "Muted text", value: "#4E5057" },
    ],
    why: [
      "Reads as serious software you can trust with your career, at first glance",
      "One accent with one meaning: ultramarine is memory and intelligence",
      "Scales from a hero to dense score tables without changing language",
      "Stays coherent with the current logo's hue, so no forced rebrand",
    ],
    tradeoffs: [
      "Restraint depends on craft; sloppy spacing would expose it immediately",
      "Blue family needs the ink-and-width typography to avoid feeling familiar",
    ],
    vars: {},
  },
  {
    id: "editorial",
    name: "Editorial",
    category: "Editorial technology",
    oneLiner: "Typographic, opinionated and calm. A career journal with intelligence.",
    concept:
      "Newsreader display serif over Instrument Sans, warm paper, ink rules instead of shadows and a vermilion accent used like an editor's mark. Personality comes from type and whitespace, not effects.",
    fonts: { display: "Newsreader", ui: "Instrument Sans", data: "Geist Mono" },
    recommended: false,
    keyColors: [
      { label: "Paper", value: "#F3F1EB" },
      { label: "Ink", value: "#151412" },
      { label: "Vermilion", value: "#C2391B" },
      { label: "Muted text", value: "#4B4842" },
    ],
    why: [
      "The most distinctive first impression of the three",
      "Memory as a written record is an honest, human metaphor",
      "Feels considered and premium with almost no decoration",
    ],
    tradeoffs: [
      "Serif display slows dense product screens; UI must stay sans",
      "Vermilion sits close to error red, so status needs icons and words",
      "Can read as a publication rather than software you talk to",
    ],
    vars: {
      "--font-brand": "var(--font-instrument-sans), ui-sans-serif, system-ui, sans-serif",
      "--font-display": "var(--font-newsreader), Georgia, serif",
      "--display-variation": "normal",
      "--emphasis-style": "italic",
      "--emphasis-color": "var(--color-fg)",
      "--text-display": "clamp(2.9rem, 1.55rem + 5.4vw, 5.4rem)",
      "--text-display--line-height": "1.0",
      "--text-display--letter-spacing": "-0.022em",
      "--text-display--font-weight": "400",
      "--text-headline": "clamp(2.25rem, 1.5rem + 3vw, 3.6rem)",
      "--text-headline--line-height": "1.04",
      "--text-headline--letter-spacing": "-0.018em",
      "--text-headline--font-weight": "400",
      "--text-title--font-weight": "450",
      "--text-title--letter-spacing": "-0.012em",
      "--text-metric--font-weight": "400",
      "--text-metric--letter-spacing": "-0.03em",
      "--color-canvas": "#f3f1eb",
      "--color-panel": "#faf9f5",
      "--color-sunken": "#e9e6de",
      "--color-line-subtle": "#e2ded5",
      "--color-line": "#d8d3c8",
      "--color-line-strong": "#151412",
      "--color-line-control": "#878275",
      "--color-fg": "#151412",
      "--color-fg-muted": "#4b4842",
      "--color-fg-subtle": "#625e56",
      "--color-fg-disabled": "#a8a398",
      "--color-inverse": "#151412",
      "--color-fg-inverse": "#f3f1eb",
      "--color-brand": "#c2391b",
      "--color-brand-hover": "#a42f15",
      "--color-brand-active": "#8a2710",
      "--color-brand-soft": "#fbeee9",
      "--color-brand-tint": "#f6ddd4",
      "--color-brand-ink": "#94290f",
      "--color-action": "#151412",
      "--color-action-hover": "#34312c",
      "--color-action-active": "#4a4640",
      "--color-on-action": "#faf9f5",
      "--color-memory": "#c2391b",
      "--color-memory-soft": "#fbeee9",
      "--color-memory-line": "#edb9a9",
      "--color-focus": "#151412",
      "--color-chart-1": "#c2391b",
      "--color-chart-2": "#1f4e8c",
      "--color-chart-3": "#2e7468",
      "--color-chart-4": "#7a5c99",
      "--color-chart-baseline": "#a39e92",
      "--color-chart-grid": "#e2ded5",
      "--radius-control": "0.1875rem",
      "--radius-button": "0.125rem",
      "--radius-card": "0.25rem",
      "--radius-overlay": "0.25rem",
      "--radius-badge": "0.125rem",
      "--radius-bezel": "0.375rem",
      "--shadow-control": "none",
      "--shadow-card": "none",
      "--shadow-raised": "0 1px 0 rgb(21 20 18 / 0.06), 0 24px 40px -32px rgb(21 20 18 / 0.35)",
      "--shadow-overlay": "0 2px 4px rgb(21 20 18 / 0.06), 0 24px 48px -24px rgb(21 20 18 / 0.3)",
      "--surface-highlight": "0 0 #0000",
      "--bezel-fill": "transparent",
      "--bezel-ring": "#151412",
      "--bezel-shadow": "0 0 #0000",
    },
  },
  {
    id: "spatial",
    name: "Spatial",
    category: "Refined spatial AI",
    oneLiner: "Light, layered and luminous. Memory you can see in depth.",
    concept:
      "Frosted panels over a cool, softly lit canvas, so past sessions sit visibly behind the present one. Geist for crisp, system-like type, capsule controls and a lagoon accent for intelligence.",
    fonts: { display: "Geist", ui: "Geist", data: "Geist Mono" },
    recommended: false,
    keyColors: [
      { label: "Mist", value: "#EDF1F6" },
      { label: "Night", value: "#0D1321" },
      { label: "Lagoon", value: "#0B7186" },
      { label: "Muted text", value: "#465066" },
    ],
    why: [
      "Depth makes memory literal: earlier sessions sit behind the current one",
      "Feels like next-generation AI without neon or purple",
      "Delightful in hero and marketing moments",
    ],
    tradeoffs: [
      "Glass needs real content behind it; dense product pages lose the effect",
      "Backdrop blur costs GPU time on low-end phones",
      "Easier to drift into trend than the other two over time",
    ],
    vars: {
      "--font-brand": "var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif",
      "--font-display": "var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif",
      "--display-variation": "normal",
      "--emphasis-style": "normal",
      "--emphasis-color": "var(--color-brand)",
      "--text-display--font-weight": "600",
      "--text-display--letter-spacing": "-0.048em",
      "--text-headline--font-weight": "600",
      "--text-headline--letter-spacing": "-0.04em",
      "--text-title--font-weight": "600",
      "--canvas-image":
        "radial-gradient(52rem 34rem at 90% -8%, rgb(125 211 252 / 0.34), transparent 70%), radial-gradient(42rem 32rem at -10% 28%, rgb(153 246 228 / 0.28), transparent 70%), radial-gradient(48rem 30rem at 50% 112%, rgb(191 219 254 / 0.5), transparent 70%)",
      "--surface-backdrop": "blur(22px) saturate(160%)",
      "--surface-highlight": "inset 0 1px 0 rgb(255 255 255 / 0.9), inset 0 0 0 1px rgb(255 255 255 / 0.4)",
      "--bezel-padding": "0.5rem",
      "--bezel-fill": "rgb(255 255 255 / 0.3)",
      "--bezel-ring": "rgb(255 255 255 / 0.75)",
      "--color-canvas": "#edf1f6",
      "--color-panel": "rgb(255 255 255 / 0.64)",
      "--color-sunken": "rgb(13 19 33 / 0.045)",
      "--color-line-subtle": "rgb(13 19 33 / 0.06)",
      "--color-line": "rgb(13 19 33 / 0.08)",
      "--color-line-strong": "rgb(13 19 33 / 0.14)",
      "--color-line-control": "#808a9c",
      "--color-fg": "#0d1321",
      "--color-fg-muted": "#465066",
      "--color-fg-subtle": "#58627a",
      "--color-fg-disabled": "#9aa3b5",
      "--color-inverse": "#0d1321",
      "--color-fg-inverse": "#eef2f7",
      "--color-brand": "#0b7186",
      "--color-brand-hover": "#085c6e",
      "--color-brand-active": "#064a59",
      "--color-brand-soft": "#e6f4f7",
      "--color-brand-tint": "#d2ecf1",
      "--color-brand-ink": "#075263",
      "--color-action": "#0b7186",
      "--color-action-hover": "#085c6e",
      "--color-action-active": "#064a59",
      "--color-on-action": "#ffffff",
      "--color-memory": "#0b7186",
      "--color-memory-soft": "#e6f4f7",
      "--color-memory-line": "#a9d8e2",
      "--color-focus": "#0b7186",
      "--color-chart-1": "#0b7186",
      "--color-chart-2": "#4f5bd5",
      "--color-chart-3": "#b86a12",
      "--color-chart-4": "#b4446c",
      "--color-chart-baseline": "#9aa3b5",
      "--color-chart-grid": "#dce2ea",
      "--radius-control": "0.75rem",
      "--radius-button": "999px",
      "--radius-card": "1.25rem",
      "--radius-overlay": "1.25rem",
      "--radius-badge": "999px",
      "--radius-bezel": "1.875rem",
      "--shadow-control": "0 1px 2px rgb(13 19 33 / 0.06)",
      "--shadow-card": "0 1px 1px rgb(13 19 33 / 0.03), 0 18px 40px -22px rgb(13 19 33 / 0.22)",
      "--shadow-raised": "0 2px 8px rgb(13 19 33 / 0.06), 0 40px 80px -36px rgb(13 19 33 / 0.4)",
      "--shadow-overlay": "0 4px 12px rgb(13 19 33 / 0.08), 0 40px 80px -30px rgb(13 19 33 / 0.42)",
    },
  },
];

export const directionById = (id: string | undefined): Direction =>
  DIRECTIONS.find((d) => d.id === id) ?? DIRECTIONS[0];

export const directionStyle = (d: Direction): CSSProperties => d.vars as CSSProperties;
