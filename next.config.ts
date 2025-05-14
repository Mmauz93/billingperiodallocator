import type { NextConfig } from "next";

const isDevelopment = process.env.NODE_ENV === 'development';

const nextConfig: NextConfig = {
  // Configure Next.js to output static files
  output: 'export',
  distDir: '.next',
  // Tell Next.js that we need to transpile our i18n folders
  transpilePackages: ['@/app'],

  // Disable image optimization during static export (it's not supported)
  images: {
    unoptimized: true,
    remotePatterns: [],
    loader: "default",
    path: "/_next/image",
  },
  // In development, allow React to catch and display errors
  reactStrictMode: true,
  experimental: {
    // Add experimental features as needed
    scrollRestoration: false,
  },
  // Don't expose the Next.js version in headers
  poweredByHeader: false,

  // Fixed webpack configuration to avoid performance warnings
  webpack: (config, { dev }) => {
    // Don't override the devtool in development mode
    if (!dev) {
      config.devtool = 'source-map'; // Only set source maps for production
    }
    return config;
  },
};

export default nextConfig;
