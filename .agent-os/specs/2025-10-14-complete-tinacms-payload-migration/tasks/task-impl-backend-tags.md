# Task IMPL-BACKEND-TAGS: Create Tags Collection

## Task Metadata
- **Task ID**: impl-backend-tags
- **Phase**: Phase 2 - Backend Implementation
- **Agent Assignment**: backend-nodejs-specialist
- **Estimated Time**: 2 hours
- **Dependencies**: test-backend-collections
- **Status**: Ready for Implementation
- **Priority**: Medium

## Task Description

Implement the Tags collection in Payload CMS to support taxonomy and content organization across vendors, products, and blog posts. This is a new collection that will replace category-based tagging with a more flexible tag system.

## Specifics

### File to Create
`/home/edwin/development/ptnextjs/src/collections/Tags.ts`

### Collection Configuration

**Collection Properties:**
- `slug`: 'tags'
- `admin.useAsTitle`: 'name'
- `admin.defaultColumns`: ['name', 'slug', 'usageCount', 'updatedAt']
- `access`: Admin-only for create, update, delete; public read access
- `timestamps`: true (createdAt, updatedAt)

### Field Definitions (from Technical Spec lines 657-708)

```typescript
{
  name: 'name',
  type: 'text',
  required: true,
  unique: true,
  admin: {
    description: 'Tag name (e.g., "Propulsion", "Navigation", "Sustainability")'
  }
}

{
  name: 'slug',
  type: 'text',
  required: true,
  unique: true,
  index: true,
  admin: {
    description: 'URL-friendly slug (auto-generated from name)',
    readOnly: true
  },
  hooks: {
    beforeValidate: [
      ({ data, operation }) => {
        if (operation === 'create' || !data.slug) {
          data.slug = slugify(data.name, { lower: true, strict: true });
        }
        return data;
      }
    ]
  }
}

{
  name: 'description',
  type: 'textarea',
  admin: {
    description: 'Brief description of what this tag represents'
  }
}

{
  name: 'color',
  type: 'text',
  admin: {
    description: 'Hex color code for tag display (e.g., #3B82F6)'
  },
  validate: (value) => {
    if (value && !/^#[0-9A-F]{6}$/i.test(value)) {
      return 'Must be a valid hex color code (e.g., #3B82F6)';
    }
    return true;
  }
}

{
  name: 'usageCount',
  type: 'number',
  required: true,
  defaultValue: 0,
  admin: {
    description: 'Number of items using this tag (auto-updated)',
    readOnly: true
  }
}
```

### Access Control Configuration

```typescript
access: {
  read: () => true, // Public read access
  create: ({ req: { user } }) => !!user, // Admin-only create
  update: ({ req: { user } }) => !!user, // Admin-only update
  delete: ({ req: { user } }) => !!user, // Admin-only delete
}
```

### Hooks to Implement

1. **Slug Generation Hook** (beforeValidate)
   - Auto-generate slug from name on create
   - Use slugify library with options: `{ lower: true, strict: true }`
   - Ensure slug uniqueness

2. **Usage Count Hook** (afterChange) - Optional for future enhancement
   - Update usageCount when tags are added/removed from related collections
   - Note: Initial implementation can have usageCount = 0, updated later

### Implementation Requirements

1. **Import Dependencies**
   ```typescript
   import { CollectionConfig } from 'payload/types';
   import slugify from 'slugify';
   ```

2. **Export Configuration**
   ```typescript
   const Tags: CollectionConfig = {
     // ... configuration
   };

   export default Tags;
   ```

3. **Add to Payload Config**
   - Update `payload.config.ts` to include Tags collection
   - Add to collections array

4. **TypeScript Type Generation**
   - Run `payload generate:types` after implementation
   - Verify generated types in `src/payload-types.ts`

## Acceptance Criteria

- [ ] File `src/collections/Tags.ts` created with complete collection configuration
- [ ] All 5 fields implemented: name, slug, description, color, usageCount
- [ ] Slug auto-generation hook implemented and tested
- [ ] Access control configured: admin-only write, public read
- [ ] Color field validation implemented (hex code format)
- [ ] Tags collection added to `payload.config.ts`
- [ ] TypeScript types generated successfully
- [ ] Collection accessible in Payload admin UI at `/admin/collections/tags`

## Testing Requirements

### Unit Tests (from test-backend-collections)
- Run tests in `src/collections/__tests__/Tags.test.ts`
- Verify slug generation from various name inputs
- Test color validation with valid/invalid hex codes
- Test access control: unauthenticated users cannot create/update/delete
- Test uniqueness constraints on name and slug

### Manual Testing
1. Start Payload admin: `npm run dev`
2. Navigate to `/admin/collections/tags`
3. Create a new tag with name "Test Tag 1"
   - Verify slug auto-generates as "test-tag-1"
   - Verify usageCount defaults to 0
4. Test color validation with invalid hex code "#ZZZ"
   - Verify validation error displays
5. Test duplicate tag creation
   - Verify uniqueness constraint prevents duplicate names

### Integration Testing
- Verify Tags collection appears in Payload admin navigation
- Test tag creation via Payload API
- Verify TypeScript types are generated correctly

## Evidence Required

**Code Files:**
1. `src/collections/Tags.ts` - Complete collection configuration
2. Updated `payload.config.ts` - Tags collection added to collections array
3. `src/payload-types.ts` - Generated TypeScript types including Tag interface

**Test Results:**
- Unit test output showing all Tags tests passing
- Screenshot of Tags collection in Payload admin UI
- Sample tag created via admin UI with auto-generated slug

**Verification Checklist:**
- [ ] File exists: `src/collections/Tags.ts`
- [ ] Tags collection registered in `payload.config.ts`
- [ ] TypeScript types generated with Tag interface
- [ ] Admin UI accessible at `/admin/collections/tags`
- [ ] Slug auto-generation working
- [ ] Color validation working
- [ ] Access control working (admin-only write)

## Context Requirements

**Technical Spec Sections:**
- Lines 657-708: Tags Collection Schema (complete field definitions)

**Dependencies:**
- slugify library for slug generation
- Payload CMS types and utilities
- Test specifications from task-test-backend-collections

**Related Collections:**
- Tags will be referenced by Vendors, Products, Blog collections
- Usage count will be updated by hooks in those collections (future enhancement)

## Quality Gates

- [ ] All fields match technical spec exactly (5 fields)
- [ ] Slug generation hook implemented correctly
- [ ] Color validation regex matches hex code pattern
- [ ] Access control prevents unauthorized modifications
- [ ] TypeScript types generated without errors
- [ ] Collection appears in admin UI without errors
- [ ] All unit tests pass
- [ ] No TypeScript compilation errors
- [ ] No linting errors in collection file

## Notes

- Tags collection is foundational for content organization
- Keep implementation simple for initial version
- Usage count tracking can be enhanced in future iterations
- Consider adding tag icon/emoji support in future
- Ensure slugify options match existing slug generation patterns in other collections
