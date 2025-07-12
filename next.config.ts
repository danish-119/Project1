import type { NextConfig } from "next";

const nextConfig: NextConfig = {
   env: {
    POCKETBASE_URL: process.env.POCKETBASE_URL,
  },
};

export default nextConfig;
