import type { NextConfig } from "next";

const backendUrl = process.env.API_BACKEND_URL || "http://localhost:5000";

const nextConfig: NextConfig = {};

nextConfig.rewrites = async () => [
  {
    source: "/api/:path*",
    destination: `${backendUrl}/api/:path*`,
  },
];

export default nextConfig;
