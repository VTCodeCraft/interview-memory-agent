import { buildInterviewGenerationPrompt } from "@/lib/ai/promptBuilder";
import { parseJobDescription } from "@/lib/ai/questionGenerator";
import { prisma } from "@/lib/db/prisma";
import { recallCandidateMemory } from "@/services/cognee.service";

function formatFocus(values: string[]) {
  return values.length > 0 ? values.join(", ") : "none";
}

type PromptInterview = {
  userId: string;
  role: string;
  company?: string | null;
  customCompanyName?: string | null;
  companyType?: string | null;
  interviewType?: string | null;
  difficulty?: string | null;
  resume?: {
    rawText?: string | null;
  } | null;
  jobDescription?: {
    id: string;
    rawText?: string | null;
    parsedSkills: string[];
  } | null;
};

export async function prepareInterviewPrompt(interview: PromptInterview) {
  let jdText = "";

  if (interview.jobDescription) {
    // Check if it's already parsed
    if (
      !interview.jobDescription.parsedSkills ||
      interview.jobDescription.parsedSkills.length === 0
    ) {
      if (interview.jobDescription.rawText) {
        const parsed = await parseJobDescription(
          interview.jobDescription.rawText,
        );
        if (parsed) {
          const skills = [
            ...(parsed.requiredSkills || []),
            ...(parsed.preferredSkills || []),
          ];
          await prisma.jobDescription.update({
            where: { id: interview.jobDescription.id },
            data: { parsedSkills: skills },
          });
          jdText = `Skills: ${skills.join(", ")}\nResponsibilities: ${(parsed.responsibilities || []).join(", ")}`;
        }
      }
    } else {
      jdText = `Skills: ${interview.jobDescription.parsedSkills.join(", ")}\nText: ${interview.jobDescription.rawText?.substring(0, 500) || ""}`;
    }
  }

  const candidateMemory = await recallCandidateMemory({
    userId: interview.userId,
    role: interview.role,
    company: interview.customCompanyName || interview.company,
    interviewType: interview.interviewType,
  });

  console.log("[Cognee] Retrieved Memory", {
    count: candidateMemory.count,
    memory: candidateMemory.formatted,
  });
  console.log("[Cognee] Personalization Summary", {
    hasMemory: candidateMemory.count > 0,
    recurringWeaknesses: candidateMemory.focus.recurringWeaknesses,
    recurringStrengths: candidateMemory.focus.recurringStrengths,
    previouslyMissedTopics: candidateMemory.focus.previouslyMissedTopics,
    recentRecommendations: candidateMemory.focus.recentRecommendations,
  });
  console.log(
    "[Cognee] Weakness Focus:",
    formatFocus(candidateMemory.focus.recurringWeaknesses),
  );
  console.log(
    "[Cognee] Strength Focus:",
    formatFocus(candidateMemory.focus.recurringStrengths),
  );
  console.log("[Cognee] Passing memory to Prompt Builder", {
    hasMemory: candidateMemory.count > 0,
  });

  const prompt = buildInterviewGenerationPrompt({
    role: interview.role,
    companyType: interview.companyType || undefined,
    interviewType: interview.interviewType || undefined,
    difficulty: interview.difficulty || undefined,
    resumeText: interview.resume?.rawText || undefined,
    jobDescriptionText: jdText || undefined,
    candidateMemoryText: candidateMemory.formatted || undefined,
  });

  console.log("[Cognee] Prompt Builder Updated", {
    hasCandidateMemory: candidateMemory.count > 0,
    promptLength: prompt.length,
  });

  if (process.env.NODE_ENV !== "production") {
    console.log("[Prompt Builder] Final Prompt", prompt);
  }

  return prompt;
}
