import { ArrowUpRight, AudioLines, History } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { LineChart, Waveform } from "./charts";

const REMEMBERED = [
  { title: "Skips capacity estimates", meta: "Sessions 2 and 3", kind: "Focus area", active: true },
  { title: "Clear API boundaries", meta: "Session 3", kind: "Strength" },
  { title: "Rushes the result in STAR answers", meta: "Session 1", kind: "Focus area" },
  { title: "Senior backend engineer, Stripe", meta: "From onboarding", kind: "Goal" },
];

const CAPACITY = [
  { label: "S1", value: 41 },
  { label: "S2", value: 48, memory: true },
  { label: "S3", value: 58, memory: true },
  { label: "S4", value: 72, memory: true },
];

/**
 * Hero product moment: what the coach remembers, the question it asks
 * because of it, and the result over sessions. Sample data.
 */
export function MemoryCanvas() {
  return (
    <figure id="memory" className="scroll-mt-24">
      <div className="ds-bezel">
        <div className="ds-surface ds-bezel-core overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line-subtle px-5 py-3 sm:px-6">
            <p className="flex min-w-0 items-center gap-2.5 text-small">
              <span aria-hidden className="size-2 shrink-0 rounded-full bg-success" />
              <span className="font-semibold text-fg">Session 4</span>
              <span className="truncate text-fg-subtle">System design, senior backend</span>
            </p>
            <Badge>Sample data</Badge>
          </div>

          <div className="grid divide-y divide-line-subtle lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)_minmax(0,1fr)] lg:divide-x lg:divide-y-0">
            <section aria-labelledby="mc-remembers" className="p-5 sm:p-6">
              <h3 id="mc-remembers" className="text-label font-semibold text-fg-subtle">
                What Clutchly remembers
              </h3>
              <ul className="mt-4 flex flex-col gap-1">
                {REMEMBERED.map((item) => (
                  <li
                    key={item.title}
                    className={cn(
                      "flex items-start justify-between gap-3 rounded-control px-3 py-2.5",
                      item.active && "bg-memory-soft ring-1 ring-memory-line ring-inset",
                    )}
                  >
                    <div className="min-w-0">
                      <p className="text-small font-semibold text-fg">{item.title}</p>
                      <p className="text-label font-normal text-fg-subtle">{item.meta}</p>
                    </div>
                    {item.active ? (
                      <span className="mt-0.5 shrink-0 text-label font-semibold text-memory">Used now</span>
                    ) : (
                      <span className="mt-0.5 shrink-0 text-label font-normal text-fg-subtle">{item.kind}</span>
                    )}
                  </li>
                ))}
              </ul>
            </section>

            <section aria-label="Current question" className="flex items-center bg-sunken/60 p-5 sm:p-6 lg:p-8">
              <div className="w-full rounded-card border border-line bg-panel p-5 shadow-raised [backdrop-filter:var(--surface-backdrop)] sm:p-6">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span className="inline-flex size-8 items-center justify-center rounded-full bg-brand-soft text-brand">
                      <AudioLines aria-hidden strokeWidth={1.75} className="size-4" />
                    </span>
                    <div>
                      <p className="text-small font-semibold text-fg">Interviewer</p>
                      <p className="text-label font-normal text-fg-subtle">System design panel</p>
                    </div>
                  </div>
                  <span className="shrink-0 whitespace-nowrap text-label font-medium tabular-nums text-fg-subtle">
                    Question 2 of 6
                  </span>
                </div>

                <p className="ds-display mt-5 text-pretty text-[1.375rem] leading-[1.28] tracking-[-0.02em] text-fg [font-weight:var(--text-title--font-weight)]">
                  &ldquo;Before we design it, how much storage will a year of chat messages need?&rdquo;
                </p>

                <div className="mt-5 flex items-start gap-2.5 rounded-control bg-memory-soft px-3 py-2.5 ring-1 ring-memory-line ring-inset">
                  <History aria-hidden strokeWidth={1.75} className="mt-0.5 size-4 shrink-0 text-memory" />
                  <p className="text-small text-fg">
                    <span className="font-semibold">Asked because</span> you skipped capacity estimates in
                    sessions 2 and 3.
                  </p>
                </div>

                <div className="mt-5 flex items-center justify-between gap-4 border-t border-line-subtle pt-4">
                  <div className="flex items-center gap-3">
                    <Waveform bars={22} className="text-brand" />
                    <span className="text-small font-medium text-fg">Listening</span>
                  </div>
                  <span className="font-data text-small tabular-nums text-fg-subtle">04:12</span>
                </div>
              </div>
            </section>

            <section aria-labelledby="mc-progress" className="flex flex-col p-5 sm:p-6">
              <h3 id="mc-progress" className="text-label font-semibold text-fg-subtle">
                Capacity estimation
              </h3>
              <div className="mt-3 flex flex-wrap items-end gap-x-3 gap-y-1">
                <span className="ds-display text-metric tabular-nums text-fg">72</span>
                <span className="mb-1 inline-flex items-center gap-1 text-small font-semibold text-success">
                  <ArrowUpRight aria-hidden strokeWidth={2} className="size-4" />
                  +31 since session 1
                </span>
              </div>
              <LineChart
                points={CAPACITY}
                className="mt-4"
                ariaLabel="Capacity estimation score by session: 41, 48, 58, then 72."
              />
              <p className="mt-3 flex items-center gap-2 text-label font-normal text-fg-subtle">
                <span aria-hidden className="size-3 rounded-full bg-memory-soft ring-[1.25px] ring-memory" />
                Coach targeted it from memory
              </p>
              <div className="mt-auto flex items-center justify-between gap-3 border-t border-line-subtle pt-4 text-small max-lg:mt-5">
                <span className="text-fg-muted">Overall score</span>
                <span className="tabular-nums">
                  <span className="font-semibold text-fg">74</span>{" "}
                  <span className="font-semibold text-success">+8</span>
                </span>
              </div>
            </section>
          </div>
        </div>
      </div>
      <figcaption className="mt-4 text-small text-fg-subtle">Illustrative session. Sample data.</figcaption>
    </figure>
  );
}
