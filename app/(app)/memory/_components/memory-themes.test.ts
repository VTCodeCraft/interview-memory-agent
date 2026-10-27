import { describe, expect, it } from "vitest";

import type { Report } from "@/types";
import { collectThemes, reportDate, reportSpan, themeGroups } from "./memory-themes";

function report(id: string, endedAt: string | null, lists: Partial<Pick<Report["evaluation"], "strengths" | "weaknesses" | "missingTopics" | "recommendations">> = {}): Report {
  return {
    id: `r-${id}`,
    interviewId: id,
    userId: "u",
    createdAt: "2026-10-01T12:00:00.000Z",
    interviewContext: {
      role: "Frontend Engineer",
      company: null,
      companyType: null,
      customCompanyName: null,
      interviewType: "Technical",
      difficulty: "MEDIUM",
      startedAt: null,
      endedAt,
    },
    evaluation: {
      id: `r-${id}`,
      interviewId: id,
      overallScore: 70,
      technicalScore: 70,
      communicationScore: 70,
      confidenceScore: 70,
      behavioralScore: 70,
      problemSolvingScore: 70,
      strengths: [],
      weaknesses: [],
      missingTopics: [],
      recommendations: [],
      questionFeedback: [],
      createdAt: "2026-10-01T12:00:00.000Z",
      ...lists,
    },
  };
}

describe("collectThemes", () => {
  const reports = [
    report("a", "2026-10-02T10:00:00.000Z", { missingTopics: ["Caching", "Accessibility testing"] }),
    report("b", "2026-10-08T10:00:00.000Z", { missingTopics: ["caching ", "Bundle splitting"] }),
    report("c", "2026-10-05T10:00:00.000Z", { missingTopics: ["Accessibility  testing", "Caching", "Caching"] }),
  ];

  it("counts each item once per report, ignoring case and spacing", () => {
    expect(collectThemes(reports, "missingTopics")).toEqual([
      { text: "caching", reports: 3, lastSeen: "2026-10-08T10:00:00.000Z" },
      { text: "Accessibility testing", reports: 2, lastSeen: "2026-10-05T10:00:00.000Z" },
      { text: "Bundle splitting", reports: 1, lastSeen: "2026-10-08T10:00:00.000Z" },
    ]);
  });

  it("keeps the most recent wording and never merges different text", () => {
    const items = collectThemes(
      [report("a", "2026-10-01T00:00:00.000Z", { weaknesses: ["Rushed the ending"] }), report("b", "2026-10-03T00:00:00.000Z", { weaknesses: ["Rushed the ending."] })],
      "weaknesses",
    );
    expect(items.map((i) => i.text)).toEqual(["Rushed the ending.", "Rushed the ending"]);
  });

  it("skips blank or malformed entries", () => {
    const odd = report("a", null, { strengths: ["  ", "", 7 as unknown as string, "Clear structure"] });
    expect(collectThemes([odd], "strengths")).toEqual([{ text: "Clear structure", reports: 1, lastSeen: "2026-10-01T12:00:00.000Z" }]);
    expect(collectThemes([report("b", null, { strengths: undefined as unknown as string[] })], "strengths")).toEqual([]);
  });
});

describe("themeGroups", () => {
  it("returns only groups with items, weak spots first", () => {
    const groups = themeGroups([report("a", null, { strengths: ["Clear structure"], missingTopics: ["Caching"] })]);
    expect(groups.map((g) => g.title)).toEqual(["Topics to review", "Strengths"]);
  });

  it("is empty when no report has any items", () => {
    expect(themeGroups([report("a", null)])).toEqual([]);
  });
});

describe("dates", () => {
  it("uses the interview end date, falling back to the report date", () => {
    expect(reportDate(report("a", "2026-10-02T10:00:00.000Z"))).toBe("2026-10-02T10:00:00.000Z");
    expect(reportDate(report("b", null))).toBe("2026-10-01T12:00:00.000Z");
  });

  it("spans the first and last report", () => {
    expect(reportSpan([report("a", "2026-10-08T00:00:00.000Z"), report("b", "2026-10-02T00:00:00.000Z")])).toEqual({
      count: 2,
      first: "2026-10-02T00:00:00.000Z",
      last: "2026-10-08T00:00:00.000Z",
    });
    expect(reportSpan([])).toBeNull();
  });
});
