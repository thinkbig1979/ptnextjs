# Quality Gates

**Spec:** Multi-Location Support for Vendors
**Date:** 2025-10-22
**Quality Metrics:** Code coverage, performance benchmarks, security validation, compliance checks

## Quality Metrics and Thresholds

### Code Coverage: Minimum Percentage Requirements

**Overall Coverage Target:** 80% minimum

**Component-Level Coverage Requirements:**

| Component Type | Coverage Target | Rationale |
|---------------|-----------------|-----------|
| Business Logic (Services) | 90%+ | Critical tier restrictions, HQ validation must be thoroughly tested |
| React Components | 80%+ | UI components need behavior testing, not implementation details |
| API Endpoints | 85%+ | API contracts must be validated with success and error cases |
| Utility Functions | 90%+ | Pure functions with well-defined inputs/outputs are easy to test |
| Database Migrations | 100% | Migration scripts are critical, must run without errors |
| Validation Hooks | 95%+ | Payload CMS hooks enforce business rules, must be bulletproof |

**Critical Paths Requiring 100% Coverage:**
- Tier restriction validation (TierService.validateLocationsTier)
- HQ uniqueness validation (LocationService.validateHQUniqueness)
- Location search with tier filtering (SearchService.searchVendorsByLocation)
- Database migration script (up and down functions)

**Coverage Enforcement:**
```json
// jest.config.js coverage thresholds
{
  "coverageThresholds": {
    "global": {
      "branches": 80,
      "functions": 80,
      "lines": 80,
      "statements": 80
    },
    "lib/services/TierService.ts": {
      "branches": 90,
      "functions": 90,
      "lines": 90,
      "statements": 90
    },
    "lib/services/LocationService.ts": {
      "branches": 90,
      "functions": 90,
      "lines": 90,
      "statements": 90
    },
    "migrations/2025-10-22-convert-location-to-array.ts": {
      "branches": 100,
      "functions": 100,
      "lines": 100,
      "statements": 100
    }
  }
}
```

**Coverage Reporting:**
- Jest generates HTML coverage report in `coverage/` directory
- Codecov integration comments on PRs with coverage diff
- CI/CD pipeline fails if coverage drops below threshold

### Performance: Response Time and Throughput Benchmarks

**API Response Time Benchmarks:**

| Endpoint | Target | Acceptable | Unacceptable |
|----------|--------|------------|--------------|
| PATCH /api/vendors/:id | < 500ms | 500-1000ms | > 1000ms |
| GET /api/vendors/search | < 1000ms | 1000-2000ms | > 2000ms |
| Geocoding API call | < 1000ms | 1000-1500ms | > 1500ms |

**Frontend Performance Benchmarks:**

| Metric | Target | Acceptable | Unacceptable |
|--------|--------|------------|--------------|
| LocationsManagerCard render (10 locations) | < 100ms | 100-200ms | > 200ms |
| Map component initial load | < 1000ms | 1000-1500ms | > 1500ms |
| Location form validation | < 50ms | 50-100ms | > 100ms |

**Database Query Performance:**

| Query | Target | Acceptable | Unacceptable |
|-------|--------|------------|--------------|
| Vendor update (locations array) | < 100ms | 100-300ms | > 300ms |
| Location-based search (1000 vendors) | < 500ms | 500-1000ms | > 1000ms |
| Find vendors with multiple locations | < 200ms | 200-500ms | > 500ms |

**Performance Testing Strategy:**
- Use Lighthouse for frontend performance audits (target score: 90+)
- Use Apache Bench or k6 for API load testing
- Use React DevTools Profiler to identify slow renders
- Use database query analyzer to optimize slow queries

**Performance Monitoring:**
```typescript
// Performance monitoring in production
import { measure } from '@/lib/monitoring';

export async function updateVendorLocations(vendorId: string, locations: VendorLocation[]) {
  const start = Date.now();

  try {
    const result = await payload.update({ collection: 'vendors', id: vendorId, data: { locations } });
    const duration = Date.now() - start;

    // Log performance metric
    measure('vendor.update.locations', duration, { vendorId, locationCount: locations.length });

    // Alert if slow
    if (duration > 1000) {
      console.warn(`Slow vendor update: ${duration}ms for vendor ${vendorId}`);
    }

    return result;
  } catch (error) {
    measure('vendor.update.locations.error', Date.now() - start);
    throw error;
  }
}
```

### Security: Vulnerability and Compliance Thresholds

**Security Vulnerability Tolerance:**

| Severity | Allowed Count | Action Required |
|----------|---------------|-----------------|
| Critical | 0 | Block merge, fix immediately |
| High | 0 | Block merge, fix before release |
| Medium | 2 | Create ticket, fix within 1 week |
| Low | 5 | Create ticket, fix within 1 month |

**Security Scanning Tools:**
- `npm audit` for dependency vulnerabilities (run on every PR)
- ESLint security rules (eslint-plugin-security)
- OWASP ZAP for API security testing (manual before major releases)

**Compliance Requirements:**

**Data Privacy (GDPR/CCPA):**
- Location addresses are business addresses only (no personal home addresses)
- Users can request deletion of vendor profile including all locations
- Audit log for location changes (who, when, what changed)

**Accessibility (WCAG 2.1 AA):**
- All form inputs have associated labels
- Map component has keyboard navigation
- Error messages are announced to screen readers
- Color contrast ratio ≥ 4.5:1 for all text

**Security Best Practices:**
- All user inputs validated and sanitized (client + server)
- SQL injection prevented via Payload CMS ORM (parameterized queries)
- XSS prevented via React's auto-escaping
- CSRF tokens on all state-changing requests
- HTTPS enforced for all API calls
- JWT tokens stored in HTTP-only cookies

**Security Validation Checklist:**
- [ ] No secrets or API keys in client-side code
- [ ] All API endpoints require authentication (except search)
- [ ] Tier restrictions enforced on backend, not just frontend
- [ ] Input validation on both client and server
- [ ] Error messages don't expose sensitive information
- [ ] Rate limiting implemented on all public endpoints

### Maintainability: Code Complexity and Technical Debt Limits

**Code Complexity Metrics:**

| Metric | Threshold | Action if Exceeded |
|--------|-----------|---------------------|
| Cyclomatic Complexity | < 10 per function | Refactor into smaller functions |
| File Length | < 500 lines | Split into multiple files |
| Function Length | < 100 lines | Break into smaller functions |
| Import Depth | < 5 levels | Reorganize module structure |

**Technical Debt Tracking:**
- Use TODO comments with JIRA ticket numbers: `// TODO(TICKET-123): Refactor this`
- Track technical debt in SonarQube or similar tool
- Allocate 20% of sprint capacity to technical debt reduction

**Code Quality Tools:**
- ESLint for code style and common errors
- Prettier for consistent formatting
- TypeScript strict mode enabled
- SonarQube for code quality analysis

**Maintainability Checklist:**
- [ ] All public functions have JSDoc comments
- [ ] Complex logic has inline comments explaining "why"
- [ ] Magic numbers replaced with named constants
- [ ] No code duplication (DRY principle followed)
- [ ] Functions do one thing (Single Responsibility Principle)
- [ ] Components are composable and reusable

## Validation Criteria

### Automated Quality Checks and Tools

**Pre-Commit Hooks (Husky + lint-staged):**
```json
// package.json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write",
      "jest --bail --findRelatedTests"
    ]
  }
}
```

**CI/CD Pipeline Quality Checks (GitHub Actions):**

```yaml
# .github/workflows/quality-gate.yml
name: Quality Gate

on:
  pull_request:
    branches: [main]

jobs:
  code-quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: '22'

      # 1. TypeScript Type Check
      - name: TypeScript Check
        run: pnpm run type-check

      # 2. Lint Check
      - name: ESLint Check
        run: pnpm run lint

      # 3. Code Formatting Check
      - name: Prettier Check
        run: pnpm run format:check

      # 4. Unit Tests with Coverage
      - name: Run Unit Tests
        run: pnpm test --coverage

      # 5. Coverage Threshold Check
      - name: Check Coverage Threshold
        run: |
          COVERAGE=$(jq '.total.lines.pct' coverage/coverage-summary.json | cut -d. -f1)
          if [ $COVERAGE -lt 80 ]; then
            echo "Coverage $COVERAGE% is below 80% threshold"
            exit 1
          fi

      # 6. Security Audit
      - name: npm Audit
        run: pnpm audit --audit-level=high

      # 7. Bundle Size Check
      - name: Check Bundle Size
        run: |
          pnpm run build
          BUNDLE_SIZE=$(du -sb .next/static | cut -f1)
          if [ $BUNDLE_SIZE -gt 5242880 ]; then  # 5MB limit
            echo "Bundle size $BUNDLE_SIZE exceeds 5MB limit"
            exit 1
          fi
```

**Automated Test Execution:**
- Unit tests run on every commit (via pre-commit hook)
- Integration tests run on every PR
- E2E tests run on every PR (against staging environment)
- Performance tests run nightly on main branch

**Static Code Analysis:**
- SonarQube scans every PR for code smells, bugs, vulnerabilities
- Results posted as PR comment
- Block merge if SonarQube quality gate fails (Reliability/Security/Maintainability < B rating)

### Manual Review and Approval Processes

**Code Review Requirements:**
- Minimum 1 approval from senior developer or tech lead
- All CI/CD checks must pass (green)
- No unresolved comments or change requests

**Code Review Checklist (Reviewer):**
- [ ] Code follows TypeScript and React best practices
- [ ] Business logic is correct (tier restrictions, HQ uniqueness)
- [ ] Error handling implemented for all failure scenarios
- [ ] Loading and error states handled in UI
- [ ] Accessibility: keyboard navigation works, labels present
- [ ] Security: inputs validated, tier restrictions on backend
- [ ] Tests: unit tests cover happy path and edge cases
- [ ] Documentation: JSDoc comments on public functions
- [ ] No console.log or debugging code left in
- [ ] Performance: no unnecessary re-renders or slow operations

**Design Review (if UI changes):**
- UX designer reviews dashboard UI mockups before implementation
- Accessibility specialist reviews keyboard navigation and screen reader experience
- Product manager approves tier gate UX (upgrade prompts, locked features)

**Security Review (for security-sensitive changes):**
- Security team reviews authentication/authorization changes
- Penetration testing for location search API (public endpoint)
- Review rate limiting and abuse prevention measures

### Stakeholder Acceptance Criteria

**Product Owner Acceptance:**
- [ ] All user stories from spec.md completed
- [ ] Tier 2 vendor can add multiple locations via dashboard
- [ ] Free/Tier 1 vendor sees tier upgrade prompt
- [ ] Public profile displays HQ for all vendors, additional locations for tier 2+
- [ ] Location-based search includes tier-appropriate results
- [ ] No regression in existing vendor profile features

**UX Designer Acceptance:**
- [ ] Dashboard location manager matches approved designs
- [ ] Map component is intuitive and responsive
- [ ] Error messages are clear and actionable
- [ ] Loading states provide feedback during operations
- [ ] Mobile experience is smooth on iOS and Android

**QA Team Acceptance:**
- [ ] All test cases pass (unit, integration, E2E)
- [ ] Manual exploratory testing completed
- [ ] Cross-browser testing passed (Chrome, Firefox, Safari, Edge)
- [ ] Mobile testing passed (iOS Safari, Android Chrome)
- [ ] Performance benchmarks met (Lighthouse score 90+)
- [ ] No critical or high severity bugs

**Business Stakeholder Acceptance:**
- [ ] Feature aligns with product roadmap and tier monetization strategy
- [ ] Analytics tracking implemented for feature usage
- [ ] Documentation updated for vendor onboarding (how to add locations)
- [ ] Support team trained on multi-location feature

## Automated Quality Checks

### Static Code Analysis Configuration

**ESLint Configuration:**
```javascript
// .eslintrc.js
module.exports = {
  extends: [
    'next/core-web-vitals',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
    'plugin:security/recommended',
  ],
  plugins: ['@typescript-eslint', 'security'],
  rules: {
    // Enforce strict type safety
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/explicit-function-return-type': 'warn',

    // Security rules
    'security/detect-object-injection': 'warn',
    'security/detect-non-literal-regexp': 'warn',

    // Code quality rules
    'complexity': ['error', 10],  // Max cyclomatic complexity
    'max-lines': ['warn', 500],   // Max lines per file
    'max-lines-per-function': ['warn', 100],  // Max lines per function

    // React best practices
    'react-hooks/exhaustive-deps': 'error',
    'react/jsx-no-target-blank': 'error',
  },
};
```

**TypeScript Strict Mode:**
```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

**Prettier Configuration:**
```json
// .prettierrc
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false
}
```

### Security Scanning and Vulnerability Assessment

**Dependency Scanning:**
```bash
# Run on every PR
pnpm audit --audit-level=high

# Example output interpretation:
# - 0 vulnerabilities: ✅ Pass
# - 1+ high/critical vulnerabilities: ❌ Fail, fix before merge
# - Medium/low vulnerabilities: ⚠️ Warning, create ticket
```

**OWASP Top 10 Validation:**

| OWASP Risk | Mitigation | Validation Method |
|------------|------------|-------------------|
| A01: Broken Access Control | Tier restrictions on backend, JWT auth | Manual penetration testing, automated API tests |
| A02: Cryptographic Failures | HTTPS only, HTTP-only cookies | SSL Labs scan, security headers check |
| A03: Injection | Payload CMS ORM (parameterized queries) | SQLMap testing, code review |
| A04: Insecure Design | Tier-based feature gates | Architecture review, threat modeling |
| A05: Security Misconfiguration | CSP headers, secure defaults | Security headers scan (securityheaders.com) |
| A06: Vulnerable Components | npm audit, Snyk scanning | Automated CI/CD checks |
| A07: Identification/Auth Failures | JWT tokens, secure sessions | Auth testing, token expiry validation |
| A08: Software/Data Integrity Failures | Immutable deployments, signed packages | Build pipeline validation |
| A09: Security Logging/Monitoring Failures | Error logging, audit trail | Log analysis, monitoring setup |
| A10: SSRF | No user-controlled URLs | Code review, input validation tests |

**Security Testing Schedule:**
- Automated: npm audit on every PR
- Manual: Penetration testing before major releases
- Continuous: Security monitoring in production

### Performance Monitoring and Alerting

**Performance Metrics to Monitor:**

**Frontend (via Vercel Analytics / Google Analytics):**
- First Contentful Paint (FCP): < 1.8s
- Largest Contentful Paint (LCP): < 2.5s
- Cumulative Layout Shift (CLS): < 0.1
- First Input Delay (FID): < 100ms
- Time to Interactive (TTI): < 3.8s

**Backend (via Application Performance Monitoring):**
- API response time P50: < 200ms
- API response time P95: < 1000ms
- API response time P99: < 2000ms
- Error rate: < 1%
- Throughput: > 100 req/sec

**Alerting Rules:**
```yaml
# Example alerting configuration (PagerDuty, Datadog, etc.)
alerts:
  - name: Slow API Response
    condition: p95_response_time > 2000ms for 5 minutes
    severity: warning
    notify: on-call-engineer

  - name: High Error Rate
    condition: error_rate > 5% for 2 minutes
    severity: critical
    notify: on-call-engineer, tech-lead

  - name: Geocoding API Failures
    condition: geocoding_failures > 10% for 5 minutes
    severity: warning
    notify: on-call-engineer

  - name: Database Query Slow
    condition: location_search_duration > 3000ms
    severity: warning
    notify: backend-team
```

**Performance Testing in CI/CD:**
```yaml
# Performance regression testing
- name: Lighthouse CI
  run: |
    npm install -g @lhci/cli
    lhci autorun --config=lighthouserc.js
    # Fails if performance score < 90
```

## Compliance Validation

### Regulatory Compliance Requirements

**GDPR Compliance (EU Data Protection):**
- [ ] User consent for data collection (location addresses are business data, minimal risk)
- [ ] Right to access: API endpoint for vendor to download their location data
- [ ] Right to erasure: Vendor can request profile deletion including all locations
- [ ] Right to rectification: Vendor can update/correct locations anytime
- [ ] Data minimization: Only collect necessary location fields (address, city, country, coords)
- [ ] Data portability: Export locations as JSON or CSV
- [ ] Audit trail: Log who changed locations and when

**CCPA Compliance (California Privacy):**
- [ ] Privacy policy discloses location data collection and use
- [ ] Vendors can opt-out of data sharing (not applicable, business directory)
- [ ] Do Not Sell My Personal Information: Not applicable (business addresses, not personal info)

**Accessibility Compliance (WCAG 2.1 AA):**
- [ ] All form inputs have labels with for/id associations
- [ ] Keyboard navigation: Tab through all interactive elements
- [ ] Focus indicators visible and high contrast
- [ ] Screen reader announcements for dynamic content (location added/removed)
- [ ] Color contrast ratio ≥ 4.5:1 for normal text, ≥ 3:1 for large text
- [ ] Alt text for all images (logos, map markers)
- [ ] Error messages associated with form fields (aria-describedby)
- [ ] Skip links for keyboard users
- [ ] Responsive design works with 200% zoom

**Compliance Testing:**
- Automated: axe-core for accessibility violations (run in E2E tests)
- Manual: Screen reader testing (NVDA on Windows, VoiceOver on Mac)
- Manual: Keyboard-only navigation testing
- Annual: GDPR compliance audit by legal team

### Industry Standard Adherence

**Web Standards:**
- HTML5 semantic markup
- WAI-ARIA for dynamic content
- Progressive enhancement (works without JavaScript for basic info display)
- Responsive design using CSS Grid and Flexbox

**API Standards:**
- RESTful API design (GET, PATCH with proper HTTP verbs)
- JSON payloads with consistent structure
- HTTP status codes follow RFC 7231 (200, 400, 403, 500, etc.)
- API versioning via URL path (future: /api/v2/vendors)

**Security Standards:**
- OWASP Top 10 mitigation
- HTTPS/TLS 1.3 for all communication
- JWT for authentication (RFC 7519)
- CORS policy configured for same-origin + approved domains

**Code Standards:**
- TypeScript for type safety
- ESLint + Prettier for consistent formatting
- Conventional Commits for commit messages
- Semantic Versioning for releases (major.minor.patch)

### Audit Trail and Documentation Requirements

**Change Audit Trail:**
```typescript
// Optional: Audit log for location changes
interface LocationAuditLog {
  vendorId: string;
  userId: string;
  action: 'create' | 'update' | 'delete';
  locationIndex: number;
  before: VendorLocation | null;
  after: VendorLocation | null;
  timestamp: Date;
  ipAddress: string;
}

// In Payload CMS afterChange hook
hooks: {
  afterChange: [
    async ({ req, doc, previousDoc, operation }) => {
      if (operation === 'update' && doc.locations !== previousDoc.locations) {
        await payload.create({
          collection: 'audit-logs',
          data: {
            vendorId: doc.id,
            userId: req.user.id,
            action: 'update',
            before: previousDoc.locations,
            after: doc.locations,
            timestamp: new Date(),
            ipAddress: req.ip,
          },
        });
      }
    },
  ],
}
```

**Documentation Requirements:**
- [ ] API documentation updated (OpenAPI/Swagger spec)
- [ ] User guide for vendors (how to add/manage locations)
- [ ] Admin guide for support team (troubleshooting location issues)
- [ ] Developer guide (architecture, integration points)
- [ ] Changelog entry with breaking changes (migration required)
- [ ] Release notes for stakeholders

**Documentation Standards:**
- All documentation in Markdown format
- Code examples include TypeScript types
- Screenshots for UI features
- Diagrams for architecture and data flow
- Version numbers and dates on all documentation

**Required Documentation Files:**
- README.md: Feature overview and setup instructions
- CHANGELOG.md: Version history with feature additions
- API.md: API endpoint specifications
- ARCHITECTURE.md: System architecture and design decisions
- CONTRIBUTING.md: Guidelines for contributors
- LICENSE: Software license (MIT, Apache 2.0, etc.)
