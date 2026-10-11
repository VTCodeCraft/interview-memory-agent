/**
 * Onboarding choices. Values match what the rest of the product reads:
 * - experience strings: Profile & Settings (EXPERIENCE_OPTIONS)
 * - companies / interview types / difficulty: Profile & Settings and the
 *   interview setup page, which preselects the first saved company and type
 *   and maps EASY / MEDIUM / HARD to Junior / Mid-Level / Senior+.
 */

export const EXPERIENCE_OPTIONS = ["0-2 Years", "3-5 Years", "6-10 Years", "10+ Years"];

export const COMPANY_OPTIONS = ["Google", "Amazon", "Microsoft", "Meta", "NVIDIA"];

export const INTERVIEW_TYPE_OPTIONS = [
  { value: "technical", label: "Technical", description: "Concepts and problem solving" },
  { value: "behavioral", label: "Behavioral", description: "Stories about how you work and lead" },
  { value: "system_design", label: "System design", description: "Designing and scaling systems" },
];

export type Difficulty = "EASY" | "MEDIUM" | "HARD";

export const DIFFICULTY_OPTIONS: { value: Difficulty; label: string }[] = [
  { value: "EASY", label: "Junior" },
  { value: "MEDIUM", label: "Mid-Level" },
  { value: "HARD", label: "Senior+" },
];

/** Profile values the form starts from (empty for a brand-new user). */
export interface OnboardingInitial {
  experience: string;
  targetRole: string;
  /** Not edited here (Profile & Settings owns them); sent back unchanged. */
  githubUrl: string;
  linkedinUrl: string;
  preferredDifficulty: Difficulty;
  targetCompanies: string[];
  interviewTypes: string[];
}

/** The resume already saved for this user, if any. */
export interface SavedResume {
  fileName: string;
  pages: number;
  /** ISO date, or null for a resume uploaded in this session. */
  uploadedAt: string | null;
}
