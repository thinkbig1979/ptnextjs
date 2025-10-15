# Quality Gates

This is the quality gates specification for the spec detailed in @.agent-os/specs/2025-10-14-complete-tinacms-payload-migration/spec.md

## Overview

Quality gates ensure the TinaCMS to Payload CMS migration meets production-ready standards before deployment. Gates are enforced at key milestones with measurable criteria and automated validation.

## Quality Metrics & Thresholds

### Code Quality Metrics

**Test Coverage**:
- **Minimum**: 80% overall coverage
- **Target**: 90%+ for critical paths (PayloadCMSDataService, migration scripts)
- **Measurement**: Jest coverage reports
- **Gate**: Build fails if coverage < 80%

**Type Safety**:
- **Requirement**: Zero TypeScript errors
- **Measurement**: `npm run type-check` must pass
- **Strict Mode**: Enabled in tsconfig.json
- **Gate**: Cannot merge PR with type errors

**Code Linting**:
- **Requirement**: Zero ESLint errors
- **Warnings**: < 5 warnings acceptable
- **Measurement**: `npm run lint` must pass
- **Auto-fix**: Run `npm run lint:fix` before commit
- **Gate**: Pre-commit hook blocks commits with errors

### Performance Metrics

**Build Time**:
- **Maximum**: 5 minutes for full static site generation
- **Measurement**: `npm run build` execution time
- **Baseline**: Current TinaCMS build time
- **Gate**: Build time regression > 20% requires optimization

**Page Load Performance**:
- **Homepage**: < 1 second (LCP)
- **Vendor Detail**: < 1.5 seconds (LCP)
- **Product Detail**: < 1.5 seconds (LCP)
- **Yacht Detail**: < 2 seconds (LCP)
- **Measurement**: Lighthouse CI, Chrome DevTools
- **Gate**: Performance score < 90 requires investigation

**API Response Time**:
- **Cached Requests**: < 100ms average
- **Uncached Requests**: < 500ms average
- **Complex Queries**: < 1 second (e.g., vendor with full relationships)
- **Measurement**: Performance.now() timing, API monitoring
- **Gate**: Response time regression > 30% blocks deployment

**Database Query Performance**:
- **Simple Queries**: < 50ms
- **Complex Queries**: < 200ms
- **Migration Scripts**: < 3 minutes total
- **Measurement**: PostgreSQL query logs, Payload telemetry
- **Gate**: Slow queries (> 1s) require optimization

### Data Quality Metrics

**Migration Completeness**:
- **Requirement**: 100% of TinaCMS content migrated
- **Measurement**: Record count comparison (markdown files vs database records)
- **Validation**:
  - Vendors: Count `.md` files in `content/vendors/` = Payload `vendors` count
  - Products: Count `.md` files in `content/products/` = Payload `products` count
  - Yachts: Count `.md` files in `content/yachts/` = Payload `yachts` count
  - Blog Posts, Team Members, Categories, Tags: Same pattern
- **Gate**: < 100% migration blocks production deployment

**Data Integrity**:
- **Requirement**: Zero orphaned records (e.g., products without vendors)
- **Relationship Validation**: All foreign keys resolve correctly
- **JSONB Validation**: All complex fields parse and validate
- **Media Paths**: 100% of media paths valid and accessible
- **Measurement**: Automated validation scripts
- **Gate**: Any data integrity issues block deployment

**Data Accuracy**:
- **Spot Check**: Manual verification of 20% of migrated content
- **Critical Fields**: 100% accuracy for companyName, slug, descriptions
- **Enhanced Fields**: Verify certifications, awards, case studies preserved correctly
- **Measurement**: Manual QA checklist
- **Gate**: > 5% data accuracy issues require re-migration

### Security Metrics

**Authentication & Authorization**:
- **Requirement**: Admin-only access to write operations
- **Vendor Dashboard**: Vendors can only edit own profiles
- **Public API**: Read-only access to published content
- **Measurement**: Security testing, role-based access tests
- **Gate**: Any auth bypass vulnerability blocks deployment

**Data Protection**:
- **Password Hashing**: bcrypt with salt rounds ≥ 10
- **JWT Security**: httpOnly cookies, secure transmission
- **Input Validation**: All user inputs sanitized
- **SQL Injection**: Zero vulnerabilities (parameterized queries)
- **Measurement**: Security audit, automated vulnerability scanning
- **Gate**: Any critical security issue blocks deployment

**Dependency Security**:
- **Requirement**: Zero critical or high vulnerabilities in dependencies
- **Measurement**: `npm audit` must show 0 critical/high issues
- **Update Policy**: Dependencies updated within 30 days of security releases
- **Gate**: Critical vulnerabilities block deployment

## Validation Criteria

### Automated Quality Checks

**Pre-Commit Validation** (Local):
```bash
# Runs automatically via Husky pre-commit hook
npm run lint
npm run type-check
```

**Pre-Merge Validation** (CI/CD):
```bash
# Runs in GitHub Actions / GitLab CI
npm run lint
npm run type-check
npm run test:unit
npm run test:integration
npm run build
```

**Pre-Deployment Validation** (Staging):
```bash
# Full test suite including E2E
npm run test
npm run test:e2e
npm run build
# Performance testing
npm run lighthouse:ci
```

### Manual Quality Checks

**Code Review Requirements**:
- [ ] All code reviewed by at least one other developer
- [ ] No console.log statements in production code
- [ ] Meaningful variable and function names
- [ ] Adequate code comments for complex logic
- [ ] No TODO comments without associated tickets

**Functional Testing Checklist**:
- [ ] All vendor profiles display correctly with enhanced fields
- [ ] All product pages display specifications, comparisons, reviews
- [ ] Yacht profiles display timeline, supplier map, sustainability metrics
- [ ] Blog posts render with rich text content
- [ ] Team page displays all members
- [ ] Company/about page displays company info
- [ ] Search and filtering work correctly
- [ ] Category navigation works
- [ ] Tag filtering works
- [ ] Images load correctly
- [ ] No broken links

**Browser Compatibility Testing**:
- [ ] Chrome (latest 2 versions)
- [ ] Firefox (latest 2 versions)
- [ ] Safari (latest 2 versions)
- [ ] Edge (latest version)
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

**Responsive Design Testing**:
- [ ] Mobile (320px - 767px)
- [ ] Tablet (768px - 1023px)
- [ ] Desktop (1024px+)
- [ ] All enhanced fields display correctly across breakpoints

### Stakeholder Acceptance

**Business Acceptance Criteria**:
- [ ] All TinaCMS features available in Payload
- [ ] No functionality regression
- [ ] Enhanced fields provide value (certifications, awards, case studies)
- [ ] Admin interface is usable and intuitive
- [ ] Performance meets or exceeds current site

**User Acceptance Testing**:
- [ ] Test vendor can register and create profile
- [ ] Test vendor can edit their profile
- [ ] Test vendor can add products (Tier 2)
- [ ] Admin can approve vendors
- [ ] Admin can manage all content

## Compliance Validation

### Technical Standards Compliance

**Next.js Best Practices**:
- [ ] Server Components used for data fetching
- [ ] Client Components only where needed (interactivity)
- [ ] Static generation for all content pages
- [ ] Metadata API used for SEO
- [ ] Image component used for all images

**Payload CMS Best Practices**:
- [ ] Collections properly configured with access control
- [ ] Relationships use correct relationTo configuration
- [ ] Hooks used for validation and data transformation
- [ ] Migrations generated and version-controlled
- [ ] Admin interface organized with groups

**Database Best Practices**:
- [ ] Indexes on frequently queried fields
- [ ] Foreign keys for relationships
- [ ] JSONB used appropriately for complex data
- [ ] Connection pooling configured
- [ ] Migrations for schema changes

### Accessibility Compliance

**WCAG 2.1 AA Compliance**:
- [ ] All images have alt text
- [ ] Semantic HTML elements used
- [ ] Keyboard navigation works
- [ ] Color contrast meets AA standards (4.5:1 for normal text)
- [ ] Form labels properly associated
- [ ] Error messages accessible

**Testing Tools**:
- Lighthouse accessibility audit (score > 90)
- axe DevTools automated testing
- Manual keyboard navigation testing

## Quality Gate Checkpoints

### Checkpoint 1: Schema Migration Complete

**Criteria**:
- [ ] All 8 Payload collections created
- [ ] All TinaCMS fields mapped to Payload fields
- [ ] Payload admin interface accessible
- [ ] Test records created successfully for all collections
- [ ] Relationships work correctly

**Validation**:
- Manual testing in Payload admin
- Create sample records for each collection
- Verify complex fields (arrays, groups) work

**Gate**: Cannot proceed to data migration until schema is complete

### Checkpoint 2: Data Migration Complete

**Criteria**:
- [ ] Migration scripts tested in development
- [ ] All TinaCMS content migrated to Payload database
- [ ] Record counts match (100% migration)
- [ ] Relationships intact (0 orphaned records)
- [ ] Data validation passed (zero integrity errors)
- [ ] Spot-check verification passed (95%+ accuracy)

**Validation**:
- Run automated validation scripts
- Compare record counts
- Spot-check 20% of records manually
- Verify complex fields preserved

**Gate**: Cannot proceed to frontend integration until data migration validated

### Checkpoint 3: Frontend Integration Complete

**Criteria**:
- [ ] All pages updated to use PayloadCMSDataService
- [ ] Build succeeds with Payload data
- [ ] All pages render correctly
- [ ] Enhanced fields display properly
- [ ] No console errors
- [ ] Performance targets met

**Validation**:
- Run `npm run build` - must succeed
- Manual QA of all page types
- Automated E2E tests pass
- Performance testing

**Gate**: Cannot deploy to staging until frontend integration complete

### Checkpoint 4: Testing Complete

**Criteria**:
- [ ] Unit tests: 80%+ coverage, all passing
- [ ] Integration tests: All passing
- [ ] E2E tests: All passing
- [ ] Performance tests: All targets met
- [ ] Security audit: No critical issues
- [ ] Manual QA: All checks passed

**Validation**:
- Run full test suite
- Review test coverage reports
- Manual QA checklist completion
- Security audit results

**Gate**: Cannot deploy to production until all tests pass

### Checkpoint 5: Production Ready

**Criteria**:
- [ ] Staging deployment successful
- [ ] Production database prepared
- [ ] Environment variables configured
- [ ] Backup and rollback plan documented
- [ ] Monitoring and alerts configured
- [ ] Stakeholder sign-off obtained

**Validation**:
- Staging smoke tests
- Production deployment dry-run
- Review deployment checklist
- Verify rollback procedure

**Gate**: Final approval required for production deployment

## Automated Quality Enforcement

### CI/CD Pipeline Gates

**Pull Request Gates**:
```yaml
# .github/workflows/pr-checks.yml
- Lint check must pass
- Type check must pass
- Unit tests must pass (80%+ coverage)
- Build must succeed
```

**Merge to Main Gates**:
```yaml
# .github/workflows/main-checks.yml
- All PR gates must pass
- Integration tests must pass
- Code review approval required
- No merge conflicts
```

**Deploy to Staging Gates**:
```yaml
# .github/workflows/staging-deploy.yml
- All main branch checks pass
- E2E tests pass
- Performance benchmarks met
- Security scan passed
```

**Deploy to Production Gates**:
```yaml
# .github/workflows/production-deploy.yml
- Staging deployment successful
- Manual QA sign-off
- Stakeholder approval
- Rollback plan documented
```

### Quality Metrics Dashboard

**Tracking Tools**:
- **Code Coverage**: Codecov dashboard
- **Performance**: Lighthouse CI reports
- **Security**: Snyk/npm audit dashboard
- **Tests**: Jest HTML reporter

**Reporting**:
- Daily automated quality reports
- Weekly stakeholder summaries
- Real-time CI/CD status

## Remediation Process

**Quality Gate Failure**:
1. **Identify Issue**: Review failed check details
2. **Assign Owner**: Developer responsible for fix
3. **Create Fix**: Implement remediation
4. **Verify Fix**: Re-run quality checks
5. **Document**: Update documentation if needed

**Escalation**:
- Critical issues: Immediate attention, deployment blocked
- High issues: Fix within 24 hours
- Medium issues: Fix within 1 week
- Low issues: Fix within 1 sprint

## Success Criteria

**Migration Considered Successful When**:
- [ ] All quality gates passed
- [ ] Zero critical or high issues outstanding
- [ ] Production deployment successful
- [ ] Post-deployment monitoring shows healthy metrics
- [ ] Stakeholder acceptance obtained
- [ ] User feedback positive
- [ ] No rollback required within 7 days
