"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import { ROUTES } from "@/lib/utils/constants";
import AppNav from "./AppNav";

/**
 * Full-screen interview flows: the voice check and the live session keep
 * their own focused screens without product navigation.
 */
export function isFocusRoute(pathname: string) {
  return pathname === ROUTES.interviewCheck || /^\/interviews\/[^/]+\/live\/?$/.test(pathname);
}

/**
 * Frame for the signed-in product. Decided on the client because the (app)
 * layout persists across navigations, so it can't re-check the path itself.
 * On focus routes the wrapper is `display: contents`, so those pages lay out
 * exactly as before; the tree shape stays the same either way, so pages never
 * remount when the navigation appears or disappears.
 */
export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const focus = isFocusRoute(pathname);

  return (
    <div className={focus ? "contents" : "flex min-h-dvh flex-1 flex-col"}>
      {focus ? null : <AppNav pathname={pathname} />}
      {children}
    </div>
  );
}
