# SEO Action Plan v3: paulthames.com

**Based on Audit v3:** February 18, 2026
**Current Score:** 84/100
**Target:** 92+ within 60 days

---

## Resolved Since v2 (no action needed)

- ~~Empty sitemap~~ — Runtime-generated from DB (v1)
- ~~Generic blog titles~~ — Article-specific with full OG/Twitter/canonical (v1)
- ~~No schema markup~~ — Comprehensive coverage (v1)
- ~~No llms.txt~~ — Present and serving (v1)
- ~~No vendor detail schema~~ — Organization schema now present (v3)
- ~~Blog article schema has wrong/empty author~~ — Now correct Person: Edwin Edelenbos (v3)
- ~~X-Powered-By header exposed~~ — Removed (v3)
- ~~No Content-Security-Policy~~ — Now present in report-only mode (v3)
- ~~No llms-full.txt~~ — Now present and comprehensive (v3)

---

## Priority Definitions

- **High** — Directly impacts search results appearance, social sharing, or crawlability
- **Medium** — Improves authority signals, content quality, or structured data completeness
- **Low** — Polish, optimization, and future-proofing

---

## HIGH PRIORITY

### 1. Fix OG Title Double Branding on ~8 Pages

**Impact:** Social share previews show redundant branding like "About Us | Paul Thames | Paul Thames"
**Effort:** 30 minutes
**Affects:** /about, /blog, /contact, /custom-lighting, /consultancy/clients, /consultancy/suppliers, /products, /testimonials
**Points:** +1

**Root cause:** The layout template appends "| Paul Thames" via `openGraph.title.template: '%s | Paul Thames'`, but each page's `openGraph.title` already ends with "| Paul Thames".

**Fix:** Remove "| Paul Thames" suffix from each page's `openGraph.title`, letting the template add it once:

```typescript
// Before (in about/page.tsx):
openGraph: { title: 'About Us | Paul Thames' }
// Renders: "About Us | Paul Thames | Paul Thames"

// After:
openGraph: { title: 'About Us' }
// Renders: "About Us | Paul Thames"
```

**Verification:** `curl -s https://paulthames.com/about | grep 'og:title'`

---

### 2. Add External Links to Blog Posts

**Impact:** E-E-A-T authority signals, reader value, potential reciprocal links
**Effort:** 30-60 minutes (content edit in CMS)
**Points:** +3

**Blog Post 1 (Pixel Perfect)** — Link these vendor mentions:
- Viveur — lighting manufacturer
- Imersu — immersive technology
- Panoblu — pixel lighting

**Blog Post 2 (Owner's Nephew)** — Link these vendor mentions:
- Panoblu IR — thermal imaging
- Liiontek — battery management
- Cydome — cybersecurity
- NEGU — secure connectivity
- DZ Technologies — AI surveillance

**Action:** Link each vendor name to their official website. These are editorial links demonstrating industry knowledge.

---

### 3. Address Empty Products Page

**Impact:** Currently shows "Showing 0 of 0 products" to users and crawlers — harms UX and SEO
**Effort:** 15 minutes for quick fix, 2-3 hours for content expansion
**Points:** +2

**Quick fix options (pick one):**
1. **Remove from navigation and sitemap** until products are added
2. **Add descriptive content** explaining what will be available (services overview, categories)
3. **Redirect to /vendors** if products are vendor-sourced

**Long-term:** Populate with actual product/service listings.

---

## MEDIUM PRIORITY

### 4. Complete Review Schema on Testimonials Page

**Impact:** Only 3 of 10 testimonials have Review schema — missing 7 rich result opportunities
**Effort:** 1 hour (code change)
**Points:** +1

Add Review schema markup to all 10 testimonials, not just 3. Each should include:
```json
{
  "@type": "Review",
  "reviewRating": { "@type": "Rating", "ratingValue": "5" },
  "author": { "@type": "Person", "name": "Reviewer Name" },
  "reviewBody": "Testimonial text",
  "itemReviewed": { "@type": "ProfessionalService", "name": "Paul Thames" }
}
```

---

### 5. Add SameAs to Organization Schema

**Impact:** Improves Knowledge Panel presence and entity recognition
**Effort:** 15 minutes
**Points:** +1

Add social profile URLs to the Organization/ProfessionalService schema on the homepage:

```json
"sameAs": [
  "https://linkedin.com/company/paulthames",
  "https://twitter.com/paulthames",
  "https://instagram.com/paulthames"
]
```

---

### 6. Fix Vendor Detail Schema Contact Info

**Impact:** Channel 28's Organization schema incorrectly shows Paul Thames contact details
**Effort:** 30 minutes
**Points:** +1

The Organization schema on `/vendors/channel-28` should use Channel 28's own email/phone, not Paul Thames's contact info. Update the schema generation to pull vendor-specific contact details.

---

### 7. Expand About Page Title

**Impact:** "About Us | Paul Thames" (24 chars) wastes title tag space
**Effort:** 5 minutes
**Points:** +0.5

**Suggested:** "About Us | Edwin Edelenbos & Roel van der Zwet | Paul Thames" (61 chars)

This adds founder names as searchable keywords.

---

### 8. Add External Links to Service Pages

**Impact:** Authority signals beyond blog content
**Effort:** 1 hour (content edit)
**Points:** +1

Target 2-3 relevant external links per service page:
- `/custom-lighting`: LED technology standards, pixel mapping references
- `/consultancy/clients`: IMO regulations, classification societies
- `/consultancy/suppliers`: Superyacht industry associations

---

### 9. Edge Caching for Static Pages

**Impact:** Performance for repeat visitors and crawlers
**Effort:** 30 minutes (config change)
**Points:** +2

Current: `Cache-Control: private, no-cache, no-store, max-age=0, must-revalidate`
Target: `Cache-Control: public, s-maxage=3600, stale-while-revalidate=86400`

Apply to static-ish pages: /about, /contact, /testimonials, /custom-lighting, service pages.

---

## LOW PRIORITY

### 10. Promote CSP to Enforcement Mode

**Impact:** Security hardening (currently report-only)
**Effort:** 1-2 hours (needs testing)
**Points:** +0.5

Monitor CSP reports for violations, then switch from `Content-Security-Policy-Report-Only` to `Content-Security-Policy`.

---

### 11. Self-Host Google Fonts

**Impact:** Removes external dependency, improves privacy and performance
**Effort:** 30 minutes
**Points:** +0.5

Download the font files, serve from `/public/fonts/`, update CSS references.

---

### 12. Convert Blog Post 2 Featured Image to WebP

**Impact:** Consistency, slight performance improvement
**Effort:** 10 minutes
**Points:** +0.5

Blog post 2 uses `Shutterstock_1915446079.jpg` — convert to WebP like all other images.

---

### 13. Increase Blog Cadence

**Impact:** Long-term organic growth and AI citability
**Effort:** Ongoing
**Points:** +2 over time

Current pace: ~1 post every 2 months. For B2B thought leadership in a niche market, 2-3 deeply technical posts per quarter is ideal. Topic ideas:
- AV/IT integration case studies
- Superyacht refit technology trends
- Vendor selection guides for specific systems

---

### 14. Add Case Studies Section

**Impact:** Major E-E-A-T boost for consultancy positioning
**Effort:** Significant (new content section)
**Points:** +3 over time

Project case studies with real outcomes would be the single highest-impact content investment. Even 2-3 anonymized case studies would significantly strengthen authority signals.

---

## Implementation Timeline

### This Week (~3 hours)
- [ ] Fix OG title mismatch (item 1)
- [ ] Add external links to blog posts (item 2)
- [ ] Address empty products page (item 3)
- [ ] Expand About page title (item 7)
- [ ] Add SameAs to Organization schema (item 5)

### Next 2 Weeks (~4 hours)
- [ ] Complete Review schema on all testimonials (item 4)
- [ ] Fix vendor detail schema contact info (item 6)
- [ ] Add external links to service pages (item 8)
- [ ] Edge caching configuration (item 9)

### When Convenient
- [ ] Promote CSP to enforcement (item 10)
- [ ] Self-host Google Fonts (item 11)
- [ ] Convert blog post 2 image to WebP (item 12)
- [ ] Increase blog cadence (item 13)
- [ ] Plan case studies section (item 14)

---

## Expected Score Impact

| Fix | Points |
|-----|--------|
| OG title double-branding fix (8 pages) | +1 |
| External links in blog content | +3 |
| Products page fix | +2 |
| Edge caching | +2 |
| Complete testimonial schema | +1 |
| SameAs on Organization | +1 |
| Service page external links | +1 |
| Vendor schema fix | +1 |
| Minor fixes (title, fonts, image) | +1.5 |
| **Total potential** | **+13.5 → ~90/100** |

---

*Action Plan v3 — Generated February 18, 2026*
*Based on Full SEO Audit v3 of paulthames.com*
*Next Audit Recommended: April 18, 2026*
