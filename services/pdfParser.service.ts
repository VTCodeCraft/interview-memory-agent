import "server-only";

import { createRequire } from "module";
import { pathToFileURL } from "url";
import { logger } from "@/lib/utils/logger";

const require = createRequire(import.meta.url);

export interface PdfParseResult {
  text: string;
  pages: number;
  charactersExtracted: number;
}

function cleanText(raw: string): string {
  return raw
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]+/g, " ")
    .replace(/^\s*\n/gm, "")
    .trim();
}

async function extractWithPdfJs(buffer: Buffer): Promise<PdfParseResult> {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");

  const workerPath = require.resolve("pdfjs-dist/legacy/build/pdf.worker.mjs");
  pdfjs.GlobalWorkerOptions.workerSrc = pathToFileURL(workerPath).href;

  let doc: import("pdfjs-dist").PDFDocumentProxy | null = null;

  try {
    const data = new Uint8Array(buffer);
    const loadingTask = pdfjs.getDocument({ data, useSystemFonts: true });
    doc = await loadingTask.promise;

    const totalPages = doc.numPages;
    const pageTexts: string[] = [];

    for (let i = 1; i <= totalPages; i++) {
      const page = await doc.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items
        .map((item: Record<string, unknown>) => (typeof item.str === "string" ? item.str : ""))
        .join(" ");
      pageTexts.push(pageText);
      page.cleanup();
    }

    const rawText = pageTexts.join("\n\n");

    if (!rawText.trim()) {
      throw new PdfParseError("The uploaded PDF appears to be empty or contains no extractable text");
    }

    const cleaned = cleanText(rawText);

    return {
      text: cleaned,
      pages: totalPages,
      charactersExtracted: cleaned.length,
    };
  } catch (cause) {
    if (cause instanceof PdfParseError) throw cause;

    const message = cause instanceof Error ? cause.message : String(cause);

    if (message.includes("password") || message.includes("encrypted")) {
      throw new PdfParseError("Password-protected PDFs are not supported");
    }

    if (message.includes("InvalidPDF") || message.includes("corrupt") || message.includes("invalid")) {
      throw new PdfParseError("The uploaded PDF appears to be corrupted or invalid");
    }

    logger.error("PDF parsing failed", { error: message });
    throw new PdfParseError("Failed to parse the uploaded PDF");
  } finally {
    if (doc) {
      try {
        await doc.cleanup();
      } catch {
        logger.warn("Failed to cleanup PDF document");
      }
    }
  }
}

export async function parsePdf(buffer: Buffer): Promise<PdfParseResult> {
  return extractWithPdfJs(buffer);
}

export class PdfParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PdfParseError";
  }
}
