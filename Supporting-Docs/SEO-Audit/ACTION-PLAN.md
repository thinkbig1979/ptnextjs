# SEO Action Plan v2: paulthames.com

**Based on Audit v2:** February 18, 2026
**Current Score:** 78/100
**Target:** 88+ within 60 days

---

## Resolved Since v1 (no action needed)

- ~~Empty sitemap~~ — Now runtime-generated from DB
- ~~Generic blog titles~~ — Now article-specific with full OG/Twitter/canonical
- ~~Homepage canonical~~ — Correct
- ~~Thin content on most pages~~ — Expanded to 1000+ words
- ~~No schema markup~~ — Comprehensive coverage added
- ~~No llms.txt~~ — Present and serving
- ~~/yachts thin content~~ — Redirected (307 → /)
- ~~Meta keywords tag~~ — Not present

---

## Priority Definitions

- **High** — Directly impacts how pages appear in search results and social shares
- **Medium** — Improves authority signals and content quality
- **Low** — Polish and optimization

---

## HIGH PRIORITY

### 1. Fix OG Title Mismatch on 8 Pages

**Impact:** Social shares show generic site name instead of page-specific title
**Effort:** 1-2 hours (code change)
**Affects:** /about, /blog, /contact, /custom-lighting, /consultancy/clients, /consultancy/suppliers, /products, /testimonials

**Root cause:** These pages use static `metadata` exports which inherit OG tags from the root layout. The root layout's `openGraph.title` overrides page-specific titles.

**Fix:** Add explicit `openGraph` to each page's metadata export, or refactor the root layout to use a title template:

```typescript
// Option A: Per-page (safest)
// In each page's metadata export, add:
openGraph: {
  title: 'Page Title | Paul Thames',
  description: 'Page-specific description',
},

// Option B: Root layout template approach
// In layout.tsx, change openGraph to use template:
openGraph: {
  title: {
    template: '%s | Paul Thames',
    default: 'Paul Thames | Technical Consultancy & Creative Lighting',
  },
},
```

**Verification:** Share any page URL on LinkedIn/Twitter preview tools — title should match the page.

---

### 2. Add External Links to Blog Posts

**Impact:** E-E-A-T authority signals, reader value, potential reciprocal links
**Effort:** 30-60 minutes (content edit in CMS)

**Blog Post 1 (Pixel Perfect)** mentions without linking:
- Viveur — lighting manufacturer
- Imersu — immersive technology
- Panoblu — pixel lighting

**Blog Post 2 (Owner's Nephew)** mentions without linking:
- Panoblu IR — thermal imaging
- Liiontek — battery management
- Cydome — cybersecurity
- NEGU — secure connectivity
- DZ Technologies — AI surveillance

**Action:** Link each vendor name to their website. These are organic, editorial links that demonstrate industry knowledge and provide reader value.

---

### 3. Fix Blog Article Schema Author Field

**Impact:** Author attribution in search results
**Effort:** 15 minutes (code fix)

**Issues found:**
- Blog post 1: Article schema has empty `author` field
- Blog post 2: Article schema has `author: "admin@paulthames.com"` (email, not a name)

**Fix:** Ensure `getArticleSchema()` in `lib/seo-config.ts` outputs a proper Person author:
```json
"author": {
  "@type": "Person",
  "name": "Edwin Edelenbos"
}
```

---

### 4. Expand /products Page Content

**Impact:** Currently ~250 words — thin content risk for a key service page
**Effort:** 2-3 hours (content writing)
**Target:** 600+ words

**Suggested additions:**
- Brief description of each service area (consultancy, lighting, vendor advisory)
- How the services connect (the Paul Thames approach)
- Clear CTAs to the relevant detail pages

---

## MEDIUM PRIORITY

### 5. Add Schema to Vendor Detail Pages

**Impact:** Rich results for vendor profiles
**Effort:** 1 hour (code change)

`/vendors/channel-28` has no JSON-LD schema. Add Organization or LocalBusiness schema:

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Channel 28",
  "description": "...",
  "address": { ... },
  "url": "..."
}
```

This will automatically apply to all vendor detail pages as more vendors are added.

---

### 6. Add External Links to Service Pages

**Impact:** Authority signals beyond blog content
**Effort:** 1 hour (content edit)

**Opportunities:**
- `/custom-lighting`: Link to LED technology standards, pixel mapping technology references
- `/consultancy/clients`: Link to IMO regulations, classification society resources
- `/consultancy/suppliers`: Link to superyacht industry associations

**Target:** 2-3 relevant external links per service page.

---

### 7. Consider Edge Caching for Static-ish Pages

**Impact:** Performance for repeat visitors and crawlers
**Effort:** 30 minutes (config change)

Current HTML cache-control: `private, no-cache, no-store, max-age=0, must-revalidate`

For pages that change infrequently (about, contact, testimonials), consider:
```
Cache-Control: public, s-maxage=3600, stale-while-revalidate=86400
```

This lets the reverse proxy serve cached responses while revalidating in the background.

---

## LOW PRIORITY

### 8. Remove X-Powered-By Header

**Impact:** Minor security hardening
**Effort:** 5 minutes

In `next.config.js`:
```javascript
module.exports = {
  poweredByHeader: false,
}
```

---

### 9. Deduplicate HSTS Header

**Impact:** Cleanliness — currently sent twice (app + OpenResty)
**Effort:** 10 minutes (reverse proxy config)

Remove one of the two HSTS headers. The OpenResty one with `includeSubDomains; preload` is the correct one to keep.

---

### 10. Add Content-Security-Policy Header

**Impact:** Security hardening
**Effort:** 1-2 hours (needs testing)

Currently missing. A basic CSP would prevent XSS and injection attacks. Start with report-only mode to avoid breaking anything.

---

### 11. Continue Blog Cadence

**Impact:** Long-term organic growth
**Effort:** Ongoing

Current pace: ~1 post every 2 months. Maintain or slightly increase. Quality matters more than quantity for this niche. 2-3 deeply technical posts per quarter is ideal for the superyacht consultancy audience.

---

## Implementation Timeline

### This Week (~3 hours)
- [ ] Fix OG title mismatch (items 1)
- [ ] Fix blog author schema (item 3)
- [ ] Add external links to blog posts (item 2)

### Next 2 Weeks (~4 hours)
- [ ] Expand /products page (item 4)
- [ ] Add schema to vendor detail pages (item 5)
- [ ] Add external links to service pages (item 6)

### When Convenient
- [ ] Edge caching configuration (item 7)
- [ ] Remove X-Powered-By (item 8)
- [ ] Deduplicate HSTS (item 9)
- [ ] Content-Security-Policy (item 10)

---

## Expected Score Impact

| Fix | Points |
|-----|--------|
| OG title fix (8 pages) | +3 |
| External links in content | +3 |
| Blog author schema | +1 |
| Products page expansion | +2 |
| Vendor schema | +1 |
| External links on service pages | +1 |
| **Total potential** | **+11 → 89/100** |

---

*Action Plan v2 — Generated February 18, 2026*
*Based on Full SEO Audit v2 of paulthames.com*
*Next Audit Recommended: 60 days*
