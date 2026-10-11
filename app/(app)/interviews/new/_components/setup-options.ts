/**
 * Interview setup choices. Values are exactly what POST /api/interview/start
 * already receives and stores:
 * - company: one of the presets, or "Other" with companyType + customCompanyName
 * - interviewType: the setup label ("Technical" | "Behavioral" | "System Design")
 * - difficulty: Prisma Difficulty (EASY | MEDIUM | HARD)
 */

export const COMPANIES = ["Google", "Amazon", "Microsoft", "Meta", "NVIDIA", "Other"] as const;

export const COMPANY_TYPES = ["Big Tech", "Startup"] as const;

export const INTERVIEW_TYPES = [
  { value: "Technical", label: "Technical", description: "Concepts and problem solving", profileKey: "technical" },
  { value: "Behavioral", label: "Behavioral", description: "Stories about how you work and lead", profileKey: "behavioral" },
  { value: "System Design", label: "System design", description: "Designing and scaling systems", profileKey: "system_design" },
] as const;

export type InterviewTypeValue = (typeof INTERVIEW_TYPES)[number]["value"];

export type Level = "EASY" | "MEDIUM" | "HARD";

export const LEVELS: readonly { value: Level; label: string }[] = [
  { value: "EASY", label: "Junior" },
  { value: "MEDIUM", label: "Mid-Level" },
  { value: "HARD", label: "Senior+" },
];

export function levelLabel(value: Level) {
  return LEVELS.find((level) => level.value === value)?.label ?? value;
}

export function typeLabel(value: InterviewTypeValue) {
  return INTERVIEW_TYPES.find((type) => type.value === value)?.label ?? value;
}

/** Profile stores interview types as keys ("system_design"); setup uses labels. */
export function typeFromProfileKey(key: string | undefined): InterviewTypeValue | null {
  return INTERVIEW_TYPES.find((type) => type.profileKey === key)?.value ?? null;
}

export function isLevel(value: unknown): value is Level {
  return value === "EASY" || value === "MEDIUM" || value === "HARD";
}

export function isPresetCompany(value: unknown): value is (typeof COMPANIES)[number] {
  return typeof value === "string" && (COMPANIES as readonly string[]).includes(value);
}
