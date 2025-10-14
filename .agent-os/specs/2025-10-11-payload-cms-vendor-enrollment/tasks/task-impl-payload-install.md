# Task: impl-payload-install - Install and Configure Payload CMS 3+

## Task Metadata
- **Task ID**: impl-payload-install
- **Phase**: Phase 2: Backend Implementation
- **Agent**: backend-nodejs-specialist
- **Estimated Time**: 30-40 minutes
- **Dependencies**: [test-backend]
- **Status**: [ ] Not Started

## Task Description
Install Payload CMS 3+ with SQLite adapter for development and PostgreSQL adapter for production. Configure Payload with Next.js App Router integration and set up basic configuration file.

## Specifics
- **Packages to Install**:
  - `payload@^3.0.0` - Core Payload CMS package
  - `@payloadcms/db-sqlite@^3.0.0` - SQLite adapter for development
  - `@payloadcms/db-postgres@^3.0.0` - PostgreSQL adapter for production
  - `@payloadcms/next@^3.0.0` - Next.js integration
  - `better-sqlite3@^11.0.0` - SQLite native bindings
  - `pg@^8.11.0` - PostgreSQL client
- **Files to Create**:
  - `/home/edwin/development/ptnextjs/payload.config.ts` - Main Payload configuration
  - `/home/edwin/development/ptnextjs/.env.local` - Environment variables (SQLite path, JWT secret)
  - `/home/edwin/development/ptnextjs/.env.production` - Production database configuration
- **Configuration Requirements**:
  - Enable SQLite in development (file: `./data/payload.db`)
  - Enable PostgreSQL in production (env: DATABASE_URL)
  - Configure JWT secret for authentication
  - Set up admin user collection
  - Configure media storage (local filesystem for now)
  - Set up Next.js App Router integration

## Acceptance Criteria
- [ ] All Payload CMS packages installed successfully
- [ ] `payload.config.ts` created with SQLite and PostgreSQL adapters
- [ ] Environment variables configured for both development and production
- [ ] Development server starts with Payload CMS admin accessible at `/admin`
- [ ] SQLite database file created automatically on first run
- [ ] Admin panel accessible and functional
- [ ] No build errors or dependency conflicts
- [ ] TypeScript types generated for Payload CMS

## Testing Requirements
- **Functional Testing**:
  - Run `npm run dev` and verify no errors
  - Access `/admin` route and verify Payload admin panel loads
  - Create test admin user via Payload CLI or seed script
  - Verify SQLite database file created in `./data/` directory
- **Manual Verification**:
  - Check package.json for correct Payload versions
  - Verify TypeScript compilation passes
  - Confirm environment variables loaded correctly

## Evidence Required
- Screenshot of successful Payload admin panel at `/admin`
- Terminal output showing successful development server start
- Contents of `payload.config.ts` file

## Context Requirements
- Integration Strategy from task pre-2
- Payload CMS 3.x installation documentation
- Next.js 14 App Router structure
- Environment variable management patterns

## Implementation Notes
- Use SQLite for zero-configuration local development
- PostgreSQL configuration can remain dormant until production deployment
- Ensure JWT secret is strong and stored in environment variables
- Follow Payload CMS 3.x Next.js App Router integration guide
- Set up TypeScript paths for Payload imports if needed

## Quality Gates
- [ ] Zero TypeScript errors after installation
- [ ] Zero runtime errors when starting dev server
- [ ] Admin panel fully functional
- [ ] Database connection successful in both dev and prod modes

## Related Files
- Technical Spec: `/home/edwin/development/ptnextjs/.agent-os/specs/2025-10-11-payload-cms-vendor-enrollment/sub-specs/technical-spec.md`
- Test Plan: (output from task test-backend)
