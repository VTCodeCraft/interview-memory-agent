"use client";

import { useEffect, useRef } from "react";
import { AudioLines, Check, LoaderCircle, Mic, MicOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { ConversationTurn } from "@/types/voiceAgent";
import type { RoomMode } from "./room-state";

/* ── Status orb (same approach as the landing overview; no portrait) ────── */

export function StatusOrb({ mode, size = "lg" }: { mode: RoomMode; size?: "lg" | "sm" }) {
  const outer = size === "lg" ? "size-28 sm:size-32" : "size-12";
  const inner = size === "lg" ? "size-[4.5rem] sm:size-20" : "size-9";
  const icon = size === "lg" ? "size-8" : "size-4";

  const ring =
    mode === "error"
      ? "bg-danger-soft ring-danger-line"
      : mode === "complete"
        ? "bg-success-soft ring-success-line"
        : mode === "working" || mode === "connecting" || mode === "finishing"
          ? "bg-sunken ring-line"
          : "bg-brand-soft ring-memory-line";
  const core =
    mode === "speaking"
      ? "bg-brand text-on-brand shadow-raised"
      : mode === "your-turn" || mode === "listening"
        ? "bg-panel text-brand shadow-raised ring-2 ring-brand"
        : mode === "error"
          ? "bg-danger text-white"
          : mode === "complete"
            ? "bg-success text-white"
            : "bg-panel text-fg-muted shadow-control ring-1 ring-line";
  // Gentle pulse only while someone is speaking; never while waiting or on error.
  const pulse = mode === "speaking" || mode === "listening";

  return (
    <span aria-hidden className={cn("relative flex shrink-0 items-center justify-center", outer)}>
      <span className={cn("absolute inset-0 rounded-full ring-1 ring-inset", ring, pulse && "motion-safe:animate-pulse")} />
      <span className={cn("relative flex items-center justify-center rounded-full transition-[background-color,color,box-shadow] duration-(--duration-base) ease-standard", inner, core)}>
        {mode === "speaking" ? (
          <AudioLines strokeWidth={1.75} className={icon} />
        ) : mode === "your-turn" || mode === "listening" ? (
          <Mic strokeWidth={1.75} className={icon} />
        ) : mode === "error" ? (
          <MicOff strokeWidth={1.75} className={icon} />
        ) : mode === "complete" ? (
          <Check strokeWidth={2} className={icon} />
        ) : (
          <LoaderCircle strokeWidth={1.75} className={cn(icon, "motion-safe:animate-spin")} />
        )}
      </span>
    </span>
  );
}

/* ── Transcript ─────────────────────────────────────────────────────────── */

/**
 * Turns from useVoiceAgentStore, oldest first. Follows new turns only while
 * the reader is already near the bottom, so scrolling back to re-read isn't
 * interrupted. Not a live region: the interviewer is already heard as audio,
 * and announcing the candidate's own speech back would only add noise.
 */
export function Transcript({ turns, emptyText }: { turns: ConversationTurn[]; emptyText: string }) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const pinnedRef = useRef(true);

  // Instant, not smooth: the transcript updates every second or so while the
  // candidate talks, and an animated scroll would lag behind the newest line.
  useEffect(() => {
    const el = scrollRef.current;
    if (el && pinnedRef.current) el.scrollTop = el.scrollHeight;
  }, [turns]);

  // Stay at the newest line when the window resizes or the phone rotates.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const observer = new ResizeObserver(() => {
      if (pinnedRef.current) el.scrollTop = el.scrollHeight;
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={scrollRef}
      role="log"
      aria-label="Transcript"
      aria-live="off"
      tabIndex={0}
      onScroll={(event) => {
        const el = event.currentTarget;
        pinnedRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
      }}
      // No scroll anchoring: its adjustments on reflow would read as the
      // reader scrolling away and stop the transcript following new lines.
      className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-5 [overflow-anchor:none] focus-ring sm:px-6"
    >
      {turns.length === 0 ? (
        <p className="py-10 text-center text-small text-fg-muted">{emptyText}</p>
      ) : (
        <ol className="flex flex-col gap-4">
          {turns.map((turn) => {
            const interviewer = turn.role === "ai";
            return (
              <li key={turn.id} className={cn("flex flex-col gap-1", interviewer ? "items-start" : "items-end")}>
                <span className="px-1 text-label font-medium text-fg-subtle">{interviewer ? "Interviewer" : "You"}</span>
                <p
                  className={cn(
                    "max-w-[min(36rem,92%)] rounded-card px-4 py-3 text-body [overflow-wrap:anywhere]",
                    interviewer ? "border border-line bg-panel text-fg" : "bg-brand-soft text-fg ring-1 ring-memory-line ring-inset",
                    turn.live && "text-fg-muted",
                  )}
                >
                  {turn.text || (turn.live ? "…" : "")}
                  {turn.live && <span className="sr-only"> (still speaking)</span>}
                </p>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}

/* ── End interview (two steps, as before) ───────────────────────────────── */

export function EndInterviewDialog({
  step,
  submitting,
  onClose,
  onConfirmEnd,
  onEndWithReport,
  onEndWithoutReport,
}: {
  step: null | "confirm" | "report";
  submitting: boolean;
  onClose: () => void;
  onConfirmEnd: () => void;
  onEndWithReport: () => void;
  onEndWithoutReport: () => void;
}) {
  if (step === "report") {
    return (
      <Dialog
        open
        onOpenChange={(open) => !open && !submitting && onClose()}
        title="Get a report on your answers so far?"
        description="We'll evaluate what you've answered. Ending without a report cancels the interview, and it still counts toward your interview limit."
        footer={
          <>
            <Button variant="secondary" onClick={onEndWithoutReport} disabled={submitting}>
              End without report
            </Button>
            <Button variant="primary" onClick={onEndWithReport} loading={submitting} disabled={submitting}>
              {submitting ? "Ending interview" : "End and get report"}
            </Button>
          </>
        }
      />
    );
  }
  return (
    <Dialog
      open={step === "confirm"}
      onOpenChange={(open) => !open && onClose()}
      title="End the interview now?"
      description="You can still get a report on the answers you've given so far."
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Keep going
          </Button>
          <Button variant="danger" onClick={onConfirmEnd}>
            End interview
          </Button>
        </>
      }
    />
  );
}
