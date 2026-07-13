import { NextRequest } from "next/server";
import { syncCurrentClerkUserToDatabase } from "@/lib/auth/sync-user";
import {
  ResumeDbError,
  ResumeParseError,
  ResumeValidationError,
  StorageError,
  uploadResume,
} from "@/services/resume.service";
import { unauthorized } from "@/lib/utils/api";
import { logger } from "@/lib/utils/logger";
import { prisma } from "@/lib/db/prisma";
import { InterviewStatus } from "@prisma/client";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const user = await syncCurrentClerkUserToDatabase();

    if (!user) {
      return unauthorized();
    }

    // Block upload if the user has an active interview
    const activeInterview = await prisma.interview.findFirst({
      where: {
        userId: user.id,
        status: {
          in: [
            InterviewStatus.PENDING,
            InterviewStatus.READY,
            InterviewStatus.ONGOING,
            InterviewStatus.GENERATING,
          ],
        },
      },
      select: { id: true },
    });

    if (activeInterview) {
      return Response.json(
        { success: false, error: "Finish your interview before uploading a new resume." },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return Response.json(
        { success: false, error: "Resume file is required." },
        { status: 400 }
      );
    }

    const result = await uploadResume({ userId: user.id, file });

    logger.info("Resume uploaded and parsed successfully", {
      resumeId: result.resumeId,
      userId: user.id,
      pageCount: result.pageCount,
      charactersExtracted: result.charactersExtracted,
    });

    return Response.json({
      success: true,
      resumeId: result.resumeId,
      fileUrl: result.fileUrl,
      originalFileName: result.originalFileName,
      storedFileName: result.storedFileName,
      fileSize: result.fileSize,
      mimeType: result.mimeType,
      charactersExtracted: result.charactersExtracted,
      pages: result.pageCount,
      message: "Resume uploaded and text extracted successfully.",
    });
  } catch (reason) {
    if (reason instanceof StorageError) {
      return Response.json(
        { success: false, error: "Unable to store the uploaded file." },
        { status: 500 }
      );
    }

    if (reason instanceof ResumeValidationError) {
      return Response.json(
        { success: false, error: reason.message },
        { status: 400 }
      );
    }

    if (reason instanceof ResumeParseError) {
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
      { success: false, error: "Unable to upload and extract resume text." },
      { status: 500 }
    );
  }
}
