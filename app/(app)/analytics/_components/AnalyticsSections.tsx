"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, BarChart3 } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/feedback";
import { ROUTES } from "@/lib/utils/constants";
import { cn } from "@/lib/utils";
import { useSettingsStore } from "@/store/useSettingsStore";
import { displayScore, meterWidth } from "@/app/(app)/reports/_components/reports-list";
import { categoryAverages, scoreStats, weeklyCounts, type AnalyticsRow, type TypeGroup } from "./analytics-data";
import { DateText, ScoreTrend, WeeklyColumns } from "./Charts";

function Panel({ className, children, ...props }: React.HTMLAttributes<HTMLElement>) {
  return (
    <section className={cn("ds-surface rounded-card", className)} {...props}>
      {children}
    </section>
  );
}

const plural = (count: number, one: string, many = `${one}s`) => `${count} ${count === 1 ? one : many}`;

/* ── Header ─────────────────────────────────────────────────────────────── */

export function AnalyticsHeader({ rows, pendingCount }: { rows: AnalyticsRow[] | null; pendingCount: number }) {
  const dates = rows?.map((row) => row.date).filter((iso) => !Number.isNaN(Date.parse(iso))).sort() ?? [];
  return (
    <header className="max-w-[46rem]">
      <p className="text-small font-medium text-fg-muted">Analytics</p>
      <h1 className="ds-display mt-2 text-title text-balance text-fg">Your progress</h1>
      <p className="mt-2 text-body text-fg-muted">
        Scores from your finished interview reports, grouped by interview type so each type is only compared with itself.
      </p>
      {rows && rows.length > 0 && (
        <p className="mt-3 text-small text-fg-muted">
          Based on <span className="font-data text-fg">{rows.length}</span> finished {rows.length === 1 ? "interview" : "interviews"}
          {dates.length > 1 && (
            <>
              , <DateText iso={dates[0]} /> to <DateText iso={dates[dates.length - 1]} />
            </>
          )}
          .{pendingCount > 0 && " One more report is still being prepared and isn't included yet."}
        </p>
      )}
    </header>
  );
}

/* ── One interview type ─────────────────────────────────────────────────── */

function Stat({ label, value, note }: { label: string; value: ReactNode; note?: ReactNode }) {
  return (
    <div className="min-w-0 px-5 py-4 sm:px-6">
      <dt className="text-small text-fg-muted">{label}</dt>
      <dd className="mt-1.5">
        <span className="font-data text-metric-sm text-fg">{value}</span>
        {note && <span className="mt-0.5 block text-label text-fg-subtle">{note}</span>}
      </dd>
    </div>
  );
}

function signed(points: number) {
  const value = Math.round(points);
  return value > 0 ? `+${value}` : value < 0 ? `−${Math.abs(value)}` : "±0";
}

export function TypeSection({ group }: { group: TypeGroup }) {
  const title = group.type ?? "Type not recorded";
  const stats = scoreStats(group.rows);
  const categories = categoryAverages(group.rows);
  // One sample size for the heading when every category has it; otherwise each row shows its own.
  const sameCount = categories.every((category) => category.count === categories[0]?.count) ? (categories[0]?.count ?? null) : null;
  const trend = group.rows.flatMap((row) => (row.overall !== null ? [{ date: row.date, score: row.overall, level: row.level, title: row.title }] : []));
  const reportsHref = group.type ? `${ROUTES.reports}?type=${encodeURIComponent(group.type)}` : ROUTES.reports;
  // ids are space-separated lists in aria-labelledby, so the title can't be used as is.
  const headingId = `type-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

  return (
    <Panel aria-labelledby={headingId}>
      <div className="flex flex-col gap-2 border-b border-line-subtle px-5 py-4 sm:flex-row sm:items-start sm:justify-between sm:px-6">
        <div className="min-w-0">
          <h2 id={headingId} className="text-subheading text-fg">
            {title}
          </h2>
          <p className="mt-0.5 text-small text-fg-muted">
            {plural(group.rows.length, "interview")}
            {group.rows.length > 1 && (
              <>
                {" · "}
                <DateText iso={group.first} /> – <DateText iso={group.last} />
              </>
            )}
          </p>
          {group.levels.length > 1 && (
            <p className="mt-1 text-small text-fg-muted">
              {`Includes ${group.levels.join(", ")} interviews, so scores aren't all at the same level.`}
            </p>
          )}
        </div>
        <Link
          href={reportsHref}
          className="inline-flex min-h-8 shrink-0 items-center gap-1 rounded-control text-small font-medium text-brand underline-offset-4 hover:text-brand-hover hover:underline focus-ring"
        >
          {/* A missing type can't be filtered on, so that link opens the full list. */}
          {group.type ? "View reports" : "View all reports"}
          <ArrowRight aria-hidden strokeWidth={1.75} className="size-3.5" />
        </Link>
      </div>

      {!stats ? (
        <p className="px-5 py-6 text-small text-fg-muted sm:px-6">These reports don&apos;t have an overall score.</p>
      ) : (
        <>
          {/* Hairlines: 2 x 2 on small screens, one row of 4 from sm. */}
          <dl className="grid grid-cols-2 border-b border-line-subtle sm:grid-cols-4 [&>*]:border-line-subtle [&>*:nth-child(even)]:border-l [&>*:nth-child(n+3)]:border-t sm:[&>*:nth-child(n+2)]:border-l sm:[&>*:nth-child(n+3)]:border-t-0">
            <Stat label={stats.count === 1 ? "Score" : "Latest"} value={displayScore(stats.latest)} note="out of 100" />
            <Stat
              label="Average"
              value={stats.average === null ? "—" : displayScore(stats.average)}
              note={stats.average === null ? "Needs 2 interviews" : `of ${plural(stats.count, "interview")}`}
            />
            <Stat label="Best" value={stats.best === null ? "—" : displayScore(stats.best)} note={stats.best === null ? "Needs 2 interviews" : `of ${plural(stats.count, "interview")}`} />
            <Stat
              label="Latest vs first"
              value={stats.change === null ? "—" : signed(stats.change)}
              note={stats.change === null ? "Needs 2 interviews" : "points"}
            />
          </dl>
          {stats.unscored > 0 && (
            <p className="border-b border-line-subtle px-5 py-2.5 text-label text-fg-subtle sm:px-6">
              {plural(stats.unscored, "report")} without an overall score {stats.unscored === 1 ? "isn't" : "aren't"} included.
            </p>
          )}

          <div className="grid gap-6 px-5 py-5 sm:px-6 sm:py-6 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] md:gap-8">
            {trend.length >= 2 ? (
              <ScoreTrend points={trend} />
            ) : (
              <div>
                <p className="text-label font-semibold text-fg-muted">Overall score, oldest to newest</p>
                <p className="mt-3 text-small text-fg-muted">A trend needs at least two scored {title === "Type not recorded" ? "" : `${title.toLowerCase()} `}interviews.</p>
              </div>
            )}
            {categories.length > 0 && (
              <div className="min-w-0">
                <h3 className="text-label font-semibold text-fg-muted">
                  Category averages
                  {sameCount !== null && <span className="font-normal text-fg-subtle"> · {plural(sameCount, "interview")}</span>}
                </h3>
                <ul role="list" className="mt-3 flex flex-col gap-3">
                  {categories.map((category) => (
                    <li key={category.key}>
                      <span className="flex items-baseline justify-between gap-3 text-small">
                        <span className="text-fg">
                          {category.label}
                          {sameCount === null && (
                            <span aria-hidden className="ml-1.5 text-label text-fg-subtle">
                              {plural(category.count, "interview")}
                            </span>
                          )}
                        </span>
                        <span className="font-data font-semibold text-fg">
                          {displayScore(category.average)}
                          <span className="sr-only"> out of 100, average of {plural(category.count, "interview")}</span>
                        </span>
                      </span>
                      <span aria-hidden className="mt-1.5 block h-1 overflow-hidden rounded-full bg-sunken">
                        <span className="block h-full rounded-full bg-brand" style={{ width: `${meterWidth(category.average)}%` }} />
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-label text-fg-subtle">
                  Every category is rated in every interview, whatever its type, so some may matter less for {title === "Type not recorded" ? "these" : title.toLowerCase()} interviews.
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </Panel>
  );
}

/* ── Activity (all types; counts only, no scores) ───────────────────────── */

export function ActivityPanel({ rows }: { rows: AnalyticsRow[] }) {
  const storedGoal = useSettingsStore((state) => state.weeklyGoal);
  const goal = Number.isFinite(storedGoal) && storedGoal >= 1 ? Math.round(storedGoal) : null;
  const weeks = weeklyCounts(rows.map((row) => row.date), new Date());
  const thisWeek = weeks[weeks.length - 1].count;
  const anyRecent = weeks.some((week) => week.count > 0);

  return (
    <Panel aria-labelledby="activity-title" className="px-5 py-5 sm:px-6 sm:py-6">
      <h2 id="activity-title" className="text-subheading text-fg">
        Activity
      </h2>
      <p className="mt-1 text-small text-fg-muted">Finished interviews, counted by the week they ended (Monday to Sunday, your time).</p>

      <div className="mt-5">
        <p className="text-small text-fg-muted">This week</p>
        <p className="mt-1 flex items-baseline gap-1.5">
          <span className="font-data text-metric-sm text-fg">{thisWeek}</span>
          {goal !== null && (
            <span className="text-small text-fg-muted">
              of a weekly goal of <span className="font-data text-fg">{goal}</span>
            </span>
          )}
        </p>
        {goal !== null && (
          <>
            <span aria-hidden className="mt-2.5 block h-1.5 overflow-hidden rounded-full bg-brand-tint">
              <span className="block h-full rounded-full bg-brand" style={{ width: `${Math.min(100, (thisWeek / goal) * 100)}%` }} />
            </span>
            <p className="mt-2 text-label text-fg-subtle">
              The goal is a setting in your{" "}
              <Link href={ROUTES.profile} className="rounded-control font-medium text-brand underline-offset-4 hover:underline focus-ring">
                profile
              </Link>
              , saved in this browser only.
              {/* 3 is the store's default, so it may never have been chosen. */}
              {goal === 3 && " It's 3 unless you've changed it."}
            </p>
          </>
        )}
      </div>

      <div className="mt-6 border-t border-line-subtle pt-5">
        {anyRecent ? (
          <WeeklyColumns weeks={weeks} />
        ) : (
          <p className="text-small text-fg-muted">No finished interviews in the last {weeks.length} weeks.</p>
        )}
      </div>
    </Panel>
  );
}

/* ── How these numbers work ─────────────────────────────────────────────── */

const NOTES = [
  "Scores are the 0 to 100 ratings in each finished report, from the AI evaluator.",
  "Each interview type is shown on its own. Scores from different types aren't averaged together.",
  "Averages, best scores and changes need at least two scored interviews of that type.",
  "Not tracked here: interviews you started or cancelled, and how long interviews took.",
];

export function AboutAnalytics() {
  return (
    <Panel aria-labelledby="about-title" className="px-5 py-5 sm:px-6 sm:py-6">
      <h2 id="about-title" className="text-subheading text-fg">
        How these numbers work
      </h2>
      <ul role="list" className="mt-3 flex flex-col gap-2.5">
        {NOTES.map((note) => (
          <li key={note} className="flex gap-3 text-small text-fg-muted">
            <span aria-hidden className="mt-[0.45rem] size-1.5 shrink-0 rounded-full bg-fg-subtle" />
            <span>{note}</span>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

/* ── Empty and loading ──────────────────────────────────────────────────── */

export function NoAnalytics({ pending }: { pending: boolean }) {
  return (
    <Panel className="px-5 py-8 sm:px-8 sm:py-10">
      <span aria-hidden className="flex size-10 items-center justify-center rounded-full bg-brand-soft text-brand ring-1 ring-memory-line ring-inset">
        <BarChart3 strokeWidth={1.75} className="size-5" />
      </span>
      <h2 className="ds-display mt-5 text-heading text-fg">{pending ? "Your first report is being prepared" : "No analytics yet"}</h2>
      <p className="mt-2 max-w-[52ch] text-body text-fg-muted">
        Analytics uses the scores in your finished reports.{" "}
        {pending ? "Your first one will appear here once it's ready." : "Finish an interview to see your first score here."}
      </p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Link href={pending ? ROUTES.reports : ROUTES.newInterview} className={buttonVariants({ variant: "primary" })}>
          {pending ? "View reports" : "Start interview"}
          <ArrowRight aria-hidden strokeWidth={1.75} />
        </Link>
        <Link href={ROUTES.interviews} className={buttonVariants({ variant: "secondary" })}>
          Go to dashboard
        </Link>
      </div>
    </Panel>
  );
}

export function AnalyticsSkeleton() {
  return (
    <div role="status" aria-live="polite" className="flex flex-col gap-6">
      <span className="sr-only">Loading your analytics</span>
      {[0, 1].map((key) => (
        <div key={key} className="ds-surface rounded-card">
          <div className="flex flex-col gap-2 border-b border-line-subtle px-5 py-4 sm:px-6">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-48 max-w-full" />
          </div>
          <div className="grid grid-cols-2 gap-4 border-b border-line-subtle px-5 py-4 sm:grid-cols-4 sm:px-6">
            {[0, 1, 2, 3].map((stat) => (
              <div key={stat} className="flex flex-col gap-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-7 w-12" />
              </div>
            ))}
          </div>
          <div className="px-5 py-5 sm:px-6">
            <Skeleton className="h-36 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}
