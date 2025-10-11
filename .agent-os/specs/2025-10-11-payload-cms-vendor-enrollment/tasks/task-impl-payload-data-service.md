# Task: impl-payload-data-service - Create PayloadCMSDataService to Replace TinaCMSDataService

## Task Metadata
- **Task ID**: impl-payload-data-service
- **Phase**: Phase 2: Backend Implementation
- **Agent**: backend-nodejs-specialist
- **Estimated Time**: 40-50 minutes
- **Dependencies**: [impl-payload-collections]
- **Status**: [ ] Not Started

## Task Description
Create PayloadCMSDataService that replicates TinaCMSDataService interface but fetches data from Payload CMS instead of markdown files. Maintain backward compatibility for existing frontend code.

## Specifics
- **File to Create**: `/home/edwin/development/ptnextjs/lib/payload-cms-data-service.ts`
- **Methods to Implement** (matching TinaCMSDataService):
  - `getVendors(filters?)` → Array<Vendor>
  - `getVendorBySlug(slug)` → Vendor | null
  - `getFeaturedVendors()` → Array<Vendor>
  - `getProducts(filters?)` → Array<Product>
  - `getProductBySlug(slug)` → Product | null
  - `getCategories()` → Array<Category>
  - `getBlogPosts(filters?)` → Array<BlogPost>
  - `getBlogPostBySlug(slug)` → BlogPost | null
  - `getTeamMembers()` → Array<TeamMember>
  - `getCompanyInfo(key)` → any
- **Key Requirements**:
  - Use Payload local API for database queries
  - Implement 5-minute in-memory caching like TinaCMSDataService
  - Transform Payload data to match existing TypeScript interfaces
  - Resolve relationships (vendor in products, author in blog posts)
  - Transform media paths to public URLs
  - Handle published/unpublished filtering

## Acceptance Criteria
- [ ] PayloadCMSDataService created with all methods from TinaCMSDataService
- [ ] All methods return data matching TypeScript interfaces in `/lib/types.ts`
- [ ] 5-minute caching implemented for performance
- [ ] Relationships automatically resolved
- [ ] Media paths transformed to public URLs
- [ ] Published filtering works correctly
- [ ] No breaking changes to existing interface

## Testing Requirements
- Unit tests: Each method with mocked Payload API, caching behavior, relationship resolution
- Integration tests: Fetch real data from database, verify caching works, verify filtering

## Related Files
- Original Service: `/home/edwin/development/ptnextjs/lib/tinacms-data-service.ts`
- Types: `/home/edwin/development/ptnextjs/lib/types.ts`
