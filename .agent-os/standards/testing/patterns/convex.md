# Convex Testing Patterns

Version compatibility: convex-test 0.1.x, convex 1.x

## Basic Setup

### Test File Structure

```typescript
import { convexTest } from "convex-test";
import { expect, test, describe, beforeEach } from "vitest";
import { api } from "./_generated/api";
import schema from "./schema";

// Create test instance with schema
const t = convexTest(schema);

describe("MyFunction", () => {
  test("basic query test", async () => {
    await t.run(async (ctx) => {
      const result = await ctx.query(api.myQuery.default);
      expect(result).toBeDefined();
    });
  });
});
```

### Schema Import

```typescript
// ✅ CORRECT: Always pass schema to convexTest
import schema from "./schema";
const t = convexTest(schema);

// ❌ WRONG: Missing schema
const t = convexTest();  // Will fail with schema validation errors
```

## Testing Queries

### Basic Query Test

```typescript
test("query returns expected data", async () => {
  await t.run(async (ctx) => {
    // Insert test data first
    await ctx.db.insert("users", {
      name: "Test User",
      email: "test@example.com"
    });

    // Run the query
    const result = await ctx.query(api.users.list);

    // Assert results
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Test User");
  });
});
```

### Query with Arguments

```typescript
test("query with args", async () => {
  await t.run(async (ctx) => {
    const user_id = await ctx.db.insert("users", { name: "Test" });

    const result = await ctx.query(api.users.getById, { id: user_id });

    expect(result).toBeDefined();
    expect(result?.name).toBe("Test");
  });
});
```

## Testing Mutations

### Basic Mutation Test

```typescript
test("mutation creates record", async () => {
  await t.run(async (ctx) => {
    // Execute mutation
    const result = await ctx.mutation(api.users.create, {
      name: "New User",
      email: "new@example.com"
    });

    // Verify result
    expect(result).toBeDefined();

    // Verify database state
    const user = await ctx.db.get(result);
    expect(user?.name).toBe("New User");
  });
});
```

### Mutation with Side Effects

```typescript
test("mutation updates related records", async () => {
  await t.run(async (ctx) => {
    // Setup: Create initial data
    const user_id = await ctx.db.insert("users", { name: "User", count: 0 });

    // Execute mutation
    await ctx.mutation(api.users.incrementCount, { user_id });

    // Verify side effect
    const updated = await ctx.db.get(user_id);
    expect(updated?.count).toBe(1);
  });
});
```

## Testing Actions

### Basic Action Test

```typescript
test("action executes correctly", async () => {
  await t.run(async (ctx) => {
    const result = await ctx.action(api.external.fetchData, {
      url: "https://api.example.com/data"
    });

    expect(result).toBeDefined();
  });
});
```

### Action with Mocked External Calls

```typescript
// Mock external fetch before tests
vi.mock("convex/server", async (importOriginal) => {
  const actual = await importOriginal<typeof import("convex/server")>();
  return {
    ...actual,
    // Mock as needed
  };
});

test("action with mocked external", async () => {
  await t.run(async (ctx) => {
    // Test with mocked external services
    const result = await ctx.action(api.external.syncData);
    expect(result.success).toBe(true);
  });
});
```

## Database Operations in Tests

### Direct Database Access

```typescript
test("database operations", async () => {
  await t.run(async (ctx) => {
    // Insert
    const id = await ctx.db.insert("users", { name: "Test" });

    // Get by ID
    const user = await ctx.db.get(id);
    expect(user?.name).toBe("Test");

    // Query with index
    const users = await ctx.db
      .query("users")
      .withIndex("by_name", (q) => q.eq("name", "Test"))
      .collect();
    expect(users).toHaveLength(1);

    // Patch
    await ctx.db.patch(id, { name: "Updated" });

    // Delete
    await ctx.db.delete(id);
    const deleted = await ctx.db.get(id);
    expect(deleted).toBeNull();
  });
});
```

### Working with Indexes

```typescript
test("query with compound index", async () => {
  await t.run(async (ctx) => {
    await ctx.db.insert("messages", {
      channel_id: "ch1",
      author: "user1",
      text: "Hello"
    });

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_channel_and_author", (q) =>
        q.eq("channel_id", "ch1").eq("author", "user1")
      )
      .order("desc")
      .take(10);

    expect(messages).toHaveLength(1);
  });
});
```

## Authentication Testing

### Testing with Authenticated User

```typescript
test("authenticated query", async () => {
  await t.run(async (ctx) => {
    // Create a user for auth context
    const user_id = await ctx.db.insert("users", {
      name: "Auth User",
      email: "auth@example.com"
    });

    // Run as authenticated user using Convex Auth patterns
    // Note: Exact implementation depends on your auth setup
    const result = await ctx.query(api.users.getMe);

    expect(result).toBeDefined();
  });
});
```

### Testing Authorization

```typescript
test("unauthorized access throws", async () => {
  await t.run(async (ctx) => {
    // Attempt to access protected resource without auth
    await expect(
      ctx.query(api.admin.sensitiveData)
    ).rejects.toThrow("Not authenticated");
  });
});
```

## Test Isolation

### Fresh Database Per Test

```typescript
describe("UserService", () => {
  // Each test in t.run gets isolated database
  test("test 1", async () => {
    await t.run(async (ctx) => {
      await ctx.db.insert("users", { name: "User 1" });
      const users = await ctx.db.query("users").collect();
      expect(users).toHaveLength(1);
    });
  });

  test("test 2", async () => {
    await t.run(async (ctx) => {
      // Database is empty - previous test's data is isolated
      const users = await ctx.db.query("users").collect();
      expect(users).toHaveLength(0);
    });
  });
});
```

### Shared Setup

```typescript
describe("With shared data", () => {
  test("multiple operations in one context", async () => {
    await t.run(async (ctx) => {
      // All operations share the same transactional context
      const user_id = await ctx.db.insert("users", { name: "Test" });
      await ctx.db.insert("posts", { user_id, title: "Post 1" });
      await ctx.db.insert("posts", { user_id, title: "Post 2" });

      const posts = await ctx.db
        .query("posts")
        .withIndex("by_user", (q) => q.eq("user_id", user_id))
        .collect();

      expect(posts).toHaveLength(2);
    });
  });
});
```

## Testing Validators

### Input Validation

```typescript
test("mutation validates input", async () => {
  await t.run(async (ctx) => {
    // Test invalid input is rejected
    await expect(
      ctx.mutation(api.users.create, {
        name: "",  // Invalid: empty name
        email: "not-an-email"  // Invalid: bad email format
      })
    ).rejects.toThrow();
  });
});
```

## Scheduled Functions

### Testing Scheduled Functions

```typescript
test("scheduled function executes", async () => {
  await t.run(async (ctx) => {
    // Schedule a function
    await ctx.scheduler.runAfter(0, api.jobs.processQueue, {});

    // Run all scheduled functions
    await t.finishAllScheduledFunctions(ctx);

    // Verify the scheduled function's effects
    const processed = await ctx.db.query("jobs").collect();
    expect(processed.every((j) => j.status === "processed")).toBe(true);
  });
});
```

## Anti-Patterns to Avoid

### ❌ Direct Database Access Outside t.run

```typescript
// ❌ WRONG: Database access outside test context
const t = convexTest(schema);
await t.db.insert("users", { name: "Test" });  // Error!

// ✅ CORRECT: Always use t.run
await t.run(async (ctx) => {
  await ctx.db.insert("users", { name: "Test" });
});
```

### ❌ Missing Schema

```typescript
// ❌ WRONG: convexTest without schema
const t = convexTest();

// ✅ CORRECT: Always provide schema
import schema from "./schema";
const t = convexTest(schema);
```

### ❌ Not Using ctx for Database Operations

```typescript
// ❌ WRONG: Using db directly
test("wrong pattern", async () => {
  await t.run(async (ctx) => {
    const result = await db.query("users").collect();  // Wrong!
  });
});

// ✅ CORRECT: Use ctx.db
test("correct pattern", async () => {
  await t.run(async (ctx) => {
    const result = await ctx.db.query("users").collect();  // Correct!
  });
});
```

### ❌ Expecting Data to Persist Between Tests

```typescript
// ❌ WRONG: Assuming data persists
test("test 1", async () => {
  await t.run(async (ctx) => {
    await ctx.db.insert("users", { name: "Persisted?" });
  });
});

test("test 2", async () => {
  await t.run(async (ctx) => {
    // This will be empty! Data doesn't persist between t.run calls
    const users = await ctx.db.query("users").collect();
    expect(users).toHaveLength(1);  // FAILS!
  });
});
```

## Integration with Vitest

### Recommended Configuration

```typescript
// vitest.config.ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    testTimeout: 30000,  // Convex tests may need longer timeouts
    hookTimeout: 30000,
    globals: true,
    include: ["convex/**/*.test.ts"],
  },
});
```

### Test File Location

```
convex/
├── _generated/
├── schema.ts
├── users.ts
├── users.test.ts  # Co-located tests
├── posts.ts
└── posts.test.ts
```
