import { z } from "zod";

export const resumeUploadSchema = z.object({
  fileUrl: z.string().url("Invalid file URL"),
});

export const resumeFileSchema = z.object({
  file: z.instanceof(File, { message: "Resume file is required" }),
});

export type ResumeUploadInput = z.infer<typeof resumeUploadSchema>;
