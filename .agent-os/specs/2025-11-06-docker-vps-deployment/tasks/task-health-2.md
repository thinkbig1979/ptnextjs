# Task: health-2 - Create /api/health Basic Endpoint

**Spec:** Docker VPS Deployment Infrastructure
**Phase:** Health Checks & Monitoring (TDD GREEN)
**Status:** Not Started
**Assigned Agent:** backend-nodejs-specialist
**Estimated Time:** 20 minutes
**Dependencies:** health-1

---

## Description

Implement basic health check endpoint that returns application status without database checks. Used by Docker HEALTHCHECK for lightweight container health monitoring.

---

## Specifics

**File location:** `/home/edwin/development/ptnextjs/app/api/health/route.ts`

**Endpoint:** `GET /api/health`

**Behavior:**
- Always returns HTTP 200 if app is running
- Returns JSON with status, timestamp, uptime
- No database checks (lightweight)
- Response time < 100ms
- No authentication required

**Response format:**
```json
{
  "status": "ok",
  "timestamp": "2025-11-06T12:34:56.789Z",
  "uptime": 12345,
  "environment": "production"
}
```

---

## Acceptance Criteria

- [ ] Route file created at correct location
- [ ] GET handler implemented
- [ ] Returns HTTP 200 status
- [ ] Returns JSON content-type
- [ ] Includes all required fields
- [ ] Response time < 100ms
- [ ] No database connectivity check
- [ ] Works in Next.js App Router
- [ ] Integration tests (health-1) pass for this endpoint
- [ ] Docker HEALTHCHECK compatible

---

## Testing Requirements

```bash
# Manual testing
npm run dev
curl http://localhost:3000/api/health

# Integration tests
npm run test:integration -- health-checks.test.ts

# Docker testing
docker-compose up -d
docker-compose exec app wget -O- http://localhost:3000/api/health
```

---

## Implementation Notes

```typescript
// app/api/health/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const startTime = process.hrtime.bigint();

  const response = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    environment: process.env.NODE_ENV || 'production',
  };

  const endTime = process.hrtime.bigint();
  const duration = Number(endTime - startTime) / 1_000_000; // Convert to ms

  return NextResponse.json(response, {
    status: 200,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'X-Response-Time': `${duration.toFixed(2)}ms`,
    },
  });
}
```

**Key points:**
- No async operations (fast response)
- Process uptime via process.uptime()
- ISO timestamp format
- No-cache headers for accurate checks
- Response time header for monitoring

---

## Next Steps

After implementation:
1. Test endpoint manually
2. Verify integration tests pass
3. Test in Docker container
4. Proceed to health-3 (readiness endpoint)
