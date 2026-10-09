import Image from "next/image";
import { ArrowDown, ArrowRight, CalendarDays, Clock, FileText, Mic, Square, Star, Trophy } from "lucide-react";

import { cn } from "@/lib/utils";
import { ENGINE, HOW, HOW_NOTE, INTERVIEW, PROVIDE, REPORT } from "./data";
import { IconTile, NoteBox, Panel, StatusPill, toneIcon, Waveform } from "./primitives";

// In the desktop arrangement (68rem) the diagram matches the artwork's scale, so text is a step smaller there.
const TITLE_SM = "text-small font-semibold text-fg @min-[68rem]:text-[0.78125rem]";
const DESC = "text-label font-normal text-fg-muted @min-[68rem]:text-[0.6875rem] @min-[68rem]:leading-[1.45]";
// Button icons only where the interview column is wide enough to keep the controls on one line.
const CONTROL_ICON = "hidden size-3.5 text-fg-muted @4xl:block @min-[68rem]:hidden";

/**
 * Step 1. Three separate cards on wide screens; one card with three rows
 * (icon, text, status) below xl, as in the mobile artwork.
 */
export function ProvidePanel() {
  return (
    <ul className="flex flex-col @max-[68rem]:divide-y @max-[68rem]:divide-line-subtle @max-[68rem]:rounded-card @max-[68rem]:border @max-[68rem]:border-line @max-[68rem]:bg-panel @max-[68rem]:shadow-card @min-[68rem]:gap-4">
      {PROVIDE.map(({ icon: Icon, tone, title, body, status, statusTone }) => (
        <li
          key={title}
          className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1 p-4 @xl:px-5 @min-[68rem]:grid-cols-[auto_minmax(0,1fr)] @min-[68rem]:gap-x-2.5 @min-[68rem]:gap-y-2 @min-[68rem]:rounded-card @min-[68rem]:border @min-[68rem]:border-line @min-[68rem]:bg-panel @min-[68rem]:p-3.5 @min-[68rem]:shadow-card"
        >
          <Icon aria-hidden strokeWidth={1.6} className={cn("row-span-2 size-7 self-center @min-[68rem]:row-span-1 @min-[68rem]:size-6", toneIcon[tone])} />
          <p className={cn("col-start-2", TITLE_SM)}>{title}</p>
          <p className={cn("col-start-2 row-start-2 @min-[68rem]:col-span-2 @min-[68rem]:col-start-1", DESC)}>{body}</p>
          <span className="col-start-3 row-span-2 row-start-1 self-center @min-[68rem]:col-span-2 @min-[68rem]:col-start-1 @min-[68rem]:row-span-1 @min-[68rem]:row-start-3">
            <StatusPill tone={statusTone}>{status}</StatusPill>
          </span>
        </li>
      ))}
    </ul>
  );
}

/** Step 2. Interview room mock-up. Controls are illustrative, not buttons. */
export function InterviewPanel() {
  return (
    <Panel className="overflow-hidden">
      <div className="relative flex h-11 items-center justify-center border-b border-line-subtle px-4">
        <span aria-hidden className="absolute left-4 flex gap-1.5">
          <span className="size-2.5 rounded-full bg-line-strong" />
          <span className="size-2.5 rounded-full bg-line-strong" />
          <span className="size-2.5 rounded-full bg-line-strong" />
        </span>
        <p className="text-small font-semibold text-fg">{INTERVIEW.room}</p>
      </div>

      <div className="flex flex-col items-center px-4 pt-4 pb-5 @4xl:px-5 @min-[68rem]:px-3">
        <div className="flex w-full items-center justify-between">
          <span className="inline-flex items-center gap-1.5 text-label font-semibold text-success">
            <span aria-hidden className="size-2 rounded-full bg-success" />
            {INTERVIEW.live}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-control border border-line bg-panel px-2.5 py-1 text-small font-semibold text-fg shadow-control">
            <Clock aria-hidden strokeWidth={1.75} className="size-4 text-fg-muted" />
            <span className="font-data tabular-nums">{INTERVIEW.timer}</span>
          </span>
        </div>

        <Image
          src="/landing/ava.png"
          alt=""
          width={126}
          height={126}
          className="mt-1 size-24 rounded-full bg-sunken object-cover @xl:size-[6.5rem]"
        />
        <p className="mt-3 text-heading font-semibold text-fg">{INTERVIEW.name}</p>
        <p className="text-small text-fg-muted">{INTERVIEW.role}</p>

        <Waveform className="mt-4 w-full" />

        <div className="relative mt-4 w-full pr-6">
          <p className="rounded-control border border-line bg-sunken/60 px-4 py-3 text-small text-fg">{INTERVIEW.question}</p>
          <span aria-hidden className="absolute right-0 bottom-2 inline-flex h-6 items-center gap-1 rounded-full bg-memory-soft px-2.5 ring-1 ring-memory-line ring-inset">
            <span className="size-1 rounded-full bg-memory" />
            <span className="size-1 rounded-full bg-memory" />
            <span className="size-1 rounded-full bg-memory" />
          </span>
        </div>

        <div aria-hidden className="mt-5 flex w-full flex-wrap items-center justify-between gap-1.5 whitespace-nowrap @4xl:gap-2 @min-[68rem]:gap-1">
          <span className="inline-flex items-center gap-1.5 rounded-control border border-line bg-panel px-2 py-2 text-[0.6875rem] font-medium text-fg shadow-control @4xl:px-2.5 @4xl:text-label @min-[68rem]:px-1.5 @min-[68rem]:text-[0.6875rem]">
            <Square strokeWidth={1.75} className={CONTROL_ICON} />
            {INTERVIEW.end}
          </span>
          <span className="inline-flex size-14 shrink-0 items-center justify-center rounded-full bg-action text-on-action shadow-raised ring-8 ring-sunken @4xl:size-16 @min-[68rem]:size-12 @min-[68rem]:ring-[6px]">
            <Mic strokeWidth={1.75} className="size-6" />
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-control border border-line bg-panel px-2 py-2 text-[0.6875rem] font-medium text-fg shadow-control @4xl:px-2.5 @4xl:text-label @min-[68rem]:px-1.5 @min-[68rem]:text-[0.6875rem]">
            <FileText strokeWidth={1.75} className={CONTROL_ICON} />
            {INTERVIEW.notes}
          </span>
        </div>
      </div>
    </Panel>
  );
}

export function InterviewNote({ className }: { className?: string }) {
  return <NoteBox className={className}>{INTERVIEW.note}</NoteBox>;
}

/** Step 3. Four stacked process cards joined by arrows. */
export function HowPanel() {
  return (
    <ol className="flex flex-col">
      {HOW.map(({ icon, tone, title, body }, index) => (
        <li key={title} className="flex flex-col items-center">
          {index > 0 && <ArrowDown aria-hidden strokeWidth={2} className="my-1.5 size-4 text-fg-subtle @min-[68rem]:my-1 @min-[68rem]:size-3.5" />}
          <Panel className="flex w-full items-start gap-3 p-4 @min-[68rem]:gap-2 @min-[68rem]:p-3">
            <IconTile icon={icon} tone={tone} className="size-11 @min-[68rem]:size-8 @min-[68rem]:[&_svg]:size-4" />
            <div className="min-w-0">
              <p className={TITLE_SM}>{title}</p>
              <p className={cn("mt-1", DESC)}>{body}</p>
            </div>
          </Panel>
        </li>
      ))}
    </ol>
  );
}

export function HowNote({ className }: { className?: string }) {
  return <NoteBox className={className}>{HOW_NOTE}</NoteBox>;
}

function ScoreRing({ value, label }: { value: number; label: string }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative mx-auto size-36 shrink-0 @xl:size-40 @min-[68rem]:size-[8.25rem]">
      <svg viewBox="0 0 120 120" className="size-full -rotate-90" aria-hidden>
        <circle cx="60" cy="60" r={r} fill="none" strokeWidth={9} className="stroke-sunken" />
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          strokeWidth={9}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - value / 100)}
          className="stroke-brand"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="ds-display text-[2.5rem] leading-none font-semibold tracking-[-0.03em] text-fg @min-[68rem]:text-[2rem]">{value}%</span>
        <span className="mt-1.5 text-label font-normal text-fg-muted">{label}</span>
      </div>
    </div>
  );
}

/** Step 4. Session report mock-up. */
export function ReportPanel() {
  return (
    <Panel className="p-4 @xl:p-5 @min-[68rem]:p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-heading font-semibold text-fg">{REPORT.title}</p>
        <p className="inline-flex items-center gap-1.5 text-label font-normal text-fg-muted">
          <CalendarDays aria-hidden strokeWidth={1.75} className="size-4" />
          {REPORT.date}
          <span aria-hidden>&bull;</span>
          {REPORT.time}
        </p>
      </div>

      <div className="mt-5 grid items-center gap-6 @xl:grid-cols-[auto_minmax(0,1fr)] @4xl:@max-[68rem]:grid-cols-[auto_minmax(0,1fr)_minmax(0,1.25fr)] @min-[68rem]:mt-4 @min-[68rem]:gap-x-5 @min-[68rem]:gap-y-4">
        <ScoreRing value={REPORT.overall} label={REPORT.overallLabel} />

        <ul className="flex flex-col gap-3.5 @min-[68rem]:gap-3">
          {REPORT.metrics.map(({ icon, label, value }) => (
            <li key={label} className="flex items-center gap-3">
              <IconTile icon={icon} className="size-9 [&_svg]:size-[1.125rem] @min-[68rem]:size-8 @min-[68rem]:[&_svg]:size-4" />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-3 text-small @min-[68rem]:text-[0.78125rem]">
                  <span className="text-fg">{label}</span>
                  <span className="font-semibold tabular-nums text-fg">{value}%</span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-sunken">
                  <div className="h-full rounded-full bg-brand" style={{ width: `${value}%` }} />
                </div>
              </div>
            </li>
          ))}
        </ul>

        <div className="rounded-card border border-line p-4 @xl:col-span-2 @4xl:@max-[68rem]:col-span-1 @min-[68rem]:p-3.5">
          <p className={TITLE_SM}>{REPORT.feedbackTitle}</p>
          <div className="mt-3 grid gap-4 @xl:grid-cols-[minmax(0,1fr)_minmax(0,11.5rem)] @xl:items-end @min-[68rem]:mt-2.5 @min-[68rem]:grid-cols-1 @min-[68rem]:gap-3">
            <div className="flex flex-col gap-3">
              <div>
                <span className="inline-flex rounded-badge bg-success-soft px-2 py-0.5 text-[0.6875rem] font-medium text-success">
                  Strengths
                </span>
                <ul className={cn("mt-2 flex list-disc flex-col gap-1 pl-4 marker:text-fg-subtle", DESC)}>
                  {REPORT.strengths.map((text) => (
                    <li key={text}>{text}</li>
                  ))}
                </ul>
              </div>
              <div>
                <span className="inline-flex rounded-badge bg-warning-soft px-2 py-0.5 text-[0.6875rem] font-medium text-warning">
                  Areas to Improve
                </span>
                <ul className={cn("mt-2 flex list-disc flex-col gap-1 pl-4 marker:text-fg-subtle", DESC)}>
                  {REPORT.improve.map((text) => (
                    <li key={text}>{text}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="rounded-control border border-line bg-panel p-3.5 shadow-control @min-[68rem]:p-3">
              <p className="flex items-center gap-2 text-label font-semibold text-fg @min-[68rem]:text-[0.6875rem]">
                <span aria-hidden className="inline-flex size-7 items-center justify-center rounded-full bg-memory-soft text-memory ring-1 ring-memory-line ring-inset">
                  <Star strokeWidth={2} className="size-3.5 fill-current" />
                </span>
                {REPORT.recommendation.title}
              </p>
              <p className={cn("mt-2", DESC)}>{REPORT.recommendation.body}</p>
            </div>
          </div>
        </div>
      </div>

    </Panel>
  );
}

/** Bottom strip: the end-to-end flow and its outcome. */
export function EnginePanel() {
  return (
    <Panel className="p-5 @xl:p-6 @min-[68rem]:px-6 @min-[68rem]:py-5">
      <p className="text-heading font-semibold text-fg @min-[68rem]:text-[1.0625rem]">{ENGINE.title}</p>
      <p className="mt-1 text-label font-normal text-fg-muted">{ENGINE.subtitle}</p>

      <ol className="mt-5 grid grid-cols-1 gap-4 @md:grid-cols-2 @2xl:grid-cols-3 @min-[68rem]:mt-4 @min-[68rem]:flex @min-[68rem]:items-center @min-[68rem]:gap-2">
        {ENGINE.steps.map(({ icon, tone, title, body }) => (
          <li key={title} className="flex min-w-0 items-start gap-3 @min-[68rem]:flex-1 @min-[68rem]:items-center @min-[68rem]:gap-2.5">
            <IconTile icon={icon} tone={tone} className="size-11 @min-[68rem]:size-10" />
            <div className="min-w-0">
              <p className={TITLE_SM}>{title}</p>
              <p className={cn("mt-0.5", DESC)}>{body}</p>
            </div>
            <ArrowRight aria-hidden strokeWidth={1.75} className="ml-auto hidden size-4 shrink-0 text-fg-subtle @min-[68rem]:block" />
          </li>
        ))}
        <li className="rounded-card bg-sunken/70 p-4 @md:col-span-2 @2xl:col-span-3 @min-[68rem]:w-40 @min-[68rem]:shrink-0 @min-[68rem]:p-3.5">
          <p className="flex items-center gap-2 text-small font-semibold text-fg">
            <Trophy aria-hidden strokeWidth={1.75} className="size-5 text-fg" />
            {ENGINE.outcome.title}
          </p>
          <p className="mt-2 text-label font-normal text-fg @min-[68rem]:text-[0.6875rem]">
            {ENGINE.outcome.lines.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </p>
        </li>
      </ol>
    </Panel>
  );
}
