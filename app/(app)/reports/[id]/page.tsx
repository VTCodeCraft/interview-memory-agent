import { notFound } from "next/navigation";

import { requireOnboardedUser } from "@/lib/auth/app-user";
import { getInterviewReportView } from "@/services/report.service";
import { PendingReport, ReadyReport, ReportFrame } from "./_components/ReportSections";

/**
 * /reports/[id] — `id` is the Interview id (a report only exists once the
 * background job finishes, so the interview id is the stable identifier).
 * Shows the finished report, or what is happening instead: still being
 * generated, failed, interview not finished, or no report.
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
    <ReportFrame>
      {view.state === "ready" ? <ReadyReport report={view.report} /> : <PendingReport view={view} />}
    </ReportFrame>
  );
}
