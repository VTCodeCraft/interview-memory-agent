"use client";

import { useEffect, useId, useState } from "react";
import { ArrowRight, Menu, X } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Brand } from "./Brand";

const LINKS = [
  { label: "How it works", href: "#how" },
  { label: "Memory", href: "#memory" },
  { label: "Reports", href: "#reports" },
];

/** Public (signed-out) top navigation for the marketing pages. */
export function SiteNav() {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="sticky top-0 z-(--z-nav) border-b border-line-subtle bg-canvas/90 backdrop-blur-xl backdrop-saturate-150">
      <nav aria-label="Main" className="ds-container flex h-nav items-center justify-between gap-6">
        <div className="flex items-center gap-10">
          <Brand />
          <ul className="hidden items-center gap-1 md:flex">
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

        <div className="hidden items-center gap-2 md:flex">
          <a href="#get-started" className={buttonVariants({ variant: "ghost", size: "sm" })}>
            Sign in
          </a>
          <a href="#get-started" className={buttonVariants({ variant: "primary", size: "sm" })}>
            Get started
          </a>
        </div>

        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((value) => !value)}
          className="-mr-2 inline-flex size-10 items-center justify-center rounded-control text-fg hover:bg-sunken focus-ring md:hidden"
        >
          {open ? <X aria-hidden strokeWidth={1.75} className="size-5" /> : <Menu aria-hidden strokeWidth={1.75} className="size-5" />}
        </button>
      </nav>

      {open && (
        <div id={panelId} className="border-t border-line-subtle md:hidden">
          <div className="ds-container flex flex-col gap-1 py-4">
            {LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-control px-3 py-3 text-body font-medium text-fg hover:bg-sunken focus-ring"
              >
                {link.label}
              </a>
            ))}
            <div className="mt-3 grid grid-cols-2 gap-2">
              <a href="#get-started" onClick={() => setOpen(false)} className={buttonVariants({ variant: "secondary" })}>
                Sign in
              </a>
              <a href="#get-started" onClick={() => setOpen(false)} className={cn(buttonVariants({ variant: "primary" }))}>
                Get started
                <ArrowRight aria-hidden strokeWidth={1.75} />
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
