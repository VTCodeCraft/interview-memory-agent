import { Check, CircleDot, Lightbulb } from "lucide-react";

import SectionHeading from "./SectionHeading";
import { ScoreMeter } from "./visuals";

const SCORES = [
  { label: "Technical", value: 76 },
  { label: "Communication", value: 81 },
  { label: "Problem solving", value: 72 },
  { label: "Confidence", value: 70 },
  { label: "Behavioral", value: 68 },
];

const STRENGTHS = ["Clear API boundaries between services", "Estimated storage before choosing a database"];
const WEAKNESSES = ["Read traffic was not sized", "Trade-offs stated without numbers"];
const MISSING = ["Caching strategy", "Data retention"];

const PROGRESS = [
  { label: "Communication", value: 81, delta: 6 },
  { label: "Problem solving", value: 72, delta: 14 },
  { label: "Technical", value: 76, delta: 3 },
];

const POINTS = [
  {
    title: "Six scores per interview",
    body: "Overall, technical, communication, problem solving, confidence and behavioral.",
  },
  {
    title: "Specific written feedback",
    body: "Strengths, weaknesses, topics you missed and recommendations for what to practice.",
  },
  {
    title: "Progress between sessions",
    body: "Your Memory page shows how each score changed since the last session and which weak spots keep recurring.",
  },
];

function ListBlock({ title, items, icon: Icon, tone }: { title: string; items: string[]; icon: typeof Check; tone: string }) {
  return (
    <div>
      <p className="text-label font-semibold text-fg-subtle">{title}</p>
      <ul className="mt-3 flex flex-col gap-2.5">
        {items.map((text) => (
          <li key={text} className="flex gap-2.5 text-small text-fg">
            <Icon aria-hidden strokeWidth={2} className={`mt-0.5 size-4 shrink-0 ${tone}`} />
            {text}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function ReportsSection() {
  return (
    <section id="reports" aria-labelledby="reports-title" className="ds-container scroll-mt-20 pt-(--spacing-section)">
      <SectionHeading
        id="reports-title"
        title={
          <>
            Know what to work on <em>next.</em>
          </>
        }
        intro="After every interview, Clutchly scores your answers and writes up what went well, what didn't and what to practice. Your progress across sessions is tracked as you go."
      />

      <figure className="mt-10 sm:mt-14">
        <div className="ds-bezel">
          <div className="ds-surface ds-bezel-core overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line-subtle px-5 py-3 sm:px-6">
              <p className="min-w-0 truncate text-small">
                <span className="font-semibold text-fg">Report</span>{" "}
                <span className="text-fg-subtle">System design interview, senior</span>
              </p>
              <span className="inline-flex h-6 items-center rounded-badge border border-line bg-sunken px-2 text-label text-fg-muted">
                Sample report
              </span>
            </div>

            <div className="grid gap-4 p-4 sm:gap-5 sm:p-6 lg:grid-cols-12 lg:p-8">
              <div className="flex flex-col gap-4 sm:gap-5 lg:col-span-8">
                <div className="rounded-card border border-line bg-panel p-5 sm:p-6">
                  <div className="grid gap-6 sm:grid-cols-[auto_1fr] sm:gap-10">
                    <div>
                      <p className="text-small font-medium text-fg-muted">Overall</p>
                      <p className="ds-display mt-1 text-metric text-fg">74</p>
                    </div>
                    <div className="grid gap-x-8 gap-y-4 self-center sm:grid-cols-2">
                      {SCORES.map((score) => (
                        <ScoreMeter key={score.label} label={score.label} value={score.value} />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid gap-6 rounded-card border border-line bg-panel p-5 sm:grid-cols-2 sm:p-6">
                  <ListBlock title="Strengths" items={STRENGTHS} icon={Check} tone="text-success" />
                  <ListBlock title="Weaknesses" items={WEAKNESSES} icon={CircleDot} tone="text-warning" />
                  <div className="sm:col-span-2">
                    <p className="text-label font-semibold text-fg-subtle">Missing topics</p>
                    <ul className="mt-3 flex flex-wrap gap-2">
                      {MISSING.map((topic) => (
                        <li key={topic} className="rounded-badge border border-line bg-canvas px-2.5 py-1 text-small text-fg">
                          {topic}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4 sm:gap-5 lg:col-span-4">
                <div className="rounded-card border border-memory-line bg-memory-soft p-5 sm:p-6">
                  <p className="flex items-center gap-2 text-small font-semibold text-fg">
                    <Lightbulb aria-hidden strokeWidth={1.75} className="size-4 text-memory" />
                    Recommendation
                  </p>
                  <p className="mt-2 text-small text-fg">
                    Size read and write traffic before choosing storage, and state each assumption out loud.
                  </p>
                </div>

                <div className="rounded-card border border-line bg-panel p-5 sm:p-6">
                  <p className="text-label font-semibold text-fg-subtle">On your Memory page</p>
                  <p className="mt-1 text-small text-fg-muted">Change since last session</p>
                  <div className="mt-4 flex flex-col gap-4">
                    {PROGRESS.map((row) => (
                      <ScoreMeter key={row.label} label={row.label} value={row.value} delta={row.delta} />
                    ))}
                  </div>
                  <div className="mt-5 border-t border-line-subtle pt-4">
                    <p className="text-label font-semibold text-fg-subtle">Recurring weak spot</p>
                    <p className="mt-1.5 flex items-baseline justify-between gap-3 text-small">
                      <span className="text-fg">Sizing traffic</span>
                      <span className="shrink-0 font-data text-label tabular-nums text-fg-subtle">3 sessions</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <figcaption className="mt-4 text-small text-fg-subtle">
          Sample report and Memory page details with illustrative data.
        </figcaption>
      </figure>

      <ul className="mt-12 grid gap-8 border-t border-line pt-8 md:grid-cols-3">
        {POINTS.map((point) => (
          <li key={point.title}>
            <h3 className="text-subheading text-fg">{point.title}</h3>
            <p className="mt-2 text-body text-fg-muted">{point.body}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
