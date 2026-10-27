"use client";

import { useId, useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";
import { dateParts } from "@/app/(app)/interviews/_components/dashboard-data";
import { displayScore, meterWidth } from "@/app/(app)/reports/_components/reports-list";

/**
 * Two small charts, each a single series in the accent (validated against the
 * panel surface with the dataviz palette script). Thin marks, solid hairline
 * grid, selective direct labels, hover and keyboard tooltips, and a table view
 * for every chart so no value depends on hovering.
 */

const DATE = new Intl.DateTimeFormat("en", { day: "numeric", month: "short", year: "numeric" });
const SHORT = new Intl.DateTimeFormat("en", { day: "numeric", month: "short" });

const valid = (date: Date) => !Number.isNaN(date.getTime());

/** Formatted date, or "Unknown date" rather than throwing on a bad value. */
export function formatDate(iso: string | Date) {
  const date = typeof iso === "string" ? new Date(iso) : iso;
  return valid(date) ? DATE.format(date) : "Unknown date";
}

function shortDate(iso: string | Date) {
  const date = typeof iso === "string" ? new Date(iso) : iso;
  return valid(date) ? SHORT.format(date) : "Unknown";
}

/** "Oct 2, 2026" with only the digits in the data face. */
export function DateText({ iso }: { iso: string }) {
  if (!valid(new Date(iso))) return <>Unknown date</>;
  return (
    <time dateTime={iso}>
      {dateParts(iso).map((part, index) =>
        part.type === "day" || part.type === "year" ? (
          <span key={index} className="font-data">
            {part.value}
          </span>
        ) : (
          part.value
        ),
      )}
    </time>
  );
}

/** Figure frame: caption on the left, chart/table switch on the right. */
function ChartFigure({
  caption,
  note,
  table,
  children,
}: {
  caption: string;
  note?: ReactNode;
  table: ReactNode;
  children: ReactNode;
}) {
  const [asTable, setAsTable] = useState(false);
  const captionId = useId();
  return (
    <figure aria-labelledby={captionId} className="min-w-0">
      <div className="flex items-center justify-between gap-3">
        <figcaption id={captionId} className="text-label font-semibold text-fg-muted">
          {caption}
        </figcaption>
        <button
          type="button"
          aria-pressed={asTable}
          onClick={() => setAsTable((value) => !value)}
          className="inline-flex min-h-8 items-center rounded-control px-2 text-label font-medium text-brand underline-offset-4 hover:underline focus-ring"
        >
          {asTable ? "Show chart" : "Show table"}
        </button>
      </div>
      <div className="mt-3">{asTable ? table : children}</div>
      {note && !asTable && <p className="mt-2 text-label text-fg-subtle">{note}</p>}
    </figure>
  );
}

/** Tooltip shown while its point or column is hovered or focused. */
function Tip({ align, children }: { align: "start" | "center" | "end"; children: ReactNode }) {
  return (
    <span
      role="presentation"
      className={cn(
        "pointer-events-none absolute bottom-full z-10 mb-2 hidden whitespace-nowrap rounded-control border border-line bg-panel px-2.5 py-1.5 text-left text-label text-fg-muted shadow-raised group-hover:block group-focus-visible:block",
        align === "start" ? "left-0" : align === "end" ? "right-0" : "left-1/2 -translate-x-1/2",
      )}
    >
      {children}
    </span>
  );
}

/* ── Overall score over time, within one interview type ─────────────────── */

export interface TrendPoint {
  date: string;
  score: number;
  level: string | null;
  title: string;
}

/**
 * One point per interview, oldest to newest, evenly spaced (the x axis is the
 * order of interviews, not a time scale). Y is the 0-100 score.
 */
export function ScoreTrend({ points }: { points: TrendPoint[] }) {
  const pad = 4; // % inset so end points stay inside the plot
  const x = (index: number) => (points.length === 1 ? 50 : pad + (index * (100 - 2 * pad)) / (points.length - 1));
  const y = (score: number) => 100 - meterWidth(score);
  const last = points[points.length - 1];

  const table = (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-small">
        <caption className="sr-only">Overall score for each interview, oldest first</caption>
        <thead className="text-label text-fg-subtle">
          <tr className="border-b border-line-subtle">
            <th scope="col" className="py-2 pr-3 font-medium">Date</th>
            <th scope="col" className="py-2 pr-3 font-medium">Level</th>
            <th scope="col" className="py-2 pr-3 text-right font-medium">Score</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line-subtle">
          {points.map((point, index) => (
            <tr key={`${point.date}-${index}`}>
              <td className="py-2 pr-3 text-fg">
                <DateText iso={point.date} />
              </td>
              <td className="py-2 pr-3 text-fg-muted">{point.level ?? "—"}</td>
              <td className="py-2 text-right font-data text-fg tabular-nums">{displayScore(point.score)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <ChartFigure caption="Overall score, oldest to newest" note="One point per interview, evenly spaced; hover or focus a point for its date." table={table}>
      <div className="grid grid-cols-[1.75rem_minmax(0,1fr)] gap-x-2">
        {/* Y axis: 0, 50, 100 */}
        <div aria-hidden className="relative h-36 font-data text-label text-fg-subtle">
          {[100, 50, 0].map((tick) => (
            <span key={tick} className="absolute right-0 -translate-y-1/2" style={{ top: `${100 - tick}%` }}>
              {tick}
            </span>
          ))}
        </div>
        <div className="relative h-36">
          {[0, 50, 100].map((tick) => (
            <span key={tick} aria-hidden className="absolute inset-x-0 border-t border-line-subtle" style={{ top: `${100 - tick}%` }} />
          ))}
          <svg aria-hidden viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full overflow-visible">
            <polyline
              points={points.map((point, index) => `${x(index)},${y(point.score)}`).join(" ")}
              fill="none"
              stroke="var(--color-brand)"
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
          <ol className="absolute inset-0">
            {points.map((point, index) => {
              const label = `${formatDate(point.date)}${point.level ? `, ${point.level}` : ""}: ${displayScore(point.score)} out of 100`;
              const align = index === 0 ? "start" : index === points.length - 1 ? "end" : "center";
              return (
                <li key={`${point.date}-${index}`} className="absolute" style={{ left: `${x(index)}%`, top: `${y(point.score)}%` }}>
                  <button
                    type="button"
                    aria-label={label}
                    className="group absolute -translate-x-1/2 -translate-y-1/2 flex size-6 items-center justify-center rounded-full focus-ring"
                  >
                    <span aria-hidden className="size-2.5 rounded-full bg-brand ring-2 ring-panel transition-transform duration-(--duration-fast) ease-standard group-hover:scale-125 group-focus-visible:scale-125" />
                    <Tip align={align}>
                      <span className="font-data text-fg">{displayScore(point.score)}</span> · {formatDate(point.date)}
                      {point.level && <> · {point.level}</>}
                    </Tip>
                  </button>
                </li>
              );
            })}
          </ol>
          {/* Direct label on the latest point only. */}
          <span
            aria-hidden
            className="pointer-events-none absolute -translate-x-full -translate-y-[160%] pr-1 font-data text-label font-semibold text-fg"
            style={{ left: `${x(points.length - 1)}%`, top: `${y(last.score)}%` }}
          >
            {displayScore(last.score)}
          </span>
        </div>
        {/* X axis: first and last interview dates. */}
        <div aria-hidden className="col-start-2 mt-2 flex justify-between gap-3 text-label text-fg-subtle">
          <span>{shortDate(points[0].date)}</span>
          {points.length > 1 && <span>{shortDate(last.date)}</span>}
        </div>
      </div>
    </ChartFigure>
  );
}

/* ── Finished interviews per week ───────────────────────────────────────── */

export function WeeklyColumns({ weeks }: { weeks: { start: Date; count: number }[] }) {
  const max = Math.max(1, ...weeks.map((week) => week.count));
  const label = (week: { start: Date; count: number }, index: number) =>
    `${index === weeks.length - 1 ? "This week" : `Week of ${shortDate(week.start)}`}: ${week.count} finished ${week.count === 1 ? "interview" : "interviews"}`;

  const table = (
    <table className="w-full text-left text-small">
      <caption className="sr-only">Finished interviews per week, oldest first</caption>
      <thead className="text-label text-fg-subtle">
        <tr className="border-b border-line-subtle">
          <th scope="col" className="py-2 pr-3 font-medium">Week of</th>
          <th scope="col" className="py-2 text-right font-medium">Finished</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-line-subtle">
        {weeks.map((week, index) => (
          <tr key={week.start.toISOString()}>
            <td className="py-2 pr-3 text-fg">{index === weeks.length - 1 ? "This week" : shortDate(week.start)}</td>
            <td className="py-2 text-right font-data text-fg tabular-nums">{week.count}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <ChartFigure caption={`Last ${weeks.length} weeks`} table={table}>
      <ol className="flex h-24 items-end gap-1 border-b border-line">
        {weeks.map((week, index) => {
          const current = index === weeks.length - 1;
          const align = index === 0 ? "start" : current ? "end" : "center";
          // Columns use up to 80% of the height, leaving room for the label on the current week.
          const height = week.count > 0 ? Math.max(6, (week.count / max) * 80) : 0;
          return (
            <li key={week.start.toISOString()} className="relative flex h-full min-w-0 flex-1 items-end justify-center">
              <button type="button" aria-label={label(week, index)} className="group relative flex h-full w-full items-end justify-center rounded-item focus-ring">
                {current && (
                  <span aria-hidden className="absolute left-1/2 -translate-x-1/2 font-data text-label font-semibold text-fg" style={{ bottom: `calc(${height}% + 0.25rem)` }}>
                    {week.count}
                  </span>
                )}
                {week.count > 0 && (
                  <span aria-hidden className="block w-full max-w-6 rounded-t-[4px] bg-brand" style={{ height: `${height}%` }} />
                )}
                <Tip align={align}>{label(week, index)}</Tip>
              </button>
            </li>
          );
        })}
      </ol>
      <div aria-hidden className="mt-2 flex justify-between text-label text-fg-subtle">
        <span>{shortDate(weeks[0].start)}</span>
        <span>This week</span>
      </div>
    </ChartFigure>
  );
}
