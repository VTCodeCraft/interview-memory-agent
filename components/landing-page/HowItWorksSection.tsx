import AuthCta, { type AuthState } from "./AuthCta";
import SectionHeading from "./SectionHeading";

const STEPS = [
  {
    title: "Set up your profile",
    body: "Add your target role and experience level, and upload your resume as a PDF.",
  },
  {
    title: "Choose the interview",
    body: "Pick technical, behavioral or system design, the company and level, and paste a job description if you have one.",
  },
  {
    title: "Answer out loud",
    body: "Check your microphone, then talk through each question with the AI interviewer while a live transcript follows along.",
  },
  {
    title: "Review and go again",
    body: "Your report is generated after you finish. Its strengths and gaps are saved to memory and shape your next interview.",
  },
];

export default function HowItWorksSection(auth: AuthState) {
  return (
    <section id="how-it-works" aria-labelledby="how-title" className="ds-container mt-(--spacing-section) scroll-mt-22">
      <SectionHeading
        id="how-title"
        title="How Clutchly works."
        intro="Set up once, then practice whenever you are ready. Each interview gives the next one more to work with."
      />

      <ol className="mt-10 grid gap-x-8 gap-y-10 sm:mt-14 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((step, index) => (
          <li key={step.title} className="border-t border-line-strong pt-5">
            <span className="font-data text-small tabular-nums text-brand">{String(index + 1).padStart(2, "0")}</span>
            <h3 className="mt-3 text-heading text-fg">{step.title}</h3>
            <p className="mt-2 text-body text-fg-muted">{step.body}</p>
          </li>
        ))}
      </ol>

      <div className="mt-12 flex flex-col gap-5 rounded-card border border-line bg-panel p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <p className="max-w-[40ch] text-heading text-fg">
          Your first interview sets the baseline. <span className="text-fg-muted">Every one after builds on it.</span>
        </p>
        <AuthCta {...auth} size="md" signedOutLabel="Start your first interview" />
      </div>
    </section>
  );
}
