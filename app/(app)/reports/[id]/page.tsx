import Link from "next/link";
import { notFound } from "next/navigation";

import Sidebar from "@/components/common/Sidebar";
import ReportDetailCard from "@/components/reports/ReportDetailCard";
import { requireOnboardedUser } from "@/lib/auth/app-user";
import { ROUTES, routeTo } from "@/lib/utils/constants";
import {
  getInterviewReportView,
  type InterviewReportView,
} from "@/services/report.service";
import RefreshReportButton from "./RefreshReportButton";

/**
 * /reports/[id] — `id` is the Interview id (a report only exists once the
 * background job finishes, so the interview id is the stable identifier).
 */
export default async function ReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireOnboardedUser();

  const view = await getInterviewReportView(user.id, id);
  // Unknown ids and other users' interviews are indistinguishable.
  if (!view) notFound();

  return (
    <div className="min-h-screen bg-background text-on-surface font-body-md flex">
      <Sidebar />
      <main className="w-full lg:ml-64 lg:w-[calc(100%-16rem)] p-4 sm:p-gutter pt-20 lg:pt-6 min-h-screen flex-1">
        <div className="max-w-[1000px] mx-auto space-y-6 lg:space-y-lg pb-xxl">
          <Link
            href={ROUTES.reports}
            className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
          >
            <span className="material-symbols-outlined text-[14px]">arrow_back</span>
            All reports
          </Link>

          {view.state === "ready" ? (
            <ReportDetailCard report={view.report} />
          ) : (
            <ReportStateCard view={view} />
          )}
        </div>
      </main>
    </div>
  );
}

function ReportStateCard({
  view,
}: {
  view: Exclude<InterviewReportView, { state: "ready" }>;
}) {
  const { interview } = view;
  const title = interview.company ? `${interview.role} · ${interview.company}` : interview.role;

  const content = {
    processing: {
      icon: "schedule",
      heading: "Your report is being generated",
      body: "Evaluation runs in the background after the interview ends. This page does not update on its own — check again in a few minutes.",
    },
    failed: {
      icon: "error",
      heading: "This report could not be generated",
      body: "Report generation failed after several attempts, so no report is available for this interview.",
    },
    in_progress: {
      icon: "pending",
      heading: "This interview hasn't finished",
      body: "A report is generated after the interview ends. You can resume the interview where you left off.",
    },
    unavailable: {
      icon: "block",
      heading: "No report for this interview",
      body:
        interview.status === "CANCELLED"
          ? "This interview was cancelled, so no report was generated."
          : "No report was generated for this interview.",
    },
  }[view.state];

  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 bg-white border border-outline-variant/30 rounded-xxl shadow-xl text-center min-h-[300px]">
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
        <span className="material-symbols-outlined text-primary text-3xl">{content.icon}</span>
      </div>
      <p className="text-xs font-semibold text-on-surface-variant mb-1">{title}</p>
      <h1 className="text-xl font-bold mb-2">{content.heading}</h1>
      <p className="text-sm text-on-surface-variant max-w-md">{content.body}</p>
      <div className="flex flex-wrap justify-center gap-3 mt-6">
        {view.state === "processing" && <RefreshReportButton />}
        {view.state === "in_progress" && (
          <Link
            href={routeTo.liveInterview(interview.interviewId)}
            className="px-6 py-2.5 rounded-xl bg-primary text-white text-xs font-bold shadow-md hover:bg-[#4338CA] transition-all active:scale-95"
          >
            Resume Interview
          </Link>
        )}
        {(view.state === "failed" || view.state === "unavailable") && (
          <Link
            href={ROUTES.newInterview}
            className="px-6 py-2.5 rounded-xl bg-primary text-white text-xs font-bold shadow-md hover:bg-[#4338CA] transition-all active:scale-95"
          >
            Start a New Interview
          </Link>
        )}
        <Link
          href={ROUTES.interviews}
          className="px-6 py-2.5 rounded-xl border border-outline-variant/30 text-xs font-bold text-on-surface hover:bg-surface-container transition-colors"
        >
          Back to Interviews
        </Link>
      </div>
    </div>
  );
}
