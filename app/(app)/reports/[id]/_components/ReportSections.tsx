import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, AudioLines, BookOpen, Check, CircleAlert, FileX, Lightbulb, LoaderCircle, Target } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { ROUTES, routeTo } from "@/lib/utils/constants";
import { cn } from "@/lib/utils";
import type { Report } from "@/types";
import { companyLabel, dateParts, levelLabel, typeLabel } from "@/app/(app)/interviews/_components/dashboard-data";
import { displayScore, meterWidth } from "@/app/(app)/reports/_components/reports-list";
import RefreshReportButton from "../RefreshReportButton";
import {
  categoryScores,
  feedbackSections,
  interviewTitle,
  overallScore,
  stateContent,
  type FeedbackKey,
  type PendingView,
} from "./report-view";

/* ── Frame (shared by the page, loading, not-found and error) ───────────── */

export function ReportFrame({ children }: { children: ReactNode }) {
  return (
    <div className="ds-page flex-1">
      <main className="ds-container pt-6 pb-16 sm:pt-8 lg:pt-10 lg:pb-24">
        <Link
          href={ROUTES.reports}
          className="-ml-1 inline-flex min-h-8 items-center gap-1.5 rounded-control px-1 text-small font-medium text-fg-muted transition-colors duration-(--duration-fast) ease-standard hover:text-fg focus-ring"
        >
          <ArrowLeft aria-hidden strokeWidth={1.75} className="size-4" />
          All reports
        </Link>
        {children}
      </main>
    </div>
  );
}

/* ── Small pieces ───────────────────────────────────────────────────────── */

/** "Oct 2, 2026" with only the digits in the data face (as on the dashboard and list). */
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

/** Thin score bar; decorative, the number next to it carries the value. */
function Meter({ score, className }: { score: number; className?: string }) {
  return (
    <span aria-hidden className={cn("block overflow-hidden rounded-full bg-sunken", className)}>
      <span className="block h-full rounded-full bg-brand" style={{ width: `${meterWidth(score)}%` }} />
    </span>
  );
}

/* ── A finished report ──────────────────────────────────────────────────── */

export function ReadyReport({ report }: { report: Report }) {
  const context = report.interviewContext;
  const meta = [
    companyLabel(context?.company, context?.customCompanyName),
    typeLabel(context?.interviewType),
    levelLabel(context?.difficulty),
  ].filter(Boolean);
  const date = context?.endedAt ?? report.createdAt;

  return (
    <div className="mt-6 flex flex-col gap-8 lg:mt-8">
      <header className="max-w-[48rem]">
        <p className="text-small font-medium text-fg-muted">Interview report</p>
        <h1 className="ds-display mt-2 text-title text-balance [overflow-wrap:anywhere] text-fg">{context?.role || "Interview"}</h1>
        <p className="mt-2 text-body text-fg-muted">
          {meta.join(" · ")}
          {meta.length > 0 && " · "}
          <DateText iso={date} />
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-4">
          <ScorePanel report={report} />
        </div>
        <div className="min-w-0 lg:col-span-8">
          <FeedbackPanel report={report} />
        </div>
      </div>
    </div>
  );
}

function ScorePanel({ report }: { report: Report }) {
  const overall = overallScore(report.evaluation);
  const categories = categoryScores(report.evaluation);

  return (
    <section
      aria-labelledby="score-title"
      className="ds-surface rounded-card lg:sticky lg:top-[calc(var(--spacing-nav)+1.5rem)]"
    >
      <div className="px-5 py-5 sm:px-6 sm:py-6">
        <h2 id="score-title" className="text-small font-medium text-fg-muted">
          Overall score
        </h2>
        {overall !== null ? (
          <>
            <p className="mt-2 flex items-baseline gap-1">
              <span className="font-data text-metric font-semibold tabular-nums text-fg">{displayScore(overall)}</span>
              <span aria-hidden className="font-data text-body text-fg-subtle tabular-nums">
                /100
              </span>
              <span className="sr-only"> out of 100</span>
            </p>
            <Meter score={overall} className="mt-4 h-1.5" />
          </>
        ) : (
          <p className="mt-2 text-body text-fg-muted">This report has no overall score.</p>
        )}
        <p className="mt-4 text-small text-fg-muted">Scored by an AI evaluator from your answers in this interview.</p>
      </div>

      {categories.length > 0 && (
        <div className="border-t border-line-subtle px-5 py-5 sm:px-6">
          <h3 className="text-label font-semibold text-fg-muted">Score breakdown</h3>
          {/* Two or three columns while the panel is full width; one in the desktop sidebar. */}
          <ul role="list" className="mt-3 grid gap-x-6 gap-y-3.5 min-[360px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-1">
            {categories.map((category) => (
              <li key={category.key}>
                <span className="flex items-baseline justify-between gap-3 text-small">
                  <span className="text-fg">{category.label}</span>
                  <span className="font-data font-semibold tabular-nums text-fg">
                    {displayScore(category.score)}
                    <span className="sr-only"> out of 100</span>
                  </span>
                </span>
                <Meter score={category.score} className="mt-1.5 h-1" />
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

const SECTION_ICON: Record<FeedbackKey, { icon: ReactNode; tone: string }> = {
  strengths: { icon: <Check strokeWidth={2} className="size-3.5" />, tone: "bg-success-soft text-success" },
  weaknesses: { icon: <Target strokeWidth={2} className="size-3.5" />, tone: "bg-brand-soft text-brand" },
  recommendations: { icon: <Lightbulb strokeWidth={2} className="size-3.5" />, tone: "bg-sunken text-fg-muted" },
  missingTopics: { icon: <BookOpen strokeWidth={2} className="size-3.5" />, tone: "bg-sunken text-fg-muted" },
};

function FeedbackPanel({ report }: { report: Report }) {
  const sections = feedbackSections(report.evaluation);

  return (
    <section aria-labelledby="feedback-title" className="ds-surface rounded-card">
      <div className="border-b border-line-subtle px-5 py-4 sm:px-6">
        <h2 id="feedback-title" className="text-subheading text-fg">
          Feedback
        </h2>
      </div>

      {sections.length === 0 ? (
        <p className="px-5 py-8 text-small text-fg-muted sm:px-6">This report doesn&apos;t include written feedback.</p>
      ) : (
        <div className="divide-y divide-line-subtle">
          {sections.map((section) => (
            <section key={section.key} aria-labelledby={`feedback-${section.key}`} className="px-5 py-5 sm:px-6 sm:py-6">
              <h3 id={`feedback-${section.key}`} className="flex items-center gap-2.5 text-subheading text-fg">
                <span
                  aria-hidden
                  className={cn("flex size-6 shrink-0 items-center justify-center rounded-full", SECTION_ICON[section.key].tone)}
                >
                  {SECTION_ICON[section.key].icon}
                </span>
                {section.title}
              </h3>

              {section.key === "missingTopics" ? (
                <ul role="list" className="mt-3.5 flex flex-wrap gap-2">
                  {section.items.map((item, index) => (
                    <li key={index} className="min-w-0">
                      <Badge tone="neutral" className="h-auto min-h-6 whitespace-normal py-0.5 text-small [overflow-wrap:anywhere]">
                        {item}
                      </Badge>
                    </li>
                  ))}
                </ul>
              ) : section.key === "recommendations" ? (
                <ol className="mt-3.5 flex max-w-[68ch] flex-col gap-3">
                  {section.items.map((item, index) => (
                    <li key={index} className="flex gap-3 text-body text-fg">
                      <span aria-hidden className="w-5 shrink-0 pt-px text-right font-data text-small text-fg-subtle tabular-nums">
                        {index + 1}
                      </span>
                      <span className="min-w-0 [overflow-wrap:anywhere]">{item}</span>
                    </li>
                  ))}
                </ol>
              ) : (
                <ul role="list" className="mt-3.5 flex max-w-[68ch] flex-col gap-2.5">
                  {section.items.map((item, index) => (
                    <li key={index} className="flex gap-3 text-body text-fg">
                      <span
                        aria-hidden
                        className={cn(
                          "mt-[0.6rem] size-1.5 shrink-0 rounded-full",
                          section.key === "strengths" ? "bg-success" : "bg-brand",
                        )}
                      />
                      <span className="min-w-0 [overflow-wrap:anywhere]">{item}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>
      )}
    </section>
  );
}

/* ── States without a report ────────────────────────────────────────────── */

type Tone = "brand" | "danger" | "neutral";

const TONE: Record<Tone, string> = {
  brand: "bg-brand-soft text-brand ring-memory-line",
  danger: "bg-danger-soft text-danger ring-danger-line",
  neutral: "bg-sunken text-fg-muted ring-line",
};

/** Centred message for every state that has no report to show. */
export function StatePanel({
  icon,
  tone,
  title,
  heading,
  body,
  actions,
  role,
}: {
  icon: ReactNode;
  tone: Tone;
  title?: string;
  heading: string;
  body: string;
  actions: ReactNode;
  /** "alert" for failures that replace the page, so they are announced. */
  role?: "alert";
}) {
  return (
    <section
      role={role}
      className="ds-surface mx-auto mt-6 flex w-full max-w-[36rem] flex-col items-center rounded-card px-6 py-10 text-center sm:px-10 sm:py-12 lg:mt-8">
      <span aria-hidden className={cn("flex size-12 items-center justify-center rounded-full ring-1 ring-inset", TONE[tone])}>
        {icon}
      </span>
      {title && <p className="mt-5 max-w-full text-small font-medium [overflow-wrap:anywhere] text-fg-muted">{title}</p>}
      <h1 className={cn("ds-display text-heading text-balance text-fg", title ? "mt-1" : "mt-5")}>{heading}</h1>
      <p className="mt-2 text-body text-fg-muted">{body}</p>
      <div className="mt-8 flex w-full flex-col-reverse gap-3 sm:w-auto sm:flex-row">{actions}</div>
    </section>
  );
}

const ICON_CLASS = "size-6";

export function PendingReport({ view }: { view: PendingView }) {
  const content = stateContent(view);
  const icon =
    view.state === "processing" ? (
      <LoaderCircle strokeWidth={1.75} className={cn(ICON_CLASS, "motion-safe:animate-spin")} />
    ) : view.state === "failed" ? (
      <CircleAlert strokeWidth={1.75} className={ICON_CLASS} />
    ) : view.state === "in_progress" ? (
      <AudioLines strokeWidth={1.75} className={ICON_CLASS} />
    ) : (
      <FileX strokeWidth={1.75} className={ICON_CLASS} />
    );
  const tone: Tone = view.state === "failed" ? "danger" : view.state === "unavailable" ? "neutral" : "brand";

  return (
    <StatePanel
      icon={icon}
      tone={tone}
      title={interviewTitle(view.interview)}
      heading={content.heading}
      body={content.body}
      actions={
        <>
          <Link href={ROUTES.interviews} className={buttonVariants({ variant: "secondary" })}>
            Go to dashboard
          </Link>
          {content.action === "check-again" && <RefreshReportButton />}
          {content.action === "resume" && (
            <Link href={routeTo.liveInterview(view.interview.interviewId)} className={buttonVariants({ variant: "primary" })}>
              Resume interview
              <ArrowRight aria-hidden strokeWidth={1.75} />
            </Link>
          )}
          {content.action === "start" && (
            <Link href={ROUTES.newInterview} className={buttonVariants({ variant: "primary" })}>
              Start an interview
              <ArrowRight aria-hidden strokeWidth={1.75} />
            </Link>
          )}
        </>
      }
    />
  );
}
