# Task: Error Handling and Edge Cases

## Metadata
- **ID**: task-int-3
- **Phase**: 4 - Integration
- **Agent**: integration-coordinator
- **Time**: 25-30 min
- **Dependencies**: task-int-1
- **Status**: pending

## Description

Verify and improve error handling throughout the product management feature. Ensure all edge cases are handled gracefully without breaking the UI.

## Specifics

### Error Scenarios to Test

#### 1. Network Errors
| Scenario | Expected Behavior |
|----------|-------------------|
| API timeout | Toast error, form stays open |
| Network offline | Toast error with retry suggestion |
| 500 server error | Toast error, graceful degradation |

**Implementation Check**:
```typescript
// In ProductForm submit handler
try {
  const response = await fetch(...);
  if (!response.ok) {
    const result = await response.json();
    throw new Error(result.error?.message || 'Request failed');
  }
} catch (error) {
  if (error instanceof TypeError && error.message === 'Failed to fetch') {
    toast.error('Network error. Please check your connection.');
  } else {
    toast.error(error.message || 'An unexpected error occurred');
  }
}
```

#### 2. Validation Errors
| Scenario | Expected Behavior |
|----------|-------------------|
| Empty name | Inline error "Name is required" |
| Empty description | Inline error "Description is required" |
| Name too long (>255) | Inline error with length message |
| Short description too long (>500) | Inline error with length message |

**Implementation Check**:
```typescript
// Server returns field errors
if (result.error?.fields) {
  Object.entries(result.error.fields).forEach(([field, message]) => {
    form.setError(field as keyof FormValues, { message: message as string });
  });
}
```

#### 3. Authorization Errors
| Scenario | Expected Behavior |
|----------|-------------------|
| Token expired | Redirect to login |
| Not product owner | Toast "Permission denied" |
| Tier downgraded | Show upgrade message |

**Implementation Check**:
```typescript
// In API response handling
if (response.status === 401) {
  // Redirect to login
  window.location.href = '/vendor/login';
}
if (response.status === 403) {
  toast.error('You do not have permission to perform this action');
}
```

#### 4. Concurrent Modification
| Scenario | Expected Behavior |
|----------|-------------------|
| Product deleted while editing | Show "Product not found" error |
| Product updated by another session | Show conflict message |

**Implementation Check**:
```typescript
// Handle 404 in edit/delete
if (response.status === 404) {
  toast.error('Product not found. It may have been deleted.');
  mutate(); // Refresh list
  setIsFormOpen(false);
}
```

#### 5. Empty/Loading States
| Scenario | Expected Behavior |
|----------|-------------------|
| No products | Empty state with CTA |
| Loading | Skeleton cards |
| API error | Error alert with retry |
| Slow connection | Loading persists, no timeout |

### Edge Cases

#### Form Submission
- [ ] Double-click prevention (button disabled during submit)
- [ ] Form reset on successful submit
- [ ] Form preserved on error
- [ ] Cancel discards changes

#### Data Display
- [ ] Long product names truncated with ellipsis
- [ ] Missing short description shows fallback
- [ ] Many categories show "+N more"
- [ ] Empty categories array handled

#### Publish Toggle
- [ ] Optimistic UI update (optional, or wait for response)
- [ ] Revert on error
- [ ] Disable during request

### Implementation Checklist

- [ ] All fetch calls wrapped in try-catch
- [ ] All errors show user-friendly messages
- [ ] Loading states prevent duplicate actions
- [ ] 401 redirects to login
- [ ] 403 shows permission error
- [ ] 404 handles missing resources
- [ ] 500 shows generic error

### Testing Procedure

1. **Validation errors**:
   - Try submitting empty form
   - Enter 256+ character name
   - Verify error messages appear

2. **Network error**:
   - Open DevTools → Network → Offline
   - Try to create product
   - Verify error toast

3. **Authorization error**:
   - Clear cookies
   - Try to access products page
   - Verify redirect to login

4. **404 handling**:
   - Create product
   - Delete via Payload admin
   - Try to edit from UI
   - Verify error handling

## Acceptance Criteria

- [ ] All error scenarios tested
- [ ] User-friendly error messages for all cases
- [ ] No unhandled promise rejections
- [ ] No console errors from error handling
- [ ] UI never breaks from error conditions
- [ ] Loading states prevent double submissions

## Related Files

- All frontend components
- All API routes
- `lib/services/ProductService.ts`
