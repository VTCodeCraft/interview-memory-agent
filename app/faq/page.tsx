import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FaqAccordion, { type FaqItem } from "@/components/faq/FaqAccordion";
import {
  CONTACT_FORM_URL,
  FEEDBACK_FORM_URL,
  ROUTES,
} from "@/lib/utils/constants";

export const metadata: Metadata = {
  title: "FAQ | Clutchly",
  description:
    "Frequently asked questions about Clutchly, the AI interview coach that learns from every interview.",
  openGraph: {
    title: "FAQ | Clutchly",
    description:
      "Frequently asked questions about Clutchly, the AI interview coach that learns from every interview.",
    type: "website",
  },
  alternates: {
    canonical: "/faq",
  },
};

const FAQ_ITEMS: FaqItem[] = [
  {
    question: "What is Clutchly?",
    answer:
      "Clutchly is your personal AI interview coach. It helps you prepare through realistic voice interviews, detailed feedback, and a long-term interview profile that grows with you—so every session builds on the last instead of starting from zero.",
  },
  {
    question: "How does Clutchly work?",
    answer:
      "Set your target role and upload your resume, then practice voice interviews tailored to you. After each session, Clutchly evaluates your answers, surfaces strengths and weak spots, and uses that history to personalize your next interview.",
  },
  {
    question: "How are interviews personalized?",
    answer:
      "Interviews draw on your resume, target role, job description (when provided), and past performance. Clutchly prioritizes topics where you need improvement and adapts difficulty so practice stays relevant to the jobs you're targeting.",
  },
  {
    question: "Does Clutchly remember my previous interviews?",
    answer:
      "Yes. Persistent interview memory is core to Clutchly. Past answers, recurring mistakes, progress trends, and feedback are retained so follow-up sessions revisit what still needs work and reinforce what you've improved.",
  },
  {
    question: "Can I practice technical and behavioral interviews?",
    answer:
      "Yes. You can practice technical, behavioral, system design, and role-specific interviews. Sessions can be tuned to your level and the type of questions you're most likely to face.",
  },
  {
    question: "How are interview reports generated?",
    answer:
      "After you complete a session, Clutchly analyzes your responses for content quality, structure, communication, and relevance. You receive an actionable report with scores, highlights, and clear next steps—saved to your interview history.",
  },
  {
    question: "What happens if AI is temporarily unavailable?",
    answer:
      "If an AI service is temporarily unavailable, you may see a clear error and be asked to try again shortly. Your account, profile, and completed interview history remain intact. In-progress sessions may need to be restarted once service is restored.",
  },
  {
    question: "Is my resume and interview data secure?",
    answer:
      "We take data protection seriously. Your resume, interview responses, and profile data are used to personalize your coaching experience and are handled according to our Privacy Policy. Access is protected through authenticated accounts.",
  },
  {
    question: "Can I upload a new resume?",
    answer:
      "Yes. You can upload or replace your resume from onboarding and settings. Updating your resume helps Clutchly keep questions and personalization aligned with your latest experience.",
  },
  {
    question: "Can I practice with different companies?",
    answer:
      "Yes. You can set target companies and roles so practice scenarios feel closer to the interviews you're preparing for. Pairing a job description with your profile makes sessions even more specific.",
  },
  {
    question: "How many interviews can I take?",
    answer:
      "Your available interview volume depends on your account and current usage limits. You can review remaining usage in the product. Limits help keep quality high while we continue expanding capacity.",
  },
  {
    question: "Does Clutchly support voice interviews?",
    answer:
      "Yes. Realistic AI voice interviews are a core part of Clutchly. Speaking answers out loud helps you practice pacing, clarity, and confidence the way you would in a real interview.",
  },
  {
    question: "Which AI models power Clutchly?",
    answer:
      "Clutchly uses modern language and speech models for interview conversation, evaluation, and feedback. We select providers for quality, reliability, and privacy-conscious handling of your data. Model choices may evolve as capabilities improve.",
  },
  {
    question: "Is my data shared with recruiters?",
    answer:
      "No. Clutchly does not sell or share your interview data, resume, or performance reports with recruiters or third parties for hiring purposes. Your practice stays private to your account unless you choose to export or share it yourself.",
  },
  {
    question: "How can I contact support?",
    answer:
      "Use the Contact Support form linked in the footer or at the bottom of this page. For product feedback, use Give Feedback. For technical issues, Report a Bug is also available from the footer.",
  },
];

// FAQPage structured data for rich results (invisible, SEO-only).
const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ_ITEMS.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  })),
};

export default function FaqPage() {
  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative pt-16 pb-12 md:pt-20 md:pb-16 overflow-hidden grid-bg">
          <div className="max-w-container-max mx-auto px-6 md:px-8 text-center">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-fixed text-primary font-semibold text-[11px] uppercase tracking-wider mb-6 border border-primary/10">
              <span className="material-symbols-outlined text-[14px]">help</span>
              Support
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-4 max-w-3xl mx-auto">
              Frequently Asked Questions
            </h1>
            <p className="text-base md:text-lg text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
              Everything you need to know about Clutchly, AI interviews,
              reports, and your interview preparation journey.
            </p>
          </div>
        </section>

        {/* Accordion */}
        <section
          className="py-12 md:py-16 lg:py-20 bg-surface"
          aria-labelledby="faq-list-heading"
        >
          <div className="max-w-3xl mx-auto px-6 md:px-8">
            <h2 id="faq-list-heading" className="sr-only">
              Questions and answers
            </h2>
            <FaqAccordion items={FAQ_ITEMS} />
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="py-16 md:py-24 px-6 md:px-8">
          <div className="max-w-3xl mx-auto bg-primary-fixed rounded-[32px] p-10 md:p-14 text-center border border-primary/10">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-3">
              Still have questions?
            </h2>
            <p className="text-base md:text-lg text-on-primary-fixed-variant mb-8 mx-auto leading-relaxed">
              We&apos;re here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <a
                href={CONTACT_FORM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-full sm:w-auto bg-primary text-white px-8 py-3.5 rounded-[14px] font-semibold text-sm shadow-lg shadow-primary/20 hover:bg-[#4338CA] transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2"
              >
                Contact Support
              </a>
              <a
                href={FEEDBACK_FORM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-full sm:w-auto bg-white/50 backdrop-blur-sm border border-primary/20 text-primary px-8 py-3.5 rounded-[14px] font-semibold text-sm hover:bg-white transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2"
              >
                Give Feedback
              </a>
            </div>
            <p className="mt-8 text-sm text-on-surface-variant">
              Prefer to keep practicing?{" "}
              <Link
                href={ROUTES.home}
                className="font-semibold text-primary hover:underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-sm"
              >
                Back to home
              </Link>
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
