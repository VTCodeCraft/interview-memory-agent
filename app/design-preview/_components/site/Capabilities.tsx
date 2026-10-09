import { AudioLines, ChartLine, FileText, History } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { LineChart, Meter, Waveform } from "./charts";

function CellLabel({ icon: Icon, children, inverse }: { icon: LucideIcon; children: string; inverse?: boolean }) {
  return (
    <p className={cn("flex items-center gap-2 text-small font-medium", inverse ? "text-fg-inverse/75" : "text-fg-muted")}>
      <Icon aria-hidden strokeWidth={1.75} className={cn("size-4", inverse ? "text-fg-inverse" : "text-brand")} />
      {children}
    </p>
  );
}

function CellTitle({ children, inverse }: { children: string; inverse?: boolean }) {
  return (
    <h3 className={cn("ds-display mt-4 text-title text-balance", inverse ? "text-fg-inverse" : "text-fg")}>
      {children}
    </h3>
  );
}

const HISTORY = [
  { session: "Session 3", note: "Clear API boundaries", status: "Strength", tone: "text-success" },
  { session: "Session 3", note: "Skipped capacity estimates", status: "Focus", tone: "text-warning" },
  { session: "Session 2", note: "Skipped capacity estimates", status: "Focus", tone: "text-warning" },
  { session: "Session 1", note: "Rushed STAR results", status: "Focus", tone: "text-warning" },
];

const OVERALL = [
  { label: "2 Sep", value: 52 },
  { label: "12 Sep", value: 61, memory: true },
  { label: "24 Sep", value: 66, memory: true },
  { label: "3 Oct", value: 74, memory: true },
];

export function Capabilities() {
  return (
    <section id="how" aria-labelledby="how-title" className="ds-container scroll-mt-20 pt-(--spacing-section)">
      <div className="grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-12">
        <h2 id="how-title" className="ds-display text-balance text-headline text-fg lg:col-span-7">
          Practice that compounds.
        </h2>
        <p className="max-w-[34rem] text-lead text-fg-muted lg:col-span-5">
          Every session leaves a record. Clutchly reads it before the next one, so practice gets harder in
          exactly the places you need it.
        </p>
      </div>

      <div className="mt-10 grid gap-4 sm:mt-14 sm:gap-5 lg:grid-cols-12">
        {/* Voice: the one inverse cell, for rhythm. */}
        <article className="flex flex-col justify-between gap-8 rounded-card bg-inverse p-6 text-fg-inverse shadow-card sm:p-8 lg:col-span-7">
          <div>
            <CellLabel icon={AudioLines} inverse>
              Voice
            </CellLabel>
            <CellTitle inverse>Interviews you speak, not type.</CellTitle>
            <p className="mt-3 max-w-[38ch] text-body text-fg-inverse/75">
              The interviewer listens, follows up and pushes back the way a real panel does.
            </p>
          </div>
          <div className="flex flex-col gap-3 rounded-control border border-fg-inverse/12 bg-fg-inverse/[0.04] p-4">
            <p className="text-small">
              <span className="font-semibold text-fg-inverse">Interviewer</span>{" "}
              <span className="text-fg-inverse/75">Walk me through the write path.</span>
            </p>
            <p className="text-small">
              <span className="font-semibold text-fg-inverse">You</span>{" "}
              <span className="text-fg-inverse/75">Messages land in a queue first, then fan out to</span>
            </p>
            <div className="flex items-center gap-3 text-fg-inverse/80">
              <Waveform bars={34} />
              <span className="font-data text-label tabular-nums">00:48</span>
            </div>
          </div>
        </article>

        <article className="ds-surface flex flex-col justify-between gap-8 rounded-card p-6 sm:p-8 lg:col-span-5">
          <div>
            <CellLabel icon={History}>Memory</CellLabel>
            <CellTitle>Nothing you practice is lost.</CellTitle>
            <p className="mt-3 text-body text-fg-muted">
              Strengths, weak spots and goals carry forward and shape the next session.
            </p>
          </div>
          <ul className="divide-y divide-line-subtle border-y border-line-subtle">
            {HISTORY.map((row) => (
              <li key={`${row.session}-${row.note}`} className="flex items-center justify-between gap-3 py-2.5 text-small">
                <span className="min-w-0 truncate">
                  <span className="text-fg-subtle">{row.session}</span>{" "}
                  <span className="font-medium text-fg">{row.note}</span>
                </span>
                <span className={cn("shrink-0 text-label font-semibold", row.tone)}>{row.status}</span>
              </li>
            ))}
          </ul>
        </article>

        <article className="ds-surface flex flex-col justify-between gap-8 rounded-card p-6 sm:p-8 lg:col-span-5">
          <div>
            <CellLabel icon={FileText}>Reports</CellLabel>
            <CellTitle>Feedback you can act on.</CellTitle>
            <p className="mt-3 text-body text-fg-muted">
              Scores by skill, what changed since last time, and one clear next step.
            </p>
          </div>
          <div className="flex flex-col gap-4">
            <Meter label="Communication" value={81} />
            <Meter label="Technical depth" value={76} />
            <Meter label="Capacity estimation" value={72} />
          </div>
        </article>

        <article className="ds-surface flex flex-col gap-6 rounded-card p-6 sm:p-8 lg:col-span-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <CellLabel icon={ChartLine}>Progress</CellLabel>
              <CellTitle>See the work paying off.</CellTitle>
            </div>
            <div className="text-right">
              <p className="ds-display text-metric-sm tabular-nums text-fg">74</p>
              <p className="text-label font-semibold text-success">+22 in a month</p>
            </div>
          </div>
          <LineChart
            points={OVERALL}
            width={620}
            height={190}
            ariaLabel="Overall score from 2 September to 3 October: 52, 61, 66, then 74. Sample data."
          />
          <p className="-mt-2 flex flex-wrap items-center gap-x-5 gap-y-2 text-label font-normal text-fg-subtle">
            <span className="inline-flex items-center gap-2">
              <span aria-hidden className="h-0.5 w-4 rounded-full bg-brand" />
              Overall score
            </span>
            <span className="inline-flex items-center gap-2">
              <span aria-hidden className="w-4 border-t border-dashed border-chart-baseline" />
              First session
            </span>
            <span className="inline-flex items-center gap-2">
              <span aria-hidden className="size-3 rounded-full bg-memory-soft ring-[1.25px] ring-memory" />
              Session built from memory
            </span>
          </p>
        </article>
      </div>
    </section>
  );
}
