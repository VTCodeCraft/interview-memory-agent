import Link from "next/link";
import { FileX } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { ROUTES } from "@/lib/utils/constants";
import { ReportFrame, StatePanel } from "./_components/ReportSections";

/** notFound() from the page: an unknown id, or an interview that isn't this user's. */
export default function ReportNotFound() {
  return (
    <ReportFrame>
      <StatePanel
        icon={<FileX strokeWidth={1.75} className="size-6" />}
        tone="neutral"
        heading="Report not found"
        body="This report doesn't exist, or it isn't available to your account."
        actions={
          <Link href={ROUTES.reports} className={buttonVariants({ variant: "primary" })}>
            View all reports
          </Link>
        }
      />
    </ReportFrame>
  );
}
