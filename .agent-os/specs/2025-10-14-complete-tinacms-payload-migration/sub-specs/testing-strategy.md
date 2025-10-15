# Testing Strategy

This is the testing strategy for the spec detailed in @.agent-os/specs/2025-10-14-complete-tinacms-payload-migration/spec.md

## Testing Framework

**Primary Testing Framework**: Jest 29+ with TypeScript support
**Integration Testing**: Supertest for Payload API testing
**E2E Testing**: Playwright for browser-based testing
**Test Runner**: Jest with ts-jest for TypeScript execution
**Coverage Target**: Minimum 80% coverage for new migration code

## Test Types & Coverage

### Unit Tests

**PayloadCMSDataService Tests** (`__tests__/unit/lib/payload-cms-data-service.test.ts`):
- Test all data fetching methods (getAllVendors, getVendorBySlug, getAllProducts, etc.)
- Test all new methods (getAllYachts, getTags, getCompanyInfo)
- Test transform methods (transformPayloadVendor, transformPayloadProduct, transformPayloadYacht)
- Test caching logic (getCached, clearCache, cache TTL)
- Test error handling (missing data, API failures)
- Mock Payload API responses for predictable testing

**Migration Script Tests** (`__tests__/unit/scripts/migrate-tinacms-to-payload.test.ts`):
- Test markdown parsing utilities
- Test data transformation logic
- Test media path transformations
- Test validation functions
- Test relationship resolvers
- Mock file system and Payload API

**Expected Coverage**: 90%+ for data service, 85%+ for migration scripts

### Integration Tests

**Payload API Integration** (`__tests__/integration/lib/payload-cms-data-service.test.ts`):
- Test real Payload API calls (using test database)
- Test complete data fetching workflows
- Test relationship resolution (vendor ↔ products, categories ↔ content)
- Test search functionality
- Test filtering and sorting
- Verify caching behavior with real API

**Migration Integration** (`__tests__/integration/scripts/migration.test.ts`):
- Run migration scripts against test database
- Verify all collections populated correctly
- Validate data integrity and relationships
- Test rollback procedures
- Performance testing (migration time for full dataset)

**Setup**:
- Use SQLite test database (fast, isolated)
- Seed with sample TinaCMS markdown files
- Clean database before each test suite
- Measure migration performance

### E2E Tests

**Critical Path Testing** (`e2e/migration-validation.spec.ts`):

1. **Vendor Pages E2E**:
   - Navigate to /vendors
   - Verify vendor list displays from Payload
   - Click vendor profile
   - Verify all enhanced fields display (certifications, awards, case studies, team, projects)
   - Test filtering by category
   - Test search functionality

2. **Product Pages E2E**:
   - Navigate to /products
   - Verify product list with images
   - Click product detail
   - Verify specifications, features, benefits display
   - Verify comparison metrics, reviews, visual demo (if present)
   - Test vendor filtering

3. **Yacht Pages E2E**:
   - Navigate to /yachts
   - Verify yacht profiles display
   - Click yacht detail
   - Verify timeline, supplier map, sustainability score, maintenance history
   - Test category filtering

4. **Blog & Content Pages E2E**:
   - Navigate to /blog
   - Verify blog posts display
   - Click blog post
   - Verify rich content rendering
   - Navigate to /team - verify team members
   - Navigate to /about - verify company info

**Test Environment**:
- Use production build (`npm run build` then `npm run start`)
- Real Payload database with migrated test data
- Headless browser testing (Chromium, Firefox, WebKit)

## Test Data Management

### Test Database Setup

**Development/Testing Database** (`data/test-payload.db`):
```bash
# Create clean test database
rm -f data/test-payload.db
export DATABASE_URL="file:./data/test-payload.db"
export NODE_ENV=test

# Run Payload migrations to create schema
npm run payload:migrate

# Seed with test data
npm run test:seed
```

**Test Data Seeding**:
- Minimal dataset: 5 vendors, 10 products, 3 yachts, 5 blog posts
- Include all field types and edge cases
- Test data stored in `__fixtures__/tinacms-test-data/`
- Automated seeding script: `scripts/seed-test-data.ts`

### Mock Data Strategy

**For Unit Tests**:
- Mock Payload API responses with static JSON fixtures
- Mock file system reads for markdown parsing
- Predictable, deterministic test data

**For Integration Tests**:
- Use real test database with seeded data
- Isolated test transactions (rollback after each test)

**For E2E Tests**:
- Full database with realistic content
- Persistent test data (not rolled back)
- Reset database before full E2E suite

## Continuous Integration

### Pre-Commit Hooks
```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm run lint && npm run type-check"
    }
  }
}
```

### CI Pipeline (GitHub Actions / GitLab CI)

**Automated Test Workflow**:
```yaml
name: Test Migration

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '22'

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        run: npm run test:unit

      - name: Run integration tests
        run: npm run test:integration
        env:
          DATABASE_URL: file:./data/test-payload.db

      - name: Run E2E tests
        run: npm run test:e2e

      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

## Performance Testing

### Migration Performance Benchmarks

**Target Metrics**:
- Categories migration: < 5 seconds (< 50 files)
- Tags migration: < 5 seconds (< 100 files)
- Vendors migration: < 30 seconds (20 vendors with full data)
- Products migration: < 60 seconds (40 products with full data)
- Yachts migration: < 20 seconds (5-10 yachts)
- Blog posts migration: < 15 seconds (10-20 posts)
- **Total migration time**: < 3 minutes for full production dataset

**Performance Testing Script** (`scripts/benchmark-migration.ts`):
```typescript
import { performance } from 'perf_hooks';

async function benchmarkMigration() {
  const start = performance.now();

  await migrateCategories(payload);
  const categoriesTime = performance.now() - start;

  await migrateTags(payload);
  const tagsTime = performance.now() - start - categoriesTime;

  // ... benchmark each migration

  console.log('Migration Performance:');
  console.log(`Categories: ${categoriesTime.toFixed(2)}ms`);
  console.log(`Tags: ${tagsTime.toFixed(2)}ms`);
  // ...
}
```

### Runtime Performance Testing

**Page Load Performance**:
- Homepage: < 1 second (cached), < 2 seconds (uncached)
- Vendor list: < 1.5 seconds
- Vendor detail: < 1 second (with all enhanced fields)
- Product detail: < 1.5 seconds (with comparison metrics, reviews)
- Yacht detail: < 2 seconds (complex data structures)

**API Response Time Testing** (`__tests__/performance/api-response-times.test.ts`):
```typescript
test('Payload API response times within SLA', async () => {
  const start = performance.now();
  const vendors = await payloadCMSDataService.getAllVendors();
  const duration = performance.now() - start;

  expect(duration).toBeLessThan(500); // < 500ms for cached
  expect(vendors.length).toBeGreaterThan(0);
});
```

## Test Documentation

### Test Coverage Reports

**Generate Coverage Report**:
```bash
npm run test:coverage

# View HTML report
open coverage/lcov-report/index.html
```

**Coverage Requirements by Module**:
- PayloadCMSDataService: 90%+
- Migration scripts: 85%+
- Transform utilities: 90%+
- Validation utilities: 95%+

### Test Results Tracking

**Test Execution Logs**:
- Store in `test-results/` directory
- Include in .gitignore
- Archive for historical tracking

**Automated Test Reports**:
- Jest HTML reporter for unit/integration tests
- Playwright HTML reporter for E2E tests
- Coverage badge in README

## Validation Checklist

### Pre-Migration Validation
- [ ] All TinaCMS markdown files parse without errors
- [ ] All required fields present in markdown files
- [ ] No duplicate slugs in markdown files
- [ ] All media files exist at referenced paths
- [ ] All vendor/category references valid

### Post-Migration Validation
- [ ] Record counts match (markdown files = database records)
- [ ] All relationships resolved correctly
- [ ] No orphaned records (products without vendors, etc.)
- [ ] All media paths transformed correctly
- [ ] All JSONB structures valid
- [ ] No data loss (spot-check sample records)

### Frontend Validation
- [ ] All pages build successfully
- [ ] No console errors on any page
- [ ] All enhanced fields render correctly
- [ ] Images display correctly
- [ ] Search and filtering work
- [ ] Navigation between pages works
- [ ] Static export generates all pages

## Rollback Testing

**Test Rollback Procedure**:
1. Create database snapshot before migration
2. Run migration
3. Test rollback to snapshot
4. Verify data restored correctly
5. Test application functionality after rollback

**Rollback Script** (`scripts/rollback-migration.ts`):
```typescript
async function rollbackMigration() {
  // Drop all Payload tables
  // Restore from backup
  // Verify data integrity
  // Switch frontend back to TinaCMS if needed
}
```

## Quality Gates

**Test must pass before**:
- Merging to main branch: All unit tests + linting
- Deploying to staging: All tests + build verification
- Deploying to production: All tests + manual QA + performance validation

**Blocking Issues**:
- Any test failures
- Coverage below 80%
- Build failures
- E2E test failures
- Performance regressions (> 20% slower)
