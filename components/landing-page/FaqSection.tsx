'use client';

import React, { useState } from 'react';
import SectionHeading from './SectionHeading';

interface FaqItem {
  question: string;
  answer: string;
}

export default function FaqSection() {
  const [activeFaq, setActiveFaq] = useState<number | null>(0); // First item open by default

  const handleToggle = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const faqs: FaqItem[] = [
    {
      question: "What is Clutchly?",
      answer: "Clutchly is your personal AI interview coach. It helps you prepare through realistic voice interviews, detailed feedback, and a long-term interview profile that grows with you—so every session builds on the last instead of starting from zero."
    },
    {
      question: "How does Clutchly work?",
      answer: "Set your target role and upload your resume, then practice voice interviews tailored to you. After each session, Clutchly evaluates your answers, surfaces strengths and weak spots, and uses that history to personalize your next interview."
    },
    {
      question: "Is it really like talking to a real interviewer?",
      answer: "Yes. Clutchly uses advanced low-latency voice synthesis and LLMs trained on thousands of technical and behavioral interview rubrics to simulate the nuance, follow-up questions, and pressure of a live conversation."
    },
    {
      question: "How are interviews personalized?",
      answer: "Interviews draw on your resume, target role, job description (when provided), and past performance. Clutchly prioritizes topics where you need improvement and adapts difficulty so practice stays relevant to the jobs you're targeting."
    },
    {
      question: "Does Clutchly remember my previous interviews?",
      answer: "Yes. Persistent interview memory is core to Clutchly. Past answers, recurring mistakes, progress trends, and feedback are retained so follow-up sessions revisit what still needs work and reinforce what you've improved."
    },
    {
      question: "Can I practice technical and behavioral interviews?",
      answer: "Yes. You can practice technical, behavioral, system design, and role-specific interviews. Sessions can be tuned to your level and the type of questions you're most likely to face."
    },
    {
      question: "Does it support coding and technical assessments?",
      answer: "Yes, our technical mode includes a split-screen IDE. The AI interviewer can see your code in real-time, ask you to explain your logic, and suggest edge cases you might have missed."
    },
    {
      question: "How are interview reports generated?",
      answer: "After you complete a session, Clutchly analyzes your responses for content quality, structure, communication, and relevance. You receive an actionable report with scores, highlights, and clear next steps—saved to your interview history."
    },
    {
      question: "Is my resume and interview data secure?",
      answer: "We take data protection seriously. Your resume, interview responses, and profile data are used to personalize your coaching experience and are handled according to our Privacy Policy. Access is protected through authenticated accounts."
    },
    {
      question: "Can I upload a new resume?",
      answer: "Yes. You can upload or replace your resume from onboarding and settings. Updating your resume helps Clutchly keep questions and personalization aligned with your latest experience."
    },
    {
      question: "Can I practice with different companies?",
      answer: "Yes. You can set target companies and roles so practice scenarios feel closer to the interviews you're preparing for. Pairing a job description with your profile makes sessions even more specific."
    },
    {
      question: "How many interviews can I take?",
      answer: "Your available interview volume depends on your account and current usage limits. You can review remaining usage in the product. Limits help keep quality high while we continue expanding capacity."
    },
    {
      question: "Which AI models power Clutchly?",
      answer: "Clutchly uses modern language and speech models for interview conversation, evaluation, and feedback. We select providers for quality, reliability, and privacy-conscious handling of your data. Model choices may evolve as capabilities improve."
    },
    {
      question: "Is my data shared with recruiters?",
      answer: "No. Clutchly does not sell or share your interview data, resume, or performance reports with recruiters or third parties for hiring purposes. Your practice stays private to your account unless you choose to export or share it yourself."
    },
    {
      question: "Which languages are supported?",
      answer: "Currently, we fully support English, Spanish, French, and German. We are rolling out support for Japanese and Mandarin in the coming months to help global candidates."
    },
    {
      question: "Can I practice for non-tech roles?",
      answer: "While we specialize in tech and product roles, Clutchly is highly effective for Sales, Marketing, and Operations interviews. Simply upload your JD and the AI will adapt accordingly."
    },
    {
      question: "Do you offer a free trial?",
      answer: "Yes, your first 20-minute interview session is on us. No credit card required. You'll get a full feedback report to see the value of the platform immediately."
    }
  ];

  return (
    <main id="faq" className="w-full flex flex-col items-center py-0 px-margin-mobile md:px-margin-desktop text-on-surface">
      <SectionHeading
        className="mt-12 md:mt-20"
        badge="FAQ"
        title="Frequently asked questions"
        subtitle="Everything you need to know before starting your first AI interview."
      />

      {/* FAQ Accordion */}
      <section className="w-full max-w-[850px]">
        <div className="flex flex-col">
          {faqs.map((faq, index) => (
            <div 
              key={index}
              className={`border-t border-outline-variant py-md group cursor-pointer ${
                index === faqs.length - 1 ? 'border-b' : ''
              }`}
              onClick={() => handleToggle(index)}
            >
              <div className="flex justify-between items-center gap-md">
                <h3 className="font-headline-sm text-[20px] md:text-headline-sm text-on-surface group-hover:text-primary transition-colors duration-200">
                  {faq.question}
                </h3>
                <span className={`material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-transform duration-300 ${
                  activeFaq === index ? 'rotate-45' : ''
                }`}>
                  add
                </span>
              </div>
              <div className={`accordion-content mt-sm ${
                activeFaq === index ? 'accordion-content-active' : ''
              }`}>
                <p className="font-body-md text-body-md text-on-surface-variant max-w-3xl">
                  {faq.answer}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>


    </main>
  );
}
