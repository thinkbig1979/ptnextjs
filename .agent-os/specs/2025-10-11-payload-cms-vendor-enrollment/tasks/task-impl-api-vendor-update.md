# Task: impl-api-vendor-update - Implement Vendor Profile Update API Endpoint

## Task Metadata
- **Task ID**: impl-api-vendor-update
- **Phase**: Phase 2: Backend Implementation
- **Agent**: backend-nodejs-specialist
- **Estimated Time**: 30-35 minutes
- **Dependencies**: [impl-auth-system]
- **Status**: [x] Complete

## Task Description
Implement PUT /api/vendors/{id} endpoint for vendor profile updates with tier-based field restrictions enforced at API level.

## Specifics
- **File to Create**: `/home/edwin/development/ptnextjs/app/api/vendors/[id]/route.ts`
- **Request**: `{ companyName?, description?, logo?, contactEmail?, contactPhone?, website?, socialLinks?, certifications? }`
- **Tier Restrictions**:
  - Free: companyName, description, logo, contactEmail, contactPhone
  - Tier 1+: website, socialLinks, certifications
  - Tier 2+: (future: products access)
- **Authorization**: Vendor can only update own profile, admin can update any
- **Logic**: Authenticate → Verify ownership → Validate tier restrictions → Filter fields → Update vendor → Return updated data

## Acceptance Criteria
- [x] API route accessible at PUT /api/vendors/{id}
- [x] JWT authentication required
- [x] Ownership verified (vendor ID matches token)
- [x] Tier restrictions enforced for field access
- [x] Free tier vendor cannot update tier1+ fields (403 error)
- [x] Admin can update any vendor
- [x] Input validation with Zod
- [x] Success response returns updated vendor

## Testing Requirements
- Integration tests: Vendor updates own profile (200), vendor updates tier-restricted field (403), vendor updates other profile (403), admin updates any profile (200)
- Unit tests: Tier validation logic, field filtering based on tier

## Related Files
- Technical Spec: PUT /api/vendors/{id} endpoint specification
- Tier Restrictions: `/home/edwin/development/ptnextjs/payload/access/tierRestrictions.ts`
