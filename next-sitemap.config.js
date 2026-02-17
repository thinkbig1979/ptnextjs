/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://paulthames.com',
  generateRobotsTxt: true,
  outDir: 'public',
  changefreq: 'weekly',
  priority: 0.7,
  sitemapSize: 7000,
  exclude: ['/admin*', '/api/*', '/_next/*', '/vendor/*'],
  transform: async (config, path) => {
    let priority = 0.7

    if (path === '/') {
      return {
        loc: path,
        changefreq: 'daily',
        priority: 1,
        lastmod: new Date().toISOString(),
      }
    }

    if (['/about', '/contact', '/blog', '/vendors', '/products'].includes(path)) {
      priority = 0.9
    } else if (path.startsWith('/consultancy/') || path === '/custom-lighting' || path === '/testimonials' || path === '/yachts') {
      priority = 0.8
    } else if (path.startsWith('/blog/') && path !== '/blog') {
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
