/**
 * lib/cognee/validator.ts
 *
 * Phase 8 – Production Hardening: Memory validation before remember().
 *
 * Validates that a semantic memory object has enough meaningful content to
 * be worth storing in Cognee.  Skipping invalid memories prevents polluting
 * the knowledge graph with empty or degenerate entries that would degrade
 * future recall quality.
 */

import type { InterviewSemanticMemory } from "@/services/memory-builder.service";

export type MemoryValidationResult =
  | { valid: true }
  | { valid: false; issues: string[] };

/**
 * Validates an InterviewSemanticMemory before it is stored via remember().
 *
 * Rules:
 * - userId must be a non-empty string
 * - interviewId must be a non-empty string
 * - strengths, weaknesses, and recommendations must be arrays
 * - scores.overall, when provided, must be 0–100
 * - At least one of strengths, weaknesses, scores.overall, or recommendations
 *   must contain meaningful data (prevents storing empty shells)
 */
export function validateMemory(
  memory: InterviewSemanticMemory,
): MemoryValidationResult {
  const issues: string[] = [];

  // Identity
  if (!memory.userId?.trim()) {
    issues.push("userId is missing or empty");
  }
  if (!memory.interviewId?.trim()) {
    issues.push("interviewId is missing or empty");
  }

  // Array types
  if (!Array.isArray(memory.strengths)) {
    issues.push("strengths must be an array");
  }
  if (!Array.isArray(memory.weaknesses)) {
    issues.push("weaknesses must be an array");
  }
  if (!Array.isArray(memory.recommendations)) {
    issues.push("recommendations must be an array");
  }

  // Score range (only when provided)
  const overall = memory.scores?.overall;
  if (overall !== null && overall !== undefined) {
    if (
      typeof overall !== "number" ||
      !Number.isFinite(overall) ||
      overall < 0 ||
      overall > 100
    ) {
      issues.push(
        `scores.overall must be 0–100 (received ${String(overall)})`,
      );
    }
  }

  // At least something worth storing
  const hasContent =
    (Array.isArray(memory.strengths) && memory.strengths.length > 0) ||
    (Array.isArray(memory.weaknesses) && memory.weaknesses.length > 0) ||
    (Array.isArray(memory.recommendations) && memory.recommendations.length > 0) ||
    (overall !== null && overall !== undefined);

  if (!hasContent) {
    issues.push(
      "memory has no semantic content (no strengths, weaknesses, scores, or recommendations)",
    );
  }

  return issues.length > 0 ? { valid: false, issues } : { valid: true };
}
