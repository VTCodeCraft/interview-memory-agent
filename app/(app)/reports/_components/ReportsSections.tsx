"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, ChevronRight, FileText, LoaderCircle, Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/feedback";
import { Input, Select } from "@/components/ui/input";
import { LinkPending } from "@/components/ui/link-pending";
import { ROUTES, routeTo } from "@/lib/utils/constants";
import { cn } from "@/lib/utils";
import { Panel } from "@/app/(app)/interviews/_components/DashboardSections";
import { dateParts } from "@/app/(app)/interviews/_components/dashboard-data";
import {
  PAGE_SIZE,
  SORTS,
  availableControls,
  displayScore,
  meterWidth,
  optionCounts,
  type ReportRow,
  type ReportSummary,
  type ReportsView,
  type SortKey,
} from "./reports-list";

/* ── Small pieces ───────────────────────────────────────────────────────── */

/** "Oct 2, 2026" with only the digits in the data face (as on the dashboard). */
function DateText({ iso }: { iso: string }) {
  return (
    <time dateTime={iso}>
      {dateParts(iso).map((part, index) =>
        part.type === "day" || part.type === "year" ? (
          <span key={index} className="font-data tabular-nums">
            {part.value}
          </span>
        ) : (
          part.value
        ),
      )}
    </time>
  );
}

/** `labelled`: the score is already named by its context (a summary label). */
function ScoreValue({ score, size = "md", labelled = false }: { score: number; size?: "md" | "lg"; labelled?: boolean }) {
  return (
    <span className="inline-flex items-baseline gap-0.5 whitespace-nowrap">
      {!labelled && <span className="sr-only">Score </span>}
      <span className={cn("font-data font-semibold tabular-nums text-fg", size === "lg" ? "text-metric-sm" : "text-body")}>
        {displayScore(score)}
      </span>
      <span aria-hidden className="font-data text-label text-fg-subtle tabular-nums">
        /100
      </span>
      <span className="sr-only"> out of 100</span>
    </span>
  );
}

/* ── Header ─────────────────────────────────────────────────────────────── */

export function ReportsHeader() {
  return (
    <header className="max-w-[44rem]">
      <p className="text-small font-medium text-fg-muted">Reports</p>
      <h1 className="ds-display mt-2 text-title text-balance text-fg">Interview reports</h1>
      <p className="mt-2 text-body text-fg-muted">
        Each report scores a finished interview out of 100. Open one for its score breakdown, strengths and focus areas.
      </p>
    </header>
  );
}

/* ── Summary (finished reports only; shown from two) ────────────────────── */

export function ReportsSummary({ summary }: { summary: ReportSummary }) {
  return (
    <Panel>
      <h2 className="sr-only">Summary</h2>
      <dl className="grid grid-cols-1 divide-y divide-line-subtle sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        <Stat label="Reports">
          <span className="font-data text-metric-sm text-fg tabular-nums">{summary.count}</span>
        </Stat>
        <Stat label="Average score">
          <ScoreValue score={summary.average} size="lg" labelled />
        </Stat>
        <Stat label="Highest score">
          <ScoreValue score={summary.highest} size="lg" labelled />
        </Stat>
      </dl>
    </Panel>
  );
}

function Stat({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-4 sm:block sm:px-6 sm:py-5">
      <dt className="text-small text-fg-muted">{label}</dt>
      <dd className="sm:mt-2">{children}</dd>
    </div>
  );
}

/* ── The list ───────────────────────────────────────────────────────────── */

export function ReportsList({
  rows,
  shown,
  matchCount,
  view,
  filtering,
  onViewChange,
  onReset,
  onShowMore,
}: {
  /** Every row (for filter options and totals). */
  rows: ReportRow[];
  /** Filtered, sorted and paged rows to render. */
  shown: ReportRow[];
  matchCount: number;
  view: ReportsView;
  filtering: boolean;
  onViewChange: (change: Partial<ReportsView>) => void;
  onReset: () => void;
  onShowMore: () => void;
}) {
  const toolbarRef = useRef<HTMLDivElement>(null);
  const controls = availableControls(rows);
  const types = optionCounts(rows, "type");
  const levels = optionCounts(rows, "level");
  const remaining = matchCount - shown.length;

  // Both Reset buttons disappear once nothing is filtered, so move focus to
  // the first control (still there) instead of letting it fall to the page.
  const reset = () => {
    toolbarRef.current?.querySelector<HTMLElement>("input, select")?.focus();
    onReset();
  };

  // "Show more" can disappear too; continue from the first newly shown report.
  const listRef = useRef<HTMLUListElement>(null);
  const focusFromRef = useRef<number | null>(null);
  useEffect(() => {
    const index = focusFromRef.current;
    if (index === null) return;
    focusFromRef.current = null;
    listRef.current?.querySelectorAll<HTMLElement>(":scope > li > a")[index]?.focus();
  }, [shown.length]);
  const showMore = () => {
    focusFromRef.current = shown.length;
    onShowMore();
  };

  const readyCount = rows.filter((row) => row.status === "ready").length;
  const processingCount = rows.length - readyCount;

  return (
    <Panel>
      <div className="flex items-center justify-between gap-4 border-b border-line-subtle px-5 py-4 sm:px-6">
        <h2 className="text-subheading text-fg">All reports</h2>
        <p className="text-small text-fg-muted">
          {readyCount > 0 && (
            <>
              <span className="font-data tabular-nums text-fg">{readyCount}</span> {readyCount === 1 ? "report" : "reports"}
            </>
          )}
          {readyCount > 0 && processingCount > 0 && " · "}
          {processingCount > 0 && (
            <>
              <span className="font-data tabular-nums text-fg">{processingCount}</span> processing
            </>
          )}
        </p>
      </div>

      {controls.toolbar && (
        <div
          ref={toolbarRef}
          role="group"
          aria-label="Filter and sort reports"
          className="flex flex-col gap-3 border-b border-line-subtle bg-canvas/60 px-5 py-3 sm:px-6 lg:flex-row lg:items-center"
        >
          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-3">
            {controls.search && (
              <SearchField value={view.q} onChange={(q) => onViewChange({ q })} />
            )}
            {controls.type && (
              <ToolbarSelect
                label="Interview type"
                value={view.type}
                onChange={(type) => onViewChange({ type })}
                options={[{ value: "all", label: "All types" }, ...types.map(([value, count]) => ({ value, label: `${value} (${count})` }))]}
                className={controls.level ? undefined : "col-span-2"}
              />
            )}
            {controls.level && (
              <ToolbarSelect
                label="Level"
                value={view.level}
                onChange={(level) => onViewChange({ level })}
                options={[{ value: "all", label: "All levels" }, ...levels.map(([value, count]) => ({ value, label: `${value} (${count})` }))]}
                className={controls.type ? undefined : "col-span-2"}
              />
            )}
            <ToolbarSelect
              label="Sort by"
              value={view.sort}
              onChange={(sort) => onViewChange({ sort: sort as SortKey })}
              options={SORTS.map((sort) => ({ value: sort.value, label: sort.label }))}
              className="col-span-2"
            />
          </div>
          {/* Always present, so the count is announced when filters change. */}
          <p aria-live="polite" className="sr-only">
            {filtering ? `${matchCount} of ${rows.length} reports match` : ""}
          </p>
          {filtering && (
            <div className="flex min-h-8 items-center justify-between gap-3 lg:ml-auto">
              <p className="text-small text-fg-muted">
                <span className="font-data tabular-nums text-fg">{matchCount}</span> of{" "}
                <span className="font-data tabular-nums">{rows.length}</span> match
              </p>
              <Button variant="ghost" size="sm" onClick={reset} className="-mr-2">
                Reset
              </Button>
            </div>
          )}
        </div>
      )}

      {shown.length > 0 ? (
        <>
          <div
            aria-hidden
            className="hidden grid-cols-[minmax(0,1fr)_8.5rem_10rem_1rem] gap-6 border-b border-line-subtle px-6 py-2.5 text-label font-medium text-fg-subtle md:grid"
          >
            <span>Interview</span>
            <span>Date</span>
            <span className="text-right">Score</span>
            <span />
          </div>
          <ul ref={listRef} role="list" className="divide-y divide-line-subtle">
            {shown.map((row) => (
              <li key={row.key}>
                <ReportRowLink row={row} />
              </li>
            ))}
          </ul>
          {remaining > 0 && (
            <div className="flex flex-col items-center gap-2 border-t border-line-subtle px-5 py-4 sm:flex-row sm:justify-between sm:px-6">
              <p className="text-small text-fg-muted">
                Showing <span className="font-data tabular-nums text-fg">{shown.length}</span> of{" "}
                <span className="font-data tabular-nums">{matchCount}</span>
              </p>
              <Button variant="secondary" size="sm" onClick={showMore}>
                Show {Math.min(remaining, PAGE_SIZE)} more
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center px-5 py-12 text-center sm:px-6">
          <p className="text-small font-semibold text-fg">No reports match</p>
          <p className="mt-1 max-w-[40ch] text-small text-fg-muted">
            {rows.some((row) => row.status === "processing") && (view.type !== "all" || view.level !== "all")
              ? "Reports still being prepared don't have a type or level yet. Try other filters."
              : "Try a different search or filter."}
          </p>
          <Button variant="secondary" size="sm" onClick={reset} className="mt-4">
            Reset filters
          </Button>
        </div>
      )}
    </Panel>
  );
}

function ReportRowLink({ row }: { row: ReportRow }) {
  const meta = [row.type, row.level].filter(Boolean).join(" · ");
  const processing = row.status === "processing";

  // Below md: title and score share the first line and the details run the
  // full width beneath. From md: interview, date, score and chevron columns.
  return (
    <Link
      href={routeTo.report(row.interviewId)}
      className="group grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1 px-5 py-4 transition-[background-color] duration-(--duration-fast) ease-standard hover:bg-sunken/60 focus-visible:bg-sunken/60 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus sm:px-6 md:grid-cols-[minmax(0,1fr)_8.5rem_10rem_1rem] md:gap-x-6 md:gap-y-0.5"
    >
      <span title={row.title} className="col-start-1 row-start-1 line-clamp-2 text-small font-semibold [overflow-wrap:anywhere] text-fg">
        {row.title}
      </span>

      <span className="col-span-2 row-start-2 text-small text-fg-muted md:col-span-1">
        {processing ? "Open to check its status" : meta}
        <span className="md:hidden">
          {(processing || meta) && " · "}
          <DateText iso={row.date} />
        </span>
      </span>

      <span className="hidden text-small text-fg-muted md:col-start-2 md:row-span-2 md:row-start-1 md:block">
        <DateText iso={row.date} />
      </span>

      <span className="relative col-start-2 row-start-1 flex items-center justify-end gap-3 md:col-start-3 md:row-span-2">
        {/* Mobile rows have no chevron: show the wait in the gap beside the score instead. */}
        <LinkPending className="absolute right-full mr-0.5 size-3.5 md:hidden" />
        {processing ? (
          <Badge tone="neutral">
            <LoaderCircle aria-hidden strokeWidth={2} className="motion-safe:animate-spin" />
            Processing
          </Badge>
        ) : row.score === null ? (
          <span className="text-small text-fg-subtle">No score</span>
        ) : (
          <>
            <span aria-hidden className="hidden w-16 lg:block">
              <span className="block h-1 overflow-hidden rounded-full bg-sunken">
                <span className="block h-full rounded-full bg-brand" style={{ width: `${meterWidth(row.score)}%` }} />
              </span>
            </span>
            <ScoreValue score={row.score} />
          </>
        )}
      </span>

      {/* The report page has no loading.js (it keeps real 404s), so show the wait here. */}
      <LinkPending
        className="hidden md:col-start-4 md:row-span-2 md:row-start-1 md:inline-flex"
        idle={
          <ChevronRight
            strokeWidth={1.75}
            className="size-4 text-fg-subtle transition-transform duration-(--duration-fast) ease-standard motion-safe:group-hover:translate-x-0.5"
          />
        }
      />
    </Link>
  );
}

function SearchField({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const id = useId();
  return (
    <div className="relative col-span-2 min-w-0 sm:w-64">
      <label htmlFor={id} className="sr-only">
        Search reports
      </label>
      <Search aria-hidden strokeWidth={1.75} className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-fg-subtle" />
      <Input
        id={id}
        type="search"
        value={value}
        maxLength={100}
        autoComplete="off"
        placeholder="Search role or company"
        onChange={(event) => onChange(event.target.value)}
        className="h-9 pl-9 text-small"
      />
    </div>
  );
}

function ToolbarSelect({
  label,
  value,
  onChange,
  options,
  className,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  className?: string;
}) {
  const id = useId();
  return (
    <div className={cn("min-w-0", className)}>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <Select id={id} value={value} onChange={(event) => onChange(event.target.value)} className="h-9 text-small sm:w-44">
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
    </div>
  );
}

/* ── Empty and loading ──────────────────────────────────────────────────── */

export function NoReports() {
  return (
    <Panel className="px-5 py-8 sm:px-8 sm:py-10">
      <span aria-hidden className="flex size-10 items-center justify-center rounded-full bg-brand-soft text-brand ring-1 ring-memory-line ring-inset">
        <FileText strokeWidth={1.75} className="size-5" />
      </span>
      <h2 className="ds-display mt-5 text-heading text-fg">No reports yet</h2>
      <p className="mt-2 max-w-[52ch] text-body text-fg-muted">
        When you finish an interview, its report appears here with an overall score, a score breakdown, strengths and focus
        areas.
      </p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Link href={ROUTES.newInterview} className={buttonVariants({ variant: "primary" })}>
          Start interview
          <ArrowRight aria-hidden strokeWidth={1.75} />
        </Link>
        <Link href={ROUTES.interviews} className={buttonVariants({ variant: "secondary" })}>
          Go to dashboard
        </Link>
      </div>
    </Panel>
  );
}

/** Placeholder in the shape of the loaded list, so nothing jumps when data arrives. */
export function ReportsSkeleton() {
  return (
    <div role="status" aria-live="polite" className="flex flex-col gap-6">
      <span className="sr-only">Loading your reports</span>
      <Panel className="grid gap-4 p-5 sm:grid-cols-3 sm:p-6">
        {[0, 1, 2].map((key) => (
          <div key={key} className="flex flex-col gap-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-7 w-16" />
          </div>
        ))}
      </Panel>
      <Panel>
        <div className="border-b border-line-subtle px-5 py-4 sm:px-6">
          <Skeleton className="h-5 w-32" />
        </div>
        {[0, 1, 2, 3, 4].map((key) => (
          <div key={key} className="flex items-center gap-4 border-b border-line-subtle px-5 py-4 last:border-b-0 sm:px-6">
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-4 w-56 max-w-full" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-5 w-14" />
          </div>
        ))}
      </Panel>
    </div>
  );
}
