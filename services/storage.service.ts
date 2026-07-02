import "server-only";

import path from "path";
import crypto from "crypto";
import { logger } from "@/lib/utils/logger";

export interface UploadResult {
  fileUrl: string;
  filePath: string;
  originalFileName: string;
  storedFileName: string;
  fileSize: number;
  mimeType: string;
}

export interface ResumeStorage {
  save(input: StoreResumeFileInput): Promise<UploadResult>;
  remove(filePath: string): Promise<void>;
}

export interface StoreResumeFileInput {
  buffer: Buffer;
  originalFileName: string;
  mimeType: string;
}

function getSafePdfFileName(originalFileName: string) {
  const baseName = path
    .basename(originalFileName, path.extname(originalFileName))
    .replace(/[^a-zA-Z0-9-_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

  return `${baseName || "resume"}-${crypto.randomUUID()}.pdf`;
}

export class LocalResumeStorage implements ResumeStorage {
  async save(input: StoreResumeFileInput): Promise<UploadResult> {
    const storedFileName = getSafePdfFileName(input.originalFileName);
    const fileUrl = `/uploads/${storedFileName}`;

    logger.info("Resume file metadata prepared", {
      fileUrl,
      fileSize: input.buffer.length,
      mimeType: input.mimeType,
    });

    return {
      fileUrl,
      filePath: storedFileName,
      originalFileName: input.originalFileName,
      storedFileName,
      fileSize: input.buffer.length,
      mimeType: input.mimeType,
    };
  }

  async remove(_filePath: string): Promise<void> {
    // No file is written to disk, so removal is a no-op.
  }
}

const resumeStorage = new LocalResumeStorage();

export async function storeResumeFile(
  input: StoreResumeFileInput
): Promise<UploadResult> {
  return resumeStorage.save(input);
}

export async function removeResumeFile(filePath: string): Promise<void> {
  return resumeStorage.remove(filePath);
}

export class StorageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StorageError";
  }
}
