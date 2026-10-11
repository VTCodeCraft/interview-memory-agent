import AppShell from "@/components/app/AppShell";
import { requireOnboardedUser } from "@/lib/auth/app-user";

/**
 * Layout for the signed-in product (/interviews, /reports, /memory,
 * /analytics, /profile). Blocks signed-out users and users who have not
 * completed onboarding before any page in this group renders. URLs are
 * unaffected by the (app) route group. AppShell adds the shared top
 * navigation (not on the voice check or the live interview).
 */
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireOnboardedUser();
  return <AppShell>{children}</AppShell>;
}
