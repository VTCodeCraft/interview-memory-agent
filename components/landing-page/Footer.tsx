import Link from "next/link";

import { CONTACT_FORM_URL, ROUTES } from "@/lib/utils/constants";
import Logo from "./Logo";

type FooterLink = { label: string; href: string; external?: boolean };

// Product links lead to signed-in pages; signed-out visitors are sent to
// sign-in by the proxy, as before.
const COLUMNS: { title: string; links: FooterLink[] }[] = [
  {
    title: "Product",
    links: [
      { label: "Dashboard", href: ROUTES.interviews },
      { label: "New interview", href: ROUTES.newInterview },
      { label: "Reports", href: ROUTES.reports },
      { label: "Memory", href: ROUTES.memory },
      { label: "Profile & Settings", href: ROUTES.profile },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "FAQ", href: "#faq" },
      { label: "Contact", href: CONTACT_FORM_URL, external: true },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: ROUTES.privacy },
      { label: "Terms of Service", href: ROUTES.terms },
    ],
  },
];

const linkClass = "inline-flex min-h-6 items-center rounded-control text-small text-fg-muted transition-[color] duration-(--duration-fast) ease-standard hover:text-fg focus-ring";

export default function Footer() {
  return (
    <footer className="ds-container pt-(--spacing-section)">
      <div className="grid gap-10 border-t border-line pt-12 pb-12 md:grid-cols-12">
        <div className="md:col-span-5">
          <Logo />
          <p className="mt-4 max-w-[34ch] text-small text-fg-muted">
            AI voice interview practice that remembers your previous sessions and builds on them.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:col-span-7">
          {COLUMNS.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <p className="text-label font-semibold text-fg">{column.title}</p>
              <ul className="mt-4 flex flex-col gap-2.5">
                {column.links.map((link) => (
                  <li key={link.label}>
                    {link.external ? (
                      <a href={link.href} target="_blank" rel="noopener noreferrer" className={linkClass}>
                        {link.label}
                        <span className="sr-only"> (opens in a new tab)</span>
                      </a>
                    ) : link.href.startsWith("#") ? (
                      <a href={link.href} className={linkClass}>
                        {link.label}
                      </a>
                    ) : (
                      <Link href={link.href} className={linkClass}>
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-2 border-t border-line-subtle py-6 text-label font-normal text-fg-subtle sm:flex-row sm:items-center sm:justify-between">
        <p>&copy; 2026 Clutchly. All rights reserved.</p>
        <p>
          Built by <span role="img" aria-label="love">💖</span> Vishesh and Samarth
        </p>
      </div>
    </footer>
  );
}
