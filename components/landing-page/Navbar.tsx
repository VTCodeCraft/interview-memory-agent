"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { Menu, X } from "lucide-react";

import AccountMenu from "@/components/common/AccountMenu";
import { buttonVariants } from "@/components/ui/button";
import { dashboardHref } from "@/lib/routing/dashboard-link";
import { POST_AUTH_REDIRECT } from "@/lib/utils/constants";
import { cn } from "@/lib/utils";
import type { AuthState } from "./AuthCta";
import Logo from "./Logo";

const LINKS = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Reports", href: "#reports" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

/**
 * Public top navigation. Signed out: Clerk sign-in / sign-up modals that land
 * on POST_AUTH_REDIRECT. Signed in: a Dashboard link (onboarding first if
 * setup is incomplete) and the shared account menu.
 */
export default function Navbar({ clerkId, setupDone }: AuthState) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const toggleRef = useRef<HTMLButtonElement>(null);
  // Onboarding first while setup is incomplete (same target for the menu item).
  const dashboard = dashboardHref(setupDone);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      toggleRef.current?.focus();
    };
    const onResize = () => {
      if (window.matchMedia("(min-width: 64rem)").matches) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <header className="sticky top-0 z-(--z-nav) border-b border-line-subtle bg-canvas/90 backdrop-blur-xl backdrop-saturate-150">
      <nav aria-label="Main" className="ds-container flex h-nav items-center justify-between gap-6">
        <div className="flex items-center gap-10">
          <Logo priority />
          <ul className="hidden items-center gap-1 lg:flex">
            {LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="rounded-control px-3 py-2 text-small font-medium text-fg-muted transition-[color] duration-(--duration-fast) ease-standard hover:text-fg focus-ring"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-center gap-2">
          {clerkId ? (
            <>
              <Link href={dashboard} className={buttonVariants({ variant: "primary", size: "sm" })}>
                Dashboard
              </Link>
              <div className="flex size-8 items-center justify-center">
                <AccountMenu dashboardHref={dashboard} />
              </div>
            </>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <SignInButton mode="modal" forceRedirectUrl={POST_AUTH_REDIRECT} signUpForceRedirectUrl={POST_AUTH_REDIRECT}>
                <button type="button" className={buttonVariants({ variant: "ghost", size: "sm" })}>
                  Sign in
                </button>
              </SignInButton>
              <SignUpButton mode="modal" forceRedirectUrl={POST_AUTH_REDIRECT} signInForceRedirectUrl={POST_AUTH_REDIRECT}>
                <button type="button" className={buttonVariants({ variant: "primary", size: "sm" })}>
                  Get started
                </button>
              </SignUpButton>
            </div>
          )}

          <button
            ref={toggleRef}
            type="button"
            aria-expanded={open}
            aria-controls={panelId}
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((value) => !value)}
            className="-mr-2 inline-flex size-10 items-center justify-center rounded-control text-fg hover:bg-sunken focus-ring lg:hidden"
          >
            {open ? <X aria-hidden strokeWidth={1.75} className="size-5" /> : <Menu aria-hidden strokeWidth={1.75} className="size-5" />}
          </button>
        </div>
      </nav>

      <div id={panelId} hidden={!open} className="border-t border-line-subtle lg:hidden">
        <div className="ds-container flex flex-col gap-1 py-4">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={close}
              className="rounded-control px-3 py-3 text-body font-medium text-fg hover:bg-sunken focus-ring"
            >
              {link.label}
            </a>
          ))}
          {!clerkId && (
            <div className="mt-3 grid grid-cols-2 gap-2 sm:hidden">
              <SignInButton mode="modal" forceRedirectUrl={POST_AUTH_REDIRECT} signUpForceRedirectUrl={POST_AUTH_REDIRECT}>
                <button type="button" onClick={close} className={buttonVariants({ variant: "secondary" })}>
                  Sign in
                </button>
              </SignInButton>
              <SignUpButton mode="modal" forceRedirectUrl={POST_AUTH_REDIRECT} signInForceRedirectUrl={POST_AUTH_REDIRECT}>
                <button type="button" onClick={close} className={cn(buttonVariants({ variant: "primary" }))}>
                  Get started
                </button>
              </SignUpButton>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
