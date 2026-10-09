import { requireOnboardedUser } from "@/lib/auth/app-user";

/**
 * Layout for the signed-in product (/interviews, /reports, /memory,
 * /analytics, /profile). Blocks signed-out users and users who have not
 * completed onboarding before any page in this group renders. URLs are
 * unaffected by the (app) route group.
 */
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireOnboardedUser();
  return children;
}
