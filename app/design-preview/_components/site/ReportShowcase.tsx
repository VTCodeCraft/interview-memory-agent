"use client";

import { ArrowRight, ArrowUpRight, Check, ChevronRight, CircleDot, History, RotateCcw, Share2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs } from "@/components/ui/tabs";
import { AppNav } from "./AppNav";
import { Meter } from "./charts";

const SCORES = [
  { label: "Communication", value: 81 },
  { label: "Technical depth", value: 76 },
  { label: "Capacity estimation", value: 72 },
  { label: "Problem solving", value: 70 },
];

const IMPROVED = [
  "Estimated storage before choosing a database",
  "Named the trade-off between SQL and a log store",
];

const WORKING_ON = ["Results in STAR answers are still brief", "Read traffic was not sized"];

const FROM_MEMORY = [
  { text: "Opened with a capacity question", source: "Sessions 2 and 3" },
  { text: "Probed the result of each STAR story", source: "Session 1" },
];

const RECENT = [
  { title: "Behavioural", date: "1 Oct", score: 66 },
  { title: "System design", date: "24 Sep", score: 66 },
  { title: "Coding", date: "12 Sep", score: 61 },
];

function PanelTitle({ children }: { children: string }) {
  return <h4 className="text-subheading text-fg">{children}</h4>;
}

/** A report page inside the signed-in product frame. Sample data. */
export function ReportShowcase() {
  return (
    <section id="reports" aria-labelledby="reports-title" className="ds-container scroll-mt-20 pt-(--spacing-section)">
      <div className="grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-12">
        <h2 id="reports-title" className="ds-display text-balance text-headline text-fg lg:col-span-7">
          Know exactly what <em>changed.</em>
        </h2>
        <p className="max-w-[34rem] text-lead text-fg-muted lg:col-span-5">
          Each report compares the session with the ones before it: what improved, what still needs work,
          and what to practice next.
        </p>
      </div>

      <div className="ds-bezel mt-10 sm:mt-14">
        <div className="ds-surface ds-bezel-core">
          <AppNav active="Reports" />

          <div className="p-4 sm:p-6 lg:p-8">
            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-small text-fg-subtle">
              <a href="#reports" className="rounded-control hover:text-fg focus-ring">
                Reports
              </a>
              <ChevronRight aria-hidden strokeWidth={1.75} className="size-3.5" />
              <span aria-current="page" className="text-fg-muted">
                System design
              </span>
            </nav>

            <div className="mt-4 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="ds-display text-title text-fg">System design interview</h3>
                  <Badge>Sample data</Badge>
                </div>
                <p className="mt-2 text-small text-fg-muted">
                  Stripe, senior backend engineer <span aria-hidden className="text-fg-disabled">/</span> 3 Oct{" "}
                  <span aria-hidden className="text-fg-disabled">/</span> 32 min
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm">
                  <Share2 aria-hidden strokeWidth={1.75} />
                  Share
                </Button>
                <Button size="sm">
                  <RotateCcw aria-hidden strokeWidth={1.75} />
                  Practice again
                </Button>
              </div>
            </div>

            <Tabs
              className="mt-6"
              label="Report sections"
              defaultValue="overview"
              items={[
                { value: "overview", label: "Overview" },
                { value: "transcript", label: "Transcript" },
                { value: "feedback", label: "Feedback" },
              ]}
            />

            <div className="mt-6 grid gap-4 sm:gap-5 lg:grid-cols-12">
              <div className="flex flex-col gap-4 sm:gap-5 lg:col-span-8">
                <div className="ds-surface rounded-card p-5 sm:p-6">
                  <div className="grid gap-6 sm:grid-cols-[auto_1fr] sm:gap-10">
                    <div>
                      <p className="text-small font-medium text-fg-muted">Overall</p>
                      <p className="ds-display mt-1 text-metric tabular-nums text-fg">74</p>
                      <p className="mt-2 inline-flex items-center gap-1 text-small font-semibold text-success">
                        <ArrowUpRight aria-hidden strokeWidth={2} className="size-4" />
                        +8 since last session
                      </p>
                    </div>
                    <div className="grid gap-x-8 gap-y-4 self-center sm:grid-cols-2">
                      {SCORES.map((score) => (
                        <Meter key={score.label} label={score.label} value={score.value} />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="ds-surface rounded-card p-5 sm:p-6">
                  <PanelTitle>What changed</PanelTitle>
                  <div className="mt-4 grid gap-6 sm:grid-cols-2">
                    <div>
                      <p className="text-label font-semibold text-fg-subtle">Improved</p>
                      <ul className="mt-3 flex flex-col gap-3">
                        {IMPROVED.map((text) => (
                          <li key={text} className="flex gap-2.5 text-small text-fg">
                            <Check aria-hidden strokeWidth={2} className="mt-0.5 size-4 shrink-0 text-success" />
                            {text}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-label font-semibold text-fg-subtle">Still working on</p>
                      <ul className="mt-3 flex flex-col gap-3">
                        {WORKING_ON.map((text) => (
                          <li key={text} className="flex gap-2.5 text-small text-fg">
                            <CircleDot aria-hidden strokeWidth={2} className="mt-0.5 size-4 shrink-0 text-warning" />
                            {text}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="ds-surface rounded-card p-5 sm:p-6">
                  <div className="flex items-baseline justify-between gap-4">
                    <PanelTitle>Key moment</PanelTitle>
                    <span className="font-data text-label tabular-nums text-fg-subtle">12:40</span>
                  </div>
                  <blockquote className="mt-4 border-l-2 border-brand pl-4 text-body text-fg">
                    &ldquo;At about 50 million messages a day and 200 bytes each, that is roughly 3.6 terabytes a year
                    before replication.&rdquo;
                  </blockquote>
                  <p className="mt-3 text-small text-fg-muted">
                    <span className="font-semibold text-fg">Coach note</span> Clear estimate with stated assumptions.
                    Next time, size the read traffic as well.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-4 sm:gap-5 lg:col-span-4">
                <div className="rounded-card border border-memory-line bg-memory-soft p-5 sm:p-6">
                  <p className="flex items-center gap-2 text-small font-semibold text-fg">
                    <History aria-hidden strokeWidth={1.75} className="size-4 text-memory" />
                    From memory
                  </p>
                  <ul className="mt-3 flex flex-col gap-3">
                    {FROM_MEMORY.map((item) => (
                      <li key={item.text} className="text-small">
                        <p className="text-fg">{item.text}</p>
                        <p className="text-label font-normal text-fg-muted">{item.source}</p>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="ds-surface rounded-card p-5 sm:p-6">
                  <p className="text-label font-semibold text-fg-subtle">Next focus</p>
                  <p className="mt-2 text-subheading text-fg">Read-heavy scaling</p>
                  <p className="mt-1.5 text-small text-fg-muted">
                    Your next session opens with a read-path question and checks the result in each story.
                  </p>
                  <Button variant="accent" size="sm" className="mt-4 w-full">
                    Start next session
                    <ArrowRight aria-hidden strokeWidth={1.75} />
                  </Button>
                </div>

                <div className="ds-surface rounded-card px-5 py-4 sm:px-6">
                  <p className="text-label font-semibold text-fg-subtle">Recent interviews</p>
                  <ul className="mt-2 divide-y divide-line-subtle">
                    {RECENT.map((row) => (
                      <li key={`${row.title}-${row.date}`} className="flex items-center justify-between gap-3 py-2.5 text-small">
                        <span className="min-w-0 truncate">
                          <span className="font-medium text-fg">{row.title}</span>{" "}
                          <span className="text-fg-subtle">{row.date}</span>
                        </span>
                        <span className="font-semibold tabular-nums text-fg">{row.score}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <p className="mt-4 text-small text-fg-subtle">Product preview. Sample data; buttons are inactive.</p>
    </section>
  );
}
