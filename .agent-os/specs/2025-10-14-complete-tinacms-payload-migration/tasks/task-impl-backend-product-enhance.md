# Task IMPL-BACKEND-PRODUCT-ENHANCE: Enhance Products Collection with Comparison Metrics, Reviews, Visual Demos

## Task Metadata
- **Task ID**: impl-backend-product-enhance
- **Phase**: Phase 2 - Backend Implementation
- **Agent Assignment**: backend-nodejs-specialist
- **Estimated Time**: 6 hours
- **Dependencies**: test-backend-collections, impl-backend-vendor-enhance
- **Status**: Ready for Implementation
- **Priority**: Critical

## Task Description

Enhance the existing Products collection with advanced features including comparison metrics for benchmarking, integration compatibility details, owner reviews with ratings, and visual demo content (360° images, 3D models, interactive hotspots). This transforms basic product listings into comprehensive showcases.

## Specifics

### File to Update
`/home/edwin/development/ptnextjs/src/collections/Products.ts`

### Enhanced Fields to Add (Technical Spec lines 194-380)

#### Comparison Metrics Array
```typescript
{
  name: 'comparisonMetrics',
  type: 'array',
  label: 'Performance & Comparison Metrics',
  admin: { description: 'Quantifiable metrics for product comparison and benchmarking' },
  fields: [
    {
      name: 'metricName',
      type: 'text',
      required: true,
      admin: { description: 'e.g., "Range", "Power Output", "Response Time"' }
    },
    {
      name: 'value',
      type: 'text',
      required: true,
      admin: { description: 'Metric value with units, e.g., "50 nautical miles", "2000W"' }
    },
    {
      name: 'numericValue',
      type: 'number',
      admin: { description: 'Numeric value for programmatic comparison' }
    },
    {
      name: 'unit',
      type: 'text',
      admin: { description: 'Unit of measurement (meters, watts, ms, etc.)' }
    },
    {
      name: 'category',
      type: 'select',
      options: [
        { label: 'Performance', value: 'performance' },
        { label: 'Physical Specs', value: 'physical' },
        { label: 'Power & Energy', value: 'power' },
        { label: 'Capacity', value: 'capacity' },
        { label: 'Quality & Reliability', value: 'quality' },
        { label: 'Environmental', value: 'environmental' }
      ]
    },
    {
      name: 'compareHigherBetter',
      type: 'checkbox',
      defaultValue: true,
      admin: { description: 'Is higher value better for this metric?' }
    },
    {
      name: 'industryAverage',
      type: 'text',
      admin: { description: 'Industry average for context' }
    }
  ]
}
```

#### Integration Compatibility Group
```typescript
{
  name: 'integrationCompatibility',
  type: 'group',
  label: 'Integration & Compatibility',
  admin: { description: 'Technical integration details and compatibility information' },
  fields: [
    {
      name: 'supportedProtocols',
      type: 'array',
      label: 'Supported Protocols & Standards',
      fields: [
        { name: 'protocol', type: 'text', required: true },
        { name: 'version', type: 'text' },
        { name: 'notes', type: 'textarea' }
      ]
    },
    {
      name: 'integrationPartners',
      type: 'array',
      label: 'Compatible Systems & Partners',
      fields: [
        { name: 'partner', type: 'text', required: true },
        { name: 'integrationType', type: 'text' },
        { name: 'certificationLevel', type: 'select', options: [
          { label: 'Certified', value: 'certified' },
          { label: 'Compatible', value: 'compatible' },
          { label: 'Beta', value: 'beta' }
        ]}
      ]
    },
    {
      name: 'apiAvailable',
      type: 'checkbox',
      defaultValue: false,
      admin: { description: 'Does product offer API access?' }
    },
    {
      name: 'apiDocumentationUrl',
      type: 'text',
      admin: { condition: (data) => data.integrationCompatibility?.apiAvailable }
    },
    {
      name: 'sdkLanguages',
      type: 'array',
      label: 'SDK Programming Languages',
      fields: [{ name: 'language', type: 'text' }]
    }
  ]
}
```

#### Owner Reviews Array
```typescript
{
  name: 'ownerReviews',
  type: 'array',
  label: 'Owner Reviews & Testimonials',
  admin: { description: 'Real-world reviews from yacht owners and captains' },
  fields: [
    { name: 'reviewerName', type: 'text', required: true },
    { name: 'reviewerRole', type: 'text', required: true, admin: { description: 'e.g., "Captain", "Owner", "Chief Engineer"' } },
    { name: 'yachtName', type: 'text', admin: { description: 'Name of yacht (if disclosable)' } },
    { name: 'yacht', type: 'relationship', relationTo: 'yachts', admin: { description: 'Link to yacht profile' } },
    {
      name: 'overallRating',
      type: 'number',
      required: true,
      min: 1,
      max: 5,
      admin: { description: 'Overall rating out of 5' }
    },
    {
      name: 'ratings',
      type: 'group',
      label: 'Detailed Ratings',
      fields: [
        { name: 'reliability', type: 'number', min: 1, max: 5 },
        { name: 'easeOfUse', type: 'number', min: 1, max: 5 },
        { name: 'performance', type: 'number', min: 1, max: 5 },
        { name: 'support', type: 'number', min: 1, max: 5 },
        { name: 'valueForMoney', type: 'number', min: 1, max: 5 }
      ]
    },
    { name: 'reviewText', type: 'richText', required: true, editor: lexicalEditor() },
    { name: 'pros', type: 'array', label: 'Pros', fields: [{ name: 'pro', type: 'text' }] },
    { name: 'cons', type: 'array', label: 'Cons', fields: [{ name: 'con', type: 'text' }] },
    { name: 'reviewDate', type: 'date', required: true },
    { name: 'verified', type: 'checkbox', defaultValue: false, admin: { description: 'Verified purchase/installation' } },
    { name: 'featured', type: 'checkbox', defaultValue: false }
  ]
}
```

#### Visual Demo Content Group
```typescript
{
  name: 'visualDemoContent',
  type: 'group',
  label: 'Visual Demo & Interactive Content',
  admin: { description: 'Interactive product demonstrations and 3D content' },
  fields: [
    {
      name: 'images360',
      type: 'array',
      label: '360° Product Images',
      fields: [
        { name: 'image', type: 'upload', relationTo: 'media', required: true },
        { name: 'angle', type: 'number', admin: { description: 'Rotation angle in degrees (0-360)' } },
        { name: 'label', type: 'text' }
      ]
    },
    {
      name: 'model3d',
      type: 'group',
      label: '3D Model',
      fields: [
        { name: 'modelUrl', type: 'text', admin: { description: 'URL to 3D model file (GLTF, GLB, OBJ)' } },
        { name: 'thumbnailImage', type: 'upload', relationTo: 'media' },
        { name: 'allowDownload', type: 'checkbox', defaultValue: false }
      ]
    },
    {
      name: 'interactiveHotspots',
      type: 'array',
      label: 'Interactive Hotspots',
      admin: { description: 'Interactive points of interest on product images' },
      fields: [
        { name: 'image', type: 'upload', relationTo: 'media', required: true },
        {
          name: 'hotspots',
          type: 'array',
          fields: [
            { name: 'x', type: 'number', required: true, admin: { description: 'X coordinate (percentage)' } },
            { name: 'y', type: 'number', required: true, admin: { description: 'Y coordinate (percentage)' } },
            { name: 'title', type: 'text', required: true },
            { name: 'description', type: 'textarea' },
            { name: 'featureImage', type: 'upload', relationTo: 'media' }
          ]
        }
      ]
    },
    {
      name: 'videoWalkthrough',
      type: 'group',
      label: 'Video Product Walkthrough',
      fields: [
        { name: 'videoUrl', type: 'text', admin: { description: 'YouTube or Vimeo URL' } },
        { name: 'thumbnail', type: 'upload', relationTo: 'media' },
        { name: 'duration', type: 'number', admin: { description: 'Duration in seconds' } },
        { name: 'chapters', type: 'array', fields: [
          { name: 'timestamp', type: 'number', required: true },
          { name: 'title', type: 'text', required: true }
        ]}
      ]
    },
    {
      name: 'augmentedRealityPreview',
      type: 'group',
      label: 'AR Preview',
      fields: [
        { name: 'arModelUrl', type: 'text', admin: { description: 'USDZ file for iOS AR' } },
        { name: 'glbModelUrl', type: 'text', admin: { description: 'GLB file for Android AR' } },
        { name: 'scaleReference', type: 'text', admin: { description: 'Real-world scale reference' } }
      ]
    }
  ]
}
```

### Additional Enhancements

#### Technical Documentation
```typescript
{
  name: 'technicalDocumentation',
  type: 'array',
  label: 'Technical Documentation',
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'type', type: 'select', options: [
      { label: 'User Manual', value: 'manual' },
      { label: 'Technical Specification', value: 'spec' },
      { label: 'Installation Guide', value: 'installation' },
      { label: 'Integration Guide', value: 'integration' },
      { label: 'API Documentation', value: 'api' },
      { label: 'Troubleshooting', value: 'troubleshooting' }
    ]},
    { name: 'fileUrl', type: 'text' },
    { name: 'language', type: 'text', defaultValue: 'en' },
    { name: 'version', type: 'text' }
  ]
}
```

#### Warranty & Support
```typescript
{
  name: 'warrantySupport',
  type: 'group',
  label: 'Warranty & Support',
  fields: [
    { name: 'warrantyYears', type: 'number' },
    { name: 'warrantyDetails', type: 'textarea' },
    { name: 'extendedWarrantyAvailable', type: 'checkbox', defaultValue: false },
    { name: 'supportChannels', type: 'array', fields: [{ name: 'channel', type: 'text' }] },
    { name: 'supportResponseTime', type: 'text', admin: { description: 'e.g., "24 hours"' } }
  ]
}
```

### Implementation Requirements

1. **Preserve Existing Fields**
   - Keep all current fields intact
   - Maintain vendor relationships
   - Ensure backward compatibility

2. **Add New Sections**
   - Organize in logical field groups
   - Use admin tabs for better UX
   - Add helpful field descriptions

3. **Update TypeScript Types**
   - Run `payload generate:types`
   - Verify extended Product interface

4. **Migration Considerations**
   - All new fields optional
   - Provide sensible defaults
   - Existing products will have null/undefined for new fields

## Acceptance Criteria

- [ ] All 4 major enhancements added:
  - comparisonMetrics array (7 fields)
  - integrationCompatibility group (5 sections)
  - ownerReviews array (13 fields with nested ratings)
  - visualDemoContent group (5 sections: 360°, 3D, hotspots, video, AR)
- [ ] Additional enhancements added (technicalDocumentation, warrantySupport)
- [ ] All new fields are optional
- [ ] Rich text fields use lexicalEditor
- [ ] Yacht relationships work in ownerReviews
- [ ] Rating constraints enforced (1-5 range)
- [ ] Existing product data intact
- [ ] TypeScript types generated successfully

## Testing Requirements

### Unit Tests (from test-backend-collections)
- Test comparisonMetrics array structure
- Test rating constraints (1-5 range) in ownerReviews
- Test integrationCompatibility nested arrays
- Test visualDemoContent 360° images array
- Test interactiveHotspots nested structure
- Test yacht relationships in reviews
- Test conditional field (API docs URL)

### Manual Testing
1. Open existing product in admin
2. Add 3 comparison metrics with different categories
3. Add integration compatibility with protocols
4. Add owner review with detailed ratings
5. Upload 360° images (3 angles)
6. Add interactive hotspot to image
7. Add video walkthrough with chapters
8. Add technical documentation (manual, spec)
9. Fill warranty & support details
10. Verify all data saves correctly

### Integration Testing
- Verify yacht relationships in reviews
- Test rich text rendering in reviews
- Verify media uploads for 360° images, hotspots, 3D thumbnails

## Evidence Required

**Code Files:**
1. Updated `src/collections/Products.ts` (estimated additional ~400 lines)
2. Generated `src/payload-types.ts` with enhanced Product interface

**Test Results:**
- Unit test output showing all Products tests passing
- Screenshot of enhanced product form in admin UI
- Sample product with comparison metrics, reviews, visual demo content

**Verification Checklist:**
- [ ] File updated: `src/collections/Products.ts`
- [ ] All 4 major sections added
- [ ] Rating constraints working (1-5)
- [ ] Yacht relationships working in reviews
- [ ] 360° images array functional
- [ ] Interactive hotspots nested array working
- [ ] Rich text editor working for reviews
- [ ] Conditional API docs field working
- [ ] Existing product data intact

## Context Requirements

**Technical Spec Sections:**
- Lines 194-380: Enhanced Product Fields (complete specification)

**Existing Code:**
- Current `src/collections/Products.ts` - Preserve all existing functionality

**Dependencies:**
- Yachts collection (for relationships in ownerReviews)
- Media collection (for all image uploads)
- lexicalEditor for rich text fields

**Related Tasks:**
- impl-backend-yachts (must exist for yacht relationships)
- impl-frontend-enhanced-transforms (will transform these fields)

## Quality Gates

- [ ] All fields from technical spec implemented (100% coverage)
- [ ] No existing fields removed or modified destructively
- [ ] Rating constraints (1-5) enforced on all rating fields
- [ ] Nested arrays properly structured (hotspots, chapters, protocols)
- [ ] Relationship fields reference valid collections
- [ ] Rich text fields use lexicalEditor correctly
- [ ] No TypeScript errors
- [ ] No linting errors
- [ ] All unit tests pass
- [ ] Existing product data migrates cleanly

## Notes

- This is a complex enhancement (80+ new fields across 4 major sections)
- Visual demo content is unique and innovative (360°, 3D, AR, hotspots)
- Interactive hotspots require nested array of hotspots within array of images
- Owner reviews create valuable social proof and trust
- Comparison metrics enable programmatic product comparisons
- Consider using admin UI tabs:
  - Tab 1: Basic Info (existing)
  - Tab 2: Specifications & Metrics
  - Tab 3: Integration & Compatibility
  - Tab 4: Reviews & Testimonials
  - Tab 5: Visual Demos & Media
  - Tab 6: Documentation & Support
- AR preview features are forward-looking (USDZ for iOS, GLB for Android)
- Video chapters enhance walkthrough navigation
- Ensure 360° images have proper angle metadata for frontend rendering
