import type { Evaluation, Report } from "@/types";

type Nullable<T> = T | null | undefined;

type ScoreKey =
  | "overallScore"
  | "technicalScore"
  | "communicationScore"
  | "behavioralScore"
  | "problemSolvingScore"
  | "confidenceScore";

type ReportEvaluation = Partial<Pick<Evaluation, ScoreKey>> &
  Partial<Pick<Evaluation, "strengths" | "weaknesses" | "missingTopics" | "recommendations" | "createdAt">>;

type ReportInterviewMetadata = {
  userId?: Nullable<string>;
  company?: Nullable<string>;
  customCompanyName?: Nullable<string>;
  role?: Nullable<string>;
  interviewType?: Nullable<string>;
};

export type MemoryBuilderReport = Partial<Report> &
  Partial<Record<ScoreKey, Nullable<number>>> & {
    strengths?: Nullable<string[]>;
    weaknesses?: Nullable<string[]>;
    missingTopics?: Nullable<string[]>;
    recommendations?: Nullable<string[]>;
    createdAt?: Nullable<string | Date>;
    evaluation?: Nullable<ReportEvaluation>;
    interview?: Nullable<ReportInterviewMetadata>;
  };

export type InterviewScoreMemory = {
  overall: number | null;
  technical: number | null;
  communication: number | null;
  behavioral: number | null;
  problemSolving: number | null;
  confidence: number | null;
};

export type InterviewSemanticMemory = {
  userId: string | null;
  interviewId: string | null;
  company: string | null;
  role: string | null;
  interviewType: string | null;
  scores: InterviewScoreMemory;
  strengths: string[];
  weaknesses: string[];
  missingTopics: string[];
  recommendations: string[];
  summary: string | null;
  createdAt: string | null;
};

function asCleanString(value: Nullable<string>): string | null {
  const cleaned = value?.trim();
  return cleaned ? cleaned : null;
}

function asIsoString(value: Nullable<string | Date>): string | null {
  if (!value) return null;
  if (value instanceof Date) return value.toISOString();

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toISOString();
}

function asScore(value: Nullable<number>): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function uniqueCleanStrings(values: Nullable<string[]>): string[] {
  if (!Array.isArray(values)) return [];

  return Array.from(
    new Set(
      values
        .map((value) => value.trim())
        .filter((value) => value.length > 0),
    ),
  );
}

function getScore(report: MemoryBuilderReport, key: ScoreKey): number | null {
  return asScore(report[key] ?? report.evaluation?.[key]);
}

function getStringList(
  report: MemoryBuilderReport,
  key: "strengths" | "weaknesses" | "missingTopics" | "recommendations",
): string[] {
  return uniqueCleanStrings(report[key] ?? report.evaluation?.[key]);
}

function formatListForSummary(values: string[], fallback: string): string {
  if (values.length === 0) return fallback;
  if (values.length === 1) return values[0];
  if (values.length === 2) return `${values[0]} and ${values[1]}`;

  return `${values.slice(0, -1).join(", ")}, and ${values[values.length - 1]}`;
}

function readinessLabel(overallScore: number | null): string {
  if (overallScore === null) return "readiness could not be scored";
  if (overallScore >= 85) return "shows strong interview readiness";
  if (overallScore >= 70) return "shows moderate interview readiness";
  if (overallScore >= 50) return "needs additional preparation before interviews";

  return "requires focused foundational preparation";
}

export function buildScoreMemory(report: MemoryBuilderReport): InterviewScoreMemory {
  return {
    overall: getScore(report, "overallScore"),
    technical: getScore(report, "technicalScore"),
    communication: getScore(report, "communicationScore"),
    behavioral: getScore(report, "behavioralScore"),
    problemSolving: getScore(report, "problemSolvingScore"),
    confidence: getScore(report, "confidenceScore"),
  };
}

export function buildStrengthMemory(report: MemoryBuilderReport): string[] {
  return getStringList(report, "strengths");
}

export function buildWeaknessMemory(report: MemoryBuilderReport): string[] {
  return getStringList(report, "weaknesses");
}

export function buildMissingTopicMemory(report: MemoryBuilderReport): string[] {
  return getStringList(report, "missingTopics");
}

export function buildRecommendationMemory(report: MemoryBuilderReport): string[] {
  return getStringList(report, "recommendations");
}

export function buildSummary(memory: Omit<InterviewSemanticMemory, "summary">): string | null {
  const hasSemanticContent =
    memory.strengths.length > 0 ||
    memory.weaknesses.length > 0 ||
    memory.missingTopics.length > 0 ||
    memory.recommendations.length > 0 ||
    memory.scores.overall !== null;

  if (!hasSemanticContent) return null;

  const roleContext = memory.role ? ` for the ${memory.role} role` : "";
  const readiness = readinessLabel(memory.scores.overall);
  const strengths = formatListForSummary(memory.strengths, "no clearly captured strengths");
  const weaknesses = formatListForSummary(
    [...memory.weaknesses, ...memory.missingTopics],
    "no clearly captured gaps",
  );
  const recommendations = formatListForSummary(
    memory.recommendations,
    "continue targeted interview practice",
  );

  return `Candidate ${readiness}${roleContext}. Strengths include ${strengths}. Improvement areas include ${weaknesses}. Recommended next steps: ${recommendations}.`;
}

export function buildMemory(report: MemoryBuilderReport): InterviewSemanticMemory {
  const scores = buildScoreMemory(report);
  const strengths = buildStrengthMemory(report);
  const weaknesses = buildWeaknessMemory(report);
  const missingTopics = buildMissingTopicMemory(report);
  const recommendations = buildRecommendationMemory(report);

  const memoryWithoutSummary: Omit<InterviewSemanticMemory, "summary"> = {
    userId: asCleanString(report.userId) ?? asCleanString(report.interview?.userId),
    interviewId: asCleanString(report.interviewId),
    company:
      asCleanString(report.interview?.customCompanyName) ?? asCleanString(report.interview?.company),
    role: asCleanString(report.interview?.role),
    interviewType: asCleanString(report.interview?.interviewType),
    scores,
    strengths,
    weaknesses,
    missingTopics,
    recommendations,
    createdAt: asIsoString(report.createdAt ?? report.evaluation?.createdAt),
  };

  return {
    ...memoryWithoutSummary,
    summary: buildSummary(memoryWithoutSummary),
  };
}

export const MemoryBuilder = {
  buildMemory,
  buildScoreMemory,
  buildStrengthMemory,
  buildWeaknessMemory,
  buildMissingTopicMemory,
  buildRecommendationMemory,
  buildSummary,
};
