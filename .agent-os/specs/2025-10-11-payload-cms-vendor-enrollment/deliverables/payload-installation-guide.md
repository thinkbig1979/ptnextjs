# Payload CMS Installation Guide

## Installation Summary

**Status:** ✅ Complete
**Payload CMS Version:** 3.59.1
**Database Adapters:** SQLite (dev), PostgreSQL (prod)

---

## Packages Installed

### Core Packages
- `payload@^3.59.1` - Payload CMS core
- `@payloadcms/next@^3.59.1` - Next.js integration
- `@payloadcms/db-sqlite@^3.59.1` - SQLite database adapter (development)
- `@payloadcms/db-postgres@^3.59.1` - PostgreSQL database adapter (production)

### Database Clients
- `better-sqlite3@^11.10.0` - Native SQLite bindings for Node.js
- `pg@^8.16.3` - PostgreSQL client for Node.js

### Existing Dependencies (Already Installed)
- `gray-matter@^4.0.3` - Markdown parsing for migration scripts
- `bcryptjs@2.4.3` - Password hashing
- `jsonwebtoken@9.0.2` - JWT token generation
- `zod@3.23.8` - Runtime schema validation

---

## Files Created

### Configuration Files

#### `/home/edwin/development/ptnextjs/payload.config.ts`
Main Payload CMS configuration file with:
- SQLite adapter for development (file-based, zero-configuration)
- PostgreSQL adapter for production (scalable, production-ready)
- Admin interface configuration at `/admin`
- JWT authentication configuration
- CORS and CSRF protection
- Rate limiting for security
- TypeScript types generation
- GraphQL schema generation

#### `/home/edwin/development/ptnextjs/payload-config.ts`
Alias file for Payload CMS imports compatibility.

### Environment Configuration

#### `/home/edwin/development/ptnextjs/.env.example`
Updated with Payload CMS environment variables:
- `DATABASE_URL` - Database connection string
- `PAYLOAD_SECRET` - JWT secret key (minimum 32 characters)
- `NEXT_PUBLIC_SERVER_URL` - Server URL for Payload CMS
- `JWT_ACCESS_TOKEN_EXPIRY` - Access token expiry time (1h)
- `JWT_REFRESH_TOKEN_EXPIRY` - Refresh token expiry time (7d)
- `ADMIN_EMAIL` - Default admin email
- `ADMIN_PASSWORD` - Default admin password
- Migration configuration variables

### Next.js App Routes

#### `/home/edwin/development/ptnextjs/app/(payload)/admin/[[...segments]]/page.tsx`
Payload CMS admin interface route handler.
- Accessible at: `http://localhost:3000/admin`
- Handles all admin panel routes
- Integrates with Next.js App Router

#### `/home/edwin/development/ptnextjs/app/(payload)/admin/importMap.ts`
Import map for Payload CMS admin panel customizations.

#### `/home/edwin/development/ptnextjs/app/(payload)/api/[...slug]/route.ts`
Payload CMS REST API route handler.
- Handles all Payload CMS API requests
- Supports GET, POST, PATCH, DELETE methods
- Accessible at: `http://localhost:3000/api/*`

### Directory Structure

```
/home/edwin/development/ptnextjs/
├── payload.config.ts          # Main Payload CMS configuration
├── payload-config.ts          # Alias for imports
├── .env.example               # Environment variable template (updated)
├── tsconfig.json              # TypeScript config (updated with @payload-config path)
├── next.config.js             # Next.js config (updated with Payload notes)
├── data/                      # SQLite database directory (gitignored)
├── app/
│   └── (payload)/
│       ├── admin/
│       │   ├── [[...segments]]/
│       │   │   └── page.tsx   # Admin interface route
│       │   └── importMap.ts   # Import map
│       └── api/
│           └── [...slug]/
│               └── route.ts   # REST API route
└── .gitignore                 # Updated with Payload CMS files
```

---

## Files Modified

### `/home/edwin/development/ptnextjs/package.json`
Added Payload CMS dependencies:
```json
{
  "dependencies": {
    "payload": "^3.59.1",
    "@payloadcms/next": "^3.59.1",
    "@payloadcms/db-sqlite": "^3.59.1",
    "@payloadcms/db-postgres": "^3.59.1",
    "better-sqlite3": "^11.10.0",
    "pg": "^8.16.3"
  }
}
```

### `/home/edwin/development/ptnextjs/.env.example`
Added Payload CMS environment variables (see Configuration Files section above).

### `/home/edwin/development/ptnextjs/next.config.js`
Added notes about Payload CMS compatibility:
- Documented that static export (`output: 'export'`) is incompatible with Payload CMS
- Added instructions to remove `NEXT_OUTPUT_MODE=export` from `.env` when using Payload CMS

### `/home/edwin/development/ptnextjs/tsconfig.json`
Added path alias for Payload CMS config:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"],
      "@payload-config": ["./payload.config.ts"]
    }
  }
}
```

### `/home/edwin/development/ptnextjs/.gitignore`
Added Payload CMS-related entries:
- `data/` - SQLite database directory
- `payload.db` - SQLite database files
- `*.db`, `*.db-shm`, `*.db-wal` - SQLite temporary files
- `payload-types.ts` - Generated TypeScript types
- `generated-schema.graphql` - Generated GraphQL schema
- `migrations/` - Database migration files

---

## Database Configuration

### Development (SQLite)

**Configuration:**
```typescript
// payload.config.ts
db: sqliteAdapter({
  client: {
    url: process.env.DATABASE_URL || 'file:./data/payload.db',
  },
  migrationDir: path.resolve(dirname, 'migrations'),
  push: false, // Don't auto-push schema changes
})
```

**Environment Variable:**
```env
DATABASE_URL=file:./data/payload.db
```

**Benefits:**
- Zero configuration
- File-based database (`./data/payload.db`)
- Perfect for local development
- No external database server required
- Fast and lightweight

### Production (PostgreSQL)

**Configuration:**
```typescript
// payload.config.ts
db: postgresAdapter({
  pool: {
    connectionString: process.env.DATABASE_URL,
    max: 20, // Maximum connection pool size
  },
  migrationDir: path.resolve(dirname, 'migrations'),
})
```

**Environment Variable:**
```env
DATABASE_URL=postgresql://user:password@host:5432/database
```

**Benefits:**
- Scalable and production-ready
- Connection pooling (max 20 connections)
- ACID compliance
- Advanced query optimization
- Supports large datasets

---

## Security Configuration

### JWT Authentication

**Access Token:**
- Expiry: 1 hour
- Stored in httpOnly cookies (XSS protection)

**Refresh Token:**
- Expiry: 7 days
- Enables token rotation

**Secret Key:**
- Minimum 32 characters
- Generate with: `openssl rand -base64 32`
- Store in `PAYLOAD_SECRET` environment variable

### CORS Protection

**Allowed Origins:**
```typescript
cors: [
  'http://localhost:3000',
  'http://localhost:3001',
  process.env.NEXT_PUBLIC_SERVER_URL,
]
```

### CSRF Protection

**Enabled for:**
- State-changing operations (POST, PUT, DELETE)
- SameSite cookie attribute set

### Rate Limiting

**Configuration:**
- 100 requests per 15-minute window per IP
- Trusts X-Forwarded-For header (for proxies)

---

## Next Steps

### Task 4: Create Payload CMS Collection Schemas

The next task (impl-payload-collections) will create 7 Payload CMS collection schemas:

1. **Users** - Authentication with roles (admin, vendor)
2. **Vendors** - Company profiles with tier restrictions
3. **Products** - Product catalog with vendor relationships
4. **Categories** - Hierarchical categories
5. **BlogPosts** - Blog content
6. **TeamMembers** - Team profiles
7. **CompanyInfo** - Company information (singleton)

### Manual Verification Required

After Task 4 completes, you will need to manually verify:

1. **Start Development Server:**
   ```bash
   npm run dev
   ```

2. **Access Payload Admin:**
   - Navigate to: `http://localhost:3000/admin`
   - Verify admin interface loads successfully

3. **Check Collections:**
   - All 7 collections should appear in admin sidebar
   - Verify collection schemas are properly defined

4. **Test Database:**
   - SQLite database should be created at `./data/payload.db`
   - Check database file exists: `ls -lh ./data/`

---

## Troubleshooting

### Issue: "Cannot find module '@payload-config'"

**Solution:** Run TypeScript build:
```bash
npm run build
```

### Issue: "Database connection failed"

**Solution:** Check environment variables:
```bash
cat .env.local
# Verify DATABASE_URL is set correctly
```

### Issue: "Admin interface returns 404"

**Solution:** Verify routes are created:
```bash
ls -la app/\(payload\)/admin/\[\[...segments\]\]/page.tsx
ls -la app/\(payload\)/api/\[...slug\]/route.ts
```

### Issue: "Static export incompatible with Payload CMS"

**Solution:** Remove or comment out in `.env.local`:
```env
# NEXT_OUTPUT_MODE=export
```

---

## Installation Verification Checklist

✅ **Packages Installed**
- [ ] payload@^3.59.1
- [ ] @payloadcms/next@^3.59.1
- [ ] @payloadcms/db-sqlite@^3.59.1
- [ ] @payloadcms/db-postgres@^3.59.1
- [ ] better-sqlite3@^11.10.0
- [ ] pg@^8.16.3

✅ **Configuration Files Created**
- [ ] payload.config.ts (main configuration)
- [ ] payload-config.ts (alias)
- [ ] .env.example (updated with Payload variables)

✅ **Next.js Routes Created**
- [ ] app/(payload)/admin/[[...segments]]/page.tsx
- [ ] app/(payload)/admin/importMap.ts
- [ ] app/(payload)/api/[...slug]/route.ts

✅ **Configuration Updated**
- [ ] tsconfig.json (added @payload-config path)
- [ ] next.config.js (added Payload compatibility notes)
- [ ] .gitignore (added Payload CMS entries)

✅ **Directory Structure**
- [ ] data/ directory created
- [ ] Database files will be gitignored

---

**Document Status:** ✅ Complete
**Installation Status:** ✅ Complete
**Next Action:** Proceed to Task 4 (impl-payload-collections)
**Verification:** Pending user manual verification after Task 4
