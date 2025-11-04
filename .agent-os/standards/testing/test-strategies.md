# Testing Strategies for Agent OS

## Context

Comprehensive testing standards and strategies for Agent OS projects across all development phases.

## Testing Pyramid

### Unit Tests (70%)
- **Purpose**: Test individual functions and components in isolation
- **Speed**: Fast (milliseconds)
- **Scope**: Single function, class, or component
- **Tools**: Jest, Vitest, Mocha, JUnit

### Integration Tests (20%)
- **Purpose**: Test interactions between multiple components
- **Speed**: Medium (seconds)
- **Scope**: Multiple components working together
- **Tools**: Supertest, TestContainers, Cypress

### End-to-End Tests (10%)
- **Purpose**: Test complete user workflows
- **Speed**: Slow (minutes)
- **Scope**: Full application from user perspective
- **Tools**: Playwright, Cypress, Selenium

## Unit Testing Standards

### Test Structure
```javascript
describe('UserService', () => {
  describe('createUser', () => {
    // Arrange
    const userData = {
      email: 'test@example.com',
      name: 'Test User',
      password: 'password123'
    };

    describe('when valid data is provided', () => {
      it('should create user and return user object', async () => {
        // Act
        const user = await UserService.createUser(userData);

        // Assert
        expect(user).toBeDefined();
        expect(user.email).toBe(userData.email);
        expect(user.name).toBe(userData.name);
        expect(user.password).toBeUndefined(); // Password should be hashed
        expect(user.id).toBeDefined();
        expect(user.created_at).toBeDefined();
      });

      it('should hash password before storing', async () => {
        const user = await UserService.createUser(userData);
        
        const passwordMatch = await bcrypt.compare(userData.password, user.password_hash);
        expect(passwordMatch).toBe(true);
      });
    });

    describe('when invalid data is provided', () => {
      it('should throw validation error for invalid email', async () => {
        const invalidData = { ...userData, email: 'invalid-email' };

        await expect(UserService.createUser(invalidData))
          .rejects.toThrow('VALIDATION_ERROR');
      });

      it('should throw error for duplicate email', async () => {
        await UserService.createUser(userData);

        await expect(UserService.createUser(userData))
          .rejects.toThrow('DUPLICATE_RESOURCE');
      });
    });
  });
});
```

### Mocking and Stubbing
```javascript
// Mock external dependencies
jest.mock('../lib/email', () => ({
  sendWelcomeEmail: jest.fn().mockResolvedValue(true)
}));

jest.mock('../lib/database', () => ({
  query: jest.fn()
}));

describe('UserService with mocks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should send welcome email after user creation', async () => {
    const userData = {
      email: 'test@example.com',
      name: 'Test User',
      password: 'password123'
    };

    // Mock database response
    db.query.mockResolvedValue({
      rows: [{ id: '123', email: userData.email, name: userData.name }]
    });

    await UserService.createUser(userData);

    expect(email.sendWelcomeEmail).toHaveBeenCalledWith(userData.email);
  });
});
```

### Test Coverage Requirements
- **Statement Coverage**: 90% minimum
- **Branch Coverage**: 85% minimum
- **Function Coverage**: 95% minimum
- **Line Coverage**: 90% minimum

```bash
# Generate coverage report
npm run test:coverage

# Check coverage thresholds
npm run test:coverage:check
```

## Integration Testing Standards

### API Integration Tests
```javascript
describe('POST /api/users', () => {
  let app;
  let db;

  beforeAll(async () => {
    app = createTestApp();
    db = await createTestDatabase();
  });

  afterAll(async () => {
    await db.close();
  });

  beforeEach(async () => {
    await db.clear();
  });

  it('should create user and return 201', async () => {
    const userData = {
      email: 'test@example.com',
      name: 'Test User',
      password: 'password123'
    };

    const response = await request(app)
      .post('/api/users')
      .send(userData)
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.data.email).toBe(userData.email);
    expect(response.body.data.password).toBeUndefined();
    
    // Verify user was actually created in database
    const user = await db.users.findById(response.body.data.id);
    expect(user).toBeDefined();
    expect(user.email).toBe(userData.email);
  });

  it('should return 422 for validation errors', async () => {
    const invalidData = {
      email: 'invalid-email',
      name: 'Test User'
    };

    const response = await request(app)
      .post('/api/users')
      .send(invalidData)
      .expect(422);

    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
    expect(response.body.error.details).toHaveLength(1);
    expect(response.body.error.details[0].field).toBe('email');
  });
});
```

### Database Integration Tests
```javascript
describe('UserRepository Integration', () => {
  let db;
  let repository;

  beforeAll(async () => {
    db = await createTestDatabase();
    repository = new UserRepository(db);
  });

  afterAll(async () => {
    await db.close();
  });

  beforeEach(async () => {
    await db.truncate();
  });

  describe('findByEmail', () => {
    it('should find user by email', async () => {
      const userData = {
        email: 'test@example.com',
        name: 'Test User',
        password_hash: 'hashed_password'
      };

      const createdUser = await db.users.insert(userData);
      const foundUser = await repository.findByEmail(userData.email);

      expect(foundUser).toBeDefined();
      expect(foundUser.id).toBe(createdUser.id);
      expect(foundUser.email).toBe(userData.email);
    });

    it('should return null for non-existent email', async () => {
      const user = await repository.findByEmail('nonexistent@example.com');
      expect(user).toBeNull();
    });
  });
});
```

## End-to-End Testing Standards

### User Journey Tests
```javascript
describe('User Registration and Login Journey', () => {
  let page;

  beforeAll(async () => {
    page = await browser.newPage();
  });

  afterAll(async () => {
    await page.close();
  });

  it('should allow user to register, login, and access dashboard', async () => {
    // Navigate to registration page
    await page.goto('/register');

    // Fill registration form
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="name-input"]', 'Test User');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="register-button"]');

    // Should redirect to login page with success message
    await expect(page).toHaveURL('/login');
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();

    // Login with new credentials
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');

    // Should redirect to dashboard
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('[data-testid="user-name"]')).toContainText('Test User');
  });
});
```

### Cross-Browser Testing
```javascript
const browsers = ['chromium', 'firefox', 'webkit'];

describe('Cross-Browser Compatibility', () => {
  browsers.forEach(browserName => {
    describe(`${browserName}`, () => {
      let page;

      beforeAll(async () => {
        page = await browser[browserName].newPage();
      });

      afterAll(async () => {
        await page.close();
      });

      it('should render login form correctly', async () => {
        await page.goto('/login');

        await expect(page.locator('[data-testid="login-form"]')).toBeVisible();
        await expect(page.locator('[data-testid="email-input"]')).toBeVisible();
        await expect(page.locator('[data-testid="password-input"]')).toBeVisible();
        await expect(page.locator('[data-testid="login-button"]')).toBeVisible();
      });
    });
  });
});
```

## Performance Testing Standards

### Load Testing
```javascript
describe('Load Testing', () => {
  it('should handle 100 concurrent users', async () => {
    const concurrentUsers = 100;
    const requests = Array(concurrentUsers).fill().map(() =>
      request(app)
        .get('/api/posts')
        .expect(200)
    );

    const results = await Promise.all(requests);
    
    // All requests should succeed
    results.forEach(response => {
      expect(response.body.success).toBe(true);
    });

    // Response times should be reasonable
    const responseTimes = results.map(r => r.headers['x-response-time']);
    const averageResponseTime = responseTimes.reduce((a, b) => a + b) / responseTimes.length;
    expect(averageResponseTime).toBeLessThan(1000); // 1 second
  });
});
```

### Stress Testing
```javascript
describe('Stress Testing', () => {
  it('should handle memory usage under sustained load', async () => {
    const initialMemory = process.memoryUsage().heapUsed;
    
    // Simulate sustained load
    for (let i = 0; i < 1000; i++) {
      await request(app).get('/api/posts');
    }

    // Force garbage collection
    if (global.gc) {
      global.gc();
    }

    const finalMemory = process.memoryUsage().heapUsed;
    const memoryIncrease = finalMemory - initialMemory;

    // Memory increase should be minimal (< 50MB)
    expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
  });
});
```

## Security Testing Standards

### Authentication Tests
```javascript
describe('Authentication Security', () => {
  it('should reject requests with invalid JWT tokens', async () => {
    const response = await request(app)
      .get('/api/profile')
      .set('Authorization', 'Bearer invalid.token.here')
      .expect(401);

    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('INVALID_TOKEN');
  });

  it('should reject requests with expired tokens', async () => {
    const expiredToken = generateExpiredToken();
    
    const response = await request(app)
      .get('/api/profile')
      .set('Authorization', `Bearer ${expiredToken}`)
      .expect(401);

    expect(response.body.error.code).toBe('TOKEN_EXPIRED');
  });

  it('should enforce rate limiting on auth endpoints', async () => {
    const loginData = {
      email: 'test@example.com',
      password: 'wrongpassword'
    };

    // Make multiple failed login attempts
    for (let i = 0; i < 6; i++) {
      await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(i < 5 ? 401 : 429);
    }

    // Should be rate limited after 5 attempts
    const response = await request(app)
      .post('/api/auth/login')
      .send(loginData)
      .expect(429);

    expect(response.body.error.code).toBe('RATE_LIMIT_EXCEEDED');
  });
});
```

### Input Validation Tests
```javascript
describe('Input Validation Security', () => {
  it('should prevent SQL injection attacks', async () => {
    const maliciousInput = "'; DROP TABLE users; --";

    const response = await request(app)
      .get(`/api/users?search=${encodeURIComponent(maliciousInput)}`)
      .expect(400);

    expect(response.body.error.code).toBe('INVALID_INPUT');
    
    // Verify users table still exists
    await request(app).get('/api/users').expect(200);
  });

  it('should prevent XSS attacks', async () => {
    const xssPayload = '<script>alert("xss")</script>';

    const response = await request(app)
      .post('/api/posts')
      .send({ content: xssPayload })
      .expect(201);

    // Content should be sanitized
    expect(response.body.data.content).not.toContain('<script>');
  });
});
```

## Test Data Management

### Test Data Factories
```javascript
// factories/userFactory.js
const faker = require('faker');

class UserFactory {
  static create(overrides = {}) {
    return {
      email: faker.internet.email(),
      name: faker.name.findName(),
      password: faker.internet.password(8),
      is_active: true,
      ...overrides
    };
  }

  static createMany(count, overrides = {}) {
    return Array(count).fill().map(() => this.create(overrides));
  }

  static async createInDatabase(overrides = {}) {
    const userData = this.create(overrides);
    return await db.users.insert(userData);
  }
}

// Usage in tests
const user = await UserFactory.createInDatabase({ is_active: false });
const users = await Promise.all(
  UserFactory.createMany(5).map(data => UserFactory.createInDatabase(data))
);
```

### Test Database Setup
```javascript
// test/setup.js
const { createTestDatabase } = require('./testDatabase');

beforeAll(async () => {
  global.testDb = await createTestDatabase();
});

afterAll(async () => {
  await global.testDb.close();
});

beforeEach(async () => {
  await global.testDb.truncate();
});
```

## Continuous Integration Testing

### GitHub Actions Configuration
```yaml
# .github/workflows/test.yml
name: Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: testdb
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
    - uses: actions/checkout@v3

    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Run linting
      run: npm run lint

    - name: Run unit tests
      run: npm run test:unit

    - name: Run integration tests
      run: npm run test:integration
      env:
        DATABASE_URL: postgresql://postgres:postgres@localhost:5432/testdb

    - name: Run E2E tests
      run: npm run test:e2e

    - name: Upload coverage reports
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage/lcov.info
```

## Testing Best Practices

### Test Organization
- **Descriptive Names**: Test names should describe what is being tested and what the expected outcome is
- **AAA Pattern**: Arrange, Act, Assert - structure tests clearly
- **Single Responsibility**: Each test should verify one specific behavior
- **Independent Tests**: Tests should not depend on each other

### Test Maintenance
- **Regular Review**: Review and update tests as requirements change
- **Remove Redundancy**: Eliminate duplicate test logic
- **Keep Tests Fast**: Optimize slow tests, consider moving them to integration or E2E suites
- **Documentation**: Document complex test scenarios and setup requirements

### Quality Gates
- **Coverage Thresholds**: Enforce minimum coverage percentages
- **Flaky Test Detection**: Identify and fix unreliable tests
- **Test Performance**: Monitor test execution times
- **Security Testing**: Include security tests in CI/CD pipeline