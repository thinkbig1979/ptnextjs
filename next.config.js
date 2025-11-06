const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: process.env.NEXT_DIST_DIR || '.next',
  // NOTE: Payload CMS requires server-side rendering
  // Static export is incompatible with Payload CMS
  // Docker deployment uses standalone mode for optimized containerization
  output: process.env.NODE_ENV === 'production' ? 'standalone' : process.env.NEXT_OUTPUT_MODE,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    unoptimized: true,
    domains: [
      'images.unsplash.com',
      'localhost',
      // Add domains for enhanced profile media
      'cdn.example.com',
      'media.example.com'
    ]
  },

  // Enhanced experimental features for platform vision
  experimental: {
    optimizePackageImports: [
      '@radix-ui/react-accordion',
      '@radix-ui/react-dialog',
      '@radix-ui/react-select',
      'framer-motion',
      'lucide-react'
    ]
  },

  // Transpile packages that have ESM issues with Next.js 15
  transpilePackages: ['clsx', 'tailwind-merge', 'class-variance-authority'],

  // External packages that should not be bundled (server-side only)
  serverExternalPackages: ['payload', '@payloadcms/db-sqlite', '@payloadcms/db-postgres'],

  // Webpack configuration
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Bundle analyzer for development
    if (process.env.ANALYZE === 'true' && !dev && !isServer) {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          openAnalyzer: false,
          reportFilename: path.join(process.cwd(), 'bundle-analyzer-report.html')
        })
      );
    }

    // Exclude Node.js modules from client bundle
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        'fs/promises': false,
        crypto: false,
        stream: false,
        util: false,
      };
    }

    return config;
  },
  
  // Static export configuration
  // DISABLED: trailingSlash causes 308 redirects on Payload CMS API routes
  // which triggers CORS errors in the admin panel
  trailingSlash: false,
  generateBuildId: async () => {
    // Use timestamp for cache busting in static builds
    return process.env.NODE_ENV === 'production'
      ? Date.now().toString()
      : 'development';
  },
};

module.exports = nextConfig;
