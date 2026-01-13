# Task: be-api-categories-tags

## Metadata
- **Phase**: 1 - Pre-Execution
- **Agent**: backend-nodejs-specialist
- **Estimated Time**: 30-40 min
- **Dependencies**: none
- **Status**: pending

## Description

Create public API routes for fetching categories and tags. These are needed for the multi-select dropdowns in the product form.

## Specifics

### Files to Create
- `app/api/categories/route.ts`
- `app/api/tags/route.ts`

### Files to Reference
- `payload/collections/Categories.ts` - Categories collection schema
- `payload/collections/Tags.ts` - Tags collection schema
- Existing public API routes for pattern reference

### Technical Details

**Categories API:**
- `GET /api/categories` - Return all published/active categories
- Response: `{ docs: Category[], totalDocs: number }`
- Fields needed: `id`, `name`, `slug`, `description` (optional)
- Should be cached (categories don't change often)

**Tags API:**
- `GET /api/tags` - Return all tags
- Response: `{ docs: Tag[], totalDocs: number }`
- Fields needed: `id`, `name`, `slug`
- Should be cached

**Considerations:**
- These are READ-ONLY public endpoints (no auth required)
- Add caching headers for performance
- Limit returned fields to what's needed
- Sort alphabetically by name

## Acceptance Criteria

- [ ] GET /api/categories returns all categories
- [ ] GET /api/tags returns all tags
- [ ] Response format: `{ docs: [...], totalDocs: number }`
- [ ] Each item has at minimum: id, name, slug
- [ ] Results sorted alphabetically by name
- [ ] Cache-Control headers set (e.g., max-age=300)
- [ ] Handles empty collections gracefully
- [ ] Returns proper error for server errors

## Testing Requirements

```typescript
describe('GET /api/categories', () => {
  it('returns all categories', async () => {
    const response = await fetch('/api/categories');
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.docs).toBeInstanceOf(Array);
    expect(data.totalDocs).toBeGreaterThanOrEqual(0);
  });

  it('returns categories sorted alphabetically', async () => {
    const response = await fetch('/api/categories');
    const data = await response.json();
    const names = data.docs.map(c => c.name);
    expect(names).toEqual([...names].sort());
  });

  it('includes required fields', async () => {
    const response = await fetch('/api/categories');
    const data = await response.json();
    if (data.docs.length > 0) {
      expect(data.docs[0]).toHaveProperty('id');
      expect(data.docs[0]).toHaveProperty('name');
      expect(data.docs[0]).toHaveProperty('slug');
    }
  });
});

describe('GET /api/tags', () => {
  // Similar tests
});
```

## Context Requirements

### Must Read Before Implementation
- `payload/collections/Categories.ts` - Schema
- `payload/collections/Tags.ts` - Schema
- Existing API routes for patterns

## Implementation Notes

```typescript
// app/api/categories/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import configPromise from '@payload-config';

export const dynamic = 'force-dynamic'; // Or use revalidate for caching

export async function GET(request: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise });

    const categories = await payload.find({
      collection: 'categories',
      limit: 100, // Reasonable limit
      sort: 'name',
      depth: 0, // Don't populate relationships
    });

    // Return simplified response
    const response = NextResponse.json({
      docs: categories.docs.map(cat => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        description: cat.description || undefined,
      })),
      totalDocs: categories.totalDocs,
    });

    // Add caching headers (5 minutes)
    response.headers.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=60');

    return response;
  } catch (error) {
    console.error('[Categories API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

// app/api/tags/route.ts - Similar implementation
```

## Related Files
- `payload/collections/Categories.ts`
- `payload/collections/Tags.ts`
- `hooks/useProductFormData.ts` - Will consume these APIs
