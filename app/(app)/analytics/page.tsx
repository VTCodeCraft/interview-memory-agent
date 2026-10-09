import Link from "next/link";

import Sidebar from "@/components/common/Sidebar";
import { requireOnboardedUser } from "@/lib/auth/app-user";
import { ROUTES } from "@/lib/utils/constants";
import { listReports } from "@/services/report.service";
import { summarizeAnalytics } from "@/services/analytics.service";

/**
 * /analytics — route shell for the upcoming analytics page. Only shows the
 * totals the existing analytics service actually computes (the same data as
 * GET /api/analytics); no other metrics are implied.
 */
export default async function AnalyticsPage() {
  const user = await requireOnboardedUser();
  const summary = summarizeAnalytics(await listReports(user.id));

  return (
    <div className="min-h-screen bg-background text-on-surface font-body-md flex">
      <Sidebar />
      <main className="w-full lg:ml-64 lg:w-[calc(100%-16rem)] p-4 sm:p-gutter pt-20 lg:pt-6 min-h-screen flex-1">
        <div className="max-w-[1000px] mx-auto space-y-6 lg:space-y-lg pb-xxl">
          <header className="space-y-sm mb-8">
            <span className="inline-flex items-center gap-sm bg-primary-fixed text-primary font-bold text-[11px] uppercase tracking-wider px-4 py-1.5 rounded-full">
              <span className="material-symbols-outlined text-[14px]">monitoring</span>
              Analytics
            </span>
            <h1 className="text-2xl md:text-4xl font-extrabold text-on-surface">Your progress.</h1>
            <p className="text-sm text-on-surface-variant max-w-2xl leading-relaxed">
              Detailed analytics are not available yet. Score breakdowns and trends from your
              reports are currently shown on{" "}
              <Link href={ROUTES.interviews} className="text-primary font-semibold hover:underline">
                Interviews
              </Link>{" "}
              and{" "}
              <Link href={ROUTES.memory} className="text-primary font-semibold hover:underline">
                Memory
              </Link>
              .
            </p>
          </header>

          <section className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-white border border-outline-variant/30 shadow-sm">
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                Completed reports
              </p>
              <p className="text-3xl font-extrabold text-primary">{summary.interviewCount}</p>
            </div>
            <div className="p-6 rounded-2xl bg-white border border-outline-variant/30 shadow-sm">
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                Average overall score
              </p>
              <p className="text-3xl font-extrabold text-primary">
                {summary.interviewCount > 0 ? `${summary.averageScore}%` : "—"}
              </p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
