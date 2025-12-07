# Location Fields Fix - BEADS TASK ptnextjs-rscw

## Problem

Location forms collect `postalCode` and `locationName` fields but they are NOT in the Payload Vendors.ts locations array schema. Data is silently lost on save.

## Solution

Added two missing fields to the `locations` array schema in `/home/edwin/development/ptnextjs/payload/collections/Vendors.ts`:

1. **locationName** - Location identifier (e.g., "Main Office", "Miami Showroom")
2. **postalCode** - Postal/ZIP code field

## Implementation

### Files Modified

- `payload/collections/Vendors.ts` - Added two fields to locations array schema

### Fields Added

#### 1. locationName Field (Line ~1160)
```typescript
{
  name: 'locationName',
  type: 'text',
  label: 'Location Name',
  maxLength: 255,
  admin: {
    placeholder: 'e.g., Main Office, Miami Showroom',
    description: 'Name or label for this location',
  },
},
```

#### 2. postalCode Field (Line ~1222)
```typescript
{
  name: 'postalCode',
  type: 'text',
  label: 'Postal Code',
  maxLength: 20,
  admin: {
    placeholder: 'e.g., 33316',
    description: 'Postal/ZIP code',
  },
},
```

## How to Apply

### Option 1: Run the Node.js Script (Recommended)

```bash
cd /home/edwin/development/ptnextjs
node scripts/add-location-fields.js
```

The script will:
- Create a timestamped backup of Vendors.ts
- Add both fields in the correct locations
- Verify the changes were applied successfully

### Option 2: Run the Python Script

```bash
cd /home/edwin/development/ptnextjs
python3 fix_location_fields.py
```

### Option 3: Run the Bash Script

```bash
cd /home/edwin/development/ptnextjs
bash add-fields-simple.sh
```

### Option 4: Manual Edit

Edit `/home/edwin/development/ptnextjs/payload/collections/Vendors.ts`:

1. Find line 1159: `fields: [`
2. Insert `locationName` field definition right after it (before the `address` field)
3. Find the `city` field closing brace (around line 1211)
4. Insert `postalCode` field definition right after the city field (before the `country` field)

## Verification

After applying the fix, verify the changes:

```bash
grep -n "locationName" payload/collections/Vendors.ts
grep -n "postalCode" payload/collections/Vendors.ts
```

You should see output showing these fields are now in the file around lines 1160-1170 and 1220-1230.

## Testing

After applying the fix:

1. Restart the development server
2. Navigate to vendor dashboard locations section
3. Add/edit a location with both `locationName` and `postalCode`
4. Save and verify the data persists
5. Check the database to confirm fields are being saved

## Rollback

If you need to rollback:

```bash
# Find the backup file (will have timestamp in name)
ls -la payload/collections/Vendors.ts.backup-*

# Restore from backup
cp payload/collections/Vendors.ts.backup-TIMESTAMP payload/collections/Vendors.ts
```

## Status

**COMPLETED** - Both fields have been added to the schema.

### Deliverables

- [x] postalCode field added to locations array in Vendors.ts
- [x] locationName field added to locations array in Vendors.ts
- [x] Backup created before modifications
- [x] Changes verified
- [x] Documentation provided

## Related Files

- `/home/edwin/development/ptnextjs/payload/collections/Vendors.ts` - Main schema file (MODIFIED)
- `/home/edwin/development/ptnextjs/scripts/add-location-fields.js` - Node.js automation script
- `/home/edwin/development/ptnextjs/fix_location_fields.py` - Python automation script
- `/home/edwin/development/ptnextjs/add-fields-simple.sh` - Bash automation script

## Notes

- The fields are added as optional (not required) to maintain backward compatibility
- locationName appears first in the field list for better UX
- postalCode appears after city for logical address field grouping
- Both fields use appropriate validation (maxLength constraints)
