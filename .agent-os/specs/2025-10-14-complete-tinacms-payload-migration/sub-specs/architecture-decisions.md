# Architecture Decisions

This is the architecture decisions document for the spec detailed in @.agent-os/specs/2025-10-14-complete-tinacms-payload-migration/spec.md

## Overview

This document records key architectural decisions made during the TinaCMS to Payload CMS migration, providing context, rationale, and trade-offs for future reference.

---

## ADR-001: Database-Backed CMS vs File-Based CMS

**Status**: Accepted
**Date**: 2025-10-14
**Context**:

The platform currently uses TinaCMS, a Git-based CMS storing content as markdown files. To enable vendor self-service and dynamic content management, we need a database-backed CMS.

**Decision**:

Migrate from TinaCMS (file-based) to Payload CMS 3+ (database-backed) using PostgreSQL for production and SQLite for development.

**Rationale**:

**Advantages**:
- **Vendor Self-Service**: Database enables user accounts, authentication, and role-based access control for vendor profile management
- **Real-Time Updates**: Changes reflect immediately without Git commits or deployments
- **Scalability**: Database handles thousands of records more efficiently than file system
- **Complex Queries**: Relational database enables filtering, searching, and relationship queries
- **Concurrent Access**: Multiple users can edit content simultaneously
- **Performance**: Indexed database queries faster than parsing markdown files

**Disadvantages**:
- **Complexity**: Database hosting and management required
- **Migration Effort**: One-time migration effort to move existing content
- **Infrastructure**: Additional server requirements (database hosting)

**Alternatives Considered**:
1. **Keep TinaCMS**: Simple, but cannot support vendor self-service
2. **Headless CMS (Contentful, Strapi)**: Viable but Payload CMS provides better Next.js integration and self-hosting control

**Consequences**:
- Need PostgreSQL hosting for production
- Development workflow changes (database instead of markdown files)
- Enables future features (vendor dashboard, user management, dynamic content)

---

## ADR-002: Payload CMS 3+ as CMS Platform

**Status**: Accepted
**Date**: 2025-10-14
**Context**:

Need a database-backed CMS that integrates well with Next.js 14, supports complex data structures, and provides built-in authentication.

**Decision**:

Use Payload CMS 3+ as the content management system.

**Rationale**:

**Advantages**:
- **Next.js Native**: Built specifically for Next.js applications
- **Self-Hosted**: Full control over data and infrastructure
- **TypeScript**: Type-safe CMS configuration and API
- **Built-in Auth**: JWT-based authentication with role-based access control
- **Flexible Schema**: Supports complex nested structures (arrays, groups, relationships)
- **REST & GraphQL**: Both API options available
- **Admin UI**: Professional, customizable admin interface
- **Database Agnostic**: Works with PostgreSQL, SQLite, MongoDB
- **Active Development**: Regular updates and strong community support

**Disadvantages**:
- **Self-Hosting**: Requires managing own infrastructure (vs hosted solutions)
- **Learning Curve**: Team needs to learn Payload-specific patterns
- **Version 3.0**: Newer version may have fewer resources than v2

**Alternatives Considered**:
1. **Strapi**: Popular but less Next.js integration, heavier resource usage
2. **Contentful**: SaaS, expensive for growing content volume
3. **Sanity**: Strong option but more complex pricing, different data model
4. **Custom CMS**: Too much development effort, not core business value

**Consequences**:
- Team learns Payload CMS patterns and best practices
- Infrastructure setup for Payload admin interface
- Tight integration with Next.js simplifies development

---

## ADR-003: PostgreSQL for Production, SQLite for Development

**Status**: Accepted
**Date**: 2025-10-14
**Context**:

Payload CMS supports multiple databases. Need to choose database for development and production environments.

**Decision**:

Use SQLite for local development and PostgreSQL 17+ for production.

**Rationale**:

**SQLite for Development**:
- **Zero Configuration**: File-based database, no server setup required
- **Fast Local Development**: Quick iterations without network latency
- **Simple Backup**: Copy `.db` file for backup/restore
- **Portable**: Works on all developer machines without external dependencies

**PostgreSQL for Production**:
- **Proven Scalability**: Handles high traffic and large datasets
- **JSONB Support**: Efficient storage and querying of complex nested data
- **Full-Text Search**: Built-in search capabilities
- **Advanced Indexing**: Better performance for complex queries
- **Production-Grade**: Industry standard for serious applications
- **Managed Hosting**: Available from AWS RDS, DigitalOcean, Supabase, etc.

**Payload CMS Migration Functions**:
- Same schema definition works for both databases
- Automatic schema synchronization
- No code changes needed when switching databases

**Consequences**:
- Development environment simple and fast
- Production environment scalable and performant
- Need PostgreSQL hosting for production (additional cost)
- Team needs PostgreSQL knowledge for production troubleshooting

---

## ADR-004: JSONB for Complex Nested Data

**Status**: Accepted
**Date**: 2025-10-14
**Context**:

TinaCMS content has complex nested structures (arrays of certifications, case studies, comparison metrics). Need to decide how to model this in relational database.

**Decision**:

Store complex nested data as JSONB in PostgreSQL rather than creating separate normalized tables for every array field.

**Rationale**:

**Advantages**:
- **Schema Flexibility**: Matches TinaCMS markdown structure closely
- **Migration Simplicity**: Direct mapping from TinaCMS arrays to JSONB arrays
- **Payload Native**: Payload's array and group fields naturally map to JSONB
- **Query Capability**: PostgreSQL JSONB supports indexing and querying
- **Performance**: JSONB stored efficiently with binary format
- **Less Complexity**: Fewer tables and foreign keys to manage

**When JSONB Used**:
- Arrays with multiple fields (certifications, awards, case studies, etc.)
- Grouped data (socialProof, videoIntroduction, pricing configuration)
- Variable-length data (comparison metrics, owner reviews)
- Deeply nested structures (yacht timeline, supplier map)

**When Separate Tables Used**:
- Core relationships (vendor ↔ products, categories ↔ content, tags ↔ content)
- Many-to-many relationships (products_categories, vendors_tags)
- Data frequently queried across records (categories, tags)

**Trade-offs**:
- **JSONB**: Flexible but harder to query relationships across documents
- **Normalized Tables**: Better for relational queries but schema rigidity

**Consequences**:
- JSONB data validated at application layer (Payload hooks)
- Complex queries may require JSONB operators
- Payload admin UI handles JSONB fields naturally (arrays, groups)

---

## ADR-005: Preserve TinaCMS Field Names and Structure

**Status**: Accepted
**Date**: 2025-10-14
**Context**:

When migrating TinaCMS content to Payload, need to decide whether to rename fields or restructure data for "better" database design.

**Decision**:

Preserve TinaCMS field names and data structures as closely as possible in Payload schema.

**Rationale**:

**Advantages**:
- **Minimal Frontend Changes**: Components expect existing field names and structures
- **Simpler Migration**: Direct field mapping reduces migration complexity
- **Backward Compatibility**: Easier to roll back if needed
- **Reduced Risk**: Less chance of data transformation errors
- **Faster Implementation**: No need to update all component code

**Examples**:
- TinaCMS `companyName` → Payload `companyName` (not `name`)
- TinaCMS `certifications` array → Payload `certifications` JSONB array
- TinaCMS `socialProof` object → Payload `socialProof` JSONB group

**Exceptions** (Where Payload requires different structure):
- TinaCMS reference strings → Payload relationship IDs
- TinaCMS media paths → Transformed but stored as text (not Payload upload field)
- TinaCMS rich text → Lexical editor rich text (different internal format but similar output)

**Consequences**:
- Some field names not ideal database names (e.g., `companyName` vs `name`)
- Data structure consistency between old and new systems
- Easier migration and rollback
- PayloadCMSDataService can mimic TinaCMSDataService interface

---

## ADR-006: In-Memory Caching with 5-Minute TTL

**Status**: Accepted
**Date**: 2025-10-14
**Context**:

Static site generation fetches all content at build time. During builds, same data may be fetched multiple times. Need caching strategy to optimize build performance.

**Decision**:

Implement in-memory caching in PayloadCMSDataService with 5-minute TTL, matching TinaCMSDataService caching strategy.

**Rationale**:

**Advantages**:
- **Build Performance**: Reduces redundant Payload API calls during static generation
- **Consistency**: Matches existing TinaCMSDataService caching behavior
- **Simplicity**: No external caching infrastructure required
- **Appropriate TTL**: 5 minutes long enough for build, short enough for fresh data

**Cache Behavior**:
- Cache populated on first request
- Subsequent requests within 5 minutes use cached data
- Cache cleared automatically after TTL expires
- Cache cleared manually on updates (vendor dashboard)

**Not Using**:
- Redis/Memcached: Overkill for build-time caching
- No TTL: Stale data risk during development
- Longer TTL: Content changes wouldn't reflect timely

**Consequences**:
- In-memory cache lost between server restarts (acceptable for build context)
- Cache warming needed for optimal first-request performance
- Manual cache clearing needed for vendor profile updates

---

## ADR-007: Static Site Generation with Payload Data

**Status**: Accepted
**Date**: 2025-10-14
**Context**:

Current site uses static generation with TinaCMS markdown files. Need to decide whether to continue static generation or switch to server-side rendering with Payload.

**Decision**:

Continue static site generation (SSG), fetching data from Payload at build time.

**Rationale**:

**Advantages**:
- **Performance**: Static HTML served instantly, no database queries at request time
- **Scalability**: Serve millions of requests without database load
- **Cost**: No server running for every request, CDN distribution cheap
- **Reliability**: Site works even if database temporarily unavailable
- **SEO**: Pre-rendered HTML optimal for search engines
- **Consistent with Current**: Minimal deployment changes

**Build Process**:
1. Build command runs `npm run build`
2. Next.js fetches all content from Payload API
3. Static HTML generated for all pages
4. Static files deployed to CDN (Vercel, Netlify)

**Incremental Static Regeneration (ISR)**:
- Can be enabled later for frequent updates
- Allows revalidation at specific intervals
- Balances static performance with content freshness

**Trade-offs**:
- **SSG**: Fast but requires rebuild for content updates
- **SSR**: Real-time data but slower page loads, higher server costs
- **ISR**: Hybrid approach, complexity middle-ground

**When Content Updates**:
- Admins trigger rebuild after content changes
- Vendor profile updates trigger rebuild (or use ISR)
- Automated rebuilds on schedule (e.g., daily)

**Consequences**:
- Build time increases with content volume (monitor < 5 minutes target)
- Content changes require rebuild/redeploy (or ISR implementation)
- Optimal performance and cost for content-focused platform

---

## ADR-008: Migration Scripts as One-Time Operation

**Status**: Accepted
**Date**: 2025-10-14
**Context**:

Need to migrate existing TinaCMS markdown content to Payload database. Decide whether migration scripts should be reusable/idempotent or one-time operation.

**Decision**:

Treat migration scripts as one-time operation with backup/rollback capability, not idempotent reusable scripts.

**Rationale**:

**One-Time Operation Approach**:
- Simpler script logic (no need for upsert/duplicate checking)
- Clear migration timeline (before/after cutover)
- Explicit validation before running
- Rollback via database restore (not script reversal)

**Process**:
1. Backup TinaCMS markdown files (tar archive)
2. Backup current Payload database (if exists)
3. Run migration scripts once
4. Validate migration success
5. If success, continue; if failure, restore from backup

**Not Implementing**:
- Idempotent migrations (can run multiple times safely)
- Incremental migrations (sync changes between TinaCMS and Payload)
- Two-way sync (keep TinaCMS and Payload in sync)

**Why**:
- Migration is one-time event
- After migration, TinaCMS deprecated (no new changes)
- Idempotency adds complexity without ongoing value

**Consequences**:
- Migration can only run once per environment
- Re-running requires database wipe
- Clear cutover point from TinaCMS to Payload
- Backup/restore is rollback strategy, not script reversal

---

## Technical Constraints

### Platform Constraints

**Next.js 14.2.5**:
- App Router required (not Pages Router)
- Server Components for data fetching
- Static export for hosting

**Node.js 22 LTS**:
- Required for Payload CMS 3+
- ES modules support
- Latest JavaScript features

**TypeScript 5.2+**:
- Strict mode enabled
- Type safety throughout codebase

### Performance Constraints

**Build Time**: < 5 minutes for full site
**Page Load**: < 2 seconds (LCP)
**API Response**: < 500ms (uncached)
**Database Queries**: < 200ms (complex queries)

### Resource Constraints

**Database**:
- PostgreSQL 17+ for production
- Connection pool: max 20 connections
- JSONB for complex data structures

**Hosting**:
- Vercel/Netlify for static hosting
- Managed PostgreSQL (AWS RDS, DigitalOcean, Supabase)

## Design Principles

### Adopted Principles

1. **Preserve Existing Functionality**: No feature regressions during migration
2. **Minimize Breaking Changes**: Keep data structures compatible
3. **Optimize for Performance**: Static generation, caching, indexed queries
4. **Type Safety First**: TypeScript throughout, strict compilation
5. **Progressive Enhancement**: Enhanced fields additive, not required
6. **Database-Agnostic Development**: SQLite dev, PostgreSQL production via Payload abstractions
7. **Explicit Over Implicit**: Clear field mappings, documented transformations
8. **Fail Fast**: Validation errors during migration, not production

### Architectural Patterns

**Service Layer Pattern**:
- PayloadCMSDataService abstracts Payload API
- Components use service, not direct API calls
- Enables testing and mocking

**Repository Pattern** (via Payload):
- Payload collections act as repositories
- Access control at repository level
- Consistent CRUD operations

**Transformer Pattern**:
- Transform Payload responses to application types
- Centralized transformation logic
- Type-safe transformations

## Technology Choices

### Framework Selection

**Next.js 14**: Industry-standard React framework, excellent static generation
**Payload CMS 3**: Best Next.js integration, self-hosted control, flexible schema
**PostgreSQL 17**: Industry-standard database, JSONB support, managed hosting options
**TypeScript 5**: Type safety, developer experience, catch errors at compile time

### Development Tools

**ESLint**: Code quality enforcement
**Jest**: Unit and integration testing
**Playwright**: E2E browser testing
**Husky**: Git hooks for pre-commit validation

## Consequences & Trade-offs

### Positive Consequences

✅ Vendor self-service enabled
✅ Scalable content management
✅ Real-time content updates possible
✅ Better performance (database queries vs file parsing)
✅ Role-based access control
✅ Professional admin interface

### Negative Consequences

⚠️ Additional infrastructure complexity (database hosting)
⚠️ Migration effort required (one-time cost)
⚠️ Team learning curve for Payload CMS
⚠️ Ongoing database maintenance

### Mitigation Strategies

- **Infrastructure Complexity**: Use managed PostgreSQL (AWS RDS, DigitalOcean)
- **Migration Effort**: Comprehensive migration scripts with validation
- **Learning Curve**: Documentation, code examples, pair programming
- **Database Maintenance**: Automated backups, monitoring, managed service

## Future Considerations

**Possible Future Changes**:
- Switch to Incremental Static Regeneration (ISR) for faster content updates
- Add GraphQL API alongside REST for frontend optimization
- Implement content versioning and drafts (Payload feature)
- Add real-time collaboration in admin interface
- Consider Payload webhooks for automation
- Add full-text search (PostgreSQL or Algolia)

**Not Changing**:
- Payload CMS as primary CMS (committed)
- PostgreSQL as production database (standard)
- Static generation approach (core architecture)
- Type-safe development (principle)
