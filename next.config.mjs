/**
 * @type {import('next').NextConfig}
 */

// Import TerserPlugin properly for ESM
// import TerserPlugin from 'terser-webpack-plugin'; // Commented out as it's not currently used

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
    // Ensure that anything related to react-refresh is disabled
    // reactRefresh: false, // Invalid option for Next.js 15.3.1
  },
  
  // Completely disable development features that might use eval
  devIndicators: {
    // position: 'bottom-right', // Previous setting
    // buildActivity: false, // Deprecated option
    // Add any other devIndicator flags that might exist and set them to false if they relate to eval or dev-only features.
    // For Next.js 13+, most dev indicators are controlled by these, but let's be thorough.
    // We aim to strip out any chance of react-refresh-utils appearing in production.
  },
  
  // Webpack configuration to strictly prevent eval
  webpack: (config, { dev, isServer }) => {
    // Force production-like settings in all environments
    // config.mode = 'production'; // Temporarily commented out for build troubleshooting
    
    // Use a safe source map that doesn't use eval
    config.devtool = 'source-map'; // Keep this to avoid eval-based sourcemaps
    
    // Define process.env variables to disable features that might use eval
    const definePlugin = config.plugins.find(
      (plugin) => plugin.constructor.name === 'DefinePlugin'
    );
    
    if (definePlugin) {
      definePlugin.definitions = {
        ...definePlugin.definitions,
        // 'process.env.NODE_ENV': JSON.stringify('production'), // Temporarily commented out
        'process.env.NEXT_RUNTIME': JSON.stringify(isServer ? 'nodejs' : 'edge'), // Ensure correct runtime value
        'process.env.__NEXT_FAST_REFRESH': JSON.stringify(false),
        'process.env.NEXT_HAS_CLIENT_DEV_OVERLAY': JSON.stringify(false),
        'process.env.NEXT_CLIENT_DEV_OVERLAY': JSON.stringify(false),
        'process.env.NEXT_FAST_REFRESH': JSON.stringify(false),
      };
    }
    
    // Enforce TerserPlugin settings to prevent eval
    // if (!isServer) { // Temporarily comment out custom Terser config
    //   config.optimization = {
    //     ...config.optimization,
    //     minimize: true,
    //     minimizer: [
    //       new TerserPlugin({
    //         terserOptions: {
    //           parse: {
    //             // Disable eval completely
    //             bare_returns: false,
    //           },
    //           compress: {
    //             // Disable eval-related optimizations
    //             evaluate: false,
    //             comparisons: false,
    //             inline: 0,
    //             drop_console: false,
    //             passes: 3,
    //           },
    //           mangle: true,
    //           module: false,
    //           output: {
    //             ecma: 5,
    //             comments: false,
    //             ascii_only: true,
    //           },
    //           safari10: true,
    //         },
    //       }),
    //     ],
    //   };
    // }
    
    // Enforce babel configuration to prevent eval (Keep this, it's specific)
    config.module.rules.forEach((rule) => {
      if (rule.oneOf) {
        rule.oneOf.forEach((oneOfRule) => {
          if (
            oneOfRule.use &&
            Array.isArray(oneOfRule.use) &&
            oneOfRule.use.some(use => use.loader && use.loader.includes('babel-loader'))
          ) {
            oneOfRule.use = oneOfRule.use.map((use) => {
              if (use.loader && use.loader.includes('babel-loader')) {
                return {
                  ...use,
                  options: {
                    ...use.options,
                    sourceMaps: false, // Ensure no source maps from babel if they cause issues
                    compact: true,
                    assumptions: {
                      noDocumentAll: true,
                    },
                    plugins: [
                      ...(use.options?.plugins || []),
                      '@babel/plugin-transform-dynamic-import',
                    ],
                  },
                };
              }
              return use;
            });
          }
        });
      }
    });
    
    // Replace Hot Module Replacement with a version that doesn't use eval
    if (!isServer && dev) { // This only applies in dev, should be fine for build
      const HotModuleReplacementPlugin = config.plugins.find(
        (plugin) => plugin.constructor.name === 'HotModuleReplacementPlugin'
      );
      
      if (HotModuleReplacementPlugin) {
        const index = config.plugins.indexOf(HotModuleReplacementPlugin);
        if (index !== -1) {
          config.plugins.splice(index, 1);
        }
      }
    }
    
    return config;
  },
  
  // No Next.js powered by header
  poweredByHeader: false,
};

export default nextConfig; 
