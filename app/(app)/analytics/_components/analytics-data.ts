import type { Report } from "@/types";
import type { RowLabels } from "@/app/(app)/reports/_components/reports-list";

/**
 * View logic for /analytics. Pure (type-only imports) so it runs under Vitest
 * without path aliases. Everything comes from finished reports
 * (GET /api/interview/history): one report per interview, with an overall and
 * five category scores (0-100 from the AI evaluator, not validated: FDI-027).
 *
 * Deliberately absent, because nothing persists it: interview duration
 * (FDI-026), started or cancelled interviews (FDI-015), readiness and streaks
 * (the InterviewAnalytics row is never updated: FDI-018).
 */

export type CategoryKey = "technicalScore" | "communicationScore" | "confidenceScore" | "behavioralScore" | "problemSolvingScore";

export const CATEGORIES: { key: CategoryKey; label: string }[] = [
  { key: "technicalScore", label: "Technical" },
  { key: "communicationScore", label: "Communication" },
  { key: "confidenceScore", label: "Confidence" },
  { key: "behavioralScore", label: "Behavioral" },
  { key: "problemSolvingScore", label: "Problem solving" },
];

export interface AnalyticsRow {
  interviewId: string;
  /** When the interview ended, or when the report was created. */
  date: string;
  /** Display label; null when the interview didn't record a type. */
  type: string | null;
  level: string | null;
  title: string;
  overall: number | null;
  categories: Record<CategoryKey, number | null>;
}

const finite = (value: unknown): value is number => typeof value === "number" && Number.isFinite(value);

const time = (iso: string) => {
  const value = Date.parse(iso);
  return Number.isNaN(value) ? 0 : value;
};

/**
 * Tidy a stored interview type before labelling it. Setup stores labels such
 * as "System Design", the profile stores keys such as "system_design"
 * (FDI-017), and the start API accepts any string, so stray spaces, hyphens or
 * underscores must not split one type into several groups. Blank means not
 * recorded.
 */
export function normalizeType(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const tidy = value.trim().replace(/[\s_-]+/g, " ");
  return tidy || null;
}

export function toAnalyticsRows(reports: Report[], labels: RowLabels): AnalyticsRow[] {
  return reports.map((report) => {
    const context = report.interviewContext;
    const evaluation = report.evaluation;
    const categories = Object.fromEntries(
      CATEGORIES.map(({ key }) => [key, finite(evaluation?.[key]) ? evaluation[key] : null]),
    ) as Record<CategoryKey, number | null>;
    return {
      interviewId: report.interviewId,
      date: context?.endedAt ?? report.createdAt,
      type: labels.type(normalizeType(context?.interviewType)),
      level: labels.level(context?.difficulty),
      title: [context?.role || "Interview", labels.company(context?.company, context?.customCompanyName)].filter(Boolean).join(" · "),
      overall: finite(evaluation?.overallScore) ? evaluation.overallScore : null,
      categories,
    };
  });
}

/* ── Grouping by interview type ─────────────────────────────────────────── */

export interface TypeGroup {
  /** Null groups interviews that didn't record a type. */
  type: string | null;
  /** Oldest first. */
  rows: AnalyticsRow[];
  /** Distinct levels present, so mixed levels can be pointed out. */
  levels: string[];
  first: string;
  last: string;
}

const TYPE_ORDER = ["Technical", "Behavioral", "System design"];

/** One group per interview type; scores are never mixed across types. */
export function groupByType(rows: AnalyticsRow[]): TypeGroup[] {
  // Keyed case-insensitively so an unrecognised type stored as "Coding" and
  // "coding" stays one group; it is shown with the first spelling seen.
  const groups = new Map<string | null, { type: string | null; list: AnalyticsRow[] }>();
  for (const row of rows) {
    const key = row.type?.toLowerCase() ?? null;
    const group = groups.get(key) ?? { type: row.type, list: [] };
    group.list.push(row);
    groups.set(key, group);
  }

  const rank = (type: string | null) => (type === null ? TYPE_ORDER.length + 1 : TYPE_ORDER.includes(type) ? TYPE_ORDER.indexOf(type) : TYPE_ORDER.length);
  return [...groups.values()]
    .map(({ type, list }) => {
      const sorted = [...list].sort((a, b) => time(a.date) - time(b.date));
      return {
        type,
        rows: sorted,
        levels: [...new Set(sorted.map((row) => row.level).filter((level): level is string => Boolean(level)))],
        first: sorted[0].date,
        last: sorted[sorted.length - 1].date,
      };
    })
    // Recorded types first (most interviews first); "Type not recorded" always last.
    .sort((a, b) => Number(a.type === null) - Number(b.type === null) || b.rows.length - a.rows.length || rank(a.type) - rank(b.type));
}

/* ── Statistics within one type ─────────────────────────────────────────── */

export interface ScoreStats {
  /** Interviews with an overall score (the sample size). */
  count: number;
  /** Interviews in the group without one. */
  unscored: number;
  latest: number;
  /** Only from two scored interviews; null below that. */
  average: number | null;
  best: number | null;
  /** Latest minus first, in points. */
  change: number | null;
}

export function scoreStats(rows: AnalyticsRow[]): ScoreStats | null {
  const scored = rows.filter((row) => row.overall !== null).sort((a, b) => time(a.date) - time(b.date));
  if (scored.length === 0) return null;
  const scores = scored.map((row) => row.overall as number);
  const enough = scores.length >= 2;
  return {
    count: scores.length,
    unscored: rows.length - scores.length,
    latest: scores[scores.length - 1],
    average: enough ? scores.reduce((sum, score) => sum + score, 0) / scores.length : null,
    best: enough ? Math.max(...scores) : null,
    change: enough ? scores[scores.length - 1] - scores[0] : null,
  };
}

/** Average of each category over the interviews that have it, with its own sample size. */
export function categoryAverages(rows: AnalyticsRow[]) {
  return CATEGORIES.flatMap(({ key, label }) => {
    const values = rows.map((row) => row.categories[key]).filter((value): value is number => value !== null);
    return values.length > 0 ? [{ key, label, average: values.reduce((sum, value) => sum + value, 0) / values.length, count: values.length }] : [];
  });
}

/* ── Weekly activity (calendar weeks in the viewer's time zone) ────────── */

/** Monday 00:00 local time of the week containing `date`. */
export function weekStart(date: Date) {
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const sinceMonday = (start.getDay() + 6) % 7;
  start.setDate(start.getDate() - sinceMonday);
  return start;
}

/** Finished interviews per calendar week (Monday to Sunday), oldest week first, ending with the current week. */
export function weeklyCounts(dates: string[], today: Date, weeks = 8) {
  const current = weekStart(today);
  const buckets = Array.from({ length: weeks }, (_, index) => {
    const start = new Date(current);
    start.setDate(current.getDate() - 7 * (weeks - 1 - index));
    return { start, count: 0 };
  });
  for (const iso of dates) {
    const value = Date.parse(iso);
    if (Number.isNaN(value)) continue;
    const key = weekStart(new Date(value)).getTime();
    const bucket = buckets.find((week) => week.start.getTime() === key);
    if (bucket) bucket.count += 1;
  }
  return buckets;
}
