import Link from "next/link";
import type { ReactNode } from "react";
import { Plus } from "lucide-react";

import { ROUTES } from "@/lib/utils/constants";
import type { UsageWindow } from "@/lib/config/limits";
import SectionHeading from "./SectionHeading";

interface FaqItem {
  question: string;
  answer: ReactNode;
}

// Every answer describes the product as implemented; keep it that way when editing.
function buildFaqs(limit: number, period: UsageWindow): FaqItem[] {
  return [
    {
      question: "What is Clutchly?",
      answer:
        "An AI coach for voice mock interviews. It remembers how your previous interviews went and uses that history, together with your resume and target role, when it prepares each new interview.",
    },
    {
      question: "How does a voice interview work?",
      answer:
        "You answer out loud in your browser. The AI interviewer works through a set of questions prepared for that session and moves on when you finish an answer. You can interrupt it, ask it to repeat a question or skip one, and a live transcript is shown while you speak.",
    },
    {
      question: "What does Clutchly remember between interviews?",
      answer:
        "Once a report is ready, Clutchly saves a summary of it to your interview memory: your scores, strengths, weaknesses, missing topics and recommendations. That memory is used when the questions for your next interview are prepared, with the aim of revisiting weak spots that keep recurring.",
    },
    {
      question: "Which interviews can I practice?",
      answer:
        "Technical, behavioral and system design interviews, at Junior, Mid-Level or Senior+ level. Questions are geared toward software engineering roles. Technical interviews are discussion-based; there is no coding editor.",
    },
    {
      question: "How are the questions personalized?",
      answer:
        "Questions are generated from your resume (PDF), your target role, the company and level you choose, and an optional job description you paste in. Your interview memory adds context from earlier sessions.",
    },
    {
      question: "What is in a report?",
      answer:
        "Six scores (overall, technical, communication, problem solving, confidence and behavioral), plus strengths, weaknesses, missing topics and recommendations. Reports are generated in the background after an interview ends and appear on your Reports page when ready.",
    },
    {
      question: "How much does it cost?",
      answer: `Clutchly is currently free, with up to ${limit} interviews per ${period}. Cancelled interviews count toward the limit, and one interview can be in progress at a time.`,
    },
    {
      question: "What do I need to get started?",
      answer:
        "A browser, a microphone and a resume in PDF format. You will check your microphone before the interview starts.",
    },
    {
      question: "Which languages are supported?",
      answer: "Interviews are in English.",
    },
    {
      question: "Can I update my resume?",
      answer: "Yes. You can replace your resume from Profile & Settings at any time, except while an interview is in progress.",
    },
    {
      question: "How is my data handled?",
      answer: (
        <>
          Your resume text, interview answers and reports are stored with your account and processed by the AI
          services that run interviews and reports, including Deepgram for voice and Google Gemini for questions and
          evaluation. You can reset your interview memory or delete your account, which deletes your data. See the{" "}
          <Link href={ROUTES.privacy} className="rounded-control font-medium text-brand underline-offset-4 hover:underline focus-ring">
            Privacy Policy
          </Link>{" "}
          for details.
        </>
      ),
    },
  ];
}

export default function FaqSection({ limit, period }: { limit: number; period: UsageWindow }) {
  const faqs = buildFaqs(limit, period);

  return (
    <section id="faq" aria-labelledby="faq-title" className="ds-container scroll-mt-20 pt-(--spacing-section)">
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-4">
          <SectionHeading id="faq-title" title="Questions, answered." className="lg:block" />
          <p className="mt-4 max-w-[30rem] text-body text-fg-muted">What to expect before your first interview.</p>
        </div>

        <div className="divide-y divide-line border-y border-line lg:col-span-8">
          {faqs.map((faq, index) => (
            <details key={faq.question} open={index === 0} className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 rounded-control py-5 text-left focus-ring [&::-webkit-details-marker]:hidden">
                <h3 className="text-subheading text-fg">{faq.question}</h3>
                <Plus
                  aria-hidden
                  strokeWidth={1.75}
                  className="size-5 shrink-0 text-fg-subtle transition-transform duration-(--duration-base) ease-standard group-open:rotate-45"
                />
              </summary>
              <div className="max-w-[62ch] pb-6 text-body text-fg-muted">{faq.answer}</div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
