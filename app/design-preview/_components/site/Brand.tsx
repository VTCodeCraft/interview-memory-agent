import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Current Clutchly logo (unchanged) with the wordmark set in the direction's
 * display face. The logo artwork itself is not part of this exploration.
 */
export function Brand({ href = "#top", className }: { href?: string; className?: string }) {
  return (
    <a
      href={href}
      aria-label="Clutchly home"
      className={cn("inline-flex shrink-0 items-center gap-2 rounded-control focus-ring", className)}
    >
      <Image src="/logo.png" alt="" width={32} height={32} className="size-8 object-contain" />
      <span className="ds-display text-[1.125rem] font-semibold tracking-[-0.03em] text-fg">Clutchly</span>
    </a>
  );
}

/** Initials avatar used in the signed-in product frame. */
export function Avatar({ initials, className }: { initials: string; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex size-8 items-center justify-center rounded-full bg-brand-tint text-label font-semibold text-brand-ink",
        className,
      )}
    >
      {initials}
    </span>
  );
}
