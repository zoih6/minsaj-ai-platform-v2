import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  allowedDevOrigins: ["127.0.0.1", "localhost", "*.e2b.app", "*.space-z.ai"],
  transpilePackages: [
    "@minsaj/contracts",
    "@minsaj/i18n",
    "@minsaj/mock-api",
    "@minsaj/ui",
  ],
  async redirects() {
    return [
      {
        source: "/",
        destination: "/ar",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
