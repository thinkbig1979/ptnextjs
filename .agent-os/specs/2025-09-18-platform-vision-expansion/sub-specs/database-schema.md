# Database Schema

This is the database schema implementation for the spec detailed in @.agent-os/specs/2025-09-18-platform-vision-expansion/spec.md

> Created: 2025-09-18
> Version: 1.0.0

## TinaCMS Schema Extensions

### Enhanced Vendor Schema
```typescript
// Extend existing vendor collection in tina/config.ts
fields: [
  // ... existing fields
  {
    name: "certifications",
    label: "Certifications",
    type: "object",
    list: true,
    fields: [
      { name: "name", type: "string", required: true },
      { name: "issuer", type: "string", required: true },
      { name: "year", type: "number" },
      { name: "expiryDate", type: "datetime" },
      { name: "certificateUrl", type: "string" },
      { name: "logo", type: "image" }
    ]
  },
  {
    name: "awards",
    label: "Awards & Recognition",
    type: "object",
    list: true,
    fields: [
      { name: "title", type: "string", required: true },
      { name: "year", type: "number", required: true },
      { name: "organization", type: "string" },
      { name: "category", type: "string" },
      { name: "description", type: "rich-text" }
    ]
  },
  {
    name: "socialProof",
    label: "Social Proof",
    type: "object",
    fields: [
      { name: "followers", type: "number" },
      { name: "projectsCompleted", type: "number" },
      { name: "yearsInBusiness", type: "number" },
      { name: "customerList", type: "string", list: true }
    ]
  },
  {
    name: "videoIntroduction",
    label: "Video Introduction",
    type: "object",
    fields: [
      { name: "videoUrl", type: "string" },
      { name: "thumbnailImage", type: "image" },
      { name: "title", type: "string" },
      { name: "description", type: "string" }
    ]
  },
  {
    name: "caseStudies",
    label: "Case Studies",
    type: "object",
    list: true,
    fields: [
      { name: "title", type: "string", required: true },
      { name: "slug", type: "string", required: true },
      { name: "client", type: "string" },
      { name: "challenge", type: "rich-text", required: true },
      { name: "solution", type: "rich-text", required: true },
      { name: "results", type: "rich-text" },
      { name: "images", type: "image", list: true },
      { name: "technologies", type: "string", list: true }
    ]
  },
  {
    name: "innovationHighlights",
    label: "Innovation Highlights",
    type: "object",
    list: true,
    fields: [
      { name: "technology", type: "string", required: true },
      { name: "description", type: "rich-text" },
      { name: "uniqueApproach", type: "string" },
      { name: "benefitsToClients", type: "string", list: true }
    ]
  },
  {
    name: "teamMembers",
    label: "Team Members",
    type: "object",
    list: true,
    fields: [
      { name: "name", type: "string", required: true },
      { name: "position", type: "string", required: true },
      { name: "bio", type: "rich-text" },
      { name: "photo", type: "image" },
      { name: "linkedinUrl", type: "string" },
      { name: "expertise", type: "string", list: true }
    ]
  },
  {
    name: "yachtProjects",
    label: "Yacht Projects",
    type: "object",
    list: true,
    fields: [
      { name: "yachtName", type: "string", required: true },
      { name: "systems", type: "string", list: true, required: true },
      { name: "projectYear", type: "number" },
      { name: "role", type: "string" },
      { name: "description", type: "string" }
    ]
  }
]
```

### Enhanced Product Schema
```typescript
// Extend existing product collection
fields: [
  // ... existing fields
  {
    name: "comparisonMetrics",
    label: "Comparison Metrics",
    type: "object",
    fields: [
      { name: "competitorProducts", type: "string", list: true },
      { name: "keyDifferentiators", type: "string", list: true },
      { name: "priceRange", type: "string" },
      { name: "performanceScore", type: "number" }
    ]
  },
  {
    name: "integrationNotes",
    label: "Integration Compatibility",
    type: "object",
    fields: [
      { name: "compatibleSystems", type: "string", list: true },
      { name: "compatibleBrands", type: "string", list: true },
      { name: "integrationRequirements", type: "rich-text" },
      { name: "installationNotes", type: "string" }
    ]
  },
  {
    name: "performanceMetrics",
    label: "Performance Specifications",
    type: "object",
    fields: [
      { name: "specSheetPdf", type: "string" },
      { name: "keySpecs", type: "object", list: true, fields: [
        { name: "metric", type: "string" },
        { name: "value", type: "string" },
        { name: "unit", type: "string" }
      ]},
      { name: "testResults", type: "rich-text" }
    ]
  },
  {
    name: "ownerReviews",
    label: "Owner Reviews",
    type: "object",
    list: true,
    fields: [
      { name: "reviewerName", type: "string" },
      { name: "yachtName", type: "string" },
      { name: "rating", type: "number", required: true },
      { name: "review", type: "rich-text", required: true },
      { name: "useCase", type: "string" },
      { name: "dateReviewed", type: "datetime" }
    ]
  },
  {
    name: "visualDemo",
    label: "Visual Demonstration",
    type: "object",
    fields: [
      { name: "demoType", type: "string", options: ["360_image", "video", "3d_model"] },
      { name: "demoUrl", type: "string" },
      { name: "thumbnailImage", type: "image" },
      { name: "description", type: "string" }
    ]
  }
]
```

### New Yacht Collection Schema
```typescript
// New yacht collection in tina/config.ts
{
  name: "yacht",
  label: "Yachts",
  path: "content/yachts",
  format: "md",
  fields: [
    { name: "title", type: "string", required: true },
    { name: "slug", type: "string", required: true },
    { name: "description", type: "rich-text" },
    { name: "featuredImage", type: "image" },
    { name: "gallery", type: "image", list: true },
    { name: "specifications", type: "object", fields: [
      { name: "length", type: "string" },
      { name: "beam", type: "string" },
      { name: "draft", type: "string" },
      { name: "yearBuilt", type: "number" },
      { name: "builder", type: "string" },
      { name: "designer", type: "string" }
    ]},
    {
      name: "projectTimeline",
      label: "Project Timeline",
      type: "object",
      list: true,
      fields: [
        { name: "milestone", type: "string", required: true },
        { name: "date", type: "datetime", required: true },
        { name: "description", type: "string" },
        { name: "status", type: "string", options: ["completed", "in_progress", "planned"] }
      ]
    },
    {
      name: "supplierMap",
      label: "Supplier Involvement",
      type: "object",
      list: true,
      fields: [
        { name: "vendor", type: "reference", collections: ["vendor"], required: true },
        { name: "discipline", type: "string", required: true },
        { name: "systems", type: "string", list: true },
        { name: "role", type: "string" },
        { name: "timeframe", type: "string" }
      ]
    },
    {
      name: "sustainabilityMetrics",
      label: "Sustainability & Efficiency",
      type: "object",
      fields: [
        { name: "co2Footprint", type: "number" },
        { name: "hybridPropulsion", type: "boolean" },
        { name: "waterTreatment", type: "string" },
        { name: "sustainabilityScore", type: "number" },
        { name: "efficiencyFeatures", type: "string", list: true }
      ]
    },
    {
      name: "customizations",
      label: "Unique Customizations",
      type: "object",
      list: true,
      fields: [
        { name: "system", type: "string", required: true },
        { name: "customization", type: "string", required: true },
        { name: "description", type: "rich-text" },
        { name: "vendor", type: "reference", collections: ["vendor"] }
      ]
    },
    {
      name: "ownerPreferences",
      label: "Owner Preferences (Optional)",
      type: "object",
      fields: [
        { name: "favoriteAudioSystem", type: "string" },
        { name: "preferredLightingScenes", type: "string", list: true },
        { name: "recreationalToys", type: "string", list: true },
        { name: "entertainmentPreferences", type: "string" }
      ]
    },
    {
      name: "maintenanceHistory",
      label: "Maintenance & Service",
      type: "object",
      list: true,
      fields: [
        { name: "serviceType", type: "string", required: true },
        { name: "date", type: "datetime", required: true },
        { name: "vendor", type: "reference", collections: ["vendor"] },
        { name: "description", type: "string" },
        { name: "nextServiceDue", type: "datetime" }
      ]
    }
  ]
}
```

## Content Migration Strategy

### Existing Content Preservation
- All current vendor and product content remains unchanged
- New fields are optional to maintain backward compatibility
- Existing reference relationships are preserved

### Data Population Approach
- Phase 1: Schema deployment with empty new fields
- Phase 2: Gradual content population through TinaCMS admin
- Phase 3: Sample yacht profiles creation for demonstration

### Reference Integrity
- Yacht-vendor relationships use existing vendor references
- Product comparisons reference existing product slugs
- All new reference fields include validation

## Performance Considerations

### Caching Strategy
- Extend existing 5-minute cache to include yacht data
- Implement selective cache invalidation for related content updates
- Maintain static generation compatibility for all new content types

### Query Optimization
- Index yacht timeline and supplier map queries
- Pre-compute sustainability scores during build
- Cache comparison matrix data for product pages

### Content Validation
- Validate all reference fields during TinaCMS save
- Ensure timeline chronological ordering
- Verify supplier map vendor references exist