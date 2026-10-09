import type { LucideIcon } from "lucide-react";
import { AudioLines, FileText, History, Layers } from "lucide-react";

import { cn } from "@/lib/utils";
import SectionHeading from "./SectionHeading";
import { Waveform } from "./visuals";

function CellLabel({ icon: Icon, children, inverse }: { icon: LucideIcon; children: string; inverse?: boolean }) {
  return (
    <p className={cn("flex items-center gap-2 text-small font-medium", inverse ? "text-fg-inverse/75" : "text-fg-muted")}>
      <Icon aria-hidden strokeWidth={1.75} className={cn("size-4", inverse ? "text-fg-inverse" : "text-brand")} />
      {children}
    </p>
  );
}

function CellTitle({ children, inverse }: { children: string; inverse?: boolean }) {
  return <h3 className={cn("ds-display mt-4 text-balance text-title", inverse ? "text-fg-inverse" : "text-fg")}>{children}</h3>;
}

const MEMORY_RECORD = [
  { label: "Scores", value: "Six areas, every interview" },
  { label: "Strengths", value: "What went well" },
  { label: "Weaknesses", value: "Where answers fell short" },
  { label: "Missing topics", value: "What you didn't cover" },
  { label: "Recommendations", value: "What to practice next" },
];

const INPUTS = ["Resume (PDF)", "Target role", "Company", "Level", "Job description (optional)"];

const TYPES = [
  { name: "Technical", note: "Discussion of concepts and trade-offs" },
  { name: "Behavioral", note: "Stories about how you work" },
  { name: "System design", note: "Designing and scaling systems" },
];

export default function CoreFeaturesSection() {
  return (
    <section id="features" aria-labelledby="features-title" className="ds-container scroll-mt-20 pt-(--spacing-section)">
      <SectionHeading
        id="features-title"
        title="Practice that builds on itself."
        intro="Every interview leaves a record. Clutchly reads it before preparing the next one, so practice keeps returning to the areas you need most."
      />

      <div className="mt-10 grid gap-4 sm:mt-14 sm:gap-5 lg:grid-cols-12">
        <article className="flex flex-col justify-between gap-8 rounded-card bg-inverse p-6 text-fg-inverse shadow-card sm:p-8 lg:col-span-7">
          <div>
            <CellLabel icon={AudioLines} inverse>
              Voice interviews
            </CellLabel>
            <CellTitle inverse>Answer out loud, in real time.</CellTitle>
            <p className="mt-3 max-w-[44ch] text-body text-fg-inverse/75">
              Speak your answers the way you would in the room. Interrupt the interviewer, ask it to repeat a
              question or skip one, and follow along with a live transcript.
            </p>
          </div>
          <div className="flex flex-col gap-3 rounded-control border border-fg-inverse/12 bg-fg-inverse/[0.04] p-4">
            <p className="text-small">
              <span className="font-semibold text-fg-inverse">Interviewer</span>{" "}
              <span className="text-fg-inverse/75">Tell me about a project where requirements changed late.</span>
            </p>
            <p className="text-small">
              <span className="font-semibold text-fg-inverse">You</span>{" "}
              <span className="text-fg-inverse/75">Two weeks before launch, our largest customer asked for&hellip;</span>
            </p>
            <div className="flex items-center gap-3 text-fg-inverse/80">
              <Waveform bars={34} />
              <span className="text-label font-medium">Listening</span>
            </div>
          </div>
        </article>

        <article className="ds-surface flex flex-col justify-between gap-8 rounded-card p-6 sm:p-8 lg:col-span-5">
          <div>
            <CellLabel icon={History}>Interview memory</CellLabel>
            <CellTitle>A record that carries forward.</CellTitle>
            <p className="mt-3 text-body text-fg-muted">
              After each report, Clutchly saves what it learned to your interview memory and uses it when it
              prepares your next interview.
            </p>
          </div>
          <dl className="divide-y divide-line-subtle border-y border-line-subtle">
            {MEMORY_RECORD.map((row) => (
              <div key={row.label} className="flex items-baseline justify-between gap-4 py-2.5 text-small">
                <dt className="font-medium text-fg">{row.label}</dt>
                <dd className="text-right text-fg-subtle">{row.value}</dd>
              </div>
            ))}
          </dl>
        </article>

        <article className="ds-surface flex flex-col justify-between gap-8 rounded-card p-6 sm:p-8 lg:col-span-5">
          <div>
            <CellLabel icon={FileText}>Personalized questions</CellLabel>
            <CellTitle>Questions built around you.</CellTitle>
            <p className="mt-3 text-body text-fg-muted">
              Each interview is generated from your resume, the role and company you are targeting, the level you
              choose and, if you add one, the job description.
            </p>
          </div>
          <ul className="flex flex-wrap gap-2" aria-label="What questions are based on">
            {INPUTS.map((input) => (
              <li key={input} className="rounded-badge border border-line bg-canvas px-2.5 py-1 text-small text-fg">
                {input}
              </li>
            ))}
          </ul>
        </article>

        <article className="ds-surface flex flex-col justify-between gap-8 rounded-card p-6 sm:p-8 lg:col-span-7">
          <div>
            <CellLabel icon={Layers}>Interview types</CellLabel>
            <CellTitle>Technical, behavioral and system design.</CellTitle>
            <p className="mt-3 max-w-[48ch] text-body text-fg-muted">
              Choose the type for each session and set the level to Junior, Mid-Level or Senior+. Questions are
              geared toward software engineering roles.
            </p>
          </div>
          <ul className="grid gap-3 sm:grid-cols-3">
            {TYPES.map((type) => (
              <li key={type.name} className="rounded-control border border-line bg-canvas p-4">
                <p className="text-small font-semibold text-fg">{type.name}</p>
                <p className="mt-1 text-label font-normal text-fg-subtle">{type.note}</p>
              </li>
            ))}
          </ul>
        </article>
      </div>
    </section>
  );
}
