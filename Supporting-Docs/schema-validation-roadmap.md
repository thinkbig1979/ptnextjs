# Schema Validation Implementation Roadmap

## Overview

This roadmap outlines the step-by-step implementation plan for completing schema validation coverage across all critical collections.

## Phase 1: Fix Detected Mismatches (Immediate)

### Task 1.1: Fix clientSatisfactionScore
**Priority:** High
**Effort:** 5 minutes
**Impact:** Prevents invalid data submission

**Steps:**
1. Open `/home/edwin/development/ptnextjs/payload/collections/Vendors.ts`
2. Find line ~469: `clientSatisfactionScore` field
3. Change `max: 10` to `max: 100`
4. Run schema validation tests to confirm fix
5. Commit with message: "fix: Update clientSatisfactionScore max value to 100"

**Verification:**
```bash
npm test -- __tests__/integration/schema-validation/schema-sync.test.ts -t "clientSatisfactionScore"
```

### Task 1.2: Fix teamMembers.bio maxLength
**Priority:** High
**Effort:** 5 minutes
**Impact:** Allows valid bio submissions up to 2000 characters

**Steps:**
1. Open `/home/edwin/development/ptnextjs/lib/validation/vendorSchemas.ts`
2. Find line ~147: `teamMemberSchema` bio field
3. Change `.max(1000)` to `.max(2000)`
4. Update error message: `'Bio must be less than 2000 characters'`
5. Run schema validation tests to confirm fix
6. Commit with message: "fix: Update teamMember bio maxLength to 2000"

**Verification:**
```bash
npm test -- __tests__/integration/schema-validation/schema-sync.test.ts -t "teamMembers.bio"
```

**Estimated Time:** 10 minutes
**Deliverable:** 2 schema mismatches resolved

---

## Phase 2: Create tier_upgrade_requests Validation (High Priority)

### Task 2.1: Create Zod Schema
**Priority:** High
**Effort:** 1 hour
**Impact:** Validates tier upgrade/downgrade request submissions

**Create:** `/home/edwin/development/ptnextjs/lib/validation/tier-upgrade-request-schema.ts`

**Schema Structure:**
```typescript
import { z } from 'zod';

export const tierUpgradeRequestSchema = z.object({
  vendor: z.string(), // Vendor ID (relationship)
  user: z.string(), // User ID (relationship)
  currentTier: z.enum(['free', 'tier1', 'tier2', 'tier3']),
  requestType: z.enum(['upgrade', 'downgrade']),
  requestedTier: z.enum(['free', 'tier1', 'tier2', 'tier3']),
  status: z.enum(['pending', 'approved', 'rejected', 'cancelled']).default('pending'),
  vendorNotes: z.string().max(500).optional().nullable(),
  rejectionReason: z.string().max(1000).optional().nullable(),
  reviewedBy: z.string().optional().nullable(), // User ID
  requestedAt: z.string().datetime(),
  reviewedAt: z.string().datetime().optional().nullable(),
}).refine(
  (data) => {
    // Validate tier comparison based on requestType
    const tierOrder = { free: 0, tier1: 1, tier2: 2, tier3: 3 };
    const current = tierOrder[data.currentTier];
    const requested = tierOrder[data.requestedTier];

    if (data.requestType === 'upgrade') {
      return requested > current;
    } else if (data.requestType === 'downgrade') {
      return requested < current;
    }
    return true;
  },
  {
    message: 'Requested tier must be higher than current tier for upgrades, lower for downgrades',
  }
);

export type TierUpgradeRequestData = z.infer<typeof tierUpgradeRequestSchema>;
```

### Task 2.2: Add Tests to schema-sync.test.ts
**Effort:** 30 minutes

**Add Test Section:**
```typescript
describe('Schema Synchronization - TierUpgradeRequests (NEW)', () => {
  const shape = getZodSchemaShape(tierUpgradeRequestSchema);

  it('should have required relationships', () => {
    expect(shape.vendor).toBeDefined();
    expect(shape.user).toBeDefined();

    const vendorAnalysis = analyzeZodType(shape.vendor);
    expect(vendorAnalysis.type).toBe('string');
    expect(vendorAnalysis.isOptional).toBe(false);
  });

  it('should have tier enums with correct values', () => {
    expect(shape.currentTier).toBeDefined();
    const analysis = analyzeZodType(shape.currentTier);
    expect(analysis.enumValues).toEqual(['free', 'tier1', 'tier2', 'tier3']);
  });

  it('should have requestType enum', () => {
    expect(shape.requestType).toBeDefined();
    const analysis = analyzeZodType(shape.requestType);
    expect(analysis.enumValues).toEqual(['upgrade', 'downgrade']);
  });

  it('should have status enum with default', () => {
    expect(shape.status).toBeDefined();
    const analysis = analyzeZodType(shape.status);
    expect(analysis.enumValues).toEqual(['pending', 'approved', 'rejected', 'cancelled']);
  });

  it('should have vendorNotes with max 500 chars', () => {
    const analysis = analyzeZodType(shape.vendorNotes);
    expect(analysis.maxLength).toBe(500);
    expect(analysis.isOptional || analysis.isNullable).toBe(true);
  });

  it('should have rejectionReason with max 1000 chars', () => {
    const analysis = analyzeZodType(shape.rejectionReason);
    expect(analysis.maxLength).toBe(1000);
    expect(analysis.isOptional || analysis.isNullable).toBe(true);
  });

  it('should validate tier upgrade logic', () => {
    const validUpgrade = {
      vendor: 'vendor-1',
      user: 'user-1',
      currentTier: 'free',
      requestType: 'upgrade',
      requestedTier: 'tier1',
      requestedAt: new Date().toISOString(),
    };
    expect(() => tierUpgradeRequestSchema.parse(validUpgrade)).not.toThrow();

    const invalidUpgrade = {
      vendor: 'vendor-1',
      user: 'user-1',
      currentTier: 'tier1',
      requestType: 'upgrade',
      requestedTier: 'free', // Invalid: downgrade with upgrade type
      requestedAt: new Date().toISOString(),
    };
    expect(() => tierUpgradeRequestSchema.parse(invalidUpgrade)).toThrow();
  });
});
```

### Task 2.3: Integrate into API Endpoints
**Effort:** 30 minutes

**Update Files:**
- `app/api/portal/vendors/[id]/tier-upgrade-request/route.ts`
- `app/api/portal/vendors/[id]/tier-downgrade-request/route.ts`
- `app/api/admin/tier-upgrade-requests/route.ts`

**Add Validation:**
```typescript
import { tierUpgradeRequestSchema } from '@/lib/validation/tier-upgrade-request-schema';

// In POST handler
const validatedData = tierUpgradeRequestSchema.parse(requestData);
```

**Estimated Time:** 2 hours
**Deliverable:** Complete validation for tier upgrade/downgrade requests

---

## Phase 3: Create users Validation (Medium Priority)

### Task 3.1: Create Zod Schema for Custom Fields
**Priority:** Medium
**Effort:** 45 minutes
**Impact:** Validates user registration and status changes

**Create:** `/home/edwin/development/ptnextjs/lib/validation/user-schema.ts`

**Schema Structure:**
```typescript
import { z } from 'zod';

export const userCustomFieldsSchema = z.object({
  role: z.enum(['admin', 'vendor']).default('vendor'),
  status: z.enum(['pending', 'approved', 'rejected', 'suspended']).default('pending'),
  rejectionReason: z.string().max(1000).optional().nullable(),
  approvedAt: z.string().datetime().optional().nullable(),
  rejectedAt: z.string().datetime().optional().nullable(),
});

export const userRegistrationSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['admin', 'vendor']).default('vendor'),
});

export const userStatusUpdateSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected', 'suspended']),
  rejectionReason: z.string().min(10).max(1000).optional(),
}).refine(
  (data) => {
    if (data.status === 'rejected') {
      return data.rejectionReason !== undefined;
    }
    return true;
  },
  {
    message: 'Rejection reason is required when rejecting a user',
  }
);

export type UserCustomFields = z.infer<typeof userCustomFieldsSchema>;
export type UserRegistration = z.infer<typeof userRegistrationSchema>;
export type UserStatusUpdate = z.infer<typeof userStatusUpdateSchema>;
```

### Task 3.2: Add Tests
**Effort:** 30 minutes

### Task 3.3: Integrate into User Management
**Effort:** 30 minutes

**Estimated Time:** 1.5 hours
**Deliverable:** Complete validation for user management

---

## Phase 4: Create products Validation (Medium Priority)

### Task 4.1: Create Zod Schema
**Priority:** Medium
**Effort:** 1 hour
**Impact:** Validates product catalog management

**Create:** `/home/edwin/development/ptnextjs/lib/validation/product-schema.ts`

**Note:** Analyze Payload Products collection first to understand all fields

### Task 4.2: Add Tests
**Effort:** 45 minutes

### Task 4.3: Integrate into Product Management
**Effort:** 30 minutes

**Estimated Time:** 2.5 hours
**Deliverable:** Complete validation for product management

---

## Phase 5: Create import_history Validation (Low Priority)

### Task 5.1: Create Zod Schema
**Priority:** Low
**Effort:** 30 minutes
**Impact:** Validates import tracking metadata

**Create:** `/home/edwin/development/ptnextjs/lib/validation/import-history-schema.ts`

### Task 5.2: Add Tests
**Effort:** 20 minutes

### Task 5.3: Integrate into Import Services
**Effort:** 20 minutes

**Estimated Time:** 1 hour
**Deliverable:** Complete validation for import history

---

## Phase 6: CI/CD Integration (Critical)

### Task 6.1: Add Pre-Commit Hook
**Priority:** High
**Effort:** 15 minutes

**Create:** `.husky/pre-commit`
```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Run schema validation tests
npm test -- __tests__/integration/schema-validation/schema-sync.test.ts --bail
```

### Task 6.2: Add GitHub Actions Workflow
**Priority:** High
**Effort:** 20 minutes

**Update:** `.github/workflows/tests.yml`
```yaml
- name: Schema Validation
  run: npm test -- __tests__/integration/schema-validation/schema-sync.test.ts
```

### Task 6.3: Add Status Badge
**Priority:** Low
**Effort:** 5 minutes

**Update:** `README.md`
```markdown
![Schema Validation](https://github.com/your-repo/workflows/Schema%20Validation/badge.svg)
```

**Estimated Time:** 40 minutes
**Deliverable:** Automated schema validation in CI/CD

---

## Phase 7: Advanced Automation (Future)

### Task 7.1: Auto-Generate Zod from Payload
**Priority:** Low
**Effort:** 8-16 hours
**Impact:** Eliminates manual schema synchronization

**Approach:**
1. Parse Payload collection TypeScript files with AST (TypeScript Compiler API)
2. Extract field definitions, types, constraints
3. Generate Zod schema programmatically
4. Write to `lib/validation/generated/` directory
5. Export from index file

**Tools:**
- `ts-morph` - TypeScript AST manipulation
- `prettier` - Code formatting
- Custom generator script

### Task 7.2: Schema Version Control
**Priority:** Low
**Effort:** 4-8 hours

**Features:**
- Track schema changes over time
- Generate migration scripts
- Detect breaking changes
- Alert API consumers

### Task 7.3: Visual Schema Diff Tool
**Priority:** Low
**Effort:** 16-24 hours

**Features:**
- Web-based schema comparison
- Side-by-side diff view
- Color-coded mismatches
- Export diff reports

**Estimated Time:** 28-48 hours
**Deliverable:** Advanced schema automation tools

---

## Timeline Summary

| Phase | Priority | Effort | Timeline |
|-------|----------|--------|----------|
| Phase 1: Fix Mismatches | High | 10 min | Day 1 |
| Phase 2: tier_upgrade_requests | High | 2 hrs | Day 1-2 |
| Phase 3: users | Medium | 1.5 hrs | Day 2-3 |
| Phase 4: products | Medium | 2.5 hrs | Day 3-4 |
| Phase 5: import_history | Low | 1 hr | Day 4-5 |
| Phase 6: CI/CD Integration | High | 40 min | Day 5 |
| Phase 7: Advanced Automation | Low | 28-48 hrs | Future Sprint |

**Total Immediate Work:** ~8 hours (Phases 1-6)
**Total Future Work:** 28-48 hours (Phase 7)

---

## Success Criteria

### Phase 1-2 (Must Have)
- [ ] 2 detected mismatches fixed
- [ ] tier_upgrade_requests validation complete
- [ ] All tests passing
- [ ] Zero schema drift warnings

### Phase 3-5 (Should Have)
- [ ] users validation complete
- [ ] products validation complete
- [ ] import_history validation complete
- [ ] 90%+ collection coverage

### Phase 6 (Must Have)
- [ ] Pre-commit hook active
- [ ] CI/CD pipeline integrated
- [ ] Tests run on every PR
- [ ] Status badge displayed

### Phase 7 (Nice to Have)
- [ ] Auto-generation prototype
- [ ] Schema versioning POC
- [ ] Visual diff tool alpha

---

## Risk Mitigation

### Risk 1: Breaking Changes
**Mitigation:** Run full test suite before and after schema changes

### Risk 2: Performance Impact
**Mitigation:** Run schema validation tests in parallel with other tests

### Risk 3: Maintenance Overhead
**Mitigation:** Document test update process, automate where possible

### Risk 4: Team Adoption
**Mitigation:** Provide comprehensive documentation and quick start guide

---

## Monitoring and Maintenance

### Weekly
- [ ] Review schema validation test results
- [ ] Address any new mismatches
- [ ] Update documentation as needed

### Monthly
- [ ] Review missing coverage
- [ ] Prioritize new validation schemas
- [ ] Update roadmap based on usage

### Quarterly
- [ ] Evaluate automation opportunities
- [ ] Review test suite performance
- [ ] Plan advanced features

---

## Resources

### Documentation
- `/Supporting-Docs/schema-validation-test-suite.md` - Complete reference
- `/Supporting-Docs/schema-validation-quick-start.md` - Developer guide
- `/Supporting-Docs/schema-validation-summary.md` - Executive summary

### Test Files
- `__tests__/integration/schema-validation/schema-sync.test.ts` - Main test suite
- `__tests__/integration/api-contract/vendor-update-schema-contract.test.ts` - API contract tests

### Schema Files
- `lib/validation/vendorSchemas.ts` - Form validation schemas
- `lib/validation/vendor-update-schema.ts` - API validation schema
- `payload/collections/` - Payload CMS collection schemas

---

## Next Steps

1. **Immediate (Today):**
   - Fix 2 detected mismatches
   - Run tests to verify fixes

2. **Short-term (This Week):**
   - Create tier_upgrade_requests validation
   - Integrate into API endpoints
   - Add CI/CD integration

3. **Medium-term (This Month):**
   - Create users and products validation
   - Complete coverage for high-priority collections

4. **Long-term (Next Quarter):**
   - Evaluate auto-generation feasibility
   - Plan advanced automation features

---

**Last Updated:** 2025-12-07
**Status:** Roadmap Created
**Next Review:** Weekly during implementation
