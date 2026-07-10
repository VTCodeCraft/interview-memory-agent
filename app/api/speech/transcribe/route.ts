import { NextRequest, NextResponse } from "next/server";
import { speechToText } from "@/lib/deepgram/speech-to-text";
import { errorResponse, fail, ok } from "@/lib/utils/api";
import type { TranscriptChunk } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const audio = (await request.formData()).get("audio");
    if (!(audio instanceof File)) return NextResponse.json(fail("audio file required"), { status: 400 });
    if (process.env.DEEPGRAM_API_KEY) return NextResponse.json(ok(await speechToText(audio)));
    return NextResponse.json(ok({ text: "[stub transcript — configure DEEPGRAM_API_KEY]", isFinal: true } satisfies TranscriptChunk));
  } catch (reason) { return errorResponse(reason, "speech transcription error"); }
}
