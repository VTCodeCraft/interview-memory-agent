"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, RotateCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useVoiceAgent } from "@/hooks/useVoiceAgent";
import { useVoiceAgentStore } from "@/store/useVoiceAgentStore";
import { useInterviewStore } from "@/store/useInterviewStore";
import type { Interview } from "@/types";
import { API, ROUTES, routeTo } from "@/lib/utils/constants";
import { cn } from "@/lib/utils";
import { EndInterviewDialog, StatusOrb, Transcript } from "./live-room/RoomParts";
import { FINISHING_STATES, currentQuestionText, errorGuidance, progressLabel, roomStatus } from "./live-room/room-state";

interface VoiceInterviewProps {
  interview: Interview;
  /** Called when the user ends/leaves the session early. */
  onExit: () => void;
}

/** Spoken commands useVoiceAgent already recognises (see its phrase matchers). */
const VOICE_TIPS = [
  { say: "Just start talking", does: "to interrupt the interviewer." },
  { say: "“Can you repeat that?”", does: "or “What do you mean?” to hear the question again." },
  { say: "“Skip this question”", does: "to move on." },
  { say: "“That's my answer”", does: "when you've finished answering." },
];

/**
 * The live interview room. Session behaviour is unchanged: one Deepgram Voice
 * Agent session via useVoiceAgent (start on mount, stop on unmount), takeover
 * eviction (polling + BroadcastChannel), the natural-completion hand-off to the
 * report, and the two-step End flow. This component only presents the state
 * the hook writes to useVoiceAgentStore.
 */
export default function VoiceInterview({ interview, onExit }: VoiceInterviewProps) {
  const router = useRouter();
  const { start, stop } = useVoiceAgent();
  const { state, turns, error, currentQuestion, totalQuestions } = useVoiceAgentStore();
  const clientId = useInterviewStore((s) => s.clientId);

  const startedRef = useRef(false);
  // End flow: null -> hidden, "confirm" -> "End interview?", "report" -> "Get a report?"
  const [endStep, setEndStep] = useState<null | "confirm" | "report">(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Guard so the natural-completion redirect fires only once.
  const navigatedRef = useRef(false);

  // Navigate to this interview's report page, which shows the processing state
  // until the background job (POST /api/interview/end → process-reports) has
  // produced the report. Clears the in-progress interview from the store first.
  const goToReport = useCallback(() => {
    if (navigatedRef.current) return;
    navigatedRef.current = true;
    stop();
    useInterviewStore.getState().reset();
    router.push(routeTo.report(interview.id));
  }, [router, stop, interview.id]);

  // Kick off the single voice session once on mount.
  useEffect(() => {
    // In React StrictMode, effects mount/unmount twice in dev.
    // Keep startedRef as the guard so we don't start multiple voice sockets.
    if (startedRef.current) return;
    startedRef.current = true;

    // Delay start so StrictMode cleanup from the "throwaway mount" runs first.
    queueMicrotask(() => {
      void start({
        id: interview.id,
        questions: (interview.questions ?? []).map((q) => ({
          sequence: q.sequence,
          ttsTranscript: q.ttsTranscript,
          prompt: q.prompt,
        })),
      });
    });

    return () => {
      // Stop the socket created by this mount.
      stop();
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cross-device force-takeover eviction polling (3s for faster eviction)
  useEffect(() => {
    const checkEviction = async () => {
      try {
        const res = await fetch(`/api/interview/active?clientId=${clientId}`);
        const json = await res.json();
        if (json.success && json.data?.taken_over) {
          useVoiceAgentStore.setState({ error: "Session taken over by another device." });
          stop();
          useInterviewStore.getState().setInterview(null as never);
          router.push(ROUTES.interviews);
        }
      } catch {
        // ignore network error, keep polling
      }
    };
    const interval = setInterval(checkEviction, 3000);
    return () => clearInterval(interval);
  }, [clientId, stop, router]);

  // Instant cross-tab eviction (same browser)
  useEffect(() => {
    const channel = new BroadcastChannel("clutchly-interview-sync");

    // Broadcast that this tab is now active
    channel.postMessage({ type: "TAKEOVER", interviewId: interview.id, clientId });

    channel.onmessage = (event) => {
      if (
        event.data?.type === "TAKEOVER" &&
        event.data.interviewId === interview.id &&
        event.data.clientId !== clientId
      ) {
        useVoiceAgentStore.setState({ error: "Session taken over by another tab." });
        stop();
        useInterviewStore.getState().setInterview(null as never);
        router.push(ROUTES.interviews);
      }
    };

    return () => channel.close();
  }, [interview.id, clientId, stop, router]);

  // Natural completion: once the candidate answers the last question the agent
  // moves to THANK_CANDIDATE. Don't make the user wait on the voice screen for
  // evaluation: play the short closing line, then redirect to the report page,
  // which generates the report in the background with a loading state.
  useEffect(() => {
    if (FINISHING_STATES.includes(state)) {
      // Don't set multiple timeouts if state progresses
      if (navigatedRef.current) return;

      const t = setTimeout(async () => {
        try {
          // Trigger the end endpoint to queue the report generation before navigating
          await fetch(API.interviewEnd, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ interviewId: interview.id }),
          });
        } catch (e) {
          console.error("Failed to trigger natural report generation", e);
        }
        goToReport();
      }, 2500);
      return () => clearTimeout(t);
    }
  }, [state, goToReport, interview.id]);

  const isEvicted = error?.includes("taken over");

  // "End" button -> confirm dialog first (mirrors the cancel flow).
  // If evicted by another tab/device, we just exit without touching the DB.
  const handleEnd = () => {
    if (isEvicted) {
      router.push(ROUTES.interviews);
      return;
    }
    setEndStep("confirm");
  };

  // Early end, generate a report from answers given so far. The dialog stays
  // open (busy) until the report page opens.
  const handleEndWithReport = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      // Manually trigger the end endpoint to queue the report generation
      await fetch(API.interviewEnd, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interviewId: interview.id }),
      });
    } catch (e) {
      console.error("Failed to trigger early report generation", e);
    }
    goToReport();
  };

  // Early end, no report: just leave the session (onExit cancels it).
  const handleEndNoReport = () => {
    setEndStep(null);
    stop();
    onExit();
  };

  const status = roomStatus(state);
  const progress = progressLabel(currentQuestion, totalQuestions);
  const question = currentQuestionText(interview.questions ?? [], currentQuestion);
  const problem = state === "ERROR" ? errorGuidance(error) : null;
  const finishing = status.mode === "finishing" || status.mode === "complete";

  return (
    <div className="ds-page flex h-dvh flex-col overflow-hidden">
      <EndInterviewDialog
        step={endStep}
        submitting={isSubmitting}
        onClose={() => setEndStep(null)}
        onConfirmEnd={() => setEndStep("report")}
        onEndWithReport={() => void handleEndWithReport()}
        onEndWithoutReport={handleEndNoReport}
      />

      {/* Header: no links out, so a stray click can't drop the session. */}
      <header className="shrink-0 border-b border-line-subtle bg-canvas">
        <div className="ds-container flex h-14 items-center justify-between gap-3 sm:h-nav">
          <div className="flex min-w-0 items-center gap-3">
            <span className="ds-display shrink-0 text-[1.0625rem] font-semibold tracking-[-0.03em] text-fg">Clutchly</span>
            <span className="hidden min-w-0 truncate rounded-badge border border-line bg-panel px-2 py-1 text-label text-fg-muted sm:inline">
              {interview.role}
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            {progress && (
              <span className="hidden text-small text-fg-muted md:inline">
                Question <span className="font-data tabular-nums text-fg">{Math.min(Math.max(currentQuestion, 1), totalQuestions)}</span> of{" "}
                <span className="font-data tabular-nums">{totalQuestions}</span>
              </span>
            )}
            <span className="inline-flex h-8 items-center gap-2 rounded-control border border-line bg-panel px-2.5 text-small font-medium text-fg">
              <span
                aria-hidden
                className={cn(
                  "size-2 rounded-full",
                  status.mode === "error"
                    ? "bg-danger"
                    : status.mode === "complete"
                      ? "bg-success"
                      : status.mode === "speaking" || status.mode === "listening" || status.mode === "your-turn"
                        ? "bg-brand"
                        : "bg-fg-subtle",
                )}
              />
              <span className="hidden sm:inline">{status.label}</span>
            </span>
            <Button variant={isEvicted ? "secondary" : "danger"} size="sm" onClick={handleEnd} disabled={isSubmitting}>
              {isEvicted ? "Exit" : "End interview"}
            </Button>
          </div>
        </div>
      </header>

      {/* Below lg the transcript keeps at least 16rem and the room scrolls on
          short screens; from lg both columns fit the viewport and scroll inside. */}
      <main className="min-h-0 flex-1 overflow-y-auto lg:overflow-hidden">
        <div className="ds-container flex min-h-full flex-col gap-4 py-4 sm:gap-5 sm:py-6 lg:grid lg:h-full lg:min-h-0 lg:grid-cols-[minmax(0,23rem)_minmax(0,1fr)] lg:grid-rows-1 lg:gap-8 lg:py-8">
          {/* Status, question and voice commands */}
          <div className="flex min-h-0 shrink-0 flex-col gap-4 lg:overflow-y-auto lg:pb-1">
            <section
              aria-label="Interview status"
              className="ds-surface flex items-center gap-4 rounded-card p-4 sm:p-5 lg:flex-col lg:gap-4 lg:px-6 lg:py-6 lg:text-center"
            >
              <span className="lg:hidden">
                <StatusOrb mode={status.mode} size="sm" />
              </span>
              <span className="hidden lg:block">
                <StatusOrb mode={status.mode} />
              </span>
              <div role="status" aria-live="polite" className="min-w-0">
                <h1 className="ds-display text-heading text-fg">{problem ? problem.title : status.label}</h1>
                <p className="mt-0.5 text-small text-fg-muted lg:mt-1.5 lg:text-body">{problem ? problem.text : status.hint}</p>
              </div>
              {state === "REPORT_READY" && (
                <Button size="sm" onClick={() => router.push(routeTo.report(interview.id))} className="ml-auto lg:ml-0">
                  View report
                  <ArrowRight aria-hidden strokeWidth={1.75} />
                </Button>
              )}
            </section>

            {problem && (
              <div role="alert" className="flex flex-col gap-3 rounded-card border border-danger-line bg-danger-soft p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5 lg:flex-col lg:items-stretch">
                <p className="text-small text-fg">
                  {problem.canReconnect
                    ? "Reconnecting reopens this interview and continues from the first question you haven't answered."
                    : "This session can't continue here."}
                </p>
                <div className="flex flex-wrap gap-2 sm:shrink-0">
                  {problem.canReconnect && (
                    <Button size="sm" onClick={() => window.location.reload()}>
                      <RotateCw aria-hidden strokeWidth={1.75} />
                      Reconnect
                    </Button>
                  )}
                  {!isEvicted && (
                    <Button variant="secondary" size="sm" onClick={goToReport}>
                      View interview status
                    </Button>
                  )}
                </div>
              </div>
            )}

            {!problem && question && !finishing && (
              <section aria-labelledby="question-title" className="ds-surface rounded-card p-4 sm:p-5 lg:p-6">
                <h2 id="question-title" className="text-small font-medium text-fg-muted">
                  {progress ? (
                    <>
                      Question <span className="font-data tabular-nums text-fg">{Math.min(Math.max(currentQuestion, 1), totalQuestions)}</span> of{" "}
                      <span className="font-data tabular-nums">{totalQuestions}</span>
                    </>
                  ) : (
                    "Current question"
                  )}
                </h2>
                <p className="mt-2 max-h-28 overflow-y-auto text-body text-fg sm:max-h-36 lg:max-h-none lg:text-lead">{question}</p>
              </section>
            )}

            {!finishing && !problem && (
              <>
                <section aria-labelledby="tips-title" className="ds-surface hidden rounded-card p-6 lg:block">
                  <h2 id="tips-title" className="text-small font-semibold text-fg">
                    Voice commands
                  </h2>
                  <VoiceTips />
                </section>
                <details className="group ds-surface rounded-card lg:hidden">
                  <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 rounded-card px-4 text-small font-semibold text-fg focus-ring sm:px-5 [&::-webkit-details-marker]:hidden">
                    Voice commands
                    <span aria-hidden className="text-fg-subtle transition-transform duration-(--duration-fast) group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <div className="px-4 pb-4 sm:px-5">
                    <VoiceTips />
                  </div>
                </details>
              </>
            )}
          </div>

          {/* Transcript */}
          <section aria-labelledby="transcript-title" className="ds-surface flex min-h-64 grow basis-0 flex-col rounded-card lg:min-h-0">
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-line-subtle px-4 py-3 sm:px-6">
              <h2 id="transcript-title" className="text-subheading text-fg">
                Transcript
              </h2>
              <span className="text-label text-fg-subtle">Updates as you speak</span>
            </div>
            <Transcript
              turns={turns}
              emptyText={status.mode === "connecting" ? "Connecting to your interviewer…" : "Your interviewer will greet you shortly."}
            />
          </section>
        </div>
      </main>
    </div>
  );
}

function VoiceTips() {
  return (
    <ul className="mt-3 flex flex-col gap-2.5">
      {VOICE_TIPS.map((tip) => (
        <li key={tip.say} className="text-small text-fg-muted">
          <span className="font-semibold text-fg">{tip.say}</span> {tip.does}
        </li>
      ))}
    </ul>
  );
}
