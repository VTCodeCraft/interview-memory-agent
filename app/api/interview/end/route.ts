import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { evaluateInterview } from "@/services/interview.service";
import { persistInterviewMemory } from "@/services/memory.service";
import { saveReport } from "@/services/report.service";

const bodySchema = z.object({
  interviewId: z.string().min(1, "interviewId is required"),
});

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "interviewId is required" },
        { status: 400 },
      );
    }

    const { interviewId } = parsed.data;

    // ── Step 1: Load questions + answers from DB and run Gemini evaluation ──
    const evaluation = await evaluateInterview({
      interviewId,
      userId: user.id,
    });

    // ── Step 2: Persist report to Prisma Report table ──
    const report = await saveReport(user.id, interviewId, evaluation);

    // ── Step 3: Mark interview as COMPLETED ──
    const completedInterview = await prisma.interview.update({
      where: { id: interviewId },
      data: { status: "COMPLETED", endedAt: new Date() },
      select: {
        userId: true,
        company: true,
        customCompanyName: true,
        role: true,
        interviewType: true,
      },
    });

    // ── Step 4: Build semantic memory and store it in Cognee ──
    // Phase 6: carry the historical trend summary into stored memory so that
    // future recall queries can surface longitudinal improvement patterns.
    await persistInterviewMemory(
      { ...report, interview: completedInterview },
      { historicalTrend: evaluation.historicalProgress?.overallTrend ?? null },
    );

    // ── Step 5: Return to frontend ──
    return NextResponse.json({ success: true, data: report });
  } catch (error: unknown) {
    console.error("[INTERVIEW_END_ERROR]", error);

    const message =
      error instanceof Error ? error.message : "Failed to finish interview";

    if (message === "INTERVIEW_NOT_FOUND") {
      return NextResponse.json(
        { success: false, error: "Interview not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
