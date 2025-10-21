const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: process.env.NEXT_DIST_DIR || '.next',
  // NOTE: Payload CMS requires server-side rendering
  // Static export is incompatible with Payload CMS
  // Remove or comment out NEXT_OUTPUT_MODE in .env when using Payload CMS
  output: process.env.NEXT_OUTPUT_MODE,
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
  
  // 301 Redirects for SEO preservation - Redirect /partners to /vendors
  async redirects() {
    return [
      // General redirect from /partners to /vendors (partners only view)
      { source: '/partners', destination: '/vendors', permanent: true },

      // Partner ID to Vendor Slug redirects (updated to /vendors)
      { source: '/partners/partner-1', destination: '/vendors/raymarine-teledyne-flir-fb', permanent: true },
      { source: '/partners/partner-2', destination: '/vendors/vbh-van-berge-henegouwen-fb', permanent: true },
      { source: '/partners/partner-3', destination: '/vendors/mtu-rolls-royce-power-systems-fb', permanent: true },
      { source: '/partners/partner-4', destination: '/vendors/evac-group-fb', permanent: true },
      { source: '/partners/partner-5', destination: '/vendors/furuno-electric-co-fb', permanent: true },
      { source: '/partners/partner-6', destination: '/vendors/icom-inc-fb', permanent: true },
      { source: '/partners/partner-7', destination: '/vendors/garmin-international-fb', permanent: true },
      { source: '/partners/partner-8', destination: '/vendors/b-g-navico-fb', permanent: true },
      { source: '/partners/partner-9', destination: '/vendors/simrad-yachting-fb', permanent: true },
      { source: '/partners/partner-10', destination: '/vendors/lowrance-navico-fb', permanent: true },
      { source: '/partners/partner-11', destination: '/vendors/thrane-thrane-cobham-satcom-fb', permanent: true },
      { source: '/partners/partner-12', destination: '/vendors/intellian-technologies-fb', permanent: true },
      { source: '/partners/partner-13', destination: '/vendors/kvh-industries-fb', permanent: true },
      { source: '/partners/partner-14', destination: '/vendors/seatel-cobham-satcom-fb', permanent: true },
      { source: '/partners/partner-15', destination: '/vendors/inmarsat-fb', permanent: true },
      { source: '/partners/partner-16', destination: '/vendors/iridium-communications-fb', permanent: true },
      { source: '/partners/partner-17', destination: '/vendors/globalstar-fb', permanent: true },
      { source: '/partners/partner-18', destination: '/vendors/viasat-fb', permanent: true },

      // Catch-all redirect for any other /partners/* URLs to /vendors/*
      { source: '/partners/:path*', destination: '/vendors/:path*', permanent: true },
    ];
  },
};

module.exports = nextConfig;
