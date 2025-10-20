# Task: Extend TinaCMS Vendor Collection Schema

**Task ID**: impl-backend-schema
**Phase**: Phase 2 - Backend Implementation (TinaCMS Schema)
**Agent**: backend-nodejs-specialist
**Estimated Time**: 2 hours
**Dependencies**: test-backend

## Objective

Extend the TinaCMS vendor collection schema to support coordinate and structured address data while maintaining backward compatibility.

## Context Requirements

**Files to Review**:
- `/home/edwin/development/ptnextjs/tina/config.ts` (lines 224-376: vendor collection schema)
- `/home/edwin/development/ptnextjs/.agent-os/specs/2025-10-19-vendor-location-mapping/integration-strategy.md`
- `/home/edwin/development/ptnextjs/.agent-os/specs/2025-10-19-vendor-location-mapping/tasks/backend-test-suite.md`

**Current Schema Location**:
- File: `/home/edwin/development/ptnextjs/tina/config.ts`
- Collection: `vendors` (starts at line 224)
- Current location field: lines 289-293

## Implementation Specifics

### 1. Add Coordinates Object Field

Insert AFTER the current `location` field (after line 293):

```typescript
{
  type: "object",
  name: "coordinates",
  label: "Geographic Coordinates",
  description: "Latitude and longitude for map display. Use geocode.maps.co or Google Maps to find coordinates.",
  fields: [
    {
      type: "number",
      name: "latitude",
      label: "Latitude",
      description: "Latitude (-90 to 90). Example: 43.7384 for Monaco",
      ui: {
        validate: (value) => {
          if (value === null || value === undefined) return true; // Optional
          if (value < -90 || value > 90) {
            return "Latitude must be between -90 and 90";
          }
          return true;
        }
      }
    },
    {
      type: "number",
      name: "longitude",
      label: "Longitude",
      description: "Longitude (-180 to 180). Example: 7.4246 for Monaco",
      ui: {
        validate: (value) => {
          if (value === null || value === undefined) return true; // Optional
          if (value < -180 || value > 180) {
            return "Longitude must be between -180 and 180";
          }
          return true;
        }
      }
    }
  ]
}
```

### 2. Add Structured Address Object Field

Insert AFTER the coordinates field:

```typescript
{
  type: "object",
  name: "address",
  label: "Structured Address",
  description: "Optional structured address data for detailed location information",
  fields: [
    {
      type: "string",
      name: "street",
      label: "Street Address",
      description: "Street address and number"
    },
    {
      type: "string",
      name: "city",
      label: "City",
      description: "City name"
    },
    {
      type: "string",
      name: "state",
      label: "State/Region",
      description: "State, province, or region"
    },
    {
      type: "string",
      name: "postalCode",
      label: "Postal Code",
      description: "ZIP/postal code"
    },
    {
      type: "string",
      name: "country",
      label: "Country",
      description: "Two-letter country code (e.g., US, MC, IT)",
      ui: {
        validate: (value) => {
          if (!value) return true; // Optional
          if (!/^[A-Z]{2}$/.test(value)) {
            return "Country must be a 2-letter ISO code (e.g., US, MC, IT)";
          }
          return true;
        }
      }
    }
  ]
}
```

### 3. Update Location Field Description

Modify the existing `location` field (lines 289-293) to clarify its relationship with new fields:

```typescript
{
  type: "string",
  name: "location",
  label: "Location (Display Name)",
  description: "Human-readable location (e.g., 'Monaco' or 'Fort Lauderdale, Florida'). This is displayed to users. Add coordinates below for map functionality.",
}
```

## File Modifications

**File**: `/home/edwin/development/ptnextjs/tina/config.ts`

**Action**: Edit the vendors collection schema

**Exact Location**: Insert new fields after line 293 (current location field)

**Order of Fields**:
1. `location` (existing - modify description only)
2. `coordinates` (NEW)
3. `address` (NEW)

## Validation Requirements

### Schema Validation

- [ ] Latitude range: -90 to 90
- [ ] Longitude range: -180 to 180
- [ ] Country code: 2-letter uppercase (optional)
- [ ] All new fields are optional (no required validation)

### Build Validation

After implementation, run:
```bash
npm run tina:build
```

Expected output:
- ✓ Schema compilation succeeds
- ✓ TypeScript types generated in `tina/__generated__/types.ts`
- ✓ No validation errors

## Testing Steps

### 1. Schema Build Test
```bash
cd /home/edwin/development/ptnextjs
npm run tina:build
```

### 2. Development Server Test
```bash
npm run dev:tinacms
# Navigate to http://localhost:3000/admin
# Edit a vendor
# Verify new coordinate and address fields appear
# Test validation (try invalid latitude like 100)
```

### 3. Type Check
```bash
npm run type-check
```

## Acceptance Criteria

- [ ] `coordinates` object field added to vendor schema
- [ ] `latitude` field with -90 to 90 validation
- [ ] `longitude` field with -180 to 180 validation
- [ ] `address` object field added with all subfields
- [ ] `country` field with 2-letter ISO code validation
- [ ] All new fields are optional (backward compatible)
- [ ] `location` field description updated
- [ ] `npm run tina:build` succeeds without errors
- [ ] Generated types include new fields in `tina/__generated__/types.ts`
- [ ] TinaCMS admin UI displays new fields correctly
- [ ] Field validation works in admin UI

## Generated Types Location

After running `npm run tina:build`, verify generated types:

**File**: `/home/edwin/development/ptnextjs/tina/__generated__/types.ts`

Expected new type definitions:
```typescript
export type VendorsCoordinates = {
  latitude?: number;
  longitude?: number;
}

export type VendorsAddress = {
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

export type Vendors = {
  // ... existing fields
  location?: string;
  coordinates?: VendorsCoordinates;
  address?: VendorsAddress;
  // ... other fields
}
```

## Notes

- Follow existing TinaCMS schema patterns in `tina/config.ts`
- Use inline validation functions (not separate validators)
- Provide helpful descriptions for content editors
- Include example values in field descriptions
- Maintain alphabetical field ordering where appropriate
- Consider content editor UX (clear labels, helpful descriptions)

## Rollback Plan

If issues occur:
1. Remove added fields from schema
2. Run `npm run tina:build` to regenerate types
3. Document issue for troubleshooting
