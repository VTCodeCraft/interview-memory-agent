import { ArrowDown } from "lucide-react";

import { LINKS, STEPS, SUBTITLE, TITLE } from "./data";
import { EnginePanel, HowNote, HowPanel, InterviewNote, InterviewPanel, ProvidePanel, ReportPanel } from "./panels";
import { DottedArrow, LinkLabel, StepPill } from "./primitives";

/**
 * Coded version of the Demo.png / "Demo mobile.png" infographics for the
 * hero. The layout follows the component's own width (container queries).
 * Three arrangements from one DOM, in reading order:
 *   - 68rem and wider: the desktop artwork, four columns in a row with
 *     connectors, coaching-engine strip underneath
 *   - 42rem to 68rem (@2xl): the mobile artwork, step 1 full width, steps 2
 *     and 3 side by side, step 4 full width
 *   - narrower: everything stacked
 */
export default function CoachOverview() {
  return (
    <div className="@container bg-canvas">
      <div className="px-4 py-8 @xl:px-6 @xl:py-10">
        <div className="text-center">
          <p className="ds-display text-balance text-[clamp(1.625rem,1.1rem+2.2cqw,2.75rem)] leading-[1.1] font-semibold tracking-[-0.03em] text-fg">
            {TITLE.lead} <span className="text-brand">{TITLE.accent}</span>
          </p>
          <ul className="mx-auto mt-3 flex max-w-[52rem] flex-wrap items-center justify-center gap-x-3 gap-y-1 text-small text-fg-muted @xl:text-body">
            {SUBTITLE.map((item, index) => (
              <li key={item} className="flex items-center gap-3">
                {index > 0 && (
                  <span aria-hidden className="text-fg-subtle">
                    &bull;
                  </span>
                )}
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-y-6 @2xl:mt-10 @2xl:grid-cols-[minmax(0,1fr)_5.5rem_minmax(0,1fr)] @2xl:gap-x-0 @min-[68rem]:grid-cols-[minmax(0,0.95fr)_2rem_minmax(0,1.6fr)_1rem_minmax(0,1.15fr)_4.5rem_minmax(0,2.3fr)] @min-[68rem]:gap-y-8">
          {/* 1. You provide */}
          <section aria-label={STEPS.provide} className="flex flex-col gap-4 @2xl:col-span-3 @2xl:row-start-1 @min-[68rem]:col-span-1 @min-[68rem]:col-start-1">
            <StepPill n={1}>{STEPS.provide}</StepPill>
            <div className="relative">
              <ProvidePanel />
              {/* Bracket from the three cards into the interview room (desktop arrangement) */}
              <span aria-hidden className="absolute top-0 bottom-0 left-full hidden w-8 @min-[68rem]:block">
                <span className="absolute top-[16%] bottom-[16%] left-0 w-1/2 rounded-r-lg border-y-2 border-r-2 border-dotted border-line-control" />
                <span className="absolute top-1/2 left-0 w-1/2 border-t-2 border-dotted border-line-control" />
                <DottedArrow className="absolute top-1/2 right-0 left-1/2 -translate-y-1/2" />
              </span>
            </div>
          </section>

          {/* Connector 1 -> 2 in the two-column arrangement: dotted arrow down into the interview room */}
          <div aria-hidden className="hidden @2xl:col-span-3 @2xl:row-start-2 @2xl:-my-3 @2xl:flex @min-[68rem]:hidden">
            <span className="flex w-[calc((100%-5.5rem)/2)] justify-center text-fg-subtle">
              <span className="flex flex-col items-center">
                <span className="h-5 border-l-2 border-dotted border-line-control" />
                <ArrowDown strokeWidth={2} className="-mt-1 size-4" />
              </span>
            </span>
          </div>

          {/* 2. Real-time AI interview */}
          <section aria-label={STEPS.interview} className="flex flex-col gap-4 @2xl:col-start-1 @2xl:row-start-3 @min-[68rem]:col-start-3 @min-[68rem]:row-start-1">
            <StepPill n={2}>{STEPS.interview}</StepPill>
            <InterviewPanel />
            <InterviewNote className="mt-auto" />
          </section>

          {/* Connector 2 <-> 3 (two-column arrangement, as in the mobile artwork) */}
          <div aria-hidden className="hidden flex-col justify-around px-2 pt-12 @2xl:col-start-2 @2xl:row-start-3 @2xl:flex @min-[68rem]:hidden">
            <div className="flex flex-col gap-1.5">
              <LinkLabel lines={LINKS.practice} />
              <DottedArrow />
            </div>
            <div className="flex flex-col gap-1.5">
              <DottedArrow direction="left" />
              <LinkLabel lines={LINKS.analysis} />
            </div>
          </div>

          {/* 3. How it works */}
          <section aria-label={STEPS.how} className="flex flex-col gap-4 @2xl:col-start-3 @2xl:row-start-3 @min-[68rem]:col-start-5 @min-[68rem]:row-start-1">
            <StepPill n={3}>{STEPS.how}</StepPill>
            <HowPanel />
            <HowNote className="mt-auto" />
          </section>

          {/* Connector 3 -> 4 (desktop arrangement) */}
          <div aria-hidden className="hidden flex-col justify-between px-1 pt-[5.5rem] pb-[9rem] @min-[68rem]:col-start-6 @min-[68rem]:row-start-1 @min-[68rem]:flex">
            <div className="flex flex-col gap-1.5">
              <LinkLabel lines={LINKS.practice} />
              <DottedArrow />
            </div>
            <div className="flex flex-col gap-1.5">
              <DottedArrow />
              <LinkLabel lines={LINKS.analysis} />
            </div>
          </div>

          {/* 4. Interview report */}
          <section aria-label={STEPS.report} className="flex flex-col gap-4 @2xl:col-span-3 @2xl:row-start-4 @min-[68rem]:col-span-1 @min-[68rem]:col-start-7 @min-[68rem]:row-start-1">
            <StepPill n={4}>{STEPS.report}</StepPill>
            <ReportPanel />
          </section>

          {/* End-to-end engine */}
          <div className="@2xl:col-span-3 @2xl:row-start-5 @min-[68rem]:col-span-7 @min-[68rem]:row-start-2">
            <EnginePanel />
          </div>
        </div>
      </div>
    </div>
  );
}
