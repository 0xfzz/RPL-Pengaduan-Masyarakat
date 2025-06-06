import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client'],
    optimizeCss: false, // Disable CSS optimization that uses LightningCSS
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  eslint: {
    ignoreDuringBuilds: true, // Ignore ESLint errors during build
  },
  output: "standalone",
};

export default nextConfig;
