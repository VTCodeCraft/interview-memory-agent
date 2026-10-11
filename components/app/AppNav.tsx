"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";

import AccountMenu from "@/components/common/AccountMenu";
import Logo from "@/components/landing-page/Logo";
import { buttonVariants } from "@/components/ui/button";
import { ROUTES } from "@/lib/utils/constants";
import { cn } from "@/lib/utils";

/** Primary product areas. Profile & Settings lives in the account menu. */
const LINKS = [
  { label: "Interviews", href: ROUTES.interviews },
  { label: "Reports", href: ROUTES.reports },
  { label: "Memory", href: ROUTES.memory },
  { label: "Analytics", href: ROUTES.analytics },
] as const;

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

const linkClass = (active: boolean) =>
  cn(
    "inline-flex h-9 shrink-0 items-center rounded-control px-3 text-small font-medium transition-[color,background-color,box-shadow] duration-(--duration-fast) ease-standard focus-ring",
    active ? "bg-panel text-fg shadow-control ring-1 ring-line" : "text-fg-muted hover:bg-sunken hover:text-fg",
  );

/**
 * Signed-in product navigation (Precision): one top bar on the page
 * container, no sidebar. From md up the links sit in the bar; below md they
 * move to a horizontally scrollable tab row under it. Sticky from md up.
 * "New interview" opens interview setup (which resumes an unfinished
 * interview itself); it's hidden on the setup page.
 */
export default function AppNav({ pathname }: { pathname: string }) {
  const tabsRef = useRef<HTMLElement>(null);

  // Keep the current tab in view on narrow screens.
  useEffect(() => {
    const active = tabsRef.current?.querySelector<HTMLElement>('[aria-current="page"]');
    active?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [pathname]);

  return (
    <header className="z-(--z-nav) border-b border-line-subtle bg-canvas/90 font-brand text-fg backdrop-blur-xl backdrop-saturate-150 md:sticky md:top-0">
      <div className="ds-container flex h-14 items-center justify-between gap-6 md:h-nav">
        <div className="flex min-w-0 items-center gap-8">
          <Logo />
          <nav aria-label="Product" className="hidden md:block">
            <ul className="flex items-center gap-1">
              {LINKS.map((link) => {
                const active = isActive(pathname, link.href);
                return (
                  <li key={link.href}>
                    <Link href={link.href} aria-current={active ? "page" : undefined} className={linkClass(active)}>
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          {pathname !== ROUTES.newInterview && (
            <Link
              href={ROUTES.newInterview}
              aria-label="New interview"
              className={buttonVariants({ variant: "secondary", size: "sm" })}
            >
              <Plus aria-hidden strokeWidth={2} />
              <span aria-hidden>
                New<span className="hidden sm:inline"> interview</span>
              </span>
            </Link>
          )}
          <div className="flex size-8 items-center justify-center">
            <AccountMenu />
          </div>
        </div>
      </div>

      {/* Below md: scrollable tabs. Vertical padding leaves room for the
          focus ring, which the scroll container would otherwise clip. */}
      <nav ref={tabsRef} aria-label="Product" className="md:hidden">
        <ul className="ds-container scrollbar-hidden flex items-center gap-1 overflow-x-auto pt-1 pb-2.5">
          {LINKS.map((link) => {
            const active = isActive(pathname, link.href);
            return (
              <li key={link.href}>
                <Link href={link.href} aria-current={active ? "page" : undefined} className={linkClass(active)}>
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
