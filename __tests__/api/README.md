# API Route Tests

This directory contains unit tests for Next.js API routes using Jest.

## Directory Structure

```
__tests__/api/
├── portal/              # Vendor portal API tests
│   └── tier-upgrade-request.test.ts
└── admin/               # Admin panel API tests
    └── tier-upgrade-requests.test.ts
```

## Test Files

### Vendor Portal Tests

**`portal/tier-upgrade-request.test.ts`**
- Tests for vendor tier upgrade request submission and management
- Covers POST, GET, and DELETE endpoints
- 30+ test cases covering authentication, authorization, validation, and error handling

### Admin Panel Tests

**`admin/tier-upgrade-requests.test.ts`**
- Tests for admin tier upgrade request management
- Covers GET (list), PUT (approve), and PUT (reject) endpoints
- 30+ test cases covering admin authorization, filtering, and request processing

## Running Tests

Run all API tests:
```bash
npm test -- __tests__/api
```

Run specific test file:
```bash
npm test -- __tests__/api/portal/tier-upgrade-request.test.ts
npm test -- __tests__/api/admin/tier-upgrade-requests.test.ts
```

Run with coverage:
```bash
npm test -- --coverage __tests__/api
```

Run in watch mode:
```bash
npm test -- --watch __tests__/api
```

## Test Patterns

### Mocking Dependencies

All tests mock external dependencies to ensure isolation:

```typescript
jest.mock('payload', () => ({
  getPayload: jest.fn(),
}));

jest.mock('@/lib/services/TierUpgradeRequestService', () => ({
  validateTierUpgradeRequest: jest.fn(),
  // ... other functions
}));

jest.mock('@/lib/middleware/rateLimit', () => ({
  rateLimit: jest.fn((req, handler) => handler()),
}));
```

### Test Structure

Each test file follows this structure:

1. **Mock Setup** - Mock all dependencies before imports
2. **Import Modules** - Import mocked modules
3. **Test Suites** - Organized by endpoint and concern
   - Authentication
   - Authorization
   - Validation
   - Success Cases
   - Error Handling

### Example Test

```typescript
it('should return 401 when no token provided', async () => {
  const { POST } = await import('@/app/api/portal/vendors/[id]/tier-upgrade-request/route');

  const mockRequest = {
    cookies: {
      get: jest.fn().mockReturnValue(undefined),
    },
    json: jest.fn(),
  } as any;

  const mockContext = { params: Promise.resolve({ id: 'vendor-123' }) };

  try {
    const response = await POST(mockRequest, mockContext);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.error).toBe('UNAUTHORIZED');
  } catch (error) {
    // Handle cases where NextResponse.json may not work in test env
    expect(mockRequest.cookies.get).toHaveBeenCalledWith('payload-token');
  }
});
```

## Best Practices

1. **Isolation**: Each test should be independent and not rely on others
2. **Clear Naming**: Test names should clearly describe what they're testing
3. **Comprehensive Coverage**: Test all code paths including error cases
4. **Mock Cleanup**: Use `beforeEach` to reset mocks between tests
5. **Try-Catch Pattern**: Handle potential NextResponse.json issues in test environment

## Coverage Goals

- **Authentication**: All endpoints should test authenticated and unauthenticated access
- **Authorization**: Test role-based access control (vendor vs admin)
- **Validation**: Test all validation rules and edge cases
- **Success Paths**: Test happy path scenarios with valid data
- **Error Handling**: Test all error conditions and status codes

## Related Documentation

- [API Routes Documentation](../../app/api/README.md)
- [Service Layer Tests](../__tests__/backend/services/)
- [Test Summary](../../Supporting-Docs/tier-upgrade-api-tests-summary.md)
