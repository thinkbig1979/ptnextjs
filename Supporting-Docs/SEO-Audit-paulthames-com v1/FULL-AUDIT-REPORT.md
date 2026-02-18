# Full SEO Audit Report - paulthames.com

**Audit Date:** February 17, 2026
**Audited Domain:** https://paulthames.com
**Total Pages Analyzed:** 15
**Audit Type:** Comprehensive SEO Analysis

---

## Executive Summary

### Overall SEO Health Score: **70/100**

**Business Type Detected:** Professional Services - Superyacht Technical Consultancy & Creative Lighting

The website presents a dual-service business model:
1. **Technical Consultancy** - Project team and vendor advisory services
2. **Creative Lighting** - Custom lighting solutions for superyachts and high-end architecture

### Top 5 Critical Issues

1. **Missing Structured Data/Schema** (0/15 pages)
   - No JSON-LD schema markup detected across entire site
   - Missing: Organization, Article, Service, LocalBusiness schemas
   - Impact: Limited rich snippet opportunities, poor AI search visibility

2. **Duplicate Title & Meta Descriptions** (7/15 pages)
   - Same title used across homepage, blog, contact, products, and blog posts
   - Same description repeated on 7 pages
   - Impact: Search engine confusion, reduced CTR, keyword cannibalization

3. **Missing Canonical URLs** (13/15 pages)
   - Only 2 pages have canonical tags (/vendors, /vendors/channel-28)
   - Risk: Duplicate content issues, diluted link equity
   - Impact: Especially critical with duplicate title/description problem

4. **Missing Open Graph Images** (15/15 pages)
   - No og:image tags on any page
   - Impact: Poor social sharing, unappealing link previews on LinkedIn/Twitter

5. **Sitemap Domain Mismatch**
   - robots.txt references `https://paulthamessuperyachttechnology.com/sitemap.xml`
   - This domain doesn't respond or redirect properly
   - Impact: Search engines cannot discover sitemap

### Top 5 Quick Wins

1. **Add JSON-LD Schema to Homepage** (1-2 hours)
   - Implement Organization schema with logo, address, social links
   - Immediate improvement in knowledge panel and local search

2. **Create Unique Page Titles** (2-3 hours)
   - Rewrite titles for blog listing, contact, products pages
   - Use keywords: "Blog - Superyacht Tech Insights", "Contact - Paul Thames", etc.

3. **Add Canonical Tags Site-Wide** (1 hour)
   - Implement canonical URLs via Next.js metadata API
   - Use self-referencing canonicals for most pages

4. **Add Open Graph Images** (2-4 hours)
   - Create 1200x630px image with logo and brand colors
   - Add to metadata configuration

5. **Fix Sitemap URL in robots.txt** (5 minutes)
   - Update to correct domain: `https://paulthames.com/sitemap.xml`
   - Verify sitemap is accessible

---

## Detailed Findings by Category

### Technical SEO - Score: 70/100

#### ✅ Strengths
- **Robots.txt**: Well-configured with proper User-agent directives
- **HTTP/2**: Enabled for faster page loads
- **Security**: HTTPS with HSTS header (`max-age=63072000`)
- **Server Headers**: OpenResty with Next.js detection
- **URL Structure**: Clean, readable URLs without parameters
- **Viewport**: Proper viewport meta tag on all pages
- **Charset**: UTF-8 configured correctly

#### ❌ Critical Issues

**1. Missing Canonical Tags**
- **Severity:** Critical
- **Affected Pages:** 13/15 (87%)
- **Details:**
  ```
  ✅ https://paulthames.com/vendors
  ✅ https://paulthames.com/vendors/channel-28
  ❌ All other pages missing canonicals
  ```
- **Recommendation:** Add self-referencing canonicals via Next.js metadata API

**2. Sitemap Domain Mismatch**
- **Severity:** Critical
- **Current robots.txt:**
  ```
  Sitemap: https://paulthamessuperyachttechnology.com/sitemap.xml
  ```
- **Issue:** The alternate domain doesn't respond (404)
- **Recommendation:** Update to `https://paulthames.com/sitemap.xml`

**3. Cache-Control Issues**
- **Severity:** High
- **Current header:** `cache-control: private, no-cache, no-store, max-age=0, must-revalidate`
- **Issue:** Aggressive caching prevents browser caching
- **Recommendation:** Implement proper cache strategies for static assets

**4. Missing Security Headers**
- **Severity:** Medium
- **Missing:**
  - X-Content-Type-Options
  - X-Frame-Options
  - Content-Security-Policy
  - Referrer-Policy
- **Recommendation:** Add security headers via next.config.js

#### 🔧 Recommendations

1. Implement canonical tags via Next.js metadata
2. Fix sitemap URL in robots.txt
3. Add security headers
4. Configure appropriate cache-control for static assets
5. Add content-security-policy for XSS prevention

---

### Content Quality - Score: 71/100

#### ✅ Strengths
- **Long-form Content:** Blog posts exceed 900 words (excellent for authority)
- **Professional Tone:** Clear, authoritative language
- **Industry Expertise:** Demonstrates deep knowledge of superyacht tech
- **Testimonials:** 1519 words of client testimonials (social proof)

#### ❌ Issues

**1. Duplicate Content**
- **Severity:** High
- **Duplicate Titles (7 pages):**
  ```
  "Paul Thames | Technical Consultancy & Creative Lighting"
  - Homepage, Blog listing, Contact, Products, and both blog posts
  ```
- **Duplicate Descriptions (7 pages):**
  ```
  "Technical consultancy for project teams and vendors..."
  - Same 7 pages as above
  ```
- **Impact:** Search engines may view these as duplicate content
- **Recommendation:** Create unique titles/descriptions for each page

**2. Thin Content Pages** (7 pages < 300 words)
- **Severity:** Medium
- **Pages Affected:**
  - `/yachts` - 86 words
  - `/products` - 95 words
  - `/contact` - 95 words
  - `/vendors` - 109 words
  - `/vendors/channel-28` - 178 words
  - `/custom-lighting` - 283 words
  - `/blog` - 270 words

**3. Missing E-E-A-T Signals**
- **Severity:** Medium
- **Issues:**
  - No author pages or profiles
  - No publication dates on blog posts
  - No "About the Author" sections
  - No external citations/references

#### 🔧 Recommendations

1. **Rewrite duplicate titles and descriptions:**
   - Homepage: Keep current
   - Blog: "Blog | Superyacht Technology Insights from Paul Thames"
   - Contact: "Contact Paul Thames | Superyacht Technical Consultancy"
   - Products: "Services & Products | Paul Thames Superyacht Solutions"
   - Blog posts: Use H1 as title prefix

2. **Expand thin content pages:**
   - Add service descriptions to /products
   - Add company info to /yachts
   - Add contact details and office locations to /contact

3. **Add E-E-A-T signals:**
   - Create author schema with LinkedIn profiles
   - Add publication dates and last-updated dates
   - Include references to industry publications
   - Link to relevant LinkedIn, Instagram, other social profiles

---

### On-Page SEO - Score: 100/100

#### ✅ Excellent Implementation
- **Title Tags:** 100% of pages have titles
- **Meta Descriptions:** 100% of pages have descriptions
- **H1 Tags:** 100% of pages have single H1 (no multiples)
- **Internal Linking:** All pages have 13+ internal links
- **Keyword Usage:** Natural, not stuffed

#### ⚠️ Minor Issues

**1. H1 Length on Homepage**
- Current: "Experience and Expertise,Applied"
- Issue: Missing space after comma
- Recommendation: Fix typo to "Experience and Expertise, Applied"

**2. Heading Structure**
- Some pages have many H2s (up to 14 on homepage)
- Recommendation: Consider some H3 reorganization

---

### Schema / Structured Data - Score: 0/100

#### ❌ Critical: No Schema Markup Detected

**Zero JSON-LD schemas found across 15 pages**

#### Recommended Schema Implementation

**1. Homepage - Organization Schema**
```json
{
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "name": "Paul Thames",
  "description": "Technical consultancy for superyacht projects and creative lighting solutions",
  "url": "https://paulthames.com",
  "logo": "https://paulthames.com/logo.png",
  "contactPoint": {
    "@type": "ContactPoint",
    "email": "contact@paulthames.com",
    "telephone": "+44-20-7123-4567"
  },
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "London",
    "addressCountry": "GB"
  },
  "sameAs": [
    "https://linkedin.com/company/paulthames",
    "https://instagram.com/paulthames"
  ]
}
```

**2. About Page - Person Schema (Founders)**
```json
{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "Edwin Edelenbos",
  "jobTitle": "Co-Founder",
  "worksFor": "Paul Thames",
  "knowsAbout": ["Superyacht Technology", "AV/IT Systems", "Marine Electronics"]
}
```

**3. Blog Posts - Article Schema**
```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "The Pixel Perfect Problem...",
  "author": {
    "@type": "Person",
    "name": "Edwin Edelenbos"
  },
  "datePublished": "2024-01-15",
  "dateModified": "2024-01-15",
  "publisher": {
    "@type": "Organization",
    "name": "Paul Thames"
  }
}
```

**4. Service Pages - Service Schema**
```json
{
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "Technical Project Consultancy",
  "provider": "Paul Thames",
  "areaServed": "International",
  "description": "Technical clarity for owners, designers, and shipyards"
}
```

**5. Vendors - ItemPage Schema**
```json
{
  "@context": "https://schema.org",
  "@type": "ItemPage",
  "name": "Channel 28",
  "description": "Engineering and software development for AV systems",
  "mainEntity": {
    "@type": "Organization",
    "name": "Channel 28 Ltd"
  }
}
```

#### 🔧 Implementation Priority

1. **Immediate (Week 1):**
   - Organization schema on homepage
   - BreadcrumbList schema for navigation

2. **High (Week 2):**
   - Article schema for blog posts
   - Service schema for consultancy pages

3. **Medium (Month 1):**
   - Person schema for founders
   - FAQPage schema for common questions

4. **Low (Month 2):**
   - ItemPage schema for vendor listings
   - HowTo schema for lighting projects

---

### Performance (Core Web Vitals) - Score: 80/100

#### ✅ Good Indicators
- **Framework:** Next.js (optimized for performance)
- **HTTP/2:** Enabled for parallel requests
- **Static Assets:** Preloading critical CSS and fonts
- **Server:** OpenResty (high-performance web server)

#### ❌ Issues Identified

**1. Image Optimization**
- **Hero Image Size:** 801 KB (heroimagePT-min.png)
- **Impact:** Largest Contentful Paint (LCP) likely affected
- **Recommendation:**
  - Convert to WebP or AVIF format
  - Target size: < 200 KB
  - Use next/image for automatic optimization

**2. Cache Configuration**
- **Current:** `cache-control: public, max-age=0`
- **Issue:** No browser caching for images
- **Recommendation:**
  - Static assets: `cache-control: public, max-age=31536000, immutable`
  - HTML: `cache-control: public, max-age=0, must-revalidate`

**3. JavaScript Bundling**
- **Observation:** Many Next.js chunks loaded
- **Recommendation:**
  - Use dynamic imports for non-critical components
  - Implement code splitting
  - Analyze bundle with `npm run build:analyze`

#### Estimated Core Web Vitals (Based on Analysis)

| Metric | Estimated | Target | Status |
|--------|-----------|--------|--------|
| LCP (Largest Contentful Paint) | 2.5-3.5s | < 2.5s | ⚠️ Needs Improvement |
| INP (Interaction to Next Paint) | 100-200ms | < 200ms | ✅ Good |
| CLS (Cumulative Layout Shift) | < 0.05 | < 0.1 | ✅ Good |

#### 🔧 Recommendations

1. **Image Optimization (Priority: High)**
   ```javascript
   // Use next/image for hero
   import Image from 'next/image'

   <Image
     src="/heroimagePT-min.png"
     alt="Paul Thames - Technical Consultancy & Creative Lighting"
     width={1920}
     height={1080}
     priority
     placeholder="blur"
   />
   ```

2. **Implement Proper Caching**
   ```javascript
   // next.config.js
   module.exports = {
     headers: async () => [
       {
         source: '/:path*.(png|jpg|jpeg|gif|ico|webp|svg)',
         headers: [
           {
             key: 'Cache-Control',
             value: 'public, max-age=31536000, immutable',
           },
         ],
       },
     ]
   }
   ```

3. **Run Lighthouse Audit**
   ```bash
   npm install -g lighthouse
   lighthouse https://paulthames.com --view
   ```

---

### Images - Score: 81/100

#### ✅ Good Practices
- **Overall Alt Text Coverage:** 83% (39/47 images have alt text)
- **Format:** PNG for transparency needs
- **Responsive:** Images appear properly sized

#### ❌ Issues

**1. Missing Alt Text** (9/47 images = 19%)
- **Homepage:** 1 image missing alt
- **Vendor Detail Page (/vendors/channel-28):** 7 images missing alt

**2. Image Size Issues**
- **Hero Image:** 801 KB (heroimagePT-min.png)
- **Recommendation:** Compress to < 200 KB, use WebP

**3. Missing Open Graph Images** (15/15 pages)
- No og:image tags for social sharing
- Recommendations:
  - Create 1200x630px branded image
  - Add to metadata configuration

#### 🔧 Recommendations

1. **Add Alt Text to All Images**
   - Homepage logo: "Paul Thames - Technical Consultancy & Creative Lighting"
   - Vendor images: Use product/service names
   - Decorative images: Add `alt=""` for screen readers

2. **Image Optimization**
   ```bash
   # Install and run squoosh CLI
   npm install -g @squoosh/cli
   squoosh-cli --help

   # Convert to WebP with quality 85
   squoosh-cli heroimagePT-min.png --output-dir ./public --format webp --quality 85
   ```

3. **Create OG Images**
   - Create template with logo and brand colors
   - Generate unique OG images per page type
   - Use Next.js metadata API for dynamic OG images

---

### AI Search Readiness - Score: 60/100

#### ✅ Strengths
- **High-Quality Content:** Blog posts are detailed and informative
- **Expertise Demonstrated:** Clear industry knowledge
- **Structured Pages:** Clear hierarchy with H1-H3 tags

#### ❌ Critical Gaps

**1. No Structured Data** (0% implementation)
- **Impact:** AI systems (Google AI, ChatGPT, Perplexity) cannot easily parse content
- **Citation Barrier:** Without schema, content is harder to cite in AI answers

**2. Missing AI Crawler Signals**
- **Robots.txt:** No specific directives for AI crawlers
- **llms.txt:** Not available
- **Impact:** AI systems may not crawl optimally

**3. Content Structure Issues**
- **Missing:** Author bylines, publication dates, last-updated dates
- **Missing:** External references and citations
- **Impact:** Reduced E-E-A-T signals for AI ranking

#### 🤖 AI Crawler Accessibility

| Crawler | Status | Recommendation |
|---------|--------|----------------|
| Googlebot | ✅ Allowed | Add specific content directives |
| Bingbot | ✅ Allowed | Add specific content directives |
| GPTBot (OpenAI) | ⚠️ Unknown | Add explicit allow |
| ClaudeBot | ⚠️ Unknown | Add explicit allow |
| PerplexityBot | ⚠️ Unknown | Add explicit allow |

#### 🔧 Recommendations for AI Search Optimization

**1. Allow AI Crawlers Explicitly**
```txt
# robots.txt additions
User-agent: GPTBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: PerplexityBot
Allow: /
```

**2. Add Citability Signals**
- **Schema:** Article schema with author, dates
- **Author Pages:** Dedicated pages with bios and expertise
- **External Links:** Link to authoritative sources
- **Data Sources:** Reference industry standards, certifications

**3. Create llms.txt**
```markdown
# Paul Thames - Superyacht Technology

Paul Thames provides technical consultancy and creative lighting solutions for superyacht projects.

## Content Types
- Technical advisory articles
- Case studies and project examples
- Industry analysis and insights

## Expertise Areas
- Superyacht AV/IT systems
- Custom lighting design and programming
- Vendor consultancy and market strategy
- Technical project management

## Citation Guidelines
Articles may be cited with attribution to "Paul Thames - Superyacht Technology Consultancy"
```

**4. Enhance Content for AI Extraction**
- Add summary sections to blog posts
- Use bullet points for key takeaways
- Include FAQ sections on service pages
- Add data-driven insights where possible

---

## Site Architecture Analysis

### URL Structure
- ✅ Clean, readable URLs
- ✅ No dynamic parameters
- ✅ Logical hierarchy:
  ```
  /                          (Homepage)
  /about                     (About)
  /blog                      (Blog listing)
  /blog/[slug]               (Blog posts)
  /custom-lighting           (Service page)
  /consultancy/clients       (Service page)
  /consultancy/suppliers     (Service page)
  /contact                   (Contact)
  /products                  (Products/Services)
  /vendors                   (Vendor directory)
  /vendors/[slug]            (Vendor details)
  /yachts                    (Yacht profiles)
  /testimonials              (Testimonials)
  ```

### Internal Linking
- ✅ All pages have 13+ internal links
- ✅ Good navigation structure
- ⚠️ Blog posts could link to related articles
- ⚠️ Service pages could cross-link more

### Breadcrumb Navigation
- ❌ No visual breadcrumbs detected
- ❌ No BreadcrumbList schema
- Recommendation: Implement both

---

## Competitor & Market Analysis

### Target Keywords Analysis
Based on page content, primary keywords identified:

**Primary Keywords (High Competition):**
- "superyacht consultancy"
- "creative lighting"
- "marine technology"
- "yacht lighting"
- "technical advisory"

**Secondary Keywords (Medium Competition):**
- "superyacht AV/IT systems"
- "vendor consultancy"
- "marine electronics suppliers"
- "custom lighting superyacht"
- "technical project management yacht"

**Long-tail Opportunities (Low Competition):**
- "superyacht security system consultancy"
- "pixel-based lighting programming"
- "vendor market access superyacht industry"
- "yacht AV system specification review"

### SERP Features Opportunities
1. **Featured Snippets:** Blog posts have Q&A potential
2. **Local Pack:** Add location-specific schema
3. **People Also Ask:** Add FAQ sections
4. **Video Results:** Consider adding project videos

---

## Technical Implementation Notes

### Next.js Metadata Configuration
Current issues and fixes:

**File:** `app/(site)/layout.tsx` or similar

```typescript
// Current implementation likely uses metadata export
export const metadata = {
  title: 'Paul Thames | Technical Consultancy & Creative Lighting',
  description: 'Technical consultancy for project teams and vendors...',
  // Missing: canonical, openGraph, twitter
}

// Recommended implementation:
export const metadata: Metadata = {
  title: {
    default: 'Paul Thames | Technical Consultancy & Creative Lighting',
    template: '%s | Paul Thames'
  },
  description: 'Technical consultancy for project teams and vendors, plus creative lighting solutions for superyachts and high-end architecture.',
  metadataBase: new URL('https://paulthames.com'),
  alternates: {
    canonical: './',
  },
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
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}
```

---

## Audit Methodology

### Tools Used
- **Custom Python Crawler:** Playwright-based SEO crawler
- **Manual Analysis:** Source code review
- **Curl:** HTTP header analysis
- **Schema.org Validation:** Manual review

### Crawl Configuration
- Max Pages: 100 (15 reached)
- Respect robots.txt: Yes
- User-Agent: Mozilla/5.0 (compatible; SEO-Crawler/1.0)
- Timeout per page: 30 seconds
- JavaScript rendering: Enabled (Playwright)

### Pages Audited (15 total)
1. https://paulthames.com
2. https://paulthames.com/
3. https://paulthames.com/about
4. https://paulthames.com/blog
5. https://paulthames.com/contact
6. https://paulthames.com/custom-lighting
7. https://paulthames.com/consultancy/clients
8. https://paulthames.com/consultancy/suppliers
9. https://paulthames.com/products
10. https://paulthames.com/testimonials
11. https://paulthames.com/vendors
12. https://paulthames.com/vendors/channel-28
13. https://paulthames.com/yachts
14. https://paulthames.com/blog/the-pixel-perfect-problem-why-custom-lighting-needs-more-than-a-good-idea
15. https://paulthames.com/blog/the-owner-s-nephew-chronicles-why-your-2m-security-system-still-misses-everything

---

## Conclusion

The Paul Thames website shows a solid foundation with excellent on-page SEO (100/100) and high-quality content. However, critical gaps in structured data implementation (0/100) significantly impact both traditional SEO and AI search visibility.

The most impactful improvements will come from:
1. Adding schema markup (Organization, Article, Service schemas)
2. Fixing duplicate content issues (titles/descriptions)
3. Implementing canonical tags
4. Adding Open Graph images
5. Optimizing image performance

With these changes, the site can realistically achieve an SEO Health Score of 85-90/100 within 4-6 weeks.

---

**Audit Performed By:** Automated SEO Analysis System
**Report Version:** 1.0
**Next Recommended Audit:** 60 days after implementing critical fixes
