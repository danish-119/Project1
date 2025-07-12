import type { NextConfig } from "next";

const nextConfig: NextConfig = {
   env: {
    POCKETBASE_URL: process.env.POCKETBASE_URL,
  },
   eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
