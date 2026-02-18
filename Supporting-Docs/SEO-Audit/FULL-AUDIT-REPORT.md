# Full SEO Audit Report v2: paulthames.com

**Date:** February 18, 2026
**SEO Health Score:** 78/100
**Pages Crawled:** 13
**Business Type:** B2B Niche Consultancy (Superyacht Technology)

---

## 1. Technical SEO (Score: 85/100)

### 1.1 Crawlability & Indexability

**Sitemap** - PASS
- Runtime-generated via Next.js App Router (`app/sitemap.ts`)
- 13 URLs present, dynamically includes blog posts and vendors from DB
- Proper `lastModified`, `changeFrequency`, and `priority` values
- Referenced in robots.txt

**Robots.txt** - PASS
- Correctly blocks: `/admin/`, `/api/`, `/_next/`, `/scripts/`, `/migration-scripts/`, `/vendor/`
- Explicitly allows AI crawlers: GPTBot, ClaudeBot, PerplexityBot, Google-Extended
- References sitemap
- Includes `Host` directive

**Canonical URLs** - PASS
- All 13 pages have correct canonical URLs
- No trailing slash inconsistencies detected

**Redirects** - PASS
- `/yachts` → `/` (307 Temporary Redirect) — working correctly
- No redirect chains detected

**Issues:**
- None critical

### 1.2 Security Headers

| Header | Present | Value |
|--------|---------|-------|
| Strict-Transport-Security | Yes | `max-age=63072000; includeSubDomains; preload` |
| X-Frame-Options | Yes | `SAMEORIGIN` |
| X-Content-Type-Options | Yes | `nosniff` |
| Referrer-Policy | Yes | `origin-when-cross-origin` |
| Permissions-Policy | Yes | `camera=(), microphone=(), geolocation=()` |
| Content-Security-Policy | No | Missing |
| X-Powered-By | Yes | `Next.js` (consider removing) |

**Issues:**
- `X-Powered-By: Next.js` exposed — minor fingerprinting risk
- HSTS header appears twice (app + reverse proxy) — cosmetic, not harmful
- No Content-Security-Policy header

### 1.3 HTTP Performance

| Page | TTFB | Status |
|------|------|--------|
| `/` | 0.215s | 200 |
| `/about` | 0.159s | 200 |
| `/blog` | 0.157s | 200 |
| `/contact` | 0.182s | 200 |
| `/sitemap.xml` | 0.144s | 200 |
| `/yachts` | 0.157s | 307 |

All pages well under the 0.8s TTFB target. Excellent server performance.

**Cache Headers:**
- HTML pages: `private, no-cache, no-store, max-age=0, must-revalidate`
- This is typical for dynamic SSR but means no edge caching
- Font and hero image are preloaded via `Link` header

---

## 2. Content Quality (Score: 68/100)

### 2.1 Word Count by Page

| Page | Words | Status |
|------|-------|--------|
| `/` (homepage) | ~3,000 | Excellent |
| `/about` | ~1,200 | Good |
| `/blog` | ~3,200 | Excellent (full articles rendered) |
| `/contact` | ~300 | Acceptable (contact page) |
| `/custom-lighting` | ~1,200 | Good |
| `/consultancy/clients` | ~1,200 | Good |
| `/consultancy/suppliers` | ~1,200 | Good |
| `/products` | **~250** | **Thin** |
| `/vendors` | ~280 | Borderline (directory page) |
| `/testimonials` | ~2,800 | Excellent |
| Blog post 1 (Pixel Perfect) | ~1,700 | Good |
| Blog post 2 (Owner's Nephew) | ~1,800 | Good |
| `/vendors/channel-28` | ~380 | Acceptable (vendor profile) |

### 2.2 Thin Content Pages

| Page | Words | Recommendation |
|------|-------|---------------|
| `/products` | ~250 | Expand to 600+ words — add service descriptions, process steps |
| `/vendors` | ~280 | Acceptable as a directory listing page, will grow with vendors |

### 2.3 External Links

**Finding: Zero external links in article body content.**

Both blog posts mention technology providers by name (Panoblu, Viveur, Imersu, Cydome, NEGU, DZ Technologies, Liiontek) but none are hyperlinked. This is a missed opportunity for:
- E-E-A-T authority signals
- Reader value
- Potential reciprocal linking

Only external links on the site are social media profiles in the footer (Twitter, LinkedIn, Instagram).

### 2.4 E-E-A-T Assessment

| Factor | Score | Evidence |
|--------|-------|----------|
| Experience | Strong | Specific project details, real scenarios, 18+ and 15+ years cited |
| Expertise | Strong | Technical depth in blog posts, specific technology knowledge |
| Authoritativeness | Moderate | No external citations, no backlink signals visible |
| Trustworthiness | Strong | HTTPS, real names, testimonials with project details |

### 2.5 Blog Content

- 2 published articles — well-written, technically credible, good length
- Blog listing page renders full article content (unusual but not harmful)
- Publication cadence: Nov 2025, Jan 2026 — roughly bi-monthly

---

## 3. On-Page SEO (Score: 82/100)

### 3.1 Title Tags

| Page | Title | Unique? | Length |
|------|-------|---------|--------|
| `/` | Paul Thames \| Technical Consultancy & Creative Lighting | Yes | 56 chars |
| `/about` | About Us \| Paul Thames | Yes | 23 chars |
| `/blog` | Blog \| Superyacht Technology Insights from Paul Thames | Yes | 55 chars |
| `/contact` | Contact Paul Thames \| Superyacht Technical Consultancy | Yes | 55 chars |
| `/custom-lighting` | Creative Lighting Solutions \| Pixel-Based Fixtures for Superyachts | Yes | 67 chars |
| `/consultancy/clients` | Project Consultancy \| Technical Advisory for Superyacht Projects | Yes | 64 chars |
| `/consultancy/suppliers` | Vendor Consultancy \| Market Access for Marine Technology | Yes | 56 chars |
| `/products` | Services & Products \| Paul Thames Superyacht Solutions | Yes | 55 chars |
| `/vendors` | Vendors \| Paul Thames - Superyacht Technology Solutions | Yes | 55 chars |
| `/testimonials` | Testimonials \| What Clients Say About Paul Thames | Yes | 50 chars |
| Blog post 1 | The Pixel Perfect Problem: Why Custom Lighting Needs More Than a Good Idea \| Paul Thames | Yes | 89 chars |
| Blog post 2 | The Owner's Nephew Chronicles: Why Your €2M Security System Still Misses Everything \| Paul Thames | Yes | 98 chars |

All titles unique and descriptive. Blog post titles are slightly long (89-98 chars vs. recommended 60) but the core message appears before truncation.

### 3.2 Meta Descriptions

| Page | Has Description? | Quality |
|------|-----------------|---------|
| `/` | Not detected in crawl | May be SSR-injected |
| `/about` | Yes | Good — names, years, specifics |
| `/blog` | Yes | Good — expertise, names |
| `/contact` | Yes | Good — services listed |
| `/custom-lighting` | Yes | Good — specific offerings |
| `/consultancy/clients` | Yes | Excellent — clear value prop |
| `/consultancy/suppliers` | Yes | Excellent — clear audience |
| `/products` | Yes | Good |
| `/vendors` | Yes | Good |
| `/testimonials` | Yes | Good — mentions names |
| Blog posts | Yes | Good — article excerpts |

### 3.3 OpenGraph Tags — ISSUE

**Most pages have mismatched OG titles.** The OG title falls back to the generic site title instead of the page-specific title.

| Page | Page Title | OG Title | Match? |
|------|-----------|----------|--------|
| `/about` | About Us \| Paul Thames | Paul Thames \| Technical Consultancy & Creative Lighting | No |
| `/blog` | Blog \| Superyacht... | Paul Thames \| Technical Consultancy & Creative Lighting | No |
| `/contact` | Contact Paul Thames... | Paul Thames \| Technical Consultancy & Creative Lighting | No |
| `/custom-lighting` | Creative Lighting... | Paul Thames \| Technical Consultancy & Creative Lighting | No |
| `/consultancy/clients` | Project Consultancy... | Paul Thames \| Technical Consultancy & Creative Lighting | No |
| `/consultancy/suppliers` | Vendor Consultancy... | Paul Thames \| Technical Consultancy & Creative Lighting | No |
| `/products` | Services & Products... | Paul Thames \| Technical Consultancy & Creative Lighting | No |
| `/testimonials` | Testimonials... | Paul Thames \| Technical Consultancy & Creative Lighting | No |
| `/vendors` | Vendors \| Paul Thames... | Vendors \| Paul Thames... | **Yes** |
| Blog post 1 | The Pixel Perfect... | The Pixel Perfect... | **Yes** |
| Blog post 2 | The Owner's Nephew... | The Owner's Nephew... | **Yes** |

**Root cause:** Pages using static `metadata` exports inherit OG tags from the root layout. Only pages with `generateMetadata` (blog posts, vendors) have correct OG titles.

### 3.4 Heading Structure

All pages have:
- Exactly one H1
- Logical H2/H3 hierarchy
- No heading level skips detected

### 3.5 Internal Linking

- Homepage links to all major sections
- Blog posts link back to blog listing
- Breadcrumbs on all pages
- Consultancy pages cross-link (clients ↔ suppliers)
- Vendor directory links to vendor detail pages

No orphan pages detected (all pages in sitemap are reachable from navigation).

---

## 4. Schema & Structured Data (Score: 88/100)

### 4.1 Schema Implementation by Page

| Page | Schema Types | Valid? |
|------|-------------|--------|
| `/` | ProfessionalService | Yes |
| `/about` | Person (x2), BreadcrumbList | Yes |
| `/blog` | BreadcrumbList | Yes |
| `/contact` | BreadcrumbList | Yes |
| `/custom-lighting` | FAQPage, BreadcrumbList | Yes |
| `/consultancy/clients` | Service, FAQPage, BreadcrumbList | Yes |
| `/consultancy/suppliers` | Service, FAQPage, BreadcrumbList | Yes |
| `/products` | BreadcrumbList | Yes |
| `/vendors` | BreadcrumbList | Yes |
| `/testimonials` | Review (x3), BreadcrumbList | Yes |
| Blog posts | Article, BreadcrumbList | Yes |
| `/vendors/channel-28` | **None** | **Missing** |

### 4.2 Issues

- **Vendor detail pages lack schema** — should have Organization or LocalBusiness markup
- **Article schema author field** — Post 1 has empty author, Post 2 has `admin@paulthames.com` (should be a person name)
- **No Organization schema** on homepage — ProfessionalService is present but a complementary Organization schema could improve knowledge graph presence

---

## 5. Performance (Score: 90/100)

### 5.1 Server Performance
- All pages: TTFB under 220ms (target: <800ms) — Excellent
- Server: OpenResty reverse proxy → Next.js

### 5.2 Resource Optimization
- Hero image: WebP format (optimized from 801KB → 77KB)
- Font: WOFF2, preloaded via Link header
- Hero image: preloaded via Link header
- Next.js standalone build (minimal bundle)

### 5.3 Issues
- HTML cache-control set to `no-cache` — every page request hits the server
- No CDN edge caching detected
- Consider `s-maxage` with `stale-while-revalidate` for ISR pages

---

## 6. Images (Score: 95/100)

### 6.1 Alt Text Coverage
- All images have descriptive, contextual alt text
- Examples: "LED pixel lighting in a yacht bar area with DJ booth", "Yacht gangway with integrated LED lighting"
- Team photos have name-based alt text

### 6.2 Format
- Hero: WebP (optimized)
- Gallery images: WebP
- Team photos: PNG (could be WebP but small files)

### 6.3 Issues
- Minor: team photos could be converted to WebP for consistency

---

## 7. AI Search Readiness (Score: 80/100)

### 7.1 Strengths
- `llms.txt` present and serving (2.6KB, well-structured)
- All major AI crawlers explicitly allowed in robots.txt
- Structured content with clear headings
- Technical expertise well-demonstrated
- FAQ schemas provide clear Q&A signals

### 7.2 Weaknesses
- No external citations in content (reduces citability)
- Blog posts mention vendors without linking — AI systems can't verify claims
- No `llms-full.txt` for comprehensive content

---

## Page-by-Page Summary

| Page | Title | Desc | OG Match | H1 | Schema | Words | Ext Links | Score |
|------|-------|------|----------|-----|--------|-------|-----------|-------|
| `/` | Pass | Unclear | N/A | Pass | Yes | 3000 | 0 | 80 |
| `/about` | Pass | Pass | No | Pass | Yes | 1200 | 3 (social) | 78 |
| `/blog` | Pass | Pass | No | Pass | Yes | 3200 | 0 | 75 |
| `/contact` | Pass | Pass | No | Pass | Yes | 300 | 0 | 72 |
| `/custom-lighting` | Pass | Pass | No | Pass | Yes | 1200 | 0 | 78 |
| `/consultancy/clients` | Pass | Pass | No | Pass | Yes | 1200 | 3 (social) | 80 |
| `/consultancy/suppliers` | Pass | Pass | No | Pass | Yes | 1200 | 0 | 78 |
| `/products` | Pass | Pass | No | Pass | Partial | 250 | 0 | 58 |
| `/vendors` | Pass | Pass | **Yes** | Pass | Partial | 280 | 3 (social) | 68 |
| `/testimonials` | Pass | Pass | No | Pass | Yes | 2800 | 0 | 82 |
| Blog post 1 | Pass | Pass | **Yes** | Pass | Yes | 1700 | 0 | 78 |
| Blog post 2 | Pass | Pass | **Yes** | Pass | Yes | 1800 | 0 | 78 |
| `/vendors/channel-28` | Pass | Pass | N/A | Pass | **No** | 380 | 1 (maps) | 62 |

---

*Full Audit Report v2 — Generated February 18, 2026*
