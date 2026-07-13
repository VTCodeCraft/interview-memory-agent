import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { InterviewStatus } from "@prisma/client";

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (
      process.env.CRON_SECRET &&
      authHeader !== `Bearer ${process.env.CRON_SECRET}`
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find ONGOING or READY interviews not updated in the last 60 minutes
    const staleThreshold = new Date(Date.now() - 60 * 60 * 1000);

    const result = await prisma.interview.updateMany({
      where: {
        status: { in: [InterviewStatus.ONGOING, InterviewStatus.READY] },
        updatedAt: { lt: staleThreshold },
      },
      data: {
        status: InterviewStatus.FAILED,
      },
    });

    console.log(`[CRON] Cleaned up ${result.count} stale interviews`);

    return NextResponse.json({
      success: true,
      cleanedUp: result.count,
    });
  } catch (error) {
    console.error("[CRON_CLEANUP_ERROR]", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
