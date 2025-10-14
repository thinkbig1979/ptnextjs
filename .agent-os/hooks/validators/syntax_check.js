const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const os = require('os');

class SyntaxValidator {
  constructor() {
    this.temp_files = [];
  }

  /**
   * Main validation method
   * @param {string} file_path - Path to file to validate
   * @returns {Object} - { passed: boolean, errors: string[], warnings: string[] }
   */
  async validate(file_path) {
    const result = {
      passed: true,
      errors: [],
      warnings: []
    };

    try {
      // Check if file exists
      if (!fs.existsSync(file_path)) {
        result.passed = false;
        result.errors.push(`File not found: ${file_path}`);
        return result;
      }

      // Determine file type
      const ext = path.extname(file_path).toLowerCase();

      switch (ext) {
        case '.js':
        case '.jsx':
        case '.mjs':
        case '.cjs':
          return await this.validate_javascript(file_path);

        case '.ts':
        case '.tsx':
          return await this.validate_typescript(file_path);

        case '.py':
          return await this.validate_python(file_path);

        case '.json':
          return await this.validate_json(file_path);

        case '.yaml':
        case '.yml':
          return await this.validate_yaml(file_path);

        default:
          result.warnings.push(`Unsupported file type: ${ext}`);
          return result;
      }
    } catch (error) {
      result.passed = false;
      result.errors.push(`Validation error: ${error.message}`);
      return result;
    } finally {
      this.cleanup_temp_files();
    }
  }

  /**
   * Validate JavaScript syntax using Node.js --check
   */
  async validate_javascript(file_path) {
    const result = {
      passed: true,
      errors: [],
      warnings: []
    };

    let temp_file = null;

    try {
      // Create temp file to avoid affecting source
      temp_file = this.create_temp_file(file_path);

      // Use Node.js --check for syntax validation
      execSync(`node --check "${temp_file}"`, {
        encoding: 'utf8',
        stdio: 'pipe'
      });

    } catch (error) {
      result.passed = false;

      // Parse error message and replace temp file path with original
      const error_message = error.message
        .replace(new RegExp(temp_file, 'g'), file_path)
        .replace(/^Command failed:.*\n/, '');

      result.errors.push(error_message.trim());
    }

    return result;
  }

  /**
   * Validate TypeScript syntax using Node.js --check
   * Note: This only validates basic JavaScript syntax, not TypeScript types
   */
  async validate_typescript(file_path) {
    const result = {
      passed: true,
      errors: [],
      warnings: []
    };

    // Add warning about TypeScript limitation
    result.warnings.push('TypeScript type checking not available - only JavaScript syntax validated');

    let temp_file = null;

    try {
      // Create temp file to avoid affecting source
      temp_file = this.create_temp_file(file_path);

      // Use Node.js --check for basic syntax validation
      execSync(`node --check "${temp_file}"`, {
        encoding: 'utf8',
        stdio: 'pipe'
      });

    } catch (error) {
      result.passed = false;

      // Parse error message and replace temp file path with original
      const error_message = error.message
        .replace(new RegExp(temp_file, 'g'), file_path)
        .replace(/^Command failed:.*\n/, '');

      result.errors.push(error_message.trim());
    }

    return result;
  }

  /**
   * Validate Python syntax using python -m py_compile
   */
  async validate_python(file_path) {
    const result = {
      passed: true,
      errors: [],
      warnings: []
    };

    let temp_file = null;

    try {
      // Check if Python is available
      try {
        execSync('python3 --version', { stdio: 'pipe' });
      } catch {
        try {
          execSync('python --version', { stdio: 'pipe' });
        } catch {
          result.passed = false;
          result.errors.push('Python interpreter not found');
          return result;
        }
      }

      // Create temp file to avoid affecting source
      temp_file = this.create_temp_file(file_path);

      // Try python3 first, fall back to python
      let python_cmd = 'python3';
      try {
        execSync('python3 --version', { stdio: 'pipe' });
      } catch {
        python_cmd = 'python';
      }

      // Use py_compile for syntax validation
      execSync(`${python_cmd} -m py_compile "${temp_file}"`, {
        encoding: 'utf8',
        stdio: 'pipe'
      });

    } catch (error) {
      result.passed = false;

      // Parse error message and replace temp file path with original
      const error_message = error.message
        .replace(new RegExp(temp_file, 'g'), file_path)
        .replace(/^Command failed:.*\n/, '');

      result.errors.push(error_message.trim());
    }

    return result;
  }

  /**
   * Validate JSON syntax using JSON.parse()
   */
  async validate_json(file_path) {
    const result = {
      passed: true,
      errors: [],
      warnings: []
    };

    try {
      const content = fs.readFileSync(file_path, 'utf8');
      JSON.parse(content);
    } catch (error) {
      result.passed = false;

      // Format error message with file path and position
      if (error instanceof SyntaxError) {
        const match = error.message.match(/position (\d+)/);
        if (match) {
          const position = parseInt(match[1]);
          const content = fs.readFileSync(file_path, 'utf8');
          const line_info = this.get_line_and_column(content, position);
          result.errors.push(
            `${file_path}:${line_info.line}:${line_info.column} - ${error.message}`
          );
        } else {
          result.errors.push(`${file_path} - ${error.message}`);
        }
      } else {
        result.errors.push(`${file_path} - ${error.message}`);
      }
    }

    return result;
  }

  /**
   * Validate YAML syntax using js-yaml
   */
  async validate_yaml(file_path) {
    const result = {
      passed: true,
      errors: [],
      warnings: []
    };

    try {
      // Try to require js-yaml
      let yaml;
      try {
        yaml = require('js-yaml');
      } catch {
        result.passed = false;
        result.errors.push('js-yaml package not found - run: npm install js-yaml');
        return result;
      }

      const content = fs.readFileSync(file_path, 'utf8');
      yaml.load(content);

    } catch (error) {
      result.passed = false;

      // Format error message with file path and position
      if (error.mark) {
        result.errors.push(
          `${file_path}:${error.mark.line + 1}:${error.mark.column + 1} - ${error.reason}`
        );
      } else {
        result.errors.push(`${file_path} - ${error.message}`);
      }
    }

    return result;
  }

  /**
   * Create a temporary copy of the file for validation
   */
  create_temp_file(file_path) {
    const content = fs.readFileSync(file_path, 'utf8');
    const ext = path.extname(file_path);
    const temp_file = path.join(
      os.tmpdir(),
      `syntax-check-${Date.now()}-${Math.random().toString(36).substr(2, 9)}${ext}`
    );

    fs.writeFileSync(temp_file, content, 'utf8');
    this.temp_files.push(temp_file);

    return temp_file;
  }

  /**
   * Get line and column from character position in content
   */
  get_line_and_column(content, position) {
    const lines = content.substring(0, position).split('\n');
    return {
      line: lines.length,
      column: lines[lines.length - 1].length + 1
    };
  }

  /**
   * Clean up temporary files
   */
  cleanup_temp_files() {
    for (const temp_file of this.temp_files) {
      try {
        if (fs.existsSync(temp_file)) {
          fs.unlinkSync(temp_file);
        }
      } catch (error) {
        // Silently ignore cleanup errors
      }
    }
    this.temp_files = [];
  }
}

module.exports = new SyntaxValidator();
