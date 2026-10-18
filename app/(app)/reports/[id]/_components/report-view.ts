import type { Evaluation } from "@/types";
import type { InterviewReportView } from "@/services/report.service";

/**
 * View logic for /reports/[id]. Pure (type-only imports) so it runs under
 * Vitest without path aliases. It only reshapes what getInterviewReportView
 * returns; nothing is estimated or filled in.
 *
 * Not shown because it never reaches this page: per-question feedback (always
 * empty, FDI-028), historical progress (not stored, FDI-030) and an interview
 * duration (startedAt is the first saved answer, FDI-026).
 */

/* ── Scores ─────────────────────────────────────────────────────────────── */

type ScoreKey = "technicalScore" | "communicationScore" | "confidenceScore" | "behavioralScore" | "problemSolvingScore";

/** The five category scores the evaluator returns, in the order the old page used. */
const CATEGORIES: { key: ScoreKey; label: string }[] = [
  { key: "technicalScore", label: "Technical" },
  { key: "communicationScore", label: "Communication" },
  { key: "confidenceScore", label: "Confidence" },
  { key: "behavioralScore", label: "Behavioral" },
  { key: "problemSolvingScore", label: "Problem solving" },
];

const finite = (value: unknown): value is number => typeof value === "number" && Number.isFinite(value);

export function overallScore(evaluation: Evaluation | undefined): number | null {
  return finite(evaluation?.overallScore) ? evaluation.overallScore : null;
}

/** Category scores that are actually present, as stored. */
export function categoryScores(evaluation: Evaluation | undefined) {
  if (!evaluation) return [];
  return CATEGORIES.flatMap(({ key, label }) => (finite(evaluation[key]) ? [{ key, label, score: evaluation[key] }] : []));
}

/* ── Written feedback ───────────────────────────────────────────────────── */

export type FeedbackKey = "strengths" | "weaknesses" | "recommendations" | "missingTopics";

export interface FeedbackSection {
  key: FeedbackKey;
  title: string;
  items: string[];
}

/** Section order and titles. "Focus areas" matches the dashboard's name for weaknesses. */
const SECTIONS: { key: FeedbackKey; title: string }[] = [
  { key: "strengths", title: "Strengths" },
  { key: "weaknesses", title: "Focus areas" },
  { key: "recommendations", title: "Recommendations" },
  { key: "missingTopics", title: "Topics to review" },
];

/** Sections with at least one non-blank item; blank entries are dropped, nothing else changes. */
export function feedbackSections(evaluation: Evaluation | undefined): FeedbackSection[] {
  if (!evaluation) return [];
  return SECTIONS.flatMap(({ key, title }) => {
    const raw = evaluation[key];
    const items = Array.isArray(raw) ? raw.filter((item): item is string => typeof item === "string" && item.trim() !== "") : [];
    return items.length > 0 ? [{ key, title, items }] : [];
  });
}

/* ── States without a report ────────────────────────────────────────────── */

export type PendingView = Exclude<InterviewReportView, { state: "ready" }>;

export interface StateContent {
  heading: string;
  body: string;
  /** The one action that helps in this state, besides going back. */
  action: "check-again" | "resume" | "start" | null;
}

export function stateContent(view: PendingView): StateContent {
  switch (view.state) {
    case "processing":
      return {
        heading: "Your report is being prepared",
        body: "Reports are generated in the background after an interview ends. This page doesn't update on its own, so check again shortly.",
        action: "check-again",
      };
    case "failed":
      return {
        heading: "This report couldn't be generated",
        body: "Report generation failed after several attempts, so there's no report for this interview.",
        action: "start",
      };
    case "in_progress":
      return {
        heading: "This interview hasn't finished",
        body: "A report is generated after an interview ends. You can resume this one where you left off.",
        action: "resume",
      };
    default:
      return {
        heading: "No report for this interview",
        body:
          view.interview.status === "CANCELLED"
            ? "This interview was cancelled, so no report was generated."
            : "No report was generated for this interview.",
        action: "start",
      };
  }
}

/** "Role · Company" for an interview without a report; "Other" is a placeholder, not a company. */
export function interviewTitle(interview: { role: string; company: string | null }) {
  const company = interview.company && interview.company !== "Other" ? interview.company : null;
  return [interview.role || "Interview", company].filter(Boolean).join(" · ");
}
