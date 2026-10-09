/**
 * Validation for post-onboarding "next" destinations.
 *
 * Only root-relative paths inside the signed-in product are accepted, so a
 * crafted `?next=` value can never send the user off-site (open redirect) or
 * back into /onboarding (redirect loop). Safe to import from server and client.
 */

/** Request header set by proxy.ts so server layouts know the requested path. */
export const APP_PATH_HEADER = "x-clutchly-path";

const APP_ROUTE_PREFIXES = [
  "/interviews",
  "/reports",
  "/memory",
  "/analytics",
  "/profile",
] as const;

const PLACEHOLDER_ORIGIN = "http://clutchly.invalid";

export function isAppPath(pathname: string): boolean {
  return APP_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

/** Returns a safe internal path (pathname + search) or null. */
export function sanitizeAppRedirect(raw: string | null | undefined): string | null {
  if (typeof raw !== "string" || raw.length === 0 || raw.length > 512) return null;
  // Must be root-relative; reject protocol-relative (`//`) and backslash tricks.
  if (!raw.startsWith("/") || raw.startsWith("//") || raw.includes("\\")) return null;
  // Reject control characters (CR/LF/tab etc.).
  if (/[\u0000-\u001f\u007f]/.test(raw)) return null;

  let url: URL;
  try {
    url = new URL(raw, PLACEHOLDER_ORIGIN);
  } catch {
    return null;
  }
  if (url.origin !== PLACEHOLDER_ORIGIN) return null;
  if (!isAppPath(url.pathname)) return null;

  return `${url.pathname}${url.search}`;
}
