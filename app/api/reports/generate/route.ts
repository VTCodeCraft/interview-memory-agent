import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { errorResponse, fail, ok } from "@/lib/utils/api";
import { evaluateInterview } from "@/services/interview.service";
import { persistInterviewMemory } from "@/services/memory.service";
import { saveReport, getReport } from "@/services/report.service";
import { prisma } from "@/lib/db/prisma";
import { withInFlight } from "@/lib/utils/dedup";
import { FRIENDLY } from "@/lib/utils/messages";

const bodySchema = z.object({
  interviewId: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId)
      return NextResponse.json(fail("unauthorized"), { status: 401 });

    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true },
    });

    if (!user)
      return NextResponse.json(fail("user not found"), { status: 404 });

    const body = (await request.json()) as unknown;
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(fail("interviewId required"), { status: 400 });
    }

    const { interviewId } = parsed.data;

    // De-duplicated + idempotent: shares the same lock key as /api/interview/end
    // so the two routes never evaluate the same interview twice, and a cached
    // report is returned instead of re-running Gemini / re-writing memory.
    const evaluation = await withInFlight(`eval:${interviewId}`, async () => {
      const existing = await prisma.report.findUnique({
        where: { interviewId },
      });

      if (existing) {
        console.log("[Interview] Report already exists — returning cached", {
          interviewId,
        });
        const cached = await getReport(existing.id);
        if (cached) return cached.evaluation;
      }

      console.log("[Interview] Evaluation started (reports/generate)", {
        interviewId,
      });

      const result = await evaluateInterview({
        interviewId,
        userId: user.id,
      });

      const report = await saveReport(user.id, interviewId, result);

      const completedInterview = await prisma.interview.findFirst({
        where: { id: interviewId, userId: user.id },
        select: {
          userId: true,
          company: true,
          customCompanyName: true,
          role: true,
          interviewType: true,
        },
      });

      await prisma.interview.update({
        where: { id: interviewId },
        data: { status: "COMPLETED", endedAt: new Date() },
      });

      await persistInterviewMemory(
        { ...report, interview: completedInterview ?? undefined },
        { historicalTrend: result.historicalProgress?.overallTrend ?? null },
      );

      console.log("[Interview] Evaluation completed (reports/generate)", {
        interviewId,
      });
      return result;
    });

    return NextResponse.json(ok(evaluation));
  } catch (reason) {
    console.error("[Interview] Report generation failed", { reason });
    // errorResponse already sanitizes to a friendly message server-side.
    return errorResponse(reason, FRIENDLY.aiRetry);
  }
}
