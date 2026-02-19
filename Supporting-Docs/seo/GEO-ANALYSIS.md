# GEO Analysis: paulthames.com

**Date**: February 19, 2026
**Domain**: paulthames.com
**Industry**: Superyacht technology consultancy (B2B niche)

---

## GEO Readiness Score: 52/100

| Category | Score | Weight | Weighted |
|----------|-------|--------|----------|
| Citability | 55/100 | 25% | 13.75 |
| Structural Readability | 65/100 | 20% | 13.00 |
| Multi-Modal Content | 35/100 | 15% | 5.25 |
| Authority & Brand Signals | 45/100 | 20% | 9.00 |
| Technical Accessibility | 72/100 | 20% | 14.40 |
| **Total** | | | **55.40** |

---

## 1. Platform Breakdown

| Platform | Score | Assessment |
|----------|-------|------------|
| **Google AI Overviews** | 58/100 | Good schema markup and SSR, but thin content across only 13 pages limits topical authority. FAQ schema on key pages helps. |
| **ChatGPT** | 35/100 | No Wikipedia presence, no Reddit mentions, minimal third-party citations. ChatGPT relies heavily on Wikipedia (47.9%) and Reddit (11.3%), both absent. |
| **Perplexity** | 30/100 | No Reddit discussions (Perplexity draws 46.7% from Reddit). No community validation signals. Superyacht Times listing helps minimally. |

---

## 2. AI Crawler Access Status

| Crawler | Status | Notes |
|---------|--------|-------|
| GPTBot (OpenAI) | **Allowed** | Explicitly allowed in robots.txt |
| ClaudeBot (Anthropic) | **Allowed** | Explicitly allowed |
| PerplexityBot | **Allowed** | Explicitly allowed |
| Google-Extended | **Allowed** | Explicitly allowed |
| OAI-SearchBot | Not mentioned | Defaults to allowed (no Disallow rule) |
| ChatGPT-User | Not mentioned | Defaults to allowed |
| CCBot (Common Crawl) | Not mentioned | Consider blocking if training data reuse is a concern |
| Bytespider (ByteDance) | Not mentioned | Consider blocking |

**Assessment**: Good. Key AI search crawlers are explicitly permitted. Consider adding explicit rules for OAI-SearchBot and ChatGPT-User for completeness.

---

## 3. llms.txt Status

**Status**: Present and well-structured

- `/llms.txt` - Concise overview (44 lines) with company summary, services, key people, and links
- `/llms-full.txt` - Comprehensive guide (213 lines) with detailed bios, testimonials, technical expertise, and industry context
- Cross-referencing between the two files is correct

**Strengths**:
- Follows the standard format (title, description, sections, links)
- Full version includes testimonials and expertise areas (strong for authority)
- Contact information included

**Recommendations**:
- Add `sameAs` links (LinkedIn, Instagram, Superyacht Times profile) to help AI systems connect entity references
- Add a "Key Facts" section with quantifiable data points (e.g., "Combined 33+ years experience", "Projects on vessels 50m-115m+", "Network of 21 sales agents")
- Add blog post summaries to `llms-full.txt` to surface thought leadership content

---

## 4. Brand Mention Analysis

| Platform | Presence | Impact |
|----------|----------|--------|
| **Wikipedia** | None | High negative. Wikipedia is cited by ChatGPT 47.9% of the time. No entity page for Paul Thames, Edwin Edelenbos, or Roel van der Zwet. |
| **Reddit** | None | High negative. Reddit is cited by Perplexity 46.7% and ChatGPT 11.3%. No discussions found. |
| **YouTube** | None | Highest negative. YouTube mentions have the strongest correlation (~0.737) with AI citation. No channel or video content found. |
| **LinkedIn** | Present | Company page exists. Founder profiles present (Edwin Edelenbos, Roel van der Zwet, Nigel Sherlock-Franciere). Posts about METSTRADE and partnerships. |
| **Superyacht Times** | Present | Listed as company. Niche authority signal. |
| **Instagram** | Present | @paulthamesglobal with Reels content. Moderate signal. |

**Brand Mention Score: 25/100** - Present only on LinkedIn and niche platforms. Absent from the three highest-correlation platforms (YouTube, Reddit, Wikipedia).

---

## 5. Passage-Level Citability Analysis

### Strong Citable Passages (134-167 word range)

**1. Company Origin Story** (About page, ~160 words):
> "After years working across shipyards, integrators, and technology suppliers, we kept seeing the same pattern: projects struggling not because the technology was wrong, but because the right expertise wasn't connected to the right people at the right time."

- Self-contained, quotable, specific to the problem they solve
- Could be cited for "superyacht project consulting" queries

**2. Pixel LED Definition** (Custom Lighting page):
> "Pixel-based lighting uses individually controllable LED pixels, enabling dynamic effects, animations, and scenes that traditional lighting cannot achieve."

- Clean definition suitable for "what is pixel-based lighting" queries
- Needs expansion to 134+ words with specific applications

**3. Independence Statement** (Consultancy page):
> "The advisory is independent, focused on evaluating specifications, auditing proposals, and providing unbiased technical guidance."

- Good for "independent superyacht consultant" queries
- Too short as standalone; needs surrounding context

### Weak Areas

- Homepage content is primarily marketing copy, not citable reference material
- Blog posts are narrative-driven rather than structured for extraction
- No original research, surveys, or unique data points that AI systems would need to cite
- Most content blocks exceed 167 words (verbose) or fall below 134 words (too thin)

---

## 6. Server-Side Rendering Check

**Status**: Server-Side Rendered (SSR) via Next.js

- All page components are React Server Components (no `"use client"` directives)
- Pages use `force-dynamic` rendering, meaning content is generated server-side per request
- Content is available in initial HTML response, not dependent on client JavaScript
- AI crawlers that don't execute JavaScript can access all content

**Assessment**: Good. This is a significant technical advantage over client-rendered sites. AI crawlers will see the full page content.

**Note**: Static generation (`force-static`) would be even better for consistency and speed, but the current dynamic SSR approach is sufficient for AI crawler access.

---

## 7. Structural Readability Assessment

| Signal | Status |
|--------|--------|
| Clean H1-H2-H3 hierarchy | Present on all pages |
| Question-based headings | Weak - mostly declarative statements |
| Short paragraphs (2-4 sentences) | Mixed - some sections are dense |
| Tables for comparative data | None on content pages |
| FAQ sections | Present on Consultancy and Custom Lighting pages (with FAQPage schema) |
| Lists for multi-item content | Present but inconsistent |

**Schema Markup Detected**:
- Organization schema (homepage)
- ProfessionalService schema (homepage)
- Person schema (About page, both founders)
- FAQPage schema (Consultancy, Custom Lighting)
- BreadcrumbList schema (all pages)
- Article/BlogPosting schema (blog posts)

---

## 8. Top 5 Highest-Impact Changes

### 1. Create YouTube Content (Impact: Very High)

YouTube mentions have the strongest correlation (~0.737) with AI citations. Even 5-10 short videos on superyacht technology topics would significantly boost brand signal strength.

**Suggested topics**:
- "What does a superyacht AV/IT consultant actually do?"
- "Custom pixel LED lighting for superyachts: explained"
- "5 mistakes owners make with superyacht technology specs"
- "How to evaluate AV/IT vendor proposals for your yacht project"

**Effort**: Medium | **Timeline**: 1-3 months

### 2. Build Wikipedia Presence (Impact: High)

ChatGPT cites Wikipedia 47.9% of the time. While Paul Thames as a company may not yet meet Wikipedia's notability criteria, the founders could contribute to or be mentioned in relevant Wikipedia articles:
- Superyacht industry article
- Feadship or Oceanco articles (if contributing notable projects)
- Pixel LED lighting technology articles

**Effort**: Medium | **Timeline**: 3-6 months (Wikipedia editing has a learning curve and requires notability)

### 3. Create Original Research Content (Impact: High)

AI systems prioritize unique, citable data. Publish original research such as:
- "State of Superyacht Technology 2026" survey/report
- Pricing benchmarks for AV/IT systems by vessel size
- Technology adoption trends across the superyacht fleet
- Case studies with specific metrics (budget, timeline, outcomes)

This gives AI systems a *reason* to cite paulthames.com over competitors.

**Effort**: High | **Timeline**: 2-4 months

### 4. Add Question-Based Headings + Answer Blocks to All Pages (Impact: Medium-High)

Reformat existing content into Q&A structure matching how users query AI systems:

**Current**: "Technical Project Consultancy"
**Better**: "What Does a Superyacht Technology Consultant Do?"

**Current**: "Bespoke Fixtures"
**Better**: "How Are Custom Pixel LED Fixtures Designed for Superyachts?"

Each answer should be a self-contained 134-167 word block that AI can extract and cite.

**Effort**: Low | **Timeline**: 1-2 weeks

### 5. Establish Reddit Presence (Impact: Medium-High)

Reddit is cited by Perplexity (46.7%) and ChatGPT (11.3%). Participate authentically in:
- r/superyachts
- r/yachting
- r/AVintegration
- r/lightingdesign

Share expertise, answer questions, and link to relevant blog content where appropriate.

**Effort**: Low (ongoing) | **Timeline**: Immediate start, 3-6 months for impact

---

## 9. Schema Recommendations for AI Discoverability

### Currently Implemented
- Organization, ProfessionalService, Person, FAQPage, BreadcrumbList, Article

### Recommended Additions

| Schema Type | Where | Purpose |
|-------------|-------|---------|
| `sameAs` array | Organization schema | Link to LinkedIn, Instagram, Superyacht Times profile. Helps AI systems connect brand mentions across platforms. |
| `HowTo` | Consultancy pages | Structure the 4-phase project approach (Concept, Design, Build, Deliver) as a HowTo process. |
| `Review` / `AggregateRating` | Testimonials page | Structure the 12 testimonials as reviews. Even without numeric ratings, the structured format helps AI extraction. |
| `Service` (detailed) | Each service page | Add detailed Service schema with `serviceType`, `areaServed`, `audience`, and `hasOfferCatalog`. |
| `SpecialAnnouncement` | Blog posts | For time-sensitive industry insights or event-related content. |
| `VideoObject` | Future video content | Essential when YouTube content is created. |

---

## 10. Content Reformatting Suggestions

### Homepage

**Current opening**: "Experience and Expertise, Applied"

**Suggested**: Add a definition block immediately after the H1:

> "Paul Thames is an independent superyacht technology consultancy that provides technical advisory, vendor market access, and custom lighting solutions for vessels 50 metres and above. Founded by Edwin Edelenbos (18+ years in superyacht AV/IT) and Roel van der Zwet (15+ years in commercial leadership), the company serves owners, designers, shipyards, and technology vendors across all major yachting markets."

This 55-word block gives AI systems a complete, citable definition.

### Blog Posts

**Current style**: Narrative, storytelling approach (good for engagement, weak for citation)

**Suggested additions per post**:
1. Add a "Key Takeaway" box at the top (50-60 words summarizing the main point)
2. Use question-based H2s that match search queries
3. Include at least one comparison table per post
4. Add specific statistics with sources
5. Close with a "Definition" section for any technical terms introduced
6. Add author name (not just "Technology Analyst") with link to bio

### Custom Lighting Page

**Add**: A comparison table of lighting types:

| Feature | Traditional LED | Pixel-Based LED | Fiber Optic |
|---------|----------------|-----------------|-------------|
| Individual control | No | Yes | Limited |
| Dynamic effects | Limited | Full | Limited |
| Custom form factors | Standard | Fully custom | Moderate |
| Marine suitability | High | High | Moderate |

### Consultancy Pages

**Add**: "When to hire a consultant" decision framework:
- Project budget exceeds X
- Build timeline extends beyond Y years
- Multiple vendors need evaluation
- Owner's technical knowledge is limited

---

## Summary: Priority Action Matrix

| Priority | Action | Effort | Impact | Timeline |
|----------|--------|--------|--------|----------|
| 1 | Reformat headings to Q&A + add answer blocks | Low | Medium-High | 1-2 weeks |
| 2 | Add `sameAs` to Organization schema | Low | Medium | 1 day |
| 3 | Enhance llms.txt with key facts + sameAs links | Low | Medium | 1 day |
| 4 | Start Reddit participation | Low | Medium-High | Ongoing |
| 5 | Add comparison tables to key pages | Low-Medium | Medium | 1-2 weeks |
| 6 | Create YouTube channel + 5 initial videos | Medium | Very High | 1-3 months |
| 7 | Publish original research report | High | High | 2-4 months |
| 8 | Build Wikipedia references | Medium | High | 3-6 months |
| 9 | Add author bylines with credentials to blog | Low | Medium | 1 day |
| 10 | Implement Service + Review schema | Medium | Medium | 1-2 weeks |

---

## Competitive Context

Paul Thames operates in an ultra-niche B2B market (superyacht technology consulting). This has both advantages and disadvantages for GEO:

**Advantages**:
- Low competition for specific queries ("superyacht AV/IT consultant", "pixel LED lighting yacht")
- Domain expertise is genuine and deep (33+ combined years)
- Well-structured site with good technical SEO foundations

**Disadvantages**:
- Niche = low search volume = less AI training data about the topic
- Small content footprint (13 pages) limits topical authority
- No brand presence on high-correlation platforms (YouTube, Reddit, Wikipedia)
- B2B service firms are inherently harder to make "citable" vs. data-rich resources

The biggest lever is **creating unique, citable content** (original research, data, comparisons) that AI systems would need to reference when answering superyacht technology questions. Currently, there is no compelling reason for an AI to cite paulthames.com over a more general source.
