# Best Practices

This document outlines core development best practices for Agent OS projects.

## Compounding Engineering Philosophy

### Core Principle
Write code that compounds in value over time. Every feature should make the next feature easier to build.

The essence of compounding engineering is building systems where each new feature leverages previous work, creating exponential productivity gains. Instead of treating each feature as isolated work, we build interconnected systems where complexity grows logarithmically while capability grows exponentially.

### Key Concepts

#### 1. Reusability First
- **Extract patterns into reusable components/functions/services**: When you notice similar code appearing in multiple places, immediately extract it into a shared utility
- **Document patterns for future reference**: Create clear documentation explaining when and how to use reusable components
- **Build libraries, not one-off solutions**: Think beyond the immediate problem - design solutions that can be adapted for future use cases
- **Create building blocks**: Each piece of functionality should be a LEGO brick that can be combined with others

**Example patterns to extract**:
- Data validation and sanitization
- API response formatting
- Error handling and logging
- Authentication and authorization checks
- Database query patterns
- UI component compositions

#### 2. Composability
- **Small, focused modules that work together**: Each module should do one thing well and have a clear, single responsibility
- **Clear interfaces and contracts**: Define explicit input/output contracts with strong typing
- **Avoid tight coupling**: Modules should depend on abstractions, not concrete implementations
- **Enable plugin architectures**: Design systems where new functionality can be added without modifying existing code

**Principles of composable design**:
- Pure functions whenever possible (no side effects)
- Dependency injection for flexibility
- Interface-based design (depend on contracts, not implementations)
- Event-driven architectures for loose coupling

#### 3. Knowledge Capture
- **Document why, not just what**: Code comments and documentation should explain the reasoning behind decisions
- **Capture patterns and anti-patterns**: Maintain a knowledge base of what works well and what to avoid
- **Build institutional knowledge**: Create a searchable repository of solutions to common problems
- **Include decision rationale**: Document why you chose one approach over alternatives

**What to document**:
- Why certain architectural decisions were made
- Performance considerations and trade-offs
- Security implications and mitigations
- Known limitations and edge cases
- Failed approaches and why they didn't work

#### 4. Systematic Improvement
- **Each feature should improve the system's architecture**: Leave the codebase better than you found it
- **Refactor as you go**: Don't accumulate technical debt - address it incrementally
- **Leave code better than you found it**: Apply the Boy Scout Rule consistently
- **Continuous refinement**: Regularly revisit and improve existing code

**Improvement strategies**:
- Identify duplication and extract abstractions
- Simplify complex functions into smaller, testable units
- Add missing tests for critical paths
- Update outdated documentation
- Remove dead code and unused dependencies

### Examples

#### ❌ Non-Compounding Approach

**One-off implementation with no reusability**:
```typescript
// user-controller.ts
async function process_user_data(data) {
  // Validation - duplicated across controllers
  if (!data.email || !data.email.includes('@')) {
    throw new Error('Invalid email');
  }
  if (data.name.length < 2) {
    throw new Error('Name too short');
  }

  // Sanitization - duplicated logic
  data.email = data.email.toLowerCase().trim();
  data.name = data.name.trim();

  // Database logic - no abstraction
  const user = await db.query('INSERT INTO users VALUES...', [data.email, data.name]);

  // No logging or telemetry
  return user;
}
```

**Problems with this approach**:
- Validation logic is duplicated in every controller
- No separation of concerns
- Hard to test individual pieces
- No reusability for future features
- Missing observability and error handling
- Future features have to rebuild everything from scratch

#### ✅ Compounding Approach

**Modular, reusable implementation**:
```typescript
// lib/validation/schemas.ts
import { z } from 'zod';

export const user_schema = z.object({
  email: z.string().email().toLowerCase().trim(),
  name: z.string().min(2).max(100).trim(),
});

export function validate_user_schema(data: unknown): User {
  return user_schema.parse(data);
}

// lib/security/sanitization.ts
export function sanitize_input<T extends Record<string, any>>(data: T): T {
  // Reusable sanitization logic
  return Object.entries(data).reduce((acc, [key, value]) => {
    acc[key] = typeof value === 'string' ? value.trim() : value;
    return acc;
  }, {} as T);
}

// lib/telemetry/events.ts
export function log_user_event(event_name: string, properties: Record<string, any>) {
  // Centralized event logging
  logger.info(event_name, {
    timestamp: new Date(),
    ...properties,
  });
}

// lib/database/repositories/user-repository.ts
export class UserRepository {
  async create(user_data: User): Promise<UserRecord> {
    // Reusable database operations
    return await this.db.users.create(user_data);
  }
}

// controllers/user-controller.ts
import { validate_user_schema } from '@/lib/validation/schemas';
import { sanitize_input } from '@/lib/security/sanitization';
import { log_user_event } from '@/lib/telemetry/events';
import { UserRepository } from '@/lib/database/repositories/user-repository';

export async function process_user_data(data: unknown): Promise<ProcessedUser> {
  // Clean, composable implementation
  const validated = validate_user_schema(data);
  const sanitized = sanitize_input(validated);

  const repository = new UserRepository();
  const user = await repository.create(sanitized);

  log_user_event('user_created', { user_id: user.id });

  return transform_user(user);
}
```

**Benefits of this approach**:
- Each utility is reusable across the entire application
- Easy to test individual components in isolation
- Future features can immediately leverage these utilities
- Consistent validation, sanitization, and logging everywhere
- New features build on existing infrastructure
- Adding a new entity type reuses 80% of the code

#### Real-World Compounding Example

**Initial Feature: User Registration**
```typescript
// First implementation creates reusable infrastructure
validate_user_schema()      // Validation utility
sanitize_input()            // Security utility
log_user_event()            // Telemetry utility
UserRepository.create()     // Database utility
```

**Second Feature: Product Creation** (60% faster to build)
```typescript
// Reuses most infrastructure, only adds product-specific logic
validate_product_schema()   // New: product validation
sanitize_input()            // ✓ Reused from user registration
log_product_event()         // ✓ Adapted from user events
ProductRepository.create()  // ✓ Follows user repository pattern
```

**Third Feature: Order Processing** (75% faster to build)
```typescript
// Combines existing infrastructure in new ways
validate_order_schema()     // New: order validation
sanitize_input()            // ✓ Reused
log_order_event()           // ✓ Reused
OrderRepository.create()    // ✓ Reused pattern
send_order_notification()   // New: notification system
```

**Fourth Feature: Order Notifications** (80% faster to build)
```typescript
// Builds on everything that came before
validate_notification()     // ✓ Reused validation pattern
sanitize_input()            // ✓ Reused
log_notification_event()    // ✓ Reused
NotificationRepository()    // ✓ Reused pattern
send_order_notification()   // ✓ Already implemented
```

Each feature becomes progressively easier to build because it leverages and extends existing infrastructure.

### Benefits

#### 1. **Faster Development Over Time**
- Initial features take normal time to build
- Each subsequent feature becomes progressively faster
- Eventually, new features are 70-90% faster to implement
- Exponential productivity gains as the codebase matures

#### 2. **Fewer Bugs**
- Reused code is battle-tested code
- Bugs are fixed once and benefit all features
- Consistent patterns reduce cognitive load
- Easier to reason about system behavior

#### 3. **Consistent Patterns Across Codebase**
- Predictable code structure
- Easier to navigate unfamiliar code
- Reduced decision fatigue
- Standard approaches to common problems

#### 4. **Easier Onboarding for New Developers**
- Clear patterns to follow
- Searchable examples throughout codebase
- Documentation of common solutions
- Reduced time to first contribution

#### 5. **Improved Maintainability**
- Changes in one place propagate everywhere
- Refactoring becomes safer and easier
- Technical debt decreases over time
- System becomes more robust with age

#### 6. **Better Code Quality**
- Reusable components are more thoroughly tested
- More eyes on shared code
- Higher standards for foundational code
- Natural incentive to write clean, flexible APIs

### How to Apply

#### 1. **Before Implementing: Search for Similar Patterns**
```bash
# Search for existing implementations
grep -r "validation" ./lib
grep -r "repository" ./lib
grep -r "log_event" ./lib
```

**Questions to ask**:
- Has someone solved this problem before?
- Can I adapt an existing solution?
- What patterns already exist in the codebase?
- Are there similar features I can learn from?

#### 2. **During Implementation: Extract Reusable Pieces**

**Signals that code should be extracted**:
- You're about to copy-paste code
- Logic appears in multiple places
- The code solves a general problem
- Future features will likely need similar functionality

**What to extract**:
- Validation logic
- Data transformations
- API client wrappers
- Error handling patterns
- Logging and monitoring
- Common UI components

#### 3. **After Implementation: Document Patterns**

**Create searchable documentation**:
```markdown
# Pattern: Entity Repository

## When to Use
When you need to perform database operations on an entity.

## Example
\`\`\`typescript
class ProductRepository extends BaseRepository<Product> {
  async find_by_sku(sku: string): Promise<Product | null> {
    return await this.find_one({ where: { sku } });
  }
}
\`\`\`

## Related Patterns
- UserRepository
- OrderRepository
```

**Documentation checklist**:
- [ ] What problem does this solve?
- [ ] When should it be used?
- [ ] Code example with explanation
- [ ] Common pitfalls and gotchas
- [ ] Links to real-world usage

#### 4. **Regular Refactoring: Consolidate Duplicated Code**

**Refactoring workflow**:
```bash
# 1. Identify duplication
npm run find-duplicates

# 2. Extract to shared utility
# 3. Replace all instances with shared code
# 4. Run tests to verify behavior unchanged
npm test

# 5. Document the new pattern
```

**Schedule regular refactoring**:
- Dedicate 20% of development time to refactoring
- Include refactoring in every sprint
- Make "leave it better" part of code reviews
- Celebrate improvements to reusability

### Anti-Patterns to Avoid

#### ❌ **Premature Abstraction**
Don't create abstractions before you have at least 2-3 concrete examples. Wait until the pattern is clear.

#### ❌ **Over-Engineering**
Keep it simple. Extract small, focused utilities, not complex frameworks.

#### ❌ **Copy-Paste Development**
If you're copying code, stop and extract a reusable function instead.

#### ❌ **Not Documenting Patterns**
Undocumented patterns might as well not exist. Always document reusable code.

#### ❌ **Ignoring Technical Debt**
Small problems compound. Address technical debt incrementally to prevent accumulation.

### Measuring Success

Track these metrics to measure compounding effectiveness:

**Velocity Metrics**:
- Time to implement similar features (should decrease)
- Code reuse percentage (should increase)
- Number of utilities created vs. used (usage should exceed creation)

**Quality Metrics**:
- Test coverage of reusable code (should be near 100%)
- Bug density in reused vs. one-off code (reused should be lower)
- Documentation coverage of patterns (should increase)

**Developer Experience**:
- Time for new developers to become productive (should decrease)
- Code review feedback on reusability (should decrease)
- Developer satisfaction with codebase quality (should increase)

### Summary

Compounding engineering is about building systems that get better with age. Each feature should:
1. **Leverage** existing infrastructure
2. **Extend** reusable components
3. **Document** new patterns
4. **Refactor** to reduce duplication

When done consistently, this approach leads to:
- Exponentially faster development over time
- Higher quality, more maintainable code
- Better developer experience
- More robust, scalable systems

**Remember**: The goal is not perfection on day one, but systematic improvement over time. Each feature should make the next feature easier to build.

---

## Test-Driven Development (TDD) Planning

### Core Principle

Test-Driven Development is a disciplined approach to software development where tests are written before implementation code, driving design decisions and ensuring comprehensive test coverage from the start. TDD follows the RED-GREEN-REFACTOR cycle: write failing tests (RED), implement minimal code to pass tests (GREEN), then improve code quality while keeping tests green (REFACTOR).

The essence of TDD is building features through a test-first mindset, where every line of production code is justified by a failing test. This approach leads to better design, comprehensive test coverage, and confidence in refactoring.

### When to Use TDD Enforcement

TDD is particularly valuable in these scenarios:

**Critical Systems** (STRICT enforcement recommended):
- Financial transactions and payment processing
- Authentication and authorization systems
- Data validation and integrity features
- Security-sensitive operations (encryption, access control)
- Medical or healthcare systems with regulatory requirements
- Systems where bugs could cause data loss or corruption

**Production Features** (STANDARD enforcement recommended):
- API endpoints and backend services
- Core business logic and domain models
- User-facing features with complex interactions
- Database operations and migrations
- Integration points with external systems
- Features with well-defined requirements

**Exploratory Work** (RELAXED enforcement recommended):
- Early-stage prototypes and proof of concepts
- Learning new technologies or frameworks
- Spike solutions to evaluate technical approaches
- Internal tools and development utilities
- Documentation and configuration files
- Legacy code integration where tests are impractical

**When NOT to Use TDD**:
- Simple CRUD operations with framework-provided functionality
- Configuration files and static content
- UI mockups and design explorations
- Throwaway code and experiments
- Generated code (migrations, scaffolding)

### Benefits and Trade-offs

**Benefits**:
- **Comprehensive Test Coverage**: Tests are written for all functionality, not added as an afterthought
- **Better Design**: Writing tests first forces consideration of API design, dependencies, and interfaces
- **Living Documentation**: Tests serve as executable specifications and usage examples
- **Refactoring Confidence**: Comprehensive test suite enables safe refactoring and improvements
- **Faster Debugging**: Tests pinpoint exact failure location, reducing debugging time
- **Prevents Feature Creep**: Focus on implementing only what's needed to pass tests

**Trade-offs**:
- **Initial Time Investment**: Writing tests first takes more time upfront (20-30% more initially)
- **Learning Curve**: TDD requires practice and discipline to do effectively
- **Test Maintenance**: Tests require updating when requirements change
- **Not Always Practical**: Some code is difficult to test (UI, external dependencies, legacy systems)

**When Benefits Outweigh Costs**:
- Long-lived production code (maintenance benefits compound over time)
- Complex business logic (design benefits are significant)
- Team environments (tests enable collaboration and prevent regressions)
- Critical systems (confidence and safety are paramount)

### Integration with Agent OS Workflows

TDD enforcement is integrated throughout Agent OS workflows:

**Specification Creation** (`create-spec.md` Step 4.5):
- TDD workflow definition added to all specifications
- Enforcement level selected based on feature criticality
- RED, GREEN, and REFACTOR phases planned in detail
- Coverage targets defined based on enforcement level

**Task Creation** (`create-tasks.md`):
- Tasks include TDD acceptance criteria from specifications
- Test-first requirements propagated to task definitions
- TDD validator hook configured for task execution

**Task Execution** (`execute-task-orchestrated.md`):
- Orchestrator validates TDD phases during implementation
- Tests verified before marking tasks complete
- Coverage targets enforced based on enforcement level

**Quality Hooks** (automatic validation):
- TDD validator hook runs on every file write/edit
- Validates test-first workflow compliance
- Checks coverage targets and test quality

---

## TDD Enforcement Levels

### STRICT Enforcement

**When to Use**:
- Critical systems (financial, medical, security)
- Data integrity features (validation, sanitization, storage)
- Authentication and authorization
- Payment processing and financial transactions
- Systems with regulatory compliance requirements (HIPAA, PCI-DSS, SOC 2)
- Features where bugs could cause data loss, security breaches, or financial impact

**Enforcement Behavior**:
- **Test-first requirement**: Block - Implementation cannot proceed without tests
- **Implementation blocking**: Enabled - All tests must be written before implementation code
- **Quality gates**:
  - Minimum 95% coverage (no exceptions)
  - 100% branch coverage for critical paths
  - All edge cases must have corresponding tests
  - Test-first timestamp verification (tests created before implementation)
  - Manual review required before deployment

**Coverage Targets**:
- Minimum: 95% (blocks task completion if not met)
- Target: 98% (goal for implementation)
- Warning threshold: 90% (triggers warnings to improve coverage)

**Example Features**:
- Email validation with database constraints (prevents invalid data)
- User authentication with password hashing (security critical)
- Payment processing with transaction integrity (financial impact)
- Data synchronization with conflict resolution (data integrity)

**Decision Criteria**:
- Could a bug cause data loss or corruption? → STRICT
- Are there security implications? → STRICT
- Is there regulatory compliance required? → STRICT
- Could a bug cause financial loss? → STRICT
- Is this a data validation or integrity feature? → STRICT

### STANDARD Enforcement

**When to Use**:
- Most production code and features
- Moderate complexity business logic
- API endpoints and backend services
- Database operations and queries
- Frontend features with complex state
- Integration with external services
- Features with clear, stable requirements

**Enforcement Behavior**:
- **Test-first requirement**: Warn - Tests strongly encouraged before implementation
- **Implementation blocking**: Disabled - Allow implementation without tests, but warn
- **Quality gates**:
  - Minimum 85% coverage (blocks task completion)
  - 90% branch coverage for main paths
  - Critical paths and error handling must be tested
  - Test-first encouraged but not strictly enforced
  - Code review includes test quality assessment

**Coverage Targets**:
- Minimum: 85% (blocks task completion if not met)
- Target: 90% (goal for implementation)
- Warning threshold: 80% (triggers warnings to improve coverage)

**Example Features**:
- User registration with email validation (standard business logic)
- Product catalog with search and filtering (moderate complexity)
- API endpoints for CRUD operations (well-defined contracts)
- Report generation with data aggregation (clear requirements)

**Decision Criteria**:
- Is this production code with stable requirements? → STANDARD
- Does it have moderate complexity? → STANDARD
- Are there clear acceptance criteria? → STANDARD
- Is comprehensive test coverage valuable but not critical? → STANDARD

### RELAXED Enforcement

**When to Use**:
- Prototypes and proof-of-concept code
- Learning and experimentation
- Spike solutions to evaluate technical approaches
- Legacy code integration (where tests are impractical)
- Internal tools and scripts
- Documentation and configuration
- Generated code and boilerplate

**Enforcement Behavior**:
- **Test-first requirement**: Log only - Tests optional, logged for awareness
- **Implementation blocking**: Disabled - No restrictions on implementation
- **Quality gates**:
  - Minimum 60% coverage (warning only, does not block)
  - Basic happy path testing encouraged
  - No branch coverage requirements
  - Test-first not required
  - Minimal review requirements

**Coverage Targets**:
- Minimum: 60% (warning only, does not block)
- Target: 70% (aspirational goal)
- Warning threshold: 50% (informational warning)

**Example Features**:
- Early prototype of new feature for stakeholder feedback
- Spike to evaluate GraphQL vs REST for new API
- Internal script to migrate data (one-time use)
- Learning new framework or library
- Legacy integration where adding tests is impractical

**Decision Criteria**:
- Is this throwaway or short-lived code? → RELAXED
- Are you learning or experimenting? → RELAXED
- Is comprehensive test coverage impractical? → RELAXED
- Is this internal tooling or documentation? → RELAXED

### Feature Type Considerations

Different feature types have different testing needs. Adjust enforcement level based on feature characteristics:

**Data Validation Features** → STRICT enforcement mandatory
- Email validation, phone number validation, data sanitization
- Rationale: Bugs allow invalid data into system, causing cascading failures

**Security Features** → STRICT enforcement mandatory
- Authentication, authorization, encryption, access control
- Rationale: Security bugs have severe consequences, compliance requirements

**Financial Features** → STRICT enforcement mandatory
- Payment processing, transaction handling, billing, refunds
- Rationale: Financial bugs cause monetary loss, legal liability

**Core Business Logic** → STANDARD enforcement recommended
- Order processing, inventory management, user workflows
- Rationale: Important features deserve comprehensive tests, but not critical

**UI Components** → STANDARD to RELAXED depending on complexity
- Simple presentational components → RELAXED (visual testing sufficient)
- Complex interactive components with state → STANDARD (behavior testing valuable)

**API Endpoints** → STANDARD enforcement recommended
- REST/GraphQL endpoints, request/response handling
- Rationale: Clear contracts make TDD effective, integration important

**Database Operations** → STANDARD to STRICT depending on criticality
- Simple CRUD → STANDARD (framework handles most logic)
- Complex queries, migrations, data integrity → STRICT (bugs affect data)

**Integration Points** → STANDARD enforcement recommended
- External API integration, service communication
- Rationale: Integration bugs are common, tests provide confidence

**Prototypes and Spikes** → RELAXED enforcement
- Early-stage development, technical exploration
- Rationale: Requirements unclear, code may be discarded

---

## RED Phase: Failing Tests Best Practices

The RED phase is about writing comprehensive tests that fail because the feature is not yet implemented. This phase defines what success looks like and provides a clear target for implementation.

### Test Category Coverage

Plan tests across multiple categories to ensure comprehensive coverage:

**Unit Tests** (Fastest, most granular):
- Test individual functions, methods, and classes in isolation
- Mock external dependencies (database, APIs, file system)
- Focus on business logic, validation, data transformation
- Aim for 70-80% of total tests to be unit tests
- Execution time: <100ms per test

**Integration Tests** (Medium speed, component interaction):
- Test how components work together
- Real database connections, API calls, file operations
- Focus on contracts between modules, data flow
- Aim for 15-20% of total tests to be integration tests
- Execution time: 100-500ms per test

**API Tests** (HTTP endpoint testing):
- Test REST/GraphQL endpoints end-to-end
- Request/response validation, status codes, error handling
- Authentication, authorization, rate limiting
- Aim for 5-10% of total tests to be API tests
- Execution time: 200-1000ms per test

**Database Tests** (Schema and constraint validation):
- Test database constraints (unique, foreign key, check constraints)
- Schema validation, index existence
- Migration success and rollback
- Aim for 3-5% of total tests to be database tests
- Execution time: 100-300ms per test

**Edge Case Tests** (Boundary conditions):
- Test null, undefined, empty string, whitespace
- Maximum/minimum values, buffer overflows
- Unexpected input types, malformed data
- Aim for 5-10% of total tests to be edge case tests
- Execution time: <100ms per test

**Example Test Distribution** (Email validation feature):
```
Total tests: 24
├── Unit tests: 8 (33%) - validation logic, normalization
├── Integration tests: 3 (12%) - database constraints, API + DB
├── API tests: 5 (21%) - endpoint behavior, error responses
├── Database tests: 3 (12%) - constraints, indexes, schema
└── Edge case tests: 5 (21%) - null, whitespace, unicode, max length
```

### Expected Failure Documentation

Each test should document its expected failure mode. This ensures tests are failing for the right reasons (missing implementation) rather than test bugs.

**Clear Failure Messages**:
```typescript
// Good: Specific expected failure
test('validate_email should accept valid format', () => {
  // Expected failure: ReferenceError: validate_email is not defined
  const result = validate_email('user@example.com');
  expect(result.valid).toBe(true);
});

// Bad: Vague failure expectation
test('email validation works', () => {
  // Expected failure: ???
  const result = validate_email('user@example.com');
  expect(result).toBeTruthy();
});
```

**Common Expected Failures**:
- `ReferenceError: function_name is not defined` - Function not yet created
- `TypeError: Cannot read property 'X' of undefined` - Object structure not implemented
- `404 Not Found: GET /api/endpoint` - API route not created
- `Error: relation "table_name" does not exist` - Database table not created
- `AssertionError: expected undefined to equal 'value'` - Missing property/field

**Verify Failures Are Legitimate**:
```bash
# Run tests after RED phase - all should fail with expected messages
npm test

# Example output (RED phase complete):
# FAIL  24 tests failed
#   ✗ validate_email accepts valid format (ReferenceError: validate_email is not defined)
#   ✗ validate_email rejects missing @ symbol (ReferenceError: validate_email is not defined)
#   ✗ POST /api/validate/email returns 200 (404 Not Found)
```

### Test Data Specifications

Define comprehensive test data sets covering happy paths, error cases, and edge cases.

**Happy Path Data** (Valid inputs):
```typescript
const valid_emails = [
  'user@example.com',           // Standard format
  'test.user@domain.co.uk',     // Multiple TLDs
  'name+tag@example.org',       // Plus addressing
  'user_name@example.com',      // Underscore
  'user123@example.com',        // Numbers
];
```

**Error Case Data** (Expected to fail validation):
```typescript
const invalid_emails = [
  'userexample.com',            // Missing @ symbol
  'user@',                      // Missing domain
  'user@domain',                // Missing TLD
  '@example.com',               // Missing local part
  'user @example.com',          // Whitespace in email
  'user@domain.',               // Trailing period
];
```

**Edge Case Data** (Boundary conditions):
```typescript
const edge_case_emails = [
  '',                           // Empty string
  '   ',                        // Whitespace only
  null,                         // Null value
  undefined,                    // Undefined value
  'a'.repeat(250) + '@x.com',   // Max length (256 chars)
  'user@例え.com',              // Unicode characters
];
```

**Fixture Organization**:
```typescript
// src/__tests__/fixtures/email-test-data.ts
export const email_fixtures = {
  valid: { /* happy path data */ },
  invalid: { /* error case data */ },
  edge_cases: { /* boundary conditions */ },

  // Organized by test scenario
  scenarios: {
    registration: ['user@example.com', 'new.user@domain.com'],
    duplicate: ['existing@example.com', 'existing@example.com'],
    normalization: ['USER@EXAMPLE.COM', 'user@example.com'], // input → expected
  }
};
```

### Test Execution Order

Plan test execution order for optimal feedback and debugging efficiency.

**Execution Strategy**:
1. **Unit tests first** (parallel execution, fastest feedback) - ~50-100ms
2. **Database tests** (sequential execution, requires DB setup) - ~200-500ms
3. **API tests** (sequential execution, requires server) - ~500-2000ms
4. **Integration tests** (sequential execution, full stack) - ~800-3000ms
5. **Edge case tests** (parallel execution, boundary validation) - ~100-200ms

**Rationale**:
- Unit tests provide immediate feedback on core logic
- Database tests validate schema before API tests run
- API tests depend on database being ready
- Integration tests verify everything works together
- Edge cases can run in parallel with other tests

**Test Grouping**:
```typescript
// Organize tests by execution speed and dependencies
describe('Email Validation (Unit Tests - Fast)', () => {
  // No external dependencies, run in parallel
  test('validates correct format', () => { /* ... */ });
  test('rejects missing @ symbol', () => { /* ... */ });
  // 8 tests, ~50ms total
});

describe('Email Validation (Database Tests - Medium)', () => {
  beforeAll(async () => {
    // Setup database connection
    await setupTestDatabase();
  });

  // Sequential execution with database
  test('unique constraint prevents duplicates', async () => { /* ... */ });
  test('lowercase check constraint enforced', async () => { /* ... */ });
  // 3 tests, ~300ms total
});

describe('Email Validation (API Tests - Slow)', () => {
  beforeAll(async () => {
    // Start test server
    await startTestServer();
  });

  // Sequential execution with API calls
  test('POST /validate/email returns 200', async () => { /* ... */ });
  test('POST /users enforces uniqueness', async () => { /* ... */ });
  // 5 tests, ~1000ms total
});
```

### RED Phase Completion Criteria

The RED phase is complete when all tests are written and failing for the right reasons.

**Checklist**:
- [ ] All planned tests written in test files (unit, integration, API, database, edge cases)
- [ ] All tests execute without syntax errors or import failures
- [ ] All tests fail with expected error messages (not test bugs)
- [ ] Test failures clearly indicate missing implementation (ReferenceError, 404, relation does not exist)
- [ ] Test structure follows project conventions (describe/it blocks, proper assertions)
- [ ] Test data and fixtures created (valid, invalid, edge cases)
- [ ] Test execution time is acceptable (< 5 seconds for full suite)
- [ ] Tests are independent (can run in any order without affecting each other)
- [ ] Tests are deterministic (no random data causing flaky tests)

**Validation Commands**:
```bash
# Run all tests - should see 100% failures
npm test

# Verify test count matches plan
npm test -- --coverage

# Check test execution time
npm test -- --verbose

# Verify no syntax errors
npm run lint:tests
```

**RED Phase Output Example**:
```
Test Suites: 5 failed, 0 passed, 5 total
Tests:       24 failed, 0 passed, 24 total
Time:        1.842s

FAIL src/lib/validation/__tests__/email-validator.test.ts
  ✗ validate_email accepts valid format (2ms)
    ReferenceError: validate_email is not defined
  ✗ validate_email rejects missing @ symbol (1ms)
    ReferenceError: validate_email is not defined
  [... 6 more unit tests failing ...]

FAIL src/app/api/v1/__tests__/api-endpoints.test.ts
  ✗ POST /api/validate/email returns 200 (45ms)
    Error: Cannot POST /api/v1/validate/email (404 Not Found)
  [... 4 more API tests failing ...]

FAIL src/lib/db/__tests__/database-constraints.test.ts
  ✗ users table unique constraint on email (12ms)
    Error: relation "users" does not exist
  [... 2 more database tests failing ...]
```

### Common RED Phase Mistakes

**Mistake 1: Writing all tests at once without running them**
- Problem: May have syntax errors, import issues, or test logic bugs
- Solution: Write tests incrementally, run after each test to verify failure

**Mistake 2: Tests failing for wrong reasons (test bugs)**
- Problem: Test has syntax error or wrong assertion, not because implementation is missing
- Solution: Verify error messages match expected failures (ReferenceError, 404, etc.)

**Mistake 3: Tests too coupled to implementation details**
- Problem: Tests assume specific implementation approach, limiting flexibility
- Solution: Test behavior and outputs, not internal implementation details

**Mistake 4: Missing edge cases and error scenarios**
- Problem: Tests only cover happy path, bugs slip through in edge cases
- Solution: Systematically plan edge cases (null, empty, max length, invalid types)

**Mistake 5: Tests depend on each other or execution order**
- Problem: Tests pass/fail based on what ran before, hard to debug
- Solution: Each test sets up its own data, cleans up after itself

**Mistake 6: Flaky tests with random data or timing issues**
- Problem: Tests sometimes pass, sometimes fail due to randomness or timing
- Solution: Use fixed test data, mock time-dependent functions, avoid sleep()

---

## GREEN Phase: Minimal Implementation Best Practices

The GREEN phase is about writing the simplest code possible to make all tests pass. The goal is to satisfy test requirements without over-engineering or adding features not covered by tests.

### Minimal Implementation Principles

**Core Philosophy**: Implement only what is needed to pass tests, nothing more. Avoid premature optimization, abstraction, or features not required by tests.

**Key Principles**:

1. **Implement Only What Tests Require**
   - If no test covers a feature, don't implement it
   - Satisfy test assertions with simplest possible code
   - Avoid "future-proofing" or "just in case" code

2. **Prefer Standard Library Over Custom Solutions**
   - Use built-in functions and libraries before writing custom code
   - Leverage well-tested third-party libraries for common tasks
   - Don't reinvent the wheel for solved problems

3. **No Premature Abstraction**
   - Wait until a pattern emerges 3+ times before extracting
   - Keep code concrete and specific to current use case
   - Refactor to abstractions in REFACTOR phase if beneficial

4. **Single Responsibility Functions**
   - Each function should do one thing well
   - Functions with one clear purpose are easier to test and understand
   - Split complex functions into smaller, focused units

5. **Clear Over Clever**
   - Write self-documenting code with descriptive names
   - Prefer straightforward conditionals over complex one-liners
   - Avoid showing off language tricks or obscure features

### Code Simplicity Constraints

Enforce code simplicity through measurable constraints that vary by enforcement level:

**STRICT Enforcement** (Critical systems):
- Maximum lines per function: 50 lines (hard limit)
- Maximum cyclomatic complexity: 10 (hard limit)
- Maximum nesting depth: 3 levels
- Maximum parameters per function: 5
- No duplicate code blocks > 5 lines
- Every function has single return type

**STANDARD Enforcement** (Most production code):
- Maximum lines per function: 75 lines (soft limit)
- Maximum cyclomatic complexity: 15 (soft limit)
- Maximum nesting depth: 4 levels
- Maximum parameters per function: 6
- No duplicate code blocks > 10 lines
- Prefer single return type, allow unions when necessary

**RELAXED Enforcement** (Prototypes, learning):
- Maximum lines per function: 100 lines (guideline only)
- Maximum cyclomatic complexity: 20 (guideline only)
- No strict nesting or parameter limits
- Duplicate code acceptable for prototypes
- Return types flexible

**Measuring Complexity**:
```bash
# TypeScript/JavaScript (using ESLint)
npm run lint -- --rule 'complexity: ["error", 10]'

# Python (using radon)
radon cc src/ --min C  # Complexity > 10

# Ruby (using rubocop)
rubocop --only Metrics/CyclomaticComplexity
```

**Example Refactoring to Meet Constraints**:
```typescript
// Before: 78 lines, complexity 14, nesting 5
function process_order(order_data) {
  if (order_data) {
    if (order_data.items) {
      for (let item of order_data.items) {
        if (item.quantity > 0) {
          if (item.in_stock) {
            // ... 60 more lines of nested logic
          }
        }
      }
    }
  }
}

// After: 3 functions, max 45 lines each, complexity 8, nesting 3
function process_order(order_data) {
  validate_order_data(order_data);
  const validated_items = validate_order_items(order_data.items);
  return calculate_order_total(validated_items);
}

function validate_order_data(data) {
  if (!data) throw new Error('Order data required');
  if (!data.items || data.items.length === 0) {
    throw new Error('Order must have at least one item');
  }
}

function validate_order_items(items) {
  return items
    .filter(item => item.quantity > 0)
    .filter(item => item.in_stock);
}

function calculate_order_total(items) {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}
```

### Implementation Preferences

**Use Well-Tested Libraries**:
```typescript
// Good: Use validator.js for email validation
import validator from 'validator';

export function validate_email(email: string): boolean {
  return validator.isEmail(email);
}

// Bad: Roll your own complex regex
export function validate_email(email: string): boolean {
  const regex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return regex.test(email);
}
```

**Prefer Simple Conditionals**:
```typescript
// Good: Clear conditionals with specific error messages
function validate_email(email: string): ValidationResult {
  if (!email) {
    return { valid: false, message: 'Email is required' };
  }
  if (!email.includes('@')) {
    return { valid: false, message: 'Email must contain @ symbol' };
  }
  if (email.length > 255) {
    return { valid: false, message: 'Email must be 255 characters or less' };
  }
  return { valid: true, message: 'Valid' };
}

// Bad: Complex nested ternary
function validate_email(email: string): ValidationResult {
  return !email ? { valid: false, message: 'Required' }
    : !email.includes('@') ? { valid: false, message: 'Missing @' }
    : email.length > 255 ? { valid: false, message: 'Too long' }
    : { valid: true, message: 'Valid' };
}
```

**Extract Single-Purpose Functions**:
```typescript
// Good: Small, focused functions
function normalize_email(email: string): string {
  return email.toLowerCase().trim();
}

function validate_email_format(email: string): boolean {
  return validator.isEmail(email);
}

function validate_email_length(email: string): boolean {
  return email.length >= 3 && email.length <= 255;
}

// Bad: One large function doing everything
function validate_and_process_email(email: string): Result {
  // 100 lines of validation, normalization, error handling
}
```

### Implementation Steps and Checkpoints

Break implementation into small steps with clear checkpoints to validate progress.

**Step Structure**:
1. **Step name**: Brief description of what's being implemented
2. **Files**: Specific files created or modified
3. **Code**: Summary of code added
4. **Tests passing**: Which tests pass after this step
5. **Lines of code**: Approximate lines added
6. **Checkpoint**: Validation that step is complete
7. **Validation**: How to verify step succeeded

**Example Implementation Plan** (Email validation):

**Step 1: Create email validation function with basic structure**
- Files: `src/lib/validation/email-validator.ts`
- Code: Define `validate_email` function, import validator.js, implement basic validation logic
- Tests passing: 3 unit tests (valid format, missing @, invalid domain)
- Lines of code: ~35 lines
- Checkpoint: Basic email validation working with specific error messages
- Validation: Run `npm test -- email-validator.test.ts` - 3/8 unit tests pass

**Step 2: Add email normalization and edge case handling**
- Files: `src/lib/validation/email-validator.ts`
- Code: Add trim() for whitespace, toLowerCase() for normalization, handle empty string and max length
- Tests passing: 5 more unit tests (normalize, trim, empty, max length, special chars)
- Lines of code: ~10 lines added (45 total)
- Checkpoint: All unit tests passing, edge cases handled
- Validation: Run `npm test -- email-validator.test.ts` - 8/8 unit tests pass

**Step 3: Create database schema and migrations**
- Files: `migrations/001_create_users_table.sql`
- Code: CREATE TABLE with email UNIQUE constraint, lowercase CHECK constraint, index
- Tests passing: 3 database tests (unique constraint, lowercase check, index exists)
- Lines of code: ~20 lines SQL
- Checkpoint: Database schema supports email validation requirements
- Validation: Run `npm test -- database-constraints.test.ts` - 3/3 database tests pass

**Checkpoint Validation Commands**:
```bash
# After each step, run tests to verify progress
npm test -- --testNamePattern="step_name"

# Check coverage after each step
npm test -- --coverage --testPathPattern="file_name"

# Verify no regressions (all previous tests still pass)
npm test
```

### GREEN Phase Completion Criteria

The GREEN phase is complete when all tests pass with minimal implementation.

**Checklist**:
- [ ] All tests pass (100% green test suite)
- [ ] Minimum coverage target met (85%+ for STANDARD, 95%+ for STRICT)
- [ ] No over-implementation detected (no code beyond test requirements)
- [ ] Code follows minimal implementation principles (small functions, low complexity)
- [ ] All implementation checkpoints achieved
- [ ] No code smells or obvious quality issues
- [ ] Implementation uses standard libraries where appropriate
- [ ] Ready for refactoring phase

**Validation Commands**:
```bash
# Verify all tests pass
npm test

# Check coverage meets minimum threshold
npm test -- --coverage

# Verify code complexity within limits
npm run lint -- --rule 'complexity: ["error", 10]'

# Check for code duplication
npm run lint -- --rule 'no-duplicate-code'
```

**GREEN Phase Output Example**:
```
Test Suites: 5 passed, 5 total
Tests:       24 passed, 24 total
Time:        1.923s

Coverage:
  Statements   : 97.5% (39/40)
  Branches     : 95.2% (20/21)
  Functions    : 100% (8/8)
  Lines        : 98.1% (38/39)

Complexity Metrics:
  Max function lines: 42 (within 50 line limit)
  Max cyclomatic complexity: 8 (within 10 complexity limit)
  Max nesting depth: 3 (within limit)
```

### Common GREEN Phase Mistakes

**Mistake 1: Over-engineering and premature optimization**
- Problem: Adding features, abstractions, or optimizations not required by tests
- Solution: Implement only what tests require, defer optimization to REFACTOR phase

**Mistake 2: Ignoring failing tests to "come back later"**
- Problem: Tests remain red, coverage incomplete, bugs lurk in untested code
- Solution: Make ALL tests pass before considering GREEN phase complete

**Mistake 3: Copy-pasting code instead of extracting functions**
- Problem: Duplicate code violates DRY, makes maintenance harder
- Solution: Extract common logic to reusable functions (but avoid premature abstraction)

**Mistake 4: Writing complex, clever code**
- Problem: Hard to understand, maintain, and debug
- Solution: Write simple, clear code that obviously works

**Mistake 5: Skipping checkpoints and validation**
- Problem: Large changes without verification, hard to debug failures
- Solution: Validate after each step, ensure incremental progress

**Mistake 6: Not using standard libraries and frameworks**
- Problem: Reinventing solved problems, introducing bugs
- Solution: Research if a library exists before writing custom code

---

## REFACTOR Phase Best Practices

(Note: Detailed REFACTOR phase best practices will be added in future iterations. Key points: maintain passing tests, improve code quality systematically, focus on readability and maintainability, validate after each refactoring.)

---

## Coverage Target Recommendations

Coverage targets vary based on enforcement level and feature type. Higher enforcement levels require higher coverage to ensure comprehensive testing.

### Base Coverage Targets by Enforcement Level

**STRICT Enforcement**:
- **Minimum coverage**: 95% - Blocks task completion if not met
- **Target coverage**: 98% - Goal for implementation, best effort
- **Warning threshold**: 90% - Triggers warning messages to improve coverage
- **Rationale**: Critical systems require near-perfect test coverage

**STANDARD Enforcement**:
- **Minimum coverage**: 85% - Blocks task completion if not met
- **Target coverage**: 90% - Goal for implementation, best effort
- **Warning threshold**: 80% - Triggers warning messages to improve coverage
- **Rationale**: Production code deserves comprehensive tests, but not as strict as critical systems

**RELAXED Enforcement**:
- **Minimum coverage**: 60% - Warning only, does not block task completion
- **Target coverage**: 70% - Aspirational goal
- **Warning threshold**: 50% - Informational warning only
- **Rationale**: Prototypes and learning code benefit from some tests, but strict coverage is impractical

### Feature Type Adjustments

Adjust coverage targets based on feature type characteristics:

**Data Validation Features**: +5% to all targets
- Minimum: 90% (STANDARD) or 95% (STRICT)
- Rationale: Validation bugs allow invalid data, causing cascading failures

**Security Features**: +5% to all targets
- Minimum: 90% (STANDARD) or 95% (STRICT)
- Rationale: Security bugs have severe consequences, require highest confidence

**Financial Features**: +5% to all targets
- Minimum: 90% (STANDARD) or 95% (STRICT)
- Rationale: Financial bugs cause monetary loss, legal liability

**UI Components** (Simple): -10% to all targets
- Minimum: 75% (STANDARD) or 85% (STRICT)
- Rationale: Visual testing often more effective than unit tests for UI

**Internal Tools**: -15% to all targets
- Minimum: 70% (STANDARD) or 80% (STRICT)
- Rationale: Internal tools have lower risk, fewer users

**Prototypes**: Use RELAXED enforcement (60% minimum)
- Rationale: Prototypes may be discarded, comprehensive tests not cost-effective

### Coverage Categories

**Statement Coverage**: Percentage of code statements executed by tests
- Measures: How many lines of code are run by tests
- Target: Match overall coverage target (85-98% depending on enforcement)
- Example: `if (x > 0) { return true; }` - Both the condition and return must be executed

**Branch Coverage**: Percentage of conditional branches tested
- Measures: How many if/else paths are tested
- Target: 90-100% for STRICT, 85-95% for STANDARD
- Example: `if (x > 0)` - Both true and false paths must be tested

**Function Coverage**: Percentage of functions called by tests
- Measures: How many functions/methods are invoked by tests
- Target: 100% for all enforcement levels (all public functions should be tested)
- Example: Every exported function must have at least one test

**Line Coverage**: Percentage of code lines executed by tests
- Measures: Similar to statement coverage but counts physical lines
- Target: Match overall coverage target (85-98% depending on enforcement)
- Example: Multi-line statements count as multiple lines

**Coverage Report Example**:
```
Coverage Summary:
  Statements   : 97.5% (39/40)   ✓ Meets 95% target
  Branches     : 95.2% (20/21)   ✓ Meets 90% target
  Functions    : 100% (8/8)      ✓ Meets 100% target
  Lines        : 98.1% (38/39)   ✓ Meets 95% target

Uncovered Lines:
  src/lib/validation/email-validator.ts
    Line 45: Error handling for malformed JSON (edge case not in test data)
```

### When to Adjust Coverage Targets

**Increase Coverage Targets**:
- Critical business logic (payment, authentication, data integrity)
- Regulatory compliance requirements (HIPAA, PCI-DSS, SOC 2)
- Features with history of bugs or regressions
- Public APIs and libraries (external consumers depend on correctness)
- Security-sensitive code (encryption, access control, validation)

**Decrease Coverage Targets**:
- Generated code (migrations, scaffolding, boilerplate)
- Configuration files (JSON, YAML, environment configs)
- Third-party library wrappers (library itself is tested)
- Throwaway prototypes and spike solutions
- Code that is difficult to test meaningfully (random number generation, date/time)

**Example Adjustments**:
```
Feature: Email Validation
  Base enforcement level: STRICT (95% minimum)
  Feature type: Data Validation (+0% adjustment, already STRICT)
  Final coverage target: 95% minimum

Feature: User Dashboard UI
  Base enforcement level: STANDARD (85% minimum)
  Feature type: UI Component (-10% adjustment)
  Final coverage target: 75% minimum

Feature: Payment Processing
  Base enforcement level: STRICT (95% minimum)
  Feature type: Financial Feature (+0% adjustment, already STRICT)
  Final coverage target: 95% minimum
```

### Coverage Exclusions

Exclude code from coverage requirements when tests provide no value:

**Excluded File Types**:
- Type definition files (`.d.ts`, `.ts` with only type exports)
- Configuration files (`config.json`, `.eslintrc.js`, `vitest.config.ts`)
- Database migration files (tested via integration tests that verify DB state)
- Build scripts and tooling (`build.js`, `scripts/`)
- Test utilities and helpers (`__tests__/helpers/`, `test-utils.ts`)
- Generated code (`generated/`, `*.generated.ts`)

**Exclusion Configuration**:
```javascript
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      exclude: [
        '**/*.d.ts',           // Type definitions
        '**/*.config.{js,ts}', // Configuration files
        '**/migrations/**',    // Database migrations
        '**/__tests__/**',     // Test files themselves
        '**/scripts/**',       // Build scripts
        '**/generated/**',     // Generated code
      ],
    },
  },
});
```

**Exclusion Rationale**:
- Type definitions have no runtime logic to test
- Configuration files are data, not behavior
- Migrations are validated by integration tests that check DB state
- Test utilities are validated by their usage in actual tests
- Generated code should have tests in source that generates it

---

## TDD Examples and Anti-Patterns

### Example Specifications with TDD

Agent OS includes three comprehensive example specifications demonstrating TDD integration:

**Email Validation Specification** (`examples/specs-with-tdd/email-validation-spec.md`):
- Feature: RFC 5322-compliant email validation with database constraints
- Enforcement Level: STRICT (data validation feature)
- Test Categories: 8 unit, 3 integration, 5 API, 3 database, 5 edge case tests
- Coverage Target: 98% (achieved 97.5%)
- Demonstrates: Data validation TDD workflow, database constraint testing

**User Authentication Specification** (`examples/specs-with-tdd/user-authentication-spec.md`):
- Feature: JWT-based authentication with password hashing and session management
- Enforcement Level: STRICT (security feature)
- Test Categories: Unit tests for auth logic, integration tests for session flow, API tests for endpoints
- Coverage Target: 98%
- Demonstrates: Security-focused TDD, integration testing patterns

**Data Sync Specification** (`examples/specs-with-tdd/data-sync-spec.md`):
- Feature: Real-time data synchronization with conflict resolution
- Enforcement Level: STANDARD (moderate complexity)
- Test Categories: Unit tests for sync logic, integration tests for conflict resolution
- Coverage Target: 90%
- Demonstrates: STANDARD enforcement TDD, complex business logic testing

**Reference These Examples** when creating specifications with TDD workflows.

### Common Anti-Patterns

**Anti-Pattern 1: Writing Implementation Before Tests**
- **Problem**: Defeats the purpose of TDD, tests become afterthought, poor coverage
- **Symptom**: Tests written to match existing implementation, not drive design
- **Solution**: Follow RED-GREEN-REFACTOR strictly, write tests first always
- **Example**:
  ```typescript
  // Bad: Implementation written first
  // src/lib/validation/email.ts created
  export function validate_email(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  // Then tests written to match implementation
  // src/lib/validation/__tests__/email.test.ts
  test('validate_email works', () => {
    expect(validate_email('user@example.com')).toBe(true); // Just testing implementation
  });

  // Good: Tests written first
  // src/lib/validation/__tests__/email.test.ts created first
  test('validate_email accepts valid format', () => {
    // Expected failure: ReferenceError: validate_email is not defined
    const result = validate_email('user@example.com');
    expect(result.valid).toBe(true);
    expect(result.normalized).toBe('user@example.com');
  });

  // Then minimal implementation to pass test
  // src/lib/validation/email.ts created after test
  export function validate_email(email: string): ValidationResult {
    const valid = validator.isEmail(email);
    return { valid, normalized: email.toLowerCase() };
  }
  ```

**Anti-Pattern 2: Writing All Tests at Once (Big Bang Testing)**
- **Problem**: Large test suite fails all at once, overwhelming and hard to debug
- **Symptom**: 50+ tests all failing, unclear where to start implementation
- **Solution**: Write tests incrementally, implement in small steps, validate progress
- **Example**:
  ```typescript
  // Bad: All 50 tests written at once
  describe('Email Validation', () => {
    test('test 1', () => { /* ... */ });
    test('test 2', () => { /* ... */ });
    // ... 48 more tests
    test('test 50', () => { /* ... */ });
  });

  // Good: Tests written incrementally, implemented in batches
  // Round 1: Basic validation (3 tests)
  describe('Email Validation - Basic Format', () => {
    test('accepts valid format', () => { /* ... */ });
    test('rejects missing @ symbol', () => { /* ... */ });
    test('rejects invalid domain', () => { /* ... */ });
  });
  // Implement, verify 3 tests pass

  // Round 2: Normalization (3 tests)
  describe('Email Validation - Normalization', () => {
    test('converts to lowercase', () => { /* ... */ });
    test('trims whitespace', () => { /* ... */ });
    test('handles leading/trailing spaces', () => { /* ... */ });
  });
  // Implement, verify 6 tests pass total
  ```

**Anti-Pattern 3: Over-Complicated Minimal Implementation**
- **Problem**: GREEN phase implementation adds unnecessary features, abstractions, optimization
- **Symptom**: Code far more complex than tests require, unused functions, premature patterns
- **Solution**: Implement only what tests require, defer improvements to REFACTOR phase
- **Example**:
  ```typescript
  // Bad: Over-engineered GREEN phase implementation
  export class EmailValidationService {
    private static instance: EmailValidationService;
    private cache: Map<string, ValidationResult> = new Map();
    private config: ValidationConfig;

    private constructor(config: ValidationConfig) {
      this.config = config;
    }

    public static getInstance(config?: ValidationConfig): EmailValidationService {
      if (!EmailValidationService.instance) {
        EmailValidationService.instance = new EmailValidationService(config || defaultConfig);
      }
      return EmailValidationService.instance;
    }

    public async validate(email: string): Promise<ValidationResult> {
      // Complex caching, async patterns, configuration - none required by tests!
      if (this.cache.has(email)) {
        return this.cache.get(email)!;
      }

      const result = await this.performValidation(email);
      this.cache.set(email, result);
      return result;
    }

    // ... 100+ lines of unnecessary complexity
  }

  // Good: Minimal GREEN phase implementation
  export function validate_email(email: string): ValidationResult {
    const trimmed = email.trim();

    if (!trimmed) {
      return { valid: false, message: 'Email is required' };
    }

    if (!validator.isEmail(trimmed)) {
      return { valid: false, message: 'Invalid email format' };
    }

    return {
      valid: true,
      message: 'Valid',
      normalized: trimmed.toLowerCase()
    };
  }
  // Simple, clear, passes all tests
  ```

**Anti-Pattern 4: Skipping REFACTOR Phase**
- **Problem**: Tests pass but code quality poor, technical debt accumulates
- **Symptom**: Duplicate code, complex functions, poor names, no documentation
- **Solution**: Always complete REFACTOR phase, improve code quality while keeping tests green
- **Example**:
  ```typescript
  // Bad: GREEN phase code left as-is, no refactoring
  export function validate_email(email: string): ValidationResult {
    const trimmed = email.trim();
    if (!trimmed) return { valid: false, message: 'Email is required' };
    if (trimmed.length > 255) return { valid: false, message: 'Email must be 255 characters or less' };
    if (!validator.isEmail(trimmed)) {
      if (!trimmed.includes('@')) return { valid: false, message: 'Invalid email format: missing @ symbol' };
      if (!trimmed.split('@')[1]?.includes('.')) return { valid: false, message: 'Invalid email format: domain must contain a period' };
      return { valid: false, message: 'Invalid email format' };
    }
    return { valid: true, message: 'Email is valid', normalized: trimmed.toLowerCase() };
  }
  // Long function, duplicate error message patterns, no constants

  // Good: After REFACTOR phase
  const ERROR_MESSAGES = {
    REQUIRED: 'Email is required',
    TOO_LONG: 'Email must be 255 characters or less',
    MISSING_AT: 'Invalid email format: missing @ symbol',
    INVALID_DOMAIN: 'Invalid email format: domain must contain a period',
    INVALID_FORMAT: 'Invalid email format',
    VALID: 'Email is valid',
  };

  export function validate_email(email: string): ValidationResult {
    const normalized = normalize_email(email);

    const length_error = validate_length(normalized);
    if (length_error) return length_error;

    const format_error = validate_format(normalized);
    if (format_error) return format_error;

    return { valid: true, message: ERROR_MESSAGES.VALID, normalized };
  }

  function normalize_email(email: string): string {
    return email.trim().toLowerCase();
  }

  function validate_length(email: string): ValidationResult | null {
    if (!email) {
      return { valid: false, message: ERROR_MESSAGES.REQUIRED };
    }
    if (email.length > 255) {
      return { valid: false, message: ERROR_MESSAGES.TOO_LONG };
    }
    return null;
  }

  function validate_format(email: string): ValidationResult | null {
    if (!validator.isEmail(email)) {
      if (!email.includes('@')) {
        return { valid: false, message: ERROR_MESSAGES.MISSING_AT };
      }
      if (!email.split('@')[1]?.includes('.')) {
        return { valid: false, message: ERROR_MESSAGES.INVALID_DOMAIN };
      }
      return { valid: false, message: ERROR_MESSAGES.INVALID_FORMAT };
    }
    return null;
  }
  // Refactored: extracted constants, smaller functions, clear structure
  ```

**Anti-Pattern 5: Ignoring Test Failures**
- **Problem**: Tests fail but marked as "known issues" or skipped, regressions ignored
- **Symptom**: Skipped tests (`.skip`), ignored failures, flaky tests marked as expected
- **Solution**: Fix all test failures immediately, never skip tests, fix flaky tests
- **Example**:
  ```typescript
  // Bad: Skipping failing tests
  test.skip('validate_email handles unicode', () => {
    // Skipped because feature not implemented yet
    const result = validate_email('user@例え.com');
    expect(result.valid).toBe(false);
  });

  test('validate_email rejects empty string', () => {
    // Known failure: sometimes passes, sometimes fails (flaky)
    const result = validate_email('');
    expect(result.valid).toBe(false);
  });

  // Good: All tests enabled and passing
  test('validate_email handles unicode', () => {
    // Implemented unicode rejection
    const result = validate_email('user@例え.com');
    expect(result.valid).toBe(false);
    expect(result.message).toContain('ASCII characters only');
  });

  test('validate_email rejects empty string', () => {
    // Fixed flaky test by using consistent test data
    const result = validate_email('');
    expect(result.valid).toBe(false);
    expect(result.message).toBe('Email is required');
  });
  ```

**Anti-Pattern 6: Tests Coupled to Implementation Details**
- **Problem**: Tests break when refactoring even though behavior unchanged
- **Symptom**: Tests check private methods, internal state, implementation specifics
- **Solution**: Test public behavior and outputs, not implementation details
- **Example**:
  ```typescript
  // Bad: Testing implementation details
  test('validate_email uses validator.isEmail internally', () => {
    const spy = jest.spyOn(validator, 'isEmail');
    validate_email('user@example.com');
    expect(spy).toHaveBeenCalledWith('user@example.com');
  });

  test('validate_email normalizes before validation', () => {
    // Testing order of operations (implementation detail)
    const email = 'USER@EXAMPLE.COM';
    const result = validate_email(email);
    // Assumes trim happens before toLowerCase - breaks if refactored
  });

  // Good: Testing behavior and outputs
  test('validate_email accepts valid email', () => {
    const result = validate_email('user@example.com');
    expect(result.valid).toBe(true);
  });

  test('validate_email normalizes email to lowercase', () => {
    const result = validate_email('USER@EXAMPLE.COM');
    expect(result.normalized).toBe('user@example.com');
    // Tests output, not how normalization is implemented
  });
  ```

### Best Practice Examples

**Best Practice 1: Incremental Test-Driven Development**
```typescript
// Step 1: Write first failing test
test('validate_email accepts valid format', () => {
  const result = validate_email('user@example.com');
  expect(result.valid).toBe(true);
});
// Run: FAIL (ReferenceError: validate_email is not defined)

// Step 2: Minimal implementation
export function validate_email(email: string): ValidationResult {
  return { valid: true }; // Simplest code to pass test
}
// Run: PASS (1 test passing)

// Step 3: Add second test (reveals bug in minimal implementation)
test('validate_email rejects missing @ symbol', () => {
  const result = validate_email('userexample.com');
  expect(result.valid).toBe(false);
});
// Run: FAIL (expected false, got true)

// Step 4: Improve implementation
export function validate_email(email: string): ValidationResult {
  const valid = email.includes('@');
  return { valid };
}
// Run: PASS (2 tests passing)

// Continue incrementally: test → fail → implement → pass → refactor
```

**Best Practice 2: Test Categories and Organization**
```typescript
// Organize tests by category for clarity
describe('Email Validation', () => {
  describe('Unit Tests - Format Validation', () => {
    test('accepts valid format', () => { /* ... */ });
    test('rejects missing @ symbol', () => { /* ... */ });
    test('rejects invalid domain', () => { /* ... */ });
  });

  describe('Unit Tests - Normalization', () => {
    test('converts to lowercase', () => { /* ... */ });
    test('trims whitespace', () => { /* ... */ });
  });

  describe('Integration Tests - Database Constraints', () => {
    test('unique constraint prevents duplicates', async () => { /* ... */ });
    test('lowercase check constraint enforced', async () => { /* ... */ });
  });

  describe('Edge Cases', () => {
    test('handles null input', () => { /* ... */ });
    test('handles whitespace-only input', () => { /* ... */ });
  });
});
```

**Best Practice 3: Clear Test Documentation**
```typescript
// Good: Descriptive test names and documentation
test('validate_email should accept RFC 5322 compliant email addresses', () => {
  // Arrange: Setup test data with various valid formats
  const valid_emails = [
    'user@example.com',       // Standard format
    'test.user@domain.co.uk', // Multiple TLDs
    'name+tag@example.org',   // Plus addressing (RFC 5233)
  ];

  // Act & Assert: Verify all valid formats accepted
  for (const email of valid_emails) {
    const result = validate_email(email);
    expect(result.valid).toBe(true);
    expect(result.message).toBe('Email is valid');
  }
});

// Bad: Vague test name and no documentation
test('email works', () => {
  expect(validate_email('user@example.com').valid).toBe(true);
  expect(validate_email('invalid').valid).toBe(false);
});
```

---

## Summary

Test-Driven Development is a disciplined approach to building software with comprehensive test coverage and better design. Key takeaways:

**Core TDD Workflow**:
1. **RED Phase**: Write failing tests that define success criteria
2. **GREEN Phase**: Implement minimal code to make tests pass
3. **REFACTOR Phase**: Improve code quality while keeping tests green

**Enforcement Levels**:
- **STRICT**: Critical systems (95% coverage minimum, test-first blocking)
- **STANDARD**: Production code (85% coverage minimum, test-first encouraged)
- **RELAXED**: Prototypes and learning (60% coverage, no blocking)

**Key Principles**:
- Write tests before implementation code (test-first)
- Implement only what tests require (minimal implementation)
- Refactor continuously to improve quality (systematic improvement)
- Measure and enforce coverage targets (accountability)
- Integrate TDD into specification and task workflows (systematic adoption)

**Integration with Agent OS**:
- TDD sections in all specifications (via `create-spec.md` Step 4.5)
- TDD acceptance criteria in tasks (via `create-tasks.md`)
- TDD validation during execution (via `execute-task-orchestrated.md`)
- Automatic quality enforcement (via TDD validator hook)

**Resources**:
- Example specifications: `examples/specs-with-tdd/`
- Specification template: `templates/spec-templates/standard-spec-template.md`
- Configuration: `config.yml` → `tdd_enforcement` section
- Validator hook: `.claude/hooks/tdd-validator.js`

**Next Steps**:
1. Review example specifications to understand TDD workflow
2. Select appropriate enforcement level for your feature
3. Follow create-spec.md to generate specification with TDD section
4. Execute tasks using orchestrated parallel execution with TDD validation
