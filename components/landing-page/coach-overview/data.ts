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
  Users,
} from "lucide-react";

/**
 * Copy for the hero overview diagram. Layout follows the original
 * Demo.png / "Demo mobile.png" artwork; the wording describes only what the
 * product does today (prepared questions, voice interview with live
 * transcript, background report, memory from past reports).
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
  report: "Interview Report",
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
    body: "Your resume text is used to tailor the questions.",
    status: "Parsed",
    statusTone: "success",
  },
  {
    icon: Briefcase,
    tone: "neutral",
    title: "Job Description",
    body: "Skills are extracted from the job description you paste.",
    status: "Parsed",
    statusTone: "success",
  },
  {
    icon: Brain,
    tone: "memory",
    title: "Past Interview Memory",
    body: "Strengths, gaps & recommendations from past reports.",
    status: "Loaded",
    statusTone: "memory",
  },
];

export const INTERVIEW = {
  room: "Interview Room",
  live: "LIVE",
  timer: "12:47",
  name: "Aria",
  role: "Your AI Interviewer",
  question: "How would you design a scalable system to handle millions of concurrent users?",
  end: "End Interview",
  notes: "Live transcript",
  note: "Questions are prepared from your profile, JD & past reports.",
};

export const HOW: { icon: LucideIcon; tone: Tone; title: string; body: string }[] = [
  {
    icon: FileText,
    tone: "neutral",
    title: "Parse & Understand",
    body: "Resume, JD & past reports are loaded.",
  },
  {
    icon: Cpu,
    tone: "neutral",
    title: "Generate Questions",
    body: "A personalized question set is prepared.",
  },
  {
    icon: AudioLines,
    tone: "neutral",
    title: "Real-time Interview",
    body: "Answer out loud with a live transcript.",
  },
  {
    icon: Brain,
    tone: "memory",
    title: "Memory Updated",
    body: "Report strengths & gaps are saved for next time.",
  },
];

export const HOW_NOTE = "Each report adds to your interview memory.";
export const LINKS = { practice: ["Real-time", "Voice Practice"], analysis: ["After the", "interview"] };

export const REPORT = {
  title: "Session Report",
  date: "May 24, 2025",
  time: "11:30 AM",
  overall: 88,
  overallLabel: "Overall Score",
  metrics: [
    { icon: Code, label: "Technical", value: 91 },
    { icon: MessagesSquare, label: "Communication", value: 84 },
    { icon: ChartColumnIncreasing, label: "Confidence", value: 82 },
    { icon: Users, label: "Behavioral", value: 85 },
    { icon: Lightbulb, label: "Problem Solving", value: 87 },
  ] as { icon: LucideIcon; label: string; value: number }[],
  feedbackTitle: "Detailed Feedback",
  strengths: ["Strong system design fundamentals", "Clear, structured communication"],
  improve: ["Go deeper on trade-offs", "Keep long answers concise"],
  recommendation: {
    title: "Recommendation",
    body: "Focus on distributed systems, DB scaling and low-latency design.",
  },
};

export const ENGINE = {
  title: "End-to-End AI Coaching Engine",
  subtitle: "How each session builds on the last",
  steps: [
    { icon: Upload, tone: "neutral", title: "Input", body: "Resume, JD & past reports" },
    { icon: Brain, tone: "neutral", title: "AI Understanding", body: "Skills, role & context" },
    { icon: Sparkles, tone: "neutral", title: "Question Generation", body: "Personalized, prepared questions" },
    { icon: Mic, tone: "neutral", title: "Real-time Interview", body: "Voice interview, live transcript" },
    { icon: ChartColumnIncreasing, tone: "neutral", title: "Report", body: "Scores & feedback after you finish" },
    { icon: Brain, tone: "memory", title: "Memory Update", body: "Shapes your next interview" },
  ] as { icon: LucideIcon; tone: Tone; title: string; body: string }[],
  outcome: { title: "Outcome", lines: ["Focused practice.", "Clear feedback.", "Progress you can track."] },
};

