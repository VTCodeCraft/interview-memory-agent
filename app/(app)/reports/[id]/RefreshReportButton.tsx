"use client";

import { useRouter } from "next/navigation";

/** Re-runs the server component so a newly finished report appears. */
export default function RefreshReportButton() {
  const router = useRouter();
  return (
    <button
      onClick={() => router.refresh()}
      className="px-6 py-2.5 rounded-xl bg-primary text-white text-xs font-bold shadow-md hover:bg-[#4338CA] transition-all active:scale-95 cursor-pointer"
    >
      Check again
    </button>
  );
}
