import type { NextConfig } from "next";

const isDevelopment = process.env.NODE_ENV === "development";

const nextConfig: NextConfig = {
  // Configure Next.js to output static files
  output: "export",
  distDir: ".next",
  // Add trailing slashes to ensure consistent URLs in static exports
  trailingSlash: true,
  // Tell Next.js that we need to transpile our i18n folders
  transpilePackages: ["@/app"],

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

  // Tell TypeScript to exclude browser-tools-mcp from compilation
  typescript: {
    ignoreBuildErrors: false,
    tsconfigPath: "tsconfig.json",
  },

  // Fixed webpack configuration to avoid performance warnings
  webpack: (config, { dev }) => {
    // Don't override the devtool in development mode
    if (!dev) {
      config.devtool = "source-map"; // Only set source maps for production
    }

    // Simple approach - just override the entire watchOptions object
    config.watchOptions = {
      ignored: [
        "**/node_modules/**",
        "**/browser-tools-mcp/**",
        "**/browser-tools-mcp-main/**",
      ],
    };

    return config;
  },

  // Add custom headers for security policies
  async headers() {
    // Base CSP directives (Keep this tight and specific)
    const cspDirectives = {
      "default-src": "'self'",
      "script-src": [
        "'self'",
        "'unsafe-inline'", // Needed for inline scripts and Next.js hydration
        "https://app.privacybee.io", // Privacy management tool
        "https://www.googletagmanager.com", // Google Tag Manager
        // Add 'unsafe-eval' ONLY in development for HMR/Fast Refresh
        isDevelopment ? "'unsafe-eval'" : "",
      ]
        .filter(Boolean)
        .join(" "), // Filter out empty strings and join
      "style-src": "'self' 'unsafe-inline' https://app.privacybee.io", // Allow inline styles and PrivacyBee styles
      "img-src": "'self' data: blob: https://cdn.jsdelivr.net", // Allow self, data URLs, blobs, and flag CDN
      "font-src": "'self' data:", // Allow self and data URLs for fonts
      "connect-src": [
        "'self'",
        "https://app.privacybee.io",
        "https://www.google-analytics.com",
        "https://region1.google-analytics.com",
        // Allow WebSocket and HTTP connections for development tooling
        isDevelopment ? "ws://localhost:*" : "",
        isDevelopment ? "http://localhost:*" : "",
      ]
        .filter(Boolean)
        .join(" "),
      "worker-src": "'self' blob:", // Allow self and blobs for workers
      "frame-src": "'self'", // Allow framing only from self
      "manifest-src": "'self'", // Allow manifest from self
      "object-src": "'none'", // Disallow plugins like Flash
      "base-uri": "'self'", // Restrict base tag
      "form-action": "'self'", // Restrict form submissions
    };

    // Format the CSP string
    const cspString = Object.entries(cspDirectives)
      .map(([key, value]) => `${key} ${value}`)
      .join("; ");

    return [
      {
        // Apply these headers to all routes in your application.
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: cspString,
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
