# Task: test-e2e-tier-upgrade - E2E Test Tier Upgrade Workflow

## Task Metadata
- **Task ID**: test-e2e-tier-upgrade
- **Phase**: Phase 3A: Integration & Testing
- **Agent**: qa-testing-specialist
- **Estimated Time**: 60-75 minutes
- **Dependencies**: [All UI components, All API endpoints]
- **Status**: [ ] Not Started

## Task Description
Create comprehensive end-to-end tests for the complete tier upgrade workflow: vendor submits tier upgrade request → admin reviews and approves → vendor gains access to premium features. Verify database changes, UI updates, and tier access enforcement.

## Specifics
- **Test File to Create**:
  - `/home/edwin/development/ptnextjs/tests/e2e/tier-upgrade-workflow.spec.ts`
- **Test Framework**: Playwright
- **Test Scenarios**:
  1. Vendor Tier Upgrade Request Submission
  2. Admin Tier Request Approval
  3. Vendor Premium Feature Access
  4. Tier Request Rejection Flow
  5. Duplicate Request Prevention
  6. Audit Trail Verification

## Acceptance Criteria
- [ ] E2E test file created with Playwright
- [ ] Test 1: Vendor successfully submits tier 2 upgrade request
- [ ] Test 2: Admin views request in approval queue
- [ ] Test 3: Admin approves request with notes
- [ ] Test 4: Vendor tier updated in database
- [ ] Test 5: Audit log entry created with correct details
- [ ] Test 6: Vendor can now access tier 2 features
- [ ] Test 7: Rejection workflow prevents tier change
- [ ] Test 8: Duplicate pending request rejected
- [ ] All tests pass in CI/CD pipeline
- [ ] Test coverage includes happy path and error cases

## Testing Requirements
- **Test 1: Vendor Submits Tier Upgrade Request**:
  ```typescript
  test('vendor can submit tier 2 upgrade request', async ({ page }) => {
    // Login as free tier vendor
    await page.goto('/vendor/login')
    await page.fill('[name="email"]', 'vendor@test.com')
    await page.fill('[name="password"]', 'TestPassword123!')
    await page.click('button[type="submit"]')
    
    // Navigate to subscription page
    await page.goto('/vendor/dashboard/subscription')
    await expect(page.locator('text=Current Tier: Free')).toBeVisible()
    
    // Click Select Tier 2
    await page.click('button:has-text("Select Plan"):near(:text("Enterprise"))')
    
    // Fill upgrade request form
    await page.fill('[name="reason"]', 'Need advanced features for marketing')
    await page.click('button:has-text("Submit Request")')
    
    // Verify success toast
    await expect(page.locator('text=Tier upgrade request submitted')).toBeVisible()
    
    // Verify pending status badge
    await expect(page.locator('text=Pending')).toBeVisible()
    
    // Verify database record
    const tierRequest = await db.tierRequests.findFirst({
      where: { vendor_id: testVendor.id, status: 'pending' }
    })
    expect(tierRequest).toBeTruthy()
    expect(tierRequest.requested_tier).toBe('tier2')
  })
  ```
- **Test 2: Admin Approves Tier Request**:
  ```typescript
  test('admin can approve tier upgrade request', async ({ page }) => {
    // Login as admin
    await page.goto('/admin/login')
    await page.fill('[name="email"]', 'admin@test.com')
    await page.fill('[name="password"]', 'AdminPassword123!')
    await page.click('button[type="submit"]')
    
    // Navigate to tier requests page
    await page.goto('/admin/tier-requests')
    
    // Verify pending request shows
    await expect(page.locator(`text=${testVendor.name}`)).toBeVisible()
    await expect(page.locator('text=tier2')).toBeVisible()
    
    // Click Approve button
    await page.click('button:has-text("Approve"):near(:text("' + testVendor.name + '"))')
    
    // Add admin notes
    await page.fill('[name="admin_notes"]', 'Approved for good standing')
    await page.click('button:has-text("Confirm Approval")')
    
    // Verify success
    await expect(page.locator('text=Tier request approved')).toBeVisible()
    
    // Verify database updates
    const updatedVendor = await db.vendors.findUnique({ where: { id: testVendor.id }})
    expect(updatedVendor.tier).toBe('tier2')
    
    const tierRequest = await db.tierRequests.findFirst({
      where: { vendor_id: testVendor.id }
    })
    expect(tierRequest.status).toBe('approved')
    
    // Verify audit log
    const auditLog = await db.tierAuditLog.findFirst({
      where: { vendor_id: testVendor.id, change_type: 'request_approved' }
    })
    expect(auditLog).toBeTruthy()
    expect(auditLog.previous_tier).toBe('free')
    expect(auditLog.new_tier).toBe('tier2')
  })
  ```
- **Test 3: Vendor Accesses Premium Features**:
  ```typescript
  test('tier 2 vendor can access premium features', async ({ page }) => {
    // Login as newly upgraded tier 2 vendor
    await page.goto('/vendor/login')
    await page.fill('[name="email"]', 'vendor@test.com')
    await page.fill('[name="password"]', 'TestPassword123!')
    await page.click('button[type="submit"]')
    
    // Navigate to premium profile editor
    await page.goto('/vendor/dashboard/profile/premium')
    
    // Verify NO TierGate blocking access
    await expect(page.locator('text=Upgrade to access')).not.toBeVisible()
    
    // Verify can create certification
    await page.click('button:has-text("Add Certification")')
    await page.fill('[name="name"]', 'ISO 9001:2015')
    await page.fill('[name="issuing_org"]', 'ISO')
    await page.click('button:has-text("Save")')
    
    // Verify certification saved
    await expect(page.locator('text=ISO 9001:2015')).toBeVisible()
    
    // Verify database record
    const premiumContent = await db.vendorPremiumContent.findFirst({
      where: { vendor_id: testVendor.id, content_type: 'certification' }
    })
    expect(premiumContent).toBeTruthy()
  })
  ```

## Evidence Required
- Complete E2E test file with all scenarios
- Test execution report showing all tests passing
- Screenshots/videos of test runs (Playwright trace)
- Database verification queries showing correct state changes
- CI/CD integration proof (test runs on push)

## Context Requirements
- Playwright test framework setup
- Test database seeding scripts
- Test user credentials (vendor, admin)
- tasks-sqlite.md section 4.1 for test scenarios

## Implementation Notes
- **Test Database Setup**:
  ```typescript
  // tests/e2e/setup.ts
  import { execSync } from 'child_process'
  
  export async function setupTestDatabase() {
    // Run migrations on test database
    execSync('DATABASE_URL=sqlite://test.db npx payload migrate')
    
    // Seed test data
    await db.vendors.create({
      data: {
        id: 'test-vendor-id',
        name: 'Test Vendor LLC',
        tier: 'free',
        // ...
      }
    })
    
    await db.users.create({
      data: {
        id: 'test-admin-id',
        email: 'admin@test.com',
        password: await bcrypt.hash('AdminPassword123!', 12),
        role: 'admin'
      }
    })
  }
  ```
- **Playwright Configuration**:
  ```typescript
  // playwright.config.ts
  export default defineConfig({
    testDir: './tests/e2e',
    use: {
      baseURL: 'http://localhost:3000',
      screenshot: 'only-on-failure',
      video: 'retain-on-failure',
      trace: 'retain-on-failure'
    },
    globalSetup: './tests/e2e/setup.ts',
    globalTeardown: './tests/e2e/teardown.ts'
  })
  ```
- **Test Isolation**:
  - Each test creates fresh vendor/admin users
  - Clean database between tests
  - Use unique IDs to avoid conflicts
- **Waiting Strategies**:
  - Wait for API responses: `await page.waitForResponse('/api/tier-requests')`
  - Wait for database updates before assertions
  - Use explicit waits for animations/transitions

## Quality Gates
- [ ] All E2E tests pass on local development
- [ ] All E2E tests pass on CI/CD
- [ ] Test execution time <5 minutes
- [ ] No flaky tests (run 10 times, all pass)
- [ ] Database state verified after each test

## Related Files
- Main Tasks: `tasks-sqlite.md` section 4.1
- Test Setup: `/home/edwin/development/ptnextjs/tests/e2e/setup.ts`
- Playwright Config: `/home/edwin/development/ptnextjs/playwright.config.ts`

## Next Steps After Completion
- Add E2E tests for geographic filtering (task-test-e2e-location-discovery)
- Add E2E tests for premium content CRUD (task-test-e2e-premium-content)
- Set up visual regression testing with Percy/Chromatic
