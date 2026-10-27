import { describe, expect, it } from "vitest";

import type { Report } from "@/types";
import {
  categoryAverages,
  groupByType,
  normalizeType,
  scoreStats,
  toAnalyticsRows,
  weekStart,
  weeklyCounts,
  type AnalyticsRow,
} from "./analytics-data";

const labels = {
  type: (value: string | null | undefined) => (value ? (value === "System Design" ? "System design" : value) : null),
  level: (value: string | null | undefined) => (value ? ({ EASY: "Junior", MEDIUM: "Mid-Level", HARD: "Senior+" } as Record<string, string>)[value] ?? value : null),
  company: (company: string | null | undefined, custom: string | null | undefined) => custom || (company && company !== "Other" ? company : null),
};

function report(id: string, overrides: { type?: string | null; difficulty?: string | null; endedAt?: string | null; overall?: number; technical?: number } = {}): Report {
  return {
    id: `r-${id}`,
    interviewId: id,
    userId: "u",
    createdAt: "2026-10-01T12:00:00.000Z",
    interviewContext: {
      role: "Frontend Engineer",
      company: "Other",
      companyType: null,
      customCompanyName: null,
      interviewType: overrides.type === undefined ? "Technical" : overrides.type,
      difficulty: overrides.difficulty === undefined ? "MEDIUM" : overrides.difficulty,
      startedAt: null,
      endedAt: overrides.endedAt === undefined ? "2026-10-02T10:00:00.000Z" : overrides.endedAt,
    },
    evaluation: {
      id: `r-${id}`,
      interviewId: id,
      overallScore: overrides.overall ?? 70,
      technicalScore: overrides.technical ?? 80,
      communicationScore: 60,
      confidenceScore: 50,
      behavioralScore: 40,
      problemSolvingScore: 30,
      strengths: [],
      weaknesses: [],
      missingTopics: [],
      recommendations: [],
      questionFeedback: [],
      createdAt: "2026-10-01T12:00:00.000Z",
    },
  };
}

const row = (date: string, overall: number | null, extra: Partial<AnalyticsRow> = {}): AnalyticsRow => ({
  interviewId: date,
  date,
  type: "Technical",
  level: "Mid-Level",
  title: "Frontend Engineer",
  overall,
  categories: { technicalScore: 80, communicationScore: 60, confidenceScore: null, behavioralScore: 40, problemSolvingScore: 30 },
  ...extra,
});

describe("toAnalyticsRows", () => {
  it("keeps only real values and labels", () => {
    const [first] = toAnalyticsRows([report("a", { type: "System Design", difficulty: "HARD", endedAt: null, overall: Number.NaN })], labels);
    expect(first).toMatchObject({ interviewId: "a", type: "System design", level: "Senior+", title: "Frontend Engineer", overall: null, date: "2026-10-01T12:00:00.000Z" });
    expect(first.categories.technicalScore).toBe(80);
  });
});

describe("interview type normalisation", () => {
  // Same rules as typeLabel in app/(app)/interviews/_components/dashboard-data.ts.
  const TYPES: Record<string, string> = { technical: "Technical", behavioral: "Behavioral", system_design: "System design" };
  const realLabels = {
    ...labels,
    type: (value: string | null | undefined) => (value ? TYPES[value.toLowerCase().replace(/\s+/g, "_")] ?? value : null),
  };

  it("tidies spacing, underscores and hyphens, and treats blanks as not recorded", () => {
    expect(normalizeType("System Design")).toBe("System Design");
    expect(normalizeType("system_design")).toBe("system design");
    expect(normalizeType(" system-design ")).toBe("system design");
    expect(normalizeType("  Technical ")).toBe("Technical");
    expect(normalizeType("   ")).toBeNull();
    expect(normalizeType(null)).toBeNull();
    expect(normalizeType(5)).toBeNull();
  });

  it("groups every stored spelling of a type together and drops no report", () => {
    const types = ["System Design", "system_design", " system-design ", "SYSTEM DESIGN", "Coding", "coding", "", null, "  "];
    const rows = toAnalyticsRows(types.map((type, i) => report(`t${i}`, { type })), realLabels);
    const groups = groupByType(rows);
    expect(groups.map((g) => [g.type, g.rows.length])).toEqual([
      ["System design", 4],
      ["Coding", 2],
      [null, 3],
    ]);
    expect(groups.reduce((sum, g) => sum + g.rows.length, 0)).toBe(types.length);
  });
});

describe("groupByType", () => {
  it("never mixes types, orders by size, and lists each group oldest first", () => {
    const groups = groupByType([
      row("2026-10-05", 70),
      row("2026-10-03", 60, { type: "Behavioral" }),
      row("2026-10-01", 50),
      row("2026-10-04", 65, { type: null }),
    ]);
    expect(groups.map((g) => [g.type, g.rows.length])).toEqual([
      ["Technical", 2],
      ["Behavioral", 1],
      [null, 1],
    ]);
    expect(groups[0].rows.map((r) => r.date)).toEqual(["2026-10-01", "2026-10-05"]);
    expect(groups[0]).toMatchObject({ first: "2026-10-01", last: "2026-10-05" });
  });

  it("records the levels in a group so mixed levels can be pointed out", () => {
    const [group] = groupByType([row("2026-10-01", 50), row("2026-10-02", 60, { level: "Senior+" }), row("2026-10-03", 70, { level: null })]);
    expect(group.levels).toEqual(["Mid-Level", "Senior+"]);
  });
});

describe("scoreStats", () => {
  it("needs two scored interviews before giving an average, best or change", () => {
    expect(scoreStats([row("2026-10-01", 64)])).toEqual({ count: 1, unscored: 0, latest: 64, average: null, best: null, change: null });
  });

  it("uses scored interviews only, in date order", () => {
    expect(scoreStats([row("2026-10-03", 80), row("2026-10-01", 60), row("2026-10-02", null), row("2026-10-04", 70)])).toEqual({
      count: 3,
      unscored: 1,
      latest: 70,
      average: 70,
      best: 80,
      change: 10,
    });
  });

  it("is null when nothing is scored", () => {
    expect(scoreStats([row("2026-10-01", null)])).toBeNull();
  });
});

describe("categoryAverages", () => {
  it("averages each category over the interviews that have it, with its own sample size", () => {
    const averages = categoryAverages([row("a", 1), row("b", 1, { categories: { technicalScore: 60, communicationScore: 70, confidenceScore: 90, behavioralScore: 40, problemSolvingScore: 30 } })]);
    expect(averages).toEqual([
      { key: "technicalScore", label: "Technical", average: 70, count: 2 },
      { key: "communicationScore", label: "Communication", average: 65, count: 2 },
      { key: "confidenceScore", label: "Confidence", average: 90, count: 1 },
      { key: "behavioralScore", label: "Behavioral", average: 40, count: 2 },
      { key: "problemSolvingScore", label: "Problem solving", average: 30, count: 2 },
    ]);
  });
});

describe("weekly activity", () => {
  it("starts weeks on Monday in local time", () => {
    const start = weekStart(new Date(2026, 9, 18, 15)); // Sunday 18 Oct 2026
    expect([start.getFullYear(), start.getMonth(), start.getDate(), start.getHours()]).toEqual([2026, 9, 12, 0]);
    expect(weekStart(new Date(2026, 9, 19, 0, 30)).getDate()).toBe(19); // Monday stays Monday
  });

  it("keeps every week starting on a Monday at local midnight, across daylight-saving changes", () => {
    const weeks = weeklyCounts([], new Date(2026, 10, 18, 12), 12); // spans late March and late October / early November changes
    for (const [index, week] of weeks.entries()) {
      expect([week.start.getDay(), week.start.getHours(), week.start.getMinutes()]).toEqual([1, 0, 0]);
      if (index > 0) {
        const previous = weeks[index - 1].start;
        const next = new Date(previous.getFullYear(), previous.getMonth(), previous.getDate() + 7);
        expect(week.start.getTime()).toBe(next.getTime());
      }
    }
  });

  it("counts finished interviews per calendar week, oldest first, ending this week", () => {
    const today = new Date(2026, 9, 21, 9); // Wednesday 21 Oct
    const iso = (d: number, h = 10) => new Date(2026, 9, d, h).toISOString();
    const weeks = weeklyCounts([iso(19), iso(21), iso(12), iso(1), iso(25, 23), "not a date"], today, 4);
    expect(weeks.map((w) => [w.start.getDate(), w.count])).toEqual([
      [28, 1], // week of 28 Sep (1 Oct)
      [5, 0],
      [12, 1],
      [19, 3], // 19, 21 and Sunday 25 Oct
    ]);
  });
});
