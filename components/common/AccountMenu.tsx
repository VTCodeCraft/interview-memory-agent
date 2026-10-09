"use client";

import { UserButton } from "@clerk/nextjs";
import { ROUTES } from "@/lib/utils/constants";

function MenuIcon({ name }: { name: string }) {
  return (
    <span className="material-symbols-outlined !text-[16px]" aria-hidden>
      {name}
    </span>
  );
}

/**
 * Signed-in account/avatar menu used across public and product pages.
 * Profile & Settings lives here rather than in primary navigation. Sign-out
 * returns to the landing page (ClerkProvider `afterSignOutUrl`).
 */
export default function AccountMenu() {
  return (
    <UserButton
      appearance={{ elements: { userButtonPopoverCard: { zIndex: 200 } } }}
    >
      <UserButton.MenuItems>
        <UserButton.Link
          label="My Dashboard"
          labelIcon={<MenuIcon name="dashboard" />}
          href={ROUTES.interviews}
        />
        <UserButton.Link
          label="Profile & Settings"
          labelIcon={<MenuIcon name="settings" />}
          href={ROUTES.profile}
        />
        <UserButton.Action label="manageAccount" />
        <UserButton.Action label="signOut" />
      </UserButton.MenuItems>
    </UserButton>
  );
}
