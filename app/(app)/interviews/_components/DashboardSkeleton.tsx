import { Skeleton } from "@/components/ui/feedback";
import { Panel } from "./DashboardSections";

/** Placeholder in the shape of the loaded dashboard, so nothing jumps when data arrives. */
export function DashboardSkeleton() {
  return (
    <div role="status" aria-live="polite" className="flex flex-col gap-8">
      <span className="sr-only">Loading your dashboard</span>
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-3">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-8 w-72 max-w-full" />
          <Skeleton className="h-5 w-56 max-w-full" />
        </div>
        <Skeleton className="h-12 w-full rounded-button sm:w-44" />
      </div>
      <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
        <div className="flex flex-col gap-6 lg:col-span-8">
          <Panel className="grid gap-4 p-5 sm:grid-cols-3 sm:p-6">
            {[0, 1, 2].map((key) => (
              <div key={key} className="flex flex-col gap-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-7 w-16" />
              </div>
            ))}
          </Panel>
          <Panel>
            <div className="border-b border-line-subtle px-5 py-4 sm:px-6">
              <Skeleton className="h-5 w-40" />
            </div>
            {[0, 1, 2, 3].map((key) => (
              <div key={key} className="flex items-center gap-4 border-b border-line-subtle px-5 py-4 last:border-b-0 sm:px-6">
                <div className="flex flex-1 flex-col gap-2">
                  <Skeleton className="h-4 w-48 max-w-full" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-5 w-14" />
              </div>
            ))}
          </Panel>
        </div>
        <div className="flex flex-col gap-6 lg:col-span-4">
          <Panel className="flex flex-col gap-3 p-5 sm:p-6">
            <Skeleton className="h-5 w-36" />
            {[0, 1, 2, 3, 4].map((key) => (
              <Skeleton key={key} className="h-4 w-full" />
            ))}
          </Panel>
        </div>
      </div>
    </div>
  );
}
