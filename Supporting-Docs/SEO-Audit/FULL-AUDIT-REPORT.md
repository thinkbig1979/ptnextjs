# Full SEO Audit Report v3: paulthames.com

**Date:** February 18, 2026
**SEO Health Score:** 84/100 (up from 78 in v2)
**Pages Crawled:** 13
**Business Type:** B2B Niche Consultancy (Superyacht Technology)

---

## Executive Summary

### Score Breakdown

| Category | Score | Weight | Weighted | Change |
|----------|-------|--------|----------|--------|
| Technical SEO | 88/100 | 25% | 22.0 | +3 |
| Content Quality | 72/100 | 25% | 18.0 | +4 |
| On-Page SEO | 83/100 | 20% | 16.6 | +1 |
| Schema / Structured Data | 90/100 | 10% | 9.0 | +2 |
| Performance | 85/100 | 10% | 8.5 | -5 |
| Images | 92/100 | 5% | 4.6 | -3 |
| AI Search Readiness | 88/100 | 5% | 4.4 | +8 |
| **Total** | | | **83.1** | **+5** |

### Improvements Since v2

1. CSP header now present (report-only mode)
2. `llms-full.txt` now exists for AI readiness
3. Vendor detail pages now have Organization schema
4. Blog article schema now has proper Person author (Edwin Edelenbos)
5. Homepage meta description now detectable
6. Testimonials page has Review schema (3 of 10)
7. `X-Powered-By` header removed

### Top 5 Remaining Issues

1. **OG titles have double branding** — renders as "About Us | Paul Thames | Paul Thames" (template + page both include site name)
2. **Products page empty** — 0 products, "No products found" shown to crawlers
3. **Only 2 blog posts** — thin content footprint for thought leadership positioning
4. **Only 1 vendor in directory** — directory appears sparse
5. **No edge caching** — static pages served with no-cache headers

### Top 5 Quick Wins

1. Fix OG title double branding (remove "| Paul Thames" from page-level OG titles, let template add it)
2. Add Review schema to all 10 testimonials (only 3 of 10 have it)
3. Add `SameAs` social profile links to Organization schema
4. Add external hyperlinks to vendor names mentioned in blog posts
5. Promote CSP from report-only to enforcement mode

---

## 1. Technical SEO (88/100)

### 1.1 Crawlability & Indexability

**Sitemap** — PASS
- Runtime-generated via Next.js App Router (`app/sitemap.ts`)
- 13 URLs present, dynamically includes blog posts and vendors from DB
- Proper `lastModified`, `changeFrequency`, and `priority` values
- Referenced in robots.txt

**Robots.txt** — PASS
- Correctly blocks: `/admin/`, `/api/`, `/_next/`, `/scripts/`, `/migration-scripts/`, `/vendor/`
- Explicitly allows AI crawlers: GPTBot, ClaudeBot, PerplexityBot, Google-Extended
- References sitemap
- Includes `Host` directive

**Canonical URLs** — PASS
- All 13 pages have correct self-referencing canonical URLs
- No trailing slash inconsistencies

**HTTPS** — PASS
- HTTP/2 confirmed
- HSTS with `max-age=63072000; preload`

### 1.2 Security Headers

| Header | Present | Value | Status |
|--------|---------|-------|--------|
| Strict-Transport-Security | Yes | `max-age=63072000; preload` | Pass |
| X-Frame-Options | Yes | `SAMEORIGIN` | Pass |
| X-Content-Type-Options | Yes | `nosniff` | Pass |
| Referrer-Policy | Yes | `origin-when-cross-origin` | Pass |
| Permissions-Policy | Yes | `camera=(), microphone=(), geolocation=()` | Pass |
| Content-Security-Policy | Yes | Report-only mode | Improved (was missing in v2) |
| X-Powered-By | No | Removed | Improved (was exposed in v2) |

**Remaining issues:**
- CSP still in report-only mode (not enforcing). Promote when ready.

### 1.3 HTTP Performance

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| Protocol | HTTP/2 | HTTP/2+ | Pass |
| Server | OpenResty | — | Good |
| Font preloading | woff2 via Link header | — | Pass |
| Hero image preloading | WebP via Link header | — | Pass |
| Cache-Control | `private, no-cache, no-store` | `public, s-maxage=3600` | Fail |

### 1.4 Issues

- **Cache-Control prevents edge caching**: All HTML responses use `private, no-cache, no-store, max-age=0, must-revalidate`. For a statically generated site, this means every request hits the origin server. Static pages should use `public, s-maxage=3600, stale-while-revalidate=86400`.
- **No measurable CWV without browser**: Recommend running PageSpeed Insights for real LCP/INP/CLS scores.

---

## 2. Content Quality (72/100)

### 2.1 Word Count by Page

| Page | Words | Status |
|------|-------|--------|
| `/` (homepage) | ~1,500 | Good |
| `/about` | ~1,200 | Good |
| `/custom-lighting` | ~1,300 | Good |
| `/consultancy/clients` | ~1,500 | Good |
| `/consultancy/suppliers` | ~900 | Adequate |
| `/blog` (index) | ~300 | Thin (listing page) |
| Blog post 1 (Pixel Perfect) | ~1,300 | Good |
| Blog post 2 (Owner's Nephew) | ~1,500 | Good |
| `/vendors` | ~200 | Thin (1 vendor listed) |
| `/products` | ~100 | **Fail** (empty, 0 products) |
| `/contact` | ~300 | Acceptable for contact page |
| `/testimonials` | ~800 | Good (10 testimonials) |
| `/vendors/channel-28` | ~400 | Acceptable for vendor profile |

### 2.2 E-E-A-T Assessment

| Factor | Score | Evidence |
|--------|-------|----------|
| Experience | Strong | 18+ years (Edwin), 15+ years (Roel), specific project details |
| Expertise | Strong | MSc TU Delft, MBA UvA, named employer history (Oceanco, YachtCloud) |
| Authoritativeness | Moderate | 10 testimonials from named professionals, but no external citations |
| Trustworthiness | Strong | HTTPS, real names, physical address, phone, detailed credentials |

### 2.3 External Links — ISSUE

**Zero external links in article body content.** Both blog posts mention technology providers by name (Panoblu, Viveur, Imersu, Cydome, NEGU, DZ Technologies, Liiontek) but none are hyperlinked. This is a missed opportunity for:
- E-E-A-T authority signals
- Reader value and verification
- Potential reciprocal linking from vendors

### 2.4 Content Gaps

- **Blog cadence**: 2 posts in ~3 months (Nov 2025, Jan 2026). For B2B thought leadership, 2-4 posts/month is ideal.
- **No case studies**: Project case studies would significantly boost E-E-A-T for a consultancy.
- **Products page empty**: Shows "Showing 0 of 0 products" — actively harms user experience and SEO.
- **Vendor directory sparse**: Only 1 vendor (Channel 28). Consider gating this section until 10+ vendors are available.

---

## 3. On-Page SEO (83/100)

### 3.1 Title Tags

| Page | Title | Length | Status |
|------|-------|--------|--------|
| `/` | Paul Thames \| Technical Consultancy & Creative Lighting | 56 | Good |
| `/about` | About Us \| Paul Thames | 24 | Short |
| `/contact` | Contact Paul Thames \| Superyacht Technical Consultancy | 55 | Good |
| `/custom-lighting` | Creative Lighting Solutions \| Pixel-Based Fixtures for Superyachts | 67 | Good |
| `/consultancy/clients` | Project Consultancy \| Technical Advisory for Superyacht Projects | 64 | Good |
| `/consultancy/suppliers` | Vendor Consultancy \| Market Access for Marine Technology | 56 | Good |
| `/blog` | Blog \| Superyacht Technology Insights from Paul Thames | 53 | Good |
| `/products` | Services & Products \| Paul Thames Superyacht Solutions | 55 | Good |
| `/vendors` | Vendors \| Paul Thames - Superyacht Technology Solutions | 55 | Good |
| `/testimonials` | Testimonials \| What Clients Say About Paul Thames | 50 | Good |
| Blog post 1 | The Pixel Perfect Problem... \| Paul Thames | 89 | Long (truncates) |
| Blog post 2 | The Owner's Nephew Chronicles... \| Paul Thames | 98 | Long (truncates) |

**Issues:**
- `/about` title too short at 24 chars. Suggest: "About Us | Edwin Edelenbos & Roel van der Zwet | Paul Thames"
- Blog post titles exceed 60 chars but core message appears before truncation point

### 3.2 Meta Descriptions

All 13 pages have unique, descriptive meta descriptions between 96-139 characters. No issues.

### 3.3 OpenGraph Tags — MINOR ISSUE (Double Branding)

**Fixed since v2:** All pages now have page-specific OG titles (not falling back to generic site title). However, there is a **double branding** issue where "| Paul Thames" appears twice.

**Examples from rendered HTML:**
- `/about`: `og:title="About Us | Paul Thames | Paul Thames"`
- `/blog`: `og:title="Blog | Superyacht Technology Insights from Paul Thames | Paul Thames"`
- `/contact`: `og:title="Contact Paul Thames | Superyacht Technical Consultancy | Paul Thames"`

**Root cause:** The root layout uses `openGraph.title.template: '%s | Paul Thames'`, but each page's `openGraph.title` already includes "| Paul Thames". The template appends it again.

**Fix:** Remove "| Paul Thames" from each page's `openGraph.title` value, letting the layout template add the suffix once. For pages that already include "Paul Thames" in the descriptive part (e.g., "Superyacht Technology Insights from Paul Thames"), consider setting a shorter OG title.

### 3.4 Heading Structure

All pages have exactly one H1, logical H2/H3 hierarchy, and no heading level skips. No issues.

### 3.5 Internal Linking

- Homepage links to all major sections
- Breadcrumbs on every page (BreadcrumbList schema)
- Consultancy pages cross-link (clients ↔ suppliers)
- Blog posts link back to blog index

**Issue:** `/testimonials` is in the sitemap but not in the main navigation. It is linked from service pages but not prominently discoverable.

---

## 4. Schema / Structured Data (90/100)

### 4.1 Implementation by Page

| Page | Schema Types | Valid? |
|------|-------------|--------|
| `/` | Organization, ProfessionalService | Yes |
| `/about` | Person (x2), BreadcrumbList | Yes |
| `/custom-lighting` | FAQPage, BreadcrumbList | Yes |
| `/consultancy/clients` | Service, FAQPage, BreadcrumbList | Yes |
| `/consultancy/suppliers` | Service, FAQPage, BreadcrumbList | Yes |
| `/blog` | CollectionPage, ItemList, BreadcrumbList | Yes |
| Blog post 1 | Article (author: Edwin Edelenbos), BreadcrumbList | Yes |
| Blog post 2 | Article (author: Edwin Edelenbos), BreadcrumbList | Yes |
| `/contact` | LocalBusiness, BreadcrumbList | Yes |
| `/vendors` | ItemList, BreadcrumbList | Yes |
| `/vendors/channel-28` | Organization, BreadcrumbList | Yes (new in v3) |
| `/testimonials` | Review (x3), BreadcrumbList | Partial |
| `/products` | Service, BreadcrumbList | Yes |

### 4.2 Strengths

- Comprehensive schema across all pages
- FAQPage schema on 3 service pages (eligible for rich results)
- Article schema with correct Person author on blog posts (fixed since v2)
- BreadcrumbList on every page
- Vendor detail pages now have Organization schema (fixed since v2)

### 4.3 Issues

- **Only 3 of 10 testimonials have Review schema**: Add Review markup to all 10 testimonials
- **Missing `SameAs` on Organization schema**: Should include social profile URLs (LinkedIn, Twitter, Instagram)
- **Vendor detail schema uses Paul Thames contact info**: Channel 28's Organization schema lists Paul Thames email/phone instead of Channel 28's own contact details
- **No Organization schema with `SameAs` on homepage**: Adding social links to the Organization schema improves Knowledge Panel presence

---

## 5. Performance (85/100)

### 5.1 Server Performance

- TTFB: All pages under 220ms (excellent, well under 800ms target)
- Server: OpenResty → Next.js
- HTTP/2: Confirmed

### 5.2 Resource Optimization

| Resource | Status | Notes |
|----------|--------|-------|
| Hero image | WebP, preloaded | Excellent |
| Fonts | WOFF2, 1 file, preloaded | Excellent |
| CSS | Inline + bundled | Standard Next.js |
| JS | Next.js bundles | Standard SSG |
| Google Fonts | External dependency | Consider self-hosting |

### 5.3 Issues

- **No edge caching**: `Cache-Control: private, no-cache, no-store` on all HTML responses
- **Google Fonts loaded externally**: Connection to fonts.googleapis.com and fonts.gstatic.com adds latency. Consider self-hosting.
- **No CWV lab data available**: PageSpeed Insights or Lighthouse needed for LCP/INP/CLS

---

## 6. Images (92/100)

### 6.1 Format & Optimization

- Hero and gallery images: WebP format
- Team photos on `/about`: WebP format
- Proper alt text on all content images
- Descriptive, contextual alt text (e.g., "LED pixel lighting in a yacht bar area with DJ booth")

### 6.2 Issues

- **Blog post 2 featured image**: Uses Shutterstock JPG (`Shutterstock_1915446079.jpg`) — convert to WebP
- **SVG icons**: Properly using `aria-hidden="true"` for decorative icons
- **OG image**: `og-image.png` referenced but not verified as existing/optimized at 1200x630

---

## 7. AI Search Readiness (88/100)

### 7.1 AI Crawler Access

| Bot | Access | Status |
|-----|--------|--------|
| GPTBot | Allowed | Pass |
| ClaudeBot | Allowed | Pass |
| PerplexityBot | Allowed | Pass |
| Google-Extended | Allowed | Pass |

### 7.2 AI Content Files

| File | Status | Notes |
|------|--------|-------|
| llms.txt | Present | Good overview of services and personnel |
| llms-full.txt | Present | Comprehensive with contact info and service details (new since v2) |

### 7.3 Citability Assessment

| Factor | Score | Notes |
|--------|-------|-------|
| Clear factual statements | Good | Specific years, credentials, named employers |
| Structured content | Good | Clear headings, logical hierarchy, FAQ schemas |
| Unique expertise claims | Good | Specific niche (superyacht technology), named specialists |
| Contact/verification | Good | Named founders, physical address, phone |
| Content freshness | Medium | Only 2 blog posts, most recent Jan 2026 |
| External citations | Weak | No outbound links to verify vendor claims |

---

## Page-by-Page Summary

| Page | Title | Meta Desc | OG Match | H1 | Schema | Words | Issues |
|------|-------|-----------|----------|-----|--------|-------|--------|
| `/` | Pass | Pass | N/A | Pass | Pass | ~1,500 | Cache headers |
| `/about` | Short | Pass | Fail | Pass | Pass | ~1,200 | Title too short |
| `/contact` | Pass | Pass | Fail | Pass | Pass | ~300 | No contact form |
| `/custom-lighting` | Pass | Pass | Fail | Pass | Pass | ~1,300 | None |
| `/consultancy/clients` | Pass | Pass | Fail | Pass | Pass | ~1,500 | None |
| `/consultancy/suppliers` | Pass | Pass | Fail | Pass | Pass | ~900 | Light content |
| `/blog` | Pass | Pass | Fail | Pass | Pass | ~300 | Only 2 posts |
| Blog post 1 | Long | Pass | Pass | Pass | Pass | ~1,300 | No external links |
| Blog post 2 | Long | Pass | Pass | Pass | Pass | ~1,500 | JPG image, no ext links |
| `/vendors` | Pass | Pass | Pass | Pass | Pass | ~200 | Only 1 vendor |
| `/products` | Pass | Pass | Fail | Pass | Pass | ~100 | **Empty - 0 products** |
| `/testimonials` | Pass | Pass | Fail | Pass | Partial | ~800 | 7/10 missing Review schema |
| `/vendors/channel-28` | Pass | Pass | — | Pass | Pass | ~400 | Wrong contact in schema |

---

*Full Audit Report v3 — Generated February 18, 2026*
*Previous audit: v2, February 18, 2026*
