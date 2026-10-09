"use client";

import { useEffect, useState, type RefObject } from "react";

/**
 * Reads CSS custom properties as the browser resolved them, so swatches and
 * contrast figures always describe the tokens actually rendered (no second
 * copy of the palette lives in the preview).
 */
export function useCssVars(
  names: readonly string[],
  scopeRef?: RefObject<HTMLElement | null>,
  deps: readonly unknown[] = [],
): Record<string, string> {
  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => {
    const el = scopeRef?.current ?? document.documentElement;
    const styles = getComputedStyle(el);
    setValues(
      Object.fromEntries(names.map((name) => [name, styles.getPropertyValue(name).trim()])),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [names.join("|"), ...deps]);

  return values;
}

type Rgba = [number, number, number, number];

function parseColor(value: string): Rgba | null {
  const v = value.trim().toLowerCase();
  // #rgb, #rgba, #rrggbb, #rrggbbaa (the CSS minifier may shorten tokens).
  const hex = v.match(/^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/);
  if (hex) {
    const h = hex[1].length <= 4 ? hex[1].replace(/./g, (c) => c + c) : hex[1];
    const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
    const a = h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1;
    return [r, g, b, a];
  }
  const rgb = v.match(/^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)(?:\s*[,/]\s*([\d.]+%?))?/);
  if (rgb) {
    const alpha = rgb[4] === undefined ? 1 : rgb[4].endsWith("%") ? parseFloat(rgb[4]) / 100 : Number(rgb[4]);
    return [Number(rgb[1]), Number(rgb[2]), Number(rgb[3]), alpha];
  }
  return null;
}

/** Composite a (possibly translucent) colour over an opaque one. */
function over([r, g, b, a]: Rgba, [br, bg, bb]: Rgba): Rgba {
  return [r * a + br * (1 - a), g * a + bg * (1 - a), b * a + bb * (1 - a), 1];
}

function luminance([r, g, b]: Rgba): number {
  const channel = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

/**
 * WCAG 2.x contrast ratio, or null if a colour can't be parsed. Translucent
 * colours (Spatial's glass panels) are composited over `backdrop` first,
 * normally the canvas.
 */
export function contrastRatio(fg: string, bg: string, backdrop = "#ffffff"): number | null {
  const cf = parseColor(fg);
  const cb = parseColor(bg);
  const cd = parseColor(backdrop);
  if (!cf || !cb || !cd) return null;
  const base = over(cb, cd);
  const [hi, lo] = [luminance(over(cf, base)), luminance(base)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

export function wcagLevel(ratio: number | null, kind: "text" | "ui" = "text"): string {
  if (ratio === null) return "n/a";
  if (kind === "ui") return ratio >= 3 ? "Pass 3:1" : "Fail";
  if (ratio >= 7) return "AAA";
  if (ratio >= 4.5) return "AA";
  if (ratio >= 3) return "AA large";
  return "Fail";
}

/** Upper-case 6-digit hex (the CSS build may shorten #ffffff to #fff). */
export const formatHex = (value: string | undefined) => {
  if (!value) return "...";
  const short = value.trim().match(/^#([0-9a-f]{3})$/i);
  const full = short ? `#${short[1].replace(/./g, (c) => c + c)}` : value.trim();
  return full.toUpperCase();
};
