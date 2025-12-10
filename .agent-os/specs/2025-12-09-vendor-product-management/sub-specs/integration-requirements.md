# Integration Requirements

## System Integration

### Existing Systems

#### Payload CMS Products Collection
**File**: `payload/collections/Products.ts`
**Integration**: Direct use of existing collection

- Schema already defined with all required fields
- Access control already configured for vendor/admin
- Tier validation hook exists for creation
- Slug auto-generation works

**No modifications needed** to the Products collection.

#### Vendor Portal API
**Pattern**: `app/api/portal/vendors/[id]/route.ts`
**Integration**: Follow established patterns

Copy patterns for:
- Response interface structure
- authenticateUser helper
- Error handling with specific codes
- Request validation with Zod

#### Auth System
**Files**:
- `lib/middleware/auth-middleware.ts`
- `lib/services/auth-service.ts`
**Integration**: Use existing auth helpers

```typescript
import { getUserFromRequest } from '@/lib/middleware/auth-middleware';
import { authService } from '@/lib/services/auth-service';
```

#### Dashboard Layout
**File**: `app/(site)/vendor/dashboard/layout.tsx`
**Integration**: Products page uses existing layout

No changes needed - `/vendor/dashboard/products` already routes through dashboard layout.

#### shadcn/ui Components
**Directory**: `components/ui/`
**Integration**: Import existing components

All required components already installed:
- Card, CardHeader, CardTitle, CardContent, CardFooter
- Button
- Badge
- Switch
- Dialog, DialogContent, etc.
- Sheet, SheetContent, etc.
- Form, FormField, etc.
- Input, Textarea
- Skeleton
- Alert

---

## API Requirements

### Existing Endpoints Used

| Endpoint | Purpose | From |
|----------|---------|------|
| POST /api/test/products/seed | Seed test products | E2E tests |
| POST /api/test/vendors/seed | Seed test vendors | E2E tests |

### New Endpoints Created

| Endpoint | Purpose | Methods |
|----------|---------|---------|
| /api/portal/vendors/[id]/products | List/Create products | GET, POST |
| /api/portal/vendors/[id]/products/[productId] | Single product ops | GET, PUT, DELETE |
| /api/portal/vendors/[id]/products/[productId]/publish | Toggle publish | PATCH |

### API Contract

**Request Headers**:
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Response Format**:
```typescript
// Success
{
  success: true,
  data: { ... }
}

// Error
{
  success: false,
  error: {
    code: string,
    message: string,
    fields?: Record<string, string>
  }
}
```

**Error Codes**:
- `UNAUTHORIZED`: No valid token
- `FORBIDDEN`: Not owner/admin
- `NOT_FOUND`: Resource doesn't exist
- `VALIDATION_ERROR`: Invalid input
- `SERVER_ERROR`: Internal error
- `TIER_PERMISSION_DENIED`: Tier restriction

---

## Database Integration

### Collection: products

**Existing Fields Used**:
| Field | Type | Required | Usage |
|-------|------|----------|-------|
| vendor | relationship | Yes | Owner reference |
| name | text | Yes | Display name |
| slug | text | Yes | URL slug (auto-gen) |
| description | richText | Yes | Full description |
| shortDescription | textarea | No | Summary for lists |
| categories | relationship[] | No | Category tags |
| images | array | No | Product images |
| specifications | array | No | Key-value specs |
| published | checkbox | No | Visibility flag |

**Access Control**:
- Create: `admin` or `vendor` role
- Read: Public (all products)
- Update: `admin` or `vendor.user === currentUser`
- Delete: `admin` or `vendor.user === currentUser`

**No schema changes required**.

---

## External Services

### None Required

This feature does not integrate with external services. All functionality uses:
- Payload CMS (internal)
- SQLite database (internal)
- Next.js API routes (internal)

---

## Compatibility

### Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Device Support
- Desktop (1024px+)
- Tablet (768px-1023px)
- Mobile (320px-767px)

### Existing Feature Compatibility

| Feature | Compatibility |
|---------|--------------|
| Vendor Dashboard | ✅ Uses existing layout |
| Auth System | ✅ Uses existing tokens |
| Tier System | ✅ Uses existing tier checks |
| Admin Access | ✅ Admin bypass works |
| Test Seed APIs | ✅ Products seed exists |

---

## Migration Requirements

### None

- No database migrations needed (collection exists)
- No data migrations needed (new feature)
- No breaking changes to existing APIs

---

## Rollback Plan

If issues occur after deployment:

1. **Revert API routes**: Delete new route files
2. **Revert components**: Delete new component files
3. **Revert page**: Restore placeholder page
4. **No database changes**: Nothing to rollback

---

## Integration Testing Checklist

### Before Integration
- [ ] All new endpoints return correct responses
- [ ] All components render without errors
- [ ] Auth integration verified

### During Integration
- [ ] Dashboard navigation works
- [ ] Products page loads
- [ ] CRUD operations work end-to-end
- [ ] Error states handled

### After Integration
- [ ] E2E tests pass
- [ ] No console errors
- [ ] No network errors
- [ ] Performance acceptable
