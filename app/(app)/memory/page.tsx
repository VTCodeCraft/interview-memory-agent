"use client";

import { useEffect, useState } from "react";
import { RotateCw } from "lucide-react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { loadReports, type ReportsData } from "@/app/(app)/reports/_components/reports-data";
import { HowMemoryWorks, MemoryHeader, MemorySkeleton, MemorySources, NoMemoryYet } from "./_components/MemorySections";

type LoadState = { status: "loading" } | { status: "error" } | { status: "ready"; data: ReportsData };

/**
 * /memory: what interview memory is, how it's used, and what it's built from.
 *
 * The saved memory (Cognee) is only read on the server, when questions are
 * prepared and reports are evaluated; no endpoint returns it to the browser
 * (FDI-019). So this page explains memory and shows the finished-report
 * details it is built from, via the same endpoints as /reports:
 *   GET /api/interview/history         finished reports (required)
 *   GET /api/interview/pending-report  a report still being prepared (optional)
 */
export default function MemoryPage() {
  const [state, setState] = useState<LoadState>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    loadReports().then(
      (data) => {
        if (!cancelled) setState({ status: "ready", data });
      },
      (error) => {
        console.error("[Memory] load failed", error);
        if (!cancelled) setState({ status: "error" });
      },
    );
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  return (
    <div className="ds-page flex-1">
      <main className="ds-container pt-8 pb-16 sm:pt-10 lg:pt-12 lg:pb-24">
        <div className="flex flex-col gap-8">
          <MemoryHeader />
          <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
            <div className="min-w-0 lg:col-span-8">
              {state.status === "loading" && <MemorySkeleton />}
              {state.status === "error" && (
                <Alert
                  tone="danger"
                  title="Your reports didn't load"
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
                  The details on this page come from your reports. Check your connection and try again.
                </Alert>
              )}
              {state.status === "ready" &&
                (state.data.reports.length > 0 ? (
                  <MemorySources reports={state.data.reports} pending={state.data.pending} />
                ) : (
                  <NoMemoryYet pending={state.data.pending} />
                ))}
            </div>
            <aside aria-label="About interview memory" className="min-w-0 lg:col-span-4">
              <HowMemoryWorks />
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}
