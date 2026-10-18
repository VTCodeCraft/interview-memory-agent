"use client";

import { useId, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, AudioLines, Check, ChevronRight, FileText, LoaderCircle, Target } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { LinkPending } from "@/components/ui/link-pending";
import { Select } from "@/components/ui/input";
import { ROUTES, routeTo } from "@/lib/utils/constants";
import { cn } from "@/lib/utils";
import type { Report } from "@/types";
import {
  ACTIVE_STATUS_LABEL,
  companyLabel,
  dateParts,
  levelLabel,
  typeLabel,
  type ActiveStatus,
  type DashboardProfile,
  type PendingReport,
} from "./dashboard-data";

/* ── Primitives ─────────────────────────────────────────────────────────── */

export function Panel({ className, children }: { className?: string; children: ReactNode }) {
  return <section className={cn("ds-surface rounded-card", className)}>{children}</section>;
}

function PanelHeader({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-line-subtle px-5 py-4 sm:px-6">
      <h2 className="text-subheading text-fg">{title}</h2>
      {action}
    </div>
  );
}

function TextLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex min-h-8 shrink-0 items-center gap-1 rounded-control text-small font-medium text-brand underline-offset-4 hover:text-brand-hover hover:underline focus-ring"
    >
      {children}
      <LinkPending idle={<ArrowRight strokeWidth={1.75} className="size-3.5" />} className="size-3.5" />
    </Link>
  );
}

/** "Oct 2, 2026" with only the digits in the data face. */
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

function Score({ value, size = "md" }: { value: number; size?: "md" | "lg" }) {
  return (
    <span className="inline-flex items-baseline gap-0.5 whitespace-nowrap">
      <span className={cn("font-data font-semibold tabular-nums text-fg", size === "lg" ? "text-metric-sm" : "text-body")}>
        {value}
      </span>
      <span className="font-data text-label text-fg-subtle tabular-nums">/100</span>
    </span>
  );
}

/* ── Header ─────────────────────────────────────────────────────────────── */

export function DashboardHeader({
  name,
  profile,
  active,
  hasReports,
}: {
  name: string | null;
  profile: DashboardProfile | null;
  active: { interviewId: string } | null;
  hasReports: boolean;
}) {
  const focus = [profile?.targetRole, ...(profile?.targetCompanies.slice(0, 2) ?? [])].filter(Boolean).join(" · ");

  return (
    <header className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0">
        <p className="text-small font-medium text-fg-muted">Interviews</p>
        <h1 className="ds-display mt-2 text-title text-balance text-fg">
          {name ? `Welcome back, ${name}` : "Welcome back"}
        </h1>
        <p className="mt-2 text-body text-fg-muted">
          {focus ? (
            <>
              Practicing for <span className="font-medium text-fg">{focus}</span>
            </>
          ) : (
            "Practice a voice interview and get a scored report."
          )}
        </p>
      </div>
      <div className="flex flex-col-reverse gap-3 sm:flex-row md:shrink-0">
        {hasReports && (
          <Link href={ROUTES.reports} className={buttonVariants({ variant: "secondary", size: "lg" })}>
            All reports
          </Link>
        )}
        <Link
          href={active ? routeTo.liveInterview(active.interviewId) : ROUTES.newInterview}
          className={buttonVariants({ variant: "primary", size: "lg" })}
        >
          {active ? "Resume interview" : "Start interview"}
          <ArrowRight aria-hidden strokeWidth={1.75} />
        </Link>
      </div>
    </header>
  );
}

/* ── Status banners (real interview and report states) ──────────────────── */

/** Unfinished interview (real status from /api/interview/active). */
export function ActiveInterviewBanner({ active }: { active: { interviewId: string; status: ActiveStatus } }) {
  return (
    <div role="status" className="flex items-start gap-3 rounded-card border border-memory-line bg-memory-soft p-4 sm:items-center sm:p-5">
      <span aria-hidden className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand text-on-brand">
        <AudioLines strokeWidth={1.75} className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-small font-semibold text-fg">You have an unfinished interview</p>
        <p className="text-small text-fg-muted">Resume it to pick up where you left off.</p>
      </div>
      <Badge tone="brand" className="shrink-0">
        {ACTIVE_STATUS_LABEL[active.status] ?? "In progress"}
      </Badge>
    </div>
  );
}

/* ── Summary (only real, report-derived numbers) ────────────────────────── */

export function SummaryStats({ reports }: { reports: Report[] }) {
  const scores = reports.map((report) => report.evaluation.overallScore);
  const average = Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
  const latest = scores[0];
  const change = scores.length > 1 ? scores[0] - scores[1] : null;

  return (
    <Panel>
      <dl className="grid grid-cols-1 divide-y divide-line-subtle sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        <Stat label="Reports">
          <span className="font-data text-metric-sm text-fg tabular-nums">{reports.length}</span>
        </Stat>
        <Stat label="Average score">
          <Score value={average} size="lg" />
        </Stat>
        <Stat
          label="Latest score"
          note={
            change === null ? null : (
              <span className={cn("font-data tabular-nums", change > 0 ? "text-success" : "text-fg-muted")}>
                {change > 0 ? `+${change}` : change < 0 ? `−${Math.abs(change)}` : "±0"}
                <span className="font-brand"> vs previous</span>
              </span>
            )
          }
        >
          <Score value={latest} size="lg" />
        </Stat>
      </dl>
    </Panel>
  );
}

function Stat({ label, note, children }: { label: string; note?: ReactNode; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-4 sm:block sm:px-6 sm:py-5">
      <dt className="text-small text-fg-muted">{label}</dt>
      <dd className="flex flex-col items-end gap-0.5 sm:mt-2 sm:items-start">
        {children}
        {note && <span className="text-label font-medium">{note}</span>}
      </dd>
    </div>
  );
}

/* ── Recent interviews (with client-side filters) ────────────────────────── */

const RECENT_LIMIT = 6;

/** Row statuses the loaded data can actually tell apart. */
type RowStatus = "ready" | "processing";

const STATUS_LABEL: Record<RowStatus, string> = {
  ready: "Report ready",
  processing: "Report processing",
};

const TYPE_ORDER = ["Technical", "Behavioral", "System design"];

interface HistoryRow {
  key: string;
  href: string;
  title: string;
  /** Display label; null when the data doesn't say (reports still processing). */
  type: string | null;
  level: string | null;
  status: RowStatus;
  date: string;
  score: number | null;
}

/** Finished reports (newest first) plus the report still being generated, if it isn't one of them. */
function toRows(reports: Report[], pending: PendingReport | null): HistoryRow[] {
  const rows: HistoryRow[] = reports.map((report) => {
    const context = report.interviewContext;
    return {
      key: report.id,
      href: routeTo.report(report.interviewId),
      title: [context?.role ?? "Interview", companyLabel(context?.company, context?.customCompanyName)].filter(Boolean).join(" · "),
      type: typeLabel(context?.interviewType),
      level: levelLabel(context?.difficulty),
      status: "ready",
      date: context?.endedAt ?? report.createdAt,
      score: report.evaluation.overallScore,
    };
  });
  if (pending && !reports.some((report) => report.interviewId === pending.interviewId)) {
    rows.unshift({
      key: `pending-${pending.interviewId}`,
      href: routeTo.report(pending.interviewId),
      title: [pending.role, pending.company].filter(Boolean).join(" · "),
      type: null,
      level: null,
      status: "processing",
      date: pending.createdAt,
      score: null,
    });
  }
  return rows;
}

/** Distinct values with counts, in a stable order. */
function tally<T extends string>(values: (T | null)[], order: readonly string[] = []) {
  const counts = new Map<T, number>();
  for (const value of values) if (value) counts.set(value, (counts.get(value) ?? 0) + 1);
  const rank = (value: string) => (order.includes(value) ? order.indexOf(value) : order.length);
  return [...counts.entries()].sort(([a], [b]) => rank(a) - rank(b));
}

export function RecentInterviews({ reports, pending }: { reports: Report[]; pending: PendingReport | null }) {
  const rows = useMemo(() => toRows(reports, pending), [reports, pending]);
  const [type, setType] = useState("all");
  const [status, setStatus] = useState("all");

  const types = tally(rows.map((row) => row.type), TYPE_ORDER);
  const statuses = tally(rows.map((row) => row.status), ["ready", "processing"]);
  const filtering = type !== "all" || status !== "all";
  const matches = rows.filter((row) => (type === "all" || row.type === type) && (status === "all" || row.status === status));
  const shown = matches.slice(0, RECENT_LIMIT);
  const reset = () => {
    setType("all");
    setStatus("all");
  };

  return (
    <Panel>
      <PanelHeader
        title="Recent interviews"
        action={reports.length > RECENT_LIMIT ? <TextLink href={ROUTES.reports}>All reports</TextLink> : undefined}
      />

      {rows.length > 1 && (
        <div
          role="group"
          aria-label="Filter interviews"
          className="flex flex-col gap-3 border-b border-line-subtle bg-canvas/60 px-5 py-3 sm:flex-row sm:items-center sm:px-6"
        >
          <div className="grid gap-2 sm:flex sm:gap-3">
            <FilterSelect
              label="Interview type"
              allLabel="All types"
              value={type}
              onChange={setType}
              options={types.map(([value, count]) => ({ value, label: `${value} (${count})` }))}
            />
            <FilterSelect
              label="Report status"
              allLabel="All statuses"
              value={status}
              onChange={setStatus}
              options={statuses.map(([value, count]) => ({ value, label: `${STATUS_LABEL[value as RowStatus]} (${count})` }))}
            />
          </div>
          <div className="flex min-h-8 items-center justify-between gap-3 sm:ml-auto">
            <p aria-live="polite" className="text-small text-fg-muted">
              {filtering && (
                <>
                  <span className="font-data tabular-nums text-fg">{matches.length}</span> of{" "}
                  <span className="font-data tabular-nums">{rows.length}</span>
                </>
              )}
            </p>
            {filtering && (
              <Button variant="ghost" size="sm" onClick={reset} className="-mr-2">
                Reset
              </Button>
            )}
          </div>
        </div>
      )}

      {shown.length > 0 ? (
        <ul className="divide-y divide-line-subtle">
          {shown.map((row) => (
            <li key={row.key}>
              <RowLink href={row.href}>
                <RowText
                  title={row.title}
                  meta={
                    <>
                      {[row.type, row.level].filter(Boolean).join(" · ")}
                      {(row.type || row.level) && " · "}
                      <DateText iso={row.date} />
                    </>
                  }
                />
                {row.status === "processing" || row.score === null ? (
                  <Badge tone="neutral" className="shrink-0">
                    <LoaderCircle aria-hidden strokeWidth={2} className="motion-safe:animate-spin" />
                    {STATUS_LABEL.processing}
                  </Badge>
                ) : (
                  <span className="flex shrink-0 items-center gap-4">
                    <span className="hidden w-24 sm:block" aria-hidden>
                      <span className="block h-1 overflow-hidden rounded-full bg-sunken">
                        <span className="block h-full rounded-full bg-brand" style={{ width: `${row.score}%` }} />
                      </span>
                    </span>
                    <Score value={row.score} />
                  </span>
                )}
              </RowLink>
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex flex-col items-center px-5 py-10 text-center sm:px-6">
          <p className="text-small font-semibold text-fg">No interviews match these filters</p>
          <p className="mt-1 text-small text-fg-muted">
            {type !== "all" && status === "processing"
              ? "Reports still being prepared don't have a type yet."
              : "Try another interview type or status."}
          </p>
          <Button variant="secondary" size="sm" onClick={reset} className="mt-4">
            Reset filters
          </Button>
        </div>
      )}
    </Panel>
  );
}

function FilterSelect({
  label,
  allLabel,
  value,
  onChange,
  options,
}: {
  label: string;
  allLabel: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  const id = useId();
  return (
    <div className="min-w-0">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <Select id={id} value={value} onChange={(event) => onChange(event.target.value)} className="h-9 text-small sm:w-48">
        <option value="all">{allLabel}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
    </div>
  );
}

function RowLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-4 px-5 py-4 transition-[background-color] duration-(--duration-fast) ease-standard hover:bg-sunken/60 focus-visible:bg-sunken/60 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus sm:px-6"
    >
      {children}
      {/* The report page has no loading.js (it keeps real 404s), so show the wait here. */}
      <LinkPending
        idle={
          <ChevronRight
            strokeWidth={1.75}
            className="size-4 text-fg-subtle transition-transform duration-(--duration-fast) ease-standard group-hover:translate-x-0.5"
          />
        }
      />
    </Link>
  );
}

function RowText({ title, meta }: { title: string; meta: ReactNode }) {
  return (
    <span className="min-w-0 flex-1">
      <span title={title} className="line-clamp-2 text-small font-semibold [overflow-wrap:anywhere] text-fg">
        {title}
      </span>
      <span className="mt-0.5 block text-small text-fg-muted">{meta}</span>
    </span>
  );
}

/* ── First-run state ────────────────────────────────────────────────────── */

const FIRST_STEPS = [
  { icon: Target, title: "Choose the interview", text: "Pick the type, company and level. Add a job description if you have one." },
  { icon: AudioLines, title: "Talk it through", text: "Answer out loud while a live transcript follows along." },
  { icon: FileText, title: "Get your report", text: "A scored report with strengths and focus areas appears here." },
];

export function FirstInterview({ hasActive }: { hasActive: boolean }) {
  return (
    <Panel className="px-5 py-8 sm:px-8 sm:py-10">
      <h2 className="ds-display text-heading text-fg">{hasActive ? "Finish your first interview" : "Start your first interview"}</h2>
      <p className="mt-2 max-w-[52ch] text-body text-fg-muted">
        {hasActive
          ? "Your first report will appear here once you finish the interview you started."
          : "You haven't finished an interview yet. Here's how a session works."}
      </p>
      <ol className="mt-8 grid gap-6 sm:grid-cols-3 sm:gap-5">
        {FIRST_STEPS.map((step, index) => (
          <li key={step.title} className="flex gap-3 sm:flex-col sm:gap-4">
            <span aria-hidden className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand ring-1 ring-memory-line ring-inset">
              <step.icon strokeWidth={1.75} className="size-4" />
            </span>
            <span>
              <span className="block text-small font-semibold text-fg">
                <span className="font-data text-fg-subtle tabular-nums">{index + 1}</span>
                <span className="text-fg-subtle"> · </span>
                {step.title}
              </span>
              <span className="mt-1 block text-small text-fg-muted">{step.text}</span>
            </span>
          </li>
        ))}
      </ol>
    </Panel>
  );
}

/* ── Side column ────────────────────────────────────────────────────────── */

export function LatestHighlights({ report }: { report: Report }) {
  const strengths = report.evaluation.strengths.slice(0, 3);
  const focus = report.evaluation.weaknesses.slice(0, 3);
  if (strengths.length === 0 && focus.length === 0) return null;

  return (
    <Panel>
      <PanelHeader title="From your latest report" action={<TextLink href={routeTo.report(report.interviewId)}>Open</TextLink>} />
      <div className="flex flex-col gap-5 px-5 py-5 sm:px-6">
        {strengths.length > 0 && (
          <HighlightList title="Strengths" items={strengths} icon={<Check strokeWidth={2} className="size-3.5" />} tone="success" />
        )}
        {focus.length > 0 && (
          <HighlightList title="Focus areas" items={focus} icon={<Target strokeWidth={2} className="size-3.5" />} tone="brand" />
        )}
      </div>
    </Panel>
  );
}

function HighlightList({ title, items, icon, tone }: { title: string; items: string[]; icon: ReactNode; tone: "success" | "brand" }) {
  return (
    <div>
      <h3 className="text-label font-semibold text-fg-muted">{title}</h3>
      <ul className="mt-2.5 flex flex-col gap-2">
        {items.map((item) => (
          <li key={item} className="flex gap-2.5 text-small text-fg">
            <span
              aria-hidden
              className={cn(
                "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full",
                tone === "success" ? "bg-success-soft text-success" : "bg-brand-soft text-brand",
              )}
            >
              {icon}
            </span>
            <span className="min-w-0">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function PracticeProfile({ profile }: { profile: DashboardProfile }) {
  const rows: { label: string; value: ReactNode; muted?: boolean }[] = [
    { label: "Target role", value: profile.targetRole || "Not set", muted: !profile.targetRole },
    { label: "Experience", value: profile.experience || "Not set", muted: !profile.experience },
    { label: "Level", value: levelLabel(profile.preferredDifficulty) || "Not set", muted: !profile.preferredDifficulty },
    {
      label: "Companies",
      value: profile.targetCompanies.join(", ") || "None selected",
      muted: profile.targetCompanies.length === 0,
    },
    {
      label: "Interview types",
      value: profile.interviewTypes.map((type) => typeLabel(type)).join(", ") || "None selected",
      muted: profile.interviewTypes.length === 0,
    },
    {
      label: "Resume",
      value: profile.resume ? (
        <span className="flex min-w-0 flex-col">
          <span className="truncate" title={profile.resume.fileName}>
            {profile.resume.fileName}
          </span>
          <span className="text-fg-muted">
            Saved <DateText iso={profile.resume.uploadedAt} />
          </span>
        </span>
      ) : (
        "Not uploaded"
      ),
      muted: !profile.resume,
    },
  ];

  return (
    <Panel>
      <PanelHeader title="Practice profile" action={<TextLink href={ROUTES.profile}>Edit</TextLink>} />
      <dl className="divide-y divide-line-subtle px-5 sm:px-6">
        {rows.map((row) => (
          <div key={row.label} className="grid grid-cols-[7.5rem_minmax(0,1fr)] gap-3 py-3">
            <dt className="text-small text-fg-muted">{row.label}</dt>
            <dd className={cn("min-w-0 text-small font-medium break-words", row.muted ? "text-fg-subtle" : "text-fg")}>{row.value}</dd>
          </div>
        ))}
      </dl>
    </Panel>
  );
}
