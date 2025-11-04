# Admin API Endpoints - Quick Reference

## Endpoints At a Glance

### Approve Vendor
```
POST /api/admin/vendors/{userId}/approve
```
- **Purpose:** Approve pending vendors
- **Auth:** Admin token required
- **Body:** None
- **Response:** User with status="approved"

### Update Tier
```
PUT /api/admin/vendors/{vendorId}/tier
Body: { "tier": "free"|"tier1"|"tier2"|"tier3" }
```
- **Purpose:** Change vendor tier
- **Auth:** Admin token required
- **Response:** Vendor with updated tier

---

## Quick Test Commands

### Approve
```bash
curl -X POST http://localhost:3000/api/admin/vendors/USER_ID/approve \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json"
```

### Update Tier
```bash
curl -X PUT http://localhost:3000/api/admin/vendors/VENDOR_ID/tier \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"tier":"tier1"}'
```

---

## Response Format

### Success (200)
```json
{
  "message": "Action completed successfully",
  "user": { "id": "...", "status": "approved" },
  "vendor": { "id": "...", "tier": "tier1" }
}
```

### Error
```json
{
  "error": "Error message describing what went wrong"
}
```

**Status Codes:**
- 200 = Success
- 400 = Bad request (invalid data)
- 401 = Need authentication
- 403 = Not authorized (not admin)
- 404 = Resource not found
- 500 = Server error

---

## Files

| File | Purpose |
|------|---------|
| `/app/api/admin/vendors/[id]/approve/route.ts` | Approve endpoint |
| `/app/api/admin/vendors/[id]/tier/route.ts` | Tier endpoint |
| `ADMIN-API-IMPLEMENTATION.md` | Full docs |
| `API-VERIFICATION-CHECKLIST.md` | QA guide |
| `ADMIN-API-CONTRACT.md` | API specification |

---

## Common Tasks

### Register & Approve Vendor
```javascript
// 1. Register vendor (user goes to /vendor/register)
// 2. Get userId from response
// 3. Approve:
const response = await fetch('/api/admin/vendors/{userId}/approve', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` }
});
```

### Upgrade Vendor to Tier 1
```javascript
// Requires: adminToken, vendorId
const response = await fetch('/api/admin/vendors/{vendorId}/tier', {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${adminToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ tier: 'tier1' })
});
```

### Test in Playwright
```typescript
await page.request.post('/api/admin/vendors/USER_ID/approve', {
  headers: { 'Authorization': `Bearer ${token}` }
});

await page.request.put('/api/admin/vendors/VENDOR_ID/tier', {
  headers: { 'Authorization': `Bearer ${token}` },
  data: { tier: 'tier2' }
});
```

---

## Key Points

✅ **Both endpoints require admin authentication**
✅ **Tier must be one of: free, tier1, tier2, tier3**
✅ **Approval also publishes vendor profile**
✅ **All actions are logged for auditing**
✅ **Endpoints follow existing code patterns**

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| 401 error | Check admin token is valid and not expired |
| 403 error | Verify token has role="admin" |
| 404 error | Verify vendor/user ID exists in database |
| 400 error | Check request body and tier value |
| No response | Dev server might be down, try `npm run dev` |

---

## Implementation Status

- ✅ Approval endpoint: READY
- ✅ Tier endpoint: READY
- ✅ Tests created: READY
- ✅ Documentation: COMPLETE
- ✅ E2E helpers: FUNCTIONAL

**Status: Ready for production**

---

## Related Documentation

- See `ADMIN-API-IMPLEMENTATION.md` for full details
- See `API-VERIFICATION-CHECKLIST.md` for QA testing
- See `ADMIN-API-CONTRACT.md` for complete API spec
- See test helpers in `/tests/e2e/helpers/vendor-onboarding-helpers.ts`
