import "server-only";

import { prisma } from "@/lib/db";
import { logger } from "@/lib/utils/logger";

export interface CreateResumeInput {
  userId: string;
  fileUrl: string;
  parsedText: string;
}

export async function createResume(input: CreateResumeInput) {
  try {
    const resume = await prisma.resume.create({
      data: {
        userId: input.userId,
        fileUrl: input.fileUrl,
        parsedText: input.parsedText,
      },
    });
    logger.info("Resume record created", { id: resume.id, userId: input.userId });
    return resume;
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : "Unknown database error";
    logger.error("Failed to create resume record", { userId: input.userId, error: message });
    throw new ResumeDbError("Failed to save resume to database");
  }
}

export async function getLatestResume(userId: string) {
  return prisma.resume.findFirst({
    where: { userId },
    orderBy: { uploadedAt: "desc" },
  });
}

export class ResumeDbError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ResumeDbError";
  }
}
