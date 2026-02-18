# SEO Action Plan - paulthames.com

**Audit Date:** February 17, 2026
**Current SEO Health Score:** 70/100
**Target SEO Health Score:** 90/100 (after implementation)
**Estimated Time to Complete:** 4-6 weeks

---

## Critical Priority (Fix Immediately - Week 1)

**Impact:** Prevents indexing, causes penalties, or blocks AI search visibility

### 1. Fix Sitemap URL in robots.txt
**Time:** 5 minutes
**Priority:** P0 (Critical)

**Current Issue:**
```txt
Sitemap: https://paulthamessuperyachttechnology.com/sitemap.xml
```

**Action Required:**
Update `public/robots.txt`:
```txt
Sitemap: https://paulthames.com/sitemap.xml
```

**Verification:**
```bash
curl -I https://paulthames.com/sitemap.xml
# Should return 200 OK
```

---

### 2. Implement Canonical Tags Site-Wide
**Time:** 1 hour
**Priority:** P0 (Critical)

**Current Issue:** 13/15 pages missing canonical URLs

**Action Required:**
Update metadata configuration in Next.js layouts:

```typescript
// app/(site)/layout.tsx
export const metadata: Metadata = {
  alternates: {
    canonical: './',
  },
}

// For dynamic pages, use generateMetadata
export async function generateMetadata({ params }): Promise<Metadata> {
  const url = `https://paulthames.com${params.slug}`
  return {
    alternates: {
      canonical: url,
    },
  }
}
```

**Files to Update:**
- `app/(site)/layout.tsx`
- `app/(site)/blog/[slug]/page.tsx`
- `app/(site)/vendors/[slug]/page.tsx`

---

### 3. Add Organization Schema to Homepage
**Time:** 1-2 hours
**Priority:** P0 (Critical)

**Current Issue:** No structured data, blocking rich snippets and AI search

**Action Required:**
Add JSON-LD to homepage:

```typescript
// app/(site)/page.tsx
const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  name: 'Paul Thames',
  description: 'Technical consultancy for superyacht projects and creative lighting solutions',
  url: 'https://paulthames.com',
  logo: 'https://paulthames.com/logo.png',
  contactPoint: {
    '@type': 'ContactPoint',
    email: 'contact@paulthames.com',
    telephone: '+44-20-7123-4567',
    contactType: 'customer service',
  },
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'London',
    addressCountry: 'GB',
  },
  sameAs: [
    'https://linkedin.com/company/paulthames',
    'https://instagram.com/paulthames',
  ],
}

// Add to page
export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      {/* Rest of page */}
    </>
  )
}
```

**Verification:**
Test with Google's Rich Results Test: https://search.google.com/test/rich-results

---

### 4. Create Unique Page Titles
**Time:** 2-3 hours
**Priority:** P0 (Critical)

**Current Issue:** 7 pages share the same title tag

**Action Required:**

| Page | Current Title | Recommended Title |
|------|--------------|------------------|
| Homepage | Paul Thames | Paul Thames \| Technical Consultancy & Creative Lighting |
| Blog | Paul Thames \| Technical Consultancy & Creative Lighting | Blog \| Superyacht Technology Insights from Paul Thames |
| Contact | Paul Thames \| Technical Consultancy & Creative Lighting | Contact Paul Thames \| Superyacht Technical Consultancy |
| Products | Paul Thames \| Technical Consultancy & Creative Lighting | Services & Products \| Paul Thames Superyacht Solutions |
| /custom-lighting | Creative Lighting Solutions \| Paul Thames | Creative Lighting Solutions \| Pixel-Based Fixtures for Superyachts |
| /consultancy/clients | Project Consultancy \| Paul Thames | Project Consultancy \| Technical Advisory for Superyacht Projects |
| /consultancy/suppliers | Vendor Consultancy \| Paul Thames | Vendor Consultancy \| Market Access for Marine Technology |

**Implementation:**
```typescript
// app/(site)/blog/page.tsx
export const metadata: Metadata = {
  title: 'Blog | Superyacht Technology Insights from Paul Thames',
}

// app/(site)/contact/page.tsx
export const metadata: Metadata = {
  title: 'Contact Paul Thames | Superyacht Technical Consultancy',
  description: 'Get in touch with Paul Thames for superyacht technical consultancy and creative lighting solutions.',
}
```

---

### 5. Fix H1 Typo on Homepage
**Time:** 5 minutes
**Priority:** P0 (Critical)

**Current Issue:** "Experience and Expertise,Applied" (missing space)

**Action Required:**
Update H1 text to "Experience and Expertise, Applied"

---

### 6. Add Open Graph Images
**Time:** 2-4 hours
**Priority:** P1 (High - Critical for social sharing)

**Current Issue:** All 15 pages missing og:image

**Action Required:**

**Step 1:** Create OG image (1200x630px)
- Use logo + brand colors
- Save as `/public/og-image.png`

**Step 2:** Update metadata:
```typescript
// app/(site)/layout.tsx
export const metadata: Metadata = {
  openGraph: {
    type: 'website',
    locale: 'en_GB',
    url: 'https://paulthames.com',
    title: 'Paul Thames | Technical Consultancy & Creative Lighting',
    description: 'Technical consultancy for project teams and vendors, plus creative lighting solutions for superyachts and high-end architecture.',
    siteName: 'Paul Thames',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Paul Thames - Technical Consultancy & Creative Lighting',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Paul Thames | Technical Consultancy & Creative Lighting',
    description: 'Technical consultancy for project teams and vendors, plus creative lighting solutions for superyachts and high-end architecture.',
    images: ['/og-image.png'],
  },
}
```

---

## High Priority (Fix Within 1 Week)

**Impact:** Significantly impacts rankings or user experience

### 7. Add Article Schema to Blog Posts
**Time:** 2-3 hours
**Priority:** P1 (High)

**Current Issue:** Blog posts lack Article schema, limiting rich snippets

**Action Required:**
```typescript
// app/(site)/blog/[slug]/page.tsx
export default async function BlogPost({ params }) {
  const post = await getBlogPost(params.slug)

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    image: post.ogImage || '/og-image.png',
    author: {
      '@type': 'Person',
      name: post.author || 'Edwin Edelenbos',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Paul Thames',
      logo: {
        '@type': 'ImageObject',
        url: 'https://paulthames.com/logo.png',
      },
    },
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    description: post.excerpt,
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      {/* Blog post content */}
    </>
  )
}
```

---

### 8. Optimize Hero Image
**Time:** 1 hour
**Priority:** P1 (High)

**Current Issue:** 801 KB hero image affecting LCP

**Action Required:**

**Step 1:** Convert and compress
```bash
# Install squoosh CLI
npm install -g @squoosh/cli

# Compress to WebP (target: < 200 KB)
squoosh-cli public/heroimagePT-min.png \
  --output-dir ./public \
  --format webp \
  --quality 85 \
  --resize 1920 1080
```

**Step 2:** Update to use next/image
```typescript
import Image from 'next/image'

export default function Hero() {
  return (
    <Image
      src="/heroimagePT-min.webp"
      alt="Paul Thames - Technical Consultancy & Creative Lighting"
      width={1920}
      height={1080}
      priority
      placeholder="blur"
      className="hero-image"
    />
  )
}
```

---

### 9. Create Unique Meta Descriptions
**Time:** 1-2 hours
**Priority:** P1 (High)

**Current Issue:** 7 pages share the same description

**Action Required:**

| Page | Recommended Description |
|------|------------------------|
| Blog | Expert insights on superyacht AV/IT systems, security, and custom lighting from industry veterans Edwin Edelenbos and Roel van der Zwet. |
| Contact | Get in touch with Paul Thames for superyacht technical consultancy. Contact us in London at contact@paulthames.com or +44 20 7123 4567. |
| Products | Discover Paul Thames' technical consultancy and creative lighting services for superyachts, including project advisory and custom programming. |
| /custom-lighting | Pixel-based lighting fixtures, custom content creation, and complete programming services for superyachts and high-end architectural projects. |
| /consultancy/clients | Technical clarity for owners, designers, and shipyards at critical decision points. Specification review, creation, and on-demand support. |
| /consultancy/suppliers | Market access and visibility for marine technology manufacturers. Proposition testing, market strategy, and directory listings for superyacht vendors. |

---

### 10. Expand Thin Content Pages
**Time:** 4-8 hours
**Priority:** P1 (High)

**Current Issue:** 7 pages have < 300 words

**Action Required:**

**/contact page (95 words):**
- Add: Office location, hours, team member photos, quick contact options
- Target: 200-300 words

**/products page (95 words):**
- Add: Service descriptions, benefits, process overview
- Target: 300-400 words

**/vendors page (109 words):**
- Add: Directory description, benefits, how to get listed
- Target: 250-350 words

**/yachts page (86 words):**
- Add: Platform features, case studies, client testimonials
- Target: 300-400 words

**/blog listing (270 words):**
- Add: Featured posts, categories, newsletter signup
- Target: 350-450 words

**/custom-lighting (283 words):**
- Add: Portfolio examples, client logos, process timeline
- Target: 400-500 words

**/vendors/channel-28 (178 words):**
- Add: Detailed company info, product specs, testimonials
- Target: 300-400 words

---

### 11. Add Security Headers
**Time:** 1 hour
**Priority:** P1 (High)

**Current Issue:** Missing security headers (X-Content-Type-Options, CSP, etc.)

**Action Required:**
Update `next.config.js`:
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
```

---

### 12. Add Missing Alt Text
**Time:** 30 minutes
**Priority:** P1 (High)

**Current Issue:** 9/47 images missing alt text (19%)

**Action Required:**

**Homepage (1 image):**
- Logo: "Paul Thames - Technical Consultancy & Creative Lighting"

**/vendors/channel-28 (7 images):**
- Use vendor-specific descriptions:
  - "Channel 28 AV system control panel"
  - "Marine-grade radio equipment"
  - "Broadcast system components"

---

### 13. Implement Breadcrumb Navigation
**Time:** 2-3 hours
**Priority:** P1 (High)

**Current Issue:** No visual breadcrumbs or BreadcrumbList schema

**Action Required:**

**Step 1:** Create Breadcrumb component
```typescript
// components/Breadcrumbs.tsx
export function Breadcrumbs({ items }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex items-center space-x-2">
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && <span className="mx-2 text-muted">/</span>}
            {index === items.length - 1 ? (
              <span className="text-muted">{item.label}</span>
            ) : (
              <Link href={item.href}>{item.label}</Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
```

**Step 2:** Add BreadcrumbList schema
```typescript
const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.label,
    item: `https://paulthames.com${item.href}`,
  })),
}
```

---

### 14. Allow AI Crawlers
**Time:** 5 minutes
**Priority:** P1 (High)

**Current Issue:** AI crawlers not explicitly allowed

**Action Required:**
Update `public/robots.txt`:
```txt
User-agent: GPTBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Google-Extended
Allow: /
```

---

## Medium Priority (Fix Within 1 Month)

**Impact:** Optimization opportunity, nice-to-have improvements

### 15. Add Service Schema to Consultancy Pages
**Time:** 2 hours
**Priority:** P2 (Medium)

**Action Required:**
```typescript
// app/(site)/consultancy/clients/page.tsx
const serviceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Technical Project Consultancy',
  provider: {
    '@type': 'Organization',
    name: 'Paul Thames',
  },
  areaServed: 'International',
  description: 'Technical clarity for owners, designers, and shipyards at critical decision points',
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Consultancy Services',
    itemListElement: [
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Specification Review',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Creation Support',
        },
      },
    ],
  },
}
```

---

### 16. Add Person Schema for Founders
**Time:** 2 hours
**Priority:** P2 (Medium)

**Action Required:**
```typescript
// app/(site)/about/page.tsx
const personSchema = [
  {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Edwin Edelenbos',
    jobTitle: 'Co-Founder',
    worksFor: 'Paul Thames',
    knowsAbout: [
      'Superyacht Technology',
      'AV/IT Systems',
      'Marine Electronics',
      'Security Systems',
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Roel van der Zwet',
    jobTitle: 'Co-Founder',
    worksFor: 'Paul Thames',
    knowsAbout: [
      'Commercial Operations',
      'Market Strategy',
      'Vendor Relations',
    ],
  },
]
```

---

### 17. Add FAQ Schema to Service Pages
**Time:** 3 hours
**Priority:** P2 (Medium)

**Action Required:**

**Step 1:** Add FAQ sections to service pages
**Step 2:** Add FAQPage schema
```typescript
const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is technical project consultancy?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Technical project consultancy provides expert guidance...',
      },
    },
    {
      '@type': 'Question',
      name: 'Do you work with new builds or refits?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'We work on both new construction projects and refit...',
      },
    },
  ],
}
```

---

### 18. Create Author Pages
**Time:** 4 hours
**Priority:** P2 (Medium)

**Action Required:**
Create `/about/edwin-edelenbos` and `/about/roel-van-der-zwet` pages with:
- Bio and expertise
- LinkedIn links
- Published articles
- Person schema
- Author-specific blog listing

---

### 19. Add Publication Dates to Blog Posts
**Time:** 2 hours
**Priority:** P2 (Medium)

**Action Required:**
Display and add schema for:
- `datePublished` - Original publication date
- `dateModified` - Last updated date
- Visual display: "Published January 15, 2024 • Updated February 1, 2024"

---

### 20. Implement Proper Caching Strategy
**Time:** 2 hours
**Priority:** P2 (Medium)

**Action Required:**
Update `next.config.js`:
```javascript
async headers() {
  return [
    {
      source: '/:path*.(png|jpg|jpeg|gif|webp|svg)',
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
    {
      source: '/:path*',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=0, must-revalidate',
        },
      ],
    },
  ]
}
```

---

### 21. Add Related Posts to Blog
**Time:** 3 hours
**Priority:** P2 (Medium)

**Action Required:**
Implement related posts section based on:
- Shared tags/categories
- Published date proximity
- Similar content matching

---

### 22. Create llms.txt
**Time:** 1 hour
**Priority:** P2 (Medium)

**Action Required:**
Create `/public/llms.txt`:
```markdown
# Paul Thames - Superyacht Technology

Paul Thames provides technical consultancy and creative lighting solutions for superyacht projects.

## Content Types
- Technical advisory articles
- Case studies and project examples
- Industry analysis and insights
- Vendor profiles and product reviews

## Expertise Areas
- Superyacht AV/IT systems
- Custom lighting design and programming
- Vendor consultancy and market strategy
- Technical project management
- Security system consultancy

## Citation Guidelines
Articles may be cited with attribution to "Paul Thames - Superyacht Technology Consultancy"
```

Update `robots.txt`:
```txt
Sitemap: https://paulthames.com/sitemap.xml
```

Add reference in metadata:
```typescript
export const metadata: Metadata = {
  other: {
    'ai-sitemap': 'https://paulthames.com/llms.txt',
  },
}
```

---

### 23. Optimize Internal Linking
**Time:** 3 hours
**Priority:** P2 (Medium)

**Action Required:**

**Cross-link service pages:**
- Link between /consultancy/clients and /consultancy/suppliers
- Link from custom-lighting to relevant vendors
- Link from blog posts to related service pages

**Add contextual links:**
- Link to about page from service pages
- Link to testimonials from service pages
- Link to contact from all relevant pages

---

### 24. Add Testimonial Schema
**Time:** 2 hours
**Priority:** P2 (Medium)

**Action Required:**
```typescript
const reviewSchema = {
  '@context': 'https://schema.org',
  '@type': 'Review',
  author: {
    '@type': 'Person',
    name: 'Client Name',
  },
  reviewRating: {
    '@type': 'Rating',
    ratingValue: '5',
    bestRating: '5',
  },
  reviewBody: 'Edwin provided exceptional technical guidance...',
  itemReviewed: {
    '@type': 'Service',
    name: 'Technical Consultancy',
  },
}
```

---

## Low Priority (Backlog Items)

**Impact:** Nice-to-have improvements

### 25. Add ItemPage Schema for Vendors
**Time:** 2 hours
**Priority:** P3 (Low)

### 26. Create Video Content
**Time:** 20+ hours (ongoing)
**Priority:** P3 (Low)

### 27. Implement HowTo Schema
**Time:** 4 hours
**Priority:** P3 (Low)

### 28. Add Speakable Schema
**Time:** 2 hours
**Priority:** P3 (Low)

### 29. Create Content Hub/Resource Library
**Time:** 10+ hours
**Priority:** P3 (Low)

### 30. Implement FAQ Chatbot
**Time:** 20+ hours
**Priority:** P3 (Low)

---

## Implementation Timeline

### Week 1 (Critical Fixes)
- ✅ Fix sitemap URL (5 min)
- ✅ Add canonical tags (1 hr)
- ✅ Add Organization schema (2 hr)
- ✅ Create unique titles (3 hr)
- ✅ Fix H1 typo (5 min)
- ✅ Create OG image and add to metadata (4 hr)

**Total: ~10 hours**

### Week 2 (High Priority - Part 1)
- ✅ Add Article schema to blog (3 hr)
- ✅ Optimize hero image (1 hr)
- ✅ Create unique descriptions (2 hr)
- ✅ Add missing alt text (30 min)
- ✅ Allow AI crawlers (5 min)
- ✅ Add security headers (1 hr)

**Total: ~8 hours**

### Week 3 (High Priority - Part 2)
- ✅ Expand thin content (8 hr)
- ✅ Implement breadcrumbs (3 hr)
- ✅ Add internal linking improvements (3 hr)

**Total: ~14 hours**

### Week 4-5 (Medium Priority)
- ✅ Add Service schema (2 hr)
- ✅ Add Person schema (2 hr)
- ✅ Create author pages (4 hr)
- ✅ Add publication dates (2 hr)
- ✅ Implement caching (2 hr)
- ✅ Create llms.txt (1 hr)
- ✅ Add FAQ schema (3 hr)
- ✅ Add testimonial schema (2 hr)

**Total: ~18 hours**

### Week 6+ (Low Priority & Ongoing)
- ⬜ ItemPage schema for vendors
- ⬜ Video content creation
- ⬜ HowTo schema
- ⬜ Content hub development

---

## Success Metrics

### Before Implementation
- SEO Health Score: 70/100
- Pages with Schema: 0/15 (0%)
- Pages with Canonical: 2/15 (13%)
- Pages with Unique Titles: 8/15 (53%)
- Pages with Unique Descriptions: 8/15 (53%)
- Pages with OG Images: 0/15 (0%)

### After Implementation (Target - 6 weeks)
- SEO Health Score: 90/100 (+20 points)
- Pages with Schema: 15/15 (100%)
- Pages with Canonical: 15/15 (100%)
- Pages with Unique Titles: 15/15 (100%)
- Pages with Unique Descriptions: 15/15 (100%)
- Pages with OG Images: 15/15 (100%)

---

## Testing & Verification

### After Each Task
```bash
# Test canonicals
curl -I https://paulthames.com/custom-lighting | grep link

# Test robots.txt
curl https://paulthames.com/robots.txt

# Test sitemap
curl https://paulthames.com/sitemap.xml

# Test schema (use Google Rich Results Test)
# https://search.google.com/test/rich-results
```

### Weekly Checks
1. **Monday:** Google Search Console - Check for errors
2. **Wednesday:** Run Lighthouse audit on key pages
3. **Friday:** Verify schema implementation

### Monthly Audits
1. Full SEO audit (like this report)
2. Competitor analysis
3. Keyword ranking tracking
4. Backlink profile review

---

## Tools & Resources

### Required Tools
- [Google Search Console](https://search.google.com/search-console)
- [Google Rich Results Test](https://search.google.com/test/rich-results)
- [Schema.org Validator](https://validator.schema.org/)
- [Lighthouse](https://pagespeed.web.dev/)
- [Screaming Frog SEO Spider](https://www.screamingfrog.com/seo-spider/)

### Helpful Resources
- [Next.js Metadata Documentation](https://nextjs.org/docs/app/building-your-application/optimizing/metadata)
- [Schema.org Types](https://schema.org/docs/full.html)
- [Google Structured Data Guidelines](https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data)
- [Open Graph Protocol](https://ogp.me/)

---

## Contact & Support

If you need clarification or assistance with any action item:

1. **Technical Implementation Questions:** Review Next.js documentation
2. **Schema Validation:** Use Google Rich Results Test
3. **Priority Questions:** Focus on Critical and High Priority items first

**Next Audit:** Recommended 60 days after completing all Critical and High Priority items

---

**Action Plan Version:** 1.0
**Last Updated:** February 17, 2026
**Next Review:** After completing Week 1 tasks
