# Task: health-3 - Create /api/health/ready Database Check

**Spec:** Docker VPS Deployment Infrastructure
**Phase:** Health Checks & Monitoring (TDD GREEN)
**Status:** Not Started
**Assigned Agent:** backend-nodejs-specialist
**Estimated Time:** 30 minutes
**Dependencies:** health-2

---

## Description

Implement readiness check endpoint that validates database connectivity and application readiness to serve traffic. Returns 200 when ready, 503 when not ready.

---

## Specifics

**File location:** `/home/edwin/development/ptnextjs/app/api/health/ready/route.ts`

**Endpoint:** `GET /api/health/ready`

**Behavior:**
- Returns HTTP 200 if database connected and app ready
- Returns HTTP 503 if database unavailable
- Tests actual database connectivity
- Includes connection response time
- Timeout after 1 second
- No authentication required

**Response format (success):**
```json
{
  "status": "ready",
  "timestamp": "2025-11-06T12:34:56.789Z",
  "database": {
    "connected": true,
    "responseTime": 45
  },
  "services": {
    "payload": true
  }
}
```

**Response format (failure):**
```json
{
  "status": "unavailable",
  "timestamp": "2025-11-06T12:34:56.789Z",
  "database": {
    "connected": false,
    "error": "Connection timeout"
  }
}
```

---

## Acceptance Criteria

- [ ] Route file created at correct location
- [ ] GET handler implemented
- [ ] Tests database connectivity
- [ ] Returns 200 when database connected
- [ ] Returns 503 when database unavailable
- [ ] Includes connection response time
- [ ] Timeout handling (1 second)
- [ ] Error handling for connection failures
- [ ] Works with Payload CMS database
- [ ] Integration tests (health-1) pass
- [ ] Compatible with Kubernetes readiness probes

---

## Testing Requirements

```bash
# Manual testing - database up
npm run dev
curl http://localhost:3000/api/health/ready

# Manual testing - database down
docker-compose stop db
curl http://localhost:3000/api/health/ready
# Expected: 503 status
docker-compose start db

# Integration tests
npm run test:integration -- health-checks.test.ts

# Docker testing
docker-compose up -d
docker-compose exec app wget -O- http://localhost:3000/api/health/ready
```

---

## Implementation Notes

```typescript
// app/api/health/ready/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@/payload.config';

export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Get Payload instance
    const payload = await getPayload({ config });

    // Test database connectivity with timeout
    const dbStart = Date.now();
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Database timeout')), 1000)
    );

    // Simple query to test connection
    const dbCheckPromise = payload.db.connect().then(() => {
      return payload.find({
        collection: 'users',
        limit: 1,
        depth: 0,
      });
    });

    await Promise.race([dbCheckPromise, timeoutPromise]);

    const dbResponseTime = Date.now() - dbStart;

    const response = {
      status: 'ready',
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        responseTime: dbResponseTime,
      },
      services: {
        payload: true,
      },
    };

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Response-Time': `${Date.now() - startTime}ms`,
      },
    });

  } catch (error) {
    const response = {
      status: 'unavailable',
      timestamp: new Date().toISOString(),
      database: {
        connected: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    };

    return NextResponse.json(response, {
      status: 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Response-Time': `${Date.now() - startTime}ms`,
      },
    });
  }
}
```

**Key features:**
- Actual database query (not just connection test)
- 1-second timeout protection
- Response time tracking
- Proper error handling
- 503 status for unavailability
- Compatible with Kubernetes readiness probes

**Database connectivity test:**
- Use Payload CMS connection
- Execute lightweight query (users collection, limit 1)
- Race against timeout
- Measure response time

**Error scenarios:**
1. Database connection timeout
2. Database query failure
3. Payload CMS initialization failure
4. Network connectivity issues

---

## Next Steps

After implementation:
1. Test with database up
2. Test with database down
3. Verify integration tests pass
4. Proceed to health-4 (Docker HEALTHCHECK config)
