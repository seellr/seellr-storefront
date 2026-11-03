import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    const editorOrigins = (process.env.NEXT_PUBLIC_PREVIEW_EDITOR_ORIGINS ?? '').split(',').map((origin) => origin.trim()).filter(Boolean)
    const frameAncestors = ["'self'", ...editorOrigins].join(' ')
    return [
      { source: '/:path*', headers: [{ key: 'Content-Security-Policy', value: "frame-ancestors 'none'" }] },
      { source: '/:locale/preview', headers: [{ key: 'Content-Security-Policy', value: `frame-ancestors ${frameAncestors}` }] },
    ]
  },
  /* config options here */
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
