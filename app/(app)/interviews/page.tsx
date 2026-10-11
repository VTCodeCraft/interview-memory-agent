"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { RotateCw } from "lucide-react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { firstName, loadDashboard, type DashboardData } from "./_components/dashboard-data";
import { DashboardSkeleton } from "./_components/DashboardSkeleton";
import {
  ActiveInterviewBanner,
  DashboardHeader,
  FirstInterview,
  LatestHighlights,
  PracticeProfile,
  RecentInterviews,
  SummaryStats,
} from "./_components/DashboardSections";

type LoadState = { status: "loading" } | { status: "error" } | { status: "ready"; data: DashboardData };

/**
 * /interviews: "My Dashboard". Start or resume an interview, see reports as
 * they arrive and the practice profile behind them. Every number here comes
 * from a finished report; nothing is estimated.
 */
export default function InterviewsDashboardPage() {
  const { user, isLoaded } = useUser();
  const [state, setState] = useState<LoadState>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    loadDashboard().then(
      (data) => {
        if (!cancelled) setState({ status: "ready", data });
      },
      (error) => {
        console.error("[Dashboard] load failed", error);
        if (!cancelled) setState({ status: "error" });
      },
    );
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const retry = () => {
    setState({ status: "loading" });
    setAttempt((count) => count + 1);
  };

  const data = state.status === "ready" ? state.data : null;
  const name = (isLoaded ? user?.firstName : null) || firstName(data?.profile.fullName);

  return (
    <div className="ds-page flex-1">
      <main className="ds-container pt-8 pb-16 sm:pt-10 lg:pt-12 lg:pb-24">
        {state.status === "loading" && <DashboardSkeleton />}

        {state.status === "error" && (
          <div className="flex flex-col gap-8">
            <DashboardHeader name={name} profile={null} active={null} hasReports={false} />
            <Alert
              tone="danger"
              title="Your dashboard didn't load"
              action={
                <Button variant="secondary" size="sm" onClick={retry}>
                  <RotateCw aria-hidden strokeWidth={1.75} />
                  Try again
                </Button>
              }
            >
              Check your connection and try again. Starting an interview still works.
            </Alert>
          </div>
        )}

        {data && (
          <div className="flex flex-col gap-8">
            <DashboardHeader name={name} profile={data.profile} active={data.active} hasReports={data.reports.length > 0} />
            {data.active && <ActiveInterviewBanner active={data.active} />}

            <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
              <div className="flex min-w-0 flex-col gap-6 lg:col-span-8">
                {data.reports.length > 0 ? (
                  <>
                    <SummaryStats reports={data.reports} />
                    <RecentInterviews reports={data.reports} pending={data.pending} />
                  </>
                ) : data.pending ? (
                  // Finished an interview; its report (the first) is still being prepared.
                  <RecentInterviews reports={[]} pending={data.pending} />
                ) : (
                  <FirstInterview hasActive={Boolean(data.active)} />
                )}
              </div>
              <aside aria-label="Your practice" className="flex min-w-0 flex-col gap-6 lg:col-span-4">
                {data.reports[0] && <LatestHighlights report={data.reports[0]} />}
                <PracticeProfile profile={data.profile} />
              </aside>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
