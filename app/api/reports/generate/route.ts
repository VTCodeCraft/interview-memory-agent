import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { errorResponse, fail, ok } from "@/lib/utils/api";
import { evaluateInterview } from "@/services/interview.service";
import { rememberEvaluation } from "@/services/memory.service";
import { saveReport } from "@/services/report.service";
import type { AIProvider } from "@/types";
import { prisma } from "@/lib/db/prisma";

const bodySchema = z.object({
  interviewId: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json(fail("unauthorized"), { status: 401 });

    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true },
    });

    if (!user) return NextResponse.json(fail("user not found"), { status: 404 });

    const body = (await request.json()) as unknown;
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(fail("interviewId required"), { status: 400 });
    }

    const evaluation = await evaluateInterview({
      interviewId: parsed.data.interviewId,
      userId: user.id,
      provider: (body as { provider?: AIProvider }).provider,
    });

    await Promise.allSettled([
      saveReport(user.id, parsed.data.interviewId, evaluation),
      rememberEvaluation(user.id, parsed.data.interviewId, evaluation),
    ]);
    return NextResponse.json(ok(evaluation));
  } catch (reason) { return errorResponse(reason, "report generation error"); }
}
