import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {},
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@prisma/db': path.join(process.cwd(), 'prisma/generated/client'),
    };
    return config;
  },
};

export default nextConfig;
