# AuditLogs Collection Integration

## Status
- [x] Created `/home/edwin/development/ptnextjs/payload/collections/AuditLogs.ts`
- [ ] Add import to `/home/edwin/development/ptnextjs/payload.config.ts`
- [ ] Register in collections array

## Required Changes to payload.config.ts

### 1. Add Import (after line 38)
```typescript
import AuditLogs from './payload/collections/AuditLogs';
```

**Current state (lines 37-40):**
```typescript
import TierUpgradeRequests from './payload/collections/TierUpgradeRequests';
import ImportHistory from './payload/collections/ImportHistory';

const filename = fileURLToPath(import.meta.url);
```

**Should become:**
```typescript
import TierUpgradeRequests from './payload/collections/TierUpgradeRequests';
import ImportHistory from './payload/collections/ImportHistory';
import AuditLogs from './payload/collections/AuditLogs';

const filename = fileURLToPath(import.meta.url);
```

### 2. Add to Collections Array (after line 91)
```typescript
    AuditLogs,
```

**Current state (lines 90-92):**
```typescript
    TierUpgradeRequests,
    ImportHistory,
  ],
```

**Should become:**
```typescript
    TierUpgradeRequests,
    ImportHistory,
    AuditLogs,
  ],
```

## Manual Application

If automated tools fail, apply these changes manually:

```bash
# Navigate to project root
cd /home/edwin/development/ptnextjs

# Method 1: Using sed
sed -i "/import ImportHistory from/a import AuditLogs from './payload/collections/AuditLogs';" payload.config.ts
sed -i "/ImportHistory,$/a \    AuditLogs," payload.config.ts

# Method 2: Using the Node.js script
node scripts/add-audit-logs.js

# Method 3: Using the bash script
bash scripts/register-audit-logs.sh

# Method 4: Manual edit
# Open payload.config.ts in your editor and apply the changes shown above
```

## Verification

After applying changes, verify:

```bash
# Check TypeScript compilation
npm run type-check

# Check that the collection appears in config
grep -A 15 "collections: \[" payload.config.ts | grep AuditLogs

# Start dev server and check admin panel
npm run dev
# Visit http://localhost:3000/admin
# Look for "Audit Logs" under "System" group
```

## Files Created

1. `/home/edwin/development/ptnextjs/payload/collections/AuditLogs.ts` - Collection schema
2. `/home/edwin/development/ptnextjs/scripts/add-audit-logs.js` - Node.js registration script
3. `/home/edwin/development/ptnextjs/scripts/register-audit-logs.sh` - Bash registration script
