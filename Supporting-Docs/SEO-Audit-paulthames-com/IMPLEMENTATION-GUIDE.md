# SEO Implementation Guide

This guide explains how to use `next-seo` and `next-sitemap` to implement the SEO audit recommendations.

## Installation Complete ✅

**Packages installed:**
- `next-seo@^7.2.0`
- `next-sitemap@^4.2.3`

**Configuration files created:**
- `next-sitemap.config.js` - Sitemap & robots.txt generation
- `lib/seo-config.ts` - SEO configuration utilities
- `components/seo/JsonLd.tsx` - Schema component

**Scripts added to package.json:**
- `postbuild: next-sitemap` - Auto-generates sitemap after build

---

## How to Use

### 1. Sitemap Generation (Automatic)

The sitemap is now automatically generated after every build.

```bash
npm run build
# or
npm run postbuild
```

**Output files:**
- `public/sitemap.xml` - XML sitemap
- `public/robots.txt` - Robots file with AI crawler permissions

**Configuration:** Edit `next-sitemap.config.js` to adjust priorities and URLs.

---

### 2. Using Next-SEO for Meta Tags

#### Basic Usage (Homepage)

```typescript
// app/(site)/page.tsx
import { NextSeo } from 'next-seo'
import { SITE_CONFIG } from '@/lib/seo-config'

export default function HomePage() {
  return (
    <>
      <NextSeo
        title={SITE_CONFIG.title}
        description={SITE_CONFIG.description}
        canonical={SITE_CONFIG.url}
        openGraph={{
          url: SITE_CONFIG.url,
          title: SITE_CONFIG.title,
          description: SITE_CONFIG.description,
          images: [
            {
              url: `${SITE_CONFIG.url}${SITE_CONFIG.ogImage}`,
              width: 1200,
              height: 630,
              alt: SITE_CONFIG.title,
            },
          ],
          siteName: SITE_CONFIG.name,
          type: 'website',
        }}
        twitter={{
          handle: SITE_CONFIG.twitter,
          site: SITE_CONFIG.twitter,
          cardType: 'summary_large_image',
        }}
      />
      {/* page content */}
    </>
  )
}
```

#### Blog Post Example

```typescript
// app/(site)/blog/[slug]/page.tsx
import { NextSeo, ArticleJsonLd } from 'next-seo'
import { getArticleSchema } from '@/lib/seo-config'

export default async function BlogPost({ params }) {
  const post = await getBlogPost(params.slug)

  return (
    <>
      <NextSeo
        title={post.title}
        description={post.excerpt}
        canonical={`${SITE_CONFIG.url}/blog/${params.slug}`}
        openGraph={{
          type: 'article',
          url: `${SITE_CONFIG.url}/blog/${params.slug}`,
          title: post.title,
          description: post.excerpt,
          images: [
            {
              url: post.ogImage || `${SITE_CONFIG.url}/og-image.png`,
              width: 1200,
              height: 630,
              alt: post.title,
            },
          ],
          article: {
            publishedTime: post.publishedAt,
            modifiedTime: post.updatedAt,
            authors: [post.author || 'Edwin Edelenbos'],
          },
        }}
      />
      <ArticleJsonLd
        url={`${SITE_CONFIG.url}/blog/${params.slug}`}
        title={post.title}
        images={[post.ogImage || `${SITE_CONFIG.url}/og-image.png`]}
        datePublished={post.publishedAt}
        dateModified={post.updatedAt}
        authorName={post.author || 'Edwin Edelenbos'}
        publisherName={SITE_CONFIG.name}
        publisherLogo={`${SITE_CONFIG.url}/logo.png`}
        description={post.excerpt}
      />
      {/* blog post content */}
    </>
  )
}
```

---

### 3. Adding Schema Markup

#### Organization Schema (Homepage)

```typescript
// app/(site)/page.tsx
import JsonLd from '@/components/seo/JsonLd'
import { ORGANIZATION_SCHEMA } from '@/lib/seo-config'

export default function HomePage() {
  return (
    <>
      <NextSeo {...} />
      <JsonLd data={ORGANIZATION_SCHEMA} />
      {/* page content */}
    </>
  )
}
```

#### Person Schema (About Page)

```typescript
// app/(site)/about/page.tsx
import JsonLd from '@/components/seo/JsonLd'
import { PERSON_SCHEMAS } from '@/lib/seo-config'

export default function AboutPage() {
  return (
    <>
      <NextSeo
        title={PAGE_TITLES.about}
        description={PAGE_DESCRIPTIONS.about}
      />
      <JsonLd data={PERSON_SCHEMAS.edwin} />
      <JsonLd data={PERSON_SCHEMAS.roel} />
      {/* about page content */}
    </>
  )
}
```

#### Service Schema (Consultancy Pages)

```typescript
// app/(site)/consultancy/clients/page.tsx
import JsonLd from '@/components/seo/JsonLd'
import { getServiceSchema, PAGE_TITLES, PAGE_DESCRIPTIONS } from '@/lib/seo-config'

export default function ConsultancyClientsPage() {
  const serviceSchema = getServiceSchema({
    name: 'Technical Project Consultancy',
    description: PAGE_DESCRIPTIONS.consultancyClients,
  })

  return (
    <>
      <NextSeo
        title={PAGE_TITLES.consultancyClients}
        description={PAGE_DESCRIPTIONS.consultancyClients}
      />
      <JsonLd data={serviceSchema} />
      {/* page content */}
    </>
  )
}
```

#### FAQ Schema

```typescript
// app/(site)/contact/page.tsx
import JsonLd from '@/components/seo/JsonLd'
import { getFAQSchema } from '@/lib/seo-config'

export default function ContactPage() {
  const faqs = [
    {
      question: 'What is technical project consultancy?',
      answer: 'Technical project consultancy provides expert guidance...',
    },
    {
      question: 'Do you work with new builds or refits?',
      answer: 'We work on both new construction projects and refit...',
    },
  ]

  return (
    <>
      <NextSeo
        title={PAGE_TITLES.contact}
        description={PAGE_DESCRIPTIONS.contact}
      />
      <JsonLd data={getFAQSchema(faqs)} />
      {/* page content with FAQ section */}
      <section className="faq-section">
        <h2>Frequently Asked Questions</h2>
        {faqs.map((faq, i) => (
          <div key={i}>
            <h3>{faq.question}</h3>
            <p>{faq.answer}</p>
          </div>
        ))}
      </section>
    </>
  )
}
```

---

## Quick Migration Checklist

### Week 1 - Critical Fixes (~10 hours)

- [ ] **Fix sitemap URL** - Done! (automated with next-sitemap)
- [ ] **Add canonical tags** - Use NextSeo `canonical` prop
- [ ] **Add Organization schema** - Use `ORGANIZATION_SCHEMA`
- [ ] **Create unique titles** - Use `PAGE_TITLES` config
- [ ] **Create OG image** - Design 1200x630px image, add to `/public/og-image.png`
- [ ] **Fix H1 typo** - Manual edit

### Week 2 - High Priority (~8 hours)

- [ ] **Add Article schema** - Use `getArticleSchema()` helper
- [ ] **Optimize hero image** - Use next/image (already installed)
- [ ] **Create unique descriptions** - Use `PAGE_DESCRIPTIONS` config
- [ ] **Add missing alt text** - Manual to image tags
- [ ] **Allow AI crawlers** - Done! (in next-sitemap.config.js)
- [ ] **Add security headers** - Add to next.config.js

---

## Testing Your SEO Implementation

### 1. Test Sitemap
```bash
npm run build

# Check generated files
cat public/sitemap.xml
cat public/robots.txt

# Test accessibility
curl -I https://paulthames.com/sitemap.xml
curl -I https://paulthames.com/robots.txt
```

### 2. Test Schema Markup
Use Google's Rich Results Test: https://search.google.com/test/rich-results

Enter your page URL and verify schema is detected.

### 3. Test Meta Tags
Use a meta tag checker: https://metatags.io/

### 4. Lighthouse Audit
```bash
npm install -g lighthouse
lighthouse https://paulthames.com --view
```

---

## Configuration Reference

### `lib/seo-config.ts` Exports

- `SITE_CONFIG` - Base site information
- `PAGE_TITLES` - Pre-defined titles for all pages
- `PAGE_DESCRIPTIONS` - Pre-defined descriptions for all pages
- `ORGANIZATION_SCHEMA` - Organization JSON-LD
- `PERSON_SCHEMAS` - Founder profiles
- `getArticleSchema()` - Helper for blog posts
- `getServiceSchema()` - Helper for service pages
- `getFAQSchema()` - Helper for FAQ sections
- `getReviewSchema()` - Helper for testimonials
- `getBreadcrumbSchema()` - Helper for navigation

### `next-sitemap.config.js` Options

- `siteUrl` - Base URL
- `generateRobotsTxt` - Auto-generate robots.txt
- `transform()` - Function to customize each URL entry
- `robotsTxtOptions.policies` - Allow/disallow rules
- `exclude` - Paths to exclude from sitemap

---

## Common Patterns

### Using Page-Specific SEO

```typescript
import { NextSeo } from 'next-seo'
import { PAGE_TITLES, PAGE_DESCRIPTIONS } from '@/lib/seo-config'

export const metadata = {
  title: PAGE_TITLES.customLighting,
  description: PAGE_DESCRIPTIONS.customLighting,
}

export default function Page() {
  return (
    <>
      <NextSeo
        title={PAGE_TITLES.customLighting}
        description={PAGE_DESCRIPTIONS.customLighting}
        canonical="https://paulthames.com/custom-lighting"
      />
      {/* content */}
    </>
  )
}
```

### Dynamic SEO with Payload CMS

```typescript
import { NextSeo, ArticleJsonLd } from 'next-seo'
import { getArticleSchema, SITE_CONFIG } from '@/lib/seo-config'

export default async function DynamicPage({ params }) {
  const page = await getPayloadPage(params.slug)

  return (
    <>
      <NextSeo
        title={page.title}
        description={page.excerpt}
        canonical={`${SITE_CONFIG.url}/${params.slug}`}
        openGraph={{
          type: page.type === 'blog' ? 'article' : 'website',
          title: page.title,
          description: page.excerpt,
          images: page.image
            ? [{ url: page.image, width: 1200, height: 630, alt: page.title }]
            : undefined,
        }}
      />
      {page.type === 'blog' && (
        <ArticleJsonLd
          url={`${SITE_CONFIG.url}/${params.slug}`}
          title={page.title}
          datePublished={page.createdAt}
          dateModified={page.updatedAt}
          authorName={page.author}
          publisherName={SITE_CONFIG.name}
          publisherLogo={`${SITE_CONFIG.url}/logo.png`}
        />
      )}
      {/* content */}
    </>
  )
}
```

---

## Next Steps

1. **Create OG Image** - Design and add `/public/og-image.png` (1200x630px)
2. **Add Logo** - Ensure `/public/logo.png` exists for schema
3. **Implement NextSeo** - Add to layouts or individual pages
4. **Add Schema** - Use JsonLd component for structured data
5. **Test** - Run build and verify sitemap/schema

---

## Resources

- [Next-SEO Documentation](https://github.com/garmeeh/next-seo)
- [Next-Sitemap Documentation](https://github.com/iamvishnusankar/next-sitemap)
- [Schema.org](https://schema.org/)
- [Google Rich Results Test](https://search.google.com/test/rich-results)
