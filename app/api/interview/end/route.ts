import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { evaluateInterview } from "@/services/interview.service";
import { persistInterviewMemory } from "@/services/memory.service";
import { saveReport, getReport } from "@/services/report.service";
import { withInFlight } from "@/lib/utils/dedup";
import { toFriendlyError } from "@/lib/utils/errors";
import { FRIENDLY } from "@/lib/utils/messages";

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

    // De-duplicate + make idempotent: the same interview is evaluated at most
    // once even if /api/interview/end and /api/reports/generate race, or the
    // client retries. Subsequent calls return the existing report.
    const report = await withInFlight(`eval:${interviewId}`, async () => {
      const existing = await prisma.report.findUnique({
        where: { interviewId },
      });

      if (existing) {
        console.log("[Interview] Evaluation already exists — returning cached", {
          interviewId,
        });
        const cached = await getReport(existing.id);
        if (cached) {
          await ensureCompleted(interviewId);
          return cached;
        }
      }

      console.log("[Interview] Evaluation started", { interviewId });

      const evaluation = await evaluateInterview({
        interviewId,
        userId: user.id,
      });

      const saved = await saveReport(user.id, interviewId, evaluation);

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

      // Best-effort memory — never blocks completion (swallowed inside).
      await persistInterviewMemory(
        { ...saved, interview: completedInterview },
        { historicalTrend: evaluation.historicalProgress?.overallTrend ?? null },
      );

      console.log("[Interview] Evaluation completed", { interviewId });
      return saved;
    });

    return NextResponse.json({ success: true, data: report });
  } catch (error: unknown) {
    // Server-side detail only; client gets a friendly message.
    console.error("[Interview] Evaluation failed", { error });

    const message = toFriendlyError(error, FRIENDLY.aiRetry);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

/** Ensure the interview is marked COMPLETED even on the idempotent path. */
async function ensureCompleted(interviewId: string): Promise<void> {
  try {
    await prisma.interview.update({
      where: { id: interviewId },
      data: { status: "COMPLETED", endedAt: new Date() },
    });
  } catch {
    // Non-fatal — report already exists; status is best-effort.
  }
}
