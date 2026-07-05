/**
 * Types for the Deepgram Voice Agent interview experience.
 * The conversation state machine drives the UI and structured logs.
 */

export const VOICE_AGENT_STATES = [
  "IDLE",
  "CONNECTING",
  "READY",
  "GREETING",
  "WAIT_FOR_BACKEND_QUESTION",
  "QUESTION_RECEIVED",
  "SPEAK_BACKEND_QUESTION",
  "QUESTION_SPOKEN",
  "ASKING_QUESTION",
  "WAITING_FOR_FIRST_RESPONSE",
  "USER_STARTED_SPEAKING",
  "USER_ANSWERING",
  "OPTIONAL_REPEAT",
  "OPTIONAL_CLARIFICATION",
  "ANSWER_COMPLETE",
  "CALL_COMPLETE_ANSWER",
  "SAVE_TRANSCRIPT",
  "TRANSCRIPT_SENT",
  "NEXT_QUESTION_RECEIVED",
  "ACKNOWLEDGE_RESPONSE",
  "ASK_NEXT_QUESTION",
  "FINAL_QUESTION",
  "THANK_CANDIDATE",
  "WAIT_FOR_BACKEND",
  "EVALUATING",
  "REPORT_READY",
  "ERROR",
] as const;

export type ConversationState = (typeof VOICE_AGENT_STATES)[number];

export interface VoiceAgentTransitionLog {
  event: "voice_agent_state_transition";
  from: ConversationState;
  to: ConversationState;
  interviewId: string;
  sequence: number;
  reason?: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
}

export function buildVoiceAgentTransitionLog(params: {
  from: ConversationState;
  to: ConversationState;
  interviewId: string;
  sequence: number;
  reason?: string;
  metadata?: Record<string, unknown>;
}): VoiceAgentTransitionLog {
  return {
    event: "voice_agent_state_transition",
    from: params.from,
    to: params.to,
    interviewId: params.interviewId,
    sequence: params.sequence,
    ...(params.reason ? { reason: params.reason } : {}),
    ...(params.metadata ? { metadata: params.metadata } : {}),
    timestamp: new Date().toISOString(),
  };
}

export type TurnRole = "ai" | "user";

export interface ConversationTurn {
  id: string;
  role: TurnRole;
  text: string;
  /** True while this is a not-yet-finalized live transcript bubble. */
  live?: boolean;
}
