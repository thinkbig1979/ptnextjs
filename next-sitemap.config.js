/** @type {import('next-sitemap').IConfig} */

// Known site pages - ensures sitemap is complete even when building
// without database access (e.g., Docker builds with SKIP_BUILD_DB=true)
const KNOWN_PATHS = [
  { path: '/', changefreq: 'daily', priority: 1.0 },
  { path: '/about', changefreq: 'weekly', priority: 0.9 },
  { path: '/contact', changefreq: 'monthly', priority: 0.9 },
  { path: '/blog', changefreq: 'weekly', priority: 0.9 },
  { path: '/custom-lighting', changefreq: 'weekly', priority: 0.8 },
  { path: '/consultancy/clients', changefreq: 'weekly', priority: 0.8 },
  { path: '/consultancy/suppliers', changefreq: 'weekly', priority: 0.8 },
  { path: '/products', changefreq: 'weekly', priority: 0.9 },
  { path: '/testimonials', changefreq: 'monthly', priority: 0.8 },
  { path: '/vendors', changefreq: 'weekly', priority: 0.9 },
  { path: '/blog/the-pixel-perfect-problem-why-custom-lighting-needs-more-than-a-good-idea', changefreq: 'monthly', priority: 0.6 },
  { path: '/blog/the-owner-s-nephew-chronicles-why-your-2m-security-system-still-misses-everything', changefreq: 'monthly', priority: 0.6 },
]

module.exports = {
  siteUrl: 'https://paulthames.com',
  generateRobotsTxt: true,
  outDir: 'public',
  changefreq: 'weekly',
  priority: 0.7,
  sitemapSize: 7000,
  exclude: ['/admin*', '/api/*', '/_next/*', '/vendor/*', '/yachts', '/yachts/*'],
  // Ensure known pages are always in the sitemap even if next build
  // didn't discover them (Docker builds without DB access)
  additionalPaths: async (config) => {
    return KNOWN_PATHS.map(({ path, changefreq, priority }) => ({
      loc: path,
      changefreq,
      priority,
      lastmod: new Date().toISOString(),
    }))
  },
  transform: async (config, path) => {
    // Check if this path is already covered by additionalPaths
    const knownEntry = KNOWN_PATHS.find((k) => k.path === path)
    if (knownEntry) {
      return {
        loc: path,
        changefreq: knownEntry.changefreq,
        priority: knownEntry.priority,
        lastmod: new Date().toISOString(),
      }
    }

    let priority = 0.7

    if (path.startsWith('/blog/') && path !== '/blog') {
      priority = 0.6
    } else if (path.startsWith('/vendors/') && path !== '/vendors') {
      priority = 0.6
    } else {
      priority = 0.5
    }

    return {
      loc: path,
      changefreq: 'weekly',
      priority,
      lastmod: new Date().toISOString(),
    }
  },
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/', '/_next/', '/scripts/', '/migration-scripts/', '/vendor/'],
      },
      {
        userAgent: 'GPTBot',
        allow: '/',
      },
      {
        userAgent: 'ClaudeBot',
        allow: '/',
      },
      {
        userAgent: 'PerplexityBot',
        allow: '/',
      },
      {
        userAgent: 'Google-Extended',
        allow: '/',
      },
    ],
    additionalSitemaps: [],
  },
}
