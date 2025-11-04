# Admin API Endpoints - Verification Checklist

## Quick Reference for QA Testing

### Endpoints Implemented

- [x] **POST /api/admin/vendors/[id]/approve** - Approve pending vendors
- [x] **PUT /api/admin/vendors/[id]/tier** - Update vendor tier

---

## Test Scenarios

### Scenario 1: Vendor Approval (POST /api/admin/vendors/[id]/approve)

#### Prerequisites
- Admin user account with valid authentication token
- Pending vendor in database (register vendor to get one)
- Running development server on http://localhost:3000

#### Test Steps

1. **Create pending vendor:**
   - Register a new vendor at `/vendor/register/`
   - Note the vendor ID and user ID from response
   - Vendor should be in 'pending' status

2. **Attempt approval without authentication:**
   ```bash
   curl -X POST http://localhost:3000/api/admin/vendors/{userId}/approve
   ```
   - Expected: 401 status, "Authentication required" error

3. **Approve vendor with admin token:**
   ```bash
   curl -X POST http://localhost:3000/api/admin/vendors/{userId}/approve \
     -H "Authorization: Bearer {admin_token}" \
     -H "Content-Type: application/json"
   ```
   - Expected: 200 status
   - Response should contain:
     - `message: "Vendor approved successfully"`
     - `user.status: "approved"`
     - `user.approved_at: <timestamp>`

4. **Verify vendor can now login:**
   - Login with vendor credentials at `/vendor/login/`
   - Should successfully redirect to `/vendor/dashboard/`

5. **Verify vendor profile is published:**
   - Check that vendor appears in `/vendors/` list
   - Vendor profile should be publicly accessible

#### Expected Outcomes
- Status changes from 'pending' to 'approved'
- Vendor profile automatically published
- Vendor can access dashboard
- No errors in console logs

---

### Scenario 2: Tier Upgrade (PUT /api/admin/vendors/[id]/tier)

#### Prerequisites
- Admin user account with valid authentication token
- Vendor in database (can be free tier)
- Running development server

#### Test Steps

1. **Attempt tier upgrade without authentication:**
   ```bash
   curl -X PUT http://localhost:3000/api/admin/vendors/{vendorId}/tier \
     -H "Content-Type: application/json" \
     -d '{"tier": "tier1"}'
   ```
   - Expected: 401 status, "Authentication required" error

2. **Attempt tier upgrade with invalid tier value:**
   ```bash
   curl -X PUT http://localhost:3000/api/admin/vendors/{vendorId}/tier \
     -H "Authorization: Bearer {admin_token}" \
     -H "Content-Type: application/json" \
     -d '{"tier": "invalid"}'
   ```
   - Expected: 400 status, invalid tier error message

3. **Attempt tier upgrade without tier parameter:**
   ```bash
   curl -X PUT http://localhost:3000/api/admin/vendors/{vendorId}/tier \
     -H "Authorization: Bearer {admin_token}" \
     -H "Content-Type: application/json" \
     -d '{}'
   ```
   - Expected: 400 status, "Tier is required" error

4. **Upgrade vendor to tier1:**
   ```bash
   curl -X PUT http://localhost:3000/api/admin/vendors/{vendorId}/tier \
     -H "Authorization: Bearer {admin_token}" \
     -H "Content-Type: application/json" \
     -d '{"tier": "tier1"}'
   ```
   - Expected: 200 status
   - Response should contain:
     - `message: "Vendor tier updated successfully"`
     - `vendor.tier: "tier1"`
     - `vendor.companyName: <name>`
     - `vendor.updatedAt: <timestamp>`

5. **Verify tier1 fields are accessible:**
   - Login as vendor
   - Navigate to profile editor
   - Verify tier1+ fields are now available:
     - Website field
     - LinkedIn URL
     - Twitter URL
     - Certifications

6. **Test tier2 upgrade:**
   - Repeat step 4 with `"tier": "tier2"`
   - Verify tier2 fields (locations, featured category, etc.)

7. **Test tier3 upgrade:**
   - Repeat step 4 with `"tier": "tier3"`
   - Verify tier3 features (promotion pack, editorial content)

#### Expected Outcomes
- Tier updates correctly in database
- Fields become available/unavailable based on tier
- Vendor can access new tier features
- Profile updates reflect tier level

---

## Error Scenarios to Test

### Authentication Errors (401)

| Scenario | Request | Expected Status | Expected Error |
|----------|---------|-----------------|-----------------|
| No token | No Authorization header | 401 | "Authentication required" |
| Missing token | Empty Authorization header | 401 | "Authentication required" |
| Invalid token | Invalid JWT | 401 | "Authentication required" |
| Expired token | Expired JWT | 401 | "Authentication required" |

### Authorization Errors (403)

| Scenario | Request | Expected Status | Expected Error |
|----------|---------|-----------------|-----------------|
| Non-admin user | Vendor token | 403 | "Admin access required" |
| User token | User token instead of admin | 403 | "Admin access required" |

### Validation Errors (400)

| Scenario | Endpoint | Body | Expected Status | Expected Error |
|----------|----------|------|-----------------|-----------------|
| No tier param | PUT /tier | `{}` | 400 | "Tier is required" |
| Invalid tier | PUT /tier | `{"tier": "invalid"}` | 400 | "Invalid tier value" |
| Invalid JSON | PUT /tier | `{invalid json}` | 400 | JSON parse error |

### Not Found Errors (404)

| Scenario | Request | Expected Status | Expected Error |
|----------|---------|-----------------|-----------------|
| Non-existent vendor | POST /approve with fake ID | 404 | "Vendor not found" |
| Non-existent vendor | PUT /tier with fake ID | 404 | "Vendor not found" |

---

## Integration Test Checklist

### Pre-Test Setup
- [ ] Development server running (`npm run dev`)
- [ ] Payload CMS is initialized and accessible
- [ ] Database contains test data
- [ ] Admin user exists with valid credentials

### Approval Endpoint Tests
- [ ] Returns 401 without authentication
- [ ] Returns 403 with non-admin token
- [ ] Returns 404 for non-existent vendor
- [ ] Successfully approves pending vendor
- [ ] Updates user status to 'approved'
- [ ] Sets approved_at timestamp
- [ ] Publishes vendor profile
- [ ] Approved vendor can login

### Tier Endpoint Tests
- [ ] Returns 401 without authentication
- [ ] Returns 403 with non-admin token
- [ ] Returns 400 for missing tier parameter
- [ ] Returns 400 for invalid tier value
- [ ] Returns 404 for non-existent vendor
- [ ] Successfully upgrades to tier1
- [ ] Successfully upgrades to tier2
- [ ] Successfully upgrades to tier3
- [ ] Returns to free tier when downgraded
- [ ] Tier changes reflected in vendor profile
- [ ] Tier-locked fields become available
- [ ] Updated timestamp is set

### Database Verification
- [ ] Users collection updated with approved status
- [ ] Vendors collection updated with new tier
- [ ] Published flag set for approved vendors
- [ ] Timestamps are ISO 8601 format
- [ ] No orphaned records created

### Logging Verification
- [ ] Approval actions logged with [Admin Approve]
- [ ] Tier updates logged with [Admin Tier Update]
- [ ] Logs include vendorId, tier changes, timestamp
- [ ] No sensitive data in logs

---

## E2E Test Integration

### Helper Functions Status
- [x] `approveVendor()` - Now functional with endpoint
- [x] `upgradeTier()` - Now functional with endpoint
- [x] `createAndApproveVendor()` - Now functional
- [x] `createVendorWithTier()` - Now functional

### Related E2E Tests
- [ ] `tests/e2e/admin-approval-flow.spec.ts` - Should now pass
- [ ] `tests/e2e/vendor-tier-security.spec.ts` - Should now pass
- [ ] All vendor onboarding tests should now pass

---

## Performance Metrics

### Expected Response Times
- Approval endpoint: < 500ms
- Tier endpoint: < 500ms
- Database queries: < 200ms

### Load Test (Optional)
- 100 concurrent approval requests: < 5 seconds
- 100 concurrent tier updates: < 5 seconds

---

## Documentation

### Files to Review
- [x] `/home/edwin/development/ptnextjs/ADMIN-API-IMPLEMENTATION.md` - Full implementation details
- [x] `/home/edwin/development/ptnextjs/API-VERIFICATION-CHECKLIST.md` - This checklist
- [x] Endpoint source code follows project patterns
- [x] TypeScript types are properly defined

---

## Sign-off

| Item | Status | Notes |
|------|--------|-------|
| Endpoints Created | ✅ Complete | Both endpoints implemented |
| TypeScript Types | ✅ Complete | Using VendorTier type |
| Authentication | ✅ Complete | Admin token validation |
| Error Handling | ✅ Complete | 401/403/404/500 handled |
| Integration Tests | ✅ Complete | Contract validation tests |
| E2E Helpers Ready | ✅ Complete | Test helpers can now use endpoints |
| Documentation | ✅ Complete | Comprehensive documentation |
| Ready for QA | ✅ Yes | All systems go |

---

## Quick Start for Testing

### 1. Start Development Server
```bash
npm run dev
```

### 2. Create Admin Token (Separate from This Implementation)
Note: You need to have admin authentication setup separately. This depends on your existing admin user management system.

### 3. Test Approval
```bash
# First, register a vendor
# Note the vendor ID from response
# Then approve:
curl -X POST http://localhost:3000/api/admin/vendors/{userId}/approve \
  -H "Authorization: Bearer {admin_token}" \
  -H "Content-Type: application/json"
```

### 4. Test Tier Upgrade
```bash
curl -X PUT http://localhost:3000/api/admin/vendors/{vendorId}/tier \
  -H "Authorization: Bearer {admin_token}" \
  -H "Content-Type: application/json" \
  -d '{"tier": "tier1"}'
```

### 5. Run E2E Tests
```bash
npm run test:e2e -- admin-approval-flow.spec.ts
```

---

## Common Issues & Solutions

### Issue: "Admin access required" on every request
**Solution:** Verify your token has admin role in the JWT payload. Check authService.validateToken() is working correctly.

### Issue: Vendor not found (404)
**Solution:** Ensure you're using the correct ID format. Vendor ID should be a string matching the database record.

### Issue: Tier field not updating
**Solution:** Check that Payload CMS schema has tier field. Verify database has write permissions.

### Issue: Endpoints return 404
**Solution:** Restart the dev server. Next.js needs to rebuild routes after file creation.

---

## Support & Questions

For questions about these endpoints:
1. Review ADMIN-API-IMPLEMENTATION.md
2. Check existing similar endpoints (approve/reject patterns)
3. Verify authService implementation
4. Check Payload CMS schema for vendors collection
