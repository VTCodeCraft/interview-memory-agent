import { describe, expect, it } from "vitest";

import type { Report } from "@/types";
import {
  DEFAULT_VIEW,
  displayScore,
  effectiveView,
  filterRows,
  isFiltering,
  meterWidth,
  optionCounts,
  parseView,
  sortRows,
  summarize,
  toRows,
  viewQuery,
  type ReportRow,
} from "./reports-list";

const labels = {
  type: (value: string | null | undefined) => (value ? value.replace("system_design", "System design") : null),
  level: (value: string | null | undefined) => (value ? ({ EASY: "Junior", HARD: "Senior+" } as Record<string, string>)[value] ?? value : null),
  company: (company: string | null | undefined, custom: string | null | undefined) =>
    custom || (company && company !== "Other" ? company : null),
};

function report(id: string, overrides: { score?: number; endedAt?: string | null; type?: string | null; difficulty?: string | null; role?: string; company?: string | null } = {}): Report {
  return {
    id: `r-${id}`,
    interviewId: id,
    userId: "u",
    createdAt: "2026-10-01T12:00:00.000Z",
    interviewContext: {
      role: overrides.role ?? "Frontend Engineer",
      company: overrides.company ?? null,
      companyType: null,
      customCompanyName: null,
      interviewType: overrides.type === undefined ? "Technical" : overrides.type,
      difficulty: overrides.difficulty === undefined ? "HARD" : overrides.difficulty,
      startedAt: null,
      endedAt: overrides.endedAt === undefined ? "2026-10-01T11:00:00.000Z" : overrides.endedAt,
    },
    evaluation: {
      id: `r-${id}`,
      interviewId: id,
      overallScore: overrides.score ?? 70,
      technicalScore: 0,
      communicationScore: 0,
      confidenceScore: 0,
      behavioralScore: 0,
      problemSolvingScore: 0,
      strengths: [],
      weaknesses: [],
      missingTopics: [],
      recommendations: [],
      questionFeedback: [],
      createdAt: "2026-10-01T12:00:00.000Z",
    },
  };
}

const row = (key: string, date: string, score: number | null, extra: Partial<ReportRow> = {}): ReportRow => ({
  key,
  interviewId: key,
  title: key,
  type: "Technical",
  level: "Senior+",
  status: score === null ? "processing" : "ready",
  date,
  score,
  ...extra,
});

describe("toRows", () => {
  it("builds rows from real report fields only", () => {
    const [first] = toRows([report("a", { company: "Google", score: 81.6 })], null, labels);
    expect(first).toEqual({
      key: "r-a",
      interviewId: "a",
      title: "Frontend Engineer · Google",
      type: "Technical",
      level: "Senior+",
      status: "ready",
      date: "2026-10-01T11:00:00.000Z",
      score: 81.6,
    });
  });

  it("falls back to the report date and leaves unknown fields empty", () => {
    const [first] = toRows([report("a", { endedAt: null, type: null, difficulty: null, company: "Other" })], null, labels);
    expect(first.date).toBe("2026-10-01T12:00:00.000Z");
    expect(first.type).toBeNull();
    expect(first.level).toBeNull();
    expect(first.title).toBe("Frontend Engineer");
  });

  it("adds the report still being generated, without a type, level or score", () => {
    const pending = { interviewId: "p", role: "Data Engineer", company: "Stripe", createdAt: "2026-10-03T09:00:00.000Z" };
    const rows = toRows([report("a")], pending, labels);
    expect(rows).toHaveLength(2);
    expect(rows[1]).toMatchObject({ interviewId: "p", status: "processing", type: null, level: null, score: null, title: "Data Engineer · Stripe" });
  });

  it("does not list a pending report twice once it has finished", () => {
    const pending = { interviewId: "a", role: "Frontend Engineer", company: null, createdAt: "2026-10-01T10:00:00.000Z" };
    expect(toRows([report("a")], pending, labels)).toHaveLength(1);
  });
});

describe("scores", () => {
  it("rounds for display and keeps the meter inside its track", () => {
    expect(displayScore(72.5)).toBe(73);
    expect(displayScore(64.2)).toBe(64);
    expect(meterWidth(120)).toBe(100);
    expect(meterWidth(-4)).toBe(0);
    expect(meterWidth(55)).toBe(55);
  });

  it("summarizes finished reports only, and only from two", () => {
    expect(summarize([row("a", "2026-10-01", 80)])).toBeNull();
    expect(summarize([row("a", "2026-10-01", 80), row("p", "2026-10-03", null)])).toBeNull();
    expect(summarize([row("a", "2026-10-01", 80), row("b", "2026-10-02", 65.4), row("p", "2026-10-03", null)])).toEqual({
      count: 2,
      average: 73,
      highest: 80,
    });
  });

  it("counts every finished report, but averages only those with a score", () => {
    const unscored = row("c", "2026-10-04", null, { status: "ready" });
    expect(summarize([row("a", "2026-10-01", 80), row("b", "2026-10-02", 60), unscored])).toEqual({ count: 3, average: 70, highest: 80 });
    expect(summarize([row("a", "2026-10-01", 80), unscored])).toBeNull();
  });
});

describe("view state", () => {
  const params = (query: string) => new URLSearchParams(query);

  it("parses known values and ignores unknown ones", () => {
    expect(parseView(params(""))).toEqual(DEFAULT_VIEW);
    expect(parseView(params("sort=score-high&type=Technical&level=Junior&q=google"))).toEqual({
      q: "google",
      type: "Technical",
      level: "Junior",
      sort: "score-high",
    });
    expect(parseView(params("sort=random")).sort).toBe("newest");
  });

  it("writes only non-default values", () => {
    expect(viewQuery(DEFAULT_VIEW)).toBe("");
    expect(viewQuery({ ...DEFAULT_VIEW, sort: "oldest", type: "System design" })).toBe("?type=System+design&sort=oldest");
    expect(viewQuery({ ...DEFAULT_VIEW, q: "   " })).toBe("");
  });

  it("drops filters that match nothing in the data", () => {
    const rows = [row("a", "2026-10-01", 80)];
    expect(effectiveView({ ...DEFAULT_VIEW, type: "Behavioral", level: "Senior+" }, rows)).toMatchObject({ type: "all", level: "Senior+" });
  });

  it("knows when a filter is applied", () => {
    expect(isFiltering(DEFAULT_VIEW)).toBe(false);
    expect(isFiltering({ ...DEFAULT_VIEW, sort: "oldest" })).toBe(false);
    expect(isFiltering({ ...DEFAULT_VIEW, q: "x" })).toBe(true);
  });
});

describe("filterRows and sortRows", () => {
  const rows = [
    row("Frontend · Google", "2026-10-01", 64),
    row("Backend · Stripe", "2026-10-05", 88, { type: "System design", level: "Junior" }),
    row("Frontend · Meta", "2026-10-03", 71),
    row("Platform", "2026-10-06", null, { type: null, level: null }),
  ];

  it("filters by type, level and every search word", () => {
    expect(filterRows(rows, { ...DEFAULT_VIEW, type: "Technical" }).map((r) => r.key)).toEqual(["Frontend · Google", "Frontend · Meta"]);
    expect(filterRows(rows, { ...DEFAULT_VIEW, level: "Junior" }).map((r) => r.key)).toEqual(["Backend · Stripe"]);
    expect(filterRows(rows, { ...DEFAULT_VIEW, q: "front META" }).map((r) => r.key)).toEqual(["Frontend · Meta"]);
  });

  it("sorts by date or score, keeping unscored rows last for score sorts", () => {
    expect(sortRows(rows, "newest").map((r) => r.key)).toEqual(["Platform", "Backend · Stripe", "Frontend · Meta", "Frontend · Google"]);
    expect(sortRows(rows, "oldest").map((r) => r.key)).toEqual(["Frontend · Google", "Frontend · Meta", "Backend · Stripe", "Platform"]);
    expect(sortRows(rows, "score-high").map((r) => r.key)).toEqual(["Backend · Stripe", "Frontend · Meta", "Frontend · Google", "Platform"]);
    expect(sortRows(rows, "score-low").map((r) => r.key)).toEqual(["Frontend · Google", "Frontend · Meta", "Backend · Stripe", "Platform"]);
  });

  it("does not change the input order", () => {
    const before = rows.map((r) => r.key);
    sortRows(rows, "score-high");
    expect(rows.map((r) => r.key)).toEqual(before);
  });

  it("counts filter options in a stable order", () => {
    expect(optionCounts(rows, "type")).toEqual([
      ["Technical", 2],
      ["System design", 1],
    ]);
    expect(optionCounts(rows, "level")).toEqual([
      ["Junior", 1],
      ["Senior+", 2],
    ]);
  });
});
