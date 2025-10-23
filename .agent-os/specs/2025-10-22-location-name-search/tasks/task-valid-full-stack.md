# Task: valid-full-stack - Validate Full-Stack Completeness

**Metadata:**
- **Task ID:** valid-full-stack
- **Phase:** Phase 4: Frontend-Backend Integration
- **Agent:** integration-coordinator
- **Estimated Time:** 15-20 min
- **Dependencies:** test-e2e-workflow
- **Status:** Pending
- **Priority:** High

## Description

Perform comprehensive validation that all aspects of the location name search feature are complete, integrated, and functioning correctly across the entire stack.

## Specifics

**Validation Checklist:**

### 1. Backend Validation
- [ ] /api/geocode endpoint implemented and accessible
- [ ] Photon API proxy working correctly
- [ ] Rate limiting enforced (10 req/min per IP)
- [ ] Error handling comprehensive (400, 429, 500, 503)
- [ ] Response transformation accurate
- [ ] Timeout handling implemented (5 seconds)
- [ ] All backend unit tests passing
- [ ] Backend integration tests passing

### 2. Frontend Validation
- [ ] LocationSearchFilter component implemented
- [ ] LocationResultSelector component implemented
- [ ] Location name input with debouncing (300ms)
- [ ] Single result auto-apply working
- [ ] Multiple results show dialog
- [ ] Result selection applies filter
- [ ] Advanced coordinate input available
- [ ] Distance slider functional
- [ ] Reset button clears all filters
- [ ] All frontend unit tests passing

### 3. Type Safety Validation
- [ ] All TypeScript types defined in lib/types.ts
- [ ] PhotonFeature type matches Photon API
- [ ] GeocodeResult type correct
- [ ] GeocodeResponse type correct
- [ ] No `any` types used
- [ ] Type compilation succeeds
- [ ] Type inference works correctly

### 4. Unit Mismatch Fix Validation
- [ ] calculateDistance returns kilometers
- [ ] useLocationFilter uses kilometers
- [ ] UI displays kilometers correctly
- [ ] All distance calculations consistent
- [ ] Tests updated for km expectations
- [ ] No miles references remaining

### 5. Integration Validation
- [ ] Frontend communicates with backend correctly
- [ ] API contract followed by both sides
- [ ] Real Photon API integration working
- [ ] Error propagation working
- [ ] State synchronization correct
- [ ] Frontend-backend integration tests passing

### 6. E2E Validation
- [ ] All E2E tests passing (Chromium, Firefox, WebKit)
- [ ] Mobile viewport tests passing
- [ ] Simple search workflow working
- [ ] Ambiguous search workflow working
- [ ] Error handling workflow working
- [ ] Reset workflow working
- [ ] Advanced coordinate input working
- [ ] Distance slider workflow working

### 7. User Experience Validation
- [ ] Loading states clear and visible
- [ ] Error messages user-friendly
- [ ] Empty states informative
- [ ] Responsive design on all screen sizes
- [ ] Touch targets adequate (44x44px mobile)
- [ ] Keyboard navigation working
- [ ] Focus indicators visible

### 8. Performance Validation
- [ ] Search response time < 2 seconds
- [ ] Debouncing reduces API calls
- [ ] No memory leaks over repeated searches
- [ ] Smooth animations (no jank)
- [ ] Rate limiting prevents abuse

### 9. Accessibility Validation
- [ ] ARIA labels present
- [ ] Keyboard navigation complete
- [ ] Focus management correct
- [ ] Screen reader friendly
- [ ] Color contrast meets WCAG AA
- [ ] Lighthouse accessibility score > 90

### 10. Documentation Validation
- [ ] API spec accurate and complete
- [ ] Technical spec up to date
- [ ] Type definitions documented (JSDoc)
- [ ] Error codes documented
- [ ] User-facing help available (if needed)

**Validation Method:**
- Execute automated test suites
- Manual validation of key workflows
- Code review of all implementations
- Documentation review
- Performance profiling
- Accessibility audit

## Acceptance Criteria

- [ ] All automated tests passing (100%)
- [ ] All manual validation items checked
- [ ] No critical issues identified
- [ ] Performance metrics within acceptable range
- [ ] Accessibility audit passed
- [ ] Documentation complete and accurate
- [ ] Code review approved
- [ ] Feature ready for final validation phase

## Testing Requirements

**Functional Testing:**
- Run all test suites:
  ```bash
  # Unit tests
  npm test

  # Integration tests
  npm test -- integration

  # E2E tests
  npm run test:e2e

  # Type checking
  npm run type-check

  # Linting
  npm run lint
  ```

**Manual Verification:**
- Complete manual test checklist (all 10 scenarios)
- Review test reports for all suites
- Verify no test failures or warnings
- Check code coverage reports

**Performance Testing:**
- Run performance profiling
- Verify metrics meet requirements
- Check for memory leaks
- Monitor network requests

**Accessibility Testing:**
- Run Lighthouse audit
- Test with screen reader (NVDA/JAWS/VoiceOver)
- Verify keyboard navigation
- Check color contrast

**Evidence Required:**
- Test execution reports (all suites passing)
- Manual validation checklist completed
- Performance profiling results
- Accessibility audit results
- Code review sign-off
- Documentation review sign-off

## Context Requirements

**Required Context:**
- @.agent-os/specs/2025-10-22-location-name-search/spec.md
- @.agent-os/specs/2025-10-22-location-name-search/sub-specs/technical-spec.md
- @.agent-os/specs/2025-10-22-location-name-search/sub-specs/api-spec.md
- All task implementations
- All test results

**Assumptions:**
- All implementation tasks completed
- All tests written and passing
- Feature deployed to dev environment
- Documentation updated

## Implementation Notes

**Validation Script:**

```bash
#!/bin/bash
# validate-full-stack.sh

echo "Starting full-stack validation..."

# 1. Run type checking
echo "Running type check..."
npm run type-check || exit 1

# 2. Run linting
echo "Running linting..."
npm run lint || exit 1

# 3. Run unit tests
echo "Running unit tests..."
npm test -- --coverage || exit 1

# 4. Run integration tests
echo "Running integration tests..."
npm test -- integration || exit 1

# 5. Run E2E tests
echo "Running E2E tests..."
npm run test:e2e || exit 1

# 6. Build project
echo "Building project..."
npm run build || exit 1

echo "All automated validations passed!"
```

**Manual Validation Checklist Template:**

```markdown
# Full-Stack Validation Checklist

**Date:** 2025-10-22
**Validator:** [Name]
**Environment:** Development

## Backend
- [ ] /api/geocode endpoint accessible
- [ ] Photon API proxy working
- [ ] Rate limiting enforced
- [ ] Error handling correct
- [ ] Response format correct
- [ ] Tests passing

## Frontend
- [ ] LocationSearchFilter working
- [ ] LocationResultSelector working
- [ ] Debouncing working
- [ ] Auto-apply working
- [ ] Dialog working
- [ ] Advanced input working
- [ ] Distance slider working
- [ ] Reset button working
- [ ] Tests passing

## Types
- [ ] All types defined
- [ ] Type compilation succeeds
- [ ] No `any` types

## Unit Fix
- [ ] Distance in kilometers
- [ ] UI shows kilometers
- [ ] Tests updated

## Integration
- [ ] Frontend-backend communication
- [ ] API contract followed
- [ ] Photon API working
- [ ] Tests passing

## E2E
- [ ] All browsers tested
- [ ] Mobile tested
- [ ] All workflows tested
- [ ] Tests passing

## UX
- [ ] Loading states clear
- [ ] Error messages good
- [ ] Responsive design
- [ ] Touch targets adequate

## Performance
- [ ] Response time < 2s
- [ ] Debouncing working
- [ ] No memory leaks

## Accessibility
- [ ] ARIA labels present
- [ ] Keyboard navigation
- [ ] Screen reader friendly
- [ ] Lighthouse score > 90

## Documentation
- [ ] API spec accurate
- [ ] Technical spec updated
- [ ] JSDoc complete

**Issues Found:** [List any issues]

**Sign-off:** [Name/Date]
```

**Performance Profiling Checklist:**

```markdown
## Performance Validation

### Response Times
- [ ] Simple search (Monaco): < 1 second
- [ ] Ambiguous search (Paris): < 2 seconds
- [ ] Postal code search (90210): < 2 seconds
- [ ] Regional search (California): < 2 seconds

### Debouncing
- [ ] Rapid typing (6 keystrokes): 1 API call
- [ ] Debounce delay: 300ms ± 50ms

### Memory Usage
- [ ] Initial page load: [X] MB
- [ ] After 20 searches: [X] MB
- [ ] Memory leak: None detected

### Animations
- [ ] Dialog open/close: Smooth (60fps)
- [ ] Collapsible expand: Smooth (60fps)
- [ ] Loading spinner: Smooth (60fps)

### Network
- [ ] API request size: < 1 KB
- [ ] API response size: < 10 KB (typical)
- [ ] Concurrent requests: No issues
```

**Accessibility Audit Checklist:**

```markdown
## Accessibility Validation

### Lighthouse Audit
- [ ] Accessibility score: [X]/100 (target: >90)
- [ ] Issues found: [List]
- [ ] Issues resolved: [Yes/No]

### Screen Reader Testing
- [ ] Location input announces correctly
- [ ] Loading state announced
- [ ] Results list navigable
- [ ] Dialog announces properly
- [ ] Error messages announced
- [ ] Success states announced

### Keyboard Navigation
- [ ] Tab through all interactive elements
- [ ] Enter key selects results
- [ ] Escape key closes dialog
- [ ] Arrow keys navigate results

### Color Contrast
- [ ] Input text: [X:1] (target: 4.5:1)
- [ ] Error text: [X:1] (target: 4.5:1)
- [ ] Button text: [X:1] (target: 4.5:1)
- [ ] Label text: [X:1] (target: 4.5:1)

### Focus Indicators
- [ ] All focusable elements have visible focus
- [ ] Focus order logical
- [ ] Focus not trapped (except in dialog)
```

## Quality Gates

- [ ] All automated tests passing (100%)
- [ ] Manual validation checklist complete
- [ ] Performance metrics acceptable
- [ ] Accessibility audit passed (>90)
- [ ] Code review approved
- [ ] Documentation complete
- [ ] No critical issues identified
- [ ] Feature ready for production

## Related Files

**Spec Files:**
- @.agent-os/specs/2025-10-22-location-name-search/spec.md
- @.agent-os/specs/2025-10-22-location-name-search/sub-specs/technical-spec.md
- @.agent-os/specs/2025-10-22-location-name-search/sub-specs/api-spec.md
- @.agent-os/specs/2025-10-22-location-name-search/sub-specs/tests.md

**Implementation Files:**
- All backend files (app/api/geocode/)
- All frontend files (components/, hooks/)
- All test files (tests/unit/, tests/integration/, tests/e2e/)
- Type definitions (lib/types.ts)

**Related Tasks:**
- task-test-e2e-workflow (prerequisite)
- task-final-integration (next phase)
