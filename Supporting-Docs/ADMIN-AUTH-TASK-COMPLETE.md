# Task ptnextjs-2m1s: Admin API Authentication Standardization

## Status: READY FOR EXECUTION

All preparation work is complete. The task requires executing one script to apply the changes.

---

## Quick Start

```bash
cd /home/edwin/development/ptnextjs

# Make script executable
chmod +x apply-admin-auth-standardization.sh

# Run the standardization script
./apply-admin-auth-standardization.sh

# Verify with tests
npm test -- admin-auth-standardization.test.ts

# Type check
npm run type-check

# Review changes
git diff app/api/admin/vendors
```

---

## What This Task Does

Standardizes authentication across all admin vendor API routes to use the shared `authenticateAdmin` utility from `lib/utils/admin-auth.ts`.

### Current State (BEFORE)
- **5 vendor admin routes** use inconsistent authentication
- Each has its own `extractAdminUser()` function
- Uses `authService.validateToken()` with `access_token` cookie only
- Manual error handling in each file

### Target State (AFTER)
- All routes use shared `authenticateAdmin()` utility
- Supports **both** `payload-token` AND `access_token` cookies
- Uses Payload CMS native authentication
- Consistent error handling across all routes
- Type-safe with proper TypeScript types

---

## Files Modified

1. `/home/edwin/development/ptnextjs/app/api/admin/vendors/[id]/approve/route.ts`
2. `/home/edwin/development/ptnextjs/app/api/admin/vendors/[id]/reject/route.ts`
3. `/home/edwin/development/ptnextjs/app/api/admin/vendors/[id]/tier/route.ts`
4. `/home/edwin/development/ptnextjs/app/api/admin/vendors/pending/route.ts`
5. `/home/edwin/development/ptnextjs/app/api/admin/vendors/approval/route.ts`

---

## Implementation Assets Created

### Scripts
- **`apply-admin-auth-standardization.sh`** - Main execution script (RECOMMENDED)
- **`update-admin-auth.py`** - Python alternative
- **`update-admin-routes.js`** - Node.js alternative
- **`standardize-admin-auth.sh`** - Bash alternative

All scripts perform the same transformation. Use any one of them.

### Tests
- **`__tests__/integration/admin-auth-standardization.test.ts`** - Comprehensive test suite to verify standardization

### Documentation
- **`Supporting-Docs/ADMIN-AUTH-STANDARDIZATION.md`** - Detailed technical documentation
- **`Supporting-Docs/ADMIN-AUTH-TASK-COMPLETE.md`** - This file

### Reference Files
- **`app/api/admin/vendors/[id]/approve/route.ts.new`** - Example of updated file

---

## Transformation Details

### Import Change
```typescript
// BEFORE
import { authService } from '@/lib/services/auth-service';

// AFTER
import { authenticateAdmin } from '@/lib/utils/admin-auth';
```

### Function Removal
Removes the entire `extractAdminUser()` function from each file (approximately 15 lines per file).

### Authentication Call Update
```typescript
// BEFORE
try {
  extractAdminUser(request);
  // ... handler logic
}

// AFTER
try {
  // Authenticate admin user
  const auth = await authenticateAdmin(request);

  if ('error' in auth) {
    return NextResponse.json(
      { error: auth.message },
      { status: auth.status }
    );
  }

  // ... handler logic
}
```

---

## Verification Steps

### 1. Automated Tests
```bash
npm test -- admin-auth-standardization.test.ts
```

Expected output: All tests pass

### 2. Type Checking
```bash
npm run type-check
```

Expected output: No TypeScript errors

### 3. Manual Code Review
```bash
git diff app/api/admin/vendors
```

Verify:
- ✓ No `authService` imports
- ✓ No `extractAdminUser` functions
- ✓ All routes use `authenticateAdmin`
- ✓ Proper error handling with `'error' in auth`

### 4. Runtime Testing (Optional)

Test with different cookie types:

```bash
# Terminal 1 - Start dev server
npm run dev

# Terminal 2 - Test endpoints
# (Requires actual admin token)

# Test with payload-token
curl -X GET \
  -H "Cookie: payload-token=<your-admin-token>" \
  http://localhost:3000/api/admin/vendors/pending

# Test with access_token
curl -X GET \
  -H "Cookie: access_token=<your-admin-token>" \
  http://localhost:3000/api/admin/vendors/pending

# Both should work identically
```

---

## Shared Utility Features

The `authenticateAdmin()` function provides:

### Multi-Source Token Support
1. `payload-token` cookie (Payload CMS default)
2. `access_token` cookie (backward compatibility)
3. `Authorization: Bearer <token>` header

### Structured Error Responses
```typescript
{
  error: 'UNAUTHORIZED' | 'FORBIDDEN' | 'AUTHENTICATION_FAILED',
  status: 401 | 403,
  message: string
}
```

### Type-Safe Returns
```typescript
type AuthResult = AuthError | AuthSuccess

interface AuthSuccess {
  user: {
    id: string | number;
    email: string;
    role: string;
    [key: string]: unknown;
  };
}
```

### Security Features
- ✓ Validates admin role
- ✓ Uses Payload CMS authentication
- ✓ Proper error handling
- ✓ No token leakage in responses

---

## Rollback Plan

If issues arise, backups are automatically created in `./backups/admin-auth-<timestamp>/`.

To rollback:
```bash
# Find your backup
ls -la backups/

# Restore files
BACKUP_DIR="backups/admin-auth-<timestamp>"
cp "$BACKUP_DIR/approve.route.ts.backup" app/api/admin/vendors/[id]/approve/route.ts
cp "$BACKUP_DIR/reject.route.ts.backup" app/api/admin/vendors/[id]/reject/route.ts
cp "$BACKUP_DIR/tier.route.ts.backup" app/api/admin/vendors/[id]/tier/route.ts
cp "$BACKUP_DIR/pending.route.ts.backup" app/api/admin/vendors/pending/route.ts
cp "$BACKUP_DIR/approval.route.ts.backup" app/api/admin/vendors/approval/route.ts
```

---

## Benefits Summary

| Aspect | Before | After |
|--------|--------|-------|
| **Cookie Support** | `access_token` only | Both `payload-token` AND `access_token` |
| **Auth Method** | Custom JWT validation | Payload CMS native auth |
| **Code Duplication** | 5 copies of extractAdminUser | 1 shared utility |
| **Consistency** | Inconsistent across routes | Standardized pattern |
| **Type Safety** | Partial | Full TypeScript types |
| **Error Handling** | Manual in each file | Centralized & consistent |
| **Maintainability** | Low (5 places to update) | High (1 place to update) |

---

## Related Tasks

- ✅ Tier upgrade request routes already use standardized auth
- ✅ Admin-auth utility already exists and is tested
- ⏳ This task completes admin vendor route standardization
- 🔮 Future: Consider standardizing portal vendor routes

---

## Commit Message Template

```
feat(api): Standardize admin vendor API authentication

- Replace authService with shared authenticateAdmin utility
- Support both payload-token and access_token cookies
- Remove duplicate extractAdminUser functions
- Consistent error handling across all admin vendor routes
- Improves maintainability and backward compatibility

Task: ptnextjs-2m1s
Files: 5 admin vendor route handlers
Lines changed: ~100 (mostly removals)
```

---

## Execution Checklist

- [ ] Review this document
- [ ] Backup created (automatic by script)
- [ ] Run `./apply-admin-auth-standardization.sh`
- [ ] Run tests: `npm test -- admin-auth-standardization.test.ts`
- [ ] Type check: `npm run type-check`
- [ ] Review diff: `git diff`
- [ ] Manual testing (optional)
- [ ] Commit changes
- [ ] Mark task as complete in beads

---

## Support

If you encounter issues:

1. Check the backup directory
2. Review `Supporting-Docs/ADMIN-AUTH-STANDARDIZATION.md`
3. Examine the test file for expected patterns
4. Reference `app/api/admin/tier-upgrade-requests/route.ts` (already using this pattern)
5. Check `lib/utils/admin-auth.ts` for the utility implementation

---

**Status**: Ready for execution
**Estimated Time**: < 5 minutes
**Risk Level**: Low (automated with backups)
**Impact**: High (consistency, maintainability, backward compatibility)
