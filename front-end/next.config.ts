import type { NextConfig } from "next";

const REMOTE_API_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://app-6a92a0c0.deploy.meerasolution.com";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/backend/:path*",
        destination: `${REMOTE_API_URL}/:path*`,
      },
    ];
  },
};

export default nextConfig;