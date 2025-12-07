# Schema Validation Quick Start Guide

## What is This?

An automated test suite that catches mismatches between your frontend validation (Zod) and backend database schema (Payload CMS) **before they cause production bugs**.

## Why Do I Care?

**Without this:**
```
User submits form → Frontend validates → API call → 400 Error "Invalid data"
😡 User sees error → 🤔 Developer confused → 🔍 Hours debugging
```

**With this:**
```
Developer changes schema → Tests run → ❌ FAIL: "Max length mismatch detected"
✅ Fix before commit → No production bugs
```

## Quick Start

### Run the Tests
```bash
# Run all schema validation tests
npm test -- __tests__/integration/schema-validation/schema-sync.test.ts

# Watch mode (auto-run on changes)
npm test -- --watch __tests__/integration/schema-validation/schema-sync.test.ts
```

### What You'll See
```
✓ should have companyName field with correct constraints
✓ should accept serviceAreas as ARRAY OF OBJECTS (not string array)
⚠️ SCHEMA MISMATCH DETECTED:
    Field: clientSatisfactionScore
    Payload CMS: max 10
    Zod Schema: max 100
```

## Common Scenarios

### Scenario 1: Adding a New Field

**Before (Manual Process):**
1. Add field to Payload CMS
2. Add field to Zod schema
3. Hope they match
4. Find out they don't match when user reports bug

**After (Test-Driven):**
1. **Add test FIRST:**
   ```typescript
   it('should have newField with correct constraints', () => {
     expect(shape.newField).toBeDefined();
     const analysis = analyzeZodType(shape.newField);
     expect(analysis.maxLength).toBe(200);
   });
   ```
2. Run tests → ❌ FAIL (field doesn't exist)
3. Add field to Payload CMS with maxLength: 200
4. Add field to Zod schema with maxLength: 200
5. Run tests → ✅ PASS
6. Commit with confidence

### Scenario 2: Changing Field Constraints

**Example: Increase bio character limit**

1. Update test expectation:
   ```typescript
   it('should have bio with max length 2000', () => {
     expect(analysis.maxLength).toBe(2000); // Changed from 1000
   });
   ```
2. Run tests → ❌ FAIL
3. Update Payload: `maxLength: 2000`
4. Update Zod: `.max(2000, '...')`
5. Run tests → ✅ PASS

### Scenario 3: Array Field Validation

**Problem:** Payload returns objects, but Zod expects strings

**Bad:**
```typescript
// This will cause 400 errors!
serviceAreas: z.array(z.string())
```

**Good:**
```typescript
// This accepts both formats
serviceAreas: z.array(
  z.union([
    z.string(),
    z.object({
      area: z.string(),
      description: z.string().optional(),
    })
  ])
)
```

**Test catches this:**
```typescript
it('should accept serviceAreas as ARRAY OF OBJECTS', () => {
  expect(analysis.arrayItemType).toBe('union'); // Not 'string'!
});
```

## Current Mismatches (Fix These!)

### 1. clientSatisfactionScore
- **Payload:** `max: 10`
- **Zod:** `max: 100`
- **Fix:** Update Payload to `max: 100` OR Zod to `max: 10`
- **File:** `/payload/collections/Vendors.ts` line ~469

### 2. teamMembers.bio
- **Payload:** `maxLength: 2000`
- **Zod (form):** `maxLength: 1000`
- **Zod (API):** `maxLength: 2000`
- **Fix:** Update form schema to `maxLength: 2000`
- **File:** `/lib/validation/vendorSchemas.ts` line ~147

## Missing Validation (Create These!)

### High Priority
1. **tier_upgrade_requests** - No Zod schema exists
   - Create: `lib/validation/tier-upgrade-request-schema.ts`
   - Fields: vendor, user, currentTier, requestedTier, status, etc.

2. **users (custom fields)** - Only auth fields validated
   - Create: `lib/validation/user-schema.ts`
   - Fields: role, status, rejectionReason, etc.

### Medium Priority
3. **products** - Vendor product management
4. **import_history** - Excel import tracking

## Integration with Workflow

### Pre-Commit Hook
```bash
# Add to .git/hooks/pre-commit
npm test -- __tests__/integration/schema-validation/schema-sync.test.ts --bail
```

### CI/CD
```yaml
# GitHub Actions
- name: Validate Schema Sync
  run: npm test -- __tests__/integration/schema-validation/schema-sync.test.ts
```

### IDE Integration
```json
// .vscode/tasks.json
{
  "label": "Schema Validation",
  "type": "shell",
  "command": "npm test -- __tests__/integration/schema-validation/schema-sync.test.ts",
  "problemMatcher": "$tsc"
}
```

## Understanding Test Output

### ✅ Passing Test
```
✓ should have companyName field with correct constraints
```
**Meaning:** Frontend and backend match perfectly

### ❌ Failing Test
```
✗ should have bio with max length 2000
  Expected: 2000
  Received: 1000
```
**Meaning:** Mismatch detected - fix before committing

### ⚠️ Warning
```
⚠️ SCHEMA MISMATCH DETECTED:
    Field: clientSatisfactionScore
    Payload CMS: max 10
    Zod Schema: max 100
    Action: Update Payload CMS to max: 100
```
**Meaning:** Known issue documented for tracking

## Best Practices

### 1. Test-First Development
```
Test (expect new field) → Fail → Implement → Pass → Commit
```

### 2. Never Skip Tests
If tests fail, **FIX THEM** - don't ignore or disable!

### 3. Document Mismatches
If you find a mismatch you can't fix immediately, add a test case that documents it.

### 4. Run Before Committing
```bash
npm test -- __tests__/integration/schema-validation/schema-sync.test.ts --bail
```

### 5. Update Tests When Changing Schemas
Schema change without test update = ⏰ time bomb

## Troubleshooting

### Test Fails But Schemas Look Identical
**Cause:** Type mismatch (string vs number)
**Fix:** Check the `analyzeZodType()` output for actual vs expected type

### Test Passes But Runtime Errors Occur
**Cause:** Test doesn't cover all fields
**Fix:** Add more comprehensive test cases for the failing field

### Can't Find Field in Zod Schema
**Cause:** Field only exists in Payload, not validated on frontend
**Fix:** Add field to Zod schema or mark as backend-only

## Advanced Usage

### Analyze a Specific Field
```typescript
const shape = getZodSchemaShape(vendorUpdateSchema);
const analysis = analyzeZodType(shape.companyName);
console.log(analysis);
// {
//   type: 'string',
//   isOptional: false,
//   minLength: 2,
//   maxLength: 100
// }
```

### Test Array Item Structure
```typescript
it('should accept complex array items', () => {
  const testData = {
    caseStudies: [
      {
        images: [
          'https://example.com/img.jpg',  // URL string
          123,                             // Media ID
          { image: 456 }                   // Object
        ]
      }
    ]
  };
  expect(() => schema.parse(testData)).not.toThrow();
});
```

### Validate Enum Values
```typescript
it('should have correct tier values', () => {
  const analysis = analyzeZodType(shape.tier);
  expect(analysis.enumValues).toEqual(['free', 'tier1', 'tier2', 'tier3']);
});
```

## Resources

### Full Documentation
- `/Supporting-Docs/schema-validation-test-suite.md`

### Related Tests
- `__tests__/integration/api-contract/vendor-update-schema-contract.test.ts`
- `__tests__/integration/api-contract/form-to-api-field-mapping.test.ts`

### Schema Files
- `/lib/validation/vendorSchemas.ts` - Form schemas
- `/lib/validation/vendor-update-schema.ts` - API schemas
- `/payload/collections/Vendors.ts` - Database schema

## Questions?

**Q: Do I need to run this manually?**
A: No, run it in CI/CD. But running locally catches issues faster.

**Q: What if I don't fix a mismatch?**
A: Document it with a test case so it's tracked, not forgotten.

**Q: Can I skip writing tests for new fields?**
A: You *can*, but you'll regret it when users report 400 errors.

**Q: How often should I run this?**
A: On every schema change, before every commit, and in CI/CD.

---

**Remember:** 5 minutes writing tests saves 5 hours debugging production bugs! 🎯
