import { Suspense } from "react";
import Link from "next/link";

import AccountMenu from "@/components/common/AccountMenu";
import Logo from "@/components/landing-page/Logo";
import { APP_NAME, ROUTES } from "@/lib/utils/constants";
import { OnboardingAccountMenu } from "./_components/OnboardingAccountMenu";

// Completion check + redirect live in page.tsx, which can read `?next=`.
// Focused setup frame: logo and account menu (for signing out), no product
// navigation until setup is done.
export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="ds-page flex min-h-dvh flex-col">
      <header className="border-b border-line-subtle bg-canvas">
        <div className="ds-container flex h-nav items-center justify-between gap-6">
          <Logo priority />
          <div className="flex size-8 items-center justify-center">
            <Suspense fallback={<AccountMenu dashboardHref={ROUTES.onboarding} />}>
              <OnboardingAccountMenu />
            </Suspense>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-line-subtle">
        <div className="ds-container flex flex-col gap-3 py-6 text-small text-fg-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            &copy; <span className="font-data tabular-nums">{new Date().getFullYear()}</span> {APP_NAME}
          </p>
          <nav aria-label="Legal" className="flex gap-5">
            <Link href={ROUTES.privacy} className="rounded-[4px] hover:text-fg focus-ring">
              Privacy
            </Link>
            <Link href={ROUTES.terms} className="rounded-[4px] hover:text-fg focus-ring">
              Terms
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
