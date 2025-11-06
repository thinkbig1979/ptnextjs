# Task: core-6 - Update payload.config.ts for PostgreSQL

**Spec:** Docker VPS Deployment Infrastructure
**Phase:** Core Docker Infrastructure (TDD GREEN)
**Status:** Not Started
**Assigned Agent:** backend-nodejs-specialist
**Estimated Time:** 30 minutes
**Dependencies:** core-3

---

## Description

Update Payload CMS configuration to use PostgreSQL database adapter for production Docker deployment while maintaining backward compatibility with SQLite for local development.

---

## Specifics

**File location:** `/home/edwin/development/ptnextjs/payload.config.ts`

**Required changes:**
1. Import PostgreSQL adapter from @payloadcms/db-postgres
2. Configure database adapter conditionally (dev vs production)
3. Use DATABASE_URL environment variable for connection
4. Maintain existing collections and configuration
5. Add database-specific optimizations

**Dependencies:** @payloadcms/db-postgres (already installed per spec)

**Environment-based configuration:**
- Development: SQLite (existing behavior)
- Production: PostgreSQL (new Docker deployment)

---

## Acceptance Criteria

- [ ] payload.config.ts updated with PostgreSQL adapter import
- [ ] Conditional database configuration based on NODE_ENV
- [ ] DATABASE_URL environment variable support added
- [ ] SQLite preserved for local development
- [ ] PostgreSQL used in production environment
- [ ] Configuration validated for TypeScript errors
- [ ] Payload CMS builds successfully
- [ ] Database connection works in both environments
- [ ] Existing collections unchanged
- [ ] Migration path documented for data transfer

---

## Testing Requirements

**Configuration validation:**
```bash
# Verify TypeScript compilation
npm run type-check

# Test SQLite mode (development)
NODE_ENV=development npm run dev
# Expected: Uses SQLite, admin accessible

# Test PostgreSQL mode (requires running DB)
# Start PostgreSQL via Docker Compose
docker-compose up -d db

# Set environment variables
export DATABASE_URL="postgresql://payload:password@localhost:5432/payload"
export NODE_ENV=production

# Build and start application
npm run build
npm run start
# Expected: Connects to PostgreSQL, admin accessible

# Verify connection
curl http://localhost:3000/admin/api
# Expected: Payload API responds

# Clean up
docker-compose down
```

**Integration validation:**
- Docker Compose stack (core-3) should connect successfully
- Health check endpoint should verify database connectivity
- No connection errors in logs

---

## Evidence Requirements

**Completion evidence:**
1. Updated payload.config.ts committed
2. Successful build in both dev and production modes
3. PostgreSQL connection log screenshot
4. Database migration documentation
5. TypeScript validation passing

**Documentation:**
- Configuration explanation with inline comments
- Environment variable requirements
- Migration guide for existing data

---

## Context Requirements

**Required knowledge:**
- Payload CMS database adapter configuration
- PostgreSQL connection strings
- Environment-based configuration patterns
- TypeScript conditional types

**Files to read first:**
```bash
# Read current configuration
cat /home/edwin/development/ptnextjs/payload.config.ts

# Check installed database adapters
npm list | grep db-
```

**Files to reference:**
- Payload CMS PostgreSQL adapter docs
- Spec: `.agent-os/specs/2025-11-06-docker-vps-deployment/spec.md`
- docker-compose.yml (core-3) for connection details

---

## Implementation Notes

**Current configuration analysis needed:**
Read payload.config.ts to identify:
1. Current database adapter (likely SQLite)
2. Database connection configuration
3. Collections and schemas
4. File upload configuration
5. Admin panel settings

**Expected payload.config.ts changes:**

```typescript
import { buildConfig } from 'payload/config';
import { postgresAdapter } from '@payloadcms/db-postgres';
import { sqliteAdapter } from '@payloadcms/db-sqlite';

// Determine database adapter based on environment
const dbAdapter = process.env.NODE_ENV === 'production'
  ? postgresAdapter({
      pool: {
        connectionString: process.env.DATABASE_URL,
      },
    })
  : sqliteAdapter({
      client: {
        url: process.env.DATABASE_URL || 'file:./payload.db',
      },
    });

export default buildConfig({
  // ... existing configuration

  // Update database configuration
  db: dbAdapter,

  // ... rest of configuration
});
```

**Database connection string format:**
```
PostgreSQL: postgresql://user:password@host:port/database
SQLite: file:./payload.db
```

**Environment variables required:**
- `DATABASE_URL` - Full database connection string
- `NODE_ENV` - Environment indicator (development/production)

**PostgreSQL adapter configuration options:**

```typescript
postgresAdapter({
  pool: {
    connectionString: process.env.DATABASE_URL,
    // Optional: Connection pool settings
    max: 20, // Maximum connections
    idleTimeoutMillis: 30000, // Close idle connections after 30s
    connectionTimeoutMillis: 2000, // Wait 2s for connection
  },
  // Optional: Schema name
  schemaName: 'public',
  // Optional: Push schema changes (dev only)
  push: process.env.NODE_ENV === 'development',
})
```

**Migration strategy:**

1. **Schema migration:** Payload CMS auto-migrates schema on startup
2. **Data migration:** Requires manual migration script (separate task)
3. **Development workflow:** Continue using SQLite locally
4. **Production deployment:** PostgreSQL in Docker

**Important considerations:**

1. **Connection pooling:**
   - PostgreSQL uses connection pools
   - Configure max connections based on VPS resources
   - Default pool size: 20 connections

2. **Schema management:**
   - Payload CMS creates tables automatically
   - Initial startup may take longer (schema creation)
   - Set `push: false` in production (don't auto-migrate)

3. **Backward compatibility:**
   - Development unchanged (still uses SQLite)
   - Production uses PostgreSQL
   - No code changes in collections required

4. **File uploads:**
   - Database stores metadata only
   - Files stored in media-uploads volume (Docker)
   - Verify upload path configuration

**Common pitfalls:**

- Don't hardcode database credentials
- Don't commit DATABASE_URL to git
- Do validate connection string format
- Do test connection on startup
- Do implement retry logic for connection failures

**Connection error handling:**

```typescript
// Consider adding connection validation
const validateDatabaseConnection = async () => {
  try {
    // Payload CMS handles connection internally
    // This is handled by health check endpoint (health-3)
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
};
```

**Testing checklist:**

- [ ] SQLite works in development (NODE_ENV=development)
- [ ] PostgreSQL works in production (NODE_ENV=production)
- [ ] Environment variable validation works
- [ ] Admin panel accessible in both modes
- [ ] Collections load correctly
- [ ] File uploads work
- [ ] API endpoints respond

---

## Next Steps

After completing this task:
1. Test both SQLite and PostgreSQL modes
2. Document environment variable requirements
3. Create data migration script (if needed)
4. Proceed to core-7 (.env.production.example)

**Critical path task:** Database configuration must work before Docker stack can be fully operational. Verify thoroughly before proceeding.
