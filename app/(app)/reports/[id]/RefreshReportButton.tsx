"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { RotateCw } from "lucide-react";

import { Button } from "@/components/ui/button";

/** Re-runs the server component so a newly finished report appears. */
export default function RefreshReportButton() {
  const router = useRouter();
  const [checking, startTransition] = useTransition();

  return (
    <Button variant="primary" loading={checking} onClick={() => startTransition(() => router.refresh())}>
      {!checking && <RotateCw aria-hidden strokeWidth={1.75} />}
      {checking ? "Checking" : "Check again"}
    </Button>
  );
}
