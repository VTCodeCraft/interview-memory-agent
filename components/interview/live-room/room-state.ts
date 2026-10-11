// Relative runtime imports keep this module runnable in Vitest without path aliases.
import type { ConversationState } from "@/types/voiceAgent";
import { FRIENDLY } from "../../../lib/utils/messages";

/**
 * View logic for the live interview room. It only reads what hooks/useVoiceAgent
 * already puts in useVoiceAgentStore (conversation state, error, progress); it
 * never drives the session.
 */

export type RoomMode = "connecting" | "speaking" | "your-turn" | "listening" | "working" | "finishing" | "complete" | "error";

export interface RoomStatus {
  mode: RoomMode;
  /** Short state label (header pill, orb caption). */
  label: string;
  /** One line telling the candidate what to do now. */
  hint: string;
}

const SPEAKING: ConversationState[] = [
  "GREETING",
  "SPEAK_BACKEND_QUESTION",
  "ASKING_QUESTION",
  "ACKNOWLEDGE_RESPONSE",
  "ASK_NEXT_QUESTION",
  "FINAL_QUESTION",
  "OPTIONAL_REPEAT",
  "OPTIONAL_CLARIFICATION",
];

/** States after the last answer; the page then queues the report and leaves (existing behaviour). */
export const FINISHING_STATES: ConversationState[] = ["THANK_CANDIDATE", "WAIT_FOR_BACKEND", "EVALUATING", "REPORT_READY"];

export function roomStatus(state: ConversationState): RoomStatus {
  if (state === "ERROR") return { mode: "error", label: "Disconnected", hint: "The voice session stopped." };
  if (state === "IDLE" || state === "CONNECTING") {
    return { mode: "connecting", label: "Connecting", hint: "Connecting to your interviewer." };
  }
  if (state === "READY") return { mode: "connecting", label: "Connected", hint: "Your interviewer will greet you shortly." };
  if (SPEAKING.includes(state)) {
    return { mode: "speaking", label: "Interviewer speaking", hint: "You can interrupt at any time by speaking." };
  }
  if (state === "QUESTION_SPOKEN" || state === "WAITING_FOR_FIRST_RESPONSE") {
    return { mode: "your-turn", label: "Your turn", hint: "Answer out loud when you're ready." };
  }
  if (state === "USER_STARTED_SPEAKING" || state === "USER_ANSWERING") {
    return { mode: "listening", label: "Listening", hint: "Say “that's my answer” when you're done." };
  }
  if (state === "ANSWER_COMPLETE" || state === "CALL_COMPLETE_ANSWER" || state === "SAVE_TRANSCRIPT" || state === "TRANSCRIPT_SENT") {
    return { mode: "working", label: "Saving your answer", hint: "One moment." };
  }
  if (state === "WAIT_FOR_BACKEND_QUESTION" || state === "QUESTION_RECEIVED" || state === "NEXT_QUESTION_RECEIVED") {
    return { mode: "working", label: "Preparing the question", hint: "One moment." };
  }
  if (state === "REPORT_READY") return { mode: "complete", label: "Interview complete", hint: "Your report is being prepared." };
  if (FINISHING_STATES.includes(state)) {
    return { mode: "finishing", label: "Wrapping up", hint: "Taking you to your report." };
  }
  return { mode: "connecting", label: "Connecting", hint: "Connecting to your interviewer." };
}

export interface ErrorGuidance {
  title: string;
  text: string;
  /** Reopening the page resumes from the first unanswered question (useInterview.resume). */
  canReconnect: boolean;
}

/** Plain guidance for the errors useVoiceAgent / the page put in the store. */
export function errorGuidance(error: string | null): ErrorGuidance {
  const message = error ?? "";
  if (message.includes("taken over")) {
    return {
      title: "This interview is open somewhere else",
      text: "It continued in another tab or on another device, so this window stopped.",
      canReconnect: false,
    };
  }
  if (message === "Microphone permission denied") {
    return {
      title: "Microphone access is blocked",
      text: "Allow microphone access for this site in your browser's settings, then reconnect.",
      canReconnect: true,
    };
  }
  if (message === "No microphone found") {
    return { title: "No microphone found", text: "Connect a microphone or headset, then reconnect.", canReconnect: true };
  }
  if (message === "Could not access the microphone" || message === FRIENDLY.microphone) {
    return {
      title: "Your microphone couldn't be used",
      text: "Close other apps using it, then reconnect.",
      canReconnect: true,
    };
  }
  if (message === FRIENDLY.connectionLost || message === FRIENDLY.voiceStartFailed || message === FRIENDLY.inactive) {
    return {
      title: "The voice connection stopped",
      text: "Check your network, then reconnect.",
      canReconnect: true,
    };
  }
  return {
    title: "Something went wrong",
    text: "Check this interview's status on its report page.",
    canReconnect: false,
  };
}

/** "Question 2 of 8", or null before the first question is asked. */
export function progressLabel(current: number, total: number): string | null {
  if (total <= 0) return null;
  return `Question ${Math.min(Math.max(current, 1), total)} of ${total}`;
}

/** Text of the question being asked (the store's progress is 1-based). */
export function currentQuestionText(
  questions: readonly { sequence: number; prompt?: string | null }[],
  current: number,
): string | null {
  if (current <= 0) return null;
  const ordered = questions.slice().sort((a, b) => a.sequence - b.sequence);
  return ordered[current - 1]?.prompt?.trim() || null;
}
