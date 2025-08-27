# TinaCMS Migration Plan: Complete Strapi Removal

## Overview
This document outlines the complete migration from Strapi CMS to TinaCMS for our Next.js application with Static Site Generation (SSG). The migration will modernize the content management system, improve developer experience, and eliminate the current Strapi API endpoint issues while maintaining all existing functionality.

## Current State Analysis
**Project Location**: `/home/edwin/development/ptnextjs`  
**Current CMS**: Strapi (with API connectivity issues)  
**Target CMS**: TinaCMS (Git-based, file-driven)  
**Architecture**: Next.js with SSG  
**Content Types**: 7 core types with 52+ fields and 8 relationships  

### Identified Content Types:
1. **Partner** (18 entries) - Marine technology companies
2. **Product** (36+ entries) - Products/services with image galleries  
3. **BlogPost** (8 entries) - Content marketing articles
4. **TeamMember** (4 entries) - Company team profiles
5. **Category** (11 entries) - Technology categorization
6. **BlogCategory** - Blog-specific categories
7. **CompanyInfo** (1 entry) - Single-type company data

## Milestones

### **Milestone 1: Research & Architecture Design**
**Duration**: 1-2 days  
**Status**: Starting

#### Acceptance Criteria:
- [ ] Complete research of TinaCMS documentation and best practices
- [ ] Understand TinaCMS schema configuration for complex relationships
- [ ] Identify optimal file structure for Git-based content management
- [ ] Design migration strategy for media files and images
- [ ] Document TinaCMS schema architecture

#### Dependencies:
- Context7 access for TinaCMS documentation research
- Current project structure analysis

#### Estimated Time: 8-12 hours

---

### **Milestone 2: Schema Design & Configuration**
**Duration**: 2-3 days  
**Status**: Pending

#### Acceptance Criteria:
- [ ] Create TinaCMS schema definitions for all 7 content types
- [ ] Design relationship handling between content types
- [ ] Configure media management for images and files
- [ ] Set up content validation rules
- [ ] Design file organization structure in `/content` directory

#### Dependencies:
- Milestone 1 completion
- Understanding of current data relationships

#### Estimated Time: 16-20 hours

#### Technical Approach:
```typescript
// Example schema structure for Partner content type
export const partnerSchema = {
  name: 'partner',
  label: 'Partners', 
  path: 'content/partners',
  fields: [
    { name: 'name', type: 'string', required: true },
    { name: 'description', type: 'rich-text', required: true },
    { name: 'logo', type: 'image' },
    { name: 'category', type: 'reference', collections: ['category'] },
    // ... additional fields
  ]
}
```

---

### **Milestone 3: Data Migration Implementation**
**Duration**: 3-4 days  
**Status**: Pending

#### Acceptance Criteria:
- [ ] Export all content from Strapi to structured JSON/Markdown files
- [ ] Transform Strapi data structure to TinaCMS format
- [ ] Migrate all media files to TinaCMS media directory
- [ ] Preserve all relationships between content types
- [ ] Validate data integrity after migration

#### Dependencies:
- Milestone 2 completion
- Access to current Strapi data

#### Estimated Time: 20-24 hours

#### Migration Strategy:
1. **Export Phase**: Extract all content from Strapi API
2. **Transform Phase**: Convert to TinaCMS-compatible format
3. **Import Phase**: Generate Markdown/JSON files with frontmatter
4. **Media Migration**: Move and organize image assets

---

### **Milestone 4: TinaCMS Integration**
**Duration**: 3-4 days  
**Status**: Pending

#### Acceptance Criteria:
- [ ] Install and configure TinaCMS dependencies
- [ ] Set up TinaCMS configuration file
- [ ] Implement content queries using TinaCMS client
- [ ] Replace Strapi client with TinaCMS data service
- [ ] Ensure all existing API endpoints work with new data layer

#### Dependencies:
- Milestone 3 completion
- TinaCMS schema configuration

#### Estimated Time: 20-24 hours

#### Implementation Tasks:
```javascript
// New TinaCMS data service structure
export class TinaCMSService {
  async getPartners(filters) { /* ... */ }
  async getProducts(filters) { /* ... */ }
  async getBlogPosts(filters) { /* ... */ }
  // ... other methods
}
```

---

### **Milestone 5: Component Updates & Testing**
**Duration**: 2-3 days  
**Status**: Pending

#### Acceptance Criteria:
- [ ] Update all React components to use new TinaCMS data structure
- [ ] Ensure image handling works with new media system
- [ ] Test all pages and dynamic routes
- [ ] Verify search functionality works
- [ ] Test build process and static generation

#### Dependencies:
- Milestone 4 completion
- All components identified and updated

#### Estimated Time: 16-20 hours

---

### **Milestone 6: Strapi Removal & Cleanup**
**Duration**: 1-2 days  
**Status**: Pending

#### Acceptance Criteria:
- [ ] Remove all Strapi-related dependencies from package.json
- [ ] Delete Strapi client and related files
- [ ] Remove Strapi environment variables and configurations
- [ ] Delete migration scripts and Strapi-specific documentation
- [ ] Clean up any remaining Strapi references in code

#### Dependencies:
- Milestone 5 completion
- Successful TinaCMS implementation verification

#### Estimated Time: 8-12 hours

#### Files to Remove:
- `/lib/strapi-client.ts`
- All migration scripts in `/migration-scripts/`
- Strapi-related documentation files
- Environment variables: `STRAPI_API_URL`, `NEXT_PUBLIC_STRAPI_API_URL`

---

### **Milestone 7: Fallback System Removal**
**Duration**: 1 day  
**Status**: Pending

#### Acceptance Criteria:
- [ ] Remove all data fallback systems and static data files
- [ ] Delete `/lib/static-data-service.ts`
- [ ] Remove fallback content from components
- [ ] Clean up any conditional fallback logic
- [ ] Verify application works entirely with TinaCMS

#### Dependencies:
- Milestone 6 completion
- Full TinaCMS functionality verified

#### Estimated Time: 6-8 hours

## Technical Approach

### TinaCMS Architecture Benefits:
1. **Git-based**: Content stored as files in repository
2. **Type-safe**: Generated TypeScript types
3. **Local Development**: No external API required
4. **Version Control**: Content changes tracked in Git
5. **Static Generation**: Perfect for Next.js SSG

### Content Organization:
```
content/
├── partners/
│   ├── company-a.md
│   └── company-b.md
├── products/
│   ├── product-1.md
│   └── product-2.md
├── blog/
│   ├── article-1.md
│   └── article-2.md
├── team/
│   ├── member-1.md
│   └── member-2.md
└── company/
    └── info.md
```

### Media Management:
```
public/media/
├── partners/
├── products/
├── blog/
└── team/
```

## Risk Assessment & Mitigations

### High Risk
1. **Data Loss During Migration**
   - **Risk**: Incomplete or corrupted data transfer
   - **Mitigation**: 
     - Create complete backup of Strapi data
     - Implement validation scripts
     - Test migration on copy before production

2. **Complex Relationship Handling**
   - **Risk**: TinaCMS may handle relationships differently than Strapi
   - **Mitigation**: 
     - Design clear relationship mapping strategy
     - Use TinaCMS reference fields appropriately
     - Test relationship queries thoroughly

### Medium Risk
3. **Image/Media Migration**
   - **Risk**: Media files may not transfer correctly
   - **Mitigation**: 
     - Script automated media download and organization
     - Implement image path transformation
     - Verify all images load correctly

4. **Build Process Changes**
   - **Risk**: SSG build may break with new data layer
   - **Mitigation**: 
     - Test build process incrementally
     - Maintain existing API structure during transition
     - Use feature flags if needed

### Low Risk
5. **Performance Impact**
   - **Risk**: TinaCMS queries might be slower than Strapi
   - **Mitigation**: 
     - Implement proper caching strategies
     - Optimize queries and data fetching
     - Monitor build times

## Success Metrics

### Technical Success Criteria:
- [ ] All 7 content types successfully migrated to TinaCMS
- [ ] All 52+ fields preserved with correct data types
- [ ] All 8 relationships maintained and functional
- [ ] Build time remains under 2 minutes
- [ ] All pages render correctly with new data layer

### Content Management Success Criteria:
- [ ] Content editors can manage all content types via TinaCMS
- [ ] Media upload and management works seamlessly
- [ ] Content changes are committed to Git automatically
- [ ] Preview functionality works for draft content

### Performance Success Criteria:
- [ ] Page load times remain under 2 seconds
- [ ] Lighthouse scores maintain 90+ across all metrics
- [ ] SEO functionality preserved (meta tags, structured data)

## Timeline Summary

**Total Estimated Duration**: 14-18 days  
**Total Estimated Hours**: 94-118 hours

### Phase Breakdown:
- **Planning & Research**: 1-2 days
- **Implementation**: 10-13 days  
- **Testing & Cleanup**: 3-3 days

### Critical Path:
Research → Schema Design → Data Migration → TinaCMS Integration → Testing → Cleanup

## Next Steps

1. **Immediate**: Begin research phase using context7 for TinaCMS documentation
2. **Day 1-2**: Complete architecture design and schema planning
3. **Day 3-5**: Implement data migration scripts
4. **Day 6-9**: Build TinaCMS integration layer
5. **Day 10-12**: Update components and test functionality
6. **Day 13-14**: Remove Strapi dependencies and fallback systems

This migration will modernize the content management system, eliminate API dependency issues, and provide a more maintainable, Git-based content workflow while preserving all existing functionality and data.