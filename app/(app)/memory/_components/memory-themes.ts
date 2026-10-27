import type { Report } from "@/types";

/**
 * View logic for /memory. Pure (type-only imports) so it runs under Vitest
 * without path aliases.
 *
 * The saved memory itself (Cognee) can't be read from the browser: the
 * insights and timeline endpoints are 501 stubs and /api/memory/graph is
 * rebuilt from Postgres reports (FDI-019, FDI-032). What the page can show
 * truthfully is what memory is built from: services/memory-builder.service.ts
 * saves each report's strengths, weaknesses, missing topics and
 * recommendations. These helpers group those lists across finished reports.
 */

export type ThemeKey = "weaknesses" | "missingTopics" | "recommendations" | "strengths";

/** Order follows what question generation emphasises: recurring weak spots and missed topics first. */
export const THEME_GROUPS: { key: ThemeKey; title: string }[] = [
  { key: "weaknesses", title: "Focus areas" },
  { key: "missingTopics", title: "Topics to review" },
  { key: "recommendations", title: "Recommendations" },
  { key: "strengths", title: "Strengths" },
];

export interface ThemeItem {
  /** Wording from the most recent report that mentions it. */
  text: string;
  /** Number of reports that mention it (once per report). */
  reports: number;
  /** Date of the most recent report that mentions it. */
  lastSeen: string;
}

/** When the interview ended, or when the report was created. */
export function reportDate(report: Report) {
  return report.interviewContext?.endedAt ?? report.createdAt;
}

const time = (iso: string) => {
  const value = Date.parse(iso);
  return Number.isNaN(value) ? 0 : value;
};

const clean = (value: string) => value.trim().replace(/\s+/g, " ");

/**
 * Every distinct item in one list across reports. Items match when their text
 * is the same apart from case and spacing; no other merging is attempted, so
 * nothing is reworded or inferred. Items in more than one report come first,
 * then the most recent.
 */
export function collectThemes(reports: Report[], key: ThemeKey): ThemeItem[] {
  const newestFirst = [...reports].sort((a, b) => time(reportDate(b)) - time(reportDate(a)));
  const items = new Map<string, ThemeItem>();

  for (const report of newestFirst) {
    const list = report.evaluation?.[key];
    if (!Array.isArray(list)) continue;
    const inThisReport = new Set<string>();
    for (const entry of list) {
      if (typeof entry !== "string") continue;
      const text = clean(entry);
      if (!text) continue;
      const id = text.toLowerCase();
      if (inThisReport.has(id)) continue;
      inThisReport.add(id);
      const existing = items.get(id);
      if (existing) existing.reports += 1;
      else items.set(id, { text, reports: 1, lastSeen: reportDate(report) });
    }
  }

  return [...items.values()].sort((a, b) => b.reports - a.reports || time(b.lastSeen) - time(a.lastSeen));
}

/** The groups that have at least one item, in display order. */
export function themeGroups(reports: Report[]) {
  return THEME_GROUPS.flatMap(({ key, title }) => {
    const items = collectThemes(reports, key);
    return items.length > 0 ? [{ key, title, items }] : [];
  });
}

/** How many finished reports there are and the dates they span. */
export function reportSpan(reports: Report[]) {
  const dates = reports.map(reportDate).filter((iso) => !Number.isNaN(Date.parse(iso)));
  if (dates.length === 0) return null;
  const sorted = [...dates].sort((a, b) => time(a) - time(b));
  return { count: reports.length, first: sorted[0], last: sorted[sorted.length - 1] };
}
