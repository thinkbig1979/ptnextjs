# Task: payload-vendor-collection-update - Update Payload Vendors Collection

## Task Metadata
- **Task ID**: payload-vendor-collection-update
- **Phase**: Phase 3A: Database Schema & Migrations
- **Agent**: backend-payload-specialist
- **Estimated Time**: 30-40 minutes
- **Dependencies**: [task-db-vendor-geographic-fields]
- **Status**: [ ] Not Started

## Task Description
Update the Payload CMS vendors collection to include geographic service region fields in the admin UI. Add fields for countries, states, cities, coordinates, and coverage notes with proper validation and UI widgets.

## Specifics
- **File to Modify**:
  - `/home/edwin/development/ptnextjs/payload/collections/Vendors.ts`
- **Fields to Add**:
  ```typescript
  {
    name: 'serviceCountries',
    type: 'array',
    label: 'Service Countries',
    admin: {
      description: 'Countries where this vendor provides services'
    },
    fields: [
      {
        name: 'country',
        type: 'text',
        required: true,
        admin: {
          placeholder: 'e.g., United States, Canada, United Kingdom'
        }
      }
    ]
  },
  {
    name: 'serviceStates',
    type: 'array',
    label: 'Service States/Provinces',
    admin: {
      description: 'Specific states or provinces served'
    },
    fields: [
      {
        name: 'country',
        type: 'text',
        required: true
      },
      {
        name: 'state',
        type: 'text',
        required: true,
        admin: {
          placeholder: 'e.g., California, Florida, British Columbia'
        }
      }
    ]
  },
  {
    name: 'serviceCities',
    type: 'array',
    label: 'Service Cities',
    admin: {
      description: 'Specific cities served (optional, for detailed coverage)'
    },
    fields: [
      {
        name: 'country',
        type: 'text',
        required: true
      },
      {
        name: 'state',
        type: 'text',
        required: true
      },
      {
        name: 'city',
        type: 'text',
        required: true,
        admin: {
          placeholder: 'e.g., San Diego, Miami, Vancouver'
        }
      }
    ]
  },
  {
    name: 'serviceCoordinates',
    type: 'array',
    label: 'Service Locations (Coordinates)',
    admin: {
      description: 'Specific office/service center locations for map display'
    },
    fields: [
      {
        name: 'lat',
        type: 'number',
        required: true,
        min: -90,
        max: 90,
        admin: {
          placeholder: 'Latitude (e.g., 32.7157)'
        }
      },
      {
        name: 'lon',
        type: 'number',
        required: true,
        min: -180,
        max: 180,
        admin: {
          placeholder: 'Longitude (e.g., -117.1611)'
        }
      },
      {
        name: 'label',
        type: 'text',
        required: true,
        admin: {
          placeholder: 'e.g., "San Diego HQ", "Miami Service Center"'
        }
      }
    ]
  },
  {
    name: 'coverageNotes',
    type: 'textarea',
    label: 'Coverage Notes',
    admin: {
      description: 'Additional details about service coverage (optional)',
      placeholder: 'e.g., "We provide on-site service for all Southern California ports and remote support globally."'
    }
  }
  ```
- **Hooks to Add** (for JSON serialization):
  ```typescript
  hooks: {
    beforeChange: [
      ({ data }) => {
        // Payload stores arrays as JavaScript arrays
        // They will be serialized to JSON TEXT when saving to SQLite
        // No manual serialization needed - Payload handles this
        return data
      }
    ],
    afterRead: [
      ({ doc }) => {
        // Payload deserializes JSON TEXT back to JavaScript arrays
        // No manual deserialization needed
        return doc
      }
    ]
  }
  ```

## Acceptance Criteria
- [ ] All 5 new fields added to Vendors collection schema
- [ ] serviceCountries field allows adding multiple countries
- [ ] serviceStates field captures country + state pairs
- [ ] serviceCities field captures country + state + city tuples
- [ ] serviceCoordinates field validates lat/lon ranges (-90 to 90, -180 to 180)
- [ ] coverageNotes field supports multi-line text input
- [ ] Payload admin UI displays fields correctly in vendor edit form
- [ ] Array fields allow adding/removing entries dynamically
- [ ] Validation prevents invalid coordinate values
- [ ] Existing vendor records display without errors (default empty arrays)

## Testing Requirements
- **Manual Testing**:
  - Open Payload admin at `/admin/collections/vendors`
  - Create new vendor and populate geographic fields
  - Add multiple countries, states, cities
  - Add coordinates with valid lat/lon
  - Test validation: Enter lat=100 (should reject, max 90)
  - Test validation: Enter lon=200 (should reject, max 180)
  - Save vendor and verify data persists
  - Edit existing vendor and verify geographic fields load correctly
  - Check SQLite database to verify JSON serialization
    ```bash
    sqlite3 payload.db "SELECT id, service_countries, service_states FROM vendors WHERE id = 'test-vendor-id';"
    ```
- **Functional Testing**:
  - Verify empty arrays display as empty (not null/undefined)
  - Test adding 10+ countries to ensure no UI limits
  - Test coordinate precision (6 decimal places supported)
  - Test special characters in city names (ñ, é, ü, etc.)

## Evidence Required
- Screenshot of Payload admin showing new geographic fields
- Screenshot of vendor edit form with populated geographic data
- SQLite query result showing JSON serialization
- Test vendor with multiple locations saved successfully

## Context Requirements
- Existing Vendors collection structure
- Payload CMS array field documentation
- tasks-sqlite.md section 1.1 for JSON format requirements
- Geographic helpers from task-db-vendor-geographic-fields

## Implementation Notes
- **Payload Array Fields**:
  - Payload stores arrays as JavaScript arrays in memory
  - On save to SQLite, Payload automatically serializes to JSON TEXT
  - On read from SQLite, Payload automatically deserializes JSON back to arrays
  - No manual JSON.stringify/parse needed in hooks
- **Coordinate Validation**:
  - Use Payload's built-in `min`/`max` validators for lat/lon
  - Latitude: -90 (South Pole) to 90 (North Pole)
  - Longitude: -180 (W) to 180 (E)
  - Consider adding validation message:
    ```typescript
    validate: (val) => {
      if (val < -90 || val > 90) {
        return 'Latitude must be between -90 and 90'
      }
      return true
    }
    ```
- **UI Organization**:
  - Consider grouping geographic fields in a collapsible fieldset:
    ```typescript
    {
      type: 'collapsible',
      label: 'Geographic Service Coverage',
      fields: [
        // serviceCountries, serviceStates, etc.
      ]
    }
    ```
- **Default Values**:
  - Existing vendors will have `null` for new fields
  - Payload will default to empty arrays `[]` on first edit
  - No data migration needed (handled gracefully)

## Quality Gates
- [ ] No TypeScript errors in Vendors collection file
- [ ] Payload admin loads without errors
- [ ] Geographic fields render correctly in admin UI
- [ ] Validation prevents invalid coordinate values
- [ ] JSON serialization to SQLite works correctly

## Related Files
- Main Tasks: `tasks-sqlite.md` section 1.1
- Payload Collection: `/home/edwin/development/ptnextjs/payload/collections/Vendors.ts`
- Database Migration: task-db-vendor-geographic-fields (already completed)
- Technical Spec: `sub-specs/technical-spec.md` (Geographic Vendor Profiles)

## Next Steps After Completion
- Test geographic data in VendorGeographyService (task-api-vendor-geography-service)
- Build vendor location filter UI (task-ui-vendor-location-filter)
- Build service area map component (task-ui-vendor-service-map)
