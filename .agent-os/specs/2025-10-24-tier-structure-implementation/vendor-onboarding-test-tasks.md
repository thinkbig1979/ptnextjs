# Vendor Onboarding Test Implementation Tasks

## Priority 0: Critical API Endpoints (Required for Testing)

### Implement Admin Vendor Approval API Endpoint
**Type**: task
**Priority**: 0
**Labels**: backend, api, testing, e2e
**Estimated Time**: 1 hour

Create POST /api/admin/vendors/[id]/approve endpoint to approve pending vendors. Required for E2E tests to simulate admin approval workflow. Updates user status from 'pending' to 'approved'. Unlocks 90% of test scenarios.

**Implementation Steps**:
- Create app/api/admin/vendors/[id]/approve/route.ts
- Add admin authentication check
- Update user.status to 'approved'
- Return success response with vendorId and status

**Acceptance Criteria**:
- Endpoint returns 200 with success response
- User status changes from pending to approved
- Approved vendor can login
- Unauthorized access returns 403

---

### Implement Admin Tier Upgrade API Endpoint
**Type**: task
**Priority**: 0
**Labels**: backend, api, testing, e2e
**Estimated Time**: 1.5 hours

Create PUT /api/admin/vendors/[id]/tier endpoint to upgrade vendor tiers without payment. Required for testing tier1/tier2/tier3 features. Validates tier values and updates vendor.tier field. Critical for tier-based testing.

**Implementation Steps**:
- Create app/api/admin/vendors/[id]/tier/route.ts
- Add admin authentication check
- Validate tier parameter (tier1|tier2|tier3)
- Update vendor.tier in database
- Return success response

**Acceptance Criteria**:
- Endpoint accepts tier1, tier2, tier3
- Rejects invalid tier values with 400
- Vendor tier is updated in database
- Tier-specific features become accessible

---

## Priority 1: Test Seed & Support APIs (Speeds Up Tests 10x)

### Implement Test Vendor Seed API Endpoint
**Type**: task
**Priority**: 1
**Labels**: backend, api, testing, e2e, performance
**Estimated Time**: 1.5 hours

Create POST /api/test/vendors/seed endpoint for bulk vendor creation. Speeds up E2E tests by 10x (bypasses UI registration). Creates vendor directly in database with approved status.

**Implementation Steps**:
- Create app/api/test/vendors/seed/route.ts
- Add NODE_ENV === 'test' guard (security)
- Create user record with hashed password
- Create vendor record with all fields
- Return vendor ID and slug

**Acceptance Criteria**:
- Only works in test environment
- Returns 404 in production
- Creates both user and vendor records
- Returns vendor ID and slug

---

### Implement Test Product Seed API Endpoint
**Type**: task
**Priority**: 1
**Labels**: backend, api, testing, e2e
**Estimated Time**: 1 hour

Create POST /api/test/products/seed endpoint for bulk product creation. Required for product management E2E tests. Creates products directly in database.

**Implementation Steps**:
- Create app/api/test/products/seed/route.ts
- Add NODE_ENV === 'test' guard
- Create product with vendor relationship
- Support published/draft status
- Return product ID

**Acceptance Criteria**:
- Only works in test environment
- Creates product with vendor link
- Supports published and draft status
- Returns product ID

---

### Add Image Fixtures for E2E Tests
**Type**: task
**Priority**: 1
**Labels**: testing, fixtures, e2e
**Estimated Time**: 30 minutes

Add missing image fixtures to tests/fixtures/ directory for file upload testing.

**Required Images**:
- team-member.jpg (800x800px professional headshot)
- case-study-1.jpg (1920x1080px yacht photo)
- product-image.jpg (1200x800px product shot)

Can use placeholder images or real stock photos.

**Acceptance Criteria**:
- All 3 image files added to tests/fixtures/
- Images are valid JPG format
- File sizes are reasonable (<500KB each)
- Tests can successfully upload these files

---

## Priority 1: Smoke Test Suites (First Tests to Implement)

### Implement E2E Test Suite 01: Vendor Registration
**Type**: task
**Priority**: 1
**Labels**: testing, e2e, smoke-test
**Estimated Time**: 2 hours
**Dependencies**: None

Implement complete registration test suite with 8 test scenarios.

**Test Coverage**:
1. Successful registration with all fields
2. Validation errors for missing fields
3. Invalid email format validation
4. Password mismatch validation
5. Weak password rejection
6. Duplicate email detection
7. Submit button disabled during submission
8. Terms and conditions acceptance

**File**: tests/e2e/vendor-onboarding/01-registration.spec.ts
**Uses**: vendor-onboarding-helpers.ts, test-data-factories.ts

**Acceptance Criteria**:
- All 8 tests passing
- Uses helper functions (no duplicated code)
- Captures screenshots on failure
- Execution time < 5 minutes

---

### Implement E2E Test Suite 02: Admin Approval Workflow
**Type**: task
**Priority**: 1
**Labels**: testing, e2e, smoke-test
**Estimated Time**: 2 hours
**Dependencies**: Admin approval API endpoints

Implement admin approval workflow tests with 5 test scenarios.

**Test Coverage**:
1. Admin login and navigation to pending vendors
2. Admin approves vendor
3. Pending vendor cannot login
4. Approved vendor can login
5. Admin rejects vendor

**File**: tests/e2e/vendor-onboarding/02-admin-approval.spec.ts

**Acceptance Criteria**:
- All 5 tests passing
- Uses admin API endpoints
- Verifies approval workflow
- Tests rejection workflow

---

### Implement E2E Test Suite 03: Vendor Authentication
**Type**: task
**Priority**: 1
**Labels**: testing, e2e, smoke-test
**Estimated Time**: 1.5 hours
**Dependencies**: Admin approval must work

Implement authentication flow tests with 5 test scenarios.

**Test Coverage**:
1. Successful login with valid credentials
2. Login fails with invalid credentials
3. Session persistence after page reload
4. Logout functionality
5. Protected route access without auth

**File**: tests/e2e/vendor-onboarding/03-authentication.spec.ts

**Acceptance Criteria**:
- All 5 tests passing
- Tests cookie-based authentication
- Verifies protected routes
- Execution time < 3 minutes

---

### Implement E2E Test Suite 04: Free Tier Profile Setup
**Type**: task
**Priority**: 1
**Labels**: testing, e2e, core-workflow
**Estimated Time**: 2 hours
**Dependencies**: Authentication tests passing

Implement free tier profile tests with 6 test scenarios.

**Test Coverage**:
1. Dashboard loads with free tier badge
2. Edit and save basic info
3. Free tier cannot access tier 1+ fields
4. Upload logo
5. Form validation errors
6. Single location limit

**File**: tests/e2e/vendor-onboarding/04-free-tier-profile.spec.ts

**Acceptance Criteria**:
- All 6 tests passing
- Verifies tier restrictions
- Tests file upload
- Form validation working

---

### Implement E2E Test Suite 11: Security & Access Control
**Type**: task
**Priority**: 1
**Labels**: testing, e2e, security
**Estimated Time**: 3 hours
**Dependencies**: Multiple vendors can be created

Implement security and access control tests with 6 test scenarios.

**Test Coverage**:
1. Vendor cannot access another vendor's dashboard
2. API rejects tier-restricted fields from lower tier
3. API prevents vendor from updating another vendor
4. XSS prevention (script injection)
5. CSRF protection
6. Rate limiting

**File**: tests/e2e/vendor-onboarding/11-security-access-control.spec.ts

**Acceptance Criteria**:
- All 6 security tests passing
- Verifies authorization
- Tests XSS/CSRF protection
- Rate limiting tested

---

## Priority 2: Core Workflow Tests

### Implement E2E Test Suite 05: Tier Upgrade Flow
**Type**: task
**Priority**: 2
**Labels**: testing, e2e, core-workflow
**Estimated Time**: 2.5 hours
**Dependencies**: Tier upgrade API endpoint

Implement tier upgrade tests with 6 test scenarios.

**Test Coverage**:
1. View tier upgrade options and pricing
2. Upgrade from free to tier 1
3. Tier 1 features unlocked after upgrade
4. Upgrade from tier 1 to tier 2
5. Upgrade to tier 3 enterprise
6. Cannot downgrade tier

**File**: tests/e2e/vendor-onboarding/05-tier-upgrade.spec.ts

**Acceptance Criteria**:
- All 6 tests passing
- Uses tier upgrade API
- Verifies feature unlocking
- Prevents downgrades

---

### Implement E2E Test Suite 06: Tier 1 Advanced Profile
**Type**: task
**Priority**: 2
**Labels**: testing, e2e, advanced-features
**Estimated Time**: 3 hours
**Dependencies**: Tier upgrade working

Implement tier 1 advanced profile tests with 9 test scenarios.

**Test Coverage**:
1. Fill brand story with website and social links
2. Add certification
3. Edit certification
4. Delete certification
5. Add award
6. Add case study
7. Add team member
8. Reorder team members
9. Add long description

**File**: tests/e2e/vendor-onboarding/06-tier1-advanced-profile.spec.ts

**Acceptance Criteria**:
- All 9 tests passing
- Tests all tier 1 features
- CRUD operations working
- Uses helper functions

---

### Implement E2E Test Suite 07: Tier 2 Location Management
**Type**: task
**Priority**: 2
**Labels**: testing, e2e, advanced-features
**Estimated Time**: 2.5 hours
**Dependencies**: Tier 2 vendors can be created

Implement tier 2 location management tests with 7 test scenarios.

**Test Coverage**:
1. Add first location as headquarters
2. Add multiple locations (up to 10)
3. Edit existing location
4. Delete location
5. Geocoding integration
6. Map preview with markers
7. Location limit enforcement

**File**: tests/e2e/vendor-onboarding/07-tier2-locations.spec.ts

**Acceptance Criteria**:
- All 7 tests passing
- Tests geocoding API
- Verifies map display
- Enforces tier limits

---

### Implement E2E Test Suite 08: Tier 3 Promotion Features
**Type**: task
**Priority**: 2
**Labels**: testing, e2e, advanced-features
**Estimated Time**: 2 hours
**Dependencies**: Tier 3 vendors can be created

Implement tier 3 promotion features tests with 5 test scenarios.

**Test Coverage**:
1. Access promotion pack tab
2. Featured placement toggle
3. Editorial content display
4. Tier 3 badge display
5. Unlimited locations

**File**: tests/e2e/vendor-onboarding/08-tier3-promotions.spec.ts

**Acceptance Criteria**:
- All 5 tests passing
- Verifies tier 3 features
- Tests featured toggle
- Unlimited locations verified

---

### Implement E2E Test Suite 09: Product Management
**Type**: task
**Priority**: 2
**Labels**: testing, e2e, advanced-features
**Estimated Time**: 2.5 hours
**Dependencies**: Product seed API, tier 2+ vendors

Implement product management tests with 7 test scenarios.

**Test Coverage**:
1. Access product management (tier 2+)
2. View product list
3. Add new product
4. Edit existing product
5. Delete product
6. Publish/unpublish product
7. Product categories assignment

**File**: tests/e2e/vendor-onboarding/09-product-management.spec.ts

**Acceptance Criteria**:
- All 7 tests passing
- Product CRUD working
- Tier restrictions enforced
- Categories working

---

### Implement E2E Test Suite 10: Public Profile Display
**Type**: task
**Priority**: 2
**Labels**: testing, e2e, public-facing
**Estimated Time**: 2 hours
**Dependencies**: All vendor features working

Implement public profile display tests with 6 test scenarios.

**Test Coverage**:
1. Free tier public profile (basic info only)
2. Tier 1 public profile (enhanced features)
3. Tier 2 public profile with locations map
4. Tier 3 public profile with featured badge
5. Responsive design (mobile view)
6. SEO metadata

**File**: tests/e2e/vendor-onboarding/10-public-profile-display.spec.ts

**Acceptance Criteria**:
- All 6 tests passing
- Verifies tier-specific display
- Mobile responsive tested
- SEO tags verified

---

### Implement E2E Test Suite 12: End-to-End Happy Path
**Type**: task
**Priority**: 2
**Labels**: testing, e2e, integration
**Estimated Time**: 3 hours
**Dependencies**: All previous test suites working

Implement complete vendor journey test from registration to tier 3. Single comprehensive test covering entire workflow.

**Test Coverage**:
- Complete journey: registration → approval → login → profile setup → tier upgrades → full feature utilization
- Verifies all features work together
- Tests data persistence across workflow
- Validates public profile shows all content

**File**: tests/e2e/vendor-onboarding/12-e2e-happy-path.spec.ts

**Acceptance Criteria**:
- Single test covering full journey
- All features used in sequence
- Takes < 5 minutes to execute
- Comprehensive verification

---

## Priority 2: Cleanup & Infrastructure

### Implement Test Data Cleanup API Endpoints
**Type**: task
**Priority**: 2
**Labels**: backend, api, testing, e2e, cleanup
**Estimated Time**: 1.5 hours

Create DELETE endpoints for cleaning up test data after E2E test runs. Prevents test database bloat.

**Implementation Steps**:
- Create DELETE /api/test/vendors/[id]/route.ts
- Create DELETE /api/test/products/[id]/route.ts
- Add NODE_ENV === 'test' guard
- Cascade delete related records (locations, certifications, etc.)
- Return success confirmation

**Acceptance Criteria**:
- Endpoints only work in test environment
- Cascade delete working
- Returns confirmation
- No orphaned records left

---

### Implement Admin Vendor Rejection API Endpoint
**Type**: task
**Priority**: 2
**Labels**: backend, api, testing
**Estimated Time**: 1 hour

Create POST /api/admin/vendors/[id]/reject endpoint to reject vendor applications. Optional but recommended for complete admin workflow testing. Updates status to 'rejected' and stores rejection reason.

**Implementation Steps**:
- Create app/api/admin/vendors/[id]/reject/route.ts
- Add admin authentication
- Update status to 'rejected'
- Store rejection reason
- Send notification email (optional)

**Acceptance Criteria**:
- Endpoint returns 200 on success
- Status changes to rejected
- Rejection reason stored
- Rejected vendor cannot login

---

### Configure CI/CD Pipeline for E2E Tests
**Type**: task
**Priority**: 2
**Labels**: ci-cd, testing, automation
**Estimated Time**: 2 hours
**Dependencies**: Test suites 1-4 passing

Set up GitHub Actions workflow for automated E2E test execution on pull requests.

**Implementation Steps**:
- Create .github/workflows/e2e-vendor-onboarding.yml
- Configure triggers (PR paths, manual dispatch)
- Set up test database
- Run Playwright tests with 2 workers
- Upload test artifacts on failure
- Generate HTML test reports

**Acceptance Criteria**:
- Workflow runs on PR
- Tests execute in CI
- Artifacts uploaded on failure
- HTML reports generated
- Execution time < 15 minutes

---

## Summary

**Total Tasks**: 19
**Critical (P0)**: 2 tasks - 2.5 hours
**High (P1)**: 7 tasks - 13 hours
**Medium (P2)**: 10 tasks - 24 hours

**Total Estimated Time**: 39.5 hours

**Dependencies Chain**:
1. Start with P0 tasks (admin APIs) - 2.5 hours
2. Add P1 support (seed APIs, fixtures) - 3 hours
3. Implement smoke tests (suites 1-4, 11) - 10.5 hours
4. Implement core workflow tests - 13 hours
5. Add cleanup & CI/CD - 3.5 hours

**Critical Path**: Admin APIs → Smoke Tests → Core Workflows → Integration Tests → CI/CD
