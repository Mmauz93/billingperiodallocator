/**
 * @type {import('next').NextConfig}
 */

// Import TerserPlugin properly for ESM
// import TerserPlugin from 'terser-webpack-plugin'; // Commented out as it's not currently used

// import MillionLint from '@million/lint'; // Removed as MillionLint usage is commented out

const nextConfig = {
  // Configure Next.js to output static files in production
  output: process.env.NODE_ENV === 'production' ? "export" : undefined,
  
  // Add trailingSlash option for directory-based HTML files
  trailingSlash: true,
  
  // Image optimization config
  images: {
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    domains: [],
    loader: "default",
    path: "/_next/image",
  },
  
  // Enable strict mode in all environments
  reactStrictMode: true,
  
  // Explicitly disable optimizations that might use eval
  experimental: {
    // Array of packages to optimize, set to empty to disable dynamic optimization
    optimizePackageImports: [],
    // Disable server source maps
    serverSourceMaps: false,
  },
  
  // Completely disable development features that might use eval
  devIndicators: {
    // buildActivity: false, // Deprecated option
  },
  
  // Webpack configuration
  webpack: (config, { dev }) => {
    if (dev) {
      // Use a safe source map that doesn't use eval for development
      config.devtool = 'source-map';

      // Minimal DefinePlugin changes for development if absolutely necessary
      // Forcing process.env.NODE_ENV to 'production' in dev can break things.
      // Flags like __NEXT_FAST_REFRESH are managed by Next.js itself based on the dev server's needs.
      // It's better to control these via environment variables or next.config.js top-level options if possible.
      const definePlugin = config.plugins.find(
        (plugin) => plugin.constructor.name === 'DefinePlugin'
      );
      if (definePlugin) {
        definePlugin.definitions = {
          ...definePlugin.definitions,
          // Only set these if you are sure they are needed for dev and don't break HMR/Fast Refresh
          // 'process.env.__NEXT_FAST_REFRESH': JSON.stringify(false), // Potentially breaks Fast Refresh
          // 'process.env.NEXT_HAS_CLIENT_DEV_OVERLAY': JSON.stringify(false), // Potentially breaks dev overlay
        };
      }

    } else {
      // For production builds (output: 'export'), rely on Next.js defaults.
      // Next.js's production build is already optimized and should not use eval.
      // Custom Terser or Babel settings here can often conflict with Next.js's optimizations.
      config.devtool = 'source-map'; // Still good to have for production source maps if needed
    }
    
    return config;
  },
  
  // No Next.js powered by header
  poweredByHeader: false,
};

// const millionConfig = {
//   auto: { rsc: true },
//   // Optional: if you're using Next.js < 14.2.0, provide the Next.js version
//   // nextVersion: "14.1.0",
// };

// export default MillionLint.next(
//   nextConfig, millionConfig
// );
export default nextConfig; 
