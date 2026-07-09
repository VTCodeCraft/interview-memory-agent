import { NextRequest, NextResponse } from "next/server";
import { requireUserId, getOrCreateDBUser, AuthError } from "@/services/auth.service";
import { errorResponse, ok } from "@/lib/utils/api";
import type { MemoryNode } from "@/types";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const clerkId = await requireUserId();
    await getOrCreateDBUser(clerkId);

    // Fetch all reports for the user to aggregate memory facts directly from DB
    const reports = await prisma.report.findMany({
      where: { interview: { user: { clerkId } } },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    const nodes: MemoryNode[] = [];
    let index = 0;

    const addNode = (content: string) => {
      if (!content || content.trim() === "") return;
      nodes.push({
        id: `mem-${index++}`,
        userId: clerkId,
        content,
        kind: "fact",
        createdAt: new Date().toISOString(),
      });
    };

    // Aggregate unique lists
    const allStrengths = Array.from(new Set(reports.flatMap((r) => r.strengths)));
    const allWeaknesses = Array.from(new Set(reports.flatMap((r) => [...r.weaknesses, ...r.missingTopics])));
    const allRecs = Array.from(new Set(reports.flatMap((r) => r.recommendations)));

    if (allStrengths.length > 0) {
      addNode("### Strengths");
      allStrengths.forEach(addNode);
      
      // We will also use strengths to populate Evident Skills
      addNode("### Evident Skills / Knowledge");
      allStrengths.slice(0, 4).forEach(s => addNode(`**Demonstrated:** ${s}`));
    }

    if (allWeaknesses.length > 0) {
      addNode("### Weaknesses");
      allWeaknesses.forEach(addNode);
    }

    if (allRecs.length > 0) {
      addNode("### Recommendations from Past Interviews");
      allRecs.forEach(addNode);
    }

    return NextResponse.json(ok({ nodes, edges: [] as Array<{ source: string; target: string }> }));
  } catch (reason) {
    if (reason instanceof AuthError) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    return errorResponse(reason, "memory graph error");
  }
}
