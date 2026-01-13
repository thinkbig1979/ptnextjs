---
description: Execute comprehensive browser-based validation for web UI implementations
globs:
alwaysApply: false
version: 5.1.0
encoding: UTF-8
---

# Browser Validation Execution Instructions

## Overview

Execute comprehensive browser-based validation for web UI components, user flows, and visual implementations using Playwright automated testing with accessibility and responsive design verification.

<pre_flight_check>
  EXECUTE: @.agent-os/instructions/meta/pre-flight.md
</pre_flight_check>

<process_flow>

<step number="1" name="validation_setup">

### Step 1: Browser Testing Setup and Target Identification

Initialize Playwright testing environment and identify web UI components for validation.

<target_detection>
  <user_specified>
    - Use provided component path or URL parameter
    - Validate path exists and is accessible
    - Determine component type based on framework
  </user_specified>

  <auto_detection>
    IF no path provided:
      SCAN current working directory for:
        - "src/components/" → React/Vue component testing
        - "pages/" → Next.js page testing
        - "app/" → App router component testing
        - Local dev server running → full application testing
        - Multiple candidates → prompt user for selection
  </auto_detection>

  <component_classification>
    <react_components>
      - .tsx or .jsx files
      - Component exports
      - Validates rendering, interactions, state management
    </react_components>

    <page_components>
      - Next.js pages or app routes
      - Full page implementations
      - Validates routing, data fetching, SEO
    </page_components>

    <application_flows>
      - Multi-step user journeys
      - Authentication flows
      - Form submissions and validations
      - Validates complete user workflows
    </application_flows>
  </component_classification>
</target_detection>

<worktree_setup>
  **Worktree Isolation for Browser Testing [DEFERRED]**

  > **Status**: DEFERRED - Worktree scripts archived to `setup/archive/worktrees/`
  >
  > **Rationale**: The current orchestration model (subagent coordination via
  > TodoWrite/beads) provides sufficient parallelism without requiring filesystem
  > isolation. Worktrees add complexity (sync, merge, conflict resolution) that
  > isn't justified by current bottlenecks.
  >
  > **If you need this**: Scripts remain available in the archive and can be
  > restored if a concrete use case emerges. See `setup/archive/worktrees/ARCHIVED.md`

  **Standard Execution** (recommended):
    - Build and start production server in current working directory
    - Tests run against production build
    - 10-50x faster than dev server
    - Use git stash/branch for isolation if needed
</worktree_setup>

<playwright_initialization>
  <execution_safety_protocol>
    **MANDATORY**: Before running any Playwright tests, follow the Test Execution Safety Protocol
    from @.agent-os/instructions/agents/test-runner.md:

    1. **Server Pre-Flight Check**: Verify all required servers are running
       - Check frontend server (typically localhost:3000)
       - Check backend server (if applicable)
       - BLOCK test execution if servers not responding

    2. **Watch Mode Prevention**: Ensure using CI-safe command
       - Use `playwright test` NOT `playwright test --ui`
       - Use `--reporter=list` for real-time progress

    3. **Timeout Enforcement**: Apply hard timeouts
       - Per-test: 60 seconds max
       - Suite total: 10 minutes max
       - Kill hung tests automatically

    See @.agent-os/standards/testing-standards.md for complete standards.
  </execution_safety_protocol>

  <setup_checks>
    - CHECK: Playwright is installed (@playwright/test)
    - CHECK: Browsers are installed (chromium, firefox, webkit)
    - CHECK: playwright.config.ts exists and is valid
    - IF missing: Install and configure Playwright automatically
  </setup_checks>

  <browser_configuration>
    - browsers: [chromium, firefox, webkit]
    - viewport_sizes: [desktop: 1920x1080, tablet: 768x1024, mobile: 375x667]
    - headless: true (for CI), false (for debugging)
    - screenshot: on failure
    - video: on first retry
    - trace: on first retry
  </browser_configuration>

  <test_environment_setup>
    - Build and start production server (NOT dev server - 10-50x faster)
    - Set BASE_URL environment variable
    - Clear browser cache and storage
    - Set up test data and fixtures
    - Configure authentication if needed
  </test_environment_setup>
</playwright_initialization>

<instructions>
  ACTION: Initialize Playwright testing environment
  DETECT: Target components and pages for validation
  SETUP: Browser configurations and test data
  PREPARE: Validation environment and parameters
</instructions>

</step>

<step number="2" name="visual_validation">

### Step 2: Visual and Rendering Validation

Perform comprehensive visual validation including rendering correctness, responsive design, and visual regression detection.

<rendering_validation>
  <component_rendering>
    FOR each target component:
      EXECUTE: Playwright test to verify:
        - Component renders without errors
        - All expected elements are present
        - No console errors or warnings
        - Loading states work correctly
        - Error states display properly
        - Empty states render as expected
  </component_rendering>

  <visual_regression_detection>
    EXECUTE: Visual screenshot comparison
      - Take baseline screenshots if first run
      - Compare current renders to baseline
      - Detect pixel differences and highlight changes
      - Threshold: 0.1% pixel difference acceptable
      - Generate diff images for failures
      - Update baselines if changes are intentional
  </visual_regression_detection>

  <css_validation>
    CHECK: Styling correctness
      - No broken styles or missing CSS
      - Layout matches design specifications
      - Z-index and positioning correct
      - Colors and typography consistent
      - Animations and transitions smooth
      - No CSS errors in console
  </css_validation>
</rendering_validation>

<responsive_design_validation>
  <viewport_testing>
    FOR each viewport size [desktop, tablet, mobile]:
      EXECUTE: Rendering tests at specific dimensions
        - Verify layout adapts correctly
        - Check media queries work as expected
        - Validate touch targets >= 44x44px (mobile)
        - Verify horizontal scrolling not present
        - Check text readability and sizing
        - Validate image scaling and aspect ratios
  </viewport_testing>

  <orientation_testing>
    TEST: Portrait and landscape orientations (mobile/tablet)
      - Layout adapts to orientation changes
      - Content remains accessible
      - No layout breaking or overflow
  </orientation_testing>

  <zoom_testing>
    TEST: Browser zoom levels [100%, 150%, 200%]
      - Layout remains usable at different zoom levels
      - Text scaling works correctly
      - No horizontal scrolling introduced
      - Touch targets remain accessible
  </zoom_testing>
</responsive_design_validation>

<cross_browser_validation>
  FOR each browser [chromium, firefox, webkit]:
    EXECUTE: Full test suite in browser
      - Verify consistent rendering across browsers
      - Check browser-specific API compatibility
      - Validate CSS vendor prefix handling
      - Test JavaScript feature support
      - Verify polyfills work correctly
</cross_browser_validation>

<instructions>
  ACTION: Execute comprehensive visual validation tests
  CAPTURE: Screenshots for baseline and comparison
  VALIDATE: Responsive design across viewports and browsers
  DETECT: Visual regressions and rendering issues
</instructions>

</step>

<step number="3" name="interaction_validation">

### Step 3: User Interaction and Behavior Validation

Test user interactions, form validations, state management, and dynamic behavior.

<click_interaction_testing>
  <button_validation>
    FOR each interactive element:
      TEST: Click interactions
        - Button clicks trigger expected actions
        - Links navigate to correct destinations
        - Disabled states prevent interactions
        - Loading states show during async operations
        - Success/error feedback displays correctly
        - Event handlers fire as expected
  </button_validation>

  <keyboard_navigation>
    TEST: Keyboard accessibility
      - Tab order is logical and complete
      - Enter/Space activate buttons and links
      - Escape closes modals and dropdowns
      - Arrow keys navigate menus and lists
      - Focus indicators are visible
      - Keyboard traps are avoided
  </keyboard_navigation>

  <touch_interaction>
    TEST: Touch and gesture support (mobile)
      - Tap interactions work correctly
      - Swipe gestures function as expected
      - Pinch-to-zoom works where appropriate
      - Long-press actions trigger correctly
      - Touch targets are adequately sized
  </touch_interaction>
</click_interaction_testing>

<form_validation_testing>
  <input_validation>
    FOR each form field:
      TEST: Input behavior
        - Field accepts valid input
        - Invalid input shows error messages
        - Required fields enforce validation
        - Character limits work correctly
        - Input masking functions properly
        - Autocomplete suggestions work
  </input_validation>

  <form_submission>
    TEST: Form submission workflow
      - Valid forms submit successfully
      - Invalid forms show validation errors
      - Loading states during submission
      - Success messages display correctly
      - Error handling for failed submissions
      - Form resets appropriately after success
  </form_submission>

  <client_side_validation>
    TEST: Real-time validation
      - Validation runs on blur or input
      - Error messages are clear and helpful
      - Field-specific error indicators
      - Form-level error summary
      - Validation clears when corrected
  </client_side_validation>
</form_validation_testing>

<state_management_testing>
  <component_state>
    TEST: State transitions
      - State updates trigger re-renders
      - State persists across interactions
      - State resets when appropriate
      - Optimistic updates work correctly
      - State synchronization across components
  </component_state>

  <url_state>
    TEST: URL and routing state
      - URL parameters update correctly
      - Browser back/forward buttons work
      - Deep linking functions properly
      - State restores from URL on page load
  </url_state>

  <persistence>
    TEST: Data persistence
      - LocalStorage/SessionStorage works
      - State persists across page reloads
      - State clears appropriately on logout
      - No stale data issues
  </persistence>
</state_management_testing>

<instructions>
  ACTION: Execute comprehensive interaction testing
  VALIDATE: User workflows and form submissions
  TEST: Keyboard, mouse, and touch interactions
  VERIFY: State management and data persistence
</instructions>

</step>

<step number="4" name="accessibility_validation">

### Step 4: Accessibility Compliance Validation

Perform comprehensive accessibility testing for WCAG 2.1 Level AA compliance.

<automated_accessibility_testing>
  <axe_core_integration>
    EXECUTE: @axe-core/playwright automated scanning
      - Run axe accessibility tests on all pages/components
      - Check for WCAG 2.1 Level A violations
      - Check for WCAG 2.1 Level AA violations
      - Generate detailed violation reports
      - Provide remediation guidance
  </axe_core_integration>

  <wcag_rule_validation>
    CHECK: Critical accessibility rules
      - All images have alt text
      - Form inputs have labels
      - Headings are hierarchical
      - Color contrast meets 4.5:1 ratio (text)
      - Color contrast meets 3:1 ratio (UI components)
      - No keyboard traps exist
      - Focus order is logical
      - Link text is descriptive
      - ARIA attributes used correctly
  </wcag_rule_validation>
</automated_accessibility_testing>

<screen_reader_testing>
  <semantic_html_validation>
    CHECK: Proper HTML semantics
      - Landmarks (header, nav, main, footer, aside)
      - Headings structure (h1-h6)
      - Lists (ul, ol, dl) used appropriately
      - Tables have proper structure
      - Forms use fieldsets and legends
  </semantic_html_validation>

  <aria_implementation>
    VALIDATE: ARIA usage
      - ARIA roles used when needed
      - ARIA labels provide context
      - ARIA live regions for dynamic content
      - ARIA expanded/collapsed states
      - ARIA selected states for tabs/options
      - No ARIA conflicts with HTML semantics
  </aria_implementation>

  <screen_reader_announcements>
    TEST: Screen reader output
      - Dynamic content changes announced
      - Error messages read to users
      - Loading states communicated
      - Success confirmations announced
      - Page title describes content
  </screen_reader_announcements>
</screen_reader_testing>

<motor_accessibility_testing>
  <focus_management>
    TEST: Focus behavior
      - Focus moves logically through page
      - Modal focus trapped appropriately
      - Focus returns after dialog close
      - Skip links function correctly
      - Focus visible at all times
  </focus_management>

  <target_size_validation>
    CHECK: Interactive element sizing
      - Touch targets >= 44x44px (WCAG Level AAA)
      - Adequate spacing between targets
      - No overlapping interactive elements
  </target_size_validation>
</motor_accessibility_testing>

<instructions>
  ACTION: Execute comprehensive accessibility testing
  VALIDATE: WCAG 2.1 Level AA compliance
  TEST: Screen reader compatibility and keyboard navigation
  REPORT: Accessibility violations with remediation guidance
</instructions>

</step>

<step number="5" name="performance_validation">

### Step 5: Performance and Load Time Validation

Measure and validate web performance metrics including load times, Core Web Vitals, and resource optimization.

<core_web_vitals_measurement>
  <lcp_validation>
    MEASURE: Largest Contentful Paint (LCP)
      - Target: < 2.5 seconds (good)
      - Acceptable: < 4.0 seconds
      - Measure across all viewports
      - Identify LCP element
      - Provide optimization suggestions
  </lcp_validation>

  <fid_validation>
    MEASURE: First Input Delay (FID) / Interaction to Next Paint (INP)
      - Target: < 100ms (good)
      - Acceptable: < 300ms
      - Test on real user interactions
      - Identify blocking scripts
      - Suggest performance improvements
  </fid_validation>

  <cls_validation>
    MEASURE: Cumulative Layout Shift (CLS)
      - Target: < 0.1 (good)
      - Acceptable: < 0.25
      - Identify shifting elements
      - Check image dimensions specified
      - Validate font loading strategy
  </cls_validation>
</core_web_vitals_measurement>

<resource_loading_analysis>
  <asset_optimization>
    ANALYZE: Resource loading
      - Image optimization and formats (WebP, AVIF)
      - Font loading strategy (font-display)
      - CSS and JS bundle sizes
      - Code splitting effectiveness
      - Lazy loading implementation
      - Critical CSS inlined
      - Unused code removal
  </asset_optimization>

  <network_performance>
    MEASURE: Network metrics
      - Time to First Byte (TTFB)
      - Number of network requests
      - Total page weight
      - Resource caching effectiveness
      - CDN usage and optimization
  </network_performance>

  <rendering_performance>
    ANALYZE: Rendering metrics
      - First Contentful Paint (FCP)
      - Time to Interactive (TTI)
      - Speed Index
      - Total Blocking Time (TBT)
      - JavaScript execution time
  </rendering_performance>
</resource_loading_analysis>

<throttling_validation>
  TEST: Performance under constrained conditions
    - Slow 3G network simulation
    - Fast 3G network simulation
    - CPU throttling (4x slowdown)
    - Verify app remains usable
    - Measure degraded performance
    - Validate loading indicators
</throttling_validation>

<instructions>
  ACTION: Measure Core Web Vitals and performance metrics
  ANALYZE: Resource loading and optimization
  TEST: Performance under network and CPU constraints
  PROVIDE: Optimization recommendations
</instructions>

</step>

<step number="6" name="validation_report">

### Step 6: Generate Comprehensive Validation Report

Create detailed browser validation report with test results, screenshots, and actionable recommendations.

<report_generation>
  <header_section>
    🌐 **Browser Validation Report**
    - **Target**: [component_or_page_name]
    - **Test Suite**: [test_file_path]
    - **Validation Timestamp**: [ISO_timestamp]
    - **Browsers Tested**: Chromium, Firefox, WebKit
    - **Viewports Tested**: Desktop, Tablet, Mobile
  </header_section>

  <test_results_summary>
    📊 **Test Results Summary**

    - **Total Tests**: [total_test_count]
    - **Passed**: [passed_count] ✅
    - **Failed**: [failed_count] ❌
    - **Skipped**: [skipped_count] ⏭️
    - **Pass Rate**: [percentage]%
    - **Execution Time**: [duration]

    <browser_breakdown>
      FOR each browser:
        - **[Browser]**: [passed]/[total] tests passed
    </browser_breakdown>

    <viewport_breakdown>
      FOR each viewport:
        - **[Viewport]**: [passed]/[total] tests passed
    </viewport_breakdown>
  </test_results_summary>

  <visual_validation_results>
    🎨 **Visual Validation Results**

    <rendering_status>
      - **Rendering Tests**: [status]
      - **Visual Regression**: [status]
      - **Responsive Design**: [status]
      - **CSS Validation**: [status]
    </rendering_status>

    <screenshot_gallery>
      FOR each viewport:
        - **[Viewport]**: [screenshot_link]
        - Baseline: [baseline_screenshot]
        - Current: [current_screenshot]
        - Diff: [diff_screenshot] (if changed)
    </screenshot_gallery>

    <visual_issues>
      IF issues found:
        FOR each issue:
          - **[Issue_Type]**: [Description]
          - **Screenshot**: [link_to_screenshot]
          - **Expected**: [baseline_or_specification]
          - **Actual**: [current_state]
          - **Recommendation**: [fix_suggestion]
    </visual_issues>
  </visual_validation_results>

  <interaction_validation_results>
    🖱️ **Interaction Validation Results**

    <interaction_status>
      - **Click Interactions**: [status]
      - **Keyboard Navigation**: [status]
      - **Form Validation**: [status]
      - **State Management**: [status]
    </interaction_status>

    <interaction_issues>
      IF issues found:
        FOR each issue:
          - **[Component]**: [Issue_description]
          - **Steps to Reproduce**: [user_action_sequence]
          - **Expected Behavior**: [specification]
          - **Actual Behavior**: [observed_result]
          - **Fix**: [implementation_guidance]
    </interaction_issues>
  </interaction_validation_results>

  <accessibility_validation_results>
    ♿ **Accessibility Validation Results**

    <wcag_compliance>
      - **WCAG 2.1 Level A**: [passed]/[total] rules ([status])
      - **WCAG 2.1 Level AA**: [passed]/[total] rules ([status])
      - **Critical Violations**: [count]
      - **Serious Violations**: [count]
      - **Moderate Violations**: [count]
      - **Minor Violations**: [count]
    </wcag_compliance>

    <accessibility_issues>
      FOR each violation:
        - **[Rule_ID]**: [Rule_description]
        - **Impact**: [Critical/Serious/Moderate/Minor]
        - **Affected Elements**: [element_selectors]
        - **WCAG Criterion**: [criterion_number]
        - **Fix**: [remediation_guidance]
        - **More Info**: [wcag_reference_link]
    </accessibility_issues>

    <accessibility_score>
      **Accessibility Score**: [score]/100
      - Based on violation severity and count
      - Target: 95+ for production deployment
    </accessibility_score>
  </accessibility_validation_results>

  <performance_validation_results>
    ⚡ **Performance Validation Results**

    <core_web_vitals>
      - **LCP**: [value]s ([Good/Needs Improvement/Poor])
      - **FID/INP**: [value]ms ([Good/Needs Improvement/Poor])
      - **CLS**: [value] ([Good/Needs Improvement/Poor])
      - **Overall**: [status]
    </core_web_vitals>

    <performance_metrics>
      - **TTFB**: [value]ms
      - **FCP**: [value]s
      - **TTI**: [value]s
      - **Speed Index**: [value]
      - **TBT**: [value]ms
      - **Page Weight**: [value]KB
      - **Requests**: [count]
    </performance_metrics>

    <performance_issues>
      IF issues found:
        FOR each issue:
          - **[Issue_Type]**: [Description]
          - **Impact**: [Performance_degradation]
          - **Optimization**: [Specific_improvement]
          - **Expected Gain**: [Performance_improvement]
    </performance_issues>
  </performance_validation_results>

  <recommendations_section>
    💡 **Actionable Recommendations**

    <critical_fixes>
      🔴 **Critical Issues (Fix Immediately)**
      FOR each critical issue:
        1. **[Issue]**: [Description]
           - **File**: [file_path:line_number]
           - **Fix**: [Implementation_code]
           - **Priority**: Critical
           - **Effort**: [estimate]
    </critical_fixes>

    <improvements>
      🟡 **Improvements (Recommended)**
      FOR each improvement:
        1. **[Enhancement]**: [Description]
           - **Benefit**: [User_impact]
           - **Implementation**: [Code_changes]
           - **Priority**: Medium/Low
           - **Effort**: [estimate]
    </improvements>

    <best_practices>
      📚 **Best Practice Recommendations**
      FOR each best practice:
        1. **[Practice]**: [Recommendation]
           - **Reference**: [Standard_or_guide]
           - **Application**: [How_to_implement]
           - **Long-term Benefit**: [Maintainability_gain]
    </best_practices>
  </recommendations_section>

  <artifacts_section>
    📁 **Test Artifacts**

    - **Screenshots**: [directory_path]
    - **Videos**: [directory_path] (for failed tests)
    - **Traces**: [directory_path] (for failed tests)
    - **Playwright Report**: [html_report_path]
    - **Raw Results**: [json_report_path]
  </artifacts_section>
</report_generation>

<follow_up_options>
  <re_test_offering>
    🔄 **Re-test Options**

    - **Fix and Re-run**: Run tests again after implementing fixes
    - **Specific Component**: Re-test only failed components
    - **Regression Suite**: Run full suite to catch new issues
    - **Watch Mode**: Continuous testing during development
  </re_test_offering>

  <ci_integration>
    🔗 **CI/CD Integration**

    - Add Playwright tests to GitHub Actions / GitLab CI
    - Configure automated browser testing on PRs
    - Set up visual regression tracking
    - Enable performance monitoring
    - Configure accessibility gates
  </ci_integration>
</follow_up_options>

<instructions>
  ACTION: Generate comprehensive validation report
  INCLUDE: Screenshots, videos, and test artifacts
  PROVIDE: Specific fixes with code examples
  OFFER: Re-testing and continuous monitoring options
</instructions>

</step>

</process_flow>

<error_handling>

## Error Handling and Edge Cases

<test_failures>
  <timeout_errors>
    - Page load timeouts
    - Element selection timeouts
    - Navigation timeouts
    - ACTION: Increase timeout, check network, verify selectors
  </timeout_errors>

  <element_not_found>
    - Missing DOM elements
    - Changed selectors
    - Dynamic content loading
    - ACTION: Update selectors, add wait conditions, check rendering
  </element_not_found>

  <screenshot_failures>
    - Screenshot comparison failures
    - Baseline missing
    - Font rendering differences
    - ACTION: Update baselines, normalize fonts, adjust thresholds
  </screenshot_failures>
</test_failures>

<environment_issues>
  <browser_not_installed>
    - Playwright browsers missing
    - ACTION: Run `npx playwright install`
  </browser_not_installed>

  <server_not_running>
    - Local server not accessible
    - ACTION: Build and start production server (npm run build && npm run start)
  </server_not_running>

  <port_conflicts>
    - Server port in use
    - ACTION: Kill existing process or use alternative port
  </port_conflicts>
</environment_issues>

</error_handling>

<post_flight_check>
  EXECUTE: @.agent-os/instructions/meta/post-flight.md
</post_flight_check>
