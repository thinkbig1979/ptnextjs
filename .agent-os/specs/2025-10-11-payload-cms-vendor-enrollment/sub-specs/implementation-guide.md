# Implementation Guide

This is the implementation guide for the spec detailed in @.agent-os/specs/2025-10-11-payload-cms-vendor-enrollment/spec.md

## Development Approach

**Methodology**: Agile with phased implementation and continuous validation

**Development Workflow**:
- Feature branch strategy: `feature/payload-cms-migration`
- Code review required for all changes (1 approver minimum)
- Daily standups to track migration progress and blockers
- Sprint duration: 2 weeks per major phase

**Team Coordination**:
- **Backend Lead**: Payload CMS setup, database schema, API endpoints, migration scripts
- **Frontend Lead**: UI components, authentication flow, dashboard, admin interfaces
- **QA Lead**: Test strategy, E2E scenarios, migration validation
- **DevOps**: PostgreSQL setup, environment configuration, deployment pipeline

## Architecture Overview

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Next.js 14 Frontend                      │
│  ┌──────────────────┐  ┌──────────────────┐  ┌────────────────┐│
│  │  Public Pages    │  │ Vendor Dashboard │  │ Admin Interface││
│  │  (Vendors, Prods)│  │  (Profile, Prods)│  │ (Approvals)    ││
│  └────────┬─────────┘  └────────┬─────────┘  └────────┬───────┘│
│           │                     │                      │        │
│           └─────────────────────┼──────────────────────┘        │
│                                 │                                │
│                        ┌────────▼──────────┐                    │
│                        │   API Routes      │                    │
│                        │  /api/vendors     │                    │
│                        │  /api/auth        │                    │
│                        │  /api/admin       │                    │
│                        └────────┬──────────┘                    │
└─────────────────────────────────┼───────────────────────────────┘
                                  │
                         ┌────────▼──────────┐
                         │  Service Layer    │
                         │  - VendorService  │
                         │  - AuthService    │
                         │  - ApprovalService│
                         └────────┬──────────┘
                                  │
                         ┌────────▼──────────┐
                         │   Payload CMS     │
                         │   Local API       │
                         │   (Collections)   │
                         └────────┬──────────┘
                                  │
                         ┌────────▼──────────┐
                         │   PostgreSQL 17+  │
                         │   (Content DB)    │
                         └───────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      Migration Process                          │
│                                                                 │
│  TinaCMS Markdown Files  →  Migration Scripts  →  PostgreSQL   │
│  /content/vendors/*.md       (Transform & Load)    vendors table│
│  /content/products/*.md      (Validation)          products tbl │
│  /content/categories/*.md                          categories   │
│  /content/blog/*.md                                blog_posts   │
│  /content/team/*.md                                team_members │
└─────────────────────────────────────────────────────────────────┘
```

### Component Relationships and Dependencies

**Frontend Layer**:
- Public pages → Next.js API routes → Payload CMS → PostgreSQL
- Vendor dashboard → AuthContext (JWT) → Protected API routes → Payload CMS
- Admin interface → AdminGuard (role check) → Admin API routes → Payload CMS

**Backend Layer**:
- API routes → Service layer → Payload CMS local API → PostgreSQL
- Authentication → JWT middleware → AuthService → users table
- Migration scripts → File system (markdown) → Transform logic → Payload CMS API

**Data Flow**:
- User actions (forms, clicks) → Frontend components → API calls → Service layer → Database
- Database changes → Payload CMS hooks → Cache invalidation → Frontend refresh (SWR)

## Implementation Strategy

### Phased Implementation Plan

#### Phase 1: Backend Foundation (Week 1-2)
**Goal**: Set up Payload CMS 3, SQLite for development, and define collections

**Tasks**:
1. Install Payload CMS 3 and database adapter dependencies (@payloadcms/db-sqlite for dev, @payloadcms/db-postgres for prod)
2. Configure Payload CMS with payload.config.ts (SQLite for development)
3. Define all collections (Users, Vendors, Products, Categories, BlogPosts, TeamMembers, CompanyInfo)
4. Create initial Payload migration and run against SQLite
5. Set up authentication with Payload CMS 3 built-in auth
6. Implement basic access control hooks (isAdmin, isVendor, tier restrictions)
7. Test Payload CMS admin interface locally with SQLite database

**Milestone**: Payload CMS admin interface accessible at /admin, all collections functional with SQLite

**Success Criteria**:
- Payload CMS 3 admin interface loads without errors
- SQLite database created automatically (./payload.db)
- All 7 collections are defined with correct fields
- Admin user can log in and create test records
- Payload migrations work correctly
- Schema changes can be applied via `npm run payload migrate`

**Risk Mitigation**:
- Test Payload CMS 3 integration with Next.js 14 App Router in isolation first
- Use Payload CMS 3 starter template as reference
- Keep TinaCMS running in parallel until migration complete
- Verify Payload migration compatibility between SQLite and PostgreSQL early

#### Phase 2: Migration Scripts (Week 3-4)
**Goal**: Build and test automated migration scripts for all content types

**Tasks**:
1. Create base migration utilities (markdown parser, validation, error handling)
2. Implement vendor migration script (content/vendors/*.md → vendors table)
3. Implement product migration script (content/products/*.md → products table)
4. Implement category migration script (categories, blog categories)
5. Implement blog migration script (blog posts, authors)
6. Implement team migration script (team members)
7. Implement company info migration script (company data)
8. Create validation script to verify data integrity post-migration
9. Run test migrations on sample data
10. Create backup of all markdown files

**Milestone**: All TinaCMS content successfully migrated to PostgreSQL with validated data integrity

**Success Criteria**:
- All vendors migrated (verified by count and spot-checking)
- All products linked to correct vendors
- All categories and relationships preserved
- Blog posts retain all metadata and content
- Team members and company info migrated correctly
- Migration validation script reports 100% success rate
- Original markdown files backed up to /content-backup/

**Risk Mitigation**:
- Test migrations on small sample sets first
- Implement rollback capability (restore from backup)
- Validate each content type independently before full migration
- Create detailed migration logs for auditing

#### Phase 3: API Endpoints (Week 5-6)
**Goal**: Build all API endpoints for vendor enrollment and management

**Tasks**:
1. Implement POST /api/vendors/register endpoint
2. Implement POST /api/auth/login endpoint
3. Implement PUT /api/vendors/{id} endpoint with tier validation
4. Implement GET /api/admin/vendors/pending endpoint
5. Implement POST /api/admin/vendors/{id}/approve endpoint
6. Implement POST /api/admin/vendors/{id}/reject endpoint
7. Implement GET /api/vendors (public vendor list)
8. Implement GET /api/products (product catalog)
9. Create API middleware for authentication and authorization
10. Implement tier restriction validation in service layer
11. Write unit tests for all services (80%+ coverage)
12. Write integration tests for all API endpoints

**Milestone**: All API endpoints functional and tested

**Success Criteria**:
- Vendors can register and see "awaiting approval" status
- Admins can approve/reject registrations
- Vendors can log in after approval
- Tier restrictions enforced (free tier cannot access tier 1/2 fields)
- All API endpoints return standardized response format
- Unit tests pass with 80%+ coverage
- Integration tests cover all happy paths and error scenarios

**Risk Mitigation**:
- Use Postman/Insomnia for manual API testing during development
- Test tier restrictions with multiple user accounts (free, tier1, tier2)
- Implement comprehensive error handling for all edge cases

#### Phase 4: Frontend UI (Week 7-8)
**Goal**: Build vendor registration, dashboard, and admin approval interface

**Tasks**:
1. Create VendorRegistrationForm component with validation
2. Create VendorLoginForm component
3. Implement AuthContext for global auth state
4. Create VendorDashboard with navigation sidebar
5. Create VendorProfileEditor with tier-gated fields
6. Implement TierGate component for conditional rendering
7. Create AdminApprovalQueue component with table and dialog
8. Update public pages to fetch data from Payload CMS APIs
9. Replace TinaCMSDataService with PayloadCMSDataService
10. Implement SWR hooks for data fetching with caching
11. Add loading states, error boundaries, and toast notifications
12. Style all components with shadcn/ui and Tailwind CSS

**Milestone**: Complete vendor enrollment and management UI functional

**Success Criteria**:
- Vendors can register from /vendor/register page
- Vendors can log in and access dashboard
- Vendors can edit profile fields based on tier
- TierGate hides restricted fields from lower tiers
- Admins can approve/reject pending vendors from /admin/vendors/pending
- Public pages display migrated content correctly
- All UI components responsive on mobile, tablet, desktop
- Loading and error states implemented for all async operations

**Risk Mitigation**:
- Build components incrementally, test each in isolation
- Use shadcn/ui examples as reference for component patterns
- Test tier restrictions with multiple user accounts
- Validate mobile responsiveness on real devices

#### Phase 5: Testing & Validation (Week 9-10)
**Goal**: Comprehensive testing and quality assurance

**Tasks**:
1. Write E2E tests for vendor registration flow (Playwright)
2. Write E2E tests for admin approval workflow
3. Write E2E tests for vendor profile editing with tier restrictions
4. Perform load testing (100 concurrent users)
5. Validate migration data integrity (spot-check all content types)
6. Security audit (OWASP Top 10 checklist)
7. Accessibility audit (WCAG 2.1 AA compliance)
8. Performance testing (Lighthouse, API response times)
9. Cross-browser testing (Chrome, Firefox, Safari, Edge)
10. User acceptance testing (UAT) with stakeholders

**Milestone**: All tests passing, quality gates met

**Success Criteria**:
- E2E tests pass for all critical user flows
- Load testing confirms 100 concurrent users supported
- Migration validation confirms 100% data integrity
- Security audit finds no critical vulnerabilities
- Accessibility audit confirms WCAG 2.1 AA compliance
- Lighthouse score ≥ 90 for performance
- API response times < 500ms for 95th percentile
- Cross-browser testing finds no blocking issues
- UAT stakeholders approve for production deployment

**Risk Mitigation**:
- Allocate 2 full weeks for testing (no new features)
- Address high-priority issues immediately
- Create regression test suite for future changes

#### Phase 6: Deployment & Cutover (Week 11)
**Goal**: Deploy to production with PostgreSQL and complete cutover from TinaCMS

**Tasks**:
1. Set up production PostgreSQL database (Vercel Postgres, Supabase, or AWS RDS)
2. Test Payload migrations on PostgreSQL staging database
3. Configure production environment variables (DATABASE_URI with PostgreSQL connection string)
4. Deploy Payload CMS to production (Vercel)
5. Run production Payload migrations (`DATABASE_URI=postgresql://... npm run payload migrate`)
6. Run production TinaCMS content migration scripts
7. Validate production data integrity (compare SQLite dev vs PostgreSQL prod)
8. Update DNS and routing (if needed)
9. Monitor application for errors and performance
10. Remove TinaCMS dependencies and markdown files (archived)
11. Update documentation (README, API docs)
12. Communicate launch to stakeholders

**Milestone**: Production deployment complete with PostgreSQL, TinaCMS fully replaced

**Success Criteria**:
- Production application accessible and functional on PostgreSQL
- Payload migrations executed successfully on PostgreSQL
- Production database populated with all migrated content
- No critical errors in production logs
- Performance meets targets (< 500ms API response times)
- Database queries optimized for PostgreSQL (connection pooling, indexes)
- TinaCMS code and dependencies removed
- Documentation updated to reflect Payload CMS 3 architecture
- Stakeholders notified of successful launch

**Risk Mitigation**:
- Test all Payload migrations on PostgreSQL staging environment before production
- Verify database adapter compatibility (SQLite → PostgreSQL) in staging
- Deploy during low-traffic window (e.g., weekend)
- Have rollback plan ready (restore TinaCMS if critical issues, revert to SQLite locally)
- Monitor closely for first 48 hours post-deployment
- Keep markdown backup files for 30 days before permanent deletion
- Document any PostgreSQL-specific optimizations needed

## Development Workflow

### Setup and Environment Configuration

**Prerequisites**:
- Node.js 22 LTS installed
- Git repository access
- Vercel account for deployment (optional for local development)
- **No database server required for development** (SQLite is file-based)

**Environment Variables**:
```bash
# .env.local (local development with SQLite)
DATABASE_URI=file:./payload.db
PAYLOAD_SECRET=your-secure-payload-secret-key
JWT_SECRET=your-secure-jwt-secret-key
NEXT_PUBLIC_API_URL=http://localhost:3000

# .env.production (production with PostgreSQL)
DATABASE_URI=postgresql://user:password@production-host:5432/marine_tech_prod
PAYLOAD_SECRET=production-payload-secret-key
JWT_SECRET=production-jwt-secret-key
NEXT_PUBLIC_API_URL=https://yourdomain.com
```

**Local Development Setup**:
```bash
# 1. Install dependencies
npm install

# 2. Run Payload CMS migrations (creates SQLite database automatically)
npm run payload migrate

# 3. Seed admin user
npm run db:seed

# 4. Start development server
npm run dev

# 5. Access Payload CMS admin at http://localhost:3000/admin
```

**Benefits of SQLite for Development**:
- Zero configuration - no database server to install or manage
- File-based - database stored as `./payload.db` in project root
- Fast setup - start coding immediately
- Perfect for local development and testing
- Payload CMS migrations ensure schema compatibility with production PostgreSQL

### Coding Standards and Conventions

**File Structure**:
- API routes: `/app/api/{entity}/{action}/route.ts`
- Components: `/components/{feature}/{ComponentName}.tsx`
- Services: `/lib/services/{entity-service}.ts`
- Types: `/lib/types.ts` (shared) or `/lib/types/{entity-types}.ts` (scoped)
- Utilities: `/lib/utils/{utility-name}.ts`

**TypeScript Conventions**:
- Use interfaces for public contracts: `interface Vendor { ... }`
- Use types for complex unions: `type Status = 'pending' | 'approved' | 'rejected'`
- Avoid `any` type, use `unknown` if type truly unknown
- Use strict TypeScript mode (`"strict": true` in tsconfig.json)
- Export types alongside components and functions

**React Component Conventions**:
- Use functional components with hooks (no class components)
- Destructure props in function signature: `function Component({ prop1, prop2 }: Props) { ... }`
- Use `React.FC` sparingly (only when children prop needed explicitly)
- Extract reusable logic into custom hooks: `useAuth()`, `useVendor(id)`
- Co-locate styles and types with component files

**API Route Conventions**:
- Use Next.js App Router route handlers: `export async function POST(request: Request) { ... }`
- Validate input with Zod schemas before processing
- Return standardized response format: `{ success: boolean, data?: any, error?: ErrorObject }`
- Use HTTP status codes correctly (200 success, 201 created, 400 validation error, 401 unauthorized, 403 forbidden, 404 not found, 500 server error)
- Implement error handling middleware for consistent error responses

**Service Layer Conventions**:
- One service per entity: `VendorService`, `AuthService`, `ApprovalService`
- Methods should be async and return Promises
- Throw errors for exceptional cases, return null/undefined for "not found"
- Use dependency injection for testability (pass database client as parameter)

### Testing and Validation Procedures

**Unit Testing**:
- Framework: Jest with TypeScript support
- Test files: Co-locate with source files as `{filename}.test.ts` or `{filename}.spec.ts`
- Coverage target: 80%+ for services and utilities
- Run tests: `npm run test`
- Run with coverage: `npm run test:coverage`

**Integration Testing**:
- Framework: Jest + Supertest for API routes
- Test database: Separate test database (`marine_tech_test`)
- Setup: Create test fixtures and seed data before tests
- Teardown: Clean database after each test
- Run integration tests: `npm run test:integration`

**E2E Testing**:
- Framework: Playwright
- Test files: `/tests/e2e/{feature}.spec.ts`
- Run E2E tests: `npm run test:e2e`
- Run headless: `npm run test:e2e:headless`
- Scenarios: Vendor registration, admin approval, profile editing, tier restrictions

**Manual Testing Checklist**:
- [ ] Vendor can register with valid data
- [ ] Vendor cannot register with duplicate email
- [ ] Vendor cannot log in before admin approval
- [ ] Admin can approve pending vendor
- [ ] Admin can reject pending vendor with reason
- [ ] Approved vendor can log in
- [ ] Vendor can edit free tier fields
- [ ] Vendor cannot edit tier 1/2 fields without proper tier
- [ ] TierGate hides restricted content
- [ ] Public pages display migrated content
- [ ] Mobile responsiveness works on iPhone and Android
- [ ] All forms validate input correctly
- [ ] Error messages are user-friendly
- [ ] Loading states display during async operations

## Quality Assurance

### Code Review Guidelines

**Pre-Review Checklist**:
- [ ] All tests pass (`npm run test`)
- [ ] No TypeScript errors (`npm run type-check`)
- [ ] No linting errors (`npm run lint`)
- [ ] Code follows style conventions (indentation, naming, etc.)
- [ ] New code has corresponding tests (80%+ coverage)
- [ ] Public APIs have TSDoc comments
- [ ] README updated if public interface changed

**Review Focus Areas**:
- **Security**: Input validation, SQL injection prevention, XSS prevention, authentication/authorization
- **Performance**: Database query efficiency, unnecessary re-renders, bundle size impact
- **Code Quality**: Readability, maintainability, DRY principles, proper error handling
- **Testing**: Test coverage, edge cases handled, integration tests included

**Approval Requirements**:
- 1 approving review required
- All review comments addressed or discussed
- CI/CD pipeline passes (tests, linting, type checking)

### Testing Requirements

**Unit Test Requirements**:
- All service methods have unit tests
- All utility functions have unit tests
- All custom hooks have unit tests
- Edge cases and error scenarios covered
- Mock external dependencies (database, APIs)
- Coverage target: 80%+

**Integration Test Requirements**:
- All API endpoints have integration tests
- Test both success and error paths
- Test authentication and authorization
- Test tier restriction enforcement
- Use test database with fixtures

**E2E Test Requirements**:
- All critical user flows have E2E tests
- Test on multiple browsers (Chrome, Firefox, Safari)
- Test on mobile viewports
- Test with real-world scenarios (slow network, interrupted flows)

### Documentation Standards

**Code Documentation**:
- TSDoc comments for all public APIs (functions, classes, interfaces)
- Inline comments for complex logic (explain "why" not "what")
- README files for major directories (e.g., `/scripts/migration/README.md`)

**API Documentation**:
- Document all API endpoints with request/response schemas
- Include example requests and responses
- Document error codes and messages
- Use OpenAPI/Swagger spec (optional but recommended)

**Architecture Documentation**:
- Maintain architecture decision records (ADRs) for major decisions
- Update architecture diagrams when structure changes
- Document data flow and integration points
- Keep README up to date with setup instructions

**Migration Documentation**:
- Document migration process step-by-step
- Include rollback procedures
- Document data transformation logic
- Keep migration logs for auditing

## Implementation Notes

**Key Implementation Decisions**:
1. **Big Bang Migration**: All content migrated at once to avoid dual maintenance of TinaCMS and Payload CMS
2. **JWT in Cookies**: Store JWT in httpOnly cookies instead of localStorage for XSS protection
3. **Tier Enforcement**: Enforce tier restrictions at both UI (TierGate) and API (middleware) levels for defense in depth
4. **SWR for Data Fetching**: Use SWR for frontend data fetching to leverage automatic caching and revalidation
5. **Payload CMS Local API**: Use Payload CMS local API in Next.js API routes instead of REST API for better type safety and performance

**Common Pitfalls to Avoid**:
- Don't skip server-side validation even if client-side validation exists
- Don't expose password hashes in API responses (exclude from queries)
- Don't allow vendors to update their tier directly (admin-only operation)
- Don't forget to invalidate SWR cache after mutations
- Don't hardcode tier names, use constants (`TIER_FREE`, `TIER_1`, `TIER_2`)
- Don't delete original markdown files until migration validated in production

**Performance Optimization Tips**:
- Index frequently queried fields (email, slug, status, tier)
- Use connection pooling for PostgreSQL (max 20 connections)
- Implement pagination for all list endpoints (max 100 items per page)
- Lazy load dashboard components to reduce initial bundle size
- Use Next.js Image component for automatic image optimization
- Enable SWR deduplication to prevent duplicate API calls

**Security Best Practices**:
- Never log passwords or JWT tokens
- Use parameterized queries for all database operations
- Validate and sanitize all user input (Zod schemas)
- Implement rate limiting on authentication endpoints (100 req/min per IP)
- Use HTTPS in production (Vercel enforces by default)
- Set secure cookie attributes (httpOnly, secure, sameSite)
- Keep dependencies up to date (run `npm audit` regularly)
