import { Instrument_Sans, Newsreader } from "next/font/google";

/**
 * Fonts for the explored directions that are not the default. Loaded only on
 * the design preview route. Spatial's Geist / Geist Mono come from the root
 * layout; Precision's Mona Sans from app/fonts.ts.
 */
export const editorialSerif = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
  axes: ["opsz"],
  style: ["normal", "italic"],
  display: "swap",
});

export const editorialSans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument-sans",
  display: "swap",
});
