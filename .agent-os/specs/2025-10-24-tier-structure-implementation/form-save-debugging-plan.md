# Form Save Debugging Plan

## Problem Statement
BasicInfoForm is not saving vendor profile updates to the database. Need to trace the full data flow from API → Form → Validation → Save → Database.

## Verified Working ✅

### Step 1: API Data Mapping ✅
**Status**: VERIFIED - companyName → name mapping works

**Evidence**:
```bash
# API returns correct data
curl -b /tmp/test-cookies.txt 'http://localhost:3000/api/portal/vendors/21?byUserId=true'
# Returns: {"id": 20, "name": "testvendor", "companyName": "testvendor"}
```

**Logs confirm**:
```
[VendorComputedFields] Mapped companyName to name: testvendor
```

**Files Modified**:
- `lib/services/VendorComputedFieldsService.ts` - Added companyName → name mapping
- `app/api/portal/vendors/[id]/route.ts` - Added logging

---

## Testing Plan - Remaining Steps

### Step 2: Frontend Data Reception
**Goal**: Verify vendor.name reaches the form component

**Test**: Add logging to VendorDashboardContext

```typescript
// In lib/context/VendorDashboardContext.tsx
// After fetching vendor, log:
console.log('[VendorDashboardContext] Vendor loaded:', {
  id: vendor.id,
  hasName: 'name' in vendor,
  name: vendor.name,
  hasCompanyName: 'companyName' in vendor,
  companyName: vendor.companyName
});
```

**Verification**:
1. Login at `/vendor/login`
2. Navigate to `/vendor/dashboard/profile`
3. Check browser console for log
4. Verify `name` field is populated

**Expected**: `name: "testvendor"`

---

### Step 3: Form Initialization
**Goal**: Verify React Hook Form initializes with vendor.name

**Test**: Check existing BasicInfoForm logging

**Current Logging** (already in place):
```typescript
// Line 58-73 in components/dashboard/BasicInfoForm.tsx
useEffect(() => {
  console.log('[BasicInfoForm] Validation State:', {
    isDirty,
    isValid,
    isSubmitting,
    errors: Object.keys(errors).length > 0 ? errors : 'none',
    formValues: {
      companyName: watch('companyName'),
      // ... other fields
    },
  });
}, [isDirty, isValid, isSubmitting, errors, watch]);
```

**Verification**:
1. Open browser console
2. Navigate to profile page
3. Check for `[BasicInfoForm] Validation State` logs
4. Verify `companyName` in formValues matches vendor.name

**Expected**: `companyName: "testvendor"` (form field name)

---

### Step 4: Form Validation
**Goal**: Verify validation passes when form has valid data

**Current Issue**: Form may be invalid on load if vendor.name is undefined

**Test**: Check validation state logs

**Verification**:
1. Check console logs for: `isValid: true/false`
2. Check for: `errors: 'none'` or `errors: {companyName: ...}`

**If FAIL**:
- `isValid: false` → Check what field is failing
- `errors: {companyName: ...}` → vendor.name is not reaching form

---

### Step 5: Form Submission
**Goal**: Verify handleSubmit is called when Save button is clicked

**Test**: Add logging to handleFormSubmit

```typescript
// In components/dashboard/BasicInfoForm.tsx
const handleFormSubmit = async (data: BasicInfoFormData) => {
  console.log('[BasicInfoForm] handleFormSubmit called with:', data);

  try {
    // Transform companyName → name for API
    const updates = {
      name: data.companyName,
      description: data.description,
      contactEmail: data.contactEmail,
      contactPhone: data.contactPhone,
      logo: data.logo,
    };

    console.log('[BasicInfoForm] Calling saveVendor with:', updates);
    await saveVendor(updates);
    console.log('[BasicInfoForm] saveVendor completed successfully');
  } catch (error) {
    console.error('[BasicInfoForm] saveVendor error:', error);
  }
};
```

**Verification**:
1. Make a change to description field
2. Click Save button
3. Check console for submit logs
4. Verify data structure

**If FAIL**:
- No submit log → Validation blocking submission
- Error in console → Check error message

---

### Step 6: API Request
**Goal**: Verify PUT request is sent with correct data

**Test**: Monitor network tab + server logs

**Browser**:
1. Open DevTools → Network tab
2. Filter: `XHR` or `Fetch`
3. Make form change and save
4. Look for PUT request to `/api/portal/vendors/[id]`
5. Check Request Payload

**Server Logs**:
```bash
tail -f /tmp/dev.log | grep -E "(VendorUpdate|PUT)"
```

**Expected Request**:
```json
{
  "name": "testvendor",
  "description": "Updated description",
  "contactEmail": "testvendor@test.com"
}
```

**If FAIL**:
- No network request → saveVendor not called or error before fetch
- Wrong data structure → Check data transformation
- 401 error → Authentication issue
- 400 error → Validation error
- 500 error → Server error

---

### Step 7: Database Update
**Goal**: Verify database record is updated

**Test**: Query database before and after

```bash
# Before save
sqlite3 payload.db "SELECT company_name, description, updated_at FROM vendors WHERE id = 20"

# After save (check updated_at changed)
sqlite3 payload.db "SELECT company_name, description, updated_at FROM vendors WHERE id = 20"
```

**Expected**: `updated_at` timestamp should be newer

**If FAIL**:
- Same timestamp → API didn't call Payload update
- Check server error logs

---

## Quick Diagnostic Script

Run this to test the full flow:

```bash
#!/bin/bash
echo "=== Form Save Diagnostic ==="

# 1. Test API
echo -e "\n1. Testing API GET..."
curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"testvendor@test.com","password":"123"}' \
  -c /tmp/test-cookies.txt > /dev/null

API_RESPONSE=$(curl -s -b /tmp/test-cookies.txt 'http://localhost:3000/api/portal/vendors/21?byUserId=true')
echo "$API_RESPONSE" | jq '.data | {id, name, companyName}'

# 2. Check server logs
echo -e "\n2. Server logs (last 20 lines with VendorComputedFields):"
tail -50 /tmp/dev.log | grep -A2 "VendorComputedFields"

# 3. Database state
echo -e "\n3. Current database state:"
sqlite3 /home/edwin/development/ptnextjs/payload.db "SELECT id, company_name, description, updated_at FROM vendors WHERE id = 20"

echo -e "\n=== Run this script after testing the form to compare ==="
```

---

## Minimal Manual Test

1. **Open browser** → http://localhost:3000/vendor/login
2. **Login** with testvendor@test.com / 123
3. **Navigate** to Profile tab
4. **Open DevTools** → Console + Network tabs
5. **Change description** field to "Test at [timestamp]"
6. **Click Save**
7. **Observe**:
   - Console logs (validation state, submit handler)
   - Network tab (PUT request)
   - Button state (Saving... → Save)
8. **Verify in database**:
   ```bash
   sqlite3 payload.db "SELECT description, updated_at FROM vendors WHERE id = 20"
   ```

---

## Common Failure Points & Fixes

### Issue: vendor.name is undefined in form
**Fix**: Already implemented VendorComputedFieldsService mapping

### Issue: Validation fails on load
**Cause**: Form initializes before vendor data loads
**Fix**: Check BasicInfoForm defaultValues - should use `vendor.name || ''`

### Issue: Save button does nothing
**Cause**: Validation blocking submission
**Fix**: Check `isValid` state and `errors` object

### Issue: Network request fails
**Cause**: Authentication or CORS
**Fix**: Check cookies are sent, credentials: 'include'

### Issue: Database not updated
**Cause**: API route error or Payload update error
**Fix**: Check server logs for errors

---

## Success Criteria

All these must be true:
- ✅ API returns `vendor.name`
- ✅ Form initializes with `companyName` value
- ✅ Form validation passes (`isValid: true`)
- ✅ Clicking Save triggers handleSubmit
- ✅ PUT request sent to API
- ✅ API returns 200 success
- ✅ Database `updated_at` timestamp changes
- ✅ Description field value persists in database

---

## Next Steps After Verification

Once form save works:
1. Remove all debug logging
2. Test with different fields (not just description)
3. Test tier-restricted fields
4. Add proper error handling
5. Add success toast notifications
6. Write integration tests
