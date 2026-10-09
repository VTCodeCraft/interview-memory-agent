import Image from "next/image";
import Link from "next/link";

import { APP_NAME, ROUTES } from "@/lib/utils/constants";
import { cn } from "@/lib/utils";

/** Clutchly logo (unchanged artwork) with the wordmark in the display face. */
export default function Logo({ className, priority = false }: { className?: string; priority?: boolean }) {
  return (
    <Link
      href={ROUTES.home}
      aria-label={`${APP_NAME} home`}
      className={cn("inline-flex shrink-0 items-center gap-2 rounded-control focus-ring", className)}
    >
      <Image src="/logo.png" alt="" width={32} height={32} priority={priority} className="size-8 object-contain" />
      <span className="ds-display text-[1.125rem] font-semibold tracking-[-0.03em] text-fg">{APP_NAME}</span>
    </Link>
  );
}
