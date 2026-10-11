"use client";

import { UserButton } from "@clerk/nextjs";
import { LayoutGrid, Settings, type LucideIcon } from "lucide-react";
import { ROUTES } from "@/lib/utils/constants";

function MenuIcon({ icon: Icon }: { icon: LucideIcon }) {
  return <Icon aria-hidden strokeWidth={1.75} className="size-4" />;
}

/**
 * Signed-in account/avatar menu used across public and product pages.
 * Profile & Settings lives here rather than in primary navigation. Sign-out
 * returns to the landing page (ClerkProvider `afterSignOutUrl`).
 *
 * `dashboardHref`: where "My Dashboard" goes. Defaults to /interviews; pages
 * that know onboarding is incomplete pass the onboarding URL instead (see
 * lib/routing/dashboard-link.ts), so the item never bounces off the guard.
 */
export default function AccountMenu({ dashboardHref = ROUTES.interviews }: { dashboardHref?: string }) {
  return (
    <UserButton
      appearance={{ elements: { userButtonPopoverCard: { zIndex: 200 } } }}
    >
      <UserButton.MenuItems>
        <UserButton.Link
          label="My Dashboard"
          labelIcon={<MenuIcon icon={LayoutGrid} />}
          href={dashboardHref}
        />
        <UserButton.Link
          label="Profile & Settings"
          labelIcon={<MenuIcon icon={Settings} />}
          href={ROUTES.profile}
        />
        <UserButton.Action label="manageAccount" />
        <UserButton.Action label="signOut" />
      </UserButton.MenuItems>
    </UserButton>
  );
}
