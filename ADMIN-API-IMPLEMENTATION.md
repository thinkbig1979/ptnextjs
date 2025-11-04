# Admin API Endpoints Implementation

## Overview

Two critical P0 API endpoints have been implemented to support admin vendor management and E2E testing:

1. **POST /api/admin/vendors/[id]/approve** - Approve pending vendors
2. **PUT /api/admin/vendors/[id]/tier** - Update vendor tier

Both endpoints are now fully functional and ready for E2E test integration.

## Files Created/Modified

### New Files Created

1. **`/home/edwin/development/ptnextjs/app/api/admin/vendors/[id]/tier/route.ts`**
   - Admin-only endpoint to update vendor tier
   - Accepts PUT requests with tier value in request body
   - Validates tier is one of: 'free', 'tier1', 'tier2', 'tier3'
   - Returns updated vendor data on success

2. **`/home/edwin/development/ptnextjs/__tests__/integration/api-admin-endpoints.test.ts`**
   - Integration tests for both admin endpoints
   - Tests authentication requirements
   - Tests error handling (401, 403, 404)
   - Tests request/response contract validation

### Existing File

3. **`/home/edwin/development/ptnextjs/app/api/admin/vendors/[id]/approve/route.ts`**
   - Already existed and is fully functional
   - No modifications needed
   - Updates user status from 'pending' to 'approved'
   - Also publishes the vendor profile

## Endpoint Specifications

### 1. Approve Vendor Endpoint

**Path:** `POST /api/admin/vendors/[id]/approve`

**Authentication:** Admin only (verified via access token)

**Request:**
```
POST /api/admin/vendors/{userId}/approve
Headers:
  - Authorization: Bearer {admin_token}
  - Content-Type: application/json
```

**Response (200 OK):**
```json
{
  "message": "Vendor approved successfully",
  "user": {
    "id": "user_id",
    "email": "vendor@example.com",
    "status": "approved",
    "approved_at": "2025-11-03T10:30:00.000Z"
  }
}
```

**Error Responses:**
- `401 Unauthorized` - Missing or invalid authentication token
- `403 Forbidden` - User is not an admin
- `404 Not Found` - Vendor user not found
- `500 Server Error` - Unexpected server error

**Implementation Details:**
- Updates the user record in 'users' collection with status='approved'
- Sets approved_at timestamp
- Automatically publishes the associated vendor profile
- Logs the approval action for auditing

### 2. Tier Upgrade Endpoint

**Path:** `PUT /api/admin/vendors/[id]/tier`

**Authentication:** Admin only (verified via access token)

**Request:**
```
PUT /api/admin/vendors/{vendorId}/tier
Headers:
  - Authorization: Bearer {admin_token}
  - Content-Type: application/json

Body:
{
  "tier": "free" | "tier1" | "tier2" | "tier3"
}
```

**Response (200 OK):**
```json
{
  "message": "Vendor tier updated successfully",
  "vendor": {
    "id": "vendor_id",
    "companyName": "Company Name",
    "tier": "tier1",
    "updatedAt": "2025-11-03T10:30:00.000Z"
  }
}
```

**Error Responses:**
- `400 Bad Request` - Missing or invalid tier parameter
- `401 Unauthorized` - Missing or invalid authentication token
- `403 Forbidden` - User is not an admin
- `404 Not Found` - Vendor not found
- `500 Server Error` - Unexpected server error

**Validation:**
- Tier must be one of: 'free', 'tier1', 'tier2', 'tier3'
- Vendor must exist in the database
- Only admins can update vendor tiers

**Implementation Details:**
- Uses VendorTier type from `@/lib/utils/tier-validator`
- Validates tier value using validateTier() helper
- Updates vendor record with new tier
- Logs tier changes for auditing
- Returns updated vendor information

## Authentication Pattern

Both endpoints follow the same authentication pattern used throughout the codebase:

```typescript
function extractAdminUser(request: NextRequest) {
  const token =
    request.cookies.get('access_token')?.value ||
    request.headers.get('authorization')?.replace('Bearer ', '');

  if (!token) {
    throw new Error('Authentication required');
  }

  const user = authService.validateToken(token);
  if (user.role !== 'admin') {
    throw new Error('Admin access required');
  }

  return user;
}
```

This pattern:
- Checks for token in cookies (first) or Authorization header (fallback)
- Validates the token using authService.validateToken()
- Verifies the user role is 'admin'
- Throws errors with appropriate messages for error handling

## Integration with E2E Tests

The test helpers in `/home/edwin/development/ptnextjs/tests/e2e/helpers/vendor-onboarding-helpers.ts` already reference these endpoints:

```typescript
// Approve vendor via admin action
export async function approveVendor(page: Page, vendorId: string): Promise<void> {
  const response = await page.request.post(
    `${API_BASE}/api/admin/vendors/${vendorId}/approve`,
    { headers: { 'Content-Type': 'application/json' } }
  );
  // ...
}

// Upgrade vendor tier via admin action
export async function upgradeTier(
  page: Page,
  vendorId: string,
  tier: 'tier1' | 'tier2' | 'tier3'
): Promise<void> {
  const response = await page.request.put(
    `${API_BASE}/api/admin/vendors/${vendorId}/tier`,
    { headers: { 'Content-Type': 'application/json' }, data: { tier } }
  );
  // ...
}
```

These helper functions will now work correctly with the implemented endpoints.

## Testing the Endpoints

### Prerequisites
1. Development server running: `npm run dev`
2. Admin user account with valid authentication token
3. Vendor records in the database for testing

### Manual Testing with cURL

**Test Approve Endpoint:**
```bash
curl -X POST http://localhost:3000/api/admin/vendors/{user_id}/approve \
  -H "Authorization: Bearer {admin_token}" \
  -H "Content-Type: application/json"
```

**Test Tier Endpoint:**
```bash
curl -X PUT http://localhost:3000/api/admin/vendors/{vendor_id}/tier \
  -H "Authorization: Bearer {admin_token}" \
  -H "Content-Type: application/json" \
  -d '{"tier": "tier1"}'
```

### Running Integration Tests

```bash
# Run integration tests for admin endpoints
npm run test -- __tests__/integration/api-admin-endpoints.test.ts

# Run all admin-related E2E tests
npm run test:e2e -- admin-approval-flow.spec.ts
```

## Error Handling

Both endpoints follow consistent error handling patterns:

1. **Authentication Errors (401)**
   - Missing authentication token
   - Invalid or expired token
   - Message: "Authentication required"

2. **Authorization Errors (403)**
   - User is not an admin
   - Message: "Admin access required"

3. **Validation Errors (400)**
   - Invalid tier value
   - Missing required parameters
   - Message describes the validation error

4. **Not Found Errors (404)**
   - Vendor or user doesn't exist
   - Message: "Vendor not found"

5. **Server Errors (500)**
   - Unexpected errors during processing
   - Message: "Approval action failed" or "Tier update failed"

## Type Safety

Both endpoints use proper TypeScript types:

- **VendorTier**: Type-safe tier enumeration ('free' | 'tier1' | 'tier2' | 'tier3')
- **NextRequest/NextResponse**: Proper Next.js API request/response types
- **validateTier()**: Type guard function ensuring tier validation at runtime

Example:
```typescript
import type { VendorTier } from '@/lib/utils/tier-validator';

function validateTier(tier: unknown): tier is VendorTier {
  return ['free', 'tier1', 'tier2', 'tier3'].includes(tier as string);
}
```

## Logging and Auditing

Both endpoints log their actions for debugging and auditing:

**Approve endpoint logs:**
```
[Admin Approve] Error: <error_message>
```

**Tier endpoint logs:**
```
[Admin Tier Update]: {
  vendorId: <id>,
  previousTier: <old_tier>,
  newTier: <new_tier>,
  timestamp: <iso_string>
}
```

## Security Considerations

1. **Authentication Required**: Both endpoints verify admin authentication before proceeding
2. **Authorization Checks**: Only admin role users can access these endpoints
3. **Input Validation**: Tier values are strictly validated against allowed options
4. **Vendor Verification**: Endpoints verify vendor/user exists before updating
5. **Error Messages**: Generic error messages to prevent information disclosure
6. **Logging**: All actions are logged for audit trails

## Future Enhancements

Possible improvements for future iterations:

1. **Rate Limiting**: Add rate limiting to prevent abuse
2. **Change Logs**: Store detailed change logs for vendor modifications
3. **Email Notifications**: Send notifications to vendors when approved/tier updated
4. **Batch Operations**: Support bulk approval/tier updates
5. **Webhooks**: Notify external systems of vendor status changes
6. **API Documentation**: Generate OpenAPI/Swagger documentation

## Troubleshooting

### Endpoints return 404
- Verify the Next.js dev server is running
- Check that routes are properly registered (Next.js might need restart)
- Verify the file paths are correct

### Authentication fails
- Ensure admin token is valid and not expired
- Check that token is passed in Authorization header or as access_token cookie
- Verify user role is 'admin' in the token payload

### Tier update not working
- Verify the vendor ID exists in the database
- Check that the tier value is one of the four valid options
- Ensure the Payload CMS database is accessible

### Database errors
- Check that Payload CMS is properly initialized
- Verify vendor collection exists and has proper schema
- Ensure database has appropriate permissions for updates

## Related Files

- `/home/edwin/development/ptnextjs/lib/services/auth-service.ts` - Authentication service
- `/home/edwin/development/ptnextjs/lib/utils/tier-validator.ts` - Tier validation utilities
- `/home/edwin/development/ptnextjs/app/api/admin/vendors/[id]/reject/route.ts` - Similar reject endpoint pattern
- `/home/edwin/development/ptnextjs/app/api/portal/vendors/[id]/route.ts` - Vendor update endpoint
- `/home/edwin/development/ptnextjs/tests/e2e/helpers/vendor-onboarding-helpers.ts` - Test helpers

## Status

**Implementation Status: COMPLETE**

Both endpoints are fully implemented, tested, and ready for:
- E2E test integration
- Admin workflow automation
- Testing infrastructure
- Production use (with proper admin authentication)

All code follows existing project patterns and conventions.
