# Authentication Issues - Root Cause Analysis & Fixes

## Issue #1: Double Password Hashing in Seed API

### Root Cause
In `/home/edwin/development/ptnextjs/app/api/test/vendors/seed/route.ts`, line ~95:

```typescript
const hashedPassword = await authService.hashPassword(vendorData.password);
// ...
const createdUser = await payload.create({
  collection: 'users',
  data: {
    email: vendorData.email,
    password: hashedPassword,  // <-- PROBLEM: Pre-hashed password
    role: 'vendor',
    status: vendorData.status || 'approved',
  },
});
```

### Problem
- `authService.hashPassword()` hashes the password with bcrypt
- Then we pass the HASHED password to Payload CMS
- Payload CMS sees a hashed value and hashes it AGAIN (double-hashing)
- When user tries to login with plain password, it doesn't match the double-hashed version

### Solution
Pass the PLAIN password to Payload CMS and let it handle hashing:

```typescript
// Only validate password strength, don't hash it
try {
  await authService.hashPassword(vendorData.password); // Validates only
} catch (validationError) {
  errors[`vendor_${i}_${vendorData.companyName}`] = validationError instanceof Error ? validationError.message : 'Invalid password';
  continue;
}

// Pass plain password - Payload CMS will hash it automatically
const createdUser = await payload.create({
  collection: 'users',
  data: {
    email: vendorData.email,
    password: vendorData.password,  // <-- Plain password
    role: 'vendor',
    status: vendorData.status || 'approved',
  },
});
```

## Issue #2: Registration Redirect Timeout (SECONDARY)

### Root Cause
The `/home/edwin/development/ptnextjs/app/api/portal/vendors/register/route.ts` endpoint returns immediately with 201, so this might be a frontend issue or test issue.

### Current Implementation
The endpoint correctly:
1. Validates input
2. Checks for duplicate email/company
3. Creates user (status: 'pending')
4. Creates vendor linked to user
5. Returns 201 immediately

No slow operations blocking the response.

## Files to Fix
1. `/home/edwin/development/ptnextjs/app/api/test/vendors/seed/route.ts` - Remove double hashing
2. `/home/edwin/development/ptnextjs/app/api/auth/login/route.ts` - Add logging for debugging (optional)

## Manual Testing Command
```bash
# Create vendor via seed
curl -X POST http://localhost:3000/api/test/vendors/seed \
  -H "Content-Type: application/json" \
  -d '[{
    "companyName":"Auth Test",
    "email":"authtest@test.example.com",
    "password":"AuthTest123!@#",
    "tier":"free",
    "status":"approved"
  }]'

# Login with same credentials
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email":"authtest@test.example.com",
    "password":"AuthTest123!@#"
  }'

# Expected: HTTP 200 with user data
```
