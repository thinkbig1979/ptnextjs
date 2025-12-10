# Architecture Decisions

## Decision Records

### ADR-001: Use Existing Payload CMS Products Collection

**Context**: Need to store and manage vendor products.

**Decision**: Use the existing `products` collection in Payload CMS rather than creating a new one.

**Rationale**:
- Collection already has comprehensive schema (1400+ lines)
- Access control already configured
- Tier validation hook already exists
- Test seed API already works with it

**Consequences**:
- ✅ No schema changes needed
- ✅ Existing test infrastructure works
- ⚠️ Must work within existing field structure

---

### ADR-002: Sheet Component for Product Form

**Context**: Need UI for create/edit product form.

**Alternatives**:
1. Full page (/vendor/dashboard/products/new)
2. Modal dialog
3. Slide-out sheet

**Decision**: Use Sheet (slide-out panel) from shadcn/ui.

**Rationale**:
- Keeps user on products page (context preserved)
- More space than modal for rich form
- Follows pattern used elsewhere in app
- Can scroll within sheet for long forms

**Consequences**:
- ✅ Familiar UX pattern
- ✅ Context preserved
- ⚠️ May need to handle form state on close

---

### ADR-003: SWR for Data Fetching

**Context**: Need to fetch and cache product list data.

**Alternatives**:
1. Plain fetch with React state
2. React Query
3. SWR
4. Server Components

**Decision**: Use SWR for data fetching.

**Rationale**:
- Already used elsewhere in the codebase
- Stale-while-revalidate strategy good for lists
- Built-in revalidation and caching
- Simple API

**Consequences**:
- ✅ Consistent with existing code
- ✅ Good developer experience
- ⚠️ Client-side fetching (not SSR)

---

### ADR-004: Textarea for Description (v1)

**Context**: Products have a Lexical richText description field.

**Alternatives**:
1. Full Lexical editor component
2. Markdown editor
3. Plain textarea with conversion

**Decision**: Use plain Textarea and convert to Lexical JSON on save.

**Rationale**:
- Faster to implement for v1
- Rich text editor adds complexity
- Can upgrade to Lexical editor later
- Description doesn't need complex formatting for MVP

**Consequences**:
- ✅ Simpler implementation
- ⚠️ Limited formatting options
- 📋 Follow-up: Add rich text editor in v2

---

### ADR-005: API Route Structure

**Context**: Need to organize product CRUD endpoints.

**Alternatives**:
1. Single route with method switching
2. Separate routes per operation
3. Nested routes matching REST conventions

**Decision**: Nested routes following REST conventions.

**Structure**:
```
/api/portal/vendors/[id]/products/          - GET (list), POST (create)
/api/portal/vendors/[id]/products/[productId]/  - GET, PUT, DELETE
/api/portal/vendors/[id]/products/[productId]/publish/  - PATCH
```

**Rationale**:
- Matches existing vendor API structure
- Clear resource hierarchy
- Follows REST conventions
- Separates concerns (publish is distinct action)

**Consequences**:
- ✅ Consistent with existing patterns
- ✅ Clear API contract
- ⚠️ More files to maintain

---

### ADR-006: Service Layer for Business Logic

**Context**: Need to implement business logic for product operations.

**Alternatives**:
1. Logic directly in route handlers
2. Utility functions
3. Service class

**Decision**: Create ProductService class following VendorProfileService pattern.

**Rationale**:
- Consistent with existing architecture
- Separates business logic from HTTP handling
- Easier to test
- Reusable across routes

**Consequences**:
- ✅ Clean architecture
- ✅ Testable business logic
- ⚠️ Additional abstraction layer

---

### ADR-007: Optimistic Updates vs Revalidation

**Context**: How to update UI after mutations.

**Alternatives**:
1. Optimistic updates (update UI immediately, rollback on error)
2. Revalidation (fetch fresh data after mutation)
3. Hybrid (optimistic for some, revalidate for others)

**Decision**: Use revalidation via SWR mutate() after mutations.

**Rationale**:
- Simpler to implement correctly
- Ensures data consistency
- Network requests are fast enough
- Avoids complex rollback logic

**Consequences**:
- ✅ Always shows accurate data
- ✅ Simpler error handling
- ⚠️ Slight delay after mutations

---

### ADR-008: Form Validation with Zod

**Context**: Need to validate product form inputs.

**Alternatives**:
1. Manual validation
2. Yup
3. Zod

**Decision**: Use Zod for validation (client and server).

**Rationale**:
- Already used in codebase (vendor-update-schema.ts)
- Type inference from schemas
- Works with react-hook-form
- Can share schemas between client/server

**Consequences**:
- ✅ Type-safe validation
- ✅ Consistent patterns
- ✅ Shared schemas reduce duplication

---

## Technical Constraints

### Must Follow
1. Existing API response format
2. Existing auth patterns
3. Existing error codes
4. TypeScript strict mode
5. ESLint rules

### Cannot Change
1. Products collection schema
2. Existing test seed APIs
3. Dashboard layout structure
4. Auth token format

---

## Design Principles

### Consistency
Follow existing patterns from:
- `app/api/portal/vendors/[id]/route.ts` (API structure)
- `VendorProfileService.ts` (service pattern)
- `vendor-update-schema.ts` (validation)
- Dashboard components (UI patterns)

### Simplicity
- No over-engineering for v1
- Plain textarea instead of rich editor
- Revalidation instead of optimistic updates
- SWR instead of complex state management

### Testability
- Service layer for business logic
- Clear API contracts
- Components designed for E2E selectors

### Maintainability
- Follow REST conventions
- Document decisions (this file)
- Use TypeScript for type safety
- Follow existing code style

---

## Technology Choices

| Concern | Choice | Rationale |
|---------|--------|-----------|
| Data fetching | SWR | Already in use |
| Forms | react-hook-form + Zod | Already in use |
| UI Components | shadcn/ui | Already in use |
| API Routes | Next.js App Router | Project standard |
| Database | Payload CMS | Project standard |
| Styling | Tailwind CSS | Project standard |

---

## Future Considerations

### v2 Enhancements
1. **Rich text editor** - Replace textarea with Lexical editor
2. **Image upload** - Add file upload instead of URL-only
3. **Bulk operations** - Multi-select for delete/publish
4. **Search/filter** - Filter products by name, status, category
5. **Drag-drop reorder** - Custom product ordering

### Scalability
- Pagination for large product lists (not needed v1)
- Caching at API level (Payload handles this)
- CDN for product images (out of scope)
