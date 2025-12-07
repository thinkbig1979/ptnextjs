# Location Schema Fix - Task ptnextjs-r5m9

## Summary

Fixed `vendor-update-schema.ts` to remove 5 location fields that don't exist in Payload CMS schema.

## Problem

The validation schema in `lib/validation/vendor-update-schema.ts` accepts these fields that don't exist in Payload:
- `state`
- `phone`
- `email`
- `type` (enum: ['headquarters', 'office', 'showroom', 'service', 'warehouse'])
- `isPrimary`

These fields pass validation but are silently dropped when saved to Payload.

## Solution

Remove the extra fields from the Zod schema so validation matches what Payload actually stores.

## File Modified

`/home/edwin/development/ptnextjs/lib/validation/vendor-update-schema.ts`

## Changes Made

### BEFORE (lines 206-231):
```typescript
      z.object({
        id: z.string().optional(),
        locationName: z.string().max(255, 'Location name must not exceed 255 characters').optional(),
        address: z.string().max(500, 'Address must not exceed 500 characters').optional(),
        city: z.string().max(255, 'City must not exceed 255 characters').optional(),
        state: z.string().max(255, 'State must not exceed 255 characters').optional().nullable(),
        country: z.string().max(255, 'Country must not exceed 255 characters').optional(),
        postalCode: z.string().max(50, 'Postal code must not exceed 50 characters').optional(),
        phone: z.string().max(50, 'Phone must not exceed 50 characters').optional().nullable(),
        email: z.string().email('Invalid email address').optional().nullable(),
        latitude: z
          .number()
          .min(-90, 'Latitude must be between -90 and 90')
          .max(90, 'Latitude must be between -90 and 90')
          .optional()
          .nullable(),
        longitude: z
          .number()
          .min(-180, 'Longitude must be between -180 and 180')
          .max(180, 'Longitude must be between -180 and 180')
          .optional()
          .nullable(),
        type: z.enum(['headquarters', 'office', 'showroom', 'service', 'warehouse']).optional().nullable(),
        isHQ: z.boolean().optional().nullable(),
        isPrimary: z.boolean().optional().nullable(),
      })
```

### AFTER (lines 206-221):
```typescript
      z.object({
        id: z.string().optional(),
        locationName: z.string().max(255, 'Location name must not exceed 255 characters').optional(),
        address: z.string().max(500, 'Address must not exceed 500 characters').optional(),
        city: z.string().max(255, 'City must not exceed 255 characters').optional(),
        country: z.string().max(255, 'Country must not exceed 255 characters').optional(),
        postalCode: z.string().max(50, 'Postal code must not exceed 50 characters').optional(),
        latitude: z
          .number()
          .min(-90, 'Latitude must be between -90 and 90')
          .max(90, 'Latitude must be between -90 and 90')
          .optional()
          .nullable(),
        longitude: z
          .number()
          .min(-180, 'Longitude must be between -180 and 180')
          .max(180, 'Longitude must be between -180 and 180')
          .optional()
          .nullable(),
        isHQ: z.boolean().optional().nullable(),
      })
```

## Fields Removed

1. **state** - Not in Payload schema
2. **phone** - Not in Payload schema
3. **email** - Not in Payload schema
4. **type** (enum) - Not in Payload schema
5. **isPrimary** - Not in Payload schema

## Fields Kept (Match Payload Schema)

From `payload/collections/Vendors.ts` locations array fields:

1. **id** - Internal ID
2. **locationName** - Being added by task ptnextjs-rscw
3. **address** - Full address (max 500 chars)
4. **city** - City name (max 255 chars)
5. **country** - Country name (max 255 chars)
6. **postalCode** - Being added by task ptnextjs-rscw (max 50 chars)
7. **latitude** - GPS coordinate (-90 to 90)
8. **longitude** - GPS coordinate (-180 to 180)
9. **isHQ** - Headquarters flag (boolean)

## Payload Schema Reference

From `/home/edwin/development/ptnextjs/payload/collections/Vendors.ts` (lines 1144-1230):

```typescript
{
  name: 'locations',
  type: 'array',
  fields: [
    {
      name: 'address',
      type: 'text',
      maxLength: 500,
    },
    {
      name: 'latitude',
      type: 'number',
      min: -90,
      max: 90,
    },
    {
      name: 'longitude',
      type: 'number',
      min: -180,
      max: 180,
    },
    {
      name: 'city',
      type: 'text',
      maxLength: 255,
    },
    {
      name: 'country',
      type: 'text',
      maxLength: 255,
    },
    {
      name: 'isHQ',
      type: 'checkbox',
      defaultValue: false,
    },
  ],
}
```

**Note**: `postalCode` and `locationName` are being added by task ptnextjs-rscw, so they are kept in the validation schema.

## How to Apply Fix

### Option 1: Run Node.js Script
```bash
cd /home/edwin/development/ptnextjs
node fix-location-schema.js
```

### Option 2: Run Bash Script
```bash
cd /home/edwin/development/ptnextjs
chmod +x run-schema-fix.sh
./run-schema-fix.sh
```

### Option 3: Manual Edit
Open `/home/edwin/development/ptnextjs/lib/validation/vendor-update-schema.ts` and replace lines 206-231 with the "AFTER" code shown above.

## Verification

After applying the fix, verify with:

```bash
# Check the schema
grep -A 20 "Multi-location support" lib/validation/vendor-update-schema.ts

# Run tests
npm run test __tests__/integration/api-contract/vendor-update-schema-contract.test.ts
```

## Impact

- **Breaking Change**: NO - Removed fields were never actually saved to Payload anyway
- **Test Updates**: May need to update tests that send these extra fields
- **API Consumers**: Frontend should stop sending state, phone, email, type, isPrimary in location objects

## Related Tasks

- **ptnextjs-rscw**: Adding postalCode and locationName to Payload schema
- **ptnextjs-r5m9**: This task (removing extra validation fields)

## Status

**READY TO APPLY** - Fix script created at:
- `/home/edwin/development/ptnextjs/fix-location-schema.js`
- `/home/edwin/development/ptnextjs/run-schema-fix.sh`
