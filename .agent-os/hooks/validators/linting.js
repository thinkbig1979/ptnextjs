const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class LintingValidator {
  constructor() {
    this.name = 'linting';
  }

  /**
   * Validate file with appropriate linter and attempt auto-fix
   * @param {string} filePath - Path to file to validate
   * @param {object} options - Validation options
   * @returns {object} Validation result with fixes, warnings, and errors
   */
  async validate(filePath, options = {}) {
    const ext = path.extname(filePath).toLowerCase();
    const autoFix = options.autoFix !== false; // Default to true

    // Determine which linter to use based on file extension
    if (['.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs'].includes(ext)) {
      return this.validateWithESLint(filePath, autoFix);
    } else if (['.py'].includes(ext)) {
      return this.validateWithPylint(filePath);
    } else if (['.css', '.scss', '.sass', '.less'].includes(ext)) {
      return this.validateWithStylelint(filePath, autoFix);
    }

    // Unsupported file type
    return {
      passed: true,
      fixed: false,
      fixes: [],
      warnings: [],
      errors: [],
      content: null,
      message: `No linter configured for ${ext} files`
    };
  }

  /**
   * Validate JavaScript/TypeScript with ESLint
   * @param {string} filePath - Path to file
   * @param {boolean} autoFix - Whether to attempt auto-fix
   * @returns {object} Validation result
   */
  validateWithESLint(filePath, autoFix) {
    try {
      // Check if ESLint is available
      try {
        execSync('npx eslint --version', { stdio: 'pipe' });
      } catch {
        return {
          passed: true,
          fixed: false,
          fixes: [],
          warnings: [],
          errors: [],
          content: null,
          message: 'ESLint not available in project'
        };
      }

      const originalContent = fs.readFileSync(filePath, 'utf8');
      let fixed = false;
      let fixedContent = null;

      // Run ESLint with auto-fix if enabled
      if (autoFix) {
        try {
          execSync(`npx eslint --fix --format json "${filePath}"`, {
            stdio: 'pipe',
            encoding: 'utf8'
          });

          // Check if file was modified
          const newContent = fs.readFileSync(filePath, 'utf8');
          if (newContent !== originalContent) {
            fixed = true;
            fixedContent = newContent;
          }
        } catch {
          // ESLint exits with 1 if there are issues, even after fixing
          // This is expected behavior, continue to check results
        }
      }

      // Run ESLint again to get current state (without --fix to avoid double-fixing)
      let output;
      try {
        output = execSync(`npx eslint --format json "${filePath}"`, {
          stdio: 'pipe',
          encoding: 'utf8'
        });
      } catch (error) {
        // ESLint exits with 1 when issues found
        output = error.stdout || '[]';
      }

      // Parse ESLint JSON output
      const results = JSON.parse(output);
      const fileResult = results[0] || { messages: [] };

      const errors = [];
      const warnings = [];
      const fixes = [];

      fileResult.messages.forEach(msg => {
        const issue = {
          line: msg.line,
          column: msg.column,
          rule: msg.ruleId,
          message: msg.message,
          severity: msg.severity === 2 ? 'error' : 'warning'
        };

        if (msg.severity === 2) {
          errors.push(issue);
        } else {
          warnings.push(issue);
        }

        // Track what was fixed
        if (msg.fix && fixed) {
          fixes.push({
            line: msg.line,
            column: msg.column,
            rule: msg.ruleId,
            description: msg.message
          });
        }
      });

      const passed = errors.length === 0;

      return {
        passed,
        fixed,
        fixes,
        warnings,
        errors,
        content: fixedContent,
        message: this.generateMessage(passed, fixed, errors.length, warnings.length, fixes.length)
      };

    } catch (error) {
      return {
        passed: false,
        fixed: false,
        fixes: [],
        warnings: [],
        errors: [{
          line: 0,
          column: 0,
          rule: 'eslint-error',
          message: `ESLint validation failed: ${error.message}`,
          severity: 'error'
        }],
        content: null,
        message: `ESLint validation failed: ${error.message}`
      };
    }
  }

  /**
   * Validate Python with Pylint
   * @param {string} filePath - Path to file
   * @returns {object} Validation result
   */
  validateWithPylint(filePath) {
    try {
      // Check if Pylint is available
      try {
        execSync('pylint --version', { stdio: 'pipe' });
      } catch {
        return {
          passed: true,
          fixed: false,
          fixes: [],
          warnings: [],
          errors: [],
          content: null,
          message: 'Pylint not available in system'
        };
      }

      // Run Pylint with JSON output
      let output;
      try {
        output = execSync(`pylint --output-format=json "${filePath}"`, {
          stdio: 'pipe',
          encoding: 'utf8'
        });
      } catch (error) {
        // Pylint exits with non-zero when issues found
        output = error.stdout || '[]';
      }

      // Parse Pylint JSON output
      const results = JSON.parse(output);
      const errors = [];
      const warnings = [];

      results.forEach(msg => {
        const issue = {
          line: msg.line,
          column: msg.column,
          rule: msg['message-id'],
          message: msg.message,
          severity: ['error', 'fatal'].includes(msg.type) ? 'error' : 'warning'
        };

        if (['error', 'fatal'].includes(msg.type)) {
          errors.push(issue);
        } else {
          warnings.push(issue);
        }
      });

      const passed = errors.length === 0;

      return {
        passed,
        fixed: false, // Pylint doesn't support auto-fix
        fixes: [],
        warnings,
        errors,
        content: null,
        message: this.generateMessage(passed, false, errors.length, warnings.length, 0)
      };

    } catch (error) {
      return {
        passed: false,
        fixed: false,
        fixes: [],
        warnings: [],
        errors: [{
          line: 0,
          column: 0,
          rule: 'pylint-error',
          message: `Pylint validation failed: ${error.message}`,
          severity: 'error'
        }],
        content: null,
        message: `Pylint validation failed: ${error.message}`
      };
    }
  }

  /**
   * Validate CSS with Stylelint
   * @param {string} filePath - Path to file
   * @param {boolean} autoFix - Whether to attempt auto-fix
   * @returns {object} Validation result
   */
  validateWithStylelint(filePath, autoFix) {
    try {
      // Check if Stylelint is available
      try {
        execSync('npx stylelint --version', { stdio: 'pipe' });
      } catch {
        return {
          passed: true,
          fixed: false,
          fixes: [],
          warnings: [],
          errors: [],
          content: null,
          message: 'Stylelint not available in project'
        };
      }

      const originalContent = fs.readFileSync(filePath, 'utf8');
      let fixed = false;
      let fixedContent = null;

      // Run Stylelint with auto-fix if enabled
      if (autoFix) {
        try {
          execSync(`npx stylelint --fix --formatter json "${filePath}"`, {
            stdio: 'pipe',
            encoding: 'utf8'
          });

          // Check if file was modified
          const newContent = fs.readFileSync(filePath, 'utf8');
          if (newContent !== originalContent) {
            fixed = true;
            fixedContent = newContent;
          }
        } catch {
          // Stylelint exits with 1 if there are issues
          // Continue to check results
        }
      }

      // Run Stylelint again to get current state
      let output;
      try {
        output = execSync(`npx stylelint --formatter json "${filePath}"`, {
          stdio: 'pipe',
          encoding: 'utf8'
        });
      } catch (error) {
        // Stylelint exits with 2 when issues found
        output = error.stdout || '[]';
      }

      // Parse Stylelint JSON output
      const results = JSON.parse(output);
      const fileResult = results[0] || { warnings: [] };

      const errors = [];
      const warnings = [];
      const fixes = [];

      fileResult.warnings.forEach(msg => {
        const issue = {
          line: msg.line,
          column: msg.column,
          rule: msg.rule,
          message: msg.text,
          severity: msg.severity === 'error' ? 'error' : 'warning'
        };

        if (msg.severity === 'error') {
          errors.push(issue);
        } else {
          warnings.push(issue);
        }
      });

      // Track fixes if content changed
      if (fixed) {
        fixes.push({
          line: 0,
          column: 0,
          rule: 'stylelint-autofix',
          description: 'Auto-fixed formatting and style issues'
        });
      }

      const passed = errors.length === 0;

      return {
        passed,
        fixed,
        fixes,
        warnings,
        errors,
        content: fixedContent,
        message: this.generateMessage(passed, fixed, errors.length, warnings.length, fixes.length)
      };

    } catch (error) {
      return {
        passed: false,
        fixed: false,
        fixes: [],
        warnings: [],
        errors: [{
          line: 0,
          column: 0,
          rule: 'stylelint-error',
          message: `Stylelint validation failed: ${error.message}`,
          severity: 'error'
        }],
        content: null,
        message: `Stylelint validation failed: ${error.message}`
      };
    }
  }

  /**
   * Generate human-readable message for validation result
   * @param {boolean} passed - Whether validation passed
   * @param {boolean} fixed - Whether auto-fix was applied
   * @param {number} errorCount - Number of errors
   * @param {number} warningCount - Number of warnings
   * @param {number} fixCount - Number of fixes applied
   * @returns {string} Message
   */
  generateMessage(passed, fixed, errorCount, warningCount, fixCount) {
    const parts = [];

    if (passed && !fixed && warningCount === 0) {
      return 'Linting passed with no issues';
    }

    if (fixed) {
      parts.push(`Auto-fixed ${fixCount} issue${fixCount !== 1 ? 's' : ''}`);
    }

    if (errorCount > 0) {
      parts.push(`${errorCount} error${errorCount !== 1 ? 's' : ''}`);
    }

    if (warningCount > 0) {
      parts.push(`${warningCount} warning${warningCount !== 1 ? 's' : ''}`);
    }

    if (parts.length === 0) {
      return 'Linting passed';
    }

    return parts.join(', ');
  }
}

module.exports = new LintingValidator();
