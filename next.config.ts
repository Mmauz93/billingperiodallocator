import type { NextConfig } from "next";

const isDevelopment = process.env.NODE_ENV === 'development';

const nextConfig: NextConfig = {
  // Configure Next.js to output static files
  output: isDevelopment ? undefined : "export",
  // Add trailingSlash option for directory-based HTML files
  trailingSlash: true,
  images: {
    // Optional: Configure device sizes for responsive images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    // Optional: Configure image sizes for srcset generation
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Optional: Add remote domains if using external images
    domains: [], // Add domains like ['example.com'] if needed
    // Ensure default loader is used for static export
    loader: "default",
    path: "/_next/image",
  },
  // In development, allow React to catch and display errors
  reactStrictMode: !isDevelopment,
  experimental: {
    // Add experimental features as needed
    scrollRestoration: false,
  },
  // Don't expose the Next.js version in headers
  poweredByHeader: false,
};

export default nextConfig;
