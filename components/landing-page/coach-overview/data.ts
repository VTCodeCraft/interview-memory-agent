import type { LucideIcon } from "lucide-react";
import {
  AudioLines,
  Brain,
  Briefcase,
  ChartColumnIncreasing,
  Code,
  Cpu,
  FileText,
  Lightbulb,
  MessagesSquare,
  Mic,
  Sparkles,
  Upload,
} from "lucide-react";

/**
 * Copy for the hero overview diagram, reproduced from the original
 * Demo.png / "Demo mobile.png" infographics. Edit the wording here.
 */

/** Icon tone. Precision is ink-first; ultramarine (memory) marks memory and intelligence. */
export type Tone = "neutral" | "memory";
/** Status badge tone. */
export type StatusTone = "success" | "memory";

export const TITLE = { lead: "AI Interview Coach That", accent: "Never Forgets" };
export const SUBTITLE = ["Real-time voice interviews", "Personalized questions", "Long-term memory", "Actionable feedback"];

export const STEPS = {
  provide: "You Provide",
  interview: "Real-time AI Interview",
  how: "How It Works",
  report: "Instant AI Report",
};

export const PROVIDE: {
  icon: LucideIcon;
  tone: Tone;
  title: string;
  body: string;
  status: string;
  statusTone: StatusTone;
}[] = [
  {
    icon: FileText,
    tone: "neutral",
    title: "Resume",
    body: "We parse your resume for skills, roles & achievements.",
    status: "Parsed",
    statusTone: "success",
  },
  {
    icon: Briefcase,
    tone: "neutral",
    title: "Job Description",
    body: "We analyze the JD for role, skills & expectations.",
    status: "Parsed",
    statusTone: "success",
  },
  {
    icon: Brain,
    tone: "memory",
    title: "Past Interview Memory",
    body: "We remember past interviews, answers & feedback.",
    status: "Loaded",
    statusTone: "memory",
  },
];

export const INTERVIEW = {
  room: "Interview Room",
  live: "LIVE",
  timer: "12:47",
  name: "Ava",
  role: "Your AI Interviewer",
  question: "How would you design a scalable system to handle millions of concurrent users?",
  end: "End Interview",
  notes: "View Notes",
  note: "AI adapts every question based on your profile, JD & past performance.",
};

export const HOW: { icon: LucideIcon; tone: Tone; title: string; body: string }[] = [
  {
    icon: FileText,
    tone: "neutral",
    title: "Parse & Understand",
    body: "Resume, JD & past interview memory are loaded.",
  },
  {
    icon: Cpu,
    tone: "neutral",
    title: "Generate Questions",
    body: "AI writes role-specific questions for you.",
  },
  {
    icon: AudioLines,
    tone: "neutral",
    title: "Real-time Interview",
    body: "A voice conversation, like a real interviewer.",
  },
  {
    icon: Brain,
    tone: "memory",
    title: "Memory Updated",
    body: "New answers & feedback are saved for next time.",
  },
];

export const HOW_NOTE = "The more you practice, the smarter AI gets.";
export const LINKS = { practice: ["Real-time", "Voice Practice"], analysis: ["Instant", "Analysis"] };

export const REPORT = {
  title: "Session Report",
  date: "May 24, 2025",
  time: "11:30 AM",
  overall: 88,
  overallLabel: "Overall Score",
  metrics: [
    { icon: Code, label: "Technical", value: 91 },
    { icon: MessagesSquare, label: "Communication", value: 84 },
    { icon: ChartColumnIncreasing, label: "Readiness", value: 92 },
    { icon: Lightbulb, label: "Problem Solving", value: 87 },
  ] as { icon: LucideIcon; label: string; value: number }[],
  feedbackTitle: "Detailed Feedback",
  strengths: ["Strong system design fundamentals", "Clear, structured communication", "Good problem-solving approach"],
  improve: ["Go deeper on trade-offs", "Handle more edge cases", "Keep long answers concise"],
  recommendation: {
    title: "AI Recommendation",
    body: "Focus on distributed systems, DB scaling and low-latency design.",
  },
  tiles: [
    { label: "Answer Quality", value: 85, grade: "Good" },
    { label: "Confidence", value: 82, grade: "Good" },
    { label: "Clarity", value: 89, grade: "Excellent" },
  ] as { label: string; value: number; grade: string }[],
};

export const ENGINE = {
  title: "End-to-End AI Coaching Engine",
  subtitle: "Everything works together to make you interview-ready",
  steps: [
    { icon: Upload, tone: "neutral", title: "Input", body: "Resume, JD & Past Memory" },
    { icon: Brain, tone: "neutral", title: "AI Understanding", body: "Extract skills, role & context" },
    { icon: Sparkles, tone: "neutral", title: "Question Generation", body: "Personalized questions for you" },
    { icon: Mic, tone: "neutral", title: "Real-time Interview", body: "Voice conversation with AI" },
    { icon: ChartColumnIncreasing, tone: "neutral", title: "Instant Report", body: "Detailed score & feedback" },
    { icon: Brain, tone: "memory", title: "Memory Update", body: "Smarter AI for next interview" },
  ] as { icon: LucideIcon; tone: Tone; title: string; body: string }[],
  outcome: { title: "Outcome", lines: ["Better preparation.", "Stronger interviews.", "More offers."] },
};

