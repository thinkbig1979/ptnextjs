# Quality Gates

> Spec: Vendor Location Mapping
> Created: 2025-10-19

## Quality Metrics Thresholds

### Code Coverage

**Minimum Coverage**: 80% overall

**Component-Level Targets**:
- **Utility Functions** (distance calculation): 100%
- **Custom Hooks** (useLocationFilter): 90%
- **React Components**: 85%
- **Integration Code**: 75%

**Coverage Measurement**: Jest with nyc/istanbul

**Enforcement**: CI pipeline fails if coverage drops below threshold

### Performance Benchmarks

**Map Rendering**:
- **Target**: < 2 seconds from page load to interactive map
- **Measurement**: Lighthouse performance audit
- **Threshold**: Must maintain Lighthouse performance score ≥ 90

**Location Search**:
- **Target**: < 1 second total (geocoding + filtering)
- **Measurement**: Chrome DevTools performance timeline
- **Breakdown**:
  - Geocoding API response: < 500ms
  - Distance calculation + filtering: < 500ms

**Page Load**:
- **Vendor Detail Page with Map**: < 3 seconds total load time
- **Vendor Listing with Location Search**: < 2 seconds initial load

### Security Thresholds

**Input Validation**:
- **Latitude**: Must be between -90 and 90
- **Longitude**: Must be between -180 and 180
- **Address Input**: Sanitized to prevent XSS

**Vulnerability Scanning**:
- **npm audit**: Zero high or critical vulnerabilities in dependencies
- **Snyk**: No known vulnerabilities in mapbox-gl or related packages

**Security Headers**:
- Content Security Policy: Allow map tiles from openfreemap.org and nominatim.openstreetmap.org

### Maintainability

**Code Complexity**: Cyclomatic complexity ≤ 10 for all functions

**Code Duplication**: < 3% duplicated code (detected by SonarQube or similar)

**Technical Debt Ratio**: < 5% (time to fix issues / development time)

**ESLint Violations**: Zero errors, < 5 warnings

## Validation Criteria

### Automated Quality Checks

**Linting**:
```bash
npm run lint
# Must pass with 0 errors
```

**Type Checking**:
```bash
npm run type-check
# Must pass with 0 TypeScript errors
```

**Unit Tests**:
```bash
npm run test
# All tests must pass
# Coverage must be ≥ 80%
```

**Build Verification**:
```bash
npm run build
# Static build must succeed
# No build errors or warnings
```

**Bundle Size**:
- Mapbox GL JS bundle: ~500KB (acceptable for map functionality)
- Total JS bundle increase: < 600KB (map + geocoding + utilities)

### Manual Review and Approval

**Code Review Checklist**:
- [ ] TypeScript types properly defined for all new code
- [ ] Component props documented with JSDoc comments
- [ ] Error handling implemented for all async operations
- [ ] Accessibility: Keyboard navigation and ARIA labels present
- [ ] Responsive design tested on mobile and desktop
- [ ] No console.log statements in production code
- [ ] Location data handled gracefully when missing
- [ ] Rate limiting respected for Nominatim API

**Design Review**:
- [ ] Map integrates visually with existing vendor page design
- [ ] Location search filter fits naturally in existing filter panel
- [ ] Distance badges display clearly without cluttering vendor cards
- [ ] Loading states provide clear feedback to users
- [ ] Error messages are user-friendly and actionable

### Stakeholder Acceptance Criteria

**User Acceptance Testing**:
1. **View vendor location**: Navigate to vendor page → see map with correct location
2. **Search by location**: Enter "Monaco" + 50 miles → see filtered vendors sorted by distance
3. **Handle missing data**: View vendor without location → see graceful fallback message
4. **Mobile experience**: Test on mobile device → map and search work responsively

**Acceptance Sign-off**: Product owner approval required before production deployment

## Automated Quality Checks

### Static Code Analysis

**ESLint Configuration**:
```json
{
  "extends": ["next/core-web-vitals", "plugin:@typescript-eslint/recommended"],
  "rules": {
    "complexity": ["error", 10],
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/explicit-function-return-type": "warn"
  }
}
```

**Pre-commit Hooks** (Husky):
```bash
# .husky/pre-commit
npm run lint
npm run type-check
npm run test:changed
```

### Security Scanning

**Dependency Audit**:
```bash
npm audit --production
# Must have 0 high or critical vulnerabilities
```

**License Compliance**:
- Verify mapbox-gl license compatibility (BSD-3-Clause)
- Ensure all dependencies have permissive licenses

### Performance Monitoring

**Lighthouse CI** (automated on every PR):
```yaml
# lighthouserc.json
{
  "ci": {
    "collect": {
      "url": [
        "http://localhost:3000/vendors/test-vendor",
        "http://localhost:3000/vendors"
      ]
    },
    "assert": {
      "assertions": {
        "performance": ["error", { "minScore": 0.9 }],
        "accessibility": ["error", { "minScore": 0.95 }]
      }
    }
  }
}
```

**Bundle Analysis** (webpack-bundle-analyzer):
- Run on each build
- Alert if total bundle size increases > 10%

## Compliance Validation

### Regulatory Compliance

**GDPR**: No personal data collected (vendor location is public business information)

**Accessibility**: WCAG 2.1 AA compliance required

**Accessibility Checklist**:
- [ ] Map has ARIA label: "Interactive map showing vendor location"
- [ ] Keyboard navigation: Tab through map controls
- [ ] Screen reader: Location info announced when map loads
- [ ] Color contrast: Distance badges meet 4.5:1 contrast ratio
- [ ] Focus indicators: Visible on all interactive elements

### Industry Standards

**OpenStreetMap Usage Policy**: Comply with Nominatim usage policy
- Provide User-Agent header with contact info
- Respect 1 request/second rate limit
- Cache geocoding results to minimize requests

**Attribution Requirements**:
- Display OpenFreeMap attribution on maps: "© OpenStreetMap contributors"
- Include attribution in map footer or corner

### Audit Trail

**Change Log**:
- Document all schema changes in CHANGELOG.md
- Track vendor location data additions in CMS audit log (Payload built-in)

**Deployment Records**:
- Git commit history for all code changes
- Migration scripts versioned and tracked

## Quality Gate Enforcement

### Gate 1: Development Complete

**Criteria**:
- [ ] All components implemented and unit tested
- [ ] TypeScript compilation successful with 0 errors
- [ ] ESLint passes with 0 errors
- [ ] Code coverage ≥ 80%

**Action if Failed**: Return to development, address issues

### Gate 2: Code Review Approved

**Criteria**:
- [ ] Pull request approved by at least one reviewer
- [ ] All review comments addressed
- [ ] Code follows project conventions and standards
- [ ] Documentation updated (README, JSDoc comments)

**Action if Failed**: Address review feedback, request re-review

### Gate 3: Automated Tests Pass

**Criteria**:
- [ ] All unit tests passing
- [ ] All component tests passing
- [ ] All E2E tests passing
- [ ] No console errors in test runs

**Action if Failed**: Debug and fix failing tests, do not proceed

### Gate 4: Performance and Accessibility

**Criteria**:
- [ ] Lighthouse performance score ≥ 90
- [ ] Lighthouse accessibility score ≥ 95
- [ ] Bundle size increase acceptable (< 600KB)
- [ ] Map loads in < 2 seconds

**Action if Failed**: Optimize performance, reduce bundle size, improve accessibility

### Gate 5: User Acceptance Testing

**Criteria**:
- [ ] Product owner has tested all user workflows
- [ ] No critical bugs or UX issues identified
- [ ] Feature works as expected on production-like environment
- [ ] Mobile and desktop testing complete

**Action if Failed**: Address UAT issues, request re-test

### Gate 6: Production Readiness

**Criteria**:
- [ ] All previous gates passed
- [ ] No known critical or high-priority bugs
- [ ] Rollback plan documented
- [ ] Deployment checklist complete

**Action if Passed**: Proceed to production deployment

**Action if Failed**: Address remaining issues, do not deploy

## Quality Reporting

**Quality Dashboard** (GitHub Actions summary):
- Test results: ✅ 145/145 tests passing
- Coverage: ✅ 87% (target: 80%)
- Lighthouse Performance: ✅ 92 (target: 90)
- Lighthouse Accessibility: ✅ 98 (target: 95)
- Bundle Size: ✅ +520KB (target: < 600KB)
- Security Vulnerabilities: ✅ 0 high/critical

**Weekly Quality Review**:
- Review quality metrics trends
- Address any degradation in coverage or performance
- Update quality thresholds if needed
