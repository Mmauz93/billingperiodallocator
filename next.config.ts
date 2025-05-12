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
  reactStrictMode: true,
  experimental: {
    // Add experimental features as needed
    scrollRestoration: false,
  },
  // Don't expose the Next.js version in headers
  poweredByHeader: false,

  // Webpack configuration (similar to what was in .mjs)
  webpack: (config, { dev }) => {
    if (dev) {
      // Use a safe source map that doesn't use eval for development
      config.devtool = 'source-map';
    } else {
      config.devtool = 'source-map'; // Production source maps
    }
    return config;
  },

  // Add custom headers for security policies
  async headers() {
    // const isDevelopment = process.env.NODE_ENV === 'development'; // Already defined above
    // console.log(`[next.config.ts] headers() called. isDevelopment: ${isDevelopment}`); // Removed log

    // Base CSP directives (Keep this tight and specific)
    const cspDirectives = {
      'default-src': "'self'",
      'script-src': [
        "'self'", 
        "'unsafe-inline'", // Needed for inline scripts and Next.js hydration
        "https://app.privacybee.io", // Privacy management tool
        "https://www.googletagmanager.com", // Google Tag Manager
        // Add 'unsafe-eval' ONLY in development for HMR/Fast Refresh
        isDevelopment ? "'unsafe-eval'" : "", 
      ].filter(Boolean).join(' '), // Filter out empty strings and join
      'style-src': "'self' 'unsafe-inline' https://app.privacybee.io", // Allow inline styles and PrivacyBee styles
      'img-src': "'self' data: blob: https://cdn.jsdelivr.net", // Allow self, data URLs, blobs, and flag CDN
      'font-src': "'self' data:", // Allow self and data URLs for fonts
      'connect-src': [
        "'self'", 
        "https://app.privacybee.io",
        "https://www.google-analytics.com",
        "https://region1.google-analytics.com",
        // Allow WebSocket and HTTP connections for development tooling
        isDevelopment ? "ws://localhost:*" : "",
        isDevelopment ? "http://localhost:*" : "",
      ].filter(Boolean).join(' '),
      'worker-src': "'self' blob:", // Allow self and blobs for workers
      'frame-src': "'self'", // Allow framing only from self
      'manifest-src': "'self'", // Allow manifest from self
      'object-src': "'none'", // Disallow plugins like Flash
      'base-uri': "'self'", // Restrict base tag
      'form-action': "'self'", // Restrict form submissions
    };

    // Format the CSP string
    const cspString = Object.entries(cspDirectives)
      .map(([key, value]) => `${key} ${value}`)
      .join('; ');
      
    // console.log(`[next.config.ts] Generated CSP String: ${cspString}`); // Removed log

    return [
      {
        // Apply these headers to all routes in your application.
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: cspString,
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
