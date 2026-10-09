"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useInterview } from "@/hooks/useInterview";
import VoiceInterview from "@/components/interview/VoiceInterview";
import { ROUTES, routeTo } from "@/lib/utils/constants";

/**
 * Loads an interview by id through the existing resume path — POST
 * /api/interview/[id]/takeover (claims the session for this tab) then
 * GET /api/interview/[id] (owner-checked; polls while GENERATING) — and mounts
 * the unchanged Deepgram VoiceInterview once the questions are hydrated.
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

  // "End → No, just end it": cancel this interview and return to the hub.
  const handleExit = async () => {
    await cancel(interviewId);
    router.replace(ROUTES.interviews);
  };

  if (loaded && !error && current?.id === interviewId) {
    return <VoiceInterview interview={current} onExit={handleExit} />;
  }

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4 sm:p-6">
      <div className="flex flex-col items-center justify-center p-8 sm:p-12 bg-white border border-outline-variant/30 rounded-xxl shadow-2xl ai-glow w-full max-w-3xl mx-auto min-h-[400px] text-center">
        {error ? (
          <>
            <div className="w-16 h-16 rounded-full bg-error-red/10 flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-error-red text-3xl">error</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold mb-2">This interview can&apos;t be opened</h3>
            <p className="w-full text-sm sm:text-base text-on-surface-variant">{error}</p>
            <div className="flex flex-wrap justify-center gap-3 mt-6">
              <Link
                href={ROUTES.interviews}
                className="px-6 py-2.5 rounded-xl bg-primary text-white text-xs font-bold shadow-md hover:bg-[#4338CA] transition-all active:scale-95"
              >
                Back to Interviews
              </Link>
              <Link
                href={routeTo.report(interviewId)}
                className="px-6 py-2.5 rounded-xl border border-outline-variant/30 text-xs font-bold text-on-surface hover:bg-surface-container transition-colors"
              >
                View Report Status
              </Link>
            </div>
          </>
        ) : (
          <>
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6 animate-pulse">
              <span className="material-symbols-outlined text-primary text-3xl animate-spin">progress_activity</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold mb-2">Resuming your interview…</h3>
            <p className="w-full text-sm sm:text-base text-on-surface-variant">
              Restoring your session and reconnecting. This will only take a moment.
            </p>
          </>
        )}
      </div>
    </main>
  );
}
