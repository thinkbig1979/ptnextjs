# Task: impl-api-vendor-registration - Implement Vendor Registration API Endpoint

## Task Metadata
- **Task ID**: impl-api-vendor-registration
- **Phase**: Phase 2: Backend Implementation
- **Agent**: backend-nodejs-specialist
- **Estimated Time**: 25-30 minutes
- **Dependencies**: [impl-auth-system]
- **Status**: [ ] Not Started

## Task Description
Implement POST /api/vendors/register API endpoint for vendor self-registration with admin approval workflow. Include input validation, duplicate detection, password hashing, and proper error handling.

## Specifics
- **File to Create**:
  - `/home/edwin/development/ptnextjs/app/api/vendors/register/route.ts` - Registration endpoint
- **Request Schema**:
  ```typescript
  {
    companyName: string      // 2-100 characters, required
    contactEmail: string     // valid email, required, unique
    contactPhone?: string    // valid phone format, optional
    password: string         // min 12 chars, uppercase, lowercase, number, special char, required
  }
  ```
- **Response Schema**:
  ```typescript
  Success (201):
  {
    success: true
    data: {
      vendorId: string
      status: 'pending'
      message: 'Registration submitted for admin approval'
    }
  }

  Error (400/500):
  {
    success: false
    error: {
      code: 'VALIDATION_ERROR' | 'DUPLICATE_EMAIL' | 'SERVER_ERROR'
      message: string
      fields?: { [key: string]: string }
    }
  }
  ```
- **Business Logic**:
  1. Validate input with Zod schema
  2. Check for duplicate email in users table
  3. Hash password with bcrypt (12 rounds)
  4. Create user record with role='vendor', status='pending'
  5. Create vendor record with tier='free', published=false
  6. Return success response with vendorId

## Acceptance Criteria
- [ ] API route created and accessible at POST /api/vendors/register
- [ ] Input validation with Zod matches request schema
- [ ] Duplicate email detection returns 400 with appropriate error
- [ ] Password hashing uses bcrypt with 12 rounds
- [ ] User created with role='vendor', status='pending'
- [ ] Vendor created with tier='free', published=false, linked to user
- [ ] Slug auto-generated from company name
- [ ] Success response returns vendorId and status
- [ ] Error responses follow standard format
- [ ] All database operations wrapped in transaction

## Testing Requirements
- **Unit Tests**:
  - Request validation with valid and invalid inputs
  - Duplicate email detection logic
  - Password hashing and strength validation
  - Slug generation from company name
- **Integration Tests**:
  - POST with valid data returns 201 and creates records
  - POST with duplicate email returns 400
  - POST with weak password returns 400 with validation errors
  - POST with missing required fields returns 400
  - Database transaction rollback on error
  - Verify user and vendor records created and linked
- **Manual Verification**:
  - Send POST request with Postman/curl
  - Check users table for new record
  - Check vendors table for linked record
  - Verify password is hashed (not plain text)

## Evidence Required
- Integration test results showing 100% pass rate
- Example successful API response
- Database records showing created user and vendor
- Example error responses for invalid inputs

## Context Requirements
- Technical Spec: POST /api/vendors/register endpoint specification
- AuthService from task impl-auth-system (for password hashing)
- Payload CMS local API for database operations
- Zod schema validation patterns

## Implementation Notes
- Use Next.js App Router route handler syntax
- Wrap database operations in try-catch for error handling
- Use Payload local API for creating user and vendor records
- Generate slug from company name (lowercase, hyphenated)
- Ensure transaction atomicity (both user and vendor created or neither)
- Log registration attempts for monitoring
- Return standardized error response format

## Quality Gates
- [ ] All validation tests pass
- [ ] No SQL injection vulnerabilities
- [ ] Password never logged or exposed
- [ ] Transaction ensures data consistency
- [ ] Error messages are user-friendly

## Related Files
- Technical Spec: `/home/edwin/development/ptnextjs/.agent-os/specs/2025-10-11-payload-cms-vendor-enrollment/sub-specs/technical-spec.md` (API Endpoints section)
- Auth Service: `/home/edwin/development/ptnextjs/lib/services/auth-service.ts`
- Test Plan: (output from task test-backend)
