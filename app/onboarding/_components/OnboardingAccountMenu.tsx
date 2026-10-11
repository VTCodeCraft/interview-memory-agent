"use client";

import { useSearchParams } from "next/navigation";

import AccountMenu from "@/components/common/AccountMenu";
import { dashboardHref } from "@/lib/routing/dashboard-link";

/**
 * Account menu on the setup screen. Only users who haven't finished setup see
 * this page (page.tsx redirects everyone else), so "My Dashboard" stays on
 * onboarding and keeps the current, sanitised `next`, instead of bouncing off
 * the dashboard guard and replacing `next` with /interviews.
 */
export function OnboardingAccountMenu() {
  const next = useSearchParams().get("next");
  return <AccountMenu dashboardHref={dashboardHref(false, next)} />;
}
