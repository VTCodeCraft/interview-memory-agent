import "server-only";

import { prisma } from "@/lib/db/prisma";
import { InterviewStatus } from "@prisma/client";
import type { Evaluation, Report } from "@/types";

export interface PendingReportInterview {
  interviewId: string;
  role: string;
  company: string | null;
  customCompanyName: string | null;
  status: string;
  createdAt: string;
}

/**
 * Latest interview that has answers but no report yet because evaluation failed
 * (status FAILED — e.g. deferred under high demand). Used to offer a "Generate
 * latest report" button. Returns null when nothing is pending. ONGOING is
 * excluded so an in-progress interview never shows the banner.
 */
export async function getPendingReportInterview(
  userId: string,
): Promise<PendingReportInterview | null> {
  const job = await prisma.reportGenerationJob.findFirst({
    where: {
      userId,
      status: { in: ["PENDING", "PROCESSING"] },
    },
    orderBy: { createdAt: "desc" },
    include: {
      interview: {
        select: {
          id: true,
          role: true,
          company: true,
          customCompanyName: true,
          status: true,
          createdAt: true,
        }
      }
    }
  });

  if (!job) return null;
  const interview = job.interview;

  return {
    interviewId: interview.id,
    role: interview.role,
    company: interview.company,
    customCompanyName: interview.customCompanyName,
    status: interview.status,
    createdAt: interview.createdAt.toISOString(),
  };
}

/** Persist evaluation data to the Report table via Prisma and return a Report object. */
export async function saveReport(
  userId: string,
  interviewId: string,
  evaluation: Omit<Evaluation, "id" | "interviewId" | "createdAt">
): Promise<Report> {
  const report = await prisma.report.upsert({
    where: { interviewId },
    create: {
      interviewId,
      overallScore: evaluation.overallScore,
      technicalScore: evaluation.technicalScore,
      communicationScore: evaluation.communicationScore,
      confidenceScore: evaluation.confidenceScore,
      behavioralScore: evaluation.behavioralScore,
      problemSolvingScore: evaluation.problemSolvingScore,
      strengths: evaluation.strengths,
      weaknesses: evaluation.weaknesses,
      missingTopics: evaluation.missingTopics,
      recommendations: evaluation.recommendations,
    },
    update: {
      overallScore: evaluation.overallScore,
      technicalScore: evaluation.technicalScore,
      communicationScore: evaluation.communicationScore,
      confidenceScore: evaluation.confidenceScore,
      behavioralScore: evaluation.behavioralScore,
      problemSolvingScore: evaluation.problemSolvingScore,
      strengths: evaluation.strengths,
      weaknesses: evaluation.weaknesses,
      missingTopics: evaluation.missingTopics,
      recommendations: evaluation.recommendations,
    },
  });

  return {
    id: report.id,
    interviewId: report.interviewId,
    userId,
    evaluation: {
      id: report.id,
      interviewId: report.interviewId,
      overallScore: report.overallScore,
      technicalScore: report.technicalScore,
      communicationScore: report.communicationScore,
      confidenceScore: report.confidenceScore,
      behavioralScore: report.behavioralScore,
      problemSolvingScore: report.problemSolvingScore,
      strengths: report.strengths,
      weaknesses: report.weaknesses,
      missingTopics: report.missingTopics,
      recommendations: report.recommendations,
      questionFeedback: evaluation.questionFeedback,
      createdAt: report.createdAt.toISOString(),
    },
    createdAt: report.createdAt.toISOString(),
  };
}

function prismaReportToReport(report: any, userId: string): Report {
  const interview = report.interview;
  return {
    id: report.id,
    interviewId: report.interviewId,
    userId,
    interviewContext: interview
      ? {
          role: interview.role,
          company: interview.company,
          companyType: interview.companyType,
          customCompanyName: interview.customCompanyName,
          interviewType: interview.interviewType,
          difficulty: interview.difficulty,
          startedAt: interview.startedAt ? interview.startedAt.toISOString() : null,
          endedAt: interview.endedAt ? interview.endedAt.toISOString() : null,
        }
      : undefined,
    evaluation: {
      id: report.id,
      interviewId: report.interviewId,
      overallScore: report.overallScore,
      technicalScore: report.technicalScore,
      communicationScore: report.communicationScore,
      confidenceScore: report.confidenceScore,
      behavioralScore: report.behavioralScore,
      problemSolvingScore: report.problemSolvingScore,
      strengths: report.strengths,
      weaknesses: report.weaknesses,
      missingTopics: report.missingTopics,
      recommendations: report.recommendations,
      questionFeedback: [],
      createdAt: report.createdAt.toISOString(),
    },
    createdAt: report.createdAt.toISOString(),
  };
}

const INTERVIEW_SELECT = {
  userId: true,
  role: true,
  company: true,
  companyType: true,
  customCompanyName: true,
  interviewType: true,
  difficulty: true,
  startedAt: true,
  endedAt: true,
} as const;

export async function listReports(userId: string): Promise<Report[]> {
  const reports = await prisma.report.findMany({
    where: { interview: { userId } },
    include: { interview: { select: INTERVIEW_SELECT } },
    orderBy: { createdAt: "desc" },
  });
  return reports.map((r) => prismaReportToReport(r, r.interview.userId));
}

export async function getReport(reportId: string): Promise<Report | null> {
  const report = await prisma.report.findUnique({
    where: { id: reportId },
    include: { interview: { select: INTERVIEW_SELECT } },
  });
  if (!report) return null;
  return prismaReportToReport(report, report.interview.userId);
}

export interface ReportInterviewSummary {
  interviewId: string;
  role: string;
  company: string | null;
  status: InterviewStatus;
  createdAt: string;
}

/**
 * What /reports/[id] should show for one of the user's interviews. Reports are
 * generated asynchronously (POST /api/interview/end queues a job that
 * /api/cron/process-reports runs), so "no report yet" has several meanings.
 */
export type InterviewReportView =
  | { state: "ready"; report: Report }
  | { state: "processing"; interview: ReportInterviewSummary }
  | { state: "failed"; interview: ReportInterviewSummary }
  | { state: "in_progress"; interview: ReportInterviewSummary }
  | { state: "unavailable"; interview: ReportInterviewSummary };

const ACTIVE_STATUSES: InterviewStatus[] = [
  InterviewStatus.PENDING,
  InterviewStatus.GENERATING,
  InterviewStatus.READY,
  InterviewStatus.ONGOING,
];

/** Report state for an interview owned by `userId`; null if not found / not owned. */
export async function getInterviewReportView(
  userId: string,
  interviewId: string,
): Promise<InterviewReportView | null> {
  const interview = await prisma.interview.findFirst({
    where: { id: interviewId, userId },
    select: {
      id: true,
      status: true,
      role: true,
      company: true,
      customCompanyName: true,
      createdAt: true,
      report: { include: { interview: { select: INTERVIEW_SELECT } } },
      reportGenerationJob: { select: { status: true } },
    },
  });

  if (!interview) return null;

  if (interview.report) {
    return { state: "ready", report: prismaReportToReport(interview.report, userId) };
  }

  const summary: ReportInterviewSummary = {
    interviewId: interview.id,
    role: interview.role,
    company: interview.customCompanyName || interview.company || null,
    status: interview.status,
    createdAt: interview.createdAt.toISOString(),
  };

  const jobStatus = interview.reportGenerationJob?.status;
  if (jobStatus === "PENDING" || jobStatus === "PROCESSING") {
    return { state: "processing", interview: summary };
  }
  if (jobStatus === "FAILED") {
    return { state: "failed", interview: summary };
  }
  if (ACTIVE_STATUSES.includes(interview.status)) {
    return { state: "in_progress", interview: summary };
  }
  return { state: "unavailable", interview: summary };
}