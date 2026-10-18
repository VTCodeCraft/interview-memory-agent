"use client"; // Error boundaries must be Client Components.

import { useEffect } from "react";
import Link from "next/link";
import { CircleAlert, RotateCw } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { ROUTES } from "@/lib/utils/constants";
import { ReportFrame, StatePanel } from "./_components/ReportSections";

/**
 * Unexpected failure while loading the report (for example the database being
 * unreachable). In production the message is a generic digest, so it isn't
 * shown; unstable_retry() re-fetches and re-renders the page.
 */
export default function ReportError({ error, unstable_retry }: { error: Error & { digest?: string }; unstable_retry: () => void }) {
  useEffect(() => {
    console.error("[Report] load failed", error);
  }, [error]);

  return (
    <ReportFrame>
      <StatePanel
        icon={<CircleAlert strokeWidth={1.75} className="size-6" />}
        tone="danger"
        role="alert"
        heading="This report didn't load"
        body="Something went wrong while loading it. Try again, or go back to your reports."
        actions={
          <>
            <Link href={ROUTES.reports} className={buttonVariants({ variant: "secondary" })}>
              View all reports
            </Link>
            <Button variant="primary" onClick={() => unstable_retry()}>
              <RotateCw aria-hidden strokeWidth={1.75} />
              Try again
            </Button>
          </>
        }
      />
    </ReportFrame>
  );
}
