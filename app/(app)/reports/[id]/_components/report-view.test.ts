import { describe, expect, it } from "vitest";

import type { Evaluation } from "@/types";
import { categoryScores, feedbackSections, interviewTitle, overallScore, stateContent, type PendingView } from "./report-view";

function evaluation(overrides: Partial<Evaluation> = {}): Evaluation {
  return {
    id: "r1",
    interviewId: "i1",
    overallScore: 74,
    technicalScore: 80,
    communicationScore: 70,
    confidenceScore: 65,
    behavioralScore: 60,
    problemSolvingScore: 77.5,
    strengths: [],
    weaknesses: [],
    missingTopics: [],
    recommendations: [],
    questionFeedback: [],
    createdAt: "2026-10-01T12:00:00.000Z",
    ...overrides,
  };
}

const interview = { interviewId: "i1", role: "Frontend Engineer", company: "Google", status: "COMPLETED" as const, createdAt: "2026-10-01T10:00:00.000Z" };

describe("scores", () => {
  it("returns the overall score only when it is a number", () => {
    expect(overallScore(evaluation())).toBe(74);
    expect(overallScore(evaluation({ overallScore: Number.NaN }))).toBeNull();
    expect(overallScore(evaluation({ overallScore: null as unknown as number }))).toBeNull();
    expect(overallScore(undefined)).toBeNull();
  });

  it("lists the category scores that are present, in a fixed order, as stored", () => {
    expect(categoryScores(evaluation()).map(({ label, score }) => `${label}:${score}`)).toEqual([
      "Technical:80",
      "Communication:70",
      "Confidence:65",
      "Behavioral:60",
      "Problem solving:77.5",
    ]);
  });

  it("leaves out categories that are missing or not numbers", () => {
    const partial = evaluation({ behavioralScore: null as unknown as number, confidenceScore: Number.NaN });
    expect(categoryScores(partial).map((c) => c.label)).toEqual(["Technical", "Communication", "Problem solving"]);
    expect(categoryScores(undefined)).toEqual([]);
  });
});

describe("feedbackSections", () => {
  it("returns only sections with content, in reading order", () => {
    const sections = feedbackSections(
      evaluation({ strengths: ["Clear structure"], missingTopics: ["Caching"], recommendations: ["Practise trade-offs"] }),
    );
    expect(sections.map((s) => s.title)).toEqual(["Strengths", "Recommendations", "Topics to review"]);
  });

  it("drops blank entries but keeps the wording of the rest", () => {
    const [focus] = feedbackSections(evaluation({ weaknesses: ["  ", "Rushed the ending ", ""] }));
    expect(focus).toEqual({ key: "weaknesses", title: "Focus areas", items: ["Rushed the ending "] });
  });

  it("is empty when the report has no written feedback", () => {
    expect(feedbackSections(evaluation())).toEqual([]);
    expect(feedbackSections(evaluation({ strengths: undefined as unknown as string[] }))).toEqual([]);
  });
});

describe("states without a report", () => {
  const view = (state: PendingView["state"], status = "COMPLETED") =>
    ({ state, interview: { ...interview, status } }) as PendingView;

  it("offers the one action that helps in each state", () => {
    expect(stateContent(view("processing")).action).toBe("check-again");
    expect(stateContent(view("failed")).action).toBe("start");
    expect(stateContent(view("in_progress", "ONGOING")).action).toBe("resume");
    expect(stateContent(view("unavailable", "CANCELLED")).action).toBe("start");
  });

  it("explains a cancelled interview separately", () => {
    expect(stateContent(view("unavailable", "CANCELLED")).body).toMatch(/cancelled/);
    expect(stateContent(view("unavailable", "FAILED")).body).toBe("No report was generated for this interview.");
  });

  it("titles the interview without the 'Other' placeholder", () => {
    expect(interviewTitle({ role: "Frontend Engineer", company: "Google" })).toBe("Frontend Engineer · Google");
    expect(interviewTitle({ role: "Frontend Engineer", company: "Other" })).toBe("Frontend Engineer");
    expect(interviewTitle({ role: "", company: null })).toBe("Interview");
  });
});
