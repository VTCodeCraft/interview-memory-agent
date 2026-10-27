import type { Difficulty } from "../../../onboarding/_components/options";

/**
 * Form logic for /profile. Pure (relative and type-only imports) so it runs
 * under Vitest without path aliases.
 *
 * Saved to the account (PATCH /api/user/profile, lib/validations/profile.ts):
 * experience, GitHub and LinkedIn URLs, target role, level, target companies
 * and interview types. Only the weekly goal lives in this browser
 * (store/useSettingsStore.ts); the page says so.
 */

export interface ServerProfile {
  experience: string | null;
  githubUrl: string | null;
  linkedinUrl: string | null;
  targetRole: string | null;
  preferredDifficulty: Difficulty | null;
  targetCompanies: string[] | null;
  interviewTypes: string[] | null;
}

export interface DetailsValues {
  experience: string;
  githubUrl: string;
  linkedinUrl: string;
}

export interface PreferenceValues {
  targetRole: string;
  preferredDifficulty: Difficulty;
  targetCompanies: string[];
  interviewTypes: string[];
}

export type Errors<T> = Partial<Record<keyof T, string>>;

const list = (value: unknown) => (Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : []);

export function detailsFrom(profile: Partial<ServerProfile> | null): DetailsValues {
  return {
    experience: profile?.experience ?? "",
    githubUrl: profile?.githubUrl ?? "",
    linkedinUrl: profile?.linkedinUrl ?? "",
  };
}

/** Saved values only; nothing is filled in from browser storage or defaults except the level, which the server defaults to MEDIUM. */
export function preferencesFrom(profile: Partial<ServerProfile> | null): PreferenceValues {
  const level = profile?.preferredDifficulty;
  return {
    targetRole: profile?.targetRole ?? "",
    preferredDifficulty: level === "EASY" || level === "HARD" ? level : "MEDIUM",
    targetCompanies: list(profile?.targetCompanies),
    interviewTypes: list(profile?.interviewTypes),
  };
}

/* ── Validation (mirrors lib/validations/profile.ts, with clearer messages) ── */

function isWebUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

export function validateDetails(values: DetailsValues): Errors<DetailsValues> {
  const errors: Errors<DetailsValues> = {};
  if (values.githubUrl.trim() && !isWebUrl(values.githubUrl.trim())) errors.githubUrl = "Enter a full link starting with https://";
  if (values.linkedinUrl.trim() && !isWebUrl(values.linkedinUrl.trim())) errors.linkedinUrl = "Enter a full link starting with https://";
  return errors;
}

export function validatePreferences(values: PreferenceValues): Errors<PreferenceValues> {
  return values.targetRole.trim() ? {} : { targetRole: "Enter the role you're preparing for." };
}

/** The server rejects an empty experience, so it is left out until one is chosen. */
export function detailsPayload(values: DetailsValues) {
  return {
    ...(values.experience ? { experience: values.experience } : {}),
    githubUrl: values.githubUrl.trim(),
    linkedinUrl: values.linkedinUrl.trim(),
  };
}

export function preferencesPayload(values: PreferenceValues) {
  return {
    targetRole: values.targetRole.trim(),
    preferredDifficulty: values.preferredDifficulty,
    targetCompanies: values.targetCompanies,
    interviewTypes: values.interviewTypes,
  };
}

/** True when two value sets match; list order matters because the first pick is preselected. */
export function sameValues<T extends object>(a: T, b: T) {
  return (Object.keys(a) as (keyof T)[]).every((key) => {
    const left = a[key];
    const right = b[key];
    if (Array.isArray(left) && Array.isArray(right)) return left.length === right.length && left.every((item, index) => item === right[index]);
    return typeof left === "string" && typeof right === "string" ? left.trim() === right.trim() : left === right;
  });
}

/**
 * Field messages from a 422 response. handleZodError sends
 * `errors: ["githubUrl: Invalid GitHub URL", ...]`; anything else is ignored.
 */
export function serverFieldErrors(errors: unknown): Record<string, string> {
  const result: Record<string, string> = {};
  for (const entry of list(errors)) {
    const match = /^([A-Za-z]+)(?:\.\d+)?:\s*(.+)$/.exec(entry);
    if (match && !result[match[1]]) result[match[1]] = match[2];
  }
  return result;
}

/** Only the messages for fields this form shows; the rest can't be pointed at. */
export function errorsFor<T extends object>(fields: Record<string, string> | undefined, values: T): Errors<T> {
  const result: Errors<T> = {};
  for (const [key, message] of Object.entries(fields ?? {})) {
    if (key in values) result[key as keyof T] = message;
  }
  return result;
}

/* ── Multi-select with a first pick (same rules as onboarding) ──────────── */

export function toggleChoice(current: string[], value: string, on: boolean) {
  return on ? (current.includes(value) ? current : [...current, value]) : current.filter((item) => item !== value);
}

/** Interview setup preselects the first saved company and type. */
export function firstPick(current: string[], value: string) {
  return current.length > 1 && current[0] === value ? "First pick" : undefined;
}

/** Fixed options plus any saved value that isn't one of them, so nothing saved is hidden. */
export function withSaved(options: readonly string[], saved: readonly string[]) {
  return [...options, ...saved.filter((value) => value && !options.includes(value))];
}

/* ── Weekly goal (browser only) ─────────────────────────────────────────── */

/** A whole number of at least 1, as the setting has always stored; null for anything else. */
export function goalFromInput(raw: string): number | null {
  if (!/^\s*\d+\s*$/.test(raw)) return null;
  const value = Number.parseInt(raw, 10);
  return value >= 1 ? value : null;
}
