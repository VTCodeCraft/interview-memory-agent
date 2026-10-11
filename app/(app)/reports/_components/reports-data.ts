import { API } from "@/lib/utils/constants";
import type { Report } from "@/types";
import { companyLabel, levelLabel, typeLabel, type PendingReport } from "@/app/(app)/interviews/_components/dashboard-data";
import type { RowLabels } from "./reports-list";

/**
 * /reports reads two existing endpoints, unchanged:
 *   GET /api/interview/history         finished interviews with a report (newest first)
 *   GET /api/interview/pending-report  latest interview whose report is still being generated
 * History is required: without it the page can't say anything true about the
 * user's reports, so a failure is a page error (not an empty list). The pending
 * check only adds one row, so it fails quietly.
 */

export interface ReportsData {
  reports: Report[];
  pending: PendingReport | null;
}

export class ReportsLoadError extends Error {}

/** Same labels as the dashboard, so a report reads the same in both places. */
export const ROW_LABELS: RowLabels = { type: typeLabel, level: levelLabel, company: companyLabel };

async function getJson(url: string) {
  const response = await fetch(url, { cache: "no-store" });
  const body = await response.json().catch(() => null);
  return { ok: response.ok, body };
}

export async function loadReports(): Promise<ReportsData> {
  const [historyRes, pendingRes] = await Promise.all([
    getJson(API.reports),
    getJson(API.pendingReport).catch(() => null),
  ]);

  if (!historyRes.ok || !historyRes.body?.ok || !Array.isArray(historyRes.body.data)) {
    throw new ReportsLoadError("history");
  }

  const pending = pendingRes?.ok && pendingRes.body?.ok ? pendingRes.body.data : null;

  return {
    reports: historyRes.body.data as Report[],
    pending: pending?.interviewId
      ? {
          interviewId: pending.interviewId,
          role: pending.role,
          company: companyLabel(pending.company, pending.customCompanyName),
          createdAt: pending.createdAt,
        }
      : null,
  };
}
