const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: process.env.NEXT_DIST_DIR || '.next',

  // Security headers for all routes
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/media/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  // Redirects for deprecated routes (rebrand migration)
  async redirects() {
    return [
      {
        source: '/discovery-platform',
        destination: '/vendors',
        permanent: true,
      },
      {
        source: '/bespoke-solutions',
        destination: '/consultancy/clients',
        permanent: true,
      },
      {
        source: '/consultancy',
        destination: '/consultancy/clients',
        permanent: false,
      },
    ];
  },
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
      // External packages
      '@radix-ui/react-accordion',
      '@radix-ui/react-dialog',
      '@radix-ui/react-select',
      'framer-motion',
      'lucide-react',
      // Internal barrel files - prevents bundle bloat from re-exports
      '@/components/product-comparison',
      '@/components/enhanced-profiles',
      '@/components/case-studies',
      '@/lib/transformers',
      '@/lib/repositories',
      '@/lib/cache'
    ]
  },

  // Transpile packages that have ESM issues with Next.js 15
  transpilePackages: ['clsx', 'tailwind-merge', 'class-variance-authority'],

  // External packages that should not be bundled (server-side only)
  // Note: resend and svix added to fix webpack chunk corruption during hot reload
  // (Error: Cannot find module './vendor-chunks/svix.js')
  serverExternalPackages: ['payload', '@payloadcms/db-sqlite', '@payloadcms/db-postgres', 'resend', 'svix'],

  // Webpack configuration
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Exclude postgres-data directory from scanning
    config.watchOptions = {
      ...config.watchOptions,
      ignored: /postgres-data/
    };

    // IMPORTANT: When building for PostgreSQL (USE_POSTGRES=true), exclude SQLite packages
    // This prevents the "Cannot find module '@libsql/linux-x64-musl'" error in Docker
    if (process.env.USE_POSTGRES === 'true' && isServer) {
      config.plugins.push(
        new webpack.IgnorePlugin({
          resourceRegExp: /^@payloadcms\/db-sqlite$/
        }),
        new webpack.IgnorePlugin({
          resourceRegExp: /^@libsql\//
        }),
        new webpack.IgnorePlugin({
          resourceRegExp: /^libsql$/
        }),
        new webpack.IgnorePlugin({
          resourceRegExp: /^better-sqlite3$/
        })
      );

      // Also add to externals to prevent any resolution attempts
      config.externals = config.externals || [];
      if (Array.isArray(config.externals)) {
        config.externals.push(
          '@payloadcms/db-sqlite',
          '@libsql/client',
          '@libsql/core',
          'libsql',
          'better-sqlite3'
        );
      }
    }

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
