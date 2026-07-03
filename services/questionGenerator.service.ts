import { Difficulty, InterviewStatus } from "@prisma/client";

import { generateInterviewQuestions } from "@/lib/ai/questionGenerator";
import { prisma } from "@/lib/db/prisma";
import { prepareInterviewPrompt } from "./promptBuilder.service";

type StoredInterviewQuestion = {
  sequence: number;
  category: string;
  difficulty: Difficulty;
  displayQuestion: string;
  ttsTranscript: string;
  expectedDiscussion: string | null;
};

type UiInterviewQuestion = StoredInterviewQuestion & {
  id: string;
  prompt: string;
  type: string;
};

type InterviewQuestionsBlob = {
  questions: StoredInterviewQuestion[];
};

function normalizeDifficulty(value?: string): Difficulty {
  const normalized = value?.toUpperCase();
  if (normalized === "EASY" || normalized === "MEDIUM" || normalized === "HARD") {
    return normalized;
  }

  return Difficulty.MEDIUM;
}

function toStoredQuestion(question: any, index: number): StoredInterviewQuestion {
  return {
    sequence: typeof question.sequence === "number" ? question.sequence : index + 1,
    category: String(question.category || "General"),
    difficulty: normalizeDifficulty(question.difficulty),
    displayQuestion: String(question.displayQuestion || question.prompt || ""),
    ttsTranscript: String(question.ttsTranscript || question.displayQuestion || question.prompt || ""),
    expectedDiscussion:
      typeof question.expectedDiscussion === "string" && question.expectedDiscussion.trim().length > 0
        ? question.expectedDiscussion.trim()
        : null,
  };
}

function toUiQuestion(interviewId: string, question: StoredInterviewQuestion): UiInterviewQuestion {
  return {
    ...question,
    id: `${interviewId}-${question.sequence}`,
    prompt: question.displayQuestion,
    type: question.category.toLowerCase(),
  };
}

function extractStoredQuestions(raw: unknown): StoredInterviewQuestion[] | null {
  if (!raw) return null;

  if (Array.isArray(raw)) {
    return raw as StoredInterviewQuestion[];
  }

  if (typeof raw === "object" && raw !== null && "questions" in raw) {
    const questions = (raw as InterviewQuestionsBlob).questions;
    return Array.isArray(questions) ? questions : null;
  }

  return null;
}

export async function processInterviewGeneration(params: {
  userId: string;
  interviewId?: string;
}) {
  const { userId, interviewId } = params;

  const interview = interviewId
    ? await prisma.interview.findFirst({
        where: { id: interviewId, userId },
        include: {
          user: {
            include: { profile: true },
          },
          resume: true,
          jobDescription: true,
        },
      })
    : await prisma.interview.findFirst({
        where: {
          userId,
          status: {
            in: [InterviewStatus.GENERATING, InterviewStatus.FAILED],
          },
        },
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            include: { profile: true },
          },
          resume: true,
          jobDescription: true,
        },
      });

  if (!interview) {
    throw new Error("Interview not found");
  }

  if (interview.userId !== userId) {
    throw new Error("Unauthorized");
  }

  const existingQuestions = extractStoredQuestions(interview.questions);
  if (interview.status === InterviewStatus.READY && existingQuestions?.length) {
    const questions = existingQuestions.map((question) =>
      toUiQuestion(interview.id, question)
    );

    return {
      interviewId: interview.id,
      status: InterviewStatus.READY,
      totalQuestions: questions.length,
      questions,
      currentQuestion: questions[0] ?? null,
    };
  }

  if (
    interview.status !== InterviewStatus.GENERATING &&
    interview.status !== InterviewStatus.FAILED
  ) {
    throw new Error("Interview is not ready for generation");
  }

  if (interview.status === InterviewStatus.FAILED) {
    await prisma.interview.update({
      where: { id: interview.id },
      data: { status: InterviewStatus.GENERATING },
    });
  }

  try {
    const prompt = await prepareInterviewPrompt(interview);
    const questionsData = await generateInterviewQuestions(prompt);

    if (!questionsData || questionsData.length === 0) {
      throw new Error("AI returned no questions");
    }

    const storedQuestions = questionsData.map((question: any, index: number) =>
      toStoredQuestion(question, index)
    );

    const questionsBlob: InterviewQuestionsBlob = {
      questions: storedQuestions,
    };

    await prisma.interview.update({
      where: { id: interview.id },
      data: {
        questions: questionsBlob,
        status: InterviewStatus.READY,
      },
    });

    const uiQuestions = storedQuestions.map((question: StoredInterviewQuestion) =>
      toUiQuestion(interview.id, question)
    );

    return {
      interviewId: interview.id,
      status: InterviewStatus.READY,
      totalQuestions: uiQuestions.length,
      questions: uiQuestions,
      currentQuestion: uiQuestions[0] ?? null,
    };
  } catch (error) {
    console.error("Error generating interview questions:", error);
    await prisma.interview.update({
      where: { id: interview.id },
      data: { status: InterviewStatus.FAILED },
    });
    throw error;
  }
}
