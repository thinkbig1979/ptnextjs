# Task test-frontend: Deliverable Manifest

## Task Information
- **Task ID**: test-frontend
- **Phase**: Phase 3: Frontend Implementation
- **Agent**: task-orchestrator (coordinating specialists)
- **Status**: In Progress
- **Created**: 2025-10-12

---

## Deliverable Categories

### 1. Test Strategy Documentation
**Owner**: Stream 4 - Documentation Specialist

- **File**: `.agent-os/specs/2025-10-11-payload-cms-vendor-enrollment/deliverables/frontend-test-strategy.md`
  - **Description**: Comprehensive frontend test strategy document
  - **Content Requirements**:
    - Testing pyramid overview (unit → integration → E2E)
    - Component testing patterns with React Testing Library
    - API mocking strategies using MSW
    - Test coverage goals per component type
    - Accessibility testing approach
    - User interaction testing patterns
    - Testing best practices and guidelines
    - Common testing scenarios with examples
    - Troubleshooting guide
    - Developer testing checklist

### 2. Test Infrastructure Setup
**Owner**: Stream 2 - Test Infrastructure Specialist

#### 2.1 React Testing Library Configuration
- **File**: `__tests__/setup/react-testing-library.config.ts`
  - **Description**: Custom RTL configuration with providers
  - **Content Requirements**:
    - Custom render function with all providers
    - AuthContext provider wrapper
    - Theme provider wrapper
    - Toast provider wrapper
    - Query client provider wrapper (if needed)
    - Custom screen utilities

#### 2.2 Mock Service Worker (MSW) Setup
- **File**: `__tests__/mocks/handlers.ts`
  - **Description**: MSW request handlers for API mocking
  - **Content Requirements**:
    - Login API handlers
    - Registration API handlers
    - Vendor profile API handlers
    - Admin approval API handlers
    - Error scenario handlers
    - Success scenario handlers

- **File**: `__tests__/mocks/server.ts`
  - **Description**: MSW server setup for Node environment
  - **Content Requirements**:
    - Server instance setup
    - Request interception configuration
    - beforeAll/afterEach/afterAll hooks

- **File**: `__tests__/mocks/browser.ts`
  - **Description**: MSW browser setup for browser environment
  - **Content Requirements**:
    - Browser worker setup
    - Service worker registration

#### 2.3 Test Utilities and Helpers
- **File**: `__tests__/utils/render-helpers.tsx`
  - **Description**: Custom render utilities for testing
  - **Content Requirements**:
    - `renderWithAuth()` - Render with authenticated context
    - `renderWithProviders()` - Render with all providers
    - `renderWithRouter()` - Render with Next.js router
    - `waitForLoadingToFinish()` - Wait for loading states
    - Type definitions for render options

- **File**: `__tests__/utils/user-interaction-helpers.ts`
  - **Description**: User interaction testing utilities
  - **Content Requirements**:
    - `fillFormField()` - Fill form inputs
    - `submitForm()` - Submit form with validation
    - `clickButton()` - Click with loading state handling
    - `selectOption()` - Select from dropdown
    - `uploadFile()` - Handle file uploads

- **File**: `__tests__/utils/assertion-helpers.ts`
  - **Description**: Custom assertion utilities
  - **Content Requirements**:
    - `expectToBeVisible()` - Visibility assertions
    - `expectToHaveError()` - Form error assertions
    - `expectToBeDisabled()` - Disabled state assertions
    - `expectToHaveToast()` - Toast notification assertions
    - `expectApiCallToBeMade()` - API call verification

#### 2.4 Test Fixtures and Factories
- **File**: `__tests__/fixtures/vendors.ts`
  - **Description**: Vendor test data fixtures
  - **Content Requirements**:
    - Mock vendor users (free, tier1, tier2)
    - Mock pending vendors
    - Mock approved vendors
    - Mock rejected vendors
    - Vendor profile data

- **File**: `__tests__/fixtures/forms.ts`
  - **Description**: Form data fixtures
  - **Content Requirements**:
    - Valid registration form data
    - Invalid registration form data
    - Valid login form data
    - Invalid login form data
    - Profile update form data

- **File**: `__tests__/fixtures/api-responses.ts`
  - **Description**: Mock API response fixtures
  - **Content Requirements**:
    - Success responses
    - Error responses (400, 401, 403, 500)
    - Validation error responses
    - Authentication responses

### 3. Component Test Templates
**Owner**: Stream 3 - Component Test Template Creator

#### 3.1 Authentication Component Tests
- **File**: `__tests__/components/vendor/VendorRegistrationForm.test.tsx.template`
  - **Description**: Test template for vendor registration form
  - **Test Scenarios**:
    - Renders all form fields
    - Validates required fields
    - Validates email format
    - Validates password strength (OWASP)
    - Validates company name uniqueness
    - Handles successful registration
    - Handles validation errors
    - Handles API errors
    - Shows loading state during submission
    - Disables form during submission
    - Displays success message
    - Redirects after successful registration

- **File**: `__tests__/components/vendor/VendorLoginForm.test.tsx.template`
  - **Description**: Test template for vendor login form
  - **Test Scenarios**:
    - Renders email and password fields
    - Validates required fields
    - Validates email format
    - Handles successful login
    - Handles invalid credentials (401)
    - Handles pending vendor status (403)
    - Handles rejected vendor status (403)
    - Shows loading state during submission
    - Stores authentication token
    - Updates AuthContext on success
    - Redirects to dashboard on success
    - Displays error messages

#### 3.2 Dashboard Component Tests
- **File**: `__tests__/components/vendor/VendorDashboard.test.tsx.template`
  - **Description**: Test template for vendor dashboard
  - **Test Scenarios**:
    - Renders dashboard layout
    - Displays vendor information
    - Shows tier badge
    - Displays navigation menu
    - Routes to profile editor
    - Routes to product management (tier2 only)
    - Shows logout button
    - Handles logout action
    - Displays pending approval message (pending vendors)
    - Requires authentication
    - Redirects if not authenticated

- **File**: `__tests__/components/vendor/VendorProfileEditor.test.tsx.template`
  - **Description**: Test template for vendor profile editor
  - **Test Scenarios**:
    - Renders profile form with existing data
    - Allows editing basic info (all tiers)
    - Allows editing tier1 fields (tier1+)
    - Restricts tier1 fields (free tier)
    - Allows editing tier2 fields (tier2 only)
    - Restricts tier2 fields (tier1 and below)
    - Shows upgrade prompts for restricted fields
    - Validates form fields
    - Handles successful update
    - Handles validation errors
    - Handles API errors
    - Shows loading state during save
    - Displays success message
    - Updates local state on success

#### 3.3 Admin Component Tests
- **File**: `__tests__/components/admin/AdminApprovalQueue.test.tsx.template`
  - **Description**: Test template for admin approval queue
  - **Test Scenarios**:
    - Renders pending vendors list
    - Displays vendor details
    - Shows approve button
    - Shows reject button
    - Handles approve action
    - Handles reject action
    - Shows confirmation dialog
    - Updates list after approval
    - Updates list after rejection
    - Shows loading state
    - Handles API errors
    - Displays empty state (no pending)
    - Requires admin authentication
    - Shows 403 for non-admin users
    - Displays success notifications

#### 3.4 Shared Component Tests
- **File**: `__tests__/components/shared/TierGate.test.tsx.template`
  - **Description**: Test template for tier-based rendering
  - **Test Scenarios**:
    - Renders content for matching tier
    - Renders content for higher tier
    - Hides content for lower tier
    - Shows upgrade message for restricted content
    - Works with free tier
    - Works with tier1
    - Works with tier2
    - Admin bypasses tier restrictions
    - Handles undefined tier (defaults to free)

### 4. Context Test Templates
**Owner**: Stream 3 - Component Test Template Creator

- **File**: `__tests__/context/AuthContext.test.tsx.template`
  - **Description**: Test template for authentication context
  - **Test Scenarios**:
    - Provides initial unauthenticated state
    - Handles login action
    - Updates state on successful login
    - Stores token in localStorage/cookie
    - Handles logout action
    - Clears state on logout
    - Removes token on logout
    - Validates token on mount
    - Restores session from stored token
    - Handles token expiration
    - Provides user information
    - Provides tier information
    - Provides role information
    - Updates state on profile changes
    - Handles authentication errors

### 5. E2E Test Patterns (Design Only)
**Owner**: Stream 1 - Test Strategy Architect

- **File**: `.agent-os/specs/2025-10-11-payload-cms-vendor-enrollment/deliverables/e2e-test-patterns.md`
  - **Description**: E2E test patterns and scenarios (Playwright)
  - **Content Requirements**:
    - Complete user workflow scenarios
    - Registration → Approval → Login → Edit flow
    - Authentication flow testing
    - Dashboard navigation testing
    - Profile editing with tier restrictions
    - Admin approval workflow
    - Error handling flows
    - Page object model patterns
    - Test data setup and teardown
    - Browser configuration
    - Accessibility testing integration
    - Visual regression testing patterns

### 6. Test Coverage Plan
**Owner**: Stream 1 - Test Strategy Architect

- **File**: `.agent-os/specs/2025-10-11-payload-cms-vendor-enrollment/deliverables/test-coverage-plan.md`
  - **Description**: Detailed test coverage goals and tracking
  - **Content Requirements**:
    - Coverage targets per component type
    - Coverage targets per feature area
    - Critical path identification
    - Coverage metrics tracking approach
    - Uncovered code tracking
    - Coverage improvement plan
    - Integration with CI/CD

---

## Deliverable Verification Checklist

### Phase 1: File Existence Verification
- [ ] Frontend test strategy document exists
- [ ] RTL configuration file exists
- [ ] MSW handlers file exists
- [ ] MSW server setup exists
- [ ] Render helpers exist
- [ ] User interaction helpers exist
- [ ] Assertion helpers exist
- [ ] Vendor fixtures exist
- [ ] Form fixtures exist
- [ ] API response fixtures exist
- [ ] VendorRegistrationForm test template exists
- [ ] VendorLoginForm test template exists
- [ ] VendorDashboard test template exists
- [ ] VendorProfileEditor test template exists
- [ ] AdminApprovalQueue test template exists
- [ ] TierGate test template exists
- [ ] AuthContext test template exists
- [ ] E2E test patterns document exists
- [ ] Test coverage plan exists

### Phase 2: Content Validation
- [ ] Test strategy is comprehensive
- [ ] All component types are covered
- [ ] MSW setup is complete
- [ ] Test utilities are comprehensive
- [ ] Fixtures cover all scenarios
- [ ] Test templates are runnable
- [ ] E2E patterns are detailed
- [ ] Coverage plan is specific

### Phase 3: Integration Validation
- [ ] MSW integrates with Jest
- [ ] RTL custom render works
- [ ] Test helpers are importable
- [ ] Fixtures match API contracts
- [ ] Templates follow project patterns

### Phase 4: Acceptance Criteria Mapping
- [ ] AC1: Test plan document created with coverage map → `frontend-test-strategy.md` + `test-coverage-plan.md`
- [ ] AC2: Test file structure defined → All template files in `__tests__/components/`
- [ ] AC3: Mock strategies defined (MSW) → `handlers.ts`, `server.ts`, `browser.ts`
- [ ] AC4: Component test approach documented (RTL) → `frontend-test-strategy.md` + templates
- [ ] AC5: E2E test approach documented → `e2e-test-patterns.md`
- [ ] AC6: User workflow scenarios defined → `e2e-test-patterns.md`
- [ ] AC7: Target coverage: 80%+ → `test-coverage-plan.md`

---

## Success Criteria

✅ **Implementation Complete** when:
1. All 19 deliverable files exist
2. Test strategy covers all frontend components
3. MSW setup is complete and documented
4. Test templates are comprehensive and runnable
5. E2E patterns are detailed and actionable
6. Coverage plan achieves 80%+ target
7. All acceptance criteria are met with evidence

---

## Execution Streams

### Stream 1: Test Strategy Architect
- Deliverables: `frontend-test-strategy.md`, `e2e-test-patterns.md`, `test-coverage-plan.md`
- Focus: High-level strategy, testing pyramid, E2E patterns, coverage goals

### Stream 2: Test Infrastructure Specialist
- Deliverables: RTL config, MSW setup, test utilities, fixtures
- Focus: Testing infrastructure, helpers, mocks, test data

### Stream 3: Component Test Template Creator
- Deliverables: All component test templates (7 templates)
- Focus: Component-specific test scenarios and patterns

### Stream 4: Documentation Specialist
- Deliverables: Comprehensive documentation within strategy documents
- Focus: Best practices, examples, troubleshooting, checklists

---

## Notes

- All templates should be `.tsx.template` files to avoid running as actual tests
- MSW should be configured to work with Next.js App Router
- Test utilities should support both Pages and App Router patterns
- E2E patterns should use Playwright (already in dependencies)
- Coverage tracking should integrate with existing Jest configuration
- All tests should follow existing backend test patterns for consistency
