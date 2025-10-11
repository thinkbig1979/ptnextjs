# Quality Gates

This is the quality gates specification for the spec detailed in @.agent-os/specs/2025-10-11-payload-cms-vendor-enrollment/spec.md

## Quality Metrics and Thresholds

### Code Coverage

**Minimum Coverage Requirements**:
- **Overall Coverage**: ≥ 80%
- **Services**: ≥ 85% (critical business logic)
- **API Routes**: ≥ 80% (core integration points)
- **Components**: ≥ 75% (UI components)
- **Utilities**: ≥ 90% (pure functions, highest testability)

**Coverage Types**:
- **Line Coverage**: Percentage of executable lines tested
- **Branch Coverage**: Percentage of conditional branches tested
- **Function Coverage**: Percentage of functions called in tests
- **Statement Coverage**: Percentage of statements executed

**Enforcement**:
- Jest configured with `coverageThreshold` in jest.config.js
- CI/CD pipeline fails if coverage falls below thresholds
- Pull requests blocked until coverage requirements met
- Coverage reports uploaded to Codecov for trend analysis

### Performance Benchmarks

**Response Time Thresholds**:
- **API Endpoints**: < 200ms average, < 500ms 95th percentile
- **Database Queries**: < 100ms simple queries, < 500ms complex queries
- **Page Load (FCP)**: < 2 seconds on 4G mobile network
- **Time to Interactive (TTI)**: < 3.5 seconds on 4G mobile network

**Throughput Requirements**:
- **Concurrent Users**: Support 100 simultaneous users without degradation
- **API Requests**: Handle 10,000 requests per hour
- **Database Connections**: Maintain stable connection pool (max 20 connections)

**Resource Limits**:
- **Memory Usage**: < 512MB per Next.js instance
- **CPU Usage**: < 70% average during normal load
- **Database Size**: < 10GB initial, 1GB growth per 1000 vendors

**Performance Monitoring**:
- Lighthouse CI runs on every PR with performance budget enforcement
- API response times logged and monitored with Vercel Analytics
- Database slow query log enabled (queries > 1 second)
- Alert triggered if 95th percentile exceeds 500ms for 5 minutes

### Security Standards

**OWASP Top 10 Compliance**:
- ✅ **A01 Broken Access Control**: Role-based access control enforced at middleware level
- ✅ **A02 Cryptographic Failures**: Passwords hashed with bcrypt (12 rounds), TLS 1.3 in production
- ✅ **A03 Injection**: Parameterized queries only, no string concatenation for SQL
- ✅ **A04 Insecure Design**: Secure architecture with defense in depth (UI + API tier checks)
- ✅ **A05 Security Misconfiguration**: Environment variables for secrets, no defaults in code
- ✅ **A06 Vulnerable Components**: npm audit in CI/CD, dependencies updated quarterly
- ✅ **A07 Authentication Failures**: Strong password policy, JWT tokens with expiration
- ✅ **A08 Software Integrity**: Subresource Integrity (SRI) for CDN assets, signed npm packages
- ✅ **A09 Logging Failures**: Comprehensive logging of authentication events and errors
- ✅ **A10 Server-Side Request Forgery**: No user-controlled URL fetching in backend

**Vulnerability Thresholds**:
- **Critical Vulnerabilities**: 0 allowed (must be fixed immediately)
- **High Vulnerabilities**: 0 allowed (must be fixed within 48 hours)
- **Medium Vulnerabilities**: < 5 allowed (fix within 1 week)
- **Low Vulnerabilities**: < 20 allowed (fix within 1 month)

**Security Scanning**:
- `npm audit` run in CI/CD pipeline
- Snyk or Dependabot enabled for vulnerability alerts
- Manual security review for authentication and authorization code
- Penetration testing before production deployment (optional but recommended)

### Maintainability Metrics

**Code Complexity**:
- **Cyclomatic Complexity**: < 10 per function (enforced by ESLint)
- **Function Length**: < 50 lines per function (guideline, not enforced)
- **File Length**: < 300 lines per file (guideline, not enforced)
- **Cognitive Complexity**: < 15 (enforced by ESLint plugin)

**Code Quality Scores**:
- **ESLint**: 0 errors, < 10 warnings per PR
- **TypeScript**: Strict mode enabled, 0 type errors
- **Code Duplication**: < 5% duplicated code (measured by SonarQube or similar)

**Technical Debt**:
- **TODO Comments**: < 20 in codebase (track in issue tracker instead)
- **Deprecated APIs**: 0 usage of deprecated Next.js or React features
- **Code Smells**: Address all "major" code smells identified by static analysis

**Documentation Requirements**:
- All public APIs have TSDoc comments
- All services have class-level documentation
- README updated with setup instructions
- CHANGELOG maintained for all releases

## Validation Criteria

### Automated Quality Checks

**Pre-Commit Checks** (Husky + lint-staged):
```json
{
  "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
  "*.{json,md}": ["prettier --write"]
}
```

**Pre-Push Checks**:
- Type checking: `npm run type-check`
- Unit tests: `npm run test:unit`
- Linting: `npm run lint`

**CI/CD Pipeline Checks**:
```yaml
# Runs on every PR and push to main
- Type checking (TypeScript strict mode)
- Linting (ESLint with recommended rules)
- Unit tests (Jest with 80%+ coverage)
- Integration tests (API routes with test database)
- E2E tests (Playwright critical paths)
- Security scan (npm audit)
- Performance budget (Lighthouse CI)
- Build verification (Next.js production build)
```

**Static Code Analysis**:
- **ESLint**: Enforces code style and best practices
- **TypeScript Compiler**: Enforces type safety
- **Prettier**: Enforces consistent formatting
- **SonarQube (optional)**: Detects code smells, bugs, and security hotspots

### Manual Review and Approval Processes

**Code Review Checklist**:
- [ ] Code follows project conventions (naming, structure, patterns)
- [ ] All tests pass (unit, integration, E2E)
- [ ] Test coverage ≥ 80% for new code
- [ ] No TypeScript errors or ESLint warnings
- [ ] Security best practices followed (input validation, auth checks)
- [ ] Performance considered (database indexes, query optimization)
- [ ] Documentation updated (TSDoc comments, README)
- [ ] No hardcoded secrets or sensitive data
- [ ] Error handling implemented for all edge cases
- [ ] Accessibility requirements met (WCAG 2.1 AA for UI components)

**Review Approval Requirements**:
- **Standard PRs**: 1 approving review from team member
- **Critical PRs** (authentication, authorization, database schema): 2 approving reviews, including lead developer
- **Hotfixes**: 1 approving review, can be merged immediately after approval

**Pull Request Size Guidelines**:
- **Ideal**: < 400 lines changed
- **Maximum**: < 1000 lines changed
- Large PRs should be split into smaller, reviewable chunks

### Stakeholder Acceptance Criteria

**Feature Acceptance Checklist**:
- [ ] All spec requirements implemented
- [ ] User stories validated by product owner
- [ ] UI/UX reviewed and approved by design team
- [ ] Functionality tested by QA team
- [ ] Performance benchmarks met (< 500ms API response times)
- [ ] Security review completed with no critical issues
- [ ] Accessibility audit passed (WCAG 2.1 AA)
- [ ] Documentation reviewed and approved
- [ ] Stakeholders trained on new features (if applicable)
- [ ] Rollback plan documented and tested

**User Acceptance Testing (UAT)**:
- **Participants**: Product owner, key stakeholders, pilot users
- **Duration**: 1 week before production deployment
- **Test Scenarios**:
  - Vendor can register and receive "pending approval" status
  - Admin can approve/reject vendor registrations
  - Approved vendor can log in and edit profile
  - Tier restrictions enforced (free tier cannot access tier 2 features)
  - Public pages display migrated content correctly
  - No functionality regression compared to TinaCMS version
- **Sign-off**: Product owner must sign off before production deployment

## Automated Quality Checks Configuration

### Static Code Analysis Configuration

**ESLint Configuration** (.eslintrc.json):
```json
{
  "extends": [
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "prettier"
  ],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "project": "./tsconfig.json"
  },
  "rules": {
    "complexity": ["error", 10],
    "max-lines-per-function": ["warn", 50],
    "no-console": "warn",
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }]
  }
}
```

**TypeScript Configuration** (tsconfig.json):
```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noImplicitReturns": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

**Prettier Configuration** (.prettierrc):
```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "arrowParens": "always"
}
```

### Security Scanning and Vulnerability Assessment

**npm Audit**:
- Run `npm audit` in CI/CD pipeline
- Fail build if critical or high vulnerabilities found
- Generate audit report for review
- Use `npm audit fix` for automatic fixes when safe

**Dependency Scanning Tools**:
- **Snyk**: Continuous monitoring for vulnerabilities
- **Dependabot**: Automatic PRs for dependency updates
- **OWASP Dependency Check**: Identify known vulnerable components

**Security Checklist**:
- [ ] All dependencies up to date (no outdated packages > 6 months old)
- [ ] No critical or high vulnerabilities in dependencies
- [ ] Secrets stored in environment variables, not committed to repository
- [ ] API routes validate and sanitize all user input
- [ ] Authentication required for all protected routes
- [ ] Authorization checks enforce role and tier restrictions
- [ ] Passwords hashed with bcrypt (12 rounds minimum)
- [ ] JWT tokens stored in httpOnly cookies
- [ ] Rate limiting enabled on authentication endpoints
- [ ] HTTPS enforced in production

### Performance Monitoring and Alerting

**Monitoring Tools**:
- **Vercel Analytics**: Frontend performance metrics (Web Vitals)
- **Application Performance Monitoring (APM)**: API response times, error rates
- **Database Monitoring**: Query performance, connection pool usage
- **Error Tracking**: Sentry or similar for exception monitoring

**Performance Budget** (Lighthouse CI):
```json
{
  "ci": {
    "collect": {
      "numberOfRuns": 3
    },
    "assert": {
      "preset": "lighthouse:recommended",
      "assertions": {
        "first-contentful-paint": ["error", { "maxNumericValue": 2000 }],
        "speed-index": ["error", { "maxNumericValue": 3000 }],
        "interactive": ["error", { "maxNumericValue": 3500 }],
        "max-potential-fid": ["error", { "maxNumericValue": 130 }],
        "cumulative-layout-shift": ["error", { "maxNumericValue": 0.1 }],
        "total-byte-weight": ["error", { "maxNumericValue": 1000000 }]
      }
    }
  }
}
```

**Alerting Thresholds**:
- **Error Rate**: > 1% for 5 minutes → Alert dev team
- **API Response Time**: 95th percentile > 500ms for 5 minutes → Alert on-call
- **Database Connections**: > 18 (90% of max) for 10 minutes → Alert DBA
- **Memory Usage**: > 400MB (80% of limit) for 10 minutes → Alert DevOps
- **Failed Logins**: > 50 per minute from single IP → Alert security team

## Compliance Validation

### Regulatory Compliance Requirements

**Note**: Compliance requirements depend on jurisdictions where platform operates and data processed. Below are common requirements for SaaS platforms.

**General Data Protection Regulation (GDPR)** (if serving EU customers):
- [ ] User consent obtained for data processing
- [ ] Privacy policy clearly states data usage
- [ ] Users can request data export (right to data portability)
- [ ] Users can request data deletion (right to erasure)
- [ ] Data breach notification process in place
- [ ] Data Processing Agreement (DPA) for third-party services

**California Consumer Privacy Act (CCPA)** (if serving California residents):
- [ ] Privacy policy includes CCPA disclosures
- [ ] "Do Not Sell My Personal Information" option (if applicable)
- [ ] Users can request data deletion
- [ ] Users can opt out of data sharing

**Accessibility Compliance (WCAG 2.1 AA)**:
- [ ] All interactive elements keyboard accessible
- [ ] Sufficient color contrast (4.5:1 for normal text, 3:1 for large text)
- [ ] Images have alt text
- [ ] Form inputs have associated labels
- [ ] Focus indicators visible
- [ ] Screen reader compatible
- [ ] No flashing content (seizure risk)

### Industry Standard Adherence

**Web Development Standards**:
- **HTML5**: Valid, semantic HTML
- **CSS3**: Modern CSS with vendor prefixes where needed
- **ECMAScript 2022**: Modern JavaScript features
- **HTTP/2**: Efficient protocol for asset loading
- **JSON**: Standard data exchange format

**API Design Standards**:
- **REST**: Resource-based URLs, standard HTTP methods
- **JSON API**: Consistent response format
- **Pagination**: Limit/offset or cursor-based pagination
- **Filtering**: Query parameters for filtering and sorting
- **Versioning**: URL path versioning for backward compatibility

**Security Standards**:
- **OWASP Top 10**: Mitigations implemented
- **CWE Top 25**: Common weakness enumeration addressed
- **NIST Cybersecurity Framework**: Best practices followed
- **PCI DSS** (if processing payments): Not applicable (payment processing deferred)

### Audit Trail and Documentation Requirements

**Audit Logging**:
- **Authentication Events**: Login attempts (success/failure), logout, token refresh
- **Authorization Events**: Permission denied events, role changes, tier upgrades
- **Data Modifications**: Vendor profile updates, admin approvals/rejections
- **Security Events**: Failed login attempts, rate limit violations, suspicious activity

**Audit Log Format**:
```json
{
  "timestamp": "2025-10-11T12:34:56Z",
  "eventType": "VENDOR_APPROVED",
  "actorId": "admin-user-id",
  "actorRole": "admin",
  "targetId": "vendor-user-id",
  "targetType": "vendor",
  "action": "approve",
  "metadata": {
    "tier": "free",
    "ip": "192.168.1.1",
    "userAgent": "Mozilla/5.0..."
  }
}
```

**Documentation Requirements**:
- **API Documentation**: OpenAPI/Swagger spec or equivalent
- **Architecture Documentation**: System diagrams, data flow diagrams
- **Database Schema**: Entity-relationship diagram, table definitions
- **Deployment Guide**: Environment setup, configuration, deployment steps
- **Runbook**: Common operations, troubleshooting, emergency procedures
- **CHANGELOG**: All notable changes, version history
- **README**: Project overview, setup instructions, development workflow

**Document Retention**:
- **Audit Logs**: Retained for 1 year minimum (configurable)
- **Error Logs**: Retained for 90 days
- **Performance Metrics**: Retained for 6 months
- **Code Documentation**: Maintained in repository indefinitely

## Quality Gate Failure Response

### Failure Escalation Process

**Level 1: Automated Check Failure** (CI/CD pipeline):
1. Build fails with clear error message
2. PR blocked from merging
3. Developer notified via GitHub notification
4. Developer fixes issue and pushes new commit
5. CI/CD pipeline re-runs automatically

**Level 2: Review Rejection**:
1. Code reviewer requests changes
2. Developer addresses feedback
3. Developer marks conversation as resolved
4. Reviewer re-reviews and approves or requests further changes

**Level 3: Stakeholder Rejection** (UAT):
1. Stakeholder identifies issue or missing requirement
2. Issue logged in project tracker (Jira, GitHub Issues)
3. Issue triaged by product owner (priority, severity)
4. Development team estimates fix and schedules work
5. Fix implemented, re-tested, re-submitted for UAT

**Level 4: Production Issue**:
1. Production monitoring detects anomaly (error rate spike, performance degradation)
2. On-call engineer alerted via PagerDuty or similar
3. Engineer investigates, determines if rollback needed
4. If critical: Rollback to previous version, incident postmortem scheduled
5. If non-critical: Hotfix PR created, expedited review, deployed

### Remediation Procedures

**Code Quality Issues**:
- Run `npm run lint -- --fix` to auto-fix linting errors
- Run `npm run format` to format code with Prettier
- Run `npm run type-check` to identify TypeScript errors
- Refactor code to reduce complexity (extract functions, simplify logic)

**Test Coverage Issues**:
- Identify untested code paths with coverage report
- Write unit tests for business logic functions
- Write integration tests for API routes
- Write E2E tests for critical user flows
- Aim for 80%+ coverage, prioritize critical paths

**Performance Issues**:
- Profile slow API endpoints with APM tools
- Optimize database queries (add indexes, rewrite queries)
- Implement caching (SWR, Redis, Payload CMS caching)
- Lazy load components and images
- Code split large bundles

**Security Issues**:
- Update vulnerable dependencies: `npm audit fix`
- Review and fix security hotspots identified by static analysis
- Add input validation and sanitization
- Implement rate limiting on vulnerable endpoints
- Conduct penetration testing for critical vulnerabilities

### Continuous Improvement Metrics

**Quality Metrics Tracking**:
- **Test Coverage**: Track trend over time, aim for increasing coverage
- **Code Review Turnaround**: Measure time from PR creation to approval, aim to reduce
- **Build Success Rate**: Percentage of builds that pass CI/CD, aim for > 95%
- **Defect Density**: Bugs per 1000 lines of code, aim to reduce
- **Technical Debt**: Track TODO comments, code smells, aim to reduce

**Performance Metrics Tracking**:
- **API Response Time Trend**: Track 95th percentile over time, aim for stable or decreasing
- **Page Load Time Trend**: Track FCP and TTI over time, aim for stable or decreasing
- **Error Rate Trend**: Track production error rate over time, aim for decreasing

**Process Metrics Tracking**:
- **Deployment Frequency**: How often code deployed to production, aim to increase
- **Lead Time**: Time from commit to production, aim to reduce
- **Mean Time to Recovery (MTTR)**: Time to recover from production incidents, aim to reduce
- **Change Failure Rate**: Percentage of deployments causing issues, aim to reduce

**Retrospective and Improvement**:
- Conduct retrospectives after each sprint or major milestone
- Identify what went well, what could be improved
- Create action items for process improvements
- Track action items to completion
- Continuously refine quality standards and processes
