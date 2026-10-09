import { Mona_Sans } from "next/font/google";

/**
 * Brand typeface for the design system (`--font-brand` / `--font-display` in
 * app/globals.css). Mona Sans is variable in weight and width: display text
 * uses a slightly expanded width, UI and data the normal width.
 *
 * `preload: false` while only the design preview uses it, so existing pages
 * don't download a font they never render. Switch to `true` when the first
 * production page (the landing page) adopts the new system.
 */
export const brandSans = Mona_Sans({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-mona-sans",
  display: "swap",
  preload: false,
});
