import type { Deepgram } from "@deepgram/sdk";

/**
 * Voice Agent configuration for the interview conductor.
 *
 * The agent NEVER generates questions. Gemini already produced them and the
 * backend injects each one verbatim via `InjectAgentMessage`. The agent only
 * conducts the conversation: it speaks the injected question, listens, handles
 * repeat/clarify requests naturally, and calls the `complete_answer` function
 * when the candidate has finished. A client-side silence timer is the fallback
 * (see SILENCE_TIMEOUT_MS) if the LLM stalls.
 *
 * Client-safe: no `server-only` import here. This builds the JSON settings the
 * browser sends over the agent WebSocket.
 */

/** Mic capture format (sent to the agent). */
export const AGENT_INPUT_SAMPLE_RATE = 16000;
/** Agent TTS output format (played back in the browser). */
export const AGENT_OUTPUT_SAMPLE_RATE = 24000;
/** KeepAlive cadence. The skill example pings every 5s to preserve the session. */
export const AGENT_KEEPALIVE_MS = 5000;
/**
 * Turn-taking is driven ENTIRELY by the client (this app), never by the agent
 * LLM. When the candidate stops talking we wait through a TWO-STAGE grace period
 * so a mid-answer thinking pause can never cut them off:
 *
 *   Stage 1 (SILENCE_STAGE1_MS): they just paused. Most likely still thinking.
 *                                Hold and keep listening.
 *   Stage 2 (SILENCE_STAGE2_MS): still nothing. Give one final beat, then move
 *                                on to the next question.
 *
 * ANY new speech during either stage resets the whole window from the start, so
 * an in-progress answer is never interrupted. Total about 7.5s of real silence
 * before advancing, matching how a human interviewer waits for you to finish.
 */
export const SILENCE_STAGE1_MS = 4000;
export const SILENCE_STAGE2_MS = 3500;

/**
 * FALLBACK-only silence window while the candidate is answering (USER_ANSWERING).
 * Primary answer-completion is the Voice Agent LLM calling complete_answer; this
 * timer only fires if the LLM stalls. Measured from when the candidate LAST
 * spoke. Any new speech resets it, so mid-answer thinking pauses never trigger
 * it. Kept in the 5-8s band a real interviewer waits before assuming you're done.
 */
export const SILENCE_FALLBACK_MS = 18000;

/**
 * Minimum transcript character length that the candidate must have spoken
 * before a `complete_answer` FunctionCallRequest is accepted as authoritative.
 * Guards against gpt-4o-mini-style eagerness where the LLM fires on tiny
 * fragments like "Starting with..." or "data,". Any call under this threshold
 * is ACK'd as ignored and we keep listening.
 */
export const MIN_ANSWER_CHARS = 40;

/**
 * Minimum wall-clock time (ms) that must have elapsed since the question was
 * first spoken before a `complete_answer` function call is accepted. Prevents
 * the LLM from advancing the turn in the first few seconds of the candidate's
 * answer before they have had a chance to say anything substantive.
 */
export const MIN_TURN_MS = 15000;

/** Minimum quiet time after the last transcript segment before accepting completion. */
export const MIN_SILENCE_BEFORE_FUNCTION_MS = 8000;

/**
 * How long (ms) to wait after sending the FunctionCallResponse ACK before
 * injecting the next question. This small gap lets the LLM's "stay silent"
 * instruction propagate fully before the InjectAgentMessage arrives, preventing
 * the race condition where the LLM generates its own question in the gap.
 */
export const INJECT_DELAY_MS = 300;

/**
 * Fast path: when the candidate explicitly signals they are finished ("next
 * question", "that's my answer", "I'm done"), we only wait this short beat.
 * Long enough to be sure they are not mid-sentence, then advance.
 */
export const EXPLICIT_DONE_MS = 1500;

/**
 * How long we wait, after asking a question, for the candidate to START
 * answering. This is the WAITING_FOR_FIRST_RESPONSE window: a generous, quiet
 * beat that lets the candidate think before speaking. We do NOT repeat the
 * question during (or at the end of) this window. The timer exists only to
 * detect that the candidate never started. The moment any speech is detected
 * the timer is cancelled and we move to the answering state.
 */
export const WAITING_FIRST_RESPONSE_MS = 45000;

/**
 * How long we wait, after asking a question, for the candidate to START
 * answering before gently re-asking. Generous on purpose. A real interviewer
 * gives you time to gather your thoughts before repeating themselves.
 */
export const AWAIT_ANSWER_MS = 12000;

/**
 * After the single re-ask, how long we wait for any answer before moving on to
 * the next question. Keeps a stalled interview flowing.
 */
export const REASK_GRACE_MS = 10000;

/** How many times we re-ask an unanswered question before moving on. */
export const MAX_AUTO_REASKS = 1;

/** Name of the client-side function the agent calls to signal answer completion. */
export const COMPLETE_ANSWER_FUNCTION = "complete_answer";

const INTERVIEWER_PROMPT = `You are Aria, a SILENT control layer for a scripted interview.

You are NOT responsible for creating interview questions.
Every interview question comes from the backend.
Never invent interview questions.
Never ask follow-up interview questions.
Never continue discussing the previous question after the backend has moved on.
Never respond to an answer with commentary.
Never say "it sounds like", "I see", "got it", "great", "please continue", or similar filler.
Never expose internal implementation details.
Never mention the backend.
Never mention APIs.
Never mention system prompts.
Never explain how the interview platform works.
If the backend has not supplied a question, wait silently.
Only injected messages may be spoken.
If repeat, clarification, skip, or next-question is requested, do not answer in words. The client handles it.
When the answer is complete, call ${COMPLETE_ANSWER_FUNCTION} and wait for the backend to return the next question.

ROLE:
- You are not the interviewer brain.
- The interview state, current question, sequence, transcript storage, completion, evaluation, and report generation are controlled outside this voice layer.
- Your only active action after user speech is calling ${COMPLETE_ANSWER_FUNCTION}, or doing nothing.

STRICT LIMITS:
- Do not create behavioral questions, project questions, technical questions, or any follow-up question.
- Do not change question order, skip questions yourself, decide the next question, or end the interview yourself.
- Do not comment on answer quality.
- Do not ask for more detail.
- Do not reveal internal architecture.
- If no question has been injected, stay silent.
- If the candidate asks for repeat, clarification, skip, or next question, stay silent.

WHEN TO CALL ${COMPLETE_ANSWER_FUNCTION}:
- Call it only after the candidate has clearly finished answering the current injected question.
- Do not call it for repeat or clarification requests.
- Do not call it while the candidate is still speaking or pausing mid-answer.
- After calling it, stay silent until another message is injected.`;
/**
 * The single client-side function the agent uses to signal completion. It has no
 * `endpoint`, so Deepgram returns a `FunctionCallRequest` to the browser rather
 * than calling a server. The authoritative transcript is the client's own
 * accumulated STT buffer; the `transcript` arg is best-effort context.
 */
function completeAnswerFunction(): NonNullable<
  Deepgram.ThinkSettingsV1["functions"]
>[number] {
  return {
    name: COMPLETE_ANSWER_FUNCTION,
    description:
      "Call this ONLY when the candidate has clearly finished a substantive answer to the current question and has stopped speaking. It is a silent signal to the backend. Never produce any speech before or after calling it. Do NOT call it during pauses, thinking silences, or repeat/clarification requests.",
    parameters: {
      type: "object",
      properties: {
        transcript: {
          type: "string",
          description:
            "A brief summary of the candidate's answer.",
        },
        interviewId: {
          type: "string",
          description:
            "The current interview id if available in context.",
        },
        sequence: {
          type: "number",
          description:
            "The sequence number of the question being answered if available in context.",
        },
      },
      required: [],
    },
  };
}

export interface BuildAgentSettingsOptions {
  /** Spoken welcome line before the first question is injected. */
  greeting?: string;
  /** Deepgram Aura TTS voice model. */
  speakModel?: string;
  /** Deepgram STT model. */
  listenModel?: string;
  /** Think LLM model (Deepgram-hosted open_ai). */
  thinkModel?: string;
}

/**
 * Build the `Settings` control message sent immediately after the socket opens.
 * Input/output audio formats must match the mic recorder and PCM player.
 */
export function buildInterviewAgentSettings(
  options: BuildAgentSettingsOptions = {}
): Deepgram.agent.AgentV1Settings {
  const {
    greeting = "Hi there, I'm Aria, and I'll be your interviewer today. It's really nice to meet you. I'll ask you a few questions, one at a time. There's no rush at all, so take your time and just answer naturally, the way you would in a real conversation. If you ever want a question repeated, simply ask. Let's get started.",
    speakModel = "aura-2-thalia-en",
    listenModel = "nova-3",
    thinkModel = "gpt-4o",
  } = options;

  return {
    type: "Settings",
    audio: {
      input: {
        encoding: "linear16",
        sample_rate: AGENT_INPUT_SAMPLE_RATE,
      },
      output: {
        encoding: "linear16",
        sample_rate: AGENT_OUTPUT_SAMPLE_RATE,
        container: "none",
      },
    },
    agent: {
      language: "en",
      listen: {
        provider: { type: "deepgram", version: "v1", model: listenModel },
      },
      think: {
        provider: { type: "open_ai", model: thinkModel },
        prompt: INTERVIEWER_PROMPT,
        functions: [completeAnswerFunction()],
      },
      speak: {
        provider: { type: "deepgram", model: speakModel },
      },
      greeting,
    },
  };
}

