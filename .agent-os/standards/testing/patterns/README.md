# Test Library Pattern Catalog

This catalog contains framework-specific testing patterns used by the test-context-gatherer to provide accurate, version-appropriate patterns to the test-architect.

## Available Patterns

| Library | File | Categories |
|---------|------|------------|
| Vitest | [vitest.md](./vitest.md) | Mocking, Assertions, Lifecycle, Async |
| Convex | [convex.md](./convex.md) | Database, Queries, Mutations, Auth |
| Playwright | [playwright.md](./playwright.md) | Locators, Assertions, Network, Page Objects |

## Pattern File Structure

Each pattern file follows this structure:

1. **Version Compatibility** - Which library versions the patterns apply to
2. **Basic Setup** - How to configure and initialize tests
3. **Core Patterns** - Essential patterns for the library's main features
4. **Code Examples** - Working code snippets
5. **Anti-Patterns** - Common mistakes to avoid

## How Patterns Are Used

1. **test-context-gatherer** (Step 2.0) detects project libraries
2. Pattern files are loaded based on detected libraries
3. **test-architect** (Step 2.1) uses patterns when writing tests
4. Anti-patterns are checked during test validation

## Adding New Patterns

To add patterns for a new library:

1. Create `[library-name].md` in this directory
2. Follow the structure of existing pattern files
3. Include version compatibility information
4. Add code examples with comments
5. Document anti-patterns with correct alternatives

## Pattern Categories

### Mocking Patterns
- Module mocking
- Function mocking
- Spy functions
- Async mocking
- Mock clearing/resetting

### Assertion Patterns
- Value assertions
- Mock assertions
- Async assertions
- Array/object assertions
- Custom matchers

### Lifecycle Patterns
- Setup/teardown hooks
- Test isolation
- Parallel execution
- Fixture management

### Framework-Specific
- Database operations (Convex, Prisma)
- API testing (Supertest)
- E2E workflows (Playwright, Cypress)
- Component testing (Testing Library)

## Version Updates

When library versions change significantly:

1. Update the version compatibility section
2. Add new patterns for new features
3. Mark deprecated patterns
4. Update anti-patterns for breaking changes

## Integration with Documentation Fetching

If cached patterns are outdated, the test-context-gatherer will:

1. Check pattern file modification date
2. Compare with detected library version
3. Fetch updated documentation if needed
4. Supplement cached patterns with live docs
