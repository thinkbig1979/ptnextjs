#!/usr/bin/env node

/**
 * HookRunner - Core orchestration class for Agent OS hook system
 *
 * Dynamically loads and executes validators for file operations, providing:
 * - Automatic validator discovery from hooks/validators/ directory
 * - Parallel validator execution using Promise.all for performance
 * - Unified result tracking (passed, fixed, warnings, errors)
 * - File type detection and test file generation logic
 * - Colored console output for clear feedback
 * - Support for both class-based and instance-based validators
 *
 * Usage:
 *   const HookRunner = require('./hooks/runner.js');
 *   const runner = new HookRunner({ verbose: true });
 *
 *   // For file creation
 *   await runner.runFileCreationHooks(filePath, content);
 *
 *   // For file edits
 *   await runner.runFileEditHooks(filePath, oldContent, newContent);
 *
 * Validator Interface:
 *   Validators must implement a validate() method that returns:
 *   { passed: boolean, errors: [], warnings: [], fixed: boolean }
 *
 * Version: 1.0.0
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const chalk = require('chalk');

class HookRunner {
  constructor(options = {}) {
    this.agentOsRoot = options.agentOsRoot || path.join(process.env.HOME, '.agent-os');
    this.configPath = options.configPath || path.join(this.agentOsRoot, 'config.yml');
    this.validatorsDir = options.validatorsDir || path.join(this.agentOsRoot, 'hooks', 'validators');

    // Load configuration
    this.config = this.loadConfig();

    // Initialize validators
    this.validators = [];
    this.loadValidators();

    // Results tracking
    this.results = {
      passed: 0,
      fixed: 0,
      warnings: 0,
      errors: 0,
      validationResults: []
    };

    // Verbose mode for debugging
    this.verbose = options.verbose || false;
  }

  /**
   * Load configuration from config.yml
   */
  loadConfig() {
    try {
      if (!fs.existsSync(this.configPath)) {
        if (this.verbose) {
          console.log(chalk.yellow(`⚠️  Config file not found at ${this.configPath}, using defaults`));
        }
        return this.getDefaultConfig();
      }

      const configContent = fs.readFileSync(this.configPath, 'utf8');
      const config = yaml.load(configContent);

      if (this.verbose) {
        console.log(chalk.green(`✓ Loaded configuration from ${this.configPath}`));
      }

      return config;
    } catch (error) {
      console.error(chalk.red(`❌ Error loading config: ${error.message}`));
      return this.getDefaultConfig();
    }
  }

  /**
   * Get default configuration
   */
  getDefaultConfig() {
    return {
      agent_os_version: '2.8.0',
      agents: {
        claude_code: { enabled: true }
      },
      hooks: {
        enabled: true,
        validators: {
          enabled: true
        }
      }
    };
  }

  /**
   * Dynamically load all validators from validators/ directory
   */
  loadValidators() {
    try {
      if (!fs.existsSync(this.validatorsDir)) {
        if (this.verbose) {
          console.log(chalk.yellow(`⚠️  Validators directory not found: ${this.validatorsDir}`));
        }
        return;
      }

      const files = fs.readdirSync(this.validatorsDir);
      const validatorFiles = files.filter(file =>
        file.endsWith('.js') && !file.startsWith('.')
      );

      for (const file of validatorFiles) {
        try {
          const validatorPath = path.join(this.validatorsDir, file);
          const ValidatorExport = require(validatorPath);

          let validator;

          // Handle both class exports and instance exports
          if (typeof ValidatorExport === 'function') {
            // It's a class, instantiate it
            validator = new ValidatorExport(this.config);
          } else if (typeof ValidatorExport === 'object') {
            // It's already an instance
            validator = ValidatorExport;
          } else {
            console.error(chalk.yellow(`⚠️  Skipping invalid validator export: ${file}`));
            continue;
          }

          // Validate validator interface
          if (!this.isValidValidator(validator)) {
            console.error(chalk.yellow(`⚠️  Skipping invalid validator: ${file}`));
            continue;
          }

          this.validators.push({
            name: file.replace('.js', ''),
            instance: validator,
            file: file
          });

          if (this.verbose) {
            console.log(chalk.green(`✓ Loaded validator: ${file}`));
          }
        } catch (error) {
          console.error(chalk.red(`❌ Error loading validator ${file}: ${error.message}`));
        }
      }

      console.log(chalk.blue(`\n📦 Loaded ${this.validators.length} validator(s)\n`));
    } catch (error) {
      console.error(chalk.red(`❌ Error loading validators: ${error.message}`));
    }
  }

  /**
   * Validate that a validator implements the required interface
   */
  isValidValidator(validator) {
    // Check for required methods
    const requiredMethods = ['validate'];

    for (const method of requiredMethods) {
      if (typeof validator[method] !== 'function') {
        return false;
      }
    }

    return true;
  }

  /**
   * Run file creation hooks
   * @param {string} filePath - Path to the file being created
   * @param {string} content - Content of the new file
   * @returns {Promise<Object>} Validation results
   */
  async runFileCreationHooks(filePath, content) {
    console.log(chalk.blue(`\n🔍 Running file creation hooks for: ${filePath}\n`));

    this.resetResults();

    const fileType = this.getFileType(filePath);
    const shouldGenerateTests = this.shouldGenerateTestFile(filePath, fileType);

    if (this.verbose) {
      console.log(chalk.gray(`File type: ${fileType}`));
      console.log(chalk.gray(`Generate tests: ${shouldGenerateTests}`));
    }

    // Run validators in parallel
    const validationPromises = this.validators.map(validator =>
      this.runValidator(validator, {
        operation: 'create',
        filePath,
        content,
        fileType,
        shouldGenerateTests
      })
    );

    try {
      const results = await Promise.all(validationPromises);
      this.processResults(results);
      this.printSummary();

      return {
        success: this.results.errors === 0,
        results: this.results,
        shouldGenerateTests
      };
    } catch (error) {
      console.error(chalk.red(`❌ Error running validators: ${error.message}`));
      return {
        success: false,
        error: error.message,
        results: this.results
      };
    }
  }

  /**
   * Run file edit hooks
   * @param {string} filePath - Path to the file being edited
   * @param {string} oldContent - Original file content
   * @param {string} newContent - New file content
   * @returns {Promise<Object>} Validation results
   */
  async runFileEditHooks(filePath, oldContent, newContent) {
    console.log(chalk.blue(`\n🔍 Running file edit hooks for: ${filePath}\n`));

    this.resetResults();

    const fileType = this.getFileType(filePath);

    if (this.verbose) {
      console.log(chalk.gray(`File type: ${fileType}`));
    }

    // Run validators in parallel
    const validationPromises = this.validators.map(validator =>
      this.runValidator(validator, {
        operation: 'edit',
        filePath,
        oldContent,
        newContent,
        fileType
      })
    );

    try {
      const results = await Promise.all(validationPromises);
      this.processResults(results);
      this.printSummary();

      return {
        success: this.results.errors === 0,
        results: this.results
      };
    } catch (error) {
      console.error(chalk.red(`❌ Error running validators: ${error.message}`));
      return {
        success: false,
        error: error.message,
        results: this.results
      };
    }
  }

  /**
   * Run a single validator with error handling
   */
  async runValidator(validator, context) {
    try {
      const startTime = Date.now();

      // Different validators expect different parameters
      // Adapt the context to match the validator's expectations
      let result;

      if (validator.name === 'test_generator') {
        // Test generator expects (sourceFilePath, options)
        result = validator.instance.validate(context.filePath, {
          useTestsDir: true,
          customTestPath: null
        });
      } else {
        // Most validators expect just the file path
        result = await validator.instance.validate(context.filePath);
      }

      const duration = Date.now() - startTime;

      return {
        validator: validator.name,
        success: true,
        result,
        duration
      };
    } catch (error) {
      return {
        validator: validator.name,
        success: false,
        error: error.message,
        duration: 0
      };
    }
  }

  /**
   * Process validation results
   */
  processResults(results) {
    for (const result of results) {
      this.results.validationResults.push(result);

      if (!result.success) {
        this.results.errors++;
        console.error(chalk.red(`❌ ${result.validator}: ${result.error}`));
        continue;
      }

      const validationResult = result.result;

      // Handle different result structures from validators
      // Some validators return { passed, errors, warnings, fixed }
      // Others return { success, status, message, details }

      if (validationResult.passed === true || validationResult.success === true) {
        this.results.passed++;
        console.log(chalk.green(`✓ ${result.validator}: Passed`));

        // Check for warnings
        if (validationResult.warnings && validationResult.warnings.length > 0) {
          this.results.warnings += validationResult.warnings.length;
          validationResult.warnings.forEach(warning => {
            // Handle both string and object warnings
            const warningMsg = typeof warning === 'string' ? warning :
                             (warning.message || JSON.stringify(warning));
            console.log(chalk.yellow(`  ⚠️  ${warningMsg}`));
          });
        }
      } else if (validationResult.passed === false || validationResult.success === false) {
        // Check if it was fixed
        if (validationResult.fixed === true) {
          this.results.fixed++;
          console.log(chalk.yellow(`🔧 ${result.validator}: Fixed issues`));
        } else {
          this.results.errors++;
          console.error(chalk.red(`❌ ${result.validator}: Failed`));

          // Show errors
          if (validationResult.errors && validationResult.errors.length > 0) {
            validationResult.errors.forEach(error => {
              console.error(chalk.red(`  • ${error}`));
            });
          } else if (validationResult.error) {
            console.error(chalk.red(`  • ${validationResult.error}`));
          } else if (validationResult.message) {
            console.error(chalk.red(`  • ${validationResult.message}`));
          }
        }
      } else if (validationResult.status === 'passed') {
        this.results.passed++;
        console.log(chalk.green(`✓ ${result.validator}: Passed`));
      } else if (validationResult.status === 'fixed') {
        this.results.fixed++;
        console.log(chalk.yellow(`🔧 ${result.validator}: Fixed issues`));
      } else if (validationResult.status === 'warning') {
        this.results.warnings++;
        console.log(chalk.yellow(`⚠️  ${result.validator}: ${validationResult.message || 'Warning'}`));
      } else if (validationResult.status === 'error') {
        this.results.errors++;
        console.error(chalk.red(`❌ ${result.validator}: ${validationResult.message || 'Failed'}`));
      }

      // Show additional details if verbose
      if (this.verbose && validationResult.details) {
        console.log(chalk.gray(`   Details: ${JSON.stringify(validationResult.details, null, 2)}`));
      }
    }
  }

  /**
   * Reset results for a new validation run
   */
  resetResults() {
    this.results = {
      passed: 0,
      fixed: 0,
      warnings: 0,
      errors: 0,
      validationResults: []
    };
  }

  /**
   * Detect file type from file path
   * @param {string} filePath - Path to the file
   * @returns {string} File type
   */
  getFileType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const basename = path.basename(filePath).toLowerCase();

    // File type mappings
    const typeMap = {
      '.js': 'javascript',
      '.ts': 'typescript',
      '.jsx': 'react',
      '.tsx': 'react-typescript',
      '.py': 'python',
      '.rb': 'ruby',
      '.java': 'java',
      '.go': 'go',
      '.rs': 'rust',
      '.md': 'markdown',
      '.json': 'json',
      '.yml': 'yaml',
      '.yaml': 'yaml',
      '.html': 'html',
      '.css': 'css',
      '.scss': 'scss',
      '.vue': 'vue',
      '.php': 'php',
      '.sh': 'shell',
      '.bash': 'shell'
    };

    // Special cases based on filename
    if (basename.includes('test') || basename.includes('spec')) {
      return 'test';
    }

    if (basename.includes('config')) {
      return 'config';
    }

    if (basename === 'dockerfile' || basename === '.dockerignore') {
      return 'docker';
    }

    if (basename.startsWith('.env')) {
      return 'environment';
    }

    return typeMap[ext] || 'unknown';
  }

  /**
   * Determine if a test file should be generated
   * @param {string} filePath - Path to the file
   * @param {string} fileType - Detected file type
   * @returns {boolean} True if test file should be generated
   */
  shouldGenerateTestFile(filePath, fileType) {
    // Don't generate tests for test files themselves
    if (fileType === 'test') {
      return false;
    }

    // Don't generate tests for config/documentation files
    const nonTestableTypes = [
      'config', 'markdown', 'json', 'yaml',
      'environment', 'docker', 'html', 'css', 'scss'
    ];

    if (nonTestableTypes.includes(fileType)) {
      return false;
    }

    // Don't generate tests for files in certain directories
    const nonTestableDirectories = [
      'node_modules',
      'vendor',
      'dist',
      'build',
      'coverage',
      '.git',
      'docs',
      'documentation'
    ];

    for (const dir of nonTestableDirectories) {
      if (filePath.includes(`/${dir}/`) || filePath.startsWith(`${dir}/`)) {
        return false;
      }
    }

    // Generate tests for source code files
    const testableTypes = [
      'javascript', 'typescript', 'react', 'react-typescript',
      'python', 'ruby', 'java', 'go', 'rust', 'vue', 'php'
    ];

    return testableTypes.includes(fileType);
  }

  /**
   * Print summary of validation results
   */
  printSummary() {
    console.log(chalk.blue('\n' + '='.repeat(60)));
    console.log(chalk.blue('📊 Validation Summary'));
    console.log(chalk.blue('='.repeat(60)));

    const total = this.results.passed + this.results.fixed +
                  this.results.warnings + this.results.errors;

    console.log(chalk.white(`Total validators run: ${total}`));

    if (this.results.passed > 0) {
      console.log(chalk.green(`✓ Passed: ${this.results.passed}`));
    }

    if (this.results.fixed > 0) {
      console.log(chalk.yellow(`🔧 Fixed: ${this.results.fixed}`));
    }

    if (this.results.warnings > 0) {
      console.log(chalk.yellow(`⚠️  Warnings: ${this.results.warnings}`));
    }

    if (this.results.errors > 0) {
      console.log(chalk.red(`❌ Errors: ${this.results.errors}`));
    }

    console.log(chalk.blue('='.repeat(60)));

    // Overall status
    if (this.results.errors === 0) {
      if (this.results.warnings === 0) {
        console.log(chalk.green('\n✅ All validations passed successfully!\n'));
      } else {
        console.log(chalk.yellow('\n⚠️  Validations passed with warnings.\n'));
      }
    } else {
      console.log(chalk.red('\n❌ Validation failed. Please fix the errors above.\n'));
    }

    // Performance stats if verbose
    if (this.verbose && this.results.validationResults.length > 0) {
      const totalDuration = this.results.validationResults.reduce(
        (sum, r) => sum + (r.duration || 0), 0
      );
      console.log(chalk.gray(`Total execution time: ${totalDuration}ms\n`));
    }
  }

  /**
   * Get validation statistics
   */
  getStats() {
    return {
      total: this.validators.length,
      passed: this.results.passed,
      fixed: this.results.fixed,
      warnings: this.results.warnings,
      errors: this.results.errors,
      validationResults: this.results.validationResults
    };
  }

  /**
   * Enable verbose mode
   */
  enableVerbose() {
    this.verbose = true;
  }

  /**
   * Disable verbose mode
   */
  disableVerbose() {
    this.verbose = false;
  }
}

// CLI interface for testing
if (require.main === module) {
  const runner = new HookRunner({ verbose: true });

  console.log(chalk.blue('🚀 Agent OS Hook Runner'));
  console.log(chalk.gray(`Configuration: ${runner.configPath}`));
  console.log(chalk.gray(`Validators directory: ${runner.validatorsDir}`));
  console.log(chalk.gray(`Loaded validators: ${runner.validators.length}`));

  // Test file creation hook with a real test file
  const testFilePath = path.join(process.cwd(), 'test-example.js');
  const testContent = 'function hello() { console.log("Hello World"); }';

  // Create the test file
  const fs = require('fs');
  fs.writeFileSync(testFilePath, testContent, 'utf8');

  runner.runFileCreationHooks(testFilePath, testContent)
    .then(result => {
      console.log(chalk.blue('\n📋 Result:'));
      console.log(result);

      // Clean up test file
      try {
        fs.unlinkSync(testFilePath);
        console.log(chalk.gray(`\n🧹 Cleaned up test file: ${testFilePath}`));
      } catch (error) {
        console.log(chalk.yellow(`⚠️  Could not clean up test file: ${error.message}`));
      }

      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error(chalk.red(`\n❌ Fatal error: ${error.message}`));
      process.exit(1);
    });
}

module.exports = HookRunner;
