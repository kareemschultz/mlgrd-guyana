import type { NextConfig } from "next";

/**
 * Static-export config for GitHub Pages (and portable to the ministry's host).
 *
 * - `output: "export"` emits a fully static site to `out/` (no Node server needed).
 * - `basePath`/`assetPrefix` come from NEXT_PUBLIC_BASE_PATH so the same build works
 *   locally (empty) and on a GitHub Pages project path (e.g. "/mlgrd-portal").
 * - `images.unoptimized` is required because the Next image optimizer needs a server.
 * - `trailingSlash` makes Pages serve `/route/index.html` correctly.
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH?.replace(/\/$/, "") || "";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  basePath: basePath || undefined,
  assetPrefix: basePath || undefined,
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
};

export default nextConfig;
