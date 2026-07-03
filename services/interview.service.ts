import { prisma } from "@/lib/db/prisma";
import { Difficulty, InterviewStatus } from "@prisma/client";
import { complete, parseJSON } from "@/lib/ai";
import {
  buildEvaluationPrompt,
  evaluationSystemPrompt,
} from "@/lib/ai/prompts";
import { uid } from "@/lib/utils";
import type { AIProvider, Evaluation } from "@/types";


/** Evaluate answered questions and return a structured evaluation. */
export async function evaluateInterview(params: {
  interviewId: string;
  userId: string;
  provider?: AIProvider;
}): Promise<Evaluation> {
  const { interviewId, userId, provider } = params;

  const interview = await prisma.interview.findFirst({
    where: { id: interviewId, userId },
    select: {
      id: true,
      role: true,
      questions: true,
      answer: {
        select: { answers: true },
      },
    },
  });

  if (!interview) {
    throw new Error("INTERVIEW_NOT_FOUND");
  }

  const questions = normalizeStoredQuestions(interview.questions);
  const answers = normalizeStoredAnswers(interview.answer?.answers);
  const qa = questions.map((question) => ({
    question,
    answer: answers.find((answer) => answer.sequence === question.sequence),
  }));

  const raw = await complete(
    evaluationSystemPrompt,
    buildEvaluationPrompt({ role: interview.role, qa }),
    { provider, json: true }
  );

  const parsed = parseJSON<Omit<Evaluation, "id" | "interviewId" | "createdAt">>(
    raw
  );

  return {
    id: uid("eval"),
    interviewId,
    createdAt: new Date().toISOString(),
    ...parsed,
  };
}

type StoredInterviewQuestion = {
  sequence: number;
  category: string;
  difficulty: string;
  displayQuestion: string;
  ttsTranscript: string;
  expectedDiscussion: string | null;
};

type StoredInterviewAnswer = {
  sequence: number;
  transcript: string;
  duration: number;
  confidence: number | null;
};

type StoredQuestionsBlob = {
  questions: StoredInterviewQuestion[];
};

type StoredAnswersBlob = {
  answers: StoredInterviewAnswer[];
};

function normalizeStoredQuestions(raw: unknown): StoredInterviewQuestion[] {
  if (!raw) return [];

  if (Array.isArray(raw)) {
    return raw as StoredInterviewQuestion[];
  }

  if (typeof raw === "object" && raw !== null && "questions" in raw) {
    const questions = (raw as StoredQuestionsBlob).questions;
    return Array.isArray(questions) ? questions : [];
  }

  return [];
}

function normalizeStoredAnswers(raw: unknown): StoredInterviewAnswer[] {
  if (!raw || typeof raw !== "object" || !("answers" in raw)) {
    return [];
  }

  const answers = (raw as StoredAnswersBlob).answers;
  return Array.isArray(answers) ? answers : [];
}

export interface CreateInterviewParams {
  userId: string;
  company?: string;
  companyType?: string;
  customCompanyName?: string;
  role?: string;
  interviewType?: string;
  difficulty?: Difficulty;
  jobDescription?: string;
  forceNew?: boolean;
}

export async function createInterviewSession(params: CreateInterviewParams) {
  const {
    userId,
    company,
    companyType,
    customCompanyName,
    role,
    interviewType,
    difficulty,
    jobDescription,
    forceNew = false,
  } = params;

  const userProfile = await prisma.userProfile.findUnique({
    where: { userId },
  });

  if (!userProfile) {
    throw new Error("PROFILE_NOT_FOUND");
  }

  const latestResume = await prisma.resume.findFirst({
    where: { userId },
    orderBy: { uploadedAt: "desc" },
  });

  if (!latestResume) {
    throw new Error("RESUME_NOT_FOUND");
  }

  const latestInterview = forceNew
    ? null
    : await prisma.interview.findFirst({
        where: { userId },
        orderBy: { createdAt: "desc" },
        select: { id: true, status: true },
      });

  if (latestInterview?.status === "ONGOING") {
    return latestInterview;
  }

  const reusableInterview =
    latestInterview &&
    ["GENERATING", "FAILED"].includes(latestInterview.status)
      ? latestInterview
      : null;

  return prisma.$transaction(async (tx) => {
    const existingInterview = reusableInterview
      ? await tx.interview.findUnique({
          where: { id: reusableInterview.id },
          select: {
            company: true,
            companyType: true,
            customCompanyName: true,
            role: true,
            interviewType: true,
            difficulty: true,
            jobDescriptionId: true,
          },
        })
      : null;

    const effectiveCompany = company ?? existingInterview?.company;
    const effectiveRole = role ?? existingInterview?.role;
    const effectiveInterviewType = interviewType ?? existingInterview?.interviewType;
    const effectiveDifficulty = difficulty ?? existingInterview?.difficulty;

    let jobDescriptionId: string | undefined = existingInterview?.jobDescriptionId ?? undefined;

    if (jobDescription) {
      const companyName =
        effectiveCompany === "Other" && customCompanyName?.trim()
          ? customCompanyName.trim()
          : effectiveCompany ?? "";

      if (reusableInterview && existingInterview?.jobDescriptionId) {
        const updatedJd = await tx.jobDescription.update({
          where: { id: existingInterview.jobDescriptionId },
          data: {
            company: companyName,
            title: effectiveRole ?? "",
            rawText: jobDescription,
          },
        });
        jobDescriptionId = updatedJd.id;
      } else {
        const createdJd = await tx.jobDescription.create({
          data: {
            userId,
            company: companyName,
            title: effectiveRole ?? "",
            rawText: jobDescription,
            parsedSkills: [],
          },
        });
        jobDescriptionId = createdJd.id;
      }
    }

    if (!effectiveRole || !effectiveInterviewType || !effectiveDifficulty || !effectiveCompany) {
      throw new Error("INTERVIEW_CONFIG_INCOMPLETE");
    }

    const requiredRole = effectiveRole;
    const requiredInterviewType = effectiveInterviewType;
    const requiredDifficulty = effectiveDifficulty;
    const requiredCompany = effectiveCompany;

    const interviewPayload = {
      resumeId: latestResume.id,
      ...(jobDescriptionId ? { jobDescriptionId } : {}),
      ...(requiredCompany !== undefined
        ? {
            company: requiredCompany === "Other" ? "Other" : requiredCompany,
            companyType:
              requiredCompany === "Other"
                ? customCompanyName?.trim() === ""
                  ? existingInterview?.companyType ?? null
                  : companyType?.trim() || existingInterview?.companyType || null
                : null,
            customCompanyName:
              requiredCompany === "Other"
                ? customCompanyName?.trim() ||
                  existingInterview?.customCompanyName ||
                  null
                : null,
          }
        : {}),
      ...(requiredRole !== undefined ? { role: requiredRole } : {}),
      ...(requiredInterviewType !== undefined
        ? { interviewType: requiredInterviewType }
        : {}),
      ...(requiredDifficulty !== undefined
        ? { difficulty: requiredDifficulty }
        : {}),
      status: "GENERATING" as const,
    };

    if (reusableInterview) {
      return tx.interview.update({
        where: { id: reusableInterview.id },
        data: interviewPayload,
      });
    }

    return tx.interview.create({
      data: {
        userId,
        resumeId: latestResume.id,
        ...(jobDescriptionId ? { jobDescriptionId } : {}),
        company: requiredCompany === "Other" ? "Other" : requiredCompany,
        companyType:
          requiredCompany === "Other"
            ? companyType?.trim() || null
            : null,
        customCompanyName:
          requiredCompany === "Other"
            ? customCompanyName?.trim() || null
            : null,
        role: requiredRole,
        interviewType: requiredInterviewType,
        difficulty: requiredDifficulty,
        status: "GENERATING",
      },
    });
  });
}
