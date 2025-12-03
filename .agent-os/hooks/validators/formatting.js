/**
 * Formatting Validator for Agent OS
 * Validates and auto-fixes code formatting using Prettier and Black
 *
 * Supports:
 * - JavaScript/TypeScript (Prettier)
 * - JSON (Prettier)
 * - CSS/SCSS/LESS (Prettier)
 * - Markdown (Prettier)
 * - Python (Black)
 *
 * Features:
 * - Auto-fix with --write flag
 * - Returns fixed content
 * - Tracks fixes in fixes[] array
 * - Safe temp file processing
 * - Handles missing formatters gracefully
 *
 * Usage:
 *   const validator = require('./hooks/validators/formatting.js');
 *   const result = validator.validate(filePath, { autoFix: true });
 *
 * Result structure:
 *   {
 *     passed: boolean,    // true if already formatted
 *     fixed: boolean,     // true if auto-fix was applied
 *     fixes: string[],    // array of applied fixes
 *     content: string     // file content (formatted if fixed)
 *   }
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const os = require('os');

class FormattingValidator {
  constructor() {
    this.tempDir = path.join(os.tmpdir(), 'formatting-validator');
    this.ensureTempDir();
  }

  /**
   * Ensure temp directory exists for safe processing
   */
  ensureTempDir() {
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
  }

  /**
   * Detect file type based on extension
   */
  detectFileType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const extMap = {
      '.js': 'javascript',
      '.jsx': 'javascript',
      '.ts': 'typescript',
      '.tsx': 'typescript',
      '.json': 'json',
      '.css': 'css',
      '.scss': 'css',
      '.less': 'css',
      '.md': 'markdown',
      '.markdown': 'markdown',
      '.py': 'python'
    };

    return extMap[ext] || null;
  }

  /**
   * Get appropriate formatter for file type
   */
  getFormatter(fileType) {
    if (fileType === 'python') {
      return 'black';
    } else if (['javascript', 'typescript', 'json', 'css', 'markdown'].includes(fileType)) {
      return 'prettier';
    }
    return null;
  }

  /**
   * Check if formatter is installed
   */
  isFormatterInstalled(formatter) {
    try {
      if (formatter === 'prettier') {
        execSync('npx prettier --version', { stdio: 'ignore' });
        return true;
      } else if (formatter === 'black') {
        execSync('black --version', { stdio: 'ignore' });
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get Prettier configuration
   */
  getPrettierConfig() {
    return {
      semi: true,
      singleQuote: true,
      tabWidth: 2,
      trailingComma: 'es5',
      printWidth: 80,
      arrowParens: 'avoid'
    };
  }

  /**
   * Format file with Prettier
   */
  formatWithPrettier(filePath, content, autoFix = false) {
    const fileType = this.detectFileType(filePath);
    const config = this.getPrettierConfig();

    // Create temp file for safe processing
    const tempFile = path.join(this.tempDir, `temp-${Date.now()}${path.extname(filePath)}`);

    try {
      // Write content to temp file
      fs.writeFileSync(tempFile, content, 'utf8');

      // Determine parser based on file type
      const parserMap = {
        javascript: 'babel',
        typescript: 'typescript',
        json: 'json',
        css: 'css',
        markdown: 'markdown'
      };
      const parser = parserMap[fileType] || 'babel';

      // Build Prettier command
      const configArgs = Object.entries(config)
        .map(([key, value]) => {
          if (typeof value === 'boolean') {
            return value ? `--${key}` : `--no-${key}`;
          }
          return `--${key}=${value}`;
        })
        .join(' ');

      const checkCommand = `npx prettier --check --parser=${parser} ${configArgs} "${tempFile}"`;
      const fixCommand = `npx prettier --write --parser=${parser} ${configArgs} "${tempFile}"`;

      try {
        // Check formatting
        execSync(checkCommand, { stdio: 'pipe' });

        // Clean up temp file
        fs.unlinkSync(tempFile);

        return {
          passed: true,
          fixed: false,
          fixes: [],
          content: content
        };
      } catch (checkError) {
        // File needs formatting
        if (autoFix) {
          try {
            // Apply formatting
            execSync(fixCommand, { stdio: 'pipe' });

            // Read formatted content
            const formattedContent = fs.readFileSync(tempFile, 'utf8');

            // Clean up temp file
            fs.unlinkSync(tempFile);

            return {
              passed: false,
              fixed: true,
              fixes: ['Applied Prettier formatting'],
              content: formattedContent
            };
          } catch (fixError) {
            // Clean up temp file
            if (fs.existsSync(tempFile)) {
              fs.unlinkSync(tempFile);
            }

            return {
              passed: false,
              fixed: false,
              fixes: [],
              content: content,
              error: `Failed to format: ${fixError.message}`
            };
          }
        } else {
          // Clean up temp file
          fs.unlinkSync(tempFile);

          return {
            passed: false,
            fixed: false,
            fixes: ['File needs Prettier formatting (run with autoFix=true to fix)'],
            content: content
          };
        }
      }
    } catch (error) {
      // Clean up temp file if it exists
      if (fs.existsSync(tempFile)) {
        fs.unlinkSync(tempFile);
      }

      return {
        passed: false,
        fixed: false,
        fixes: [],
        content: content,
        error: error.message
      };
    }
  }

  /**
   * Format file with Black (Python)
   */
  formatWithBlack(filePath, content, autoFix = false) {
    // Create temp file for safe processing
    const tempFile = path.join(this.tempDir, `temp-${Date.now()}.py`);

    try {
      // Write content to temp file
      fs.writeFileSync(tempFile, content, 'utf8');

      // Check formatting with --check flag
      const checkCommand = `black --check --quiet "${tempFile}"`;
      const fixCommand = `black --quiet "${tempFile}"`;

      try {
        // Check formatting
        execSync(checkCommand, { stdio: 'pipe' });

        // Clean up temp file
        fs.unlinkSync(tempFile);

        return {
          passed: true,
          fixed: false,
          fixes: [],
          content: content
        };
      } catch (checkError) {
        // File needs formatting
        if (autoFix) {
          try {
            // Apply formatting
            execSync(fixCommand, { stdio: 'pipe' });

            // Read formatted content
            const formattedContent = fs.readFileSync(tempFile, 'utf8');

            // Clean up temp file
            fs.unlinkSync(tempFile);

            return {
              passed: false,
              fixed: true,
              fixes: ['Applied Black formatting'],
              content: formattedContent
            };
          } catch (fixError) {
            // Clean up temp file
            if (fs.existsSync(tempFile)) {
              fs.unlinkSync(tempFile);
            }

            return {
              passed: false,
              fixed: false,
              fixes: [],
              content: content,
              error: `Failed to format: ${fixError.message}`
            };
          }
        } else {
          // Clean up temp file
          fs.unlinkSync(tempFile);

          return {
            passed: false,
            fixed: false,
            fixes: ['File needs Black formatting (run with autoFix=true to fix)'],
            content: content
          };
        }
      }
    } catch (error) {
      // Clean up temp file if it exists
      if (fs.existsSync(tempFile)) {
        fs.unlinkSync(tempFile);
      }

      return {
        passed: false,
        fixed: false,
        fixes: [],
        content: content,
        error: error.message
      };
    }
  }

  /**
   * Validate and optionally fix formatting of a file
   *
   * @param {string} filePath - Path to the file to validate
   * @param {Object} options - Validation options
   * @param {boolean} options.autoFix - Whether to auto-fix formatting issues
   * @param {string} options.content - Optional content to validate (instead of reading file)
   * @returns {Object} Validation result with passed, fixed, fixes, and content
   */
  validate(filePath, options = {}) {
    const { autoFix = false, content: providedContent = null } = options;

    try {
      // Detect file type
      const fileType = this.detectFileType(filePath);

      if (!fileType) {
        return {
          passed: true,
          fixed: false,
          fixes: [],
          content: providedContent || fs.readFileSync(filePath, 'utf8'),
          message: 'Unsupported file type - skipping formatting validation'
        };
      }

      // Get formatter
      const formatter = this.getFormatter(fileType);

      if (!formatter) {
        return {
          passed: true,
          fixed: false,
          fixes: [],
          content: providedContent || fs.readFileSync(filePath, 'utf8'),
          message: 'No formatter available for this file type'
        };
      }

      // Check if formatter is installed
      if (!this.isFormatterInstalled(formatter)) {
        return {
          passed: false,
          fixed: false,
          fixes: [],
          content: providedContent || fs.readFileSync(filePath, 'utf8'),
          error: `Formatter '${formatter}' is not installed. Install it to enable formatting validation.`,
          warning: true // Mark as warning, not hard failure
        };
      }

      // Read file content if not provided
      const content = providedContent || fs.readFileSync(filePath, 'utf8');

      // Format based on formatter type
      if (formatter === 'prettier') {
        return this.formatWithPrettier(filePath, content, autoFix);
      } else if (formatter === 'black') {
        return this.formatWithBlack(filePath, content, autoFix);
      }

      return {
        passed: true,
        fixed: false,
        fixes: [],
        content: content
      };

    } catch (error) {
      return {
        passed: false,
        fixed: false,
        fixes: [],
        content: providedContent || '',
        error: error.message
      };
    }
  }

  /**
   * Validate and optionally fix multiple files
   *
   * @param {Array<string>} filePaths - Array of file paths to validate
   * @param {Object} options - Validation options
   * @returns {Object} Combined validation results
   */
  validateMultiple(filePaths, options = {}) {
    const results = {
      total: filePaths.length,
      passed: 0,
      fixed: 0,
      failed: 0,
      warnings: 0,
      files: {}
    };

    for (const filePath of filePaths) {
      const result = this.validate(filePath, options);

      results.files[filePath] = result;

      if (result.passed) {
        results.passed++;
      } else if (result.fixed) {
        results.fixed++;
      } else if (result.warning) {
        results.warnings++;
      } else {
        results.failed++;
      }
    }

    return results;
  }

  /**
   * Clean up temp directory
   */
  cleanup() {
    try {
      if (fs.existsSync(this.tempDir)) {
        const files = fs.readdirSync(this.tempDir);
        for (const file of files) {
          fs.unlinkSync(path.join(this.tempDir, file));
        }
      }
    } catch (error) {
      // Ignore cleanup errors
    }
  }
}

module.exports = new FormattingValidator();
