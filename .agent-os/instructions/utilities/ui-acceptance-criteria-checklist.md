# UI Acceptance Criteria Checklist

> **Version**: 1.0.0 | Agent OS v5.1.0
> **Purpose**: Component-specific acceptance criteria including E2E, accessibility, and browser validation
> **Status**: CANONICAL - Referenced by create-tasks.md and task-*.md templates

---

## Overview

This checklist defines acceptance criteria that MUST be met before any UI component or frontend task can be marked complete. It ensures:

1. **Functional correctness** - Component works as specified
2. **Test coverage** - Appropriate tests exist and pass
3. **Accessibility compliance** - WCAG 2.1 AA standards met
4. **Browser validation** - Renders correctly across environments
5. **Performance** - Core Web Vitals targets met

---

## 1. Component-Level Acceptance Criteria

### 1.1 Presentational Components (Button, Card, Badge, etc.)

```yaml
acceptance_criteria:
  functional:
    - [ ] Component renders without errors
    - [ ] All variants work correctly (primary, secondary, etc.)
    - [ ] All sizes work correctly (sm, md, lg, etc.)
    - [ ] Disabled state functions correctly
    - [ ] Loading state displays correctly (if applicable)

  testing:
    - [ ] Unit tests exist and pass
    - [ ] All props are tested
    - [ ] All user interactions are tested
    - [ ] Accessibility unit test passes (axe-core)

  accessibility:
    - [ ] Correct semantic HTML element used
    - [ ] Accessible name present (aria-label if icon-only)
    - [ ] Focus indicator visible
    - [ ] Color contrast meets WCAG AA (4.5:1 text, 3:1 UI)
    - [ ] Interactive elements are keyboard accessible

  styling:
    - [ ] Follows design system tokens
    - [ ] Responsive across breakpoints (mobile/tablet/desktop)
    - [ ] Dark mode supported (if applicable)
```

### 1.2 Form Components (Input, Select, Checkbox, etc.)

```yaml
acceptance_criteria:
  functional:
    - [ ] Component renders without errors
    - [ ] Value binding works correctly
    - [ ] onChange/onBlur handlers fire correctly
    - [ ] Placeholder displays correctly
    - [ ] Error state displays correctly
    - [ ] Required indicator shows (if required)

  testing:
    - [ ] Unit tests exist and pass
    - [ ] Integration test with form library (RHF/Formik) passes
    - [ ] Validation integration tested
    - [ ] Error message display tested

  accessibility:
    - [ ] Label associated with input (htmlFor/id)
    - [ ] Error messages linked via aria-describedby
    - [ ] Required fields marked with aria-required
    - [ ] Focus management correct on error
    - [ ] Screen reader announces validation errors

  styling:
    - [ ] Error state visually distinct (border + icon)
    - [ ] Focus state visually distinct
    - [ ] Disabled state visually distinct
```

### 1.3 Form Container Components (LoginForm, SettingsForm, etc.)

```yaml
acceptance_criteria:
  functional:
    - [ ] Form renders all fields correctly
    - [ ] Client-side validation works
    - [ ] Form submission triggers API call
    - [ ] Success state handled (redirect/toast)
    - [ ] Error state handled (inline errors)
    - [ ] Loading state shown during submission

  testing:
    - [ ] Unit tests for form logic pass
    - [ ] Integration tests with validation library pass
    - [ ] E2E test for happy path exists and passes
    - [ ] E2E test for error handling exists and passes

  accessibility:
    - [ ] Form has accessible name (aria-label or heading)
    - [ ] Field labels are descriptive
    - [ ] Error summary provided for multiple errors
    - [ ] Focus moves to first error on validation failure
    - [ ] Submit button has clear label

  e2e_requirements:
    - [ ] E2E test tier assigned (smoke/core/regression)
    - [ ] E2E test added to test-inventory.ts
    - [ ] E2E test uses data-testid selectors
```

### 1.4 Data Display Components (Table, List, Card Grid, etc.)

```yaml
acceptance_criteria:
  functional:
    - [ ] Component renders data correctly
    - [ ] Empty state displays when no data
    - [ ] Loading state displays during fetch
    - [ ] Error state displays on fetch failure
    - [ ] Pagination works (if applicable)
    - [ ] Sorting works (if applicable)
    - [ ] Filtering works (if applicable)

  testing:
    - [ ] Unit tests for rendering logic pass
    - [ ] Integration tests with mocked API pass
    - [ ] Empty/loading/error states tested
    - [ ] E2E test for critical data displays

  accessibility:
    - [ ] Semantic table markup (if table)
    - [ ] Headers associated with cells (th/scope)
    - [ ] Empty state is announced
    - [ ] Loading state is announced (aria-busy)
    - [ ] Actionable items are focusable
```

### 1.5 Page Components (DashboardPage, ProfilePage, etc.)

```yaml
acceptance_criteria:
  functional:
    - [ ] Page renders without errors
    - [ ] Page loads required data
    - [ ] Navigation to page works
    - [ ] Navigation from page works
    - [ ] URL parameters handled correctly
    - [ ] Query parameters handled correctly

  testing:
    - [ ] E2E test for page load exists and passes
    - [ ] E2E test for main interactions exists
    - [ ] E2E accessibility scan passes

  accessibility:
    - [ ] Page has unique, descriptive title
    - [ ] Main landmark present (<main>)
    - [ ] Heading hierarchy is logical (h1 → h2 → h3)
    - [ ] Skip link to main content (if header present)
    - [ ] Focus management on route change

  browser_validation:
    - [ ] Renders correctly on Chrome
    - [ ] Renders correctly on Firefox
    - [ ] Renders correctly on Safari (if supported)
    - [ ] Renders correctly on mobile viewport
    - [ ] No console errors in production build

  performance:
    - [ ] LCP (Largest Contentful Paint) < 2.5s
    - [ ] CLS (Cumulative Layout Shift) < 0.1
    - [ ] FID/INP (Interaction to Next Paint) < 200ms
```

---

## 2. User Flow Acceptance Criteria

For tasks implementing complete user flows (multi-step processes).

```yaml
user_flow_acceptance_criteria:
  flow_name: ""  # e.g., "User Registration Flow"

  functional:
    - [ ] All steps in flow complete successfully
    - [ ] Navigation between steps works
    - [ ] Back navigation preserves state
    - [ ] Form data persists across steps
    - [ ] Final submission succeeds
    - [ ] Success feedback displayed
    - [ ] Error handling at each step works

  testing:
    - [ ] E2E test covers complete happy path
    - [ ] E2E test covers error scenarios
    - [ ] E2E test tier assigned (likely smoke/core)
    - [ ] Test added to test-inventory.ts

  accessibility:
    - [ ] Progress indicator accessible
    - [ ] Current step announced to screen readers
    - [ ] Focus managed on step transitions
    - [ ] Error recovery is accessible

  performance:
    - [ ] Step transitions < 300ms
    - [ ] No layout shift during transitions
    - [ ] Loading states shown for async operations
```

---

## 3. Accessibility (WCAG 2.1 AA) Checklist

This section is MANDATORY for all UI components.

### 3.1 Perceivable

```yaml
perceivable:
  text_alternatives:
    - [ ] Images have alt text (or empty alt for decorative)
    - [ ] Icon-only buttons have accessible name
    - [ ] Complex images have extended description

  adaptable:
    - [ ] Semantic HTML used appropriately
    - [ ] Reading order is logical
    - [ ] Layout works in portrait and landscape

  distinguishable:
    - [ ] Color contrast: Text ≥ 4.5:1
    - [ ] Color contrast: UI components ≥ 3:1
    - [ ] Color is not only means of conveying info
    - [ ] Text can resize up to 200% without loss
    - [ ] Text spacing can be adjusted
```

### 3.2 Operable

```yaml
operable:
  keyboard:
    - [ ] All functionality keyboard accessible
    - [ ] No keyboard traps
    - [ ] Focus order is logical
    - [ ] Focus indicator visible (2px minimum)
    - [ ] Shortcuts don't conflict with AT

  enough_time:
    - [ ] Timeouts can be extended or disabled
    - [ ] Moving content can be paused

  seizures:
    - [ ] No content flashes more than 3 times/second

  navigable:
    - [ ] Skip links provided (for repeated blocks)
    - [ ] Page has descriptive title
    - [ ] Focus not lost on interaction
    - [ ] Link purpose clear from text
```

### 3.3 Understandable

```yaml
understandable:
  readable:
    - [ ] Language of page defined
    - [ ] Language of parts defined (if different)

  predictable:
    - [ ] Focus doesn't cause context change
    - [ ] Input doesn't cause unexpected changes
    - [ ] Navigation is consistent

  input_assistance:
    - [ ] Error identified and described
    - [ ] Labels or instructions provided
    - [ ] Error suggestions provided
    - [ ] Submissions can be reviewed/confirmed
```

### 3.4 Robust

```yaml
robust:
  compatible:
    - [ ] Valid HTML (no duplicate IDs)
    - [ ] Name, role, value exposed to AT
    - [ ] Status messages programmatically determined
```

---

## 4. Browser Validation Checklist

### 4.1 Cross-Browser Testing

```yaml
browser_validation:
  desktop:
    chrome:
      - [ ] Latest version renders correctly
      - [ ] No console errors
      - [ ] All interactions work

    firefox:
      - [ ] Latest version renders correctly
      - [ ] No console errors
      - [ ] All interactions work

    safari:
      - [ ] Latest version renders correctly (if supported)
      - [ ] No console errors
      - [ ] All interactions work

    edge:
      - [ ] Latest version renders correctly
      - [ ] No console errors
      - [ ] All interactions work

  mobile:
    ios_safari:
      - [ ] Renders correctly on iPhone viewport
      - [ ] Touch interactions work
      - [ ] No horizontal scroll

    android_chrome:
      - [ ] Renders correctly on Android viewport
      - [ ] Touch interactions work
      - [ ] No horizontal scroll
```

### 4.2 Responsive Design Validation

```yaml
responsive_validation:
  breakpoints:
    mobile:
      width: "< 768px"
      checks:
        - [ ] Layout adapts correctly
        - [ ] Text is readable
        - [ ] Touch targets ≥ 44x44px
        - [ ] No horizontal overflow

    tablet:
      width: "768px - 1023px"
      checks:
        - [ ] Layout adapts correctly
        - [ ] Sidebars collapse appropriately
        - [ ] Forms remain usable

    desktop:
      width: "≥ 1024px"
      checks:
        - [ ] Layout uses available space
        - [ ] Max-width constraints applied
        - [ ] Sidebars visible (if applicable)
```

---

## 5. Performance Criteria

### 5.1 Core Web Vitals

```yaml
performance_criteria:
  core_web_vitals:
    lcp:
      target: "< 2.5s"
      measurement: "Largest Contentful Paint"
      how_to_check: "Lighthouse, Web Vitals extension"

    cls:
      target: "< 0.1"
      measurement: "Cumulative Layout Shift"
      how_to_check: "Lighthouse, Layout Shift debugger"

    inp:
      target: "< 200ms"
      measurement: "Interaction to Next Paint"
      how_to_check: "Lighthouse, Web Vitals extension"

  additional_metrics:
    fcp:
      target: "< 1.8s"
      measurement: "First Contentful Paint"

    ttfb:
      target: "< 600ms"
      measurement: "Time to First Byte"

    bundle_size:
      target: "< 200KB gzipped (main bundle)"
      measurement: "Build output analysis"
```

### 5.2 Runtime Performance

```yaml
runtime_performance:
  - [ ] No memory leaks on component mount/unmount
  - [ ] Scroll performance is smooth (60fps)
  - [ ] Large lists are virtualized
  - [ ] Images are lazy loaded
  - [ ] No unnecessary re-renders
```

---

## 6. Evidence Requirements

Each acceptance criterion requires evidence. Document in task completion.

### 6.1 Evidence Types

| Criterion | Evidence Required |
|-----------|-------------------|
| Unit tests pass | Test output log or CI badge |
| Integration tests pass | Test output log |
| E2E tests pass | Playwright report or screenshot |
| Accessibility passes | axe-core scan results |
| Browser validation | Screenshots or Playwright traces |
| Performance meets targets | Lighthouse report |

### 6.2 Evidence Template

```yaml
task_completion_evidence:
  task_id: ""
  component: ""
  completed_at: ""

  functional_evidence:
    unit_tests: "[link to test output]"
    integration_tests: "[link to test output]"
    e2e_tests: "[link to Playwright report]"

  accessibility_evidence:
    axe_scan: "[link to scan results]"
    keyboard_testing: "[manual verification notes]"
    screen_reader: "[manual verification notes]"

  browser_evidence:
    chrome: "[screenshot or 'verified']"
    firefox: "[screenshot or 'verified']"
    safari: "[screenshot or 'verified']"
    mobile: "[screenshot or 'verified']"

  performance_evidence:
    lighthouse_report: "[link to report]"
    lcp: "[measured value]"
    cls: "[measured value]"
    inp: "[measured value]"
```

---

## 7. Task Completion Gate

A UI task can ONLY be marked complete when:

```yaml
completion_gate:
  mandatory:
    - [ ] All functional acceptance criteria met
    - [ ] All required tests pass (unit/integration/E2E)
    - [ ] Accessibility scan shows 0 critical/serious violations
    - [ ] Browser validation completed for supported browsers
    - [ ] Evidence documented for each criterion

  conditional:
    - [ ] Performance criteria met (if performance-sensitive)
    - [ ] Visual regression approved (if visual changes)
    - [ ] Mobile responsiveness verified (if user-facing)

  blocking_issues:
    - Any failing test
    - Any critical accessibility violation
    - Any console error in production build
    - Any missing E2E test for user flow
```

---

## 8. Quick Reference by Component Type

| Component Type | Unit | Integration | E2E | A11y | Browser | Perf |
|----------------|------|-------------|-----|------|---------|------|
| Presentational | ✅ | ❌ | ❌ | ✅ | ⚠️ | ❌ |
| Form Input | ✅ | ✅ | ❌ | ✅ | ⚠️ | ❌ |
| Form Container | ✅ | ✅ | ✅ | ✅ | ✅ | ⚠️ |
| Data Display | ✅ | ✅ | ⚠️ | ✅ | ✅ | ✅ |
| Page | ⚠️ | ⚠️ | ✅ | ✅ | ✅ | ✅ |
| User Flow | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |

Legend:
- ✅ Required
- ⚠️ Conditional (based on complexity)
- ❌ Not required

---

## 9. Related Documents

| Document | Purpose |
|----------|---------|
| `@instructions/utilities/ui-component-testing-strategy.md` | Test type decision tree |
| `@instructions/utilities/e2e-test-placement-checklist.md` | E2E tier assignment |
| `@standards/testing-standards.md` | Canonical timeout/location values |
| `@instructions/core/validate-browser.md` | Browser validation protocol |
