import type { NextConfig } from "next";

const REMOTE_API_URL =
  process.env.API_BASE_URL_ENV ?? "https://app-6ab05d7e.deploy.meerasolution.com";

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
