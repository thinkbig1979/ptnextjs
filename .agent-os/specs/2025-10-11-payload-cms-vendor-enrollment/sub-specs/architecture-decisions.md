# Architecture Decisions

This is the architecture decisions record for the spec detailed in @.agent-os/specs/2025-10-11-payload-cms-vendor-enrollment/spec.md

## Architectural Decision Records

### ADR-001: Adopt Payload CMS for Content Management

**Date**: 2025-10-11
**Status**: Accepted
**Decision Makers**: Development Lead, Product Owner

**Context**:
The current TinaCMS implementation uses markdown files for content storage, which does not support:
- Vendor self-service enrollment (requires authentication and user management)
- Tiered subscription model (requires field-level permissions)
- Dynamic content management (requires database-backed storage)
- Scalability for 1000+ vendors (file system limitations)

**Decision**:
Adopt Payload CMS 2.x as the content management system, backed by PostgreSQL database.

**Rationale**:
- **Built-in Authentication**: Payload CMS provides user authentication out of the box, reducing custom development
- **Access Control**: Field-level and collection-level permissions support tiered subscription model
- **Database-Backed**: PostgreSQL provides scalability, ACID transactions, and relational data integrity
- **TypeScript-First**: Full TypeScript support aligns with existing tech stack
- **Next.js Integration**: Official Next.js integration (@payloadcms/next) for seamless App Router compatibility
- **Developer Experience**: Local API provides type-safe data access, no REST API overhead for internal operations

**Consequences**:
- **Positive**:
  - Vendor self-enrollment enabled
  - Tiered access control implementable
  - Scalable to 10,000+ vendors
  - Better performance for data-heavy operations
  - Transactional integrity for multi-table operations
- **Negative**:
  - Migration effort required (TinaCMS → Payload CMS)
  - Learning curve for Payload CMS admin interface
  - Additional infrastructure (PostgreSQL database hosting)
  - Increased operational complexity (database backups, monitoring)

**Alternatives Considered**:
- **Strapi**: Popular headless CMS, but less TypeScript-focused, larger bundle size
- **Sanity**: Excellent developer experience, but proprietary cloud dependency, cost scaling
- **Custom Solution**: Full control, but high development cost, maintenance burden

---

### ADR-002: Use SQLite for Development, PostgreSQL for Production

**Date**: 2025-10-11
**Status**: Accepted
**Decision Makers**: Development Lead, DBA

**Context**:
Payload CMS 3+ supports multiple database adapters (PostgreSQL, SQLite, MongoDB). Need to choose database strategy that balances development simplicity with production scalability.

**Decision**:
Use SQLite for local development, PostgreSQL for production deployment, with Payload CMS migrations for schema portability.

**Rationale**:
- **Development Simplicity**: SQLite requires zero configuration, file-based, perfect for local dev
- **Production Scalability**: PostgreSQL provides enterprise-grade performance, concurrent users, replication
- **Schema Portability**: Payload CMS 3 migration functions abstract database differences, enabling seamless migration
- **Relational Data Model**: Both SQLite and PostgreSQL are relational, vendor-product relationships fit naturally
- **ACID Compliance**: Both databases provide strong transactional guarantees
- **Cost-Effective**: SQLite free and embedded, PostgreSQL open-source with flexible hosting options
- **Development Velocity**: Developers can work locally without external database infrastructure

**Consequences**:
- **Positive**:
  - Instant local development setup (no database server required)
  - Same codebase works for both development and production
  - Payload CMS migrations ensure schema consistency across environments
  - Easy testing with ephemeral SQLite databases
  - Production database can be scaled independently without affecting development
  - Strong data integrity guarantees in both environments
- **Negative**:
  - Must test production migrations against PostgreSQL before deployment
  - SQLite concurrency limitations not representative of production (but acceptable for single-developer local environment)
  - Need to maintain awareness of database-specific features (avoid using PostgreSQL-only features in dev)

**Alternatives Considered**:
- **PostgreSQL Only**: Requires local PostgreSQL server, more complex setup, slower development iteration
- **MongoDB**: Document model doesn't fit relational data structure, lacks foreign key constraints
- **MySQL**: Similar to PostgreSQL, but PostgreSQL has better JSON support and Payload CMS integration

---

### ADR-003: Implement Tiered Access Control at Multiple Layers

**Date**: 2025-10-11
**Status**: Accepted
**Decision Makers**: Development Lead, Security Engineer

**Context**:
Tiered subscription model requires restricting vendor access to features based on subscription tier (free, tier1, tier2). Need to decide where to enforce these restrictions.

**Decision**:
Implement tier restrictions at three layers: UI (React components), API (middleware), and Database (Payload CMS access control functions).

**Rationale**:
- **Defense in Depth**: Multiple enforcement layers prevent bypassing restrictions
- **User Experience**: UI-level restrictions provide immediate feedback (TierGate component)
- **Security**: API-level and database-level restrictions prevent unauthorized access even if UI compromised
- **Flexibility**: Different layers serve different purposes (UX, security, data integrity)

**Consequences**:
- **Positive**:
  - Robust security, cannot bypass tier restrictions via API calls or direct database access
  - Good UX, users see appropriate features without trial-and-error
  - Maintainable, tier logic centralized in reusable components and middleware
- **Negative**:
  - Code duplication across layers (tier logic in UI, API, database)
  - Maintenance overhead, tier changes require updates in multiple places
  - Testing complexity, must test each layer independently

**Alternatives Considered**:
- **API-Only Enforcement**: Simpler, but poor UX (users see features they can't use)
- **Database-Only Enforcement**: Maximum security, but no early feedback to users

---

### ADR-004: Use JWT Tokens in httpOnly Cookies for Authentication

**Date**: 2025-10-11
**Status**: Accepted
**Decision Makers**: Development Lead, Security Engineer

**Context**:
Need secure authentication mechanism for vendor and admin users. Must protect against XSS and CSRF attacks.

**Decision**:
Use JWT (JSON Web Tokens) for stateless authentication, stored in httpOnly cookies.

**Rationale**:
- **Stateless**: No server-side session storage, reduces infrastructure complexity
- **Scalable**: Horizontal scaling easier with stateless tokens
- **httpOnly Cookies**: XSS protection, JavaScript cannot access tokens
- **Short-Lived Access Tokens**: 1-hour expiry reduces risk of token theft
- **Refresh Tokens**: 7-day expiry enables long sessions without security compromise

**Consequences**:
- **Positive**:
  - XSS protection via httpOnly cookies
  - Stateless authentication, no session database required
  - Horizontal scaling without shared session store
  - Standard approach, well-understood security model
- **Negative**:
  - Token revocation challenging (requires blacklist or short expiry)
  - Refresh token rotation adds complexity
  - Cookie-based auth requires CSRF protection (SameSite=Lax/Strict)

**Alternatives Considered**:
- **Session-Based Auth**: Requires server-side session store (Redis), adds infrastructure complexity
- **LocalStorage Tokens**: Vulnerable to XSS attacks, insecure for authentication

---

### ADR-005: Migrate All Content in Single "Big Bang" Cutover

**Date**: 2025-10-11
**Status**: Accepted
**Decision Makers**: Development Lead, Product Owner

**Context**:
Need to decide between phased migration (content types migrated incrementally) or big bang migration (all content migrated at once).

**Decision**:
Perform big bang migration: all TinaCMS content migrated to Payload CMS in single cutover event.

**Rationale**:
- **Simplicity**: Avoid dual content management (TinaCMS + Payload CMS running in parallel)
- **Data Consistency**: No synchronization issues between two systems
- **Faster Delivery**: Phased migration delays full feature availability
- **User Experience**: Users see consistent interface, no confusion about where to edit content

**Consequences**:
- **Positive**:
  - Simplified implementation, no dual system maintenance
  - Consistent user experience after cutover
  - Faster time to full feature availability
  - No data synchronization issues
- **Negative**:
  - Higher risk, all content migrated at once
  - Requires thorough testing and validation
  - Rollback more complex if migration fails
  - Downtime required during migration (mitigated by off-hours deployment)

**Alternatives Considered**:
- **Phased Migration**: Lower risk, but dual system maintenance, longer timeline, synchronization complexity

---

### ADR-006: Use SWR for Frontend Data Fetching

**Date**: 2025-10-11
**Status**: Accepted
**Decision Makers**: Frontend Lead

**Context**:
Need client-side data fetching library for vendor dashboard and public pages. Must support caching, revalidation, optimistic updates.

**Decision**:
Use SWR (stale-while-revalidate) by Vercel for all frontend data fetching.

**Rationale**:
- **Built for Next.js**: Developed by Vercel, excellent Next.js integration
- **Automatic Caching**: 5-minute stale time reduces API calls
- **Revalidation**: Automatic background revalidation keeps data fresh
- **Optimistic Updates**: Built-in support for optimistic UI updates
- **Small Bundle Size**: Lightweight library (< 5KB gzipped)
- **Already Installed**: Existing dependency, no new package needed

**Consequences**:
- **Positive**:
  - Reduced API calls via intelligent caching
  - Better UX with instant navigation (cached data displayed immediately)
  - Optimistic updates for responsive UI
  - Small bundle size impact
- **Negative**:
  - Cache invalidation complexity for related data
  - Stale data displayed briefly (acceptable for this use case)
  - Learning curve for cache management patterns

**Alternatives Considered**:
- **TanStack Query (React Query)**: More powerful, but larger bundle size, additional dependency
- **Apollo Client**: Overkill for REST API (designed for GraphQL)
- **Custom fetch + useState**: More control, but no caching, revalidation, or optimistic updates

---

## Technical Constraints

### Performance Requirements and Limitations

**Response Time Constraints**:
- **API Endpoints**: Must respond in < 500ms (95th percentile) to meet user experience expectations
- **Database Queries**: Must complete in < 500ms to avoid API timeout
- **Page Load**: First Contentful Paint (FCP) < 2 seconds on 4G network
- **Rationale**: Industry standard for SaaS applications, user patience threshold

**Throughput Limitations**:
- **Concurrent Users**: Support 100 simultaneous users without performance degradation
- **API Requests**: Handle 10,000 requests/hour (≈3 req/sec sustained, 10 req/sec burst)
- **Database Connections**: Limited to 20 connections (connection pool size)
- **Rationale**: Based on estimated user base (1000 vendors, 10% active concurrently)

**Resource Constraints**:
- **Memory**: Next.js instances limited to 512MB RAM per Vercel free tier
- **Storage**: PostgreSQL database storage limited to 10GB initial (cost optimization)
- **CPU**: Serverless functions have 10-second execution timeout on Vercel
- **Rationale**: Cost management for MVP, can scale as needed based on usage

### Scalability Constraints and Considerations

**Horizontal Scaling**:
- **Next.js Frontend**: Stateless, can scale horizontally via load balancer (Vercel handles automatically)
- **API Routes**: Stateless serverless functions, scale automatically with request volume
- **Database**: PostgreSQL scales vertically primarily, horizontal scaling (read replicas) deferred to future phase
- **Rationale**: Stateless architecture enables easy horizontal scaling for compute layer

**Vertical Scaling**:
- **Database**: Can upgrade PostgreSQL instance size (CPU, RAM, storage) as data grows
- **Connection Pool**: Can increase connection pool size with larger database instance
- **Rationale**: PostgreSQL vertical scaling sufficient for 10,000+ vendors

**Bottleneck Prevention**:
- **Database Indexes**: Comprehensive indexing on frequently queried fields (email, slug, status, tier)
- **Connection Pooling**: Prevents connection exhaustion under high load
- **Pagination**: All list endpoints paginated (max 100 items per page) to prevent large result sets
- **Caching**: SWR caching on frontend, Payload CMS caching on backend reduce database load

**Future Scaling Considerations**:
- **Read Replicas**: Add PostgreSQL read replicas for read-heavy workloads
- **CDN**: Serve static assets from CDN (Vercel Edge Network)
- **Database Sharding**: Shard vendors table if > 1 million vendors (very unlikely)
- **Background Jobs**: Implement job queue (Bull, Agenda) for async operations (email sending)

### Security Requirements and Restrictions

**Authentication Constraints**:
- **Strong Passwords**: Minimum 12 characters, uppercase, lowercase, number, special character
- **Token Expiry**: Access tokens expire after 1 hour, refresh tokens after 7 days
- **Password Hashing**: Bcrypt with 12 rounds (OWASP recommendation)
- **Rationale**: Balance security and user experience, prevent brute force attacks

**Authorization Constraints**:
- **Role-Based Access**: Only two roles (admin, vendor) to keep authorization simple
- **Tier-Based Features**: Three tiers (free, tier1, tier2) to keep subscription model manageable
- **Resource Ownership**: Vendors can only access their own data (verified by user ID)
- **Rationale**: Simple authorization model reduces complexity, easier to reason about security

**Input Validation Constraints**:
- **Server-Side Validation**: All input validated on server, never trust client-side validation alone
- **Zod Schemas**: Runtime validation ensures data matches TypeScript types
- **SQL Injection Prevention**: Parameterized queries only, no string concatenation
- **XSS Prevention**: React automatic escaping + Content Security Policy headers
- **Rationale**: Defense in depth, prevent common web vulnerabilities

**Data Protection Restrictions**:
- **Sensitive Data**: Passwords never stored in plain text, email addresses masked in logs
- **Audit Logging**: Authentication and authorization events logged for compliance
- **HTTPS Only**: TLS 1.3 enforced in production, HTTP redirected to HTTPS
- **Rationale**: Protect user data, comply with data protection regulations (GDPR, CCPA)

### Resource Constraints and Dependencies

**Infrastructure Dependencies**:
- **Vercel**: Frontend hosting, serverless functions (vendor lock-in acceptable for simplicity)
- **PostgreSQL Hosting**: Vercel Postgres, AWS RDS, or self-hosted (decision deferred)
- **CDN**: Vercel Edge Network for static assets
- **Rationale**: Managed services reduce operational overhead, focus on feature development

**Third-Party Service Dependencies**:
- **Payload CMS**: Open-source, self-hosted (no vendor lock-in)
- **JWT Library**: jsonwebtoken (widely used, MIT license)
- **Bcrypt**: bcrypt (widely used, MIT license)
- **Rationale**: Open-source dependencies reduce costs, avoid vendor lock-in

**Development Tool Dependencies**:
- **Node.js 22 LTS**: Required for Payload CMS and Next.js
- **PostgreSQL 17+**: Required for Payload CMS database adapter
- **TypeScript 5.x**: Required for type safety
- **Rationale**: Modern tooling, long-term support, community adoption

**Operational Constraints**:
- **Backup Frequency**: Daily automated database backups (Vercel Postgres or custom solution)
- **Disaster Recovery**: Point-in-time recovery (PITR) with 7-day retention
- **Monitoring**: Vercel Analytics for frontend, custom APM for backend (optional)
- **Rationale**: Data protection, business continuity, operational visibility

## Design Principles

### Fundamental Design Principles Adopted

**1. Separation of Concerns**:
- **Presentation Layer**: React components (UI only, no business logic)
- **API Layer**: Next.js API routes (request handling, validation)
- **Business Logic Layer**: Service classes (domain logic, data manipulation)
- **Data Access Layer**: Payload CMS local API (database operations)
- **Rationale**: Maintainable, testable, loosely coupled

**2. Defense in Depth**:
- **UI-Level Restrictions**: TierGate component hides restricted features
- **API-Level Restrictions**: Middleware validates permissions before processing
- **Database-Level Restrictions**: Payload CMS access control enforces permissions
- **Rationale**: Multiple security layers, cannot bypass via single attack vector

**3. Don't Repeat Yourself (DRY)**:
- **Shared Types**: TypeScript interfaces shared between frontend and backend
- **Reusable Components**: shadcn/ui components used throughout application
- **Service Layer**: Business logic encapsulated in reusable service methods
- **Rationale**: Reduce code duplication, single source of truth, easier maintenance

**4. Fail Fast**:
- **Input Validation**: Validate immediately at API entry point, reject invalid requests
- **Error Handling**: Throw errors for exceptional cases, don't silently fail
- **Database Constraints**: Enforce data integrity at database level (foreign keys, unique, not null)
- **Rationale**: Catch errors early, prevent cascading failures, easier debugging

**5. Convention Over Configuration**:
- **File Structure**: Next.js App Router conventions (`app/api`, `app/[entity]`)
- **Naming Conventions**: PascalCase for components, camelCase for functions
- **API Response Format**: Standardized `{ success, data, error }` format
- **Rationale**: Consistency, reduced cognitive load, easier onboarding

### Architectural Patterns and Styles Used

**Layered Architecture**:
- **Pattern**: Separation into presentation, API, business logic, data access layers
- **Usage**: Each layer depends only on layers below it, no circular dependencies
- **Benefits**: Maintainable, testable, loosely coupled

**Repository Pattern**:
- **Pattern**: PayloadCMSDataService abstracts database access
- **Usage**: Services call data service methods, never call Payload CMS API directly
- **Benefits**: Decoupled from specific CMS, easier to test, future-proof

**Service Layer Pattern**:
- **Pattern**: Business logic encapsulated in service classes (VendorService, AuthService)
- **Usage**: API routes delegate to services, services contain domain logic
- **Benefits**: Reusable logic, testable without HTTP layer, single responsibility

**Middleware Pattern**:
- **Pattern**: Authentication, authorization, rate limiting as middleware functions
- **Usage**: Middleware wraps API routes, executes before route handler
- **Benefits**: Reusable cross-cutting concerns, DRY, separation of concerns

**Factory Pattern**:
- **Pattern**: Migration scripts use factories to create test data and transform markdown
- **Usage**: `VendorFactory.create()` generates vendor objects with defaults
- **Benefits**: Consistent test data, easy to generate variations, DRY

**Adapter Pattern**:
- **Pattern**: PayloadCMSDataService implements TinaCMSDataService interface
- **Usage**: Frontend code uses same interface, backend swapped from TinaCMS to Payload CMS
- **Benefits**: Backward compatibility, decoupled from specific CMS

### Coding Standards and Conventions

**TypeScript Standards**:
- **Strict Mode**: Enabled (`strict: true` in tsconfig.json)
- **No Explicit Any**: Avoid `any` type, use `unknown` if type truly unknown
- **Type Annotations**: Explicit return types for public functions
- **Rationale**: Type safety, catch errors at compile time, self-documenting code

**Naming Conventions**:
- **Components**: PascalCase (`VendorRegistrationForm`)
- **Functions**: camelCase (`createVendor`, `validateTierAccess`)
- **Variables**: camelCase (`vendorData`, `isAuthenticated`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_LOGIN_ATTEMPTS`, `TIER_FREE`)
- **Files**: kebab-case (`vendor-service.ts`, `create-vendor.test.ts`)
- **Rationale**: Consistency, readability, industry standard

**Code Organization**:
- **Feature-Based**: Group related files by feature (`components/vendor/`, `app/api/vendors/`)
- **Shared Code**: Common utilities in `lib/`, shared components in `components/shared/`
- **Co-Location**: Test files co-located with source files (`.test.ts` suffix)
- **Rationale**: Easy to find related code, scalable as project grows

**Documentation Standards**:
- **TSDoc Comments**: All public APIs have TSDoc comments
- **Inline Comments**: Explain "why" not "what", sparingly used
- **README Files**: Major directories have README explaining purpose
- **Rationale**: Self-documenting code, onboarding new developers, maintainability

## Technology Choices

### Framework and Library Selections

**Next.js 14 (App Router)**:
- **Purpose**: Full-stack React framework for frontend and API routes
- **Rationale**: Already used in project, excellent performance, great developer experience, Vercel hosting
- **Alternatives**: Remix (less mature ecosystem), Gatsby (static-first, less flexible)

**Payload CMS 2.x**:
- **Purpose**: Headless CMS for content management and authentication
- **Rationale**: TypeScript-first, built-in auth, flexible access control, Next.js integration
- **Alternatives**: Strapi (less TypeScript-focused), Sanity (proprietary cloud), custom solution (high effort)

**React 18**:
- **Purpose**: UI library for building components
- **Rationale**: Already used in project, industry standard, excellent ecosystem
- **Alternatives**: Vue (different paradigm), Svelte (smaller community)

**shadcn/ui**:
- **Purpose**: UI component library based on Radix UI primitives
- **Rationale**: Already used in project, customizable, accessible, great developer experience
- **Alternatives**: Material-UI (heavier), Chakra UI (different design language)

**SWR**:
- **Purpose**: Data fetching and caching library
- **Rationale**: Already installed, lightweight, built for Next.js, automatic caching and revalidation
- **Alternatives**: TanStack Query (more powerful but heavier), custom solution (more work)

**React Hook Form + Zod**:
- **Purpose**: Form state management and validation
- **Rationale**: Already installed, excellent performance, TypeScript-first validation with Zod
- **Alternatives**: Formik (heavier), custom solution (more work)

### Database and Storage Technology Decisions

**PostgreSQL 17+**:
- **Purpose**: Primary database for content and user data
- **Rationale**: Relational model fits data structure, ACID compliance, team expertise, excellent performance
- **Alternatives**: MongoDB (eventual consistency), MySQL (less feature-rich)

**Payload CMS Media Management**:
- **Purpose**: Store vendor logos and product images
- **Rationale**: Built-in media management, automatic path transformation, resizing support
- **Alternatives**: AWS S3 (additional infrastructure), Vercel Blob (additional cost)

**File System (Backup)**:
- **Purpose**: Archive original TinaCMS markdown files
- **Rationale**: Simple, reliable, no additional infrastructure needed
- **Alternatives**: Cloud storage (AWS S3, Google Cloud Storage) - overkill for backup

### Infrastructure and Deployment Choices

**Vercel (Frontend & API Routes)**:
- **Purpose**: Hosting for Next.js application
- **Rationale**: Excellent Next.js integration, automatic deployments, Edge Network CDN, serverless functions
- **Alternatives**: AWS (more complex setup), Netlify (similar but less Next.js-focused)

**Database Hosting**:
- **Development**: SQLite (file-based, `./payload.db`, zero configuration)
- **Production Options**:
  - **Vercel Postgres**: Simple integration, good for Vercel-hosted apps
  - **Supabase**: PostgreSQL + built-in features, generous free tier, excellent developer experience
  - **AWS RDS**: Managed PostgreSQL, enterprise-grade, flexible pricing
  - **Neon**: Serverless PostgreSQL, automatic scaling, pay-per-use
  - **Railway**: Simple PostgreSQL hosting, developer-friendly
- **Decision Deferred**: Evaluate based on budget and operational requirements during deployment phase
- **Migration Path**: Payload CMS migrations work identically on SQLite and PostgreSQL, ensuring smooth transition

**Environment Configuration**:
- **Purpose**: Manage environment-specific settings (database URL, JWT secret)
- **Rationale**: Security (secrets not committed), flexibility (different configs per environment)
- **Implementation**: `.env.local` for development, Vercel Environment Variables for production

**CI/CD Pipeline**:
- **Purpose**: Automated testing, linting, building, deployment
- **Rationale**: Catch issues early, consistent builds, fast feedback loop
- **Implementation**: GitHub Actions for testing, Vercel for deployment

## Decision Rationale Summary

**Key Architectural Decisions**:
1. **Payload CMS**: Enables vendor self-enrollment, tiered access control, database-backed content
2. **PostgreSQL**: Relational integrity, ACID transactions, team expertise
3. **Multi-Layer Tier Enforcement**: Security via defense in depth
4. **JWT in Cookies**: Stateless auth with XSS protection
5. **Big Bang Migration**: Simplicity, consistency, faster delivery
6. **SWR**: Intelligent caching, optimistic updates, lightweight

**Trade-Offs Made**:
- **Complexity vs. Features**: Accepted higher complexity (database, auth) to enable vendor self-service
- **Risk vs. Speed**: Big bang migration higher risk but faster time to value
- **Control vs. Simplicity**: Managed services (Vercel) reduce control but improve developer experience
- **Security vs. UX**: Strong password requirements, short token expiry prioritize security

**Future Flexibility**:
- **Payment Integration**: Tiered model designed for easy Stripe integration in future
- **Advanced Search**: PostgreSQL full-text search available, Algolia easy to add later
- **Email Notifications**: Architecture supports adding email service without major changes
- **Multi-User Accounts**: Schema can be extended to support multiple users per vendor

**Alignment with Product Vision**:
- **Progressive Profiling**: Tiered model aligns with product mission (risk-free entry path)
- **Scalability**: Architecture supports growth from 10 vendors to 10,000+ vendors
- **Vendor-Centric**: Self-service empowers vendors, reduces admin burden
- **Performance**: Fast page loads and API responses create excellent user experience
