import { NextRequest } from "next/server";
import { requireUserId, AuthError } from "@/services/auth.service";
import { storeResumeFile, StorageError } from "@/services/storage.service";
import { parsePdf, PdfParseError } from "@/services/pdfParser.service";
import { createResume, ResumeDbError } from "@/services/resume.service";
import { unauthorized } from "@/lib/utils/api";
import { MAX_FILE_SIZE } from "@/lib/utils/constants";
import { logger } from "@/lib/utils/logger";

export async function POST(request: NextRequest) {
  try {
    const clerkId = await requireUserId();

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return Response.json(
        { success: false, error: "Resume file is required." },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return Response.json(
        { success: false, error: "File exceeds the maximum allowed size of 10 MB." },
        { status: 400 }
      );
    }

    if (file.type !== "application/pdf") {
      return Response.json(
        { success: false, error: "Only PDF files are accepted." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    if (buffer.length === 0) {
      return Response.json(
        { success: false, error: "The uploaded file is empty." },
        { status: 400 }
      );
    }

    const { url: fileUrl } = await storeResumeFile(buffer, file.name);

    const { text: parsedText, pages, charactersExtracted } = await parsePdf(buffer);

    const resume = await createResume({
      userId: clerkId,
      fileUrl,
      parsedText,
    });

    logger.info("Resume uploaded and parsed successfully", {
      resumeId: resume.id,
      pages,
      charactersExtracted,
    });

    return Response.json({
      success: true,
      resumeId: resume.id,
      charactersExtracted,
      pages,
      message: "Resume uploaded and parsed successfully.",
    });
  } catch (reason) {
    if (reason instanceof AuthError) {
      return unauthorized();
    }

    if (reason instanceof StorageError) {
      return Response.json(
        { success: false, error: "Unable to store the uploaded file." },
        { status: 500 }
      );
    }

    if (reason instanceof PdfParseError) {
      return Response.json(
        { success: false, error: reason.message },
        { status: 422 }
      );
    }

    if (reason instanceof ResumeDbError) {
      return Response.json(
        { success: false, error: reason.message },
        { status: 500 }
      );
    }

    const message = reason instanceof Error ? reason.message : "Unknown error";
    logger.error("Resume upload failed", { error: message });
    return Response.json(
      { success: false, error: "Unable to parse the uploaded PDF." },
      { status: 500 }
    );
  }
}
