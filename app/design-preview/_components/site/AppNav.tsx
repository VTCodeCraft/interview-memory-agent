"use client";

import { LayoutGrid, LogOut, Plus, Settings } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Avatar, Brand } from "./Brand";

const APP_LINKS = ["Interviews", "Reports", "Memory", "Analytics"] as const;

/**
 * Signed-in product navigation, as it would sit at the top of every product
 * page: one content width, no sidebar, Profile & Settings in the avatar menu.
 * Links are inert in the preview.
 */
export function AppNav({ active = "Reports" }: { active?: (typeof APP_LINKS)[number] }) {
  const linkClass = (isActive: boolean) =>
    cn(
      "relative inline-flex h-9 shrink-0 items-center rounded-control px-3 text-small font-medium transition-[color,background-color] duration-(--duration-fast) ease-standard focus-ring",
      isActive ? "bg-sunken text-fg" : "text-fg-muted hover:text-fg",
    );

  return (
    <div className="border-b border-line-subtle">
      <div className="flex h-14 items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-6">
          <Brand href="#reports" />
          <nav aria-label="Product" className="hidden md:block">
            <ul className="flex items-center gap-1">
              {APP_LINKS.map((label) => (
                <li key={label}>
                  <a
                    href="#reports"
                    aria-current={label === active ? "page" : undefined}
                    className={linkClass(label === active)}
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" className="hidden sm:inline-flex">
            <Plus aria-hidden strokeWidth={2} />
            New interview
          </Button>
          <DropdownMenu
            label="Account menu"
            trigger={<Avatar initials="MC" />}
            triggerClassName="rounded-full"
            header={
              <div className="flex flex-col">
                <span className="text-small font-semibold text-fg">Maya Chen</span>
                <span className="text-label font-normal text-fg-subtle">maya@example.com</span>
              </div>
            }
            items={[
              { label: "My Dashboard", icon: LayoutGrid },
              { label: "Profile & Settings", icon: Settings },
              { label: "Sign out", icon: LogOut, separatorBefore: true },
            ]}
          />
        </div>
      </div>
      <nav aria-label="Product (compact)" className="scrollbar-hidden flex gap-1 overflow-x-auto px-3 pb-2 md:hidden">
        {APP_LINKS.map((label) => (
          <a
            key={label}
            href="#reports"
            aria-current={label === active ? "page" : undefined}
            className={linkClass(label === active)}
          >
            {label}
          </a>
        ))}
      </nav>
    </div>
  );
}
