"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CircleAlert, LoaderCircle } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { useInterview } from "@/hooks/useInterview";
import VoiceInterview from "@/components/interview/VoiceInterview";
import { ROUTES, routeTo } from "@/lib/utils/constants";

/**
 * Loads an interview by id through the existing resume path — POST
 * /api/interview/[id]/takeover (claims the session for this tab) then
 * GET /api/interview/[id] (owner-checked; polls while GENERATING) — and mounts
 * the Deepgram VoiceInterview once the questions are hydrated.
 */
export default function LiveInterviewSession({ interviewId }: { interviewId: string }) {
  const router = useRouter();
  const { current, error, resume, cancel } = useInterview();
  const startedRef = useRef(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    void resume(interviewId).finally(() => setLoaded(true));
  }, [interviewId, resume]);

  // "End → End without report": cancel this interview and return to the hub.
  const handleExit = async () => {
    await cancel(interviewId);
    router.replace(ROUTES.interviews);
  };

  // Every way out of the room (report hand-off, End without report, takeover)
  // clears the interview from the store before navigating, so once the room
  // has been shown, falling back here means "leaving", not "opening".
  const ready = loaded && !error && current?.id === interviewId;
  const [roomShown, setRoomShown] = useState(false);
  if (ready && !roomShown) setRoomShown(true);

  if (ready) {
    return <VoiceInterview interview={current} onExit={handleExit} />;
  }

  return (
    <div className="ds-page flex min-h-dvh flex-1 flex-col">
      <header className="shrink-0 border-b border-line-subtle bg-canvas">
        <div className="ds-container flex h-14 items-center sm:h-nav">
          <span className="ds-display text-[1.0625rem] font-semibold tracking-[-0.03em] text-fg">Clutchly</span>
        </div>
      </header>
      <main className="ds-container flex flex-1 items-center justify-center py-12">
        <section className="ds-surface flex w-full max-w-[32rem] flex-col items-center rounded-card px-6 py-12 text-center sm:px-10">
          {error ? (
            <div role="alert" className="flex flex-col items-center">
              <span aria-hidden className="flex size-12 items-center justify-center rounded-full bg-danger-soft text-danger ring-1 ring-danger-line ring-inset">
                <CircleAlert strokeWidth={1.75} className="size-6" />
              </span>
              <h1 className="ds-display mt-5 text-heading text-fg">This interview can&apos;t be opened</h1>
              <p className="mt-2 text-body text-fg-muted">{error}</p>
              <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row">
                <Link href={routeTo.report(interviewId)} className={buttonVariants({ variant: "secondary" })}>
                  View interview status
                </Link>
                <Link href={ROUTES.interviews} className={buttonVariants({ variant: "primary" })}>
                  Back to interviews
                </Link>
              </div>
            </div>
          ) : (
            <div role="status" aria-live="polite" className="flex flex-col items-center">
              <span aria-hidden className="relative flex size-14 items-center justify-center">
                <span className="absolute inset-0 rounded-full bg-brand-soft ring-1 ring-memory-line ring-inset motion-safe:animate-pulse" />
                <LoaderCircle strokeWidth={1.75} className="relative size-6 text-brand motion-safe:animate-spin" />
              </span>
              <h1 className="ds-display mt-5 text-heading text-fg">{roomShown ? "Closing the interview room" : "Opening your interview"}</h1>
              <p className="mt-2 text-body text-fg-muted">
                {roomShown ? "One moment." : "Restoring your session and connecting to your interviewer."}
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
