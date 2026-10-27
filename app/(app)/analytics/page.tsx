"use client";

import { useEffect, useMemo, useState } from "react";
import { RotateCw } from "lucide-react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ROW_LABELS, loadReports, type ReportsData } from "@/app/(app)/reports/_components/reports-data";
import { groupByType, toAnalyticsRows } from "./_components/analytics-data";
import {
  AboutAnalytics,
  ActivityPanel,
  AnalyticsHeader,
  AnalyticsSkeleton,
  NoAnalytics,
  TypeSection,
} from "./_components/AnalyticsSections";

type LoadState = { status: "loading" } | { status: "error" } | { status: "ready"; data: ReportsData };

/**
 * /analytics: score history from finished reports, one section per interview
 * type, plus weekly activity. Reads the same endpoints as /reports:
 *   GET /api/interview/history         finished reports (required)
 *   GET /api/interview/pending-report  a report still being prepared (optional)
 * Runs in the browser so weeks follow the viewer's time zone and the weekly
 * goal (browser storage) is available.
 */
export default function AnalyticsPage() {
  const [state, setState] = useState<LoadState>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    loadReports().then(
      (data) => {
        if (!cancelled) setState({ status: "ready", data });
      },
      (error) => {
        console.error("[Analytics] load failed", error);
        if (!cancelled) setState({ status: "error" });
      },
    );
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const rows = useMemo(() => (state.status === "ready" ? toAnalyticsRows(state.data.reports, ROW_LABELS) : null), [state]);
  const groups = useMemo(() => (rows ? groupByType(rows) : []), [rows]);
  const pending =
    state.status === "ready" && state.data.pending && !state.data.reports.some((report) => report.interviewId === state.data.pending?.interviewId)
      ? 1
      : 0;

  return (
    <div className="ds-page flex-1">
      <main className="ds-container pt-8 pb-16 sm:pt-10 lg:pt-12 lg:pb-24">
        <div className="flex flex-col gap-8">
          <AnalyticsHeader rows={rows} pendingCount={pending} />
          <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
            <div className="flex min-w-0 flex-col gap-6 lg:col-span-8">
              {state.status === "loading" && <AnalyticsSkeleton />}
              {state.status === "error" && (
                <Alert
                  tone="danger"
                  title="Your analytics didn't load"
                  action={
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setState({ status: "loading" });
                        setAttempt((count) => count + 1);
                      }}
                    >
                      <RotateCw aria-hidden strokeWidth={1.75} />
                      Try again
                    </Button>
                  }
                >
                  Analytics comes from your reports. Check your connection and try again.
                </Alert>
              )}
              {rows && rows.length === 0 && <NoAnalytics pending={pending > 0} />}
              {groups.map((group) => (
                <TypeSection key={group.type ?? "none"} group={group} />
              ))}
            </div>
            <aside aria-label="Activity and notes" className="flex min-w-0 flex-col gap-6 lg:col-span-4">
              {rows && <ActivityPanel rows={rows} />}
              <AboutAnalytics />
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}
