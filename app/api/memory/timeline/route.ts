import { NextRequest, NextResponse } from "next/server";
import { fail } from "@/lib/utils/api";

/**
 * GET /api/memory/timeline
 * POST /api/memory/timeline
 *
 * Placeholder — timeline queries rely on the legacy in-process memory stub
 * which has been removed in favour of the production Cognee integration.
 * Memory is stored and retrieved through the interview flow:
 *   POST /api/interview/end  →  remember() + improve()
 *   POST /api/interview/start → recall() for personalization
 */
export async function GET(_request: NextRequest) {
  return NextResponse.json(
    fail("Memory timeline is not available in this environment"),
    { status: 501 },
  );
}

export async function POST(_request: NextRequest) {
  return NextResponse.json(
    fail("Memory timeline is not available in this environment"),
    { status: 501 },
  );
}
