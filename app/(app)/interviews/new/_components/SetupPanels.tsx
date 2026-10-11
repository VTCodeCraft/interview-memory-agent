import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, AudioLines, FileText, LoaderCircle, Mic } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/feedback";
import { ROUTES } from "@/lib/utils/constants";
import { cn } from "@/lib/utils";

export interface UsageInfo {
  totalUsed: number;
  maxUses: number;
  remaining: number;
  isLimitReached: boolean;
  windowLabel?: string;
}

export interface ResumeInfo {
  fileName: string;
  uploadedAt: string;
}

/* ── Primitives ─────────────────────────────────────────────────────────── */

export function Panel({ className, children, ...rest }: { className?: string; children: ReactNode } & React.HTMLAttributes<HTMLElement>) {
  return (
    <section className={cn("ds-surface rounded-card", className)} {...rest}>
      {children}
    </section>
  );
}

function PanelTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-line-subtle px-5 py-4 sm:px-6">
      <h2 className="text-subheading text-fg">{children}</h2>
      {action}
    </div>
  );
}

const DATE = new Intl.DateTimeFormat("en", { day: "numeric", month: "short", year: "numeric" });

/** Date with only the digits in the data face. */
function DateText({ iso }: { iso: string }) {
  return (
    <time dateTime={iso}>
      {DATE.formatToParts(new Date(iso)).map((part, index) =>
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

/* ── Side column ────────────────────────────────────────────────────────── */

/** Interviews used in the current limit window (GET /api/user/usage). */
export function UsagePanel({ usage }: { usage: UsageInfo }) {
  const window = usage.windowLabel ?? "month";
  const share = usage.maxUses > 0 ? Math.min(100, (usage.totalUsed / usage.maxUses) * 100) : 0;
  return (
    <Panel aria-labelledby="usage-title">
      <div className="px-5 py-5 sm:px-6">
        <div className="flex items-baseline justify-between gap-4">
          <h2 id="usage-title" className="text-small text-fg-muted">
            Interviews this {window}
          </h2>
          <p className="text-small text-fg-muted">
            <span className="font-data text-body font-semibold tabular-nums text-fg">{usage.totalUsed}</span>
            <span className="font-data tabular-nums"> / {usage.maxUses}</span>
          </p>
        </div>
        <div
          role="meter"
          aria-label={`Interviews used this ${window}`}
          aria-valuemin={0}
          aria-valuemax={usage.maxUses}
          aria-valuenow={Math.min(usage.totalUsed, usage.maxUses)}
          className="mt-3 h-1.5 overflow-hidden rounded-full bg-sunken"
        >
          <div className={cn("h-full rounded-full", usage.isLimitReached ? "bg-danger" : "bg-brand")} style={{ width: `${share}%` }} />
        </div>
        <p className={cn("mt-3 text-small", usage.isLimitReached ? "font-medium text-danger" : "text-fg-muted")}>
          {usage.isLimitReached ? (
            `You've used all your interviews this ${window}.`
          ) : (
            <>
              <span className="font-data tabular-nums">{usage.remaining}</span> left this {window}. Cancelled interviews count
              too.
            </>
          )}
        </p>
      </div>
    </Panel>
  );
}

/** The interview always uses the latest resume on file (services/interview.service.ts). */
export function ResumePanel({ resume }: { resume: ResumeInfo | null }) {
  return (
    <Panel>
      <PanelTitle
        action={
          <Link
            href={ROUTES.profile}
            className="inline-flex min-h-8 shrink-0 items-center gap-1 rounded-control text-small font-medium text-brand underline-offset-4 hover:text-brand-hover hover:underline focus-ring"
          >
            {resume ? "Replace" : "Upload"}
            <ArrowRight aria-hidden strokeWidth={1.75} className="size-3.5" />
          </Link>
        }
      >
        Resume
      </PanelTitle>
      <div className="flex items-start gap-3 px-5 py-4 sm:px-6">
        <span aria-hidden className="flex size-9 shrink-0 items-center justify-center rounded-control border border-line bg-canvas text-fg-muted">
          <FileText strokeWidth={1.75} className="size-4" />
        </span>
        {resume ? (
          <div className="min-w-0">
            <p title={resume.fileName} className="line-clamp-2 text-small font-semibold [overflow-wrap:anywhere] text-fg">
              {resume.fileName}
            </p>
            <p className="mt-0.5 text-small text-fg-muted">
              Saved <DateText iso={resume.uploadedAt} />. Questions draw on it.
            </p>
          </div>
        ) : (
          <p className="text-small text-fg-muted">No resume on file. Upload one in Profile &amp; Settings to start an interview.</p>
        )}
      </div>
    </Panel>
  );
}

const NEXT_STEPS = [
  { icon: Mic, title: "Voice check", text: "A quick microphone and connection check." },
  { icon: AudioLines, title: "Live interview", text: "Answer out loud with a live transcript." },
  { icon: FileText, title: "Report", text: "A scored report appears on your dashboard." },
];

export function NextStepsPanel() {
  return (
    <Panel>
      <PanelTitle>What happens next</PanelTitle>
      <ol className="flex flex-col gap-4 px-5 py-5 sm:px-6">
        {NEXT_STEPS.map((step, index) => (
          <li key={step.title} className="flex gap-3">
            <span aria-hidden className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand ring-1 ring-memory-line ring-inset">
              <step.icon strokeWidth={1.75} className="size-4" />
            </span>
            <span className="min-w-0">
              <span className="block text-small font-semibold text-fg">
                <span className="font-data text-fg-subtle tabular-nums">{index + 1}</span>
                <span className="text-fg-subtle"> · </span>
                {step.title}
              </span>
              <span className="block text-small text-fg-muted">{step.text}</span>
            </span>
          </li>
        ))}
      </ol>
    </Panel>
  );
}

/* ── Whole-page states ──────────────────────────────────────────────────── */

/** Questions are being generated (POST /start then /generate). */
export function GeneratingPanel({
  summary,
  onCancel,
  navigating,
}: {
  summary: string;
  onCancel: () => void;
  /** Questions are ready and the voice check is opening; nothing left to cancel here. */
  navigating: boolean;
}) {
  return (
    <Panel className="mx-auto flex max-w-[40rem] flex-col items-center px-6 py-14 text-center sm:px-10">
      <span aria-hidden className="relative flex size-14 items-center justify-center">
        <span className="absolute inset-0 rounded-full bg-brand-soft ring-1 ring-memory-line ring-inset motion-safe:animate-pulse" />
        <LoaderCircle strokeWidth={1.75} className="relative size-6 text-brand motion-safe:animate-spin" />
      </span>
      <div role="status" aria-live="polite">
        <h2 className="ds-display mt-6 text-heading text-fg">{navigating ? "Opening the voice check" : "Preparing your interview"}</h2>
        <p className="mt-2 text-body text-fg-muted">
          {navigating
            ? "Your questions are ready."
            : "Writing questions from your role, resume, the job description if you added one, and your past interviews."}
        </p>
      </div>
      <p className="mt-5 rounded-control bg-sunken px-3 py-2 text-small font-medium text-fg">{summary}</p>
      {!navigating && (
        <Button variant="secondary" onClick={onCancel} className="mt-8">
          Cancel
        </Button>
      )}
    </Panel>
  );
}

export function LimitReachedPanel({ usage }: { usage: UsageInfo | null }) {
  const window = usage?.windowLabel ?? "month";
  return (
    <Panel className="mx-auto flex max-w-[40rem] flex-col items-center px-6 py-14 text-center sm:px-10">
      <h2 className="ds-display text-heading text-fg">You&apos;ve reached this {window}&apos;s limit</h2>
      <p className="mt-2 text-body text-fg-muted">
        {usage ? (
          <>
            You&apos;ve used all <span className="font-data tabular-nums">{usage.maxUses}</span> interviews available this {window}.
          </>
        ) : (
          `You've used all the interviews available this ${window}.`
        )}{" "}
        You can start a new one next {window}.
      </p>
      <Link href={ROUTES.interviews} className={cn(buttonVariants({ variant: "primary", size: "lg" }), "mt-8")}>
        Back to dashboard
      </Link>
    </Panel>
  );
}

/** Shown while checking for an unfinished interview to resume. */
export function SetupSkeleton() {
  return (
    <div role="status" aria-live="polite" className="grid gap-6 lg:grid-cols-12 lg:gap-8">
      <span className="sr-only">Checking for an unfinished interview</span>
      <Panel className="flex flex-col gap-6 p-5 sm:p-8 lg:col-span-8">
        {[0, 1, 2].map((key) => (
          <div key={key} className="flex flex-col gap-3">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-11 w-full" />
          </div>
        ))}
      </Panel>
      <div className="flex flex-col gap-6 lg:col-span-4">
        <Panel className="flex flex-col gap-3 p-5 sm:p-6">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-2 w-full" />
        </Panel>
        <Panel className="flex flex-col gap-3 p-5 sm:p-6">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </Panel>
      </div>
    </div>
  );
}
