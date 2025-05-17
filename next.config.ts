import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  // This ensures the build generates a static export in the /out directory
};

export default nextConfig;
