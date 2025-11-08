# Integration Tests

This directory contains integration tests for the PTNextJS project.

## Docker Stack Integration Tests

Located in: `tests/integration/docker-stack.test.ts`

### Overview

The Docker Stack Integration tests validate the Docker infrastructure used for containerized deployment. These tests include:

- Container startup and health checks
- Service connectivity and networking
- Data persistence across container restarts
- Environment variable configuration
- Container resource limits
- Health check configuration

Total: **33 tests** across **6 test suites**

### Requirements

- Docker installed and running
- docker-compose available
- Node.js 18+

### Docker Environment Detection

To prevent tests from hanging when Docker is not available, the test suite includes automatic environment detection:

#### How It Works

1. **Environment Check**: At test startup, `isDockerAvailable()` checks if Docker CLI is installed
2. **Conditional Execution**:
   - If Docker is available: Tests run normally
   - If Docker is not available: Tests fail immediately with clear messaging
3. **No Hanging**: Each test includes a `skipIfNoDocker()` guard that prevents Docker operations

#### Running the Tests

```bash
# Run all integration tests
npm run test tests/integration/

# Run only docker-stack tests
npm run test tests/integration/docker-stack.test.ts

# Run docker-stack tests with coverage
npm run test:coverage tests/integration/docker-stack.test.ts
```

#### Output Without Docker

When Docker is not available, you'll see:

```
================================================================================
DOCKER ENVIRONMENT CHECK
================================================================================
Docker is not available in this environment. All Docker Stack Integration tests
will be skipped.

To run these tests, you need to:
1. Install Docker: https://docs.docker.com/get-docker/
2. Ensure Docker daemon is running
3. Verify with: docker --version

If you want to force run these tests anyway (they will timeout), set:
SKIP_DOCKER_TESTS=false
================================================================================
```

All 33 tests will fail immediately (not hang) with the error:
```
Docker is required for: Docker Stack Integration Tests
Please install Docker to run these tests.
...
```

### Docker Detection Utilities

The reusable Docker detection utilities are located in: `tests/utils/docker-utils.ts`

#### Available Functions

```typescript
// Check if Docker CLI is available
isDockerAvailable(): Promise<boolean>

// Check if Docker daemon is running
isDockerRunning(): Promise<boolean>

// Check if docker-compose is available
isDockerComposeAvailable(): Promise<boolean>

// Get helpful error message
getDockerNotAvailableMessage(context: string): string

// Wrap test suites (advanced usage)
describeIfDockerAvailable(name: string, fn: () => void): void

// Wrap individual tests (advanced usage)
itIfDockerAvailable(name: string, fn: Function, timeout?: number): void
```

### Using in Other Tests

To apply Docker environment detection to other tests:

```typescript
import { isDockerAvailable, getDockerNotAvailableMessage } from '../utils/docker-utils';

describe('My Docker Tests', () => {
  let dockerAvailable = false;

  beforeAll(async () => {
    dockerAvailable = await isDockerAvailable();
    if (!dockerAvailable) {
      console.warn(getDockerNotAvailableMessage('My Docker Tests'));
      return;
    }
  });

  it('should test something', async () => {
    if (!dockerAvailable) {
      throw new Error(getDockerNotAvailableMessage('This test'));
    }
    // Test implementation
  });
});
```

### Test Results

#### With Docker Available

```
PASS tests/integration/docker-stack.test.ts (45s)
  Docker Stack Integration
    Container Startup
      ✓ should have Dockerfile at correct location (5ms)
      ✓ should have docker-compose.yml at correct location (3ms)
      ✓ should start application container successfully (12s)
      ✓ should create named volumes (8s)
      ✓ should join external proxy network (5s)
      ✓ should report healthy status within timeout (18s)
    Service Connectivity
      ✓ should respond to HTTP requests on port 3000 (2s)
      ✓ should have health check endpoint accessible (1s)
      ✓ should have database ready check functional (1s)
      ✓ should serve static assets (800ms)
      ✓ should have correct Content-Security-Policy headers (900ms)
    ... (28 more tests)

Test Suites: 1 passed, 1 total
Tests: 33 passed, 33 total
```

#### Without Docker Available

```
FAIL tests/integration/docker-stack.test.ts (2s)
  Docker Stack Integration
    Container Startup
      ✗ should have Dockerfile at correct location
      ✗ should have docker-compose.yml at correct location
      ✗ should start application container successfully
      ... (30 more tests)

Test Suites: 1 failed, 1 total
Tests: 33 failed, 33 total

[Console output includes Docker environment check message]
```

### Troubleshooting

#### Tests are hanging

This should not happen with the environment detection. If it does:

1. Check if Docker is truly unavailable: `docker --version`
2. Run the docker utils test to debug: `npm run test tests/integration/test-docker-utils.ts`
3. Check Docker daemon status: `docker ps`

#### Want to skip docker tests

```bash
# Skip docker-related tests entirely
npm run test --testPathIgnorePatterns=/docker-stack/

# Or run only non-docker tests
npm run test --testPathIgnorePatterns=/integration/
```

#### Docker is installed but tests won't run

```bash
# Verify Docker daemon is running
docker ps

# On Linux
sudo systemctl start docker

# On Mac/Windows
# Ensure Docker Desktop is running
```

### Files

- `docker-stack.test.ts` - Main integration test suite (33 tests)
- `docker-stack-updated.test.ts` - Reference implementation with full Docker detection
- `test-docker-utils.ts` - Tests for the Docker detection utilities
- `../utils/docker-utils.ts` - Docker environment detection utilities
- `INTEGRATION_TESTS_README.md` - This file

### Related Documentation

- `/DOCKER_TESTS_GUIDE.md` - Comprehensive implementation guide
- [Docker Installation](https://docs.docker.com/get-docker/)
- [docker-compose Documentation](https://docs.docker.com/compose/)

### Future Improvements

- [ ] Add Docker Desktop detection for Windows/Mac
- [ ] Support Podman as Docker alternative
- [ ] Pre-test requirement validation
- [ ] Performance metrics reporting
- [ ] CI/CD-specific configurations
