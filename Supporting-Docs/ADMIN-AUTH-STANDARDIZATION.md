# Admin API Authentication Standardization

## Task: ptnextjs-2m1s

**Status**: Implementation Ready
**Priority**: High
**Impact**: Consistency, Security, Maintainability

## Problem Statement

Admin routes use inconsistent authentication methods:
- **Vendor admin routes** (`approve`, `reject`, `tier`, `pending`, `approval`) use:
  - Cookie: `access_token`
  - Method: `authService.validateToken()`
  - Implementation: Local `extractAdminUser()` function in each file
- **Tier request routes** use:
  - Cookie: `payload-token`
  - Method: `payload.auth()`
  - Implementation: Local `authenticateAdmin()` function

## Solution

A shared utility already exists at `lib/utils/admin-auth.ts` that:
- Supports **both** `payload-token` AND `access_token` cookies
- Uses Payload CMS's native authentication (`payload.auth()`)
- Provides consistent error handling
- Returns structured responses

## Files to Update

1. `app/api/admin/vendors/[id]/approve/route.ts`
2. `app/api/admin/vendors/[id]/reject/route.ts`
3. `app/api/admin/vendors/[id]/tier/route.ts`
4. `app/api/admin/vendors/pending/route.ts`
5. `app/api/admin/vendors/approval/route.ts`

## Changes Required

### 1. Update Import Statement

**Before:**
```typescript
import { authService } from '@/lib/services/auth-service';
```

**After:**
```typescript
import { authenticateAdmin } from '@/lib/utils/admin-auth';
```

### 2. Remove Local extractAdminUser Function

**Remove this entire block:**
```typescript
/**
 * Extract and validate admin user
 */
function extractAdminUser(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value ||
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

### 3. Update Authentication Call

**Before:**
```typescript
export async function POST(request: NextRequest, ...) {
  try {
    extractAdminUser(request);
    // ... rest of handler
  }
}
```

**After:**
```typescript
export async function POST(request: NextRequest, ...) {
  try {
    // Authenticate admin user
    const auth = await authenticateAdmin(request);

    if ('error' in auth) {
      return NextResponse.json(
        { error: auth.message },
        { status: auth.status }
      );
    }

    // ... rest of handler
  }
}
```

### 4. Remove Redundant Error Handling

The old pattern had error handling like:
```typescript
if (message.includes('Admin access required')) {
  return NextResponse.json({ error: message }, { status: 403 });
}

if (message.includes('Authentication required')) {
  return NextResponse.json({ error: message }, { status: 401 });
}
```

These can be removed since `authenticateAdmin` already returns proper status codes.

## Benefits

1. **Consistency**: All admin routes use the same authentication method
2. **Security**: Leverages Payload CMS's built-in auth instead of custom JWT validation
3. **Backward Compatibility**: Supports both `payload-token` and `access_token` cookies
4. **Maintainability**: Single source of truth for admin authentication
5. **Type Safety**: Proper TypeScript types with `AuthResult` union type
6. **Error Handling**: Structured error responses with proper HTTP status codes

## Shared Utility Features

The `authenticateAdmin()` function in `lib/utils/admin-auth.ts`:
- ✅ Supports multiple token sources (backward compatible)
- ✅ Uses Payload CMS auth (`payload.auth()`)
- ✅ Validates admin role
- ✅ Returns structured error or user object
- ✅ Proper TypeScript types with type guards
- ✅ Comprehensive error handling

## Verification Steps

After updating, verify:
1. All imports changed from `authService` to `authenticateAdmin`
2. No local `extractAdminUser` functions remain
3. All auth calls use `const auth = await authenticateAdmin(request)`
4. Error handling checks for `'error' in auth`
5. Files still compile without TypeScript errors

## Testing

Test with both cookie types:
```bash
# Test with payload-token (Payload CMS default)
curl -H "Cookie: payload-token=<token>" http://localhost:3000/api/admin/vendors/pending

# Test with access_token (legacy support)
curl -H "Cookie: access_token=<token>" http://localhost:3000/api/admin/vendors/pending

# Test with Authorization header
curl -H "Authorization: Bearer <token>" http://localhost:3000/api/admin/vendors/pending
```

All three should work identically.

## Implementation Scripts

Two scripts have been created to automate this update:

### Python Script (Recommended)
```bash
python3 update-admin-auth.py
```

### Node.js Script
```bash
node update-admin-routes.js
```

### Bash Script
```bash
bash standardize-admin-auth.sh
```

All three scripts perform the same transformations described above.

## Related Files

- `lib/utils/admin-auth.ts` - Shared authentication utility
- `lib/services/auth-service.ts` - Legacy JWT service (being phased out for admin routes)
- `app/api/admin/tier-upgrade-requests/**/*.ts` - Already using the standardized pattern

## Migration Status

- [ ] `app/api/admin/vendors/[id]/approve/route.ts`
- [ ] `app/api/admin/vendors/[id]/reject/route.ts`
- [ ] `app/api/admin/vendors/[id]/tier/route.ts`
- [ ] `app/api/admin/vendors/pending/route.ts`
- [ ] `app/api/admin/vendors/approval/route.ts`
- [x] `app/api/admin/tier-upgrade-requests/route.ts` (already standardized)
- [x] `app/api/admin/tier-upgrade-requests/[id]/approve/route.ts` (already standardized)
- [x] `app/api/admin/tier-upgrade-requests/[id]/reject/route.ts` (already standardized)
