# Admin API Contract - OpenAPI-style Documentation

## Base URL
```
http://localhost:3000 (development)
https://yourdomain.com (production)
```

---

## Endpoints

### 1. Approve Vendor

#### Request
```
POST /api/admin/vendors/{userId}/approve
```

#### Headers
```
Authorization: Bearer {admin_access_token}
Content-Type: application/json
```

#### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| userId | string | Yes | User ID of the vendor to approve |

#### Request Body
```json
{}
```
No request body required for approval.

#### Success Response (200 OK)
```json
{
  "message": "Vendor approved successfully",
  "user": {
    "id": "user_123abc",
    "email": "vendor@example.com",
    "status": "approved",
    "approved_at": "2025-11-03T10:30:00.000Z"
  }
}
```

#### Error Responses

**401 Unauthorized**
```json
{
  "error": "Authentication required"
}
```

**403 Forbidden**
```json
{
  "error": "Admin access required"
}
```

**404 Not Found**
```json
{
  "error": "Vendor not found"
}
```

**500 Internal Server Error**
```json
{
  "error": "Approval action failed"
}
```

#### Side Effects
- Updates user.status from "pending" to "approved"
- Sets user.approved_at to current timestamp
- Automatically publishes vendor profile
- Logs the approval action

#### Example cURL
```bash
curl -X POST http://localhost:3000/api/admin/vendors/user_123abc/approve \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json"
```

#### Example JavaScript/Fetch
```javascript
const response = await fetch('/api/admin/vendors/user_123abc/approve', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${adminToken}`,
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
if (response.ok) {
  console.log('Vendor approved:', data.user.email);
} else {
  console.error('Approval failed:', data.error);
}
```

#### Example Playwright/E2E
```typescript
const response = await page.request.post(
  'http://localhost:3000/api/admin/vendors/user_123abc/approve',
  {
    headers: {
      'Authorization': `Bearer ${adminToken}`,
      'Content-Type': 'application/json'
    }
  }
);

const data = await response.json();
expect(response.ok()).toBe(true);
expect(data.user.status).toBe('approved');
```

---

### 2. Update Vendor Tier

#### Request
```
PUT /api/admin/vendors/{vendorId}/tier
```

#### Headers
```
Authorization: Bearer {admin_access_token}
Content-Type: application/json
```

#### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| vendorId | string | Yes | Vendor ID to update |

#### Request Body
```json
{
  "tier": "free" | "tier1" | "tier2" | "tier3"
}
```

#### Request Body Schema
| Field | Type | Required | Valid Values | Description |
|-------|------|----------|--------------|-------------|
| tier | string | Yes | "free", "tier1", "tier2", "tier3" | Target tier level |

#### Success Response (200 OK)
```json
{
  "message": "Vendor tier updated successfully",
  "vendor": {
    "id": "vendor_456def",
    "companyName": "Tech Solutions Inc",
    "tier": "tier1",
    "updatedAt": "2025-11-03T10:30:00.000Z"
  }
}
```

#### Error Responses

**400 Bad Request - Missing tier**
```json
{
  "error": "Tier is required"
}
```

**400 Bad Request - Invalid tier**
```json
{
  "error": "Invalid tier value. Must be one of: free, tier1, tier2, tier3"
}
```

**401 Unauthorized**
```json
{
  "error": "Authentication required"
}
```

**403 Forbidden**
```json
{
  "error": "Admin access required"
}
```

**404 Not Found**
```json
{
  "error": "Vendor not found"
}
```

**500 Internal Server Error**
```json
{
  "error": "Tier update failed"
}
```

#### Side Effects
- Updates vendor.tier to requested value
- Sets vendor.updatedAt to current timestamp
- Tier restrictions automatically applied to vendor fields
- Logs the tier change for auditing

#### Tier Restrictions
After tier update, vendor field access is restricted as follows:

**Free Tier:**
- companyName
- description
- logo
- contactEmail
- contactPhone

**Tier 1 (Enhanced Profile):**
- All free tier fields
- website
- linkedinUrl
- twitterUrl
- certifications
- awards
- socialProof
- foundedYear
- yearsInBusiness
- employeeCount
- linkedinFollowers
- instagramFollowers
- clientSatisfactionScore
- repeatClientPercentage

**Tier 2 (Full Product Management):**
- All tier 1 fields
- locations (up to 5)
- featuredInCategory
- advancedAnalytics
- apiAccess
- customDomain
- products
- caseStudies

**Tier 3 (Premium Promoted Profile):**
- All tier 2 fields
- locations (unlimited)
- promotionPack
- editorialContent
- brandStory
- teamMembers

#### Example cURL
```bash
curl -X PUT http://localhost:3000/api/admin/vendors/vendor_456def/tier \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{"tier": "tier1"}'
```

#### Example JavaScript/Fetch
```javascript
const response = await fetch('/api/admin/vendors/vendor_456def/tier', {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${adminToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ tier: 'tier1' })
});

const data = await response.json();
if (response.ok) {
  console.log('Tier updated to:', data.vendor.tier);
} else {
  console.error('Update failed:', data.error);
}
```

#### Example Playwright/E2E
```typescript
const response = await page.request.put(
  'http://localhost:3000/api/admin/vendors/vendor_456def/tier',
  {
    headers: {
      'Authorization': `Bearer ${adminToken}`,
      'Content-Type': 'application/json'
    },
    data: { tier: 'tier1' }
  }
);

const data = await response.json();
expect(response.ok()).toBe(true);
expect(data.vendor.tier).toBe('tier1');
```

---

## Authentication

### Token Format
Both endpoints require a valid JWT token in the Authorization header.

#### Token Acquisition
1. Login as admin user to get access token
2. Include token in Authorization header as: `Bearer {token}`

#### Token Structure (JWT Payload)
```json
{
  "id": "admin_user_id",
  "email": "admin@example.com",
  "role": "admin",
  "iat": 1234567890,
  "exp": 1234571490
}
```

The endpoints validate that:
- Token is valid and not expired
- Token payload contains `role: "admin"`
- Token is provided in Authorization header or access_token cookie

---

## Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request succeeded |
| 400 | Bad Request | Invalid request parameters |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Authenticated but not authorized (not admin) |
| 404 | Not Found | Resource not found |
| 500 | Server Error | Unexpected server error |

---

## Rate Limiting

**Current:** No rate limiting implemented
**Recommended:** Implement for production
- 100 requests per minute per admin user
- Exponential backoff on repeated failures

---

## Versioning

**Current Version:** v1 (implicit)
**Breaking Changes:** None planned
**Deprecation Timeline:** 6+ months notice for any changes

---

## Migration Guide

### From Manual Approval to API
If you were manually updating the database:

**Before (Manual Database Update):**
```sql
UPDATE users SET status = 'approved', approved_at = NOW() WHERE id = 'user_123';
UPDATE vendors SET published = true WHERE user = 'user_123';
```

**After (Using API):**
```bash
curl -X POST http://localhost:3000/api/admin/vendors/user_123/approve \
  -H "Authorization: Bearer {admin_token}" \
  -H "Content-Type: application/json"
```

### From Manual Tier Update to API
**Before (Manual Database Update):**
```sql
UPDATE vendors SET tier = 'tier1' WHERE id = 'vendor_456';
```

**After (Using API):**
```bash
curl -X PUT http://localhost:3000/api/admin/vendors/vendor_456/tier \
  -H "Authorization: Bearer {admin_token}" \
  -H "Content-Type: application/json" \
  -d '{"tier": "tier1"}'
```

---

## Testing

### Unit Tests
```bash
npm run test -- __tests__/integration/api-admin-endpoints.test.ts
```

### E2E Tests
```bash
npm run test:e2e -- admin-approval-flow.spec.ts
npm run test:e2e -- vendor-tier-security.spec.ts
```

### Manual Testing with cURL
```bash
# Test approval
curl -X POST http://localhost:3000/api/admin/vendors/test/approve \
  -H "Content-Type: application/json"

# Test tier update
curl -X PUT http://localhost:3000/api/admin/vendors/test/tier \
  -H "Content-Type: application/json" \
  -d '{"tier": "tier1"}'
```

---

## Error Handling Best Practices

### Check Status Before Processing
```javascript
const response = await fetch('/api/admin/vendors/{id}/approve', { ... });
if (!response.ok) {
  const error = await response.json();
  console.error(`Error (${response.status}):`, error.error);
  return;
}
const data = await response.json();
// Process successful response
```

### Handle Specific Errors
```javascript
try {
  const response = await fetch('/api/admin/vendors/{id}/tier', {
    method: 'PUT',
    headers: { ... },
    body: JSON.stringify({ tier: 'tier1' })
  });

  if (response.status === 401) {
    console.error('Authentication failed - check token');
  } else if (response.status === 403) {
    console.error('Not authorized as admin');
  } else if (response.status === 404) {
    console.error('Vendor not found');
  } else if (response.status === 400) {
    const error = await response.json();
    console.error('Validation error:', error.error);
  } else if (!response.ok) {
    console.error('Unexpected error:', response.status);
  }
} catch (error) {
  console.error('Network error:', error);
}
```

---

## Related Endpoints

### Similar Admin Endpoints
- `POST /api/admin/vendors/[id]/reject` - Reject pending vendors
- `GET /api/admin/vendors/pending` - List pending vendors
- `GET /api/admin/vendors/approval` - List vendors for approval

### Vendor Management Endpoints
- `GET /api/portal/vendors/[id]` - Get vendor profile
- `PUT /api/portal/vendors/[id]` - Update vendor profile
- `PATCH /api/portal/vendors/[id]` - Partial vendor update

### Public Endpoints
- `GET /api/vendors/[slug]` - Get public vendor profile
- `GET /vendors` - List public vendors
- `GET /vendors/[slug]` - View public vendor page

---

## Support & Troubleshooting

### Issue: 401 Unauthorized
**Cause:** Missing or invalid token
**Solution:**
1. Verify token is in Authorization header
2. Check token is not expired
3. Ensure token has admin role

### Issue: 403 Forbidden
**Cause:** User is authenticated but not admin
**Solution:**
1. Verify user has admin role
2. Check token payload contains `role: "admin"`
3. Ensure using correct admin token

### Issue: 404 Not Found
**Cause:** Vendor/user doesn't exist
**Solution:**
1. Verify vendor ID/user ID is correct
2. Check vendor exists in database
3. Ensure using exact ID, not slug

### Issue: 400 Bad Request
**Cause:** Invalid request parameters
**Solution:**
1. Check tier value is valid (free, tier1, tier2, tier3)
2. Ensure tier parameter is included in body
3. Verify JSON is valid and properly formatted

### Issue: 500 Server Error
**Cause:** Unexpected server error
**Solution:**
1. Check server logs for error details
2. Verify database is accessible
3. Restart development server if needed
4. Contact support with error details

---

## API Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-11-03 | Initial implementation |

---

## Questions or Issues?

1. **Check Documentation:** Review ADMIN-API-IMPLEMENTATION.md
2. **Run Tests:** Use integration and E2E tests as examples
3. **Review Code:** Check endpoint source code for exact behavior
4. **Contact Team:** Reach out to development team for support
