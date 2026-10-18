import type { Report } from "@/types";
import type { PendingReport } from "@/app/(app)/interviews/_components/dashboard-data";

/**
 * View logic for /reports. Pure (type-only imports) so it runs under Vitest
 * without path aliases. Everything is derived from the two existing endpoints:
 * finished reports (GET /api/interview/history) and the one report still being
 * generated, if any (GET /api/interview/pending-report).
 */

export type RowStatus = "ready" | "processing";

export interface ReportRow {
  key: string;
  interviewId: string;
  title: string;
  /** Display labels; null when the data doesn't say (always null while processing). */
  type: string | null;
  level: string | null;
  status: RowStatus;
  /** When the interview ended (or, while processing, when it was created). */
  date: string;
  /** Overall score as stored (0-100 from the evaluator); null while processing. */
  score: number | null;
}

/** Label helpers, passed in so this module stays free of runtime imports. */
export interface RowLabels {
  type: (value: string | null | undefined) => string | null;
  level: (value: string | null | undefined) => string | null;
  company: (company: string | null | undefined, custom: string | null | undefined) => string | null;
}

/** Finished reports plus the report still being generated, unless it already finished. */
export function toRows(reports: Report[], pending: PendingReport | null, labels: RowLabels): ReportRow[] {
  const rows: ReportRow[] = reports.map((report) => {
    const context = report.interviewContext;
    return {
      key: report.id,
      interviewId: report.interviewId,
      title: [context?.role || "Interview", labels.company(context?.company, context?.customCompanyName)].filter(Boolean).join(" · "),
      type: labels.type(context?.interviewType),
      level: labels.level(context?.difficulty),
      status: "ready",
      date: context?.endedAt ?? report.createdAt,
      score: Number.isFinite(report.evaluation?.overallScore) ? report.evaluation.overallScore : null,
    };
  });
  if (pending && !reports.some((report) => report.interviewId === pending.interviewId)) {
    rows.push({
      key: `pending-${pending.interviewId}`,
      interviewId: pending.interviewId,
      title: [pending.role || "Interview", pending.company].filter(Boolean).join(" · "),
      type: null,
      level: null,
      status: "processing",
      date: pending.createdAt,
      score: null,
    });
  }
  return rows;
}

/* ── Scores ─────────────────────────────────────────────────────────────── */

/** Whole number for display; the evaluator is asked for 0-100 but nothing validates it. */
export function displayScore(score: number) {
  return Math.round(score);
}

/** Meter fill in percent, kept inside the track whatever was stored. */
export function meterWidth(score: number) {
  return Math.min(100, Math.max(0, score));
}

export interface ReportSummary {
  count: number;
  average: number;
  highest: number;
}

/**
 * Totals over finished reports. The count matches the list; the average and
 * highest use the reports that have a score. Null until two are scored, when
 * a summary adds anything.
 */
export function summarize(rows: ReportRow[]): ReportSummary | null {
  const finished = rows.filter((row) => row.status === "ready");
  const scores = finished.flatMap((row) => (row.score !== null ? [row.score] : []));
  if (scores.length < 2) return null;
  return {
    count: finished.length,
    average: displayScore(scores.reduce((sum, score) => sum + score, 0) / scores.length),
    highest: displayScore(Math.max(...scores)),
  };
}

/* ── View state (kept in the URL so it survives opening a report) ───────── */

/** Rows rendered at first and added by each "Show more". */
export const PAGE_SIZE = 20;

export const SORTS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "score-high", label: "Highest score" },
  { value: "score-low", label: "Lowest score" },
] as const;

export type SortKey = (typeof SORTS)[number]["value"];

export interface ReportsView {
  q: string;
  type: string;
  level: string;
  sort: SortKey;
}

export const DEFAULT_VIEW: ReportsView = { q: "", type: "all", level: "all", sort: "newest" };

const SORT_KEYS = SORTS.map((sort) => sort.value) as string[];

/** Read the view from the query string. Unknown values fall back to the default. */
export function parseView(params: { get(name: string): string | null }): ReportsView {
  const sort = params.get("sort");
  return {
    q: (params.get("q") ?? "").slice(0, 100),
    type: params.get("type") || "all",
    level: params.get("level") || "all",
    sort: sort && SORT_KEYS.includes(sort) ? (sort as SortKey) : "newest",
  };
}

/** Query string for a view, leaving defaults out so the plain URL stays /reports. */
export function viewQuery(view: ReportsView) {
  const params = new URLSearchParams();
  if (view.q.trim()) params.set("q", view.q);
  if (view.type !== "all") params.set("type", view.type);
  if (view.level !== "all") params.set("level", view.level);
  if (view.sort !== "newest") params.set("sort", view.sort);
  const query = params.toString();
  return query ? `?${query}` : "";
}

/* ── Filtering and sorting ──────────────────────────────────────────────── */

const TYPE_ORDER = ["Technical", "Behavioral", "System design"];
const LEVEL_ORDER = ["Junior", "Mid-Level", "Senior+"];

/** Distinct values with counts, in a stable order. */
export function optionCounts(rows: ReportRow[], field: "type" | "level") {
  const order = field === "type" ? TYPE_ORDER : LEVEL_ORDER;
  const counts = new Map<string, number>();
  for (const row of rows) {
    const value = row[field];
    if (value) counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  const rank = (value: string) => (order.includes(value) ? order.indexOf(value) : order.length);
  return [...counts.entries()].sort(([a], [b]) => rank(a) - rank(b) || a.localeCompare(b));
}

/** Show the search box once there's enough to search. */
export const SEARCH_MIN_ROWS = 6;

/** Which toolbar controls the data supports; the toolbar renders exactly these. */
export function availableControls(rows: ReportRow[]) {
  const toolbar = rows.length > 1;
  return {
    toolbar,
    search: toolbar && rows.length >= SEARCH_MIN_ROWS,
    type: toolbar && optionCounts(rows, "type").length > 1,
    level: toolbar && optionCounts(rows, "level").length > 1,
  };
}

/**
 * The view actually applied. A value from the URL only counts when its
 * control is on screen and the value exists in the data; otherwise an old
 * link (or a report since removed) could hide rows with no visible way to
 * see why or undo it.
 */
export function effectiveView(view: ReportsView, rows: ReportRow[]): ReportsView {
  const controls = availableControls(rows);
  const has = (field: "type" | "level", value: string) => rows.some((row) => row[field] === value);
  return {
    q: controls.search ? view.q : "",
    type: controls.type && has("type", view.type) ? view.type : "all",
    level: controls.level && has("level", view.level) ? view.level : "all",
    sort: controls.toolbar ? view.sort : "newest",
  };
}

export function isFiltering(view: ReportsView) {
  return view.q.trim() !== "" || view.type !== "all" || view.level !== "all";
}

export function filterRows(rows: ReportRow[], view: ReportsView) {
  const words = view.q.toLowerCase().split(/\s+/).filter(Boolean);
  return rows.filter((row) => {
    if (view.type !== "all" && row.type !== view.type) return false;
    if (view.level !== "all" && row.level !== view.level) return false;
    const text = row.title.toLowerCase();
    return words.every((word) => text.includes(word));
  });
}

const time = (iso: string) => {
  const value = Date.parse(iso);
  return Number.isNaN(value) ? 0 : value;
};

/** Sorted copy. Rows without a score (still processing) go last in score sorts. */
export function sortRows(rows: ReportRow[], sort: SortKey) {
  const byNewest = (a: ReportRow, b: ReportRow) => time(b.date) - time(a.date);
  return [...rows].sort((a, b) => {
    switch (sort) {
      case "oldest":
        return -byNewest(a, b);
      case "score-high":
      case "score-low": {
        if (a.score === null || b.score === null) {
          return (a.score === null ? 1 : 0) - (b.score === null ? 1 : 0) || byNewest(a, b);
        }
        const difference = sort === "score-high" ? b.score - a.score : a.score - b.score;
        return difference || byNewest(a, b);
      }
      default:
        return byNewest(a, b);
    }
  });
}
