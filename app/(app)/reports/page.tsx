"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/common/Sidebar";
import ReportDetailCard from "@/components/reports/ReportDetailCard";
import { API, ROUTES, routeTo } from "@/lib/utils/constants";
import type { Report } from "@/types";

export default function ReportsPage() {
  return (
    <Suspense fallback={null}>
      <ReportsPageInner />
    </Suspense>
  );
}

type PendingReport = {
  interviewId: string;
  role: string;
  company: string | null;
  customCompanyName: string | null;
  status: string;
  createdAt: string;
};

function ReportsPageInner() {
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState<PendingReport | null>(null);

  async function loadReports() {
    try {
      const r = await fetch(API.reports, { cache: "no-store" });
      const j = await r.json();
      setReports(j.data ?? []);
    } catch (e) {
      console.error("Failed to load reports", e);
    }
  }

  async function loadPending() {
    try {
      const r = await fetch(API.pendingReport, { cache: "no-store" });
      const j = await r.json();
      setPending((j.data as PendingReport | null) ?? null);
    } catch (e) {
      console.error("Failed to load pending report", e);
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function run() {
      await Promise.all([loadReports(), loadPending()]);
      if (!cancelled) setLoading(false);
    }

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-background text-on-surface font-body-md flex">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="w-full lg:ml-64 lg:w-[calc(100%-16rem)] p-4 sm:p-gutter pt-20 lg:pt-6 min-h-screen flex-1">
        <div className="max-w-[1000px] mx-auto space-y-6 lg:space-y-lg pb-xxl">
          
          {/* Header Section */}
          <header className="space-y-sm mb-8">
            <span className="inline-flex items-center gap-sm bg-primary-fixed text-primary font-bold text-[11px] uppercase tracking-wider px-4 py-1.5 rounded-full">
              <span className="material-symbols-outlined text-[14px]">analytics</span>
              Feedback Reports
            </span>
            <h2 className="text-2xl md:text-4xl font-extrabold text-on-surface">Your performance reports.</h2>
            <p className="text-sm text-on-surface-variant max-w-2xl leading-relaxed">
              Review detailed evaluations, criterion breakdowns, and AI-compiled tips from your mock interview sessions.
            </p>
          </header>

          {/* Pending report banner */}
          {pending && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-primary/5 border border-primary/20 rounded-2xl">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-primary text-2xl shrink-0">schedule</span>
                <div>
                  <h3 className="text-sm font-bold text-on-surface">Your report is being generated</h3>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    {(pending.customCompanyName || pending.company)
                      ? `${pending.role} · ${pending.customCompanyName || pending.company}`
                      : pending.role}
                    {" — evaluation is queued due to high demand. We will generate it automatically in the background."}
                  </p>
                </div>
              </div>
              <Link
                href={routeTo.report(pending.interviewId)}
                className="shrink-0 text-xs font-bold text-primary hover:underline"
              >
                View status
              </Link>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center p-12 text-sm text-on-surface-variant gap-2">
              <span className="material-symbols-outlined animate-spin">progress_activity</span>
              Loading feedback reports...
            </div>
          ) : reports.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 bg-white border border-outline-variant/30 rounded-xxl shadow-xl text-center max-w-2xl mx-auto min-h-[300px]">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-primary text-3xl">rate_review</span>
              </div>
              <h3 className="text-xl font-bold mb-2">No Reports Yet</h3>
              <p className="text-sm text-on-surface-variant mb-6">
                Complete your first practice session to receive a structured evaluation on communication, technical accuracy, and domain expertise.
              </p>
              <button
                onClick={() => router.push(ROUTES.newInterview)}
                className="bg-primary text-white px-8 py-3 rounded-xl text-xs font-bold shadow-lg hover:bg-[#4338CA] transition-all active:scale-95 cursor-pointer flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">mic</span>
                Start First Mock Session
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              {reports.map((report) => (
                <ReportDetailCard
                  key={report.id}
                  report={report}
                  href={routeTo.report(report.interviewId)}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
