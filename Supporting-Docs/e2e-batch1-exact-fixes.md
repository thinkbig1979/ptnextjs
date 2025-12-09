# Exact Fixes Needed - E2E Batch 1

## File: admin-approval-flow.spec.ts

### Line 62
**BEFORE:**
```typescript
console.log(`✅ Vendor created with ID: ${vendorId}`);
```
**AFTER:**
```typescript
console.log(`[OK] Vendor created with ID: ${vendorId}`);
```

### Line 63
**BEFORE:**
```typescript
console.log(`✅ Email: ${testEmail}`);
```
**AFTER:**
```typescript
console.log(`[OK] Email: ${testEmail}`);
```

### Line 64
**BEFORE:**
```typescript
console.log(`✅ Status: pending`);
```
**AFTER:**
```typescript
console.log(`[OK] Status: pending`);
```

### Line 90
**BEFORE:**
```typescript
console.log('✅ Login correctly rejected for pending account');
```
**AFTER:**
```typescript
console.log('[OK] Login correctly rejected for pending account');
```

### Line 102
**BEFORE:**
```typescript
const response = await fetch(`${BASE_URL}/api/admin/approve-vendor', {
```
**AFTER:**
```typescript
const response = await fetch(`${BASE_URL}/api/admin/approve-vendor`, {
```

### Line 127
**BEFORE:**
```typescript
console.log('⚠️  Admin approval endpoint not available - test will verify pending state only');
```
**AFTER:**
```typescript
console.log('[WARN] Admin approval endpoint not available - test will verify pending state only');
```

### Line 128
**BEFORE:**
```typescript
console.log('⚠️  In a full implementation, admin would approve via Payload admin UI');
```
**AFTER:**
```typescript
console.log('[WARN] In a full implementation, admin would approve via Payload admin UI');
```

### Line 165
**BEFORE:**
```typescript
console.log('✅ Approved vendor successfully logged in');
```
**AFTER:**
```typescript
console.log('[OK] Approved vendor successfully logged in');
```

### Line 174
**BEFORE:**
```typescript
console.log('✅ Admin approval flow test completed');
```
**AFTER:**
```typescript
console.log('[OK] Admin approval flow test completed');
```

### Line 206
**BEFORE:**
```typescript
console.log('✅ Pending status UI test completed');
```
**AFTER:**
```typescript
console.log('[OK] Pending status UI test completed');
```

---

## File: admin-panel.spec.ts

### Line 67
**BEFORE:**
```typescript
await page.goto(`${BASE_URL}/admin/login', { waitUntil: 'networkidle' });
```
**AFTER:**
```typescript
await page.goto(`${BASE_URL}/admin/login`, { waitUntil: 'networkidle' });
```

---

## File: bug-fixes-verification.spec.ts

### Line 161
**BEFORE:**
```typescript
await page.goto(`${BASE_URL}/vendors');
```
**AFTER:**
```typescript
await page.goto(`${BASE_URL}/vendors`);
```

---

## File: certifications-awards-manager.spec.ts

### Line 8
**BEFORE:**
```typescript
await page.goto(`${BASE_URL}/vendor/dashboard/profile');
```
**AFTER:**
```typescript
await page.goto(`${BASE_URL}/vendor/dashboard/profile`);
```

### Line 18
**BEFORE:**
```typescript
await page.goto(`${BASE_URL}/vendor/dashboard/profile');
```
**AFTER:**
```typescript
await page.goto(`${BASE_URL}/vendor/dashboard/profile`);
```

---

## File: comprehensive-form-save-test.spec.ts

### Line 73
**BEFORE:**
```typescript
console.log('✓ Logged in successfully');
```
**AFTER:**
```typescript
console.log('[OK] Logged in successfully');
```

### Line 80
**BEFORE:**
```typescript
console.log('✓ Profile page loaded');
```
**AFTER:**
```typescript
console.log('[OK] Profile page loaded');
```

### Line 96
**BEFORE:**
```typescript
console.log('✓ Vendor data received by context');
```
**AFTER:**
```typescript
console.log('[OK] Vendor data received by context');
```

### Line 115
**BEFORE:**
```typescript
console.log('✓ Form initialized with data');
```
**AFTER:**
```typescript
console.log('[OK] Form initialized with data');
```

### Line 128
**BEFORE:**
```typescript
console.log('✓ Form validation passes');
```
**AFTER:**
```typescript
console.log('[OK] Form validation passes');
```

### Line 177
**BEFORE:**
```typescript
console.log('✓ Save button is enabled');
```
**AFTER:**
```typescript
console.log('[OK] Save button is enabled');
```

### Line 198
**BEFORE:**
```typescript
console.log('✓ handleFormSubmit was called');
```
**AFTER:**
```typescript
console.log('[OK] handleFormSubmit was called');
```

### Line 213
**BEFORE:**
```typescript
console.log('✓ PUT request was made');
```
**AFTER:**
```typescript
console.log('[OK] PUT request was made');
```

### Line 222
**BEFORE:**
```typescript
console.log('✓ API returned 200 success');
```
**AFTER:**
```typescript
console.log('[OK] API returned 200 success');
```

---

## File: debug-form-submission.spec.ts

### Line 24
**BEFORE:**
```typescript
await page.goto(`${BASE_URL}/vendor/login');
```
**AFTER:**
```typescript
await page.goto(`${BASE_URL}/vendor/login`);
```

### Lines 29, 34, 39, 45, 50, 58, 85, 103, 123, 130, 137
Replace all `✓` with `[OK]`

### Lines 75, 106, 121, 135
Replace all `❌` with `[FAIL]`

### Line 128
Replace `⚠️` with `[WARN]`

---

## Automated Fix

Run the fix script:
```bash
cd /home/edwin/development/ptnextjs
bash fix-e2e-batch1-RUNME.sh
```

This will automatically apply all the fixes shown above.
