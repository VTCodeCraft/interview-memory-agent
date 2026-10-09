import Link from "next/link";
import { SignUpButton } from "@clerk/nextjs";
import { ArrowRight } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { POST_AUTH_REDIRECT, ROUTES } from "@/lib/utils/constants";
import { cn } from "@/lib/utils";

export interface AuthState {
  clerkId: string | null;
  setupDone: boolean;
}

/**
 * The landing page's primary action, resolved from the visitor's state:
 * signed out opens Clerk sign-up (then POST_AUTH_REDIRECT), signed in but not
 * onboarded continues setup, onboarded starts a new interview.
 */
export default function AuthCta({
  clerkId,
  setupDone,
  signedOutLabel = "Start practicing",
  readyLabel = "Start an interview",
  size = "lg",
  className,
}: AuthState & {
  signedOutLabel?: string;
  readyLabel?: string;
  size?: "md" | "lg";
  className?: string;
}) {
  const classes = cn(buttonVariants({ variant: "primary", size }), className);
  const icon = <ArrowRight aria-hidden strokeWidth={1.75} />;

  if (!clerkId) {
    return (
      <SignUpButton mode="modal" forceRedirectUrl={POST_AUTH_REDIRECT} signInForceRedirectUrl={POST_AUTH_REDIRECT}>
        <button type="button" className={classes}>
          {signedOutLabel}
          {icon}
        </button>
      </SignUpButton>
    );
  }

  return (
    <Link href={setupDone ? ROUTES.newInterview : ROUTES.onboarding} className={classes}>
      {setupDone ? readyLabel : "Continue setup"}
      {icon}
    </Link>
  );
}
