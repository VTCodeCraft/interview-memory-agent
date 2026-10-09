import Link from "next/link";
import type { Report } from "@/types";

interface ReportDetailCardProps {
  report: Report;
  /** Link to this report's own page (shown in the reports list). */
  href?: string;
}

/**
 * Full report card. Markup moved unchanged from the reports list so the list
 * (/reports) and the detail page (/reports/[id]) render reports identically.
 * No hooks — usable from both server and client components.
 */
export default function ReportDetailCard({ report, href }: ReportDetailCardProps) {
  const { evaluation, createdAt, interviewContext: interview } = report;
  const dateString = new Date(createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
  const companyLabel = interview?.customCompanyName || interview?.company || null;
  const durationLabel = interview?.startedAt && interview?.endedAt
    ? `${Math.max(1, Math.round((new Date(interview.endedAt).getTime() - new Date(interview.startedAt).getTime()) / 60000))} min`
    : null;

  return (
    <div
      className="bg-white border border-outline-variant/30 rounded-[24px] shadow-sm hover:shadow-md transition-shadow p-6 md:p-8 space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-outline-variant/10">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="text-[10px] font-bold text-primary bg-primary/5 px-2.5 py-1 rounded tracking-wider uppercase">
              AI Assessment
            </span>
            {interview?.difficulty && (
              <span className="text-[10px] font-bold text-on-surface-variant bg-surface-container/60 px-2.5 py-1 rounded tracking-wider uppercase">
                {interview.difficulty}
              </span>
            )}
            {interview?.interviewType && (
              <span className="text-[10px] font-bold text-on-surface-variant bg-surface-container/60 px-2.5 py-1 rounded tracking-wider uppercase">
                {interview.interviewType}
              </span>
            )}
          </div>
          <h3 className="text-base font-extrabold text-on-surface">
            {interview?.role ?? "Mock Interview"}
            {companyLabel && <span className="font-semibold text-on-surface-variant"> · {companyLabel}</span>}
          </h3>
          <p className="text-xs text-on-surface-variant mt-1 font-medium">
            {dateString}{durationLabel && ` · ${durationLabel}`}
          </p>
          {href && (
            <Link
              href={href}
              className="inline-flex items-center gap-1 mt-2 text-xs font-bold text-primary hover:underline"
            >
              View report
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </Link>
          )}
        </div>
        <div className="flex items-center gap-4">
          {/* Score Circle Gauge */}
          <div className="relative h-20 w-20 flex items-center justify-center">
            <svg className="h-full w-full transform -rotate-90">
              <circle className="text-surface-container" cx="40" cy="40" fill="transparent" r="34" stroke="currentColor" strokeWidth="6"></circle>
              <circle
                className="text-primary"
                cx="40"
                cy="40"
                fill="transparent"
                r="34"
                stroke="currentColor"
                strokeDasharray="213.6"
                strokeDashoffset={213.6 - (213.6 * evaluation.overallScore) / 100}
                strokeWidth="6"
              ></circle>
            </svg>
            <span className="absolute text-sm font-extrabold">{evaluation.overallScore}%</span>
          </div>
        </div>
      </div>

      {/* Score Breakdown */}
      <div className="space-y-2">
        <h4 className="text-sm font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5">
          <span className="material-symbols-outlined text-sm">bar_chart</span> Score Breakdown
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { label: "Technical", value: evaluation.technicalScore },
            { label: "Communication", value: evaluation.communicationScore },
            { label: "Confidence", value: evaluation.confidenceScore },
            { label: "Behavioral", value: evaluation.behavioralScore },
            { label: "Problem Solving", value: evaluation.problemSolvingScore },
          ].map((item) => (
            <div key={item.label} className="bg-surface-container/30 p-3 rounded-xl space-y-1">
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-on-surface-variant">{item.label}</span>
                <span className="text-primary font-extrabold">{item.value}%</span>
              </div>
              <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
                <div className="h-full bg-primary transition-all" style={{ width: `${item.value}%` }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Question Feedback */}
      {evaluation.questionFeedback && evaluation.questionFeedback.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-sm font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5">
            <span className="material-symbols-outlined text-sm">rule</span> Per-Question Feedback
          </h4>
          <div className="flex flex-col gap-3">
            {evaluation.questionFeedback.map((qf, idx) => (
              <div key={idx} className="bg-surface-container/30 p-4 rounded-xl space-y-2">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className="text-on-surface font-bold">Q{qf.sequence}: {qf.question}</span>
                  <span className="text-primary font-extrabold">{qf.score} / 10</span>
                </div>
                <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: `${qf.score * 10}%` }}></div>
                </div>
                {qf.feedback && <p className="text-[11px] text-on-surface-variant leading-relaxed">{qf.feedback}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Strengths & Weaknesses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-success-green/5 p-5 rounded-2xl border border-success-green/10">
          <p className="text-[10px] font-bold text-success-green mb-3 flex items-center gap-1 tracking-wider uppercase">
            <span className="material-symbols-outlined text-sm fill-current">check_circle</span> Key Strengths
          </p>
          <ul className="space-y-2 text-xs">
            {evaluation.strengths.map((str, idx) => (
              <li key={idx} className="flex items-start gap-2 leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-success-green shrink-0 mt-1.5"></span>
                <span>{str}</span>
              </li>
            ))}
            {evaluation.strengths.length === 0 && (
              <p className="text-on-surface-variant italic">No specific strengths annotated.</p>
            )}
          </ul>
        </div>

        <div className="bg-error/5 p-5 rounded-2xl border border-error/10">
          <p className="text-[10px] font-bold text-error-red mb-3 flex items-center gap-1 tracking-wider uppercase">
            <span className="material-symbols-outlined text-sm">warning</span> Action Items / Weaknesses
          </p>
          <ul className="space-y-2 text-xs">
            {evaluation.weaknesses.map((weak, idx) => (
              <li key={idx} className="flex items-start gap-2 leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-error-red shrink-0 mt-1.5"></span>
                <span>{weak}</span>
              </li>
            ))}
            {evaluation.weaknesses.length === 0 && (
              <p className="text-on-surface-variant italic">No actions points needed.</p>
            )}
          </ul>
        </div>
      </div>

      {/* Missing Topics & Recommendations */}
      {(evaluation.missingTopics.length > 0 || evaluation.recommendations.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {evaluation.missingTopics.length > 0 && (
            <div className="bg-surface-container/30 p-5 rounded-2xl border border-outline-variant/20">
              <p className="text-[10px] font-bold text-on-surface-variant mb-3 flex items-center gap-1 tracking-wider uppercase">
                <span className="material-symbols-outlined text-sm">quiz</span> Topics to Review
              </p>
              <div className="flex flex-wrap gap-2">
                {evaluation.missingTopics.map((topic, idx) => (
                  <span key={idx} className="text-[11px] font-semibold bg-white border border-outline-variant/30 px-3 py-1 rounded-full">
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          )}

          {evaluation.recommendations.length > 0 && (
            <div className="bg-primary/5 p-5 rounded-2xl border border-primary/10">
              <p className="text-[10px] font-bold text-primary mb-3 flex items-center gap-1 tracking-wider uppercase">
                <span className="material-symbols-outlined text-sm">lightbulb</span> Recommendations
              </p>
              <ul className="space-y-2 text-xs">
                {evaluation.recommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-2 leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1.5"></span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Historical Progress (only present once prior interview history exists) */}
      {evaluation.historicalProgress && (
        <div className="bg-secondary-fixed/30 p-5 rounded-2xl border border-outline-variant/20 space-y-3">
          <p className="text-[10px] font-bold text-on-surface-variant mb-1 flex items-center gap-1 tracking-wider uppercase">
            <span className="material-symbols-outlined text-sm">trending_up</span> Progress vs. Past Sessions
          </p>
          <p className="text-xs leading-relaxed">{evaluation.historicalProgress.overallTrend}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
            {evaluation.historicalProgress.improvedAreas.length > 0 && (
              <div>
                <span className="font-bold text-success-green">Improved: </span>
                {evaluation.historicalProgress.improvedAreas.join(", ")}
              </div>
            )}
            {evaluation.historicalProgress.regressedAreas.length > 0 && (
              <div>
                <span className="font-bold text-error-red">Regressed: </span>
                {evaluation.historicalProgress.regressedAreas.join(", ")}
              </div>
            )}
            {evaluation.historicalProgress.stableStrengths.length > 0 && (
              <div>
                <span className="font-bold text-on-surface">Stable strengths: </span>
                {evaluation.historicalProgress.stableStrengths.join(", ")}
              </div>
            )}
            {evaluation.historicalProgress.stillNeedsImprovement.length > 0 && (
              <div>
                <span className="font-bold text-on-surface">Still needs work: </span>
                {evaluation.historicalProgress.stillNeedsImprovement.join(", ")}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
