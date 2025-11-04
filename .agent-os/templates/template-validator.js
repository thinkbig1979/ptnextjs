#!/usr/bin/env node

/**
 * Template Validation System for Agent OS
 * Validates template completeness and variable substitution
 * Version: 2.0.0
 */

const fs = require('fs');
const path = require('path');

class TemplateValidator {
  constructor() {
    this.templateDir = path.join(__dirname, 'spec-templates');
    this.validationResults = {
      totalTemplates: 0,
      validTemplates: 0,
      errors: [],
      warnings: [],
      variables: new Set()
    };
  }

  /**
   * Validate all templates in the spec-templates directory
   */
  async validateAll() {
    console.log('🔍 Starting template validation...\n');

    try {
      const templateFiles = this.getTemplateFiles();
      this.validationResults.totalTemplates = templateFiles.length;

      for (const templateFile of templateFiles) {
        await this.validateTemplate(templateFile);
      }

      this.generateReport();
      return this.validationResults.errors.length === 0;
    } catch (error) {
      console.error('❌ Validation failed:', error.message);
      return false;
    }
  }

  /**
   * Get all template files from the spec-templates directory
   */
  getTemplateFiles() {
    if (!fs.existsSync(this.templateDir)) {
      throw new Error(`Template directory not found: ${this.templateDir}`);
    }

    return fs.readdirSync(this.templateDir)
      .filter(file => file.endsWith('.md'))
      .map(file => path.join(this.templateDir, file));
  }

  /**
   * Validate a single template file
   */
  async validateTemplate(templatePath) {
    const fileName = path.basename(templatePath);
    console.log(`📋 Validating: ${fileName}`);

    try {
      const content = fs.readFileSync(templatePath, 'utf8');
      const validation = this.performValidationChecks(content, fileName);

      if (validation.isValid) {
        this.validationResults.validTemplates++;
        console.log(`  ✅ ${fileName} - Valid`);
      } else {
        console.log(`  ❌ ${fileName} - Invalid`);
      }

      // Collect all variables for cross-template analysis
      validation.variables.forEach(variable => {
        this.validationResults.variables.add(variable);
      });

    } catch (error) {
      this.addError(fileName, `Failed to read template: ${error.message}`);
    }
  }

  /**
   * Perform comprehensive validation checks on template content
   */
  performValidationChecks(content, fileName) {
    const result = {
      isValid: true,
      variables: new Set(),
      errors: [],
      warnings: []
    };

    // 1. Check for required sections
    this.validateRequiredSections(content, fileName, result);

    // 2. Extract and validate variables
    this.validateVariables(content, fileName, result);

    // 3. Check markdown structure
    this.validateMarkdownStructure(content, fileName, result);

    // 4. Validate template-specific requirements
    this.validateTemplateSpecificRequirements(content, fileName, result);

    // 5. Check for completeness indicators
    this.validateCompleteness(content, fileName, result);

    result.isValid = result.errors.length === 0;
    return result;
  }

  /**
   * Validate required sections based on template type
   */
  validateRequiredSections(content, fileName, result) {
    const requiredSections = this.getRequiredSections(fileName);

    for (const section of requiredSections) {
      const sectionRegex = new RegExp(`^#{1,6}\\s*${section}`, 'mi');
      if (!sectionRegex.test(content)) {
        this.addError(fileName, `Missing required section: ${section}`, result);
      }
    }
  }

  /**
   * Get required sections based on template type
   */
  getRequiredSections(fileName) {
    const commonSections = ['Context', 'Overview'];

    const templateSections = {
      'implementation-guide-template.md': [
        ...commonSections,
        'Technical Foundation',
        'Implementation Strategy',
        'Development Guidelines',
        'Quality Gates'
      ],
      'testing-strategy-template.md': [
        ...commonSections,
        'Testing Philosophy',
        'Test Architecture',
        'Unit Testing Strategy',
        'Quality Assurance Automation'
      ],
      'integration-requirements-template.md': [
        ...commonSections,
        'Integration Architecture',
        'External Service Integration',
        'Data Integration',
        'Security Integration'
      ],
      'quality-gates-template.md': [
        ...commonSections,
        'Quality Framework',
        'Pre-Development Quality Gates',
        'Development Quality Gates',
        'Quality Metrics & KPIs'
      ],
      'architecture-decisions-template.md': [
        ...commonSections,
        'Architecture Decision Records',
        'Technical Architecture',
        'Technology Decisions',
        'Risk Assessment'
      ]
    };

    return templateSections[fileName] || commonSections;
  }

  /**
   * Validate template variables
   */
  validateVariables(content, fileName, result) {
    // Extract all variables in [VARIABLE_NAME] format
    const variableRegex = /\[([A-Z_][A-Z0-9_]*)\]/g;
    const variables = [];
    let match;

    while ((match = variableRegex.exec(content)) !== null) {
      variables.push(match[1]);
      result.variables.add(match[1]);
    }

    // Check for consistent variable naming
    for (const variable of variables) {
      if (!/^[A-Z_][A-Z0-9_]*$/.test(variable)) {
        this.addError(fileName, `Invalid variable format: [${variable}]. Use UPPER_SNAKE_CASE.`, result);
      }
    }

    // Check for orphaned brackets
    const orphanedBrackets = content.match(/\[[^\]]*$|^[^\[]*\]/gm);
    if (orphanedBrackets) {
      this.addWarning(fileName, `Potential orphaned brackets found: ${orphanedBrackets.join(', ')}`, result);
    }

    // Validate variable context usage
    this.validateVariableContext(content, fileName, result);
  }

  /**
   * Validate variable usage context
   */
  validateVariableContext(content, fileName, result) {
    // Check for common variable patterns that should be consistent
    const commonVariables = [
      'FEATURE_NAME',
      'FEATURE_DESCRIPTION',
      'CURRENT_DATE',
      'PROJECT_ROOT',
      'API_ENDPOINT',
      'DATABASE_URL'
    ];

    for (const commonVar of commonVariables) {
      const regex = new RegExp(`\\[${commonVar}\\]`, 'g');
      const matches = content.match(regex);
      if (matches && matches.length > 1) {
        // Good - consistent usage
      } else if (matches && matches.length === 1) {
        this.addWarning(fileName, `Variable [${commonVar}] used only once - consider if it's necessary`, result);
      }
    }
  }

  /**
   * Validate markdown structure
   */
  validateMarkdownStructure(content, fileName, result) {
    const lines = content.split('\n');

    // Check for proper heading hierarchy
    let lastHeadingLevel = 0;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const headingMatch = line.match(/^(#{1,6})\s+(.+)/);

      if (headingMatch) {
        const currentLevel = headingMatch[1].length;
        const headingText = headingMatch[2];

        // Check for skipped heading levels
        if (currentLevel > lastHeadingLevel + 1) {
          this.addWarning(fileName, `Line ${i + 1}: Skipped heading level (${lastHeadingLevel} to ${currentLevel})`, result);
        }

        // Check for empty headings
        if (!headingText.trim()) {
          this.addError(fileName, `Line ${i + 1}: Empty heading`, result);
        }

        lastHeadingLevel = currentLevel;
      }
    }

    // Check for code block balance
    this.validateCodeBlocks(content, fileName, result);

    // Check for table structure
    this.validateTables(content, fileName, result);
  }

  /**
   * Validate code blocks
   */
  validateCodeBlocks(content, fileName, result) {
    const codeBlockRegex = /```/g;
    const matches = content.match(codeBlockRegex);

    if (matches && matches.length % 2 !== 0) {
      this.addError(fileName, 'Unbalanced code blocks - missing closing ```', result);
    }

    // Check for language specification
    const codeBlockStartRegex = /```(\w*)/g;
    let match;
    while ((match = codeBlockStartRegex.exec(content)) !== null) {
      if (!match[1]) {
        this.addWarning(fileName, 'Code block without language specification', result);
      }
    }
  }

  /**
   * Validate table structure
   */
  validateTables(content, fileName, result) {
    const lines = content.split('\n');
    let inTable = false;
    let tableColumnCount = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      if (line.includes('|') && !line.startsWith('```')) {
        if (!inTable) {
          inTable = true;
          tableColumnCount = line.split('|').length - 2; // Subtract start/end empty strings
        } else {
          const currentColumnCount = line.split('|').length - 2;
          if (currentColumnCount !== tableColumnCount && !line.match(/^[\|\s\-:]+$/)) {
            this.addWarning(fileName, `Line ${i + 1}: Table column count mismatch`, result);
          }
        }
      } else if (inTable && line === '') {
        inTable = false;
        tableColumnCount = 0;
      }
    }
  }

  /**
   * Validate template-specific requirements
   */
  validateTemplateSpecificRequirements(content, fileName, result) {
    switch (fileName) {
      case 'implementation-guide-template.md':
        this.validateImplementationGuide(content, fileName, result);
        break;
      case 'testing-strategy-template.md':
        this.validateTestingStrategy(content, fileName, result);
        break;
      case 'integration-requirements-template.md':
        this.validateIntegrationRequirements(content, fileName, result);
        break;
      case 'quality-gates-template.md':
        this.validateQualityGates(content, fileName, result);
        break;
      case 'architecture-decisions-template.md':
        this.validateArchitectureDecisions(content, fileName, result);
        break;
    }
  }

  /**
   * Validate implementation guide specific requirements
   */
  validateImplementationGuide(content, fileName, result) {
    const requiredPatterns = [
      /Phase \d+:/,  // Implementation phases
      /```typescript/,  // Code examples
      /\[.*\]:\s*\[.*\]/,  // Links or references
    ];

    for (const pattern of requiredPatterns) {
      if (!pattern.test(content)) {
        this.addWarning(fileName, `Missing expected pattern: ${pattern.source}`, result);
      }
    }
  }

  /**
   * Validate testing strategy specific requirements
   */
  validateTestingStrategy(content, fileName, result) {
    const requiredConcepts = [
      'unit test',
      'integration test',
      'e2e test',
      'coverage',
      'test framework'
    ];

    for (const concept of requiredConcepts) {
      if (!content.toLowerCase().includes(concept)) {
        this.addWarning(fileName, `Missing testing concept: ${concept}`, result);
      }
    }
  }

  /**
   * Validate integration requirements specific requirements
   */
  validateIntegrationRequirements(content, fileName, result) {
    const requiredIntegrationAspects = [
      'API',
      'database',
      'authentication',
      'external service'
    ];

    for (const aspect of requiredIntegrationAspects) {
      if (!content.toLowerCase().includes(aspect)) {
        this.addWarning(fileName, `Missing integration aspect: ${aspect}`, result);
      }
    }
  }

  /**
   * Validate quality gates specific requirements
   */
  validateQualityGates(content, fileName, result) {
    const requiredGates = [
      'quality gate',
      'criteria',
      'threshold',
      'validation'
    ];

    for (const gate of requiredGates) {
      if (!content.toLowerCase().includes(gate)) {
        this.addWarning(fileName, `Missing quality concept: ${gate}`, result);
      }
    }
  }

  /**
   * Validate architecture decisions specific requirements
   */
  validateArchitectureDecisions(content, fileName, result) {
    // Check for ADR format
    if (!content.includes('ADR-')) {
      this.addError(fileName, 'Missing ADR (Architecture Decision Record) format', result);
    }

    // Check for decision status
    const statusPattern = /Status.*\*\*(Proposed|Accepted|Deprecated|Superseded)\*\*/;
    if (!statusPattern.test(content)) {
      this.addWarning(fileName, 'Missing or invalid decision status format', result);
    }
  }

  /**
   * Validate template completeness
   */
  validateCompleteness(content, fileName, result) {
    // Check for placeholder content
    const placeholders = [
      'TODO',
      'TBD',
      'PLACEHOLDER',
      '[Replace this]',
      '[Fill in]'
    ];

    for (const placeholder of placeholders) {
      if (content.includes(placeholder)) {
        this.addWarning(fileName, `Contains placeholder content: ${placeholder}`, result);
      }
    }

    // Check minimum content length
    const minLength = 5000; // Minimum character count for comprehensive templates
    if (content.length < minLength) {
      this.addWarning(fileName, `Template may be incomplete - length: ${content.length} chars (min: ${minLength})`, result);
    }

    // Check for template version and metadata
    if (!content.includes('Template Version')) {
      this.addError(fileName, 'Missing template version information', result);
    }
  }

  /**
   * Add an error to the validation results
   */
  addError(fileName, message, result = null) {
    const error = `${fileName}: ${message}`;
    this.validationResults.errors.push(error);
    if (result) result.errors.push(error);
  }

  /**
   * Add a warning to the validation results
   */
  addWarning(fileName, message, result = null) {
    const warning = `${fileName}: ${message}`;
    this.validationResults.warnings.push(warning);
    if (result) result.warnings.push(warning);
  }

  /**
   * Generate validation report
   */
  generateReport() {
    console.log('\n📊 Validation Report');
    console.log('='.repeat(50));
    console.log(`Total Templates: ${this.validationResults.totalTemplates}`);
    console.log(`Valid Templates: ${this.validationResults.validTemplates}`);
    console.log(`Invalid Templates: ${this.validationResults.totalTemplates - this.validationResults.validTemplates}`);
    console.log(`Total Variables Found: ${this.validationResults.variables.size}`);

    if (this.validationResults.errors.length > 0) {
      console.log('\n❌ Errors:');
      this.validationResults.errors.forEach(error => {
        console.log(`  • ${error}`);
      });
    }

    if (this.validationResults.warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      this.validationResults.warnings.forEach(warning => {
        console.log(`  • ${warning}`);
      });
    }

    if (this.validationResults.errors.length === 0) {
      console.log('\n✅ All templates validated successfully!');
    }

    // Generate variable usage report
    this.generateVariableReport();
  }

  /**
   * Generate variable usage report
   */
  generateVariableReport() {
    console.log('\n📝 Variable Usage Report');
    console.log('-'.repeat(30));

    const sortedVariables = Array.from(this.validationResults.variables).sort();
    const commonVariables = sortedVariables.filter(v =>
      ['FEATURE_NAME', 'FEATURE_DESCRIPTION', 'CURRENT_DATE'].includes(v)
    );
    const specificVariables = sortedVariables.filter(v =>
      !['FEATURE_NAME', 'FEATURE_DESCRIPTION', 'CURRENT_DATE'].includes(v)
    );

    console.log(`Common Variables (${commonVariables.length}):`);
    commonVariables.forEach(variable => {
      console.log(`  • [${variable}]`);
    });

    console.log(`\nTemplate-Specific Variables (${specificVariables.length}):`);
    specificVariables.slice(0, 20).forEach(variable => {
      console.log(`  • [${variable}]`);
    });

    if (specificVariables.length > 20) {
      console.log(`  ... and ${specificVariables.length - 20} more`);
    }
  }

  /**
   * Validate template variable substitution
   */
  validateVariableSubstitution(templateContent, variableMap) {
    let processedContent = templateContent;
    const missingVariables = [];

    // Extract all variables from template
    const variableRegex = /\[([A-Z_][A-Z0-9_]*)\]/g;
    let match;

    while ((match = variableRegex.exec(templateContent)) !== null) {
      const variableName = match[1];

      if (variableMap.hasOwnProperty(variableName)) {
        const value = variableMap[variableName];
        processedContent = processedContent.replace(
          new RegExp(`\\[${variableName}\\]`, 'g'),
          value
        );
      } else {
        missingVariables.push(variableName);
      }
    }

    return {
      processedContent,
      missingVariables,
      isComplete: missingVariables.length === 0
    };
  }
}

// CLI interface
if (require.main === module) {
  const validator = new TemplateValidator();

  validator.validateAll().then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = TemplateValidator;