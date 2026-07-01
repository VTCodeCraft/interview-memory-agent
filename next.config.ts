import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // PDF.js loads its worker with a native Node.js import. Bundling it with
  // Turbopack rewrites that worker path to a virtual `[project]` module.
  serverExternalPackages: ["pdfjs-dist"],
};

export default nextConfig;
