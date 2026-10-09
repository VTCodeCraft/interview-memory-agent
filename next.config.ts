import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdf-parse"],

  // Legacy /dashboard/* URLs. Config redirects run before proxy.ts, so these
  // resolve before authentication and cannot loop. Query strings are passed
  // through by Next.js. Temporary (307) while the new route tree settles.
  async redirects() {
    return [
      { source: "/dashboard", destination: "/interviews", permanent: false },
      // The old page was interview setup (and auto-resumed an active interview,
      // which /interviews/new still does).
      { source: "/dashboard/interview", destination: "/interviews/new", permanent: false },
      {
        source: "/dashboard/interview/voice-check",
        destination: "/interviews/check",
        permanent: false,
      },
      { source: "/dashboard/reports", destination: "/reports", permanent: false },
      { source: "/dashboard/memory", destination: "/memory", permanent: false },
      { source: "/dashboard/settings", destination: "/profile", permanent: false },
    ];
  },
};

export default nextConfig;
