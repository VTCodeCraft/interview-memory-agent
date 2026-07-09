import "server-only";

import { InterviewStatus } from "@prisma/client";

import { prisma } from "@/lib/db";

type StoredAnswer = {
  sequence: number;
  transcript: string;
  duration: number;
};

type StoredAnswersBlob = {
  answers: StoredAnswer[];
};

export interface SaveInterviewAnswerInput {
  interviewId: string;
  userId: string;
  sequence: number;
  transcript: string;
  duration: number;
}

export interface SaveInterviewAnswerResult {
  interviewId: string;
  sequence: number;
  answers: StoredAnswer[];
}

function normalizeAnswers(raw: unknown): StoredAnswer[] {
  if (!raw || typeof raw !== "object" || !("answers" in raw)) {
    return [];
  }

  const answers = (raw as StoredAnswersBlob).answers;
  if (!Array.isArray(answers)) {
    return [];
  }

  return answers
    .filter((answer): answer is StoredAnswer => Boolean(answer) && typeof answer.sequence === "number")
    .map((answer) => ({
      sequence: answer.sequence,
      transcript: String(answer.transcript ?? ""),
      duration: Number(answer.duration ?? 0),
    }))
    .sort((left, right) => left.sequence - right.sequence);
}

function upsertAnswerEntry(
  answers: StoredAnswer[],
  nextAnswer: StoredAnswer
): StoredAnswer[] {
  const index = answers.findIndex(
    (answer) => answer.sequence === nextAnswer.sequence
  );

  if (index >= 0) {
    answers[index] = nextAnswer;
  } else {
    answers.push(nextAnswer);
  }

  return answers.sort((left, right) => left.sequence - right.sequence);
}

export async function saveInterviewAnswer(
  input: SaveInterviewAnswerInput
): Promise<SaveInterviewAnswerResult> {
  const sequence = input.sequence;

  const interview = await prisma.interview.findFirst({
    where: { id: input.interviewId, userId: input.userId },
    select: { id: true, status: true, startedAt: true },
  });

  if (!interview) {
    throw new Error("INTERVIEW_NOT_FOUND");
  }

  const existingAnswer = await prisma.answer.findUnique({
    where: { interviewId: input.interviewId },
    select: { id: true, answers: true },
  });

  const answers = normalizeAnswers(existingAnswer?.answers);
  const nextAnswers = upsertAnswerEntry(answers, {
    sequence,
    transcript: input.transcript,
    duration: input.duration,
  });

  await prisma.$transaction([
    prisma.answer.upsert({
      where: { interviewId: input.interviewId },
      create: {
        interviewId: input.interviewId,
        userId: input.userId,
        answers: { answers: nextAnswers },
      },
      update: {
        userId: input.userId,
        answers: { answers: nextAnswers },
      },
    }),
    prisma.interview.update({
      where: { id: input.interviewId },
      data: {
        status: interview.status === InterviewStatus.COMPLETED
          ? InterviewStatus.COMPLETED
          : InterviewStatus.ONGOING,
        startedAt: interview.startedAt ?? new Date(),
      },
    }),
  ]);

  return {
    interviewId: input.interviewId,
    sequence,
    answers: nextAnswers,
  };
}

export async function getInterviewAnswers(interviewId: string, userId: string) {
  return prisma.answer.findFirst({
    where: { interviewId, userId },
    select: { answers: true },
  });
}
