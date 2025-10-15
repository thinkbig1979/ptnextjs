# Task IMPL-BACKEND-VENDOR-ENHANCE: Enhance Vendors Collection with All Missing Fields

## Task Metadata
- **Task ID**: impl-backend-vendor-enhance
- **Phase**: Phase 2 - Backend Implementation
- **Agent Assignment**: backend-nodejs-specialist
- **Estimated Time**: 8 hours
- **Dependencies**: test-backend-collections, impl-backend-tags
- **Status**: Ready for Implementation
- **Priority**: Critical

## Task Description

Enhance the existing Vendors collection with comprehensive new fields including certifications, awards, social proof metrics, video introduction, case studies, innovation highlights, team members, and yacht projects portfolio. This transforms the basic vendor listing into a rich company profile.

## Specifics

### File to Update
`/home/edwin/development/ptnextjs/src/collections/Vendors.ts`

### Enhanced Fields to Add (Technical Spec lines 28-184)

#### Certifications Array
```typescript
{
  name: 'certifications',
  type: 'array',
  label: 'Certifications & Accreditations',
  admin: { description: 'Industry certifications and quality standards' },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'issuer', type: 'text', required: true },
    { name: 'year', type: 'number', required: true },
    { name: 'expiryDate', type: 'date' },
    { name: 'certificateNumber', type: 'text' },
    { name: 'logo', type: 'upload', relationTo: 'media' },
    { name: 'verificationUrl', type: 'text' }
  ]
}
```

#### Awards Array
```typescript
{
  name: 'awards',
  type: 'array',
  label: 'Awards & Recognition',
  admin: { description: 'Industry awards and accolades received' },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'organization', type: 'text', required: true },
    { name: 'year', type: 'number', required: true },
    { name: 'category', type: 'text' },
    { name: 'description', type: 'textarea' },
    { name: 'image', type: 'upload', relationTo: 'media' }
  ]
}
```

#### Social Proof Metrics Group
```typescript
{
  name: 'socialProof',
  type: 'group',
  label: 'Social Proof & Metrics',
  fields: [
    { name: 'totalProjects', type: 'number', admin: { description: 'Total yacht projects completed' } },
    { name: 'yearsInBusiness', type: 'number', admin: { description: 'Years of operation' } },
    { name: 'employeeCount', type: 'number', admin: { description: 'Number of employees' } },
    { name: 'linkedinFollowers', type: 'number' },
    { name: 'instagramFollowers', type: 'number' },
    { name: 'clientSatisfactionScore', type: 'number', admin: { description: 'Out of 10' }, min: 0, max: 10 },
    { name: 'repeatClientPercentage', type: 'number', admin: { description: 'Percentage of repeat clients' }, min: 0, max: 100 }
  ]
}
```

#### Video Introduction Group
```typescript
{
  name: 'videoIntro',
  type: 'group',
  label: 'Video Introduction',
  admin: { description: 'Company introduction or facility tour video' },
  fields: [
    { name: 'videoUrl', type: 'text', admin: { description: 'YouTube or Vimeo URL' } },
    { name: 'thumbnail', type: 'upload', relationTo: 'media' },
    { name: 'duration', type: 'number', admin: { description: 'Video duration in seconds' } },
    { name: 'title', type: 'text' },
    { name: 'description', type: 'textarea' }
  ]
}
```

#### Case Studies Array
```typescript
{
  name: 'caseStudies',
  type: 'array',
  label: 'Case Studies',
  admin: { description: 'Detailed project case studies showcasing expertise' },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'yachtName', type: 'text', admin: { description: 'Name of yacht (if disclosable)' } },
    { name: 'yacht', type: 'relationship', relationTo: 'yachts', admin: { description: 'Link to yacht profile' } },
    { name: 'projectDate', type: 'date', required: true },
    { name: 'challenge', type: 'richText', required: true, editor: lexicalEditor() },
    { name: 'solution', type: 'richText', required: true, editor: lexicalEditor() },
    { name: 'results', type: 'richText', required: true, editor: lexicalEditor() },
    { name: 'testimonyQuote', type: 'textarea' },
    { name: 'testimonyAuthor', type: 'text' },
    { name: 'testimonyRole', type: 'text' },
    { name: 'images', type: 'array', fields: [{ name: 'image', type: 'upload', relationTo: 'media' }] },
    { name: 'featured', type: 'checkbox', defaultValue: false }
  ]
}
```

#### Innovation Highlights Array
```typescript
{
  name: 'innovations',
  type: 'array',
  label: 'Innovation Highlights',
  admin: { description: 'Proprietary technologies and innovations' },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'description', type: 'richText', required: true, editor: lexicalEditor() },
    { name: 'year', type: 'number', admin: { description: 'Year introduced' } },
    { name: 'patentNumber', type: 'text' },
    { name: 'benefits', type: 'array', fields: [{ name: 'benefit', type: 'text' }] },
    { name: 'image', type: 'upload', relationTo: 'media' }
  ]
}
```

#### Team Members Array
```typescript
{
  name: 'teamMembers',
  type: 'array',
  label: 'Key Team Members',
  admin: { description: 'Leadership and key personnel' },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'role', type: 'text', required: true },
    { name: 'bio', type: 'textarea' },
    { name: 'photo', type: 'upload', relationTo: 'media' },
    { name: 'linkedinUrl', type: 'text' },
    { name: 'email', type: 'email' },
    { name: 'displayOrder', type: 'number', defaultValue: 0 }
  ]
}
```

#### Yacht Projects Portfolio Array
```typescript
{
  name: 'yachtProjects',
  type: 'array',
  label: 'Yacht Projects Portfolio',
  admin: { description: 'Notable yacht projects completed' },
  fields: [
    { name: 'yacht', type: 'relationship', relationTo: 'yachts' },
    { name: 'yachtName', type: 'text', admin: { description: 'Used if yacht profile not available' } },
    { name: 'role', type: 'text', required: true, admin: { description: 'Role in project (e.g., "Main AV Integrator")' } },
    { name: 'completionDate', type: 'date' },
    { name: 'systemsInstalled', type: 'array', fields: [{ name: 'system', type: 'text' }] },
    { name: 'image', type: 'upload', relationTo: 'media' },
    { name: 'featured', type: 'checkbox', defaultValue: false }
  ]
}
```

### Additional Enhancements

#### Enhanced Description
```typescript
{
  name: 'longDescription',
  type: 'richText',
  label: 'Detailed Company Description',
  editor: lexicalEditor(),
  admin: { description: 'Extended company profile with rich formatting' }
}
```

#### Service Areas Enhancement
```typescript
{
  name: 'serviceAreas',
  type: 'array',
  label: 'Service Areas & Expertise',
  fields: [
    { name: 'area', type: 'text', required: true },
    { name: 'description', type: 'textarea' },
    { name: 'icon', type: 'text', admin: { description: 'Icon name or emoji' } }
  ]
}
```

#### Company Values
```typescript
{
  name: 'companyValues',
  type: 'array',
  label: 'Company Values',
  fields: [
    { name: 'value', type: 'text', required: true },
    { name: 'description', type: 'textarea' }
  ]
}
```

### Implementation Requirements

1. **Preserve Existing Fields**
   - Keep all current fields intact
   - Maintain existing hooks and validation
   - Ensure backward compatibility with existing vendor data

2. **Add New Sections**
   - Group related fields logically in admin UI
   - Use admin groups/tabs for organization
   - Add helpful descriptions for all new fields

3. **Update TypeScript Types**
   - Run `payload generate:types` after implementation
   - Verify extended Vendor interface includes all new fields

4. **Migration Considerations**
   - All new fields should be optional (not required)
   - Provide sensible default values where applicable
   - Existing vendors will have null/undefined for new fields initially

## Acceptance Criteria

- [ ] All 8 major enhancements added to Vendors collection:
  - certifications array (7 fields)
  - awards array (6 fields)
  - socialProof group (7 metrics)
  - videoIntro group (5 fields)
  - caseStudies array (12 fields with rich text)
  - innovations array (6 fields)
  - teamMembers array (7 fields)
  - yachtProjects array (7 fields)
- [ ] Additional enhancements added (longDescription, serviceAreas, companyValues)
- [ ] All new fields are optional (not required)
- [ ] Rich text fields use lexicalEditor
- [ ] Relationship fields reference correct collections (yachts)
- [ ] Existing vendor data remains intact
- [ ] TypeScript types generated successfully
- [ ] Collection accessible in admin UI with organized field groups

## Testing Requirements

### Unit Tests (from test-backend-collections)
- Run tests in `src/collections/__tests__/Vendors.test.ts`
- Test certifications array structure
- Test awards array structure
- Test socialProof metrics validation (min/max constraints)
- Test videoIntro group
- Test caseStudies with yacht relationships
- Test innovations array
- Test teamMembers array with email validation
- Test yachtProjects with yacht relationships

### Manual Testing
1. Open existing vendor in admin UI
2. Verify all new fields appear in admin
3. Add certification with logo upload
4. Add award with image
5. Fill in social proof metrics
6. Add video introduction with URL
7. Create case study with challenge/solution/results
8. Add innovation with patent number
9. Add team member with photo
10. Add yacht project with relationship to yacht
11. Save and verify all data persists

### Integration Testing
- Verify yacht relationships work in caseStudies and yachtProjects
- Test rich text rendering for caseStudies and innovations
- Verify media uploads work for logos, images, photos

## Evidence Required

**Code Files:**
1. Updated `src/collections/Vendors.ts` (estimated additional ~300 lines)
2. Generated `src/payload-types.ts` with enhanced Vendor interface

**Test Results:**
- Unit test output showing all Vendors tests passing
- Screenshot of enhanced vendor form in admin UI
- Sample vendor with all new fields populated

**Verification Checklist:**
- [ ] File updated: `src/collections/Vendors.ts`
- [ ] All 8 major sections added
- [ ] Rich text editors working for longDescription, caseStudies, innovations
- [ ] Yacht relationships working in caseStudies and yachtProjects
- [ ] Media uploads working for certifications, awards, innovations, team photos
- [ ] Email validation working for team members
- [ ] Numeric constraints working for socialProof metrics
- [ ] Existing vendor data intact after update

## Context Requirements

**Technical Spec Sections:**
- Lines 28-184: Enhanced Vendor Fields (complete specification)

**Existing Code:**
- Current `src/collections/Vendors.ts` - Preserve all existing functionality

**Dependencies:**
- Yachts collection (for relationships in caseStudies and yachtProjects)
- Media collection (for all image/logo/photo uploads)
- lexicalEditor for rich text fields

**Related Tasks:**
- impl-backend-yachts (must exist for yacht relationships)
- impl-frontend-enhanced-transforms (will transform these fields for frontend)

## Quality Gates

- [ ] All fields from technical spec implemented (100% coverage)
- [ ] No existing fields removed or modified destructively
- [ ] All array fields have properly structured child fields
- [ ] All relationship fields reference valid collections
- [ ] Rich text fields use lexicalEditor correctly
- [ ] Email validation working for team members
- [ ] Numeric min/max constraints applied correctly
- [ ] No TypeScript errors
- [ ] No linting errors
- [ ] All unit tests pass
- [ ] Existing vendor data migrates cleanly

## Notes

- This is a large enhancement (100+ new fields across 8 sections)
- Break implementation into logical sections if needed
- Test each section independently before moving to next
- Consider using admin UI tabs to organize fields:
  - Tab 1: Basic Info (existing fields)
  - Tab 2: Certifications & Awards
  - Tab 3: Social Proof & Metrics
  - Tab 4: Case Studies & Innovations
  - Tab 5: Team & Projects
- Ensure rich text editors are properly configured with needed plugins
- Yacht relationships create bidirectional vendor→yacht→vendor links
- Social proof metrics can be auto-populated from other collections later
- Consider adding field validation for URL formats (videoIntro, verificationUrl)
