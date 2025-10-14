# Task: impl-payload-collections - Create Payload CMS Collection Schemas

## Task Metadata
- **Task ID**: impl-payload-collections
- **Phase**: Phase 2: Backend Implementation
- **Agent**: backend-nodejs-specialist
- **Estimated Time**: 40-50 minutes
- **Dependencies**: [impl-payload-install]
- **Status**: [ ] Not Started

## Task Description
Create all Payload CMS collection schemas matching the database schema from the technical spec: Users, Vendors, Products, Categories, BlogPosts, TeamMembers, and CompanyInfo. Implement field validations, relationships, and access control hooks.

## Specifics
- **Collection Files to Create**:
  - `/home/edwin/development/ptnextjs/payload/collections/Users.ts` - User authentication with roles
  - `/home/edwin/development/ptnextjs/payload/collections/Vendors.ts` - Vendor profiles with tier restrictions
  - `/home/edwin/development/ptnextjs/payload/collections/Products.ts` - Product catalog with vendor relationships
  - `/home/edwin/development/ptnextjs/payload/collections/Categories.ts` - Hierarchical categories
  - `/home/edwin/development/ptnextjs/payload/collections/BlogPosts.ts` - Blog content
  - `/home/edwin/development/ptnextjs/payload/collections/TeamMembers.ts` - Team profiles
  - `/home/edwin/development/ptnextjs/payload/collections/CompanyInfo.ts` - Company information
- **Key Requirements for Each Collection**:
  - **Users**: email, password, role (admin/vendor), status (pending/approved/rejected), timestamps
  - **Vendors**: user relationship, company_name, slug, tier (free/tier1/tier2), basic info (all tiers), enhanced fields (tier1+), social links (tier1+), published/featured flags
  - **Products**: vendor relationship, name, slug, description, images, categories, specifications (JSONB), published flag
  - **Categories**: name, slug, description, parent_id (self-referencing), icon, published flag
  - **BlogPosts**: title, slug, content, excerpt, author, featured_image, categories, tags, published flag
  - **TeamMembers**: name, role, bio, photo, email, social links, display_order
  - **CompanyInfo**: key-value store with JSONB values
- **Access Control Requirements**:
  - Admins: Full CRUD on all collections
  - Vendors: Read/Update own vendor and products only
  - Public: Read published content only

## Acceptance Criteria
- [ ] All 7 collection schema files created and properly typed
- [ ] Field validations match technical spec requirements (string lengths, enums, etc.)
- [ ] Relationships configured (Users ↔ Vendors, Vendors ↔ Products, Categories self-reference)
- [ ] Slug fields auto-generate from name/title fields
- [ ] Access control hooks implemented for tier restrictions
- [ ] Admin access control enforced for sensitive fields
- [ ] TypeScript types generated successfully
- [ ] Collections visible in Payload admin panel
- [ ] No schema validation errors

## Testing Requirements
- **Functional Testing**:
  - Create test records in each collection via admin panel
  - Verify relationships work correctly (vendor → products)
  - Test slug auto-generation for vendors and products
  - Verify enum validations (tier, role, status)
  - Test cascading deletes (vendor → products)
- **Manual Verification**:
  - Access `/admin/collections/users` and verify fields display
  - Create test vendor with different tiers
  - Verify tier-restricted fields are hidden based on tier
- **Access Control Testing**:
  - Test admin can CRUD all collections
  - Test vendor can only access own records
  - Test public cannot access unpublished content

## Evidence Required
- Screenshots of each collection in Payload admin panel
- Example of tier-restricted field access control working
- TypeScript types file showing generated collection interfaces

## Context Requirements
- Technical Spec: Database schema section
- Payload CMS 3.x collection configuration documentation
- Understanding of access control hooks in Payload
- TypeScript interface definitions from `/lib/types.ts`

## Implementation Notes
- Use Payload's built-in authentication for Users collection
- Implement custom access control functions in `/payload/access/` directory
- Use Payload's relationship field type for foreign keys
- Configure slug fields to auto-populate from name/title
- Use Payload's hooks for custom validation logic
- Ensure all enums match TypeScript type definitions

## Quality Gates
- [ ] All collections compile without TypeScript errors
- [ ] Schema validations prevent invalid data entry
- [ ] Relationships resolve correctly in queries
- [ ] Access control prevents unauthorized access
- [ ] Admin panel displays all fields correctly

## Related Files
- Technical Spec: `/home/edwin/development/ptnextjs/.agent-os/specs/2025-10-11-payload-cms-vendor-enrollment/sub-specs/technical-spec.md` (Database Schema section)
- Types: `/home/edwin/development/ptnextjs/lib/types.ts`
- Payload Config: `/home/edwin/development/ptnextjs/payload.config.ts`
