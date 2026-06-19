import type { NextConfig } from "next";

const apiBackendUrl = process.env.API_BACKEND_URL;
if (!apiBackendUrl && process.env.NODE_ENV === "production") {
  console.warn(
    "[next.config] WARNING: API_BACKEND_URL is not set. Rewrites will fall back to http://localhost:5000 which will NOT work in production.\n" +
      "  Set the API_BACKEND_URL environment variable in your Vercel project to your Render backend URL."
  );
}
const backendUrl = apiBackendUrl || "http://localhost:5000";

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
};

nextConfig.rewrites = async () => [
  {
    source: "/api/:path*",
    destination: `${backendUrl}/api/:path*`,
  },
];

export default nextConfig;
