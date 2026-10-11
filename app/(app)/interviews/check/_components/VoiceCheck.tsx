"use client";

import { useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, CircleAlert, KeyRound, LoaderCircle, Mic, RotateCw, Wifi } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { useDeepgram, type DeepgramConnectionState } from "@/hooks/useDeepgram";
import { ROUTES, routeTo } from "@/lib/utils/constants";
import { cn } from "@/lib/utils";
import { canContinue, guidance, stepStates, type Step, type StepState } from "./voice-check-state";

const STEPS: { id: Step; title: string; text: string; icon: typeof Mic }[] = [
  { id: "token", title: "Voice service access", text: "Gets a short-lived voice token for this browser.", icon: KeyRound },
  { id: "microphone", title: "Microphone", text: "Your browser asks for permission the first time.", icon: Mic },
  { id: "connection", title: "Voice connection", text: "Opens a connection to the voice service.", icon: Wifi },
];

export function VoiceCheck({ continueId }: { continueId: string | null }) {
  const router = useRouter();
  const { state, error, isConnected, tokenExpiresAt, latencyMs, connect, disconnect } = useDeepgram();
  const [opening, setOpening] = useState(false);
  /**
   * useDeepgram ignores a second connect() only after re-rendering; two calls
   * in the same tick would each open a microphone stream and a socket. Guard
   * synchronously here until the first call has handed off to the socket.
   */
  const startingRef = useRef(false);
  /** Same idea for Continue: one navigation even if clicked twice before re-rendering. */
  const openingRef = useRef(false);
  const startCheck = async () => {
    if (startingRef.current) return;
    startingRef.current = true;
    try {
      // After a failed check the hook can still hold the microphone stream
      // (a socket error doesn't release it). Release it with the hook's own
      // disconnect() before retrying, so a retry never leaves a stream open.
      if (state === "ERROR") disconnect();
      await connect();
    } finally {
      startingRef.current = false;
    }
  };

  const checking = state === "CONNECTING";
  const steps = stepStates(state, error, tokenExpiresAt !== null);
  const problem = state === "ERROR" && error ? guidance(error) : null;

  const headline =
    state === "CONNECTED"
      ? { title: "You're ready", text: "Your microphone and the voice connection are working." }
      : state === "CONNECTING"
        ? { title: "Checking", text: "Allow microphone access if your browser asks." }
        : problem
          ? problem
          : { title: "Ready to check", text: "Start the check and allow microphone access when your browser asks." };

  return (
    <div className="flex flex-col gap-6">
      <section aria-labelledby="check-status" className="ds-surface rounded-card">
        {/* Current state, announced as it changes. */}
        <div role="status" aria-live="polite" className="flex items-start gap-4 border-b border-line-subtle px-5 py-5 sm:px-7 sm:py-6">
          <StatusIcon state={state} />
          <div className="min-w-0">
            <h2 id="check-status" className="ds-display text-heading text-fg">
              {headline.title}
            </h2>
            <p className="mt-1 text-body text-fg-muted">{headline.text}</p>
            {isConnected && latencyMs !== null && (
              <p className="mt-2 text-small text-fg-muted">
                Connected in <span className="font-data tabular-nums text-fg">{latencyMs}</span>{" "}
                <span className="font-data">ms</span>
              </p>
            )}
          </div>
        </div>

        <ol className="divide-y divide-line-subtle">
          {STEPS.map((step, index) => (
            <StepRow key={step.id} index={index + 1} title={step.title} text={step.text} icon={step.icon} state={steps[step.id]} />
          ))}
        </ol>

        <div className="flex flex-col gap-3 border-t border-line-subtle px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
          <p className="text-small text-fg-muted">
            {isConnected
              ? "Your microphone stays on until you continue or stop the check."
              : "Your audio isn't sent anywhere during this check."}
          </p>
          {/* One button through every state, so keyboard focus stays on it while
              the check runs (a disabled button would drop focus to the page). */}
          <Button
            variant={isConnected ? "ghost" : state === "ERROR" ? "primary" : "secondary"}
            size={isConnected ? "sm" : "md"}
            loading={checking}
            aria-disabled={checking || undefined}
            onClick={() => {
              if (checking) return;
              if (isConnected) disconnect();
              else void startCheck();
            }}
            className="self-start sm:self-auto"
          >
            {isConnected ? (
              "Stop check"
            ) : state === "ERROR" ? (
              <>
                <RotateCw aria-hidden strokeWidth={1.75} />
                Try again
              </>
            ) : checking ? (
              "Checking"
            ) : (
              <>
                <Mic aria-hidden strokeWidth={1.75} />
                Start check
              </>
            )}
          </Button>
        </div>
      </section>

      {/* Next step */}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link href={ROUTES.interviews} className={cn(buttonVariants({ variant: "ghost", size: "lg" }), "sm:-ml-3")}>
          Back to interviews
        </Link>
        {continueId ? (
          <div className="flex flex-col gap-2 sm:items-end">
            <Button
              size="lg"
              disabled={!canContinue(state, opening)}
              loading={opening}
              aria-describedby={isConnected ? undefined : "continue-hint"}
              onClick={() => {
                if (openingRef.current || !canContinue(state, opening)) return;
                openingRef.current = true;
                setOpening(true);
                router.push(routeTo.liveInterview(continueId));
              }}
            >
              {opening ? "Opening interview" : "Continue to interview"}
              {!opening && <ArrowRight aria-hidden strokeWidth={1.75} />}
            </Button>
            {!isConnected && (
              <p id="continue-hint" className="text-small text-fg-muted sm:text-right">
                Available once the check passes.
              </p>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-2 sm:items-end">
            <Link href={ROUTES.newInterview} className={buttonVariants({ variant: "primary", size: "lg" })}>
              Set up an interview
              <ArrowRight aria-hidden strokeWidth={1.75} />
            </Link>
            <p className="text-small text-fg-muted sm:text-right">This check isn&apos;t linked to an interview.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function StatusIcon({ state }: { state: DeepgramConnectionState }) {
  const tone =
    state === "CONNECTED"
      ? "bg-success-soft text-success ring-success-line"
      : state === "ERROR"
        ? "bg-danger-soft text-danger ring-danger-line"
        : "bg-brand-soft text-brand ring-memory-line";
  return (
    <span aria-hidden className={cn("flex size-11 shrink-0 items-center justify-center rounded-full ring-1 ring-inset", tone)}>
      {state === "CONNECTED" ? (
        <Check strokeWidth={2} className="size-5" />
      ) : state === "ERROR" ? (
        <CircleAlert strokeWidth={1.75} className="size-5" />
      ) : state === "CONNECTING" ? (
        <LoaderCircle strokeWidth={1.75} className="size-5 motion-safe:animate-spin" />
      ) : (
        <Mic strokeWidth={1.75} className="size-5" />
      )}
    </span>
  );
}

const STEP_LABEL: Record<StepState, string> = {
  pending: "Not checked yet",
  active: "Checking",
  done: "Passed",
  failed: "Failed",
};

function StepRow({
  index,
  title,
  text,
  icon: Icon,
  state,
}: {
  index: number;
  title: string;
  text: string;
  icon: typeof Mic;
  state: StepState;
}) {
  let badge: ReactNode;
  if (state === "done") {
    badge = (
      <span className="inline-flex items-center gap-1 text-small font-medium text-success">
        <Check aria-hidden strokeWidth={2.25} className="size-4" />
        {STEP_LABEL.done}
      </span>
    );
  } else if (state === "failed") {
    badge = (
      <span className="inline-flex items-center gap-1 text-small font-medium text-danger">
        <CircleAlert aria-hidden strokeWidth={2} className="size-4" />
        {STEP_LABEL.failed}
      </span>
    );
  } else if (state === "active") {
    badge = (
      <span className="inline-flex items-center gap-1.5 text-small font-medium text-fg-muted">
        <LoaderCircle aria-hidden strokeWidth={2} className="size-4 text-brand motion-safe:animate-spin" />
        {STEP_LABEL.active}
      </span>
    );
  } else {
    badge = <span className="text-small text-fg-subtle">{STEP_LABEL.pending}</span>;
  }

  return (
    <li className="flex items-start gap-4 px-5 py-4 sm:items-center sm:px-7">
      <span
        aria-hidden
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-control border",
          state === "failed" ? "border-danger-line bg-danger-soft text-danger" : "border-line bg-canvas text-fg-muted",
        )}
      >
        <Icon strokeWidth={1.75} className="size-4" />
      </span>
      {/* Status sits under the text on phones, to the right from sm up. */}
      <span className="min-w-0 flex-1 sm:flex sm:items-center sm:gap-4">
        <span className="block min-w-0 sm:flex-1">
          <span className="block text-small font-semibold text-fg">
            <span className="sr-only">Step {index}: </span>
            {title}
          </span>
          <span className="block text-small text-fg-muted">{text}</span>
        </span>
        <span className="mt-1.5 block sm:mt-0 sm:shrink-0">{badge}</span>
      </span>
    </li>
  );
}
