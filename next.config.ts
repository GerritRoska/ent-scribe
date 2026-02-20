import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Allow Chrome extensions to embed this app in an iframe
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors 'self' chrome-extension://*",
          },
          // Remove the default SAMEORIGIN restriction
          {
            key: "X-Frame-Options",
            value: "ALLOWALL",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
