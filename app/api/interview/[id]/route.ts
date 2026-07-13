import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db/prisma";
import { InterviewStatus } from "@prisma/client";

/** Statuses that can never be resumed — return INTERVIEW_NOT_RESUMABLE. */
const NON_RESUMABLE: InterviewStatus[] = [
  InterviewStatus.COMPLETED,
  InterviewStatus.FAILED,
  InterviewStatus.CANCELLED,
];

type StoredQuestion = {
  sequence: number;
  category: string;
  difficulty: string;
  displayQuestion: string;
  ttsTranscript: string;
  expectedDiscussion: string | null;
};

type StoredAnswersBlob = {
  answers: Array<{ sequence: number; [key: string]: unknown }>;
};

function toUiQuestion(interviewId: string, q: StoredQuestion) {
  return {
    id: `${interviewId}-${q.sequence}`,
    sequence: q.sequence,
    type: q.category.toLowerCase(),
    prompt: q.displayQuestion,
    ttsTranscript: q.ttsTranscript || q.displayQuestion,
    expectedPoints: q.expectedDiscussion ? [q.expectedDiscussion] : [],
    difficulty: q.difficulty?.toLowerCase() || "medium",
  };
}

function extractQuestions(raw: unknown): StoredQuestion[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw as StoredQuestion[];
  if (typeof raw === "object" && raw !== null && "questions" in raw) {
    const questions = (raw as { questions: unknown }).questions;
    return Array.isArray(questions) ? (questions as StoredQuestion[]) : [];
  }
  return [];
}

function extractAnsweredCount(raw: unknown): number {
  if (!raw || typeof raw !== "object" || !("answers" in raw)) return 0;
  const blob = raw as StoredAnswersBlob;
  return Array.isArray(blob.answers) ? blob.answers.length : 0;
}

/**
 * GET /api/interview/[id]
 *
 * Loads an existing interview for resumption. Returns all fields the frontend
 * needs in a single response — no second fetch required.
 *
 * Rejects:
 *  - Interviews not owned by the authenticated user  → 404
 *  - Terminal statuses (COMPLETED, FAILED, CANCELLED) → 409 INTERVIEW_NOT_RESUMABLE
 *
 * The frontend uses `currentQuestionIndex` to advance the store to the first
 * unanswered question before mounting VoiceInterview (which reconnects Deepgram).
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true },
    });
    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 },
      );
    }

    const { id: interviewId } = await params;

    const interview = await prisma.interview.findFirst({
      where: {
        id: interviewId,
        userId: user.id, // ownership enforced — never resume someone else's interview
      },
      include: { answer: true },
    });

    if (!interview) {
      return NextResponse.json(
        { success: false, error: "Interview not found" },
        { status: 404 },
      );
    }

    // ── Server-side resumability check ────────────────────────────────────
    // Rejects stale/completed interviews regardless of what the frontend says.
    if (NON_RESUMABLE.includes(interview.status)) {
      return NextResponse.json(
        {
          success: false,
          code: "INTERVIEW_NOT_RESUMABLE",
          status: interview.status,
        },
        { status: 409 },
      );
    }

    // ── Build UI-ready question list ──────────────────────────────────────
    const storedQuestions = extractQuestions(interview.questions);
    const uiQuestions = storedQuestions.map((q) =>
      toUiQuestion(interview.id, q),
    );

    // ── Compute resume position ───────────────────────────────────────────
    // currentQuestionIndex = number of answers already saved.
    // Note: a future branching/skip system may need an explicit DB field here.
    const currentQuestionIndex = extractAnsweredCount(interview.answer?.answers);

    return NextResponse.json({
      success: true,
      data: {
        interviewId: interview.id,
        status: interview.status,
        role: interview.role,
        company: interview.customCompanyName ?? interview.company ?? "",
        difficulty: interview.difficulty,
        interviewType: interview.interviewType,
        createdAt: interview.createdAt.toISOString(),
        startedAt: interview.startedAt?.toISOString() ?? null,
        questions: uiQuestions,
        currentQuestionIndex,
      },
    });
  } catch (error) {
    console.error("[INTERVIEW_RESUME_ERROR]", error);
    return NextResponse.json(
      { success: false, error: "Failed to load interview" },
      { status: 500 },
    );
  }
}
