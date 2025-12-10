# ⚠️ CRITICAL: Apply Fix Before Proceeding

## One TypeScript Error Must Be Fixed

**File**: `app/api/portal/vendors/[id]/products/[productId]/publish/route.ts`
**Line**: 143
**Error**: `user.userId` should be `user.id.toString()`

## Quick Fix (Choose One Method)

### Method 1: Automated Script
```bash
node fix-publish-route.js
```

### Method 2: Manual Edit
Open `app/api/portal/vendors/[id]/products/[productId]/publish/route.ts`

Line 143 - Change this:
```typescript
      user.userId,
```

To this:
```typescript
      user.id.toString(),
```

### Method 3: Command Line
```bash
sed -i 's/user\.userId,/user.id.toString(),/g' app/api/portal/vendors/\[id\]/products/\[productId\]/publish/route.ts
```

## Verify Fix
```bash
npm run type-check
```

Should show NO errors (or none related to user.userId).

## Then Delete This File
Once fixed, you can delete this file.

---

See `Supporting-Docs/BE-6-VERIFICATION-COMPLETE.md` for full details.
