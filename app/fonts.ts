import { Mona_Sans } from "next/font/google";

/**
 * Brand typeface for the design system (`--font-brand` / `--font-display` in
 * app/globals.css). Mona Sans is variable in weight and width: display text
 * uses a slightly expanded width, UI and data the normal width.
 *
 * `preload: false`: the font is declared in the root layout, so preloading it
 * would make every page download it, while only the landing page and
 * /design-preview use it so far. Switch to `true` once most pages have moved
 * to the new design system.
 */
export const brandSans = Mona_Sans({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-mona-sans",
  display: "swap",
  preload: false,
});
