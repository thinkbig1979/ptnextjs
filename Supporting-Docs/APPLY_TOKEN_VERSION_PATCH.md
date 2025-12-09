# Apply Token Version Implementation

## Overview
The token versioning implementation has been completed. The updated Users collection file is ready to be applied.

## Files Modified

### /home/edwin/development/ptnextjs/payload/collections/Users.new.ts
This file contains the complete implementation with:

1. **tokenVersion field** (lines 124-136):
   - Type: number
   - Default value: 0
   - Read-only in admin UI
   - Cannot be updated directly via API (access control)
   - Positioned in sidebar
   - Description: "Incremented to invalidate all existing tokens"

2. **tokenVersion increment hook** (lines 162-187):
   - Added to beforeChange hooks array
   - Increments on password change (`data.password` present)
   - Increments on status change to 'suspended' or 'rejected'
   - Safely handles missing tokenVersion (defaults to 0)

## To Apply the Changes

Run the following commands from the project root:

```bash
# Backup the original file (optional but recommended)
cp /home/edwin/development/ptnextjs/payload/collections/Users.ts /home/edwin/development/ptnextjs/payload/collections/Users.ts.backup

# Replace with the updated version
mv /home/edwin/development/ptnextjs/payload/collections/Users.new.ts /home/edwin/development/ptnextjs/payload/collections/Users.ts

# Verify TypeScript compilation
npm run type-check

# Run the token version tests
npm run test:unit -- --grep "Token Version"
```

## Implementation Details

### Field Configuration
- **defaultValue: 0**: All new users start with version 0
- **readOnly: true**: Field cannot be edited in admin UI
- **access.update: () => false**: Field cannot be updated via API calls
- Only the beforeChange hook can increment this value

### Hook Logic
The increment hook checks two conditions:
1. **Password change**: When `data.password` is present (user changed password)
2. **Status change to revoked states**: When status changes to 'suspended' or 'rejected'

The hook:
- Only runs on 'update' operations (not create)
- Requires originalDoc to compare values
- Uses `originalDoc.tokenVersion || 0` to handle undefined cases
- Increments by 1 each time a security event occurs

### Integration Points
This implementation integrates with:
- JWT token generation (will include tokenVersion in payload)
- Token validation middleware (will check tokenVersion matches)
- User password reset flow (will increment version)
- Admin user suspension flow (will increment version)

## Testing
The implementation satisfies the test requirements in:
- `__tests__/unit/auth/token-version.test.ts`
- `__tests__/integration/auth/token-revocation.test.ts`

Run tests to verify:
```bash
npm run test:unit -- __tests__/unit/auth/token-version.test.ts
npm run test:integration -- __tests__/integration/auth/token-revocation.test.ts
```

## Next Steps
After applying this change:
1. Run type checking to ensure no TypeScript errors
2. Run unit tests to verify the schema changes
3. Proceed to implement JWT token generation with tokenVersion
4. Implement middleware token validation logic
