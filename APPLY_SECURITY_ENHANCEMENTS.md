# Applying Security Enhancements - Step-by-Step Guide

## Prerequisites Check

All required files have been created and are ready to apply:

✓ `/lib/middleware/rateLimit.ts` - Rate limiting middleware
✓ `/middleware-new.ts` - Updated middleware with security headers
✓ `/lib/services/TierUpgradeRequestService-new.ts` - Enhanced input validation
✓ `/app/api/portal/vendors/[id]/tier-upgrade-request/route-new.ts` - Rate-limited vendor POST
✓ `/app/api/portal/vendors/[id]/tier-upgrade-request/[requestId]/route-new.ts` - Rate-limited vendor DELETE
✓ `/app/api/admin/tier-upgrade-requests/route-new.ts` - Rate-limited admin GET
✓ `/app/api/admin/tier-upgrade-requests/[id]/approve/route-new.ts` - Rate-limited admin approve
✓ `/app/api/admin/tier-upgrade-requests/[id]/reject/route-new.ts` - Rate-limited admin reject with validation

## Option 1: Automated Application (Recommended)

Run the provided script to apply all changes:

```bash
cd /home/edwin/development/ptnextjs
chmod +x apply-security-changes.sh
./apply-security-changes.sh
```

This will:
1. Create `.backup` files of originals
2. Move all `-new.ts` files into production locations
3. Preserve the rate limit middleware

## Option 2: Manual Application

If you prefer manual control, execute these commands:

```bash
cd /home/edwin/development/ptnextjs

# 1. Backup originals
cp middleware.ts middleware.ts.backup
cp lib/services/TierUpgradeRequestService.ts lib/services/TierUpgradeRequestService.ts.backup

# 2. Apply middleware changes
mv middleware-new.ts middleware.ts

# 3. Apply service layer changes
mv lib/services/TierUpgradeRequestService-new.ts lib/services/TierUpgradeRequestService.ts

# 4. Apply API route changes
mv app/api/portal/vendors/\[id\]/tier-upgrade-request/route-new.ts \
   app/api/portal/vendors/\[id\]/tier-upgrade-request/route.ts

mv app/api/portal/vendors/\[id\]/tier-upgrade-request/\[requestId\]/route-new.ts \
   app/api/portal/vendors/\[id\]/tier-upgrade-request/\[requestId\]/route.ts

mv app/api/admin/tier-upgrade-requests/route-new.ts \
   app/api/admin/tier-upgrade-requests/route.ts

mv app/api/admin/tier-upgrade-requests/\[id\]/approve/route-new.ts \
   app/api/admin/tier-upgrade-requests/\[id\]/approve/route.ts

mv app/api/admin/tier-upgrade-requests/\[id\]/reject/route-new.ts \
   app/api/admin/tier-upgrade-requests/\[id\]/reject/route.ts
```

## Verification Steps

### 1. TypeScript Compilation

```bash
npm run type-check
```

**Expected:** No errors

### 2. Build Test

```bash
npm run build
```

**Expected:** Successful build without errors

### 3. Security Headers Test

Start the dev server and test security headers:

```bash
npm run dev
# In another terminal:
curl -I http://localhost:3000/api/admin/tier-upgrade-requests
```

**Expected Headers:**
```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; ...
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()
```

### 4. Rate Limiting Test

```bash
# Send 11 rapid requests (should rate limit on 11th)
for i in {1..11}; do
  curl -X GET http://localhost:3000/api/admin/tier-upgrade-requests \
    -H "Cookie: payload-token=test" \
    -w "\nStatus: %{http_code}\n" \
    -s -o /dev/null
  echo "Request $i"
done
```

**Expected:**
- Requests 1-10: Status 200 or 401 (auth)
- Request 11: Status 429 (Too Many Requests)

**Response Headers on Rate Limit:**
```
HTTP/1.1 429 Too Many Requests
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 0
X-RateLimit-Reset: [unix timestamp]
Retry-After: [seconds]
```

### 5. Input Validation Test

#### Test Rejection Reason Minimum Length

```bash
curl -X PUT http://localhost:3000/api/admin/tier-upgrade-requests/test-id/reject \
  -H "Content-Type: application/json" \
  -H "Cookie: payload-token=admin-token" \
  -d '{"rejectionReason": "short"}' \
  -w "\nStatus: %{http_code}\n"
```

**Expected:**
```json
{
  "success": false,
  "error": "VALIDATION_ERROR",
  "message": "Rejection reason must be at least 10 characters"
}
```
**Status:** 400

#### Test Vendor Notes Minimum Length

```bash
curl -X POST http://localhost:3000/api/portal/vendors/vendor-id/tier-upgrade-request \
  -H "Content-Type: application/json" \
  -H "Cookie: payload-token=vendor-token" \
  -d '{"requestedTier": "tier2", "vendorNotes": "short"}' \
  -w "\nStatus: %{http_code}\n"
```

**Expected:**
```json
{
  "success": false,
  "error": "VALIDATION_ERROR",
  "message": "Vendor notes must be at least 20 characters when provided"
}
```
**Status:** 400

### 6. E2E Test Suite

```bash
npm run test:e2e -- tests/e2e/tier-upgrade-request-vendor.spec.ts
npm run test:e2e -- tests/e2e/tier-upgrade-request-admin.spec.ts
```

**Expected:** All tests pass

**Note:** Some tests may need updates due to new validation rules:
- Tests submitting short vendor notes (<20 chars) will now fail validation
- Tests submitting short rejection reasons (<10 chars) will now fail validation

Update test data as needed:
```typescript
// OLD (will now fail)
vendorNotes: "Want upgrade"

// NEW (will pass)
vendorNotes: "We need tier upgrade to access advanced features for our growing business"

// OLD (will now fail)
rejectionReason: "No"

// NEW (will pass)
rejectionReason: "Insufficient justification provided in request"
```

## Rollback Instructions

If you need to rollback the changes:

```bash
cd /home/edwin/development/ptnextjs

# Restore from backups
cp middleware.ts.backup middleware.ts
cp lib/services/TierUpgradeRequestService.ts.backup lib/services/TierUpgradeRequestService.ts

# Revert API routes from git
git checkout app/api/portal/vendors app/api/admin/tier-upgrade-requests

# Remove rate limiting middleware
rm lib/middleware/rateLimit.ts

# Rebuild
npm run build
```

## Post-Deployment Checklist

- [ ] All backups created
- [ ] TypeScript compilation passes
- [ ] Build succeeds
- [ ] Security headers present in API responses
- [ ] Rate limiting works (returns 429 after 10 requests)
- [ ] Input validation rejects invalid data
- [ ] E2E tests updated and passing
- [ ] Security enhancements documented
- [ ] Changes committed to git
- [ ] PR created for review

## Git Commit Message Template

```
feat(security): Implement HIGH priority security enhancements for tier upgrade system

Addresses security validation report findings (score 82/100 → 95+/100):

1. CSP & Security Headers (middleware.ts)
   - Content-Security-Policy with restrictive directives
   - X-Content-Type-Options: nosniff
   - X-Frame-Options: DENY
   - X-XSS-Protection: 1; mode=block
   - Referrer-Policy & Permissions-Policy

2. Rate Limiting (lib/middleware/rateLimit.ts)
   - In-memory rate limiter: 10 req/min per IP
   - Applied to all tier-upgrade API endpoints
   - Returns 429 with Retry-After header
   - Automatic cleanup of expired entries

3. Input Validation Enhancements
   - Rejection reason: minimum 10 characters
   - Vendor notes: minimum 20 characters when provided
   - Both with clear error messages

Files Modified:
- middleware.ts
- lib/middleware/rateLimit.ts (new)
- lib/services/TierUpgradeRequestService.ts
- app/api/portal/vendors/[id]/tier-upgrade-request/route.ts
- app/api/portal/vendors/[id]/tier-upgrade-request/[requestId]/route.ts
- app/api/admin/tier-upgrade-requests/route.ts
- app/api/admin/tier-upgrade-requests/[id]/approve/route.ts
- app/api/admin/tier-upgrade-requests/[id]/reject/route.ts

Breaking Changes:
- Vendor notes now require minimum 20 characters when provided
- Rejection reasons now require minimum 10 characters
- Rate limiting may affect high-volume API consumers

References:
- Issue: ptnextjs-1e5b
- Security Report: SECURITY_ENHANCEMENTS_REPORT.md
- OWASP Top 10 2021 compliance
```

## Support & Troubleshooting

### Issue: TypeScript errors after applying changes

**Solution:** Ensure all imports are correct. Check:
```typescript
import { rateLimit } from '@/lib/middleware/rateLimit';
```

### Issue: Rate limiting not working

**Solution:** Verify middleware matcher includes API routes:
```typescript
export const config = {
  matcher: [
    '/vendor/dashboard/:path*',
    '/api/:path*',  // Should be present
  ],
};
```

### Issue: Build fails

**Solution:** Run type-check first to identify specific errors:
```bash
npm run type-check
```

### Issue: Tests failing due to validation

**Solution:** Update test data to meet new minimum length requirements:
- Vendor notes: ≥20 characters
- Rejection reason: ≥10 characters

## Next Steps

1. **Apply changes** using automated or manual method
2. **Run verification tests** (all 6 steps above)
3. **Update E2E tests** if validation changes break existing tests
4. **Commit changes** with descriptive message
5. **Create PR** for team review
6. **Deploy to staging** for final validation
7. **Update security score** in documentation

## Questions or Issues?

Refer to:
- Detailed report: `SECURITY_ENHANCEMENTS_REPORT.md`
- Rate limiting docs: `lib/middleware/rateLimit.ts` (comprehensive inline docs)
- Project CLAUDE.md for tier-upgrade system overview
