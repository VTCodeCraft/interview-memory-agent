"use client";

import { useId, useState, type ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, Check, FileText, Lightbulb, RotateCcw, Sparkles, Target } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/feedback";
import { ROUTES, routeTo } from "@/lib/utils/constants";
import { cn } from "@/lib/utils";
import type { Report } from "@/types";
import { dateParts } from "@/app/(app)/interviews/_components/dashboard-data";
import type { PendingReport } from "@/app/(app)/interviews/_components/dashboard-data";
import { reportSpan, themeGroups, type ThemeItem, type ThemeKey } from "./memory-themes";

/** Items shown per group before "Show all". */
const VISIBLE_ITEMS = 5;

/* ── Small pieces ───────────────────────────────────────────────────────── */

/** "Oct 2, 2026" with only the digits in the data face (as on the reports pages). */
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

function Panel({ className, children, ...props }: React.HTMLAttributes<HTMLElement>) {
  return (
    <section className={cn("ds-surface rounded-card", className)} {...props}>
      {children}
    </section>
  );
}

/* ── Header ─────────────────────────────────────────────────────────────── */

export function MemoryHeader() {
  return (
    <header className="max-w-[46rem]">
      <p className="text-small font-medium text-fg-muted">Memory</p>
      <h1 className="ds-display mt-2 text-title text-balance text-fg">Interview memory</h1>
      <p className="mt-2 text-body text-fg-muted">
        When memory is available, Clutchly saves a summary of each finished report and uses it to choose which topics to
        focus on in your next interviews.
      </p>
    </header>
  );
}

/* ── How memory works (claims limited to what the code does) ────────────── */

const STEPS: { icon: ReactNode; title: string; text: ReactNode }[] = [
  {
    icon: <FileText strokeWidth={1.75} className="size-4" />,
    title: "Saved after each report",
    text: "When a report is ready, a summary of its scores, strengths, focus areas, missed topics and recommendations is saved to your memory.",
  },
  {
    icon: <Sparkles strokeWidth={1.75} className="size-4" />,
    title: "Used for your next questions",
    text: "When questions are prepared for a new interview, whatever memory is recalled steers them toward recurring weak spots and topics you missed.",
  },
  {
    icon: <RotateCcw strokeWidth={1.75} className="size-4" />,
    title: "Yours to reset",
    text: (
      <>
        Reset it from your{" "}
        <Link href={ROUTES.profile} className="rounded-control font-medium text-brand underline-offset-4 hover:underline focus-ring">
          profile
        </Link>{" "}
        at any time. Your reports aren&apos;t deleted.
      </>
    ),
  },
];

export function HowMemoryWorks() {
  return (
    <Panel aria-labelledby="how-title" className="px-5 py-5 sm:px-6 sm:py-6">
      <h2 id="how-title" className="text-subheading text-fg">
        How memory works
      </h2>
      <ol className="mt-4 flex flex-col gap-4">
        {STEPS.map((step) => (
          <li key={step.title} className="flex gap-3">
            <span aria-hidden className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand ring-1 ring-memory-line ring-inset">
              {step.icon}
            </span>
            <span className="min-w-0">
              <span className="block text-small font-semibold text-fg">{step.title}</span>
              <span className="mt-0.5 block text-small text-fg-muted">{step.text}</span>
            </span>
          </li>
        ))}
      </ol>
      <p className="mt-5 border-t border-line-subtle pt-4 text-label text-fg-subtle">
        Saving and recall can fail without notice, for example if the memory service is unavailable. Interviews and reports
        still work, just without this personalization, and Clutchly can&apos;t yet show whether a report was saved.
      </p>
    </Panel>
  );
}

/* ── What memory is built from ──────────────────────────────────────────── */

const GROUP_STYLE: Record<ThemeKey, { icon: ReactNode; tone: string; dot: string }> = {
  weaknesses: { icon: <Target strokeWidth={2} className="size-3.5" />, tone: "bg-brand-soft text-brand", dot: "bg-brand" },
  missingTopics: { icon: <BookOpen strokeWidth={2} className="size-3.5" />, tone: "bg-sunken text-fg-muted", dot: "bg-fg-subtle" },
  recommendations: { icon: <Lightbulb strokeWidth={2} className="size-3.5" />, tone: "bg-sunken text-fg-muted", dot: "bg-fg-subtle" },
  strengths: { icon: <Check strokeWidth={2} className="size-3.5" />, tone: "bg-success-soft text-success", dot: "bg-success" },
};

export function MemorySources({ reports, pending }: { reports: Report[]; pending: PendingReport | null }) {
  const groups = themeGroups(reports);
  const span = reportSpan(reports);
  const processing = pending && !reports.some((report) => report.interviewId === pending.interviewId);

  return (
    <Panel aria-labelledby="sources-title">
      <div className="border-b border-line-subtle px-5 py-4 sm:px-6">
        <h2 id="sources-title" className="text-subheading text-fg">
          From your reports
        </h2>
        <p className="mt-1 text-small text-fg-muted">
          Taken from{" "}
          {span ? (
            <>
              <span className="font-data tabular-nums text-fg">{span.count}</span> finished {span.count === 1 ? "report" : "reports"}
              {span.count > 1 && (
                <>
                  {" "}
                  (<DateText iso={span.first} /> – <DateText iso={span.last} />)
                </>
              )}
            </>
          ) : (
            "your finished reports"
          )}
          , not from the saved memory, which can&apos;t be shown here. Memory is built from these same details, but it won&apos;t
          include them if saving failed or after you reset it.
        </p>
        {span && span.count > 1 && (
          <p className="mt-2 text-small text-fg-muted">
            Items worded the same way in more than one report are listed first. Similar points with different wording are
            listed separately.
          </p>
        )}
        {processing && (
          <p className="mt-2 text-small text-fg-muted">
            One more report is still being prepared and isn&apos;t included yet.{" "}
            <Link href={routeTo.report(pending.interviewId)} className="rounded-control font-medium text-brand underline-offset-4 hover:underline focus-ring">
              View its status
            </Link>
          </p>
        )}
      </div>

      {groups.length === 0 ? (
        <p className="px-5 py-8 text-small text-fg-muted sm:px-6">Your reports don&apos;t include any written feedback yet.</p>
      ) : (
        <div className="grid divide-y divide-line-subtle md:grid-cols-2 md:divide-y-0">
          {groups.map((group, index) => (
            <ThemeGroup
              key={group.key}
              groupKey={group.key}
              title={group.title}
              items={group.items}
              className={cn(
                // Hairlines between cells in the two-column grid.
                index % 2 === 1 && "md:border-l md:border-line-subtle",
                index >= 2 && "md:border-t md:border-line-subtle",
              )}
            />
          ))}
        </div>
      )}
    </Panel>
  );
}

function ThemeGroup({ groupKey, title, items, className }: { groupKey: ThemeKey; title: string; items: ThemeItem[]; className?: string }) {
  const [expanded, setExpanded] = useState(false);
  const listId = useId();
  const style = GROUP_STYLE[groupKey];
  const shown = expanded ? items : items.slice(0, VISIBLE_ITEMS);
  const hidden = items.length - VISIBLE_ITEMS;

  return (
    <section aria-labelledby={`${listId}-title`} className={cn("min-w-0 px-5 py-5 sm:px-6 sm:py-6", className)}>
      <h3 id={`${listId}-title`} className="flex items-center gap-2.5 text-subheading text-fg">
        <span aria-hidden className={cn("flex size-6 shrink-0 items-center justify-center rounded-full", style.tone)}>
          {style.icon}
        </span>
        {title}
        <span aria-hidden className="font-data text-small font-normal text-fg-subtle tabular-nums">
          {items.length}
        </span>
        <span className="sr-only">
          , {items.length} {items.length === 1 ? "item" : "items"}
        </span>
      </h3>
      <ul id={listId} role="list" className="mt-3.5 flex flex-col gap-2.5">
        {shown.map((item) => (
          <li key={item.text} className="flex gap-3 text-small text-fg">
            <span aria-hidden className={cn("mt-[0.45rem] size-1.5 shrink-0 rounded-full", style.dot)} />
            <span className="min-w-0 [overflow-wrap:anywhere]">
              {item.text}
              {item.reports > 1 && (
                <span className="ml-1.5 whitespace-nowrap text-label text-fg-subtle">
                  · in <span className="font-data tabular-nums">{item.reports}</span> reports
                </span>
              )}
            </span>
          </li>
        ))}
      </ul>
      {hidden > 0 && (
        <Button
          variant="ghost"
          size="sm"
          aria-expanded={expanded}
          aria-controls={listId}
          onClick={() => setExpanded((open) => !open)}
          className="-ml-2 mt-3"
        >
          {expanded ? "Show fewer" : `Show all ${items.length}`}
        </Button>
      )}
    </section>
  );
}

/* ── Empty and loading ──────────────────────────────────────────────────── */

export function NoMemoryYet({ pending }: { pending: PendingReport | null }) {
  return (
    <Panel className="px-5 py-8 sm:px-8 sm:py-10">
      <span aria-hidden className="flex size-10 items-center justify-center rounded-full bg-brand-soft text-brand ring-1 ring-memory-line ring-inset">
        <Sparkles strokeWidth={1.75} className="size-5" />
      </span>
      <h2 className="ds-display mt-5 text-heading text-fg">{pending ? "Your first report is being prepared" : "No reports yet"}</h2>
      <p className="mt-2 max-w-[52ch] text-body text-fg-muted">
        {pending
          ? "Memory is built from finished reports, so it can start once that report is ready."
          : "Memory is built from finished reports, so it can start after your first interview report is ready."}
      </p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        {pending ? (
          <Link href={routeTo.report(pending.interviewId)} className={buttonVariants({ variant: "primary" })}>
            View report status
            <ArrowRight aria-hidden strokeWidth={1.75} />
          </Link>
        ) : (
          <Link href={ROUTES.newInterview} className={buttonVariants({ variant: "primary" })}>
            Start interview
            <ArrowRight aria-hidden strokeWidth={1.75} />
          </Link>
        )}
        <Link href={ROUTES.interviews} className={buttonVariants({ variant: "secondary" })}>
          Go to dashboard
        </Link>
      </div>
    </Panel>
  );
}

export function MemorySkeleton() {
  return (
    <div role="status" aria-live="polite" className="ds-surface rounded-card">
      <span className="sr-only">Loading your report details</span>
      <div className="flex flex-col gap-2 border-b border-line-subtle px-5 py-4 sm:px-6">
        <Skeleton className="h-5 w-56 max-w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      <div className="grid gap-6 px-5 py-5 sm:px-6 md:grid-cols-2">
        {[0, 1, 2, 3].map((key) => (
          <div key={key} className="flex flex-col gap-2.5">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
          </div>
        ))}
      </div>
    </div>
  );
}
