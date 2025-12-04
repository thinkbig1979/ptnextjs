/**
 * Test Standards Validator
 *
 * Validates test files against Agent OS test infrastructure standards.
 * Prevents common issues that cause CI failures:
 * - Watch mode defaults
 * - Missing timeouts
 * - Incorrect file locations
 * - Debug scripts masquerading as tests
 * - Focused tests (.only) left in code
 *
 * Configuration:
 * - Reads thresholds from config.yml (test_infrastructure.sprawl_prevention)
 * - Supports per-file override via @agent-os-skip directives
 * - CI environment detection for stricter validation
 *
 * @version 2.0.0
 */

const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");

class TestStandardsValidator {
  constructor(config = null) {
    // Load configuration from passed config or from file
    this.config = config || this.loadConfig();
    this.testInfraConfig = this.config?.test_infrastructure || {};
    this.sprawlConfig = this.testInfraConfig?.sprawl_prevention || {};
    this.validatorConfig = this.testInfraConfig?.test_standards_validator || {};

    // Configurable thresholds (with defaults)
    this.consoleThreshold = this.sprawlConfig?.max_console_statements ?? 5;
    this.debugScriptLocation =
      this.sprawlConfig?.debug_script_location ?? "scripts/debug/";
    this.archiveLocation =
      this.sprawlConfig?.archive_location ?? "tests/_archive/";

    // CI environment detection
    this.isCI = this.detectCIEnvironment();

    this.test_file_patterns = [
      /\.test\.[jt]sx?$/,
      /\.spec\.[jt]sx?$/,
      /\.test\.py$/,
      /_test\.py$/,
      /test_.*\.py$/,
      /_spec\.rb$/,
      /\.integration\.[jt]sx?$/,
    ];

    this.e2e_indicators = [
      "playwright",
      "cypress",
      "@playwright/test",
      "puppeteer",
      "webdriverio",
      "page.goto",
      "browser.newPage",
      "test.describe",
    ];

    this.assertion_patterns = [
      /expect\s*\(/,
      /assert\s*[.(]/,
      /should\s*[.(]/,
      /\.toBe\s*\(/,
      /\.toEqual\s*\(/,
      /\.toHaveLength\s*\(/,
      /\.toContain\s*\(/,
      /\.toBeVisible\s*\(/,
      /\.toHaveText\s*\(/,
      /assertEqual/,
      /assertTrue/,
      /assertFalse/,
    ];

    // Skip directive patterns (supported in first 10 lines of file)
    this.skipDirectivePattern = /@agent-os-skip\s+test-standards:(\w+(-\w+)*)/g;
  }

  /**
   * Load configuration from Agent OS config.yml
   */
  loadConfig() {
    try {
      const configPaths = [
        path.join(process.cwd(), ".agent-os", "config.yml"),
        path.join(process.env.HOME, ".agent-os", "config.yml"),
      ];

      for (const configPath of configPaths) {
        if (fs.existsSync(configPath)) {
          const configContent = fs.readFileSync(configPath, "utf8");
          return yaml.load(configContent);
        }
      }
    } catch (error) {
      // Silently use defaults if config can't be loaded
    }
    return {};
  }

  /**
   * Detect if running in a CI environment
   * @returns {boolean} True if running in CI
   */
  detectCIEnvironment() {
    return (
      process.env.CI === "true" ||
      process.env.GITHUB_ACTIONS === "true" ||
      process.env.GITLAB_CI === "true" ||
      process.env.CIRCLECI === "true" ||
      process.env.JENKINS_URL !== undefined ||
      process.env.TRAVIS === "true" ||
      process.env.BUILDKITE === "true" ||
      process.env.AZURE_PIPELINES === "true" ||
      process.env.TF_BUILD === "True"
    );
  }

  /**
   * Get skip directives from file content
   * Scans first 10 lines for @agent-os-skip directives
   * @param {string} content - File content
   * @returns {string[]} Array of skip directive names
   */
  getSkipDirectives(content) {
    const lines = content.split("\n").slice(0, 10);
    const directives = [];

    for (const line of lines) {
      let match;
      // Reset regex lastIndex for each line
      const pattern = /@agent-os-skip\s+test-standards:(\w+(-\w+)*)/g;
      while ((match = pattern.exec(line)) !== null) {
        directives.push(match[1]);
      }
    }
    return directives;
  }

  /**
   * Check if file is a test file
   */
  isTestFile(filePath) {
    const fileName = path.basename(filePath);
    return this.test_file_patterns.some((pattern) => pattern.test(fileName));
  }

  /**
   * Detect test type from file path and content
   */
  detectTestType(filePath, content) {
    // E2E detection by path
    if (
      filePath.includes("/e2e/") ||
      filePath.includes("/tests/e2e/") ||
      filePath.includes("\\e2e\\")
    ) {
      return "e2e";
    }

    // E2E detection by content
    if (this.e2e_indicators.some((indicator) => content.includes(indicator))) {
      return "e2e";
    }

    // Integration detection
    if (
      filePath.includes(".integration.") ||
      filePath.includes("/integration/") ||
      filePath.includes("\\integration\\")
    ) {
      return "integration";
    }

    // Default to unit
    return "unit";
  }

  /**
   * Get expected location for test type
   */
  getExpectedLocations(testType) {
    const locations = {
      unit: [
        "co-located with source",
        "src/__tests__/",
        "tests/unit/",
        "__tests__/",
      ],
      integration: ["tests/integration/", "__tests__/integration/"],
      e2e: ["tests/e2e/", "e2e/", "tests/"],
    };
    return locations[testType] || locations.unit;
  }

  /**
   * Main validation method
   */
  async validate(filePath, options = {}) {
    const result = {
      passed: true,
      errors: [],
      warnings: [],
      fixed: false,
      guidance: null,
      skipped: [],
      environment: this.isCI ? "ci" : "local",
    };

    // Only validate test files
    if (!this.isTestFile(filePath)) {
      return result;
    }

    try {
      // Read file content
      if (!fs.existsSync(filePath)) {
        result.passed = false;
        result.errors.push(
          this.createError({
            type: "FILE_NOT_FOUND",
            message: `File not found: ${filePath}`,
            filePath,
          }),
        );
        return result;
      }

      const content = fs.readFileSync(filePath, "utf8");
      const testType = this.detectTestType(filePath, content);

      // Get skip directives from file
      const skipDirectives = this.getSkipDirectives(content);
      if (skipDirectives.length > 0) {
        result.skipped = skipDirectives;
      }

      // Run validations (skip if directive present)
      if (!skipDirectives.includes("file-location")) {
        this.validateFileLocation(filePath, testType, result);
      }
      if (!skipDirectives.includes("assertions")) {
        this.validateHasAssertions(content, filePath, result);
      }
      if (!skipDirectives.includes("focused-tests")) {
        this.validateNoFocusedTests(content, filePath, result);
      }
      if (!skipDirectives.includes("timeout-config")) {
        this.validateTimeoutConfiguration(content, testType, filePath, result);
      }
      if (!skipDirectives.includes("hardcoded-urls")) {
        this.validateNoHardcodedUrls(content, filePath, result);
      }
      if (!skipDirectives.includes("console-limit")) {
        this.validateNoDebugScriptPatterns(content, filePath, result);
      }
      if (!skipDirectives.includes("watch-mode")) {
        this.validateNoWatchModeIndicators(content, filePath, result);
      }

      // Check Playwright config isolation for E2E tests
      if (testType === "e2e" && !skipDirectives.includes("playwright-config")) {
        this.validatePlaywrightConfigIsolation(filePath, result);
      }

      // In CI mode, promote warnings to errors for stricter enforcement
      if (this.isCI && result.warnings.length > 0) {
        result.errors.push(...result.warnings);
        result.warnings = [];
        result.passed = result.errors.length === 0;
      }

      // Add guidance if there are issues
      if (result.errors.length > 0 || result.warnings.length > 0) {
        result.guidance = this.generateGuidance(
          result,
          testType,
          skipDirectives,
        );
      }

      return result;
    } catch (error) {
      result.passed = false;
      result.errors.push(
        this.createError({
          type: "VALIDATION_ERROR",
          message: `Validation error: ${error.message}`,
          filePath,
        }),
      );
      return result;
    }
  }

  /**
   * Create enhanced error object with actionable guidance
   */
  createError({
    type,
    severity = "error",
    message,
    filePath,
    lineNumber,
    why,
    fix,
    example,
    docs,
  }) {
    return {
      type,
      severity: this.isCI ? "error" : severity,
      message,
      location: lineNumber ? `${filePath}:${lineNumber}` : filePath,
      why: why || this.getDefaultWhy(type),
      fix: fix || this.getDefaultFix(type),
      example: example || this.getDefaultExample(type),
      docs: docs || this.getDefaultDocs(type),
    };
  }

  /**
   * Get default "why" explanation for error type
   */
  getDefaultWhy(type) {
    const whyMap = {
      NO_ASSERTIONS:
        "Tests without assertions don't verify any behavior and provide false confidence",
      FOCUSED_TEST:
        "Focused tests (.only) will skip all other tests in the suite, causing incomplete CI runs",
      SKIPPED_TEST: "Skipped tests may indicate stale or broken functionality",
      MISSING_TIMEOUT:
        "E2E tests without timeouts can hang indefinitely, blocking CI pipelines",
      HARDCODED_URL:
        "Hardcoded URLs make tests environment-dependent and fragile",
      DEBUG_SCRIPT:
        "Debug scripts masquerading as tests add noise and slow down CI",
      DEBUGGER_STATEMENT:
        "Debugger statements will pause execution, causing CI to hang",
      WATCH_MODE: "Watch mode configurations prevent clean test exit in CI",
      WRONG_LOCATION:
        "Tests in wrong directories cause confusion and may not be run by CI",
    };
    return whyMap[type] || "This pattern can cause issues in CI environments";
  }

  /**
   * Get default fix suggestion for error type
   */
  getDefaultFix(type) {
    const fixMap = {
      NO_ASSERTIONS: `Add assertions using expect(), assert(), or similar. Move to ${this.debugScriptLocation} if not a real test`,
      FOCUSED_TEST: "Remove .only() before committing",
      SKIPPED_TEST:
        "Remove .skip() or add TODO comment explaining why test is skipped",
      MISSING_TIMEOUT:
        "Add timeout configuration: test.setTimeout(30000) or use config file",
      HARDCODED_URL:
        "Use baseURL from test config: await page.goto(baseURL + '/path')",
      DEBUG_SCRIPT: `Move debug scripts to ${this.debugScriptLocation}`,
      DEBUGGER_STATEMENT: "Remove debugger; statement",
      WATCH_MODE: "Remove watch: true from inline config",
      WRONG_LOCATION:
        "Move test file to appropriate directory (tests/unit/, tests/e2e/, etc.)",
    };
    return fixMap[type] || "Review and fix the flagged issue";
  }

  /**
   * Get default example for error type
   */
  getDefaultExample(type) {
    const exampleMap = {
      NO_ASSERTIONS: `// Add real assertions:
expect(result).toBe(expected);
expect(component).toBeVisible();`,
      FOCUSED_TEST: `// Before (wrong):
it.only('test', () => { ... });

// After (correct):
it('test', () => { ... });`,
      MISSING_TIMEOUT: `// Playwright config:
test.setTimeout(30000);

// Or in playwright.config.ts:
timeout: 30000`,
      HARDCODED_URL: `// Before:
await page.goto('http://localhost:3000/login');

// After:
await page.goto(\`\${baseURL}/login\`);`,
    };
    return exampleMap[type] || null;
  }

  /**
   * Get default documentation link for error type
   */
  getDefaultDocs(type) {
    return "@.agent-os/standards/test-infrastructure.md";
  }

  /**
   * Validate file is in correct location for test type
   */
  validateFileLocation(filePath, testType, result) {
    const fileName = path.basename(filePath);

    // E2E tests should not be in src/
    if (testType === "e2e" && filePath.includes("/src/")) {
      result.warnings.push(
        this.createError({
          type: "WRONG_LOCATION",
          severity: "warning",
          message: `E2E test in src/ directory - should be in tests/e2e/ or e2e/`,
          filePath,
          why: "E2E tests should be separated from source code for clear organization",
          fix: "Move test file to tests/e2e/ directory",
        }),
      );
    }

    // Unit tests should not be in tests/e2e/
    if (testType === "unit" && filePath.includes("/e2e/")) {
      result.warnings.push(
        this.createError({
          type: "WRONG_LOCATION",
          severity: "warning",
          message: `Unit test in e2e/ directory - should be co-located with source or in tests/unit/`,
          filePath,
          why: "Unit tests in e2e directories may not be run by unit test commands",
          fix: "Move test file to tests/unit/ or co-locate with source file",
        }),
      );
    }
  }

  /**
   * Validate test has real assertions (not just console.log)
   */
  validateHasAssertions(content, filePath, result) {
    const hasAssertions = this.assertion_patterns.some((pattern) =>
      pattern.test(content),
    );

    if (!hasAssertions) {
      result.passed = false;
      result.errors.push(
        this.createError({
          type: "NO_ASSERTIONS",
          message: `Test file has no assertions - is this a debug script?`,
          filePath,
          why: "Tests without assertions don't verify any behavior and provide false confidence",
          fix: `Add assertions using expect(), assert(), or similar. Move to ${this.debugScriptLocation} if not a real test`,
          example: `// Add real assertions:
expect(result).toBe(expected);
expect(component).toBeVisible();`,
        }),
      );
    }
  }

  /**
   * Validate no focused tests (.only or .skip)
   */
  validateNoFocusedTests(content, filePath, result) {
    const focusedPatterns = [
      /\.only\s*\(/g,
      /describe\.only\s*\(/g,
      /it\.only\s*\(/g,
      /test\.only\s*\(/g,
      /@pytest\.mark\.only/g,
      /fdescribe\s*\(/g,
      /fit\s*\(/g,
    ];

    const skipPatterns = [
      /\.skip\s*\(/g,
      /describe\.skip\s*\(/g,
      /it\.skip\s*\(/g,
      /test\.skip\s*\(/g,
      /@pytest\.mark\.skip/g,
      /xdescribe\s*\(/g,
      /xit\s*\(/g,
    ];

    for (const pattern of focusedPatterns) {
      if (pattern.test(content)) {
        result.passed = false;
        result.errors.push(
          this.createError({
            type: "FOCUSED_TEST",
            message: `Focused test (.only) found - will skip other tests in CI`,
            filePath,
            why: "Focused tests (.only) will skip all other tests in the suite, causing incomplete CI runs",
            fix: "Remove .only() before committing",
            example: `// Before (wrong):
it.only('test', () => { ... });

// After (correct):
it('test', () => { ... });`,
          }),
        );
        break;
      }
    }

    for (const pattern of skipPatterns) {
      if (pattern.test(content)) {
        result.warnings.push(
          this.createError({
            type: "SKIPPED_TEST",
            severity: "warning",
            message: `Skipped test (.skip) found - ensure this is intentional`,
            filePath,
            why: "Skipped tests may indicate stale or broken functionality that needs attention",
            fix: "Remove .skip() or add TODO comment explaining why test is skipped",
          }),
        );
        break;
      }
    }
  }

  /**
   * Validate timeout configuration for E2E tests
   */
  validateTimeoutConfiguration(content, testType, filePath, result) {
    if (testType !== "e2e") return;

    const timeoutPatterns = [
      /timeout\s*:/,
      /timeout\s*=/,
      /\.setTimeout\s*\(/,
      /test\.setTimeout\s*\(/,
      /globalTimeout/,
      /actionTimeout/,
      /navigationTimeout/,
    ];

    const hasTimeout = timeoutPatterns.some((pattern) => pattern.test(content));

    if (!hasTimeout) {
      result.warnings.push(
        this.createError({
          type: "MISSING_TIMEOUT",
          severity: "warning",
          message: `E2E test without explicit timeout configuration - may hang indefinitely`,
          filePath,
          why: "E2E tests without timeouts can hang indefinitely, blocking CI pipelines",
          fix: "Add timeout configuration: test.setTimeout(30000) or use playwright.config.ts",
          example: `// In test file:
test.setTimeout(30000);

// Or in playwright.config.ts:
export default defineConfig({
  timeout: 30000,
  expect: { timeout: 5000 }
});`,
        }),
      );
    }
  }

  /**
   * Validate no excessive hardcoded URLs
   */
  validateNoHardcodedUrls(content, filePath, result) {
    // Check for localhost URLs (including 127.0.0.1)
    const localhostPattern = /(localhost|127\.0\.0\.1):\d{4}/g;
    const matches = content.match(localhostPattern);

    if (matches && matches.length > 2) {
      result.warnings.push(
        this.createError({
          type: "HARDCODED_URL",
          severity: "warning",
          message: `Multiple hardcoded localhost URLs (${matches.length}) - consider using baseURL from config`,
          filePath,
          why: "Hardcoded URLs make tests environment-dependent and harder to maintain",
          fix: "Define baseURL in test config and use relative paths",
          example: `// In playwright.config.ts:
use: { baseURL: process.env.BASE_URL || 'http://localhost:3000' }

// In test:
await page.goto('/login');  // Uses baseURL automatically`,
        }),
      );
    }

    // Check for hardcoded production URLs
    const prodUrlPattern =
      /https?:\/\/(?!localhost|127\.0\.0\.1)[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const prodMatches = content.match(prodUrlPattern);
    if (prodMatches && prodMatches.length > 0) {
      result.warnings.push(
        this.createError({
          type: "HARDCODED_URL",
          severity: "warning",
          message: `Hardcoded external URLs found (${prodMatches.length}) - tests may fail in different environments`,
          filePath,
          why: "External URLs in tests can cause failures due to network issues, rate limits, or service changes",
          fix: "Mock external services or use environment variables for URLs",
        }),
      );
    }
  }

  /**
   * Validate no debug script patterns
   */
  validateNoDebugScriptPatterns(content, filePath, result) {
    const debugPatterns = [
      { pattern: /console\.log\s*\([^)]*\)/g, name: "console.log" },
      { pattern: /console\.debug\s*\([^)]*\)/g, name: "console.debug" },
      { pattern: /debugger;/g, name: "debugger statement" },
    ];

    // Count console statements
    let consoleCount = 0;
    for (const { pattern } of debugPatterns.slice(0, 2)) {
      const matches = content.match(pattern);
      if (matches) consoleCount += matches.length;
    }

    // Use configurable threshold (default 5)
    if (consoleCount > this.consoleThreshold) {
      result.warnings.push(
        this.createError({
          type: "DEBUG_SCRIPT",
          severity: "warning",
          message: `Excessive console statements (${consoleCount}/${this.consoleThreshold}) - may be a debug script, not a test`,
          filePath,
          why: "Debug scripts masquerading as tests add noise, slow down CI, and don't verify behavior",
          fix: `Move debug scripts to ${this.debugScriptLocation}`,
          example: `// If this is a debug script, move to:
// ${this.debugScriptLocation}check-something.js

// If this is a real test, reduce console statements to ${this.consoleThreshold} or fewer
// Use @agent-os-skip test-standards:console-limit to bypass this check`,
        }),
      );
    }

    // Debugger statements are always flagged
    if (/debugger;/.test(content)) {
      result.passed = false;
      result.errors.push(
        this.createError({
          type: "DEBUGGER_STATEMENT",
          message: `Debugger statement found - will pause execution in CI`,
          filePath,
          why: "Debugger statements will pause execution, causing CI to hang indefinitely",
          fix: "Remove all debugger; statements before committing",
        }),
      );
    }

    // Check for verification/manual naming patterns (if blocking is enabled)
    if (this.sprawlConfig?.block_debug_file_names !== false) {
      const fileName = path.basename(filePath);
      if (
        fileName.includes("verification") ||
        fileName.includes("manual") ||
        fileName.includes("check-")
      ) {
        result.warnings.push(
          this.createError({
            type: "DEBUG_SCRIPT",
            severity: "warning",
            message: `File name suggests debug/verification script - move to ${this.debugScriptLocation} if not a real test`,
            filePath,
            why: "Debug/verification scripts should be separated from real tests for clarity",
            fix: `Rename file or move to ${this.debugScriptLocation}`,
          }),
        );
      }
    }
  }

  /**
   * Validate no watch mode indicators in test file
   */
  validateNoWatchModeIndicators(content, filePath, result) {
    // Check for watch mode in vitest config within test files
    if (content.includes("watch: true") || content.includes("watch:true")) {
      result.warnings.push(
        this.createError({
          type: "WATCH_MODE",
          severity: "warning",
          message: `Watch mode configuration found in test file - may cause CI hangs`,
          filePath,
          why: "Watch mode configurations prevent clean test exit in CI, causing builds to hang",
          fix: "Remove watch: true from inline config, use CLI flags instead",
          example: `// Remove from test files:
// watch: true

// Use CLI flags instead:
// vitest run (not vitest)
// jest --runInBand (not jest --watch)`,
        }),
      );
    }
  }

  /**
   * Validate Playwright config has correct testDir (not pointing to parent of unit tests)
   * This is a project-level check, run when validating any E2E test file
   */
  validatePlaywrightConfigIsolation(filePath, result) {
    // Only check once per project - look for playwright.config.ts
    const projectRoot = this.findProjectRoot(filePath);
    if (!projectRoot) return;

    const configPaths = [
      path.join(projectRoot, "playwright.config.ts"),
      path.join(projectRoot, "playwright.config.js"),
    ];

    for (const configPath of configPaths) {
      if (!fs.existsSync(configPath)) continue;

      try {
        const configContent = fs.readFileSync(configPath, "utf8");

        // Check for problematic testDir patterns
        const testDirMatch = configContent.match(
          /testDir\s*:\s*['"`]([^'"`]+)['"`]/,
        );
        if (testDirMatch) {
          const testDir = testDirMatch[1];

          // Flag if testDir is './tests' or 'tests' (too broad - includes unit tests)
          if (
            testDir === "./tests" ||
            testDir === "tests" ||
            testDir === "./test" ||
            testDir === "test"
          ) {
            // Check if there's a unit test directory that would be scanned
            const unitTestsExist =
              fs.existsSync(path.join(projectRoot, "tests", "unit")) ||
              fs.existsSync(path.join(projectRoot, "test", "unit"));

            if (unitTestsExist) {
              result.passed = false;
              result.errors.push(
                this.createError({
                  type: "PLAYWRIGHT_TESTDIR_TOO_BROAD",
                  message: `Playwright testDir '${testDir}' includes unit test directories - will cause Vitest import errors`,
                  filePath: configPath,
                  why: 'Playwright scanning unit tests with Vitest imports causes "Vitest cannot be imported in CommonJS" errors',
                  fix: `Change testDir to './tests/e2e' to only scan E2E tests`,
                  example: `// playwright.config.ts
export default defineConfig({
  testDir: './tests/e2e',  // NOT './tests'
  testMatch: '**/*.spec.ts',
});`,
                  docs: "@.agent-os/standards/test-infrastructure.md#33-critical-framework-test-directory-isolation",
                }),
              );
            }
          }
        }
      } catch (error) {
        // Silently ignore config parse errors
      }

      // Only check first config found
      break;
    }
  }

  /**
   * Find project root by looking for package.json or .git
   */
  findProjectRoot(filePath) {
    let dir = path.dirname(filePath);
    const root = path.parse(dir).root;

    while (dir !== root) {
      if (
        fs.existsSync(path.join(dir, "package.json")) ||
        fs.existsSync(path.join(dir, ".git"))
      ) {
        return dir;
      }
      dir = path.dirname(dir);
    }
    return null;
  }

  /**
   * Generate guidance for fixing issues
   */
  generateGuidance(result, testType, skipDirectives = []) {
    const lines = [
      "═══════════════════════════════════════════════════════════════════",
      `TEST STANDARDS VIOLATION ${this.isCI ? "(CI MODE - STRICT)" : "(LOCAL MODE)"}`,
      "═══════════════════════════════════════════════════════════════════",
      "",
    ];

    if (result.errors.length > 0) {
      lines.push("ERRORS (must fix):");
      result.errors.forEach((err) => {
        if (typeof err === "object") {
          lines.push(`  ❌ ${err.message}`);
          if (err.why) lines.push(`     Why: ${err.why}`);
          if (err.fix) lines.push(`     Fix: ${err.fix}`);
          if (err.example) {
            lines.push("     Example:");
            err.example
              .split("\n")
              .forEach((line) => lines.push(`       ${line}`));
          }
        } else {
          lines.push(`  ❌ ${err}`);
        }
      });
      lines.push("");
    }

    if (result.warnings.length > 0) {
      lines.push("WARNINGS (should review):");
      result.warnings.forEach((warn) => {
        if (typeof warn === "object") {
          lines.push(`  ⚠️  ${warn.message}`);
          if (warn.why) lines.push(`     Why: ${warn.why}`);
          if (warn.fix) lines.push(`     Fix: ${warn.fix}`);
        } else {
          lines.push(`  ⚠️  ${warn}`);
        }
      });
      lines.push("");
    }

    // Show which checks were skipped
    if (skipDirectives.length > 0) {
      lines.push("SKIPPED CHECKS (via @agent-os-skip):");
      skipDirectives.forEach((d) => lines.push(`  ⏭️  test-standards:${d}`));
      lines.push("");
    }

    lines.push("STANDARDS REFERENCE:");
    lines.push("  📖 @.agent-os/standards/test-infrastructure.md");
    lines.push("  📖 @.agent-os/instructions/agents/test-architect.md");
    lines.push("");
    lines.push(`Test Type Detected: ${testType}`);
    lines.push(
      `Expected Locations: ${this.getExpectedLocations(testType).join(", ")}`,
    );
    lines.push(
      `Environment: ${this.isCI ? "CI (warnings promoted to errors)" : "Local (warnings allowed)"}`,
    );
    lines.push("");
    lines.push("SKIP DIRECTIVES (add to first 10 lines of file):");
    lines.push("  // @agent-os-skip test-standards:assertions");
    lines.push("  // @agent-os-skip test-standards:console-limit");
    lines.push("  // @agent-os-skip test-standards:timeout-config");
    lines.push("  // @agent-os-skip test-standards:file-location");
    lines.push("  // @agent-os-skip test-standards:focused-tests");
    lines.push("  // @agent-os-skip test-standards:hardcoded-urls");
    lines.push("  // @agent-os-skip test-standards:watch-mode");
    lines.push("  // @agent-os-skip test-standards:playwright-config");
    lines.push(
      "═══════════════════════════════════════════════════════════════════",
    );

    return lines.join("\n");
  }
}

// Export both the class (for custom configuration) and a default instance
module.exports = new TestStandardsValidator();
module.exports.TestStandardsValidator = TestStandardsValidator;
