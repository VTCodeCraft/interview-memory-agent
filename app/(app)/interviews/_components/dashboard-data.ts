import { API } from "@/lib/utils/constants";
import type { Report } from "@/types";

/**
 * Everything the dashboard shows comes from existing endpoints, unchanged:
 *   GET /api/user/profile            profile + latest resume
 *   GET /api/interview/history       finished interviews with a report (newest first)
 *   GET /api/interview/active        unfinished interview, if any
 *   GET /api/interview/pending-report latest interview whose report is being generated
 */

export type ActiveStatus = "PENDING" | "GENERATING" | "READY" | "ONGOING";

export interface DashboardProfile {
  fullName: string | null;
  targetRole: string | null;
  experience: string | null;
  preferredDifficulty: string | null;
  targetCompanies: string[];
  interviewTypes: string[];
  resume: { fileName: string; uploadedAt: string } | null;
}

export interface PendingReport {
  interviewId: string;
  role: string;
  company: string | null;
  createdAt: string;
}

export interface DashboardData {
  profile: DashboardProfile;
  reports: Report[];
  active: { interviewId: string; status: ActiveStatus } | null;
  pending: PendingReport | null;
}

export class DashboardLoadError extends Error {}

async function getJson(url: string) {
  const response = await fetch(url, { cache: "no-store" });
  const body = await response.json().catch(() => null);
  return { ok: response.ok, body };
}

/**
 * Profile and history are required; without them the page has nothing true to
 * show, so either failing is a page error. The active-interview and
 * pending-report checks only add banners, so they fail quietly.
 */
export async function loadDashboard(): Promise<DashboardData> {
  const [profileRes, historyRes, activeRes, pendingRes] = await Promise.all([
    getJson("/api/user/profile"),
    getJson(API.reports),
    getJson("/api/interview/active").catch(() => null),
    getJson(API.pendingReport).catch(() => null),
  ]);

  if (!profileRes.ok || !profileRes.body?.success) throw new DashboardLoadError("profile");
  if (!historyRes.ok || !historyRes.body?.ok) throw new DashboardLoadError("history");

  const data = profileRes.body.data;
  const profile = data.profile ?? {};
  const resume = data.latestResume;

  const active = activeRes?.ok && activeRes.body?.success ? activeRes.body.data : null;
  const pending = pendingRes?.ok && pendingRes.body?.ok ? pendingRes.body.data : null;

  return {
    profile: {
      fullName: data.user?.fullName ?? null,
      targetRole: profile.targetRole ?? null,
      experience: profile.experience ?? null,
      preferredDifficulty: profile.preferredDifficulty ?? null,
      targetCompanies: profile.targetCompanies ?? [],
      interviewTypes: profile.interviewTypes ?? [],
      resume: resume ? { fileName: resume.originalFileName, uploadedAt: resume.uploadedAt } : null,
    },
    reports: Array.isArray(historyRes.body.data) ? historyRes.body.data : [],
    active: active?.interviewId ? { interviewId: active.interviewId, status: active.status } : null,
    pending: pending?.interviewId
      ? {
          interviewId: pending.interviewId,
          role: pending.role,
          company: pending.customCompanyName || (pending.company !== "Other" ? pending.company : null),
          createdAt: pending.createdAt,
        }
      : null,
  };
}

/* Labels. Interviews store their type as shown in setup ("System Design");
   the profile stores keys ("system_design"). */

const LEVELS: Record<string, string> = { EASY: "Junior", MEDIUM: "Mid-Level", HARD: "Senior+" };
const TYPES: Record<string, string> = { technical: "Technical", behavioral: "Behavioral", system_design: "System design" };

export function levelLabel(value: string | null | undefined) {
  return value ? (LEVELS[value] ?? value) : null;
}

export function typeLabel(value: string | null | undefined) {
  if (!value) return null;
  const key = value.toLowerCase().replace(/\s+/g, "_");
  return TYPES[key] ?? value;
}

export function companyLabel(company: string | null | undefined, custom: string | null | undefined) {
  return custom || (company && company !== "Other" ? company : null);
}

export const ACTIVE_STATUS_LABEL: Record<ActiveStatus, string> = {
  PENDING: "Getting ready",
  GENERATING: "Preparing questions",
  READY: "Ready to start",
  ONGOING: "In progress",
};

const DATE = new Intl.DateTimeFormat("en", { day: "numeric", month: "short", year: "numeric" });

/** Date split so only the digits can use the data face. */
export function dateParts(iso: string) {
  return DATE.formatToParts(new Date(iso));
}

export function firstName(fullName: string | null | undefined) {
  return fullName?.trim().split(/\s+/)[0] || null;
}
