"use client";

import { LoaderCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";

export interface InterviewConflict {
  interviewId: string;
  status: string;
}

/**
 * POST /start answered 409 ACTIVE_INTERVIEW_EXISTS. Same choices as before:
 * - still generating: the page opens it automatically; it can be cancelled
 * - ready or ongoing: continue it (opening the live page claims the session,
 *   including from another device), or cancel it and start this one after a
 *   second confirmation
 */
export function ConflictDialog({
  conflict,
  confirming,
  onConfirmingChange,
  onDismiss,
  onContinue,
  onCancelGenerating,
  onCancelAndStart,
}: {
  conflict: InterviewConflict | null;
  confirming: boolean;
  onConfirmingChange: (confirming: boolean) => void;
  onDismiss: () => void;
  onContinue: () => void;
  onCancelGenerating: () => void;
  onCancelAndStart: () => void;
}) {
  const open = conflict !== null;
  const generating = conflict?.status === "GENERATING";

  if (confirming) {
    return (
      <Dialog
        open={open}
        onOpenChange={(next) => !next && onConfirmingChange(false)}
        title="End your other interview?"
        description="It will end for good and can't be resumed. It still counts toward your interview limit."
        footer={
          <>
            <Button variant="secondary" onClick={() => onConfirmingChange(false)}>
              Go back
            </Button>
            <Button variant="danger" onClick={onCancelAndStart}>
              End it and start this one
            </Button>
          </>
        }
      />
    );
  }

  if (generating) {
    return (
      <Dialog
        open={open}
        onOpenChange={(next) => !next && onDismiss()}
        title="You already have an interview"
        description="Its questions are still being prepared, so we're opening it for you."
        footer={
          <Button variant="danger" onClick={onCancelGenerating}>
            Cancel that interview
          </Button>
        }
      >
        <p role="status" className="flex items-center gap-2 rounded-control bg-sunken px-3 py-2.5 text-small font-medium text-fg">
          <LoaderCircle aria-hidden strokeWidth={2} className="size-4 text-brand motion-safe:animate-spin" />
          Opening your interview
        </p>
      </Dialog>
    );
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => !next && onDismiss()}
      title="You already have an interview in progress"
      description="Only one interview can run at a time. Continuing opens it here, even if it's open on another device."
      footer={
        <>
          <Button variant="secondary" onClick={() => onConfirmingChange(true)}>
            Cancel it and start this one
          </Button>
          <Button variant="primary" onClick={onContinue}>
            Continue that interview
          </Button>
        </>
      }
    />
  );
}

/** Cancel while questions are being generated (counts toward the limit, as before). */
export function CancelGenerationDialog({
  open,
  windowLabel,
  onOpenChange,
  onConfirm,
}: {
  open: boolean;
  windowLabel: string;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}) {
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Cancel this interview?"
      description={`It will still count as one of your interviews this ${windowLabel}.`}
      footer={
        <>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Keep preparing
          </Button>
          <Button variant="danger" onClick={onConfirm}>
            Cancel interview
          </Button>
        </>
      }
    />
  );
}
