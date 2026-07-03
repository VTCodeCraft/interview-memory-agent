import "server-only";

import { prisma } from "@/lib/db";
import type { JobDescriptionUploadInput } from "@/lib/validations/job-description";

export async function saveJobDescription(
  userId: string,
  input: JobDescriptionUploadInput
) {
  const existing = await prisma.jobDescription.findFirst({
    where: { userId },
    orderBy: { uploadedAt: "desc" },
    select: { id: true },
  });

  const data = {
    company: input.company,
    title: input.title,
    fileUrl: input.fileUrl || null,
    parsedSkills: [],
  };

  if (!existing) {
    return prisma.jobDescription.create({
      data: {
        userId,
        ...data,
      },
    });
  }

  return prisma.jobDescription.update({
    where: { id: existing.id },
    data,
  });
}

export async function getLatestJobDescription(userId: string) {
  return prisma.jobDescription.findFirst({
    where: { userId },
    orderBy: { uploadedAt: "desc" },
  });
}

// TODO: JD parsing with Gemini
