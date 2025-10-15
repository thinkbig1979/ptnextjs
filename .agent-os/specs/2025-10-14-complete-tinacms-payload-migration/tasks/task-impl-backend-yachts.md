# Task IMPL-BACKEND-YACHTS: Create Yachts Collection with Timeline, Supplier Map, Sustainability

## Task Metadata
- **Task ID**: impl-backend-yachts
- **Phase**: Phase 2 - Backend Implementation
- **Agent Assignment**: backend-nodejs-specialist
- **Estimated Time**: 6 hours
- **Dependencies**: test-backend-collections, impl-backend-tags
- **Status**: Ready for Implementation
- **Priority**: High

## Task Description

Implement the comprehensive Yachts collection in Payload CMS with advanced features including project timeline, supplier map with vendor relationships, sustainability metrics, and maintenance history. This is a new collection that tracks superyacht projects showcasing technology implementations.

## Specifics

### File to Create
`/home/edwin/development/ptnextjs/src/collections/Yachts.ts`

### Collection Configuration

**Collection Properties:**
- `slug`: 'yachts'
- `admin.useAsTitle`: 'name'
- `admin.defaultColumns`: ['name', 'builder', 'lengthMeters', 'launchYear', 'updatedAt']
- `access`: Admin-only for create/update/delete; public read
- `timestamps`: true

### Core Fields (Technical Spec lines 383-527)

#### Basic Information
```typescript
{ name: 'name', type: 'text', required: true, unique: true }
{ name: 'slug', type: 'text', required: true, unique: true, index: true, hooks: { beforeValidate: [slugifyHook] } }
{ name: 'tagline', type: 'text' }
{ name: 'description', type: 'richText', editor: lexicalEditor() }
{ name: 'heroImage', type: 'upload', relationTo: 'media' }
```

#### Specifications
```typescript
{
  name: 'specifications',
  type: 'group',
  fields: [
    { name: 'builder', type: 'text', required: true },
    { name: 'lengthMeters', type: 'number', required: true },
    { name: 'beamMeters', type: 'number' },
    { name: 'draftMeters', type: 'number' },
    { name: 'tonnage', type: 'number' },
    { name: 'launchYear', type: 'number', required: true },
    { name: 'deliveryDate', type: 'date' },
    { name: 'flagState', type: 'text' },
    { name: 'classification', type: 'text' }
  ]
}
```

#### Timeline (Array Field)
```typescript
{
  name: 'timeline',
  type: 'array',
  label: 'Project Timeline',
  admin: { description: 'Key milestones and events in yacht project lifecycle' },
  fields: [
    { name: 'date', type: 'date', required: true },
    { name: 'title', type: 'text', required: true },
    { name: 'description', type: 'textarea' },
    {
      name: 'category',
      type: 'select',
      required: true,
      options: [
        { label: 'Design', value: 'design' },
        { label: 'Construction', value: 'construction' },
        { label: 'Launch', value: 'launch' },
        { label: 'Sea Trials', value: 'sea_trials' },
        { label: 'Delivery', value: 'delivery' },
        { label: 'Refit', value: 'refit' },
        { label: 'Technology Installation', value: 'tech_installation' },
        { label: 'Certification', value: 'certification' }
      ]
    },
    { name: 'image', type: 'upload', relationTo: 'media' }
  ]
}
```

#### Supplier Map (Array with Vendor Relationships)
```typescript
{
  name: 'supplierMap',
  type: 'array',
  label: 'Technology Supplier Map',
  admin: { description: 'Vendors and products installed on this yacht' },
  fields: [
    {
      name: 'vendor',
      type: 'relationship',
      relationTo: 'vendors',
      required: true,
      admin: { description: 'Technology vendor/supplier' }
    },
    {
      name: 'products',
      type: 'relationship',
      relationTo: 'products',
      hasMany: true,
      admin: { description: 'Specific products installed' }
    },
    {
      name: 'systemCategory',
      type: 'select',
      required: true,
      options: [
        { label: 'Navigation & Bridge', value: 'navigation' },
        { label: 'Communication Systems', value: 'communication' },
        { label: 'Entertainment & AV', value: 'entertainment' },
        { label: 'Automation & Control', value: 'automation' },
        { label: 'Security & Surveillance', value: 'security' },
        { label: 'Propulsion & Engine', value: 'propulsion' },
        { label: 'Power & Energy', value: 'power' },
        { label: 'HVAC & Climate', value: 'hvac' },
        { label: 'Water Treatment', value: 'water' },
        { label: 'Safety & Fire Suppression', value: 'safety' }
      ]
    },
    { name: 'installationDate', type: 'date' },
    { name: 'notes', type: 'textarea' }
  ]
}
```

#### Sustainability Metrics
```typescript
{
  name: 'sustainability',
  type: 'group',
  label: 'Sustainability Profile',
  fields: [
    {
      name: 'co2EmissionsTonsPerYear',
      type: 'number',
      admin: { description: 'Estimated annual CO2 emissions in tons' }
    },
    {
      name: 'energyEfficiencyRating',
      type: 'select',
      options: [
        { label: 'A+ (Exceptional)', value: 'a_plus' },
        { label: 'A (Excellent)', value: 'a' },
        { label: 'B (Good)', value: 'b' },
        { label: 'C (Average)', value: 'c' },
        { label: 'D (Below Average)', value: 'd' },
        { label: 'E (Poor)', value: 'e' }
      ]
    },
    { name: 'hybridPropulsion', type: 'checkbox', defaultValue: false },
    { name: 'solarPanelCapacityKw', type: 'number' },
    { name: 'batteryStorageKwh', type: 'number' },
    {
      name: 'sustainabilityFeatures',
      type: 'array',
      fields: [
        { name: 'feature', type: 'text', required: true },
        { name: 'description', type: 'textarea' }
      ]
    },
    { name: 'greenCertifications', type: 'array', fields: [{ name: 'certification', type: 'text' }] }
  ]
}
```

#### Maintenance History
```typescript
{
  name: 'maintenanceHistory',
  type: 'array',
  label: 'Maintenance & Upgrade History',
  fields: [
    { name: 'date', type: 'date', required: true },
    { name: 'type', type: 'select', required: true, options: [
      { label: 'Scheduled Maintenance', value: 'scheduled' },
      { label: 'Repair', value: 'repair' },
      { label: 'Upgrade', value: 'upgrade' },
      { label: 'Refit', value: 'refit' },
      { label: 'Technology Update', value: 'tech_update' }
    ]},
    { name: 'description', type: 'textarea', required: true },
    { name: 'vendor', type: 'relationship', relationTo: 'vendors' },
    { name: 'cost', type: 'number' },
    { name: 'location', type: 'text' }
  ]
}
```

#### Additional Fields
```typescript
{ name: 'gallery', type: 'array', fields: [{ name: 'image', type: 'upload', relationTo: 'media' }] }
{ name: 'videoTour', type: 'text', admin: { description: 'YouTube or Vimeo video URL' } }
{ name: 'websiteUrl', type: 'text' }
{ name: 'featured', type: 'checkbox', defaultValue: false }
{ name: 'status', type: 'select', options: [
  { label: 'In Design', value: 'design' },
  { label: 'Under Construction', value: 'construction' },
  { label: 'Sea Trials', value: 'trials' },
  { label: 'Active', value: 'active' },
  { label: 'In Refit', value: 'refit' }
], defaultValue: 'active' }
```

### Hooks to Implement

1. **Slug Generation** (beforeValidate)
   - Auto-generate from name using slugify
   - Ensure uniqueness

2. **Timeline Sorting** (beforeChange) - Optional
   - Sort timeline array by date descending
   - Most recent events first

### Implementation Requirements

1. **Import Dependencies**
   ```typescript
   import { CollectionConfig } from 'payload/types';
   import { lexicalEditor } from '@payloadcms/richtext-lexical';
   import slugify from 'slugify';
   ```

2. **Export Configuration**
   ```typescript
   const Yachts: CollectionConfig = {
     // ... configuration
   };

   export default Yachts;
   ```

3. **Add to Payload Config**
   - Update `payload.config.ts` to include Yachts collection

4. **TypeScript Type Generation**
   - Run `payload generate:types`
   - Verify Yacht interface includes all nested structures

## Acceptance Criteria

- [ ] File `src/collections/Yachts.ts` created with complete configuration
- [ ] All core fields implemented (name, slug, tagline, description, heroImage, specifications)
- [ ] Timeline array field implemented with 5 properties and 8 category options
- [ ] Supplier map array implemented with vendor/product relationships and 10 system categories
- [ ] Sustainability group implemented with 8 fields including nested arrays
- [ ] Maintenance history array implemented with 6 fields
- [ ] Additional fields implemented (gallery, videoTour, websiteUrl, featured, status)
- [ ] Slug auto-generation hook implemented
- [ ] Access control configured (admin write, public read)
- [ ] Yachts collection added to `payload.config.ts`
- [ ] TypeScript types generated successfully

## Testing Requirements

### Unit Tests (from test-backend-collections)
- Run tests in `src/collections/__tests__/Yachts.test.ts`
- Test timeline array validation (date, title, category required)
- Test supplier map vendor relationships
- Test sustainability metrics validation
- Test maintenance history array
- Test slug generation
- Test enum validations (timeline categories, system categories, energy rating, status)

### Manual Testing
1. Create a test yacht via Payload admin
2. Add 3 timeline events with different categories
3. Add 2 suppliers to supplier map with vendor relationships
4. Fill in sustainability metrics
5. Add 1 maintenance record
6. Upload hero image and gallery images
7. Verify all data saves correctly
8. Test relationship resolution (vendor references work)

### Integration Testing
- Verify vendor relationships in supplier map resolve correctly
- Test product relationships in supplier map
- Verify timeline sorting (if implemented)
- Test rich text description rendering

## Evidence Required

**Code Files:**
1. `src/collections/Yachts.ts` - Complete collection (estimated ~500 lines)
2. Updated `payload.config.ts`
3. Generated `src/payload-types.ts` with Yacht interface

**Test Results:**
- Unit test output showing all Yachts tests passing
- Screenshot of Yachts collection in admin UI
- Sample yacht created with timeline, supplier map, sustainability data

**Verification Checklist:**
- [ ] File exists: `src/collections/Yachts.ts`
- [ ] Collection registered in config
- [ ] All 4 major sections implemented (timeline, supplierMap, sustainability, maintenanceHistory)
- [ ] Vendor relationships working in supplier map
- [ ] Rich text editor working for description
- [ ] All enum fields have correct options
- [ ] TypeScript types include nested structures

## Context Requirements

**Technical Spec Sections:**
- Lines 383-527: Yachts Collection Schema (complete specification)

**Dependencies:**
- Vendors collection (for supplier map relationships)
- Products collection (for supplier map relationships)
- Media collection (for images)
- lexicalEditor for rich text

**Related Tasks:**
- impl-backend-tags (tags may be added to yachts later)
- impl-frontend-yacht-methods (frontend data service methods)

## Quality Gates

- [ ] All fields from technical spec implemented (100% coverage)
- [ ] Timeline array has 8 category options
- [ ] Supplier map has 10 system category options
- [ ] Sustainability has energy efficiency rating (6 options)
- [ ] Maintenance history has 5 type options
- [ ] Status field has 5 options
- [ ] All required fields enforced
- [ ] All relationship fields configured correctly
- [ ] No TypeScript errors
- [ ] No linting errors
- [ ] All unit tests pass

## Notes

- This is the most complex collection (timeline, supplier map, sustainability, maintenance)
- Supplier map creates critical vendor→yacht relationships
- Timeline events should be sortable by date in admin UI
- Sustainability metrics are important for marketing/showcase
- Consider adding validation for video URL format (YouTube/Vimeo)
- Gallery images may need ordering/caption support in future
- Maintenance history provides valuable service record tracking
