/**
 * Phase 6 – Longitudinal Evaluation & Memory Evolution
 *
 * Builds the historical-context prefix that is prepended to the Gemini
 * evaluation prompt when previous interview memories are available.
 *
 * Rules:
 * - When no historical memory exists, returns null (Gemini evaluates baseline).
 * - When memory exists, builds a concise structured block Gemini can reference.
 * - Never overwrites existing report fields — only enriches.
 */

import type { HistoricalEvaluationContext } from "@/services/cognee.service";

/**
 * Formats a score as "N/100" or "—" when null.
 */
function fmt(score: number | null): string {
  return score !== null ? `${score}/100` : "—";
}

/**
 * Renders a list as a bullet string, or a fallback when empty.
 */
function bulletList(items: string[], fallback = "None recorded"): string {
  if (items.length === 0) return `  - ${fallback}`;
  return items.map((item) => `  - ${item}`).join("\n");
}

/**
 * Builds the formatted historical-context block to inject before the
 * evaluation Q&A section.  Returns null when no usable history exists.
 */
export function buildHistoricalContextBlock(
  history: HistoricalEvaluationContext,
): string | null {
  if (history.count === 0 || !history.formatted) return null;

  const { previousScores, trends } = history;

  const lines: string[] = [
    "--------------------------------",
    "Historical Candidate Memory",
    "",
    "Use the following context ONLY to compare the candidate's current",
    "performance against their historical trends.  Do NOT hallucinate",
    "previous interviews.  Do NOT rewrite history.  If an area is not",
    "mentioned below, treat it as unknown.",
    "",
    "Previous Scores (most recent):",
    `  Overall:         ${fmt(previousScores.overall)}`,
    `  Technical:       ${fmt(previousScores.technical)}`,
    `  Communication:   ${fmt(previousScores.communication)}`,
    `  Confidence:      ${fmt(previousScores.confidence)}`,
    `  Behavioral:      ${fmt(previousScores.behavioral)}`,
    `  Problem-Solving: ${fmt(previousScores.problemSolving)}`,
    "",
    "Recurring Strengths:",
    bulletList(trends.recurringStrengths),
    "",
    "Recurring Weaknesses:",
    bulletList(trends.recurringWeaknesses),
    "",
    "Communication Trend:",
    `  ${trends.communicationTrend ?? "Unknown"}`,
    "",
    "Confidence Trend:",
    `  ${trends.confidenceTrend ?? "Unknown"}`,
    "",
    "Previously Improved Areas:",
    bulletList(trends.improvementAreas),
    "",
    "Topics Still Needing Work:",
    bulletList(trends.stillNeedsWork),
    "",
    "Previous Recommendations (to track whether followed):",
    bulletList(trends.previousRecommendations),
    "",
    "Full Historical Records (for deeper context):",
    history.formatted,
    "--------------------------------",
  ];

  return lines.join("\n");
}

/**
 * Gemini instructions block appended when historical context is present.
 * Instructs Gemini how to use memory without hallucinating or overwriting.
 */
const HISTORICAL_COMPARISON_INSTRUCTIONS = `
Historical Comparison Instructions:
- Compare the current interview performance against the historical records above.
- Identify improvements: topics/skills that were weak before but are now stronger.
- Identify regressions: topics/skills that were strong before but declined.
- Identify stable strengths: consistently strong areas across interviews.
- Track communication and confidence trends against previous patterns.
- Note whether previous recommendations have been acted on.
- Populate the "historicalProgress" field in your JSON output (see schema).
- Keep existing score fields (overallScore, technicalScore, etc.) based ONLY on this interview's performance. Do NOT average across sessions.
- If a dimension has no evidence in the historical records, omit it from historicalProgress comparisons.
- Do NOT fabricate previous interviews.  Use "Unknown" when history is absent.
`.trim();

/**
 * Params for building an enhanced evaluation prompt with optional history.
 */
export type EnhancedEvaluationPromptParams = {
  role: string;
  qa: {
    question: {
      sequence: number;
      category: string;
      displayQuestion: string;
      ttsTranscript?: string;
      expectedDiscussion?: string | null;
      difficulty?: string;
    };
    answer?: {
      sequence: number;
      transcript: string;
      duration: number;
      confidence?: number | null;
    };
  }[];
  /** Resolved company name, injected so Gemini never uses a placeholder. */
  company?: string | null;
  /** Pre-built historical context block from buildHistoricalContextBlock(). */
  historicalContextBlock?: string | null;
};

/**
 * Builds the full evaluation prompt, injecting historical context at the top
 * when available.  The Q&A body follows so Gemini evaluates current
 * performance first and uses history only for comparison.
 */
export function buildEnhancedEvaluationPrompt(
  params: EnhancedEvaluationPromptParams,
): string {
  const { role, qa, company, historicalContextBlock } = params;

  const qaBody = qa
    .map(
      (pair) =>
        `Q${pair.question.sequence} [${pair.question.category}] (${pair.question.difficulty ?? "medium"}): ${pair.question.displayQuestion}\n` +
        `Candidate Answer: ${pair.answer?.transcript ?? "(no answer given)"}`,
    )
    .join("\n\n");

  const parts: string[] = [];

  if (historicalContextBlock) {
    parts.push(historicalContextBlock);
    parts.push("");
    parts.push(HISTORICAL_COMPARISON_INSTRUCTIONS);
    parts.push("");
  }

  parts.push(`Evaluate this interview for the role "${role}".`);
  if (company) {
    parts.push(
      `The candidate interviewed for ${company}. Reference this company by its real name. Never use placeholder tokens such as "[Company Name]", "COMPANY_NAME", or "Company Name".`,
    );
  }
  parts.push("");
  parts.push("Questions and Answers:");
  parts.push("");
  parts.push(qaBody);

  return parts.join("\n");
}
