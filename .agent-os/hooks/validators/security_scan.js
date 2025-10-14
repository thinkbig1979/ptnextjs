class SecurityScanValidator {
  constructor() {
    this.name = 'SecurityScanValidator';

    // Security patterns to detect
    this.patterns = {
      secrets: [
        { regex: /(?:password|passwd|pwd)\s*[=:]\s*['"][^'"]+['"]/gi, type: 'hardcoded_password' },
        { regex: /(?:api[_-]?key|apikey)\s*[=:]\s*['"][^'"]+['"]/gi, type: 'hardcoded_api_key' },
        { regex: /(?:secret|token|auth[_-]?token)\s*[=:]\s*['"][^'"]+['"]/gi, type: 'hardcoded_secret' },
        { regex: /(?:private[_-]?key|privatekey)\s*[=:]\s*['"][^'"]+['"]/gi, type: 'hardcoded_private_key' },
        { regex: /(?:access[_-]?token|accesstoken)\s*[=:]\s*['"][^'"]+['"]/gi, type: 'hardcoded_access_token' },
      ],
      sqlInjection: [
        { regex: /(?:execute|query|sql)\s*\([^)]*\+[^)]*\)/gi, type: 'string_concatenation_query' },
        { regex: /(?:execute|query|sql)\s*\([^)]*`.*?\$\{.*?}.*?`[^)]*\)/gi, type: 'template_literal_query' },
        { regex: /(?:SELECT|INSERT|UPDATE|DELETE|DROP|CREATE).*?\+.*?(?:WHERE|VALUES|SET)/gi, type: 'sql_string_concat' },
      ],
      xss: [
        { regex: /\.innerHTML\s*=/gi, type: 'innerHTML_assignment' },
        { regex: /dangerouslySetInnerHTML/gi, type: 'dangerous_set_inner_html' },
        { regex: /document\.write\s*\(/gi, type: 'document_write' },
        { regex: /\.outerHTML\s*=/gi, type: 'outerHTML_assignment' },
        { regex: /\.insertAdjacentHTML\s*\(/gi, type: 'insert_adjacent_html' },
      ],
      insecureRandom: [
        { regex: /Math\.random\(\).*(?:token|secret|key|id|session|nonce|salt)/gi, type: 'math_random_security' },
        { regex: /(?:token|secret|key|id|session|nonce|salt).*Math\.random\(\)/gi, type: 'math_random_security' },
      ],
      dangerousEval: [
        { regex: /\beval\s*\(/gi, type: 'eval_usage' },
        { regex: /new\s+Function\s*\(/gi, type: 'function_constructor' },
        { regex: /setTimeout\s*\(\s*['"`]/gi, type: 'setTimeout_string' },
        { regex: /setInterval\s*\(\s*['"`]/gi, type: 'setInterval_string' },
      ],
    };

    // Issue descriptions and remediation advice
    this.issueInfo = {
      hardcoded_password: {
        severity: 'critical',
        message: 'Hardcoded password detected',
        remediation: 'Use environment variables (process.env) to store passwords. Never commit credentials to version control.',
      },
      hardcoded_api_key: {
        severity: 'critical',
        message: 'Hardcoded API key detected',
        remediation: 'Store API keys in environment variables or secure secret management systems (e.g., AWS Secrets Manager, HashiCorp Vault).',
      },
      hardcoded_secret: {
        severity: 'critical',
        message: 'Hardcoded secret or token detected',
        remediation: 'Move secrets to environment variables or a secure secret management solution. Rotate any exposed secrets immediately.',
      },
      hardcoded_private_key: {
        severity: 'critical',
        message: 'Hardcoded private key detected',
        remediation: 'Store private keys securely using secret management systems. Never hardcode cryptographic keys in source code.',
      },
      hardcoded_access_token: {
        severity: 'critical',
        message: 'Hardcoded access token detected',
        remediation: 'Use environment variables or secure token storage. Implement token rotation and never commit tokens to repositories.',
      },
      string_concatenation_query: {
        severity: 'critical',
        message: 'Potential SQL injection via string concatenation',
        remediation: 'Use parameterized queries or prepared statements. Never concatenate user input directly into SQL queries.',
      },
      template_literal_query: {
        severity: 'critical',
        message: 'Potential SQL injection via template literals',
        remediation: 'Use parameterized queries with placeholders (e.g., $1, $2) instead of template literals for SQL queries.',
      },
      sql_string_concat: {
        severity: 'critical',
        message: 'SQL query built with string concatenation',
        remediation: 'Refactor to use ORM methods or parameterized queries to prevent SQL injection attacks.',
      },
      innerHTML_assignment: {
        severity: 'warning',
        message: 'innerHTML assignment detected - potential XSS vulnerability',
        remediation: 'Use textContent for plain text or createElement/sanitization libraries (DOMPurify) for HTML. Ensure all user input is properly escaped.',
      },
      dangerous_set_inner_html: {
        severity: 'warning',
        message: 'dangerouslySetInnerHTML usage detected',
        remediation: 'Only use with properly sanitized content (e.g., DOMPurify). Prefer safe React rendering methods when possible.',
      },
      document_write: {
        severity: 'warning',
        message: 'document.write usage detected - potential XSS vulnerability',
        remediation: 'Use modern DOM manipulation methods (createElement, appendChild) instead of document.write.',
      },
      outerHTML_assignment: {
        severity: 'warning',
        message: 'outerHTML assignment detected - potential XSS vulnerability',
        remediation: 'Use safer DOM manipulation methods and sanitize any user-provided content before rendering.',
      },
      insert_adjacent_html: {
        severity: 'warning',
        message: 'insertAdjacentHTML usage detected - potential XSS vulnerability',
        remediation: 'Sanitize all input using DOMPurify or similar libraries before using insertAdjacentHTML.',
      },
      math_random_security: {
        severity: 'critical',
        message: 'Math.random() used in security context - cryptographically insecure',
        remediation: 'Use crypto.randomBytes() (Node.js) or crypto.getRandomValues() (browser) for security-sensitive random values.',
      },
      eval_usage: {
        severity: 'critical',
        message: 'eval() usage detected - severe security risk',
        remediation: 'Remove eval() and refactor code. Use JSON.parse() for JSON, or find alternative approaches that don\'t execute arbitrary code.',
      },
      function_constructor: {
        severity: 'critical',
        message: 'Function constructor usage detected - similar risks to eval()',
        remediation: 'Refactor to avoid dynamic code execution. Use safer alternatives like object literals or predefined function maps.',
      },
      setTimeout_string: {
        severity: 'warning',
        message: 'setTimeout with string argument - potential security risk',
        remediation: 'Pass a function reference to setTimeout instead of a string to avoid code injection risks.',
      },
      setInterval_string: {
        severity: 'warning',
        message: 'setInterval with string argument - potential security risk',
        remediation: 'Pass a function reference to setInterval instead of a string to avoid code injection risks.',
      },
    };
  }

  validate(content, filePath) {
    const warnings = [];
    const errors = [];

    // Skip validation for certain file types
    if (this._shouldSkipFile(filePath)) {
      return { passed: true, warnings: [], errors: [] };
    }

    // Check each category of security issues
    this._checkSecrets(content, filePath, warnings, errors);
    this._checkSqlInjection(content, filePath, warnings, errors);
    this._checkXss(content, filePath, warnings, errors);
    this._checkInsecureRandom(content, filePath, warnings, errors);
    this._checkDangerousEval(content, filePath, warnings, errors);

    const passed = errors.length === 0;

    return {
      passed,
      warnings,
      errors,
    };
  }

  _shouldSkipFile(filePath) {
    const skipPatterns = [
      /\.md$/i,
      /\.json$/i,
      /\.yml$/i,
      /\.yaml$/i,
      /\.txt$/i,
      /package-lock\.json$/i,
      /yarn\.lock$/i,
      /pnpm-lock\.yaml$/i,
    ];

    return skipPatterns.some(pattern => pattern.test(filePath));
  }

  _checkSecrets(content, filePath, warnings, errors) {
    for (const pattern of this.patterns.secrets) {
      const matches = this._findMatches(content, pattern.regex);

      for (const match of matches) {
        const info = this.issueInfo[pattern.type];
        const issue = {
          file: filePath,
          line: match.line,
          column: match.column,
          code: match.text,
          message: info.message,
          remediation: info.remediation,
          type: pattern.type,
        };

        if (info.severity === 'critical') {
          errors.push(issue);
        } else {
          warnings.push(issue);
        }
      }
    }
  }

  _checkSqlInjection(content, filePath, warnings, errors) {
    for (const pattern of this.patterns.sqlInjection) {
      const matches = this._findMatches(content, pattern.regex);

      for (const match of matches) {
        const info = this.issueInfo[pattern.type];
        const issue = {
          file: filePath,
          line: match.line,
          column: match.column,
          code: match.text,
          message: info.message,
          remediation: info.remediation,
          type: pattern.type,
        };

        if (info.severity === 'critical') {
          errors.push(issue);
        } else {
          warnings.push(issue);
        }
      }
    }
  }

  _checkXss(content, filePath, warnings, errors) {
    for (const pattern of this.patterns.xss) {
      const matches = this._findMatches(content, pattern.regex);

      for (const match of matches) {
        const info = this.issueInfo[pattern.type];
        const issue = {
          file: filePath,
          line: match.line,
          column: match.column,
          code: match.text,
          message: info.message,
          remediation: info.remediation,
          type: pattern.type,
        };

        if (info.severity === 'critical') {
          errors.push(issue);
        } else {
          warnings.push(issue);
        }
      }
    }
  }

  _checkInsecureRandom(content, filePath, warnings, errors) {
    for (const pattern of this.patterns.insecureRandom) {
      const matches = this._findMatches(content, pattern.regex);

      for (const match of matches) {
        const info = this.issueInfo[pattern.type];
        const issue = {
          file: filePath,
          line: match.line,
          column: match.column,
          code: match.text,
          message: info.message,
          remediation: info.remediation,
          type: pattern.type,
        };

        if (info.severity === 'critical') {
          errors.push(issue);
        } else {
          warnings.push(issue);
        }
      }
    }
  }

  _checkDangerousEval(content, filePath, warnings, errors) {
    for (const pattern of this.patterns.dangerousEval) {
      const matches = this._findMatches(content, pattern.regex);

      for (const match of matches) {
        const info = this.issueInfo[pattern.type];
        const issue = {
          file: filePath,
          line: match.line,
          column: match.column,
          code: match.text,
          message: info.message,
          remediation: info.remediation,
          type: pattern.type,
        };

        if (info.severity === 'critical') {
          errors.push(issue);
        } else {
          warnings.push(issue);
        }
      }
    }
  }

  _findMatches(content, regex) {
    const matches = [];
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      let match;
      // Reset regex lastIndex for global patterns
      regex.lastIndex = 0;

      while ((match = regex.exec(line)) !== null) {
        matches.push({
          line: index + 1,
          column: match.index + 1,
          text: match[0].trim(),
        });

        // Prevent infinite loops on zero-width matches
        if (match.index === regex.lastIndex) {
          regex.lastIndex++;
        }
      }
    });

    return matches;
  }
}

module.exports = new SecurityScanValidator();
