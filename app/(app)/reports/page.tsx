"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { RotateCw } from "lucide-react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ROW_LABELS, loadReports, type ReportsData } from "./_components/reports-data";
import {
  DEFAULT_VIEW,
  PAGE_SIZE,
  effectiveView,
  filterRows,
  isFiltering,
  parseView,
  sortRows,
  summarize,
  toRows,
  viewQuery,
  type ReportsView,
} from "./_components/reports-list";
import { NoReports, ReportsHeader, ReportsList, ReportsSkeleton, ReportsSummary } from "./_components/ReportsSections";

type LoadState = { status: "loading" } | { status: "error" } | { status: "ready"; data: ReportsData };

/**
 * /reports: every finished interview's report, newest first, plus the one
 * still being generated. Rows open /reports/[interviewId]. Nothing here is
 * estimated: scores, types, levels and dates come straight from the reports.
 */
export default function ReportsPage() {
  return (
    <div className="ds-page flex-1">
      <main className="ds-container pt-8 pb-16 sm:pt-10 lg:pt-12 lg:pb-24">
        <div className="flex flex-col gap-8">
          <ReportsHeader />
          {/* useSearchParams needs a Suspense boundary. */}
          <Suspense fallback={<ReportsSkeleton />}>
            <ReportsContent />
          </Suspense>
        </div>
      </main>
    </div>
  );
}

function ReportsContent() {
  const [state, setState] = useState<LoadState>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);
  const [view, setView] = useUrlView();
  const [limit, setLimit] = useState(PAGE_SIZE);

  useEffect(() => {
    let cancelled = false;
    loadReports().then(
      (data) => {
        if (!cancelled) setState({ status: "ready", data });
      },
      (error) => {
        console.error("[Reports] load failed", error);
        if (!cancelled) setState({ status: "error" });
      },
    );
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const rows = useMemo(
    () => (state.status === "ready" ? toRows(state.data.reports, state.data.pending, ROW_LABELS) : []),
    [state],
  );

  if (state.status === "loading") return <ReportsSkeleton />;

  if (state.status === "error") {
    return (
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
        Check your connection and try again.
      </Alert>
    );
  }

  if (rows.length === 0) return <NoReports />;

  const active = effectiveView(view, rows);
  const matches = sortRows(filterRows(rows, active), active.sort);
  const summary = summarize(rows);

  const change = (next: ReportsView) => {
    setView(next);
    setLimit(PAGE_SIZE);
  };

  return (
    <div className="flex flex-col gap-6">
      {summary && <ReportsSummary summary={summary} />}
      <ReportsList
        rows={rows}
        shown={matches.slice(0, limit)}
        matchCount={matches.length}
        view={active}
        filtering={isFiltering(active)}
        onViewChange={(partial) => change({ ...active, ...partial })}
        onReset={() => change({ ...DEFAULT_VIEW, sort: active.sort })}
        onShowMore={() => setLimit((count) => count + PAGE_SIZE)}
      />
    </div>
  );
}

/**
 * Search, filters and sort live in the query string, so opening a report and
 * coming back (or reloading) keeps them. Local state is the source of truth
 * while the page is open; the URL mirrors it with history.replaceState (no
 * navigation, no new history entries).
 *
 * The router reports our own writes back a moment later, possibly more than
 * one at once while someone is typing. Those are matched against the queue of
 * writes it hasn't caught up with yet. Any other URL change (for example the
 * Reports tab in the navigation, which goes to plain /reports) is a real
 * navigation, and the view follows it.
 */
function useUrlView(): [ReportsView, (view: ReportsView) => void] {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlQuery = searchParams.toString();

  const [view, setViewState] = useState(() => parseView(searchParams));
  const [seen, setSeen] = useState(urlQuery);
  const [pending, setPending] = useState<string[]>([]);

  if (urlQuery !== seen) {
    setSeen(urlQuery);
    const index = pending.lastIndexOf(urlQuery);
    if (index >= 0) {
      setPending(pending.slice(index + 1));
    } else {
      setPending([]);
      setViewState(parseView(searchParams));
    }
  }

  const setView = (next: ReportsView) => {
    setViewState(next);
    const query = viewQuery(next);
    // Writing the URL that's already there changes nothing, so nothing comes back.
    if (query !== window.location.search) setPending((queue) => [...queue, query.slice(1)]);
    window.history.replaceState(null, "", `${pathname}${query}`);
  };

  return [view, setView];
}
