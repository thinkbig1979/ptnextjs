# Enhanced Vendor Product Form

**Version**: 1.0.0
**Created**: 2026-01-13
**Status**: Draft
**Priority**: High

## Executive Summary

Expand the vendor dashboard product form from 3 basic fields to a comprehensive product editor that leverages the full Products collection schema. This enables tier-qualified vendors to create rich product showcases with images, pricing, specifications, features, and more.

## Problem Statement

### Current State
- Vendor dashboard exposes only 3 fields: `name`, `description`, `shortDescription`
- Products collection schema supports 50+ fields including images, pricing, specifications, features, badges, integration info, documentation, and SEO
- API validation schema (`lib/validation/product-schema.ts`) already supports: images, categories, tags, specifications, features, pricing
- Vendors cannot effectively showcase their products, reducing platform value

### Business Impact
- Vendors with Tier 2 subscriptions paying for enhanced capabilities cannot use them
- Product pages appear sparse compared to competitors
- Reduced vendor satisfaction and potential churn
- Platform fails to deliver on its progressive profiling promise

## Goals

### Primary Goals
1. Enable vendors to add product images with main image designation
2. Allow configuration of pricing display (text, currency, contact form toggle)
3. Support technical specifications (label/value pairs)
4. Enable key features and benefits highlighting
5. Provide category and tag assignment for discoverability

### Secondary Goals
1. Action button configuration (contact, quote, download CTAs)
2. Quality badges and certifications display
3. Basic SEO metadata (meta title, description, keywords)
4. Documentation links (manuals, guides)

### Future Scope (Out of This Spec)
- Interactive content (360° images, 3D models, video walkthroughs, AR)
- Owner reviews and testimonials management
- Comparison metrics and benchmarking
- Full integration/compatibility matrix
- Warranty and support detail management

## Requirements

### Functional Requirements

#### FR-1: Product Images Management
- **FR-1.1**: Add multiple product images via URL input
- **FR-1.2**: Designate one image as "main" (featured) image
- **FR-1.3**: Add alt text for accessibility
- **FR-1.4**: Add optional caption per image
- **FR-1.5**: Reorder images (drag-and-drop or up/down buttons)
- **FR-1.6**: Remove images with confirmation

#### FR-2: Pricing Configuration
- **FR-2.1**: Enter price display text (e.g., "From $5,000", "Contact for Quote")
- **FR-2.2**: Add pricing subtitle/context
- **FR-2.3**: Toggle "Show Contact Form" for pricing inquiries
- **FR-2.4**: Select currency code (optional)

#### FR-3: Technical Specifications
- **FR-3.1**: Add specification entries as label/value pairs
- **FR-3.2**: Support multiple specifications per product
- **FR-3.3**: Reorder specifications
- **FR-3.4**: Remove specifications

#### FR-4: Features and Benefits
- **FR-4.1**: Add feature entries with title and description
- **FR-4.2**: Optional icon selection per feature (Lucide icon name)
- **FR-4.3**: Reorder features by drag or explicit order number
- **FR-4.4**: Remove features

#### FR-5: Category and Tag Assignment
- **FR-5.1**: Select from existing categories (multi-select)
- **FR-5.2**: Select from existing tags (multi-select)
- **FR-5.3**: Display selected items as removable chips/badges

#### FR-6: Action Buttons (CTA Configuration)
- **FR-6.1**: Add action buttons with label and type (primary/secondary/outline)
- **FR-6.2**: Configure action type (contact, quote, download, external link)
- **FR-6.3**: Provide action data (URL for external links)
- **FR-6.4**: Optional icon per button

#### FR-7: Quality Badges
- **FR-7.1**: Add badges with label and style type
- **FR-7.2**: Support badge types: secondary, outline, success, warning, info
- **FR-7.3**: Optional icon per badge

#### FR-8: SEO Metadata
- **FR-8.1**: Custom meta title (falls back to product name if empty)
- **FR-8.2**: Meta description for search results
- **FR-8.3**: Keywords (comma-separated)

### Non-Functional Requirements

#### NFR-1: Performance
- Form should load within 500ms
- Image URL validation should occur on blur, not block typing
- Form submission should complete within 2 seconds

#### NFR-2: Usability
- Progressive disclosure: group advanced fields in collapsible sections
- Mobile-responsive form layout
- Clear validation messages on field-level errors
- Autosave draft to localStorage every 30 seconds

#### NFR-3: Accessibility
- All form controls must be keyboard accessible
- Proper ARIA labels for dynamic form sections
- Focus management when adding/removing array items
- Screen reader announcements for form state changes

#### NFR-4: Tier Gating
- Basic fields (name, description, short description) available to all tiers
- Images, pricing, specifications, features available to Tier 2+
- Advanced fields (action buttons, badges, SEO) available to Tier 2+

## User Stories

### US-1: Product Images
**As a** Tier 2 vendor
**I want to** add multiple product images with a designated main image
**So that** my product pages look professional and showcase my products visually

**Acceptance Criteria:**
- [ ] Can add image by entering URL
- [ ] Can mark one image as "main" (radio button or similar)
- [ ] Can add alt text and caption per image
- [ ] Can remove images
- [ ] Main image appears first in product display

### US-2: Pricing Information
**As a** vendor
**I want to** configure how pricing appears on my product page
**So that** potential customers understand my pricing model

**Acceptance Criteria:**
- [ ] Can enter custom pricing text
- [ ] Can add pricing subtitle for context
- [ ] Can toggle contact form visibility
- [ ] Pricing displays correctly on product page

### US-3: Technical Specifications
**As a** Tier 2 vendor
**I want to** add technical specifications as label/value pairs
**So that** technical buyers can evaluate my product's capabilities

**Acceptance Criteria:**
- [ ] Can add multiple specifications
- [ ] Each specification has label and value
- [ ] Can reorder and remove specifications
- [ ] Specifications display in a formatted table on product page

### US-4: Features Highlighting
**As a** vendor
**I want to** highlight key features with descriptions and icons
**So that** potential customers quickly understand my product's value

**Acceptance Criteria:**
- [ ] Can add features with title and description
- [ ] Can optionally select a Lucide icon
- [ ] Features display in an attractive grid/list on product page

### US-5: Category Assignment
**As a** vendor
**I want to** assign categories to my products
**So that** customers can find my products through category browsing

**Acceptance Criteria:**
- [ ] Can select multiple categories from existing list
- [ ] Selected categories display as removable chips
- [ ] Product appears in selected category pages

## Technical Constraints

### Existing Infrastructure
- **Form Library**: React Hook Form 7.53.0 with Zod 3.23.8
- **UI Components**: shadcn/ui (Sheet, Form, Input, Textarea, Button, Select, etc.)
- **API Validation**: Already supports images, specifications, features, pricing in `lib/validation/product-schema.ts`
- **Backend Service**: `ProductService.createProduct()` and `updateProduct()` already handle extended fields

### API Compatibility
The API already supports all proposed fields. Changes are UI-only:
- `CreateProductSchema` supports: images, categories, tags, specifications, features, price, pricing, published
- `UpdateProductSchema` supports same fields for partial updates
- Backend `ProductService` transforms and persists all fields to Payload CMS

### Data Flow
```
ProductForm (UI)
  → API Route (/api/portal/vendors/[id]/products)
  → Zod Validation (product-schema.ts)
  → ProductService.createProduct/updateProduct
  → Payload CMS (Products collection)
```

## Success Metrics

| Metric | Current | Target | Measurement |
|--------|---------|--------|-------------|
| Fields available to vendors | 3 | 25+ | Count of form fields |
| Products with images | ~5% | >50% | DB query on products.images |
| Products with specifications | ~2% | >40% | DB query on products.specifications |
| Average product completeness | 15% | 60% | Calculated score based on filled fields |
| Vendor satisfaction (product editor) | N/A | >4.0/5.0 | Survey |

## Dependencies

### Internal Dependencies
- Existing `ProductForm.tsx` component
- Existing `product-schema.ts` validation
- Existing `ProductService.ts` backend
- Categories and Tags collections in Payload CMS

### External Dependencies
- None (all infrastructure exists)

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Form becomes too complex | Medium | High | Progressive disclosure with collapsible sections |
| Long form causes abandonment | Medium | Medium | Autosave drafts, clear progress indication |
| Image URL validation issues | Low | Medium | Client-side URL format check, async image load verification |
| Performance with many array items | Low | Medium | Virtualization for very long lists, lazy load sections |

## Out of Scope

The following are explicitly excluded from this specification:
1. Direct file upload (images are URL-based)
2. Rich text editor for description (keep simple textarea)
3. Interactive content (360°, 3D, video, AR)
4. Owner reviews management
5. Comparison metrics configuration
6. Full integration/compatibility matrix
7. Warranty/support detail editor
8. Publishing control (admin-only per current access rules)

## Appendix

### A. Field Mapping Reference

| Form Section | Fields | Schema Location |
|--------------|--------|-----------------|
| Basic Info | name, description, shortDescription, slug | CreateProductSchema |
| Images | images[] (url, altText, isMain, caption) | ProductImageSchema |
| Pricing | price, pricing.* | PricingSchema |
| Specifications | specifications[] (label, value) | SpecificationSchema |
| Features | features[] (title, description, icon, order) | FeatureSchema |
| Categories | categories[] | CreateProductSchema |
| Tags | tags[] | CreateProductSchema |
| Action Buttons | actionButtons[] | Products.ts collection |
| Badges | badges[] | Products.ts collection |
| SEO | seo.* | Products.ts collection |

### B. Form Section Organization

```
[Basic Information] - Always expanded
  - Product Name *
  - Description *
  - Short Description
  - Slug (auto-generated, editable)

[Images] - Collapsible, Tier 2+
  - Image URL + Add button
  - Image list with main toggle, alt, caption

[Pricing] - Collapsible, Tier 2+
  - Display Text
  - Subtitle
  - Currency
  - Show Contact Form toggle

[Specifications] - Collapsible, Tier 2+
  - Label/Value pairs
  - Add/Remove/Reorder

[Features] - Collapsible, Tier 2+
  - Title, Description, Icon
  - Add/Remove/Reorder

[Categories & Tags] - Collapsible, Tier 2+
  - Multi-select categories
  - Multi-select tags

[Action Buttons] - Collapsible, Tier 2+
  - Button configuration

[Badges] - Collapsible, Tier 2+
  - Badge configuration

[SEO] - Collapsible, Tier 2+
  - Meta title, description, keywords
```
