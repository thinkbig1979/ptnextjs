const { execSync, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * TypeScript Type Checking Validator
 *
 * Runs `tsc --noEmit` to validate TypeScript types in the project.
 * This fills the gap where syntax_check.js only validates JavaScript syntax,
 * not TypeScript types.
 *
 * Implementation notes:
 * - Runs tsc on the project (not individual files) because TypeScript
 *   type checking requires the full project context
 * - Caches results per project to avoid running tsc on every file write
 * - Respects project's tsconfig.json configuration
 * - Only runs for TypeScript files (.ts, .tsx)
 *
 * Version: 1.0.0
 */

class TypeCheckingValidator {
  constructor(config = {}) {
    this.name = 'type_checking';
    this.config = config;

    // Cache to avoid running tsc on every file write within same second
    this.cache = new Map();
    this.cache_ttl_ms = 5000; // 5 second cache per project
  }

  /**
   * Main validation method
   * @param {string} file_path - Path to file to validate
   * @returns {Promise<Object>} - { passed: boolean, errors: string[], warnings: string[] }
   */
  async validate(file_path) {
    const result = {
      passed: true,
      errors: [],
      warnings: [],
      fixed: false,
      content: null
    };

    try {
      // Only run for TypeScript files
      const ext = path.extname(file_path).toLowerCase();
      if (!['.ts', '.tsx'].includes(ext)) {
        return result;
      }

      // Find project root (directory with tsconfig.json)
      const project_root = this.find_project_root(file_path);
      if (!project_root) {
        result.warnings.push('No tsconfig.json found - TypeScript type checking skipped');
        return result;
      }

      // Check cache to avoid running tsc too frequently
      const cache_key = project_root;
      const cached = this.cache.get(cache_key);
      if (cached && (Date.now() - cached.timestamp) < this.cache_ttl_ms) {
        // Return cached result
        return cached.result;
      }

      // Check if tsc is available
      if (!this.is_tsc_available(project_root)) {
        result.warnings.push('TypeScript compiler (tsc) not available in project');
        return result;
      }

      // Run tsc --noEmit
      const tsc_result = this.run_tsc(project_root, file_path);

      if (!tsc_result.passed) {
        result.passed = false;
        result.errors = tsc_result.errors;
      }

      if (tsc_result.warnings.length > 0) {
        result.warnings = tsc_result.warnings;
      }

      // Cache the result
      this.cache.set(cache_key, {
        timestamp: Date.now(),
        result: { ...result }
      });

      return result;

    } catch (error) {
      result.passed = false;
      result.errors.push(`Type checking error: ${error.message}`);
      return result;
    }
  }

  /**
   * Find project root by looking for tsconfig.json
   * @param {string} file_path - Starting path
   * @returns {string|null} - Project root path or null
   */
  find_project_root(file_path) {
    let current_dir = path.dirname(file_path);
    const root = path.parse(current_dir).root;

    while (current_dir !== root) {
      const tsconfig_path = path.join(current_dir, 'tsconfig.json');
      if (fs.existsSync(tsconfig_path)) {
        return current_dir;
      }
      current_dir = path.dirname(current_dir);
    }

    return null;
  }

  /**
   * Check if TypeScript compiler is available
   * @param {string} project_root - Project root directory
   * @returns {boolean} - True if tsc is available
   */
  is_tsc_available(project_root) {
    try {
      // First check for local tsc via npx
      const result = spawnSync('npx', ['tsc', '--version'], {
        cwd: project_root,
        stdio: 'pipe',
        timeout: 10000
      });
      return result.status === 0;
    } catch {
      return false;
    }
  }

  /**
   * Run TypeScript compiler in check-only mode
   * @param {string} project_root - Project root directory
   * @param {string} changed_file - The file that was changed (for filtering output)
   * @returns {Object} - { passed: boolean, errors: string[], warnings: string[] }
   */
  run_tsc(project_root, changed_file) {
    const result = {
      passed: true,
      errors: [],
      warnings: []
    };

    try {
      // Run tsc --noEmit to check types without emitting files
      // Use --pretty false for machine-parseable output
      execSync('npx tsc --noEmit --pretty false', {
        cwd: project_root,
        encoding: 'utf8',
        stdio: 'pipe',
        timeout: 60000 // 60 second timeout
      });

      // If we get here, no errors
      return result;

    } catch (error) {
      // tsc exits with 1 when there are type errors
      const output = error.stdout || error.message || '';

      // Parse TypeScript error output
      // Format: path/to/file.ts(line,col): error TS1234: message
      const error_lines = output.split('\n').filter(line => line.trim());

      for (const line of error_lines) {
        // Match TypeScript error format
        const match = line.match(/^(.+?)\((\d+),(\d+)\):\s*(error|warning)\s+(TS\d+):\s*(.+)$/);

        if (match) {
          const [, error_file, line_num, col, severity, code, message] = match;

          // Normalize paths for comparison
          const normalized_error_file = path.resolve(project_root, error_file);
          const normalized_changed_file = path.resolve(changed_file);

          // Prioritize errors in the changed file, but report all
          const formatted_error = `${error_file}:${line_num}:${col} - ${code}: ${message}`;

          if (severity === 'error') {
            result.passed = false;
            result.errors.push(formatted_error);
          } else {
            result.warnings.push(formatted_error);
          }
        } else if (line.includes('error TS')) {
          // Catch other error formats
          result.passed = false;
          result.errors.push(line.trim());
        }
      }

      // If we found no parseable errors but tsc failed, report the raw output
      if (result.errors.length === 0 && !result.passed === false) {
        result.passed = false;
        result.errors.push(`TypeScript compilation failed:\n${output.substring(0, 500)}`);
      }

      return result;
    }
  }

  /**
   * Clear the cache (useful for testing)
   */
  clear_cache() {
    this.cache.clear();
  }
}

module.exports = new TypeCheckingValidator();
