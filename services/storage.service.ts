import "server-only";

import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";
import { UPLOAD_DIR } from "@/lib/utils/constants";
import { logger } from "@/lib/utils/logger";

export interface UploadResult {
  url: string;
  filePath: string;
}

export async function storeResumeFile(buffer: Buffer, originalName: string): Promise<UploadResult> {
  const ext = path.extname(originalName) || ".pdf";
  const uniqueName = `${crypto.randomUUID()}${ext}`;
  const relativeDir = UPLOAD_DIR;
  const relativePath = path.join(relativeDir, uniqueName);

  const absoluteDir = path.resolve(process.cwd(), relativeDir);
  const absolutePath = path.resolve(process.cwd(), relativePath);

  try {
    await mkdir(absoluteDir, { recursive: true });
  } catch {
    logger.warn("Upload directory already exists", { dir: absoluteDir });
  }

  try {
    await writeFile(absolutePath, buffer);
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : "Unknown storage error";
    logger.error("Failed to store resume file", { path: absolutePath, error: message });
    throw new StorageError("Failed to store uploaded file");
  }

  const url = `/uploads/${uniqueName}`;
  logger.info("Resume file stored", { url, size: buffer.length });

  return { url, filePath: absolutePath };
}

export class StorageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StorageError";
  }
}
