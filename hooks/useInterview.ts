"use client";

import { useCallback, useRef, useState } from "react";
import { useInterviewStore } from "@/store/useInterviewStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { API } from "@/lib/utils/constants";
import type { Answer, Evaluation, Interview } from "@/types";

/** How long to wait between status polls when an interview is GENERATING. */
const POLL_INTERVAL_MS = 1_500;
/** Maximum number of polls before giving up (40 × 1.5 s ≈ 60 s). */
const POLL_MAX_ATTEMPTS = 40;

/** Sleep that respects an AbortSignal — rejects with AbortError on abort. */
function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener("abort", () => {
      clearTimeout(timer);
      reject(new DOMException("Aborted", "AbortError"));
    });
  });
}

export type InterviewConflict = {
  interviewId: string;
  /** DB status of the conflicting interview at the time of the 409. */
  status: string;
};

/** Client-side orchestration for running an interview. */
export function useInterview() {
  const { current, setInterview, addAnswer, next, reset } = useInterviewStore();
  const { targetRole, provider } = useSettingsStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** Set when POST /start returns 409 ACTIVE_INTERVIEW_EXISTS. */
  const [conflict, setConflict] = useState<InterviewConflict | null>(null);
  /** True while the on-load recovery check (and the subsequent resume) is running. */
  const [isRecovering, setIsRecovering] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);
  const pendingInterviewIdRef = useRef<string | null>(null);
  /** Abort controller for the polling loop inside resume(). */
  const resumeAbortRef = useRef<AbortController | null>(null);
  /** Guard: prevents two simultaneous resume() calls. */
  const isResumingRef = useRef(false);

  const clearConflict = useCallback(() => setConflict(null), []);

  const mapGeneratedQuestion = (question: any, index: number) => ({
    id: question.id || `generated-${index + 1}`,
    sequence: question.sequence ?? index + 1,
    type: question.type || question.category?.toLowerCase?.() || "technical",
    prompt: question.prompt || question.displayQuestion || "",
    ttsTranscript: question.ttsTranscript || question.prompt || question.displayQuestion || "",
    expectedPoints: question.expectedDiscussion ? [question.expectedDiscussion] : [],
    difficulty: question.difficulty?.toLowerCase?.() || "medium",
  });

  /**
   * Cancel the current or pending interview.
   *
   * Order of operations:
   *  1. Abort any active resume() polling loop immediately.
   *  2. Abort any in-flight start/generate request.
   *  3. Clear local state.
   *  4. Best-effort POST to mark the DB row as CANCELLED.
   */
  const cancel = useCallback(async () => {
    // ── Abort polling loop instantly (Point 4) ───────────────────────────
    resumeAbortRef.current?.abort();
    resumeAbortRef.current = null;
    isResumingRef.current = false;

    // ── Abort in-flight start/generate request ───────────────────────────
    abortControllerRef.current?.abort();

    const interviewId =
      useInterviewStore.getState().current?.id ?? pendingInterviewIdRef.current;
    pendingInterviewIdRef.current = null;
    setLoading(false);
    setConflict(null);
    reset(); // clear UI immediately — don't await

    if (interviewId) {
      try {
        await fetch(API.interviewCancel, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ interviewId }),
        });
      } catch {
        // best-effort — start will abort stale rows anyway
      }
    }
  }, [reset]);

  const start = useCallback(async (payload?: any) => {
    setLoading(true);
    setError(null);
    const controller = new AbortController();
    abortControllerRef.current = controller;
    try {
      const res = await fetch(API.interview, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: targetRole, provider, ...payload }),
        signal: controller.signal,
      });
      const json = await res.json();

      // ── 409: active interview exists — show conflict modal, not an error ─
      if (!json.success && json.code === "ACTIVE_INTERVIEW_EXISTS") {
        setConflict({ interviewId: json.interviewId, status: json.status });
        return;
      }

      if (!json.success && !json.ok) {
        if (json.code === "INTERVIEW_LIMIT_REACHED") {
          throw new Error("INTERVIEW_LIMIT_REACHED");
        }
        throw new Error(json.message || json.error);
      }

      // Phase 2 Step 1 returns { interviewId, status: "GENERATING" }.
      // Call the Step 2 API to actually generate questions via Gemini.
      if (json.data?.status === "GENERATING") {
        pendingInterviewIdRef.current = json.data.interviewId;
        const genRes = await fetch("/api/interview/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ interviewId: json.data.interviewId }),
          signal: controller.signal,
        });

        const genJson = await genRes.json();
        if (!genJson.success) throw new Error(genJson.error || "Failed to generate questions");

        const generatedQuestions = Array.isArray(genJson.data?.questions)
          ? genJson.data.questions
          : genJson.data?.currentQuestion
            ? [genJson.data.currentQuestion]
            : [];

        setInterview({
          id: genJson.data.interviewId,
          role: targetRole,
          status: "in_progress" as any,
          questions: generatedQuestions.map(mapGeneratedQuestion) as any,
          answers: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } as any);
      } else {
        pendingInterviewIdRef.current = json.data?.id ?? null;
        setInterview(json.data as Interview);
      }
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return; // user cancelled
      setError(e instanceof Error ? e.message : "Failed to start");
    } finally {
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
        pendingInterviewIdRef.current = null;
      }
      setLoading(false);
    }
  }, [targetRole, provider, setInterview]);

  /**
   * Resume an existing active interview WITHOUT creating a new one.
   *
   * Flow:
   *  1. GET /api/interview/[id] — fetch questions + currentQuestionIndex.
   *  2. If status is GENERATING — poll every 1.5 s until READY (max 60 s).
   *  3. Hydrate the interview store + advance to first unanswered question.
   *  4. page.tsx renders <VoiceInterview> which mounts and reconnects Deepgram.
   *
   * Guards:
   *  - isResumingRef: prevents double-click / double-call.
   *  - resumeAbortRef: abort controller lets cancel() kill the poll instantly.
   *  - Server returns INTERVIEW_NOT_RESUMABLE for terminal statuses.
   */
  const resume = useCallback(async (interviewId: string) => {
    if (isResumingRef.current) return; // double-click guard
    isResumingRef.current = true;

    const abortController = new AbortController();
    resumeAbortRef.current = abortController;
    const { signal } = abortController;

    setLoading(true);
    let attempts = 0;

    try {
      // Announce takeover of this session to evict ghost tabs
      const clientId = useInterviewStore.getState().clientId;
      await fetch(`/api/interview/${interviewId}/takeover`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId }),
        signal,
      }).catch(() => {});

      while (!signal.aborted) {
        const res = await fetch(`/api/interview/${interviewId}`, { signal });
        const json = await res.json();

        // ── Server-side idempotency re-check ──────────────────────────────
        if (!json.success) {
          if (json.code === "INTERVIEW_NOT_RESUMABLE") {
            // Tab B may have cancelled while Tab A was resuming.
            setError("This interview is no longer available.");
            clearConflict();
            return;
          }
          throw new Error(json.message ?? "Failed to load interview");
        }

        const { data } = json;

        // ── Detect cancellation from another tab/device ───────────────────
        if (
          data.status === "CANCELLED" ||
          data.status === "FAILED" ||
          data.status === "COMPLETED"
        ) {
          setError("This interview was ended by another session.");
          clearConflict();
          return;
        }

        // ── Still generating — poll ───────────────────────────────────────
        if (data.status === "GENERATING") {
          attempts++;
          if (attempts >= POLL_MAX_ATTEMPTS) {
            setError(
              "Interview preparation is taking longer than expected. " +
              "Please refresh in a moment.",
            );
            clearConflict();
            return;
          }
          await sleep(POLL_INTERVAL_MS, signal);
          continue;
        }

        // ── READY or ONGOING — hydrate store and reconnect Deepgram ──────
        //
        // setInterview() populates `current` in the store.
        // page.tsx detects `current !== null` → renders <VoiceInterview>.
        // VoiceInterview's mount useEffect calls useVoiceAgent.start(),
        // which opens a fresh Deepgram WebSocket from question[currentIndex].
        // No manual reconnect code needed — mounting the component IS the reconnect.
        setInterview({
          id: data.interviewId,
          role: data.role,
          status: "in_progress" as any,
          questions: (data.questions ?? []).map(mapGeneratedQuestion),
          answers: [],
          createdAt: data.createdAt,
          updatedAt: new Date().toISOString(),
        } as any);

        // Advance to the first unanswered question.
        useInterviewStore.getState().setCurrentIndex(data.currentQuestionIndex ?? 0);
        clearConflict();
        return;
      }
    } catch (e) {
      if (signal.aborted) return; // cancelled by cancel() — exit silently
      setError(e instanceof Error ? e.message : "Failed to resume interview");
      clearConflict();
    } finally {
      isResumingRef.current = false;
      resumeAbortRef.current = null;
      setLoading(false);
    }
  }, [setInterview, clearConflict]);

  /**
   * Called once on interview page mount (after refresh / tab reopen).
   *
   * Checks GET /api/interview/active for an unfinished session.
   * If found → delegates to resume() which polls until READY, hydrates the
   * store, and lets VoiceInterview mount to reconnect Deepgram automatically.
   * If not found → no-op; the setup form is shown normally.
   *
   * isRecovering stays true for the full duration (check + resume polling)
   * so the page can show a "Resuming your interview…" card instead of the
   * setup form or a blank flash.
   */
  const recoverActiveInterview = useCallback(async () => {
    setIsRecovering(true);
    try {
      const res = await fetch("/api/interview/active");
      const json = await res.json();
      if (json.success && json.data?.interviewId) {
        // Active interview found — resume it silently (no modal, no user input).
        await resume(json.data.interviewId);
      } else {
        // No active interview found (e.g. cancelled in another tab). Clear local state.
        setInterview(null as any);
      }
      // If null: no active interview — fall through to show setup form.
    } catch {
      // Network error or server down — fail silently and show setup form.
      setInterview(null as any);
    } finally {
      setIsRecovering(false);
    }
  }, [resume]);

  const submitAnswer = useCallback(
    async (answer: Answer) => {
      if (!current) return;

      const res = await fetch(API.interviewAnswer, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          interviewId: current.id,
          sequence: answer.sequence,
          transcript: answer.text,
          durationSec: answer.durationSec ?? 0,
        }),
      });

      const json = await res.json();
      if (!json.success) {
        throw new Error(json.error || "Failed to save answer");
      }

      addAnswer(answer);
      next();
    },
    [addAnswer, current, next],
  );

  const finish = useCallback(async (): Promise<Evaluation | null> => {
    if (!current) return null;
    setLoading(true);
    try {
      const res = await fetch(API.interviewEnd, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interviewId: current.id }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data as Evaluation;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to evaluate");
      return null;
    } finally {
      setLoading(false);
    }
  }, [current]);

  return {
    current,
    loading,
    error,
    conflict,
    isRecovering,
    start,
    resume,
    recoverActiveInterview,
    clearConflict,
    cancel,
    submitAnswer,
    finish,
    reset,
  };
}
