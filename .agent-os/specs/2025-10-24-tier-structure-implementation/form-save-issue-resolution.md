# Form Save Issue Resolution Report

## Executive Summary

Comprehensive testing revealed **two critical issues** blocking vendor profile form saves:

1. ✅ **FIXED**: Frontend validation error (logo field)
2. ❌ **IDENTIFIED**: Backend validation error (invalid request payload)

## Issue 1: Frontend Logo Field Validation ✅ FIXED

### Problem
Zod validation schema for `logo` field was incorrectly configured:
```typescript
logo: z.string().url('Invalid logo URL').optional().nullable()
```

When `logo` was `undefined` or empty string, Zod's `.string()` validator ran before `.optional()`, causing validation to fail with `isValid: false`, which blocked form submission.

### Solution
Updated all URL fields in `lib/validation/vendorSchemas.ts` to use preprocessing:
```typescript
logo: z.preprocess(
  (val) => (val === '' || val === null ? undefined : val),
  z.string().url('Invalid logo URL').optional()
)
```

This converts empty strings and null to undefined before validation, allowing the field to be truly optional.

### Files Modified
- `lib/validation/vendorSchemas.ts`
  - `basicInfoSchema` - logo, contactPhone
  - `brandStorySchema` - website, linkedinUrl, twitterUrl, videoUrl, videoThumbnail
  - `certificationSchema` - logo, verificationUrl
  - `awardSchema` - image
  - `teamMemberSchema` - photo, linkedinUrl

### Verification
```bash
npx playwright test tests/e2e/comprehensive-form-save-test.spec.ts
```

**Results:**
- ✅ Step 1-3: API data mapping, vendor loading, form initialization - PASS
- ✅ Step 4: Form validation now passes (`isValid: true`)
- ✅ Step 5: Form submission triggers (`handleFormSubmit` called)
- ✅ Step 6: PUT request made to `/api/portal/vendors/20`
- ❌ Step 7: Database not updated (400 Bad Request from API)

## Issue 2: Backend API Validation Error ❌ IDENTIFIED

### Problem
The PUT request to `/api/portal/vendors/20` returns **400 Bad Request**:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "fields": {
      "twitterUrl": "Invalid input",
      "certifications": "Expected string, received array"
    }
  }
}
```

### Root Cause
The frontend is sending the **entire vendor object** to the API, including:
- Read-only fields (id, user, createdAt, updatedAt)
- Relational data (certifications array, awards array, locations array)
- Non-editable fields (twitterUrl with empty string "")

### Test Evidence
```typescript
[VendorDashboardContext] Request body: {
  "id": 20,
  "user": { ... },                 // Should not be sent
  "tier": "tier1",
  "companyName": "testvendor",
  "slug": "testvendor",
  "description": "...",
  "certifications": [...],         // Backend expects this excluded
  "awards": [...],                 // Backend expects this excluded
  "twitterUrl": "",                // Empty string fails validation
  "locations": [...]               // Backend expects this excluded
}
```

### Expected Behavior
BasicInfoForm should only send fields from `BasicInfoFormData`:
```typescript
{
  "name": "testvendor",           // Note: companyName → name transformation
  "slug": "testvendor",
  "description": "Updated description",
  "logo": undefined,
  "contactEmail": "testvendor@test.com",
  "contactPhone": "+31 6039393839"
}
```

### Investigation Needed
1. **Check ProfileEditTabs.tsx** - How is form data merged with vendor object?
2. **Check VendorDashboardContext.tsx** - What data is sent in PUT request?
3. **Check API route** - What validation schema is being used on backend?

## Diagnostic Test Results

### Automated Script Output
```bash
✓ API returns vendor.name
✓ VendorComputedFields mapping works
Current DB state: description="To boldly go!", updated_at="2025-10-24T14:29:10.498Z"
```

### Playwright Test Summary
- Total console logs: 38
- VendorDashboardContext logs: 4
- Form validation logs: 4
- Form submission logs: 5
- API request logs: 0 (timing issue, but request was made)

### Key Console Logs
```
[VendorDashboardContext] onSuccess - Vendor loaded: {hasName: true, name: testvendor}
[BasicInfoForm] Validation State: {isValid: true, isDirty: true}
[BasicInfoForm] handleFormSubmit called
[VendorDashboardContext] Making PUT request to: /api/portal/vendors/20
[VendorDashboardContext] API error: Invalid input data
```

## Next Steps

### 1. Fix Request Payload Transformation
The BasicInfoForm submits correct data, but ProfileEditTabs or VendorDashboardContext is merging it with the full vendor object. Need to:

a) Check `app/(site)/vendor/dashboard/components/ProfileEditTabs.tsx`:
   - How does `handleFormSave` transform the data?
   - Is it unnecessarily merging with vendor object?

b) Check `lib/context/VendorDashboardContext.tsx`:
   - What does `saveVendor` send in the PUT request?
   - Is it filtering out non-updatable fields?

### 2. Backend Validation Review
Check `app/api/portal/vendors/[id]/route.ts`:
- What validation schema is used?
- Does it handle optional fields correctly?
- Does it exclude relational arrays?

### 3. Fix Empty String Handling
The backend validation fails on `twitterUrl: ""`. Need to ensure:
- Frontend converts empty strings to `undefined` or `null`
- Backend accepts `null` for optional URL fields
- Consistent handling across all optional fields

### 4. Test End-to-End
Once fixed, verify:
```bash
# Run comprehensive test
npx playwright test tests/e2e/comprehensive-form-save-test.spec.ts

# Verify database update
sqlite3 payload.db "SELECT description, updated_at FROM vendors WHERE id = 20"
```

**Success Criteria:**
- PUT request returns 200
- Database `updated_at` timestamp changes
- Database `description` field contains new value

## Files to Investigate

1. `app/(site)/vendor/dashboard/components/ProfileEditTabs.tsx:91` - handleFormSave
2. `lib/context/VendorDashboardContext.tsx:114` - saveVendor
3. `app/api/portal/vendors/[id]/route.ts` - PUT handler and validation
4. `components/dashboard/BasicInfoForm.tsx` - Form submission (already correct)

## Testing Infrastructure Created

- `tests/e2e/comprehensive-form-save-test.spec.ts` - Full E2E test with detailed logging
- `scripts/test-form-save.sh` - Automated baseline diagnostic script
- Enhanced logging in:
  - VendorComputedFieldsService.ts
  - app/api/portal/vendors/[id]/route.ts
  - lib/context/VendorDashboardContext.tsx
  - components/dashboard/BasicInfoForm.tsx

## Conclusion

**Progress Made:**
- ✅ Frontend validation issue resolved
- ✅ Form submission flow verified working
- ✅ Root cause of API error identified
- ✅ Comprehensive testing infrastructure in place

**Remaining Work:**
- Fix request payload to only include updatable fields
- Ensure empty strings are handled correctly
- Verify backend validation accepts the corrected payload
- Test and confirm database updates work end-to-end

**Estimated Time to Resolution:** 30-60 minutes
