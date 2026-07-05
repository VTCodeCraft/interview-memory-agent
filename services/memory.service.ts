import { addMemory, cognify, listMemory, searchMemory } from "@/lib/cognee";
import { remember as rememberInCognee } from "@/services/cognee.service";
import {
  buildMemory,
  type MemoryBuilderReport,
} from "@/services/memory-builder.service";
import type { Evaluation, MemoryNode } from "@/types";

/** Persist evaluation insights into the candidate's long-term memory. */
export async function rememberEvaluation(
  userId: string,
  interviewId: string,
  evaluation: Evaluation,
): Promise<void> {
  await Promise.all([
    ...evaluation.strengths.map((s) =>
      addMemory(userId, s, "strength", interviewId),
    ),
    ...evaluation.weaknesses.map((w) =>
      addMemory(userId, w, "weakness", interviewId),
    ),
    addMemory(
      userId,
      evaluation.recommendations?.[0] ?? "",
      "note",
      interviewId,
    ),
  ]);
  await cognify(userId);
}

function getRememberResultId(result: unknown): string | null {
  if (!result || typeof result !== "object") return null;

  const record = result as Record<string, unknown>;
  const id =
    record.id ?? record.data_id ?? record.dataset_id ?? record.pipeline_run_id;

  return typeof id === "string" ? id : null;
}

function getErrorMessage(reason: unknown): string {
  return reason instanceof Error ? reason.message : String(reason);
}

export async function persistInterviewMemory(
  report: MemoryBuilderReport,
): Promise<void> {
  try {
    console.log("[Cognee] Building semantic memory...");

    const memory = buildMemory(report);
    console.log("[Cognee] Memory created", {
      userId: memory.userId,
      interviewId: memory.interviewId,
      company: memory.company,
      role: memory.role,
      interviewType: memory.interviewType,
    });

    console.log("[Cognee] Calling remember()...");
    const result = await rememberInCognee(memory);
    const memoryId = getRememberResultId(result);

    console.log("[Cognee] Memory stored successfully", {
      interviewId: memory.interviewId,
      memoryId: memoryId ?? "unknown",
    });
  } catch (reason) {
    console.error("[Cognee] Remember failed", {
      reason: getErrorMessage(reason),
    });
  }
}

export async function getMemory(userId: string): Promise<MemoryNode[]> {
  return listMemory(userId);
}

export async function queryMemory(userId: string, q: string) {
  return searchMemory(userId, q);
}
