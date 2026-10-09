"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { APP_NAME, ROUTES } from "@/lib/utils/constants";
import AccountMenu from "@/components/common/AccountMenu";

interface SidebarProps {
  targetRole?: string;
  experience?: string;
  hasResume?: boolean;
  githubUrl?: string | null;
  linkedinUrl?: string | null;
  profileLoaded?: boolean;
}

export default function Sidebar({
  githubUrl,
  linkedinUrl,
  profileLoaded,
}: SidebarProps) {
  const pathname = usePathname();
  const { user } = useUser();

  const displayName = user?.fullName || user?.firstName || "User";

  const [mobileOpen, setMobileOpen] = useState(false);

  // Close sidebar on escape and prevent body scroll when open
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleEsc);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleEsc);
    };
  }, [mobileOpen]);

  // Close sidebar on navigation
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Primary product navigation. Profile & Settings is intentionally not here —
  // it lives in the account menu (AccountMenu) at the bottom of the sidebar.
  const navItems = [
    { name: "Interviews", href: ROUTES.interviews, icon: "video_chat" },
    { name: "Reports", href: ROUTES.reports, icon: "description" },
    { name: "Memory", href: ROUTES.memory, icon: "psychology" },
    { name: "Analytics", href: ROUTES.analytics, icon: "monitoring" },
  ];

  return (
    <>
      {/* Mobile Header (Visible only on < lg screens) */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-outline-variant/30 flex items-center justify-between px-4 z-[40]">
        <Link href={ROUTES.home} className="flex items-center gap-2">
          <Image src="/logo.png" alt={APP_NAME} width={28} height={28} className="w-7 h-7 object-contain" />
          <span className="font-display font-extrabold text-primary text-xl">{APP_NAME}</span>
        </Link>
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 -mr-2 text-on-surface hover:bg-surface-container rounded-lg transition-colors cursor-pointer"
          aria-label="Open menu"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>
      </div>

      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-[45]"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <nav
        className={`h-screen w-64 fixed left-0 top-0 border-r border-outline-variant/30 flex flex-col py-lg px-md bg-white z-[50] transition-transform duration-300 ease-in-out ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
      <div className="mb-10 px-sm">
        <Link href={ROUTES.home} className="flex items-center gap-2 hover:opacity-85 transition-opacity">
          <Image src="/logo.png" alt={APP_NAME} width={32} height={32} className="w-8 h-8 object-contain" />
          <h1 className="font-display text-xl md:text-2xl font-extrabold text-primary">
            {APP_NAME}
          </h1>
        </Link>
        <p className="font-bold text-[9px] uppercase tracking-widest text-on-surface-variant mt-1">
          Never Forgets
        </p>
      </div>

      <div className="flex-1 overflow-y-auto space-y-1">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 active:scale-95 ${
                isActive
                  ? "text-primary font-bold bg-primary/10"
                  : "text-on-surface-variant hover:bg-surface-container"
              }`}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span className="text-sm font-medium">{item.name}</span>
            </Link>
          );
        })}


      </div>

      <div className="pt-4 border-t border-outline-variant/20 space-y-4">
        {/* Account menu: My Dashboard, Profile & Settings, Sign out. */}
        <div className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-surface-container/50">
          <div className="w-8 h-8 flex items-center justify-center shrink-0">
            <AccountMenu />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold truncate text-on-surface">
              {displayName}
            </p>
            <p className="text-[10px] text-on-surface-variant font-medium">
              Free Plan
            </p>
          </div>
        </div>
      </div>
    </nav>
    </>
  );
}
