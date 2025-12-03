/**
 * Validator Registry
 *
 * A pluggable validator system that allows registration, discovery, and
 * execution of file validators. Supports both built-in validators and
 * custom project-specific validators.
 *
 * Features:
 * - Dynamic validator registration and discovery
 * - Configuration-driven enable/disable
 * - Parallel execution with dependency ordering
 * - Result aggregation and reporting
 * - Plugin-style extensibility
 *
 * Usage:
 *   const { ValidatorRegistry } = require('./hooks/validator-registry.js');
 *   const registry = new ValidatorRegistry();
 *
 *   // Register a custom validator
 *   registry.register('my-validator', MyValidatorClass, { priority: 5 });
 *
 *   // Run all enabled validators
 *   const results = await registry.runAll(filePath, content);
 *
 * @version 1.0.0
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

class ValidatorRegistry {
  constructor(options = {}) {
    // Validator storage
    this.validators = new Map();

    // Configuration
    this.configPath = options.configPath ||
      path.join(process.env.HOME, '.agent-os', 'config.yml');
    this.config = options.config || this.loadConfig();

    // Validators directory for auto-discovery
    this.validatorsDir = options.validatorsDir ||
      path.join(process.env.HOME, '.agent-os', 'hooks', 'validators');

    // Auto-discover validators if enabled
    if (options.autoDiscover !== false) {
      this.discoverValidators();
    }
  }

  /**
   * Load configuration
   */
  loadConfig() {
    try {
      if (fs.existsSync(this.configPath)) {
        const content = fs.readFileSync(this.configPath, 'utf8');
        return yaml.load(content);
      }
    } catch (error) {
      console.warn(`Warning: Could not load config: ${error.message}`);
    }
    return {};
  }

  /**
   * Register a validator
   *
   * @param {string} name - Unique validator name
   * @param {Function|Object} ValidatorClass - Validator class or instance
   * @param {Object} options - Registration options
   * @returns {ValidatorRegistry} this for chaining
   */
  register(name, ValidatorClass, options = {}) {
    const validatorInfo = {
      name,
      class: typeof ValidatorClass === 'function' ? ValidatorClass : null,
      instance: typeof ValidatorClass === 'object' ? ValidatorClass : null,
      enabled: options.enabled ?? true,
      priority: options.priority ?? 10,
      filePatterns: options.filePatterns || ['*'],
      autoFix: options.autoFix ?? false,
      description: options.description || '',
      configKey: options.configKey || name,
    };

    // Check if validator is disabled in config
    const configEnabled = this.isEnabledInConfig(validatorInfo.configKey);
    if (configEnabled !== undefined) {
      validatorInfo.enabled = configEnabled;
    }

    this.validators.set(name, validatorInfo);
    return this;
  }

  /**
   * Check if validator is enabled in configuration
   */
  isEnabledInConfig(configKey) {
    // Check in quality_hooks.validators array
    const hookValidators = this.config?.quality_hooks?.validators || [];
    if (Array.isArray(hookValidators)) {
      const found = hookValidators.find(v =>
        typeof v === 'string' ? v === configKey : v.name === configKey
      );
      if (found) {
        return typeof found === 'object' ? found.enabled !== false : true;
      }
    }

    // Check in test_standards section
    if (configKey === 'test_standards') {
      return this.config?.test_standards?.enabled !== false &&
             this.config?.test_infrastructure?.test_standards_validator?.enabled !== false;
    }

    return undefined;
  }

  /**
   * Unregister a validator
   *
   * @param {string} name - Validator name
   * @returns {boolean} true if removed
   */
  unregister(name) {
    return this.validators.delete(name);
  }

  /**
   * Get a registered validator
   *
   * @param {string} name - Validator name
   * @returns {Object|undefined} Validator info
   */
  get(name) {
    return this.validators.get(name);
  }

  /**
   * Get all enabled validators, sorted by priority
   *
   * @returns {Array} Enabled validators sorted by priority
   */
  getEnabled() {
    return Array.from(this.validators.values())
      .filter(v => v.enabled)
      .sort((a, b) => a.priority - b.priority);
  }

  /**
   * Get validators applicable to a specific file
   *
   * @param {string} filePath - File path to check
   * @returns {Array} Applicable validators
   */
  getForFile(filePath) {
    const fileName = path.basename(filePath);
    const ext = path.extname(filePath);

    return this.getEnabled().filter(validator => {
      return validator.filePatterns.some(pattern => {
        if (pattern === '*') return true;
        if (pattern.startsWith('*.')) {
          return ext === pattern.slice(1);
        }
        if (pattern.includes('*')) {
          const regex = new RegExp(
            pattern.replace(/\*/g, '.*').replace(/\?/g, '.')
          );
          return regex.test(fileName) || regex.test(filePath);
        }
        return fileName === pattern || filePath.endsWith(pattern);
      });
    });
  }

  /**
   * Enable a validator
   *
   * @param {string} name - Validator name
   * @returns {boolean} success
   */
  enable(name) {
    const validator = this.validators.get(name);
    if (validator) {
      validator.enabled = true;
      return true;
    }
    return false;
  }

  /**
   * Disable a validator
   *
   * @param {string} name - Validator name
   * @returns {boolean} success
   */
  disable(name) {
    const validator = this.validators.get(name);
    if (validator) {
      validator.enabled = false;
      return true;
    }
    return false;
  }

  /**
   * Get or create validator instance
   */
  getInstance(validator) {
    if (validator.instance) {
      return validator.instance;
    }
    if (validator.class) {
      validator.instance = new validator.class(this.config);
      return validator.instance;
    }
    throw new Error(`No class or instance for validator: ${validator.name}`);
  }

  /**
   * Run all enabled validators on a file
   *
   * @param {string} filePath - Path to file
   * @param {string} content - File content (optional, will read from disk)
   * @param {Object} options - Execution options
   * @returns {Promise<Object>} Aggregated results
   */
  async runAll(filePath, content = null, options = {}) {
    // Read content if not provided
    if (content === null && fs.existsSync(filePath)) {
      content = fs.readFileSync(filePath, 'utf8');
    }

    // Get applicable validators
    const validators = options.validators
      ? options.validators.map(n => this.get(n)).filter(Boolean)
      : this.getForFile(filePath);

    // Run validators
    const startTime = Date.now();
    const results = [];

    // Run in parallel or series based on options
    if (options.parallel !== false) {
      const promises = validators.map(v => this.runValidator(v, filePath, content));
      results.push(...await Promise.all(promises));
    } else {
      for (const validator of validators) {
        results.push(await this.runValidator(validator, filePath, content));
      }
    }

    // Aggregate results
    return this.aggregateResults(results, Date.now() - startTime);
  }

  /**
   * Run a single validator
   */
  async runValidator(validatorInfo, filePath, content) {
    const startTime = Date.now();

    try {
      const instance = this.getInstance(validatorInfo);
      const result = await instance.validate(filePath, { content });

      return {
        validator: validatorInfo.name,
        success: true,
        duration: Date.now() - startTime,
        result: {
          passed: result.passed !== false && result.success !== false,
          errors: result.errors || [],
          warnings: result.warnings || [],
          fixed: result.fixed || false,
          ...result
        }
      };
    } catch (error) {
      return {
        validator: validatorInfo.name,
        success: false,
        duration: Date.now() - startTime,
        error: error.message,
        result: {
          passed: false,
          errors: [error.message],
          warnings: [],
          fixed: false
        }
      };
    }
  }

  /**
   * Aggregate results from multiple validators
   */
  aggregateResults(results, totalDuration) {
    const summary = {
      passed: 0,
      failed: 0,
      warnings: 0,
      fixed: 0,
      errors: [],
      allWarnings: [],
      totalDuration,
      validators: results.length,
      results: results
    };

    for (const result of results) {
      if (result.success && result.result.passed) {
        summary.passed++;
        if (result.result.fixed) {
          summary.fixed++;
        }
      } else {
        summary.failed++;
      }

      if (result.result.errors) {
        summary.errors.push(...result.result.errors.map(e =>
          typeof e === 'string' ? { validator: result.validator, message: e } : { ...e, validator: result.validator }
        ));
      }

      if (result.result.warnings) {
        summary.warnings += result.result.warnings.length;
        summary.allWarnings.push(...result.result.warnings.map(w =>
          typeof w === 'string' ? { validator: result.validator, message: w } : { ...w, validator: result.validator }
        ));
      }
    }

    summary.success = summary.failed === 0;
    return summary;
  }

  /**
   * Auto-discover validators from validators directory
   */
  discoverValidators() {
    if (!fs.existsSync(this.validatorsDir)) {
      return;
    }

    const files = fs.readdirSync(this.validatorsDir)
      .filter(f => f.endsWith('.js') && !f.startsWith('.'));

    for (const file of files) {
      const name = file.replace('.js', '');

      // Skip if already registered
      if (this.validators.has(name)) {
        continue;
      }

      try {
        const validatorPath = path.join(this.validatorsDir, file);
        const ValidatorExport = require(validatorPath);

        // Determine validator type and options
        const options = {
          priority: this.getDefaultPriority(name),
          filePatterns: this.getDefaultPatterns(name),
          description: `Auto-discovered validator: ${name}`,
        };

        this.register(name, ValidatorExport, options);
      } catch (error) {
        console.warn(`Warning: Could not load validator ${file}: ${error.message}`);
      }
    }
  }

  /**
   * Get default priority for known validators
   */
  getDefaultPriority(name) {
    const priorities = {
      'syntax_check': 1,
      'formatting': 2,
      'linting': 3,
      'imports_organization': 4,
      'type_checking': 5,
      'security_scan': 6,
      'test_generator': 7,
      'test_standards': 8,
    };
    return priorities[name] ?? 10;
  }

  /**
   * Get default file patterns for known validators
   */
  getDefaultPatterns(name) {
    const patterns = {
      'test_standards': [
        '*.test.ts', '*.test.tsx', '*.test.js', '*.test.jsx',
        '*.spec.ts', '*.spec.tsx', '*.spec.js', '*.spec.jsx',
        '*.integration.ts', 'test_*.py', '*_test.py', '*_spec.rb'
      ],
      'security_scan': ['*.js', '*.ts', '*.py', '*.rb', '*.json', '*.yml', '*.yaml'],
      'formatting': ['*'],
      'linting': ['*.js', '*.ts', '*.jsx', '*.tsx', '*.py', '*.rb'],
      'syntax_check': ['*'],
    };
    return patterns[name] ?? ['*'];
  }

  /**
   * List all registered validators
   */
  list() {
    return Array.from(this.validators.values()).map(v => ({
      name: v.name,
      enabled: v.enabled,
      priority: v.priority,
      filePatterns: v.filePatterns,
      description: v.description
    }));
  }

  /**
   * Get registry statistics
   */
  stats() {
    const all = Array.from(this.validators.values());
    return {
      total: all.length,
      enabled: all.filter(v => v.enabled).length,
      disabled: all.filter(v => !v.enabled).length,
      validators: all.map(v => v.name)
    };
  }
}

module.exports = { ValidatorRegistry };
