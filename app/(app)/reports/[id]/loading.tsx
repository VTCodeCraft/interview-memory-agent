import { Skeleton } from "@/components/ui/feedback";
import { ReportFrame } from "./_components/ReportSections";

/** Shown while the report loads, in the shape of a finished report. */
export default function ReportLoading() {
  return (
    <ReportFrame>
      <div role="status" aria-live="polite" className="mt-6 flex flex-col gap-8 lg:mt-8">
        <span className="sr-only">Loading report</span>
        <div className="flex flex-col gap-3">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-8 w-80 max-w-full" />
          <Skeleton className="h-5 w-64 max-w-full" />
        </div>
        <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
          <div className="ds-surface flex flex-col gap-3 rounded-card p-5 sm:p-6 lg:col-span-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-12 w-28" />
            <Skeleton className="h-1.5 w-full" />
            <div className="mt-4 flex flex-col gap-3">
              {[0, 1, 2, 3, 4].map((key) => (
                <Skeleton key={key} className="h-4 w-full" />
              ))}
            </div>
          </div>
          <div className="ds-surface flex flex-col gap-4 rounded-card p-5 sm:p-6 lg:col-span-8">
            <Skeleton className="h-5 w-24" />
            {[0, 1, 2].map((key) => (
              <div key={key} className="flex flex-col gap-2.5 pt-2">
                <Skeleton className="h-5 w-36" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </ReportFrame>
  );
}
