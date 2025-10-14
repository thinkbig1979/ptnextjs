const fs = require('fs');
const path = require('path');

class TestGeneratorValidator {
  constructor() {
    this.functionRegex = /(?:export\s+)?(?:async\s+)?function\s+(\w+)\s*\(/g;
    this.arrowFunctionRegex = /(?:export\s+)?(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s*)?\([^)]*\)\s*=>/g;
    this.classRegex = /(?:export\s+)?class\s+(\w+)/g;
  }

  /**
   * Extract function names from source code
   */
  extractFunctions(sourceCode) {
    const functions = [];
    let match;

    // Extract regular function declarations
    while ((match = this.functionRegex.exec(sourceCode)) !== null) {
      functions.push({
        name: match[1],
        type: 'function'
      });
    }

    // Extract arrow functions
    this.arrowFunctionRegex.lastIndex = 0;
    while ((match = this.arrowFunctionRegex.exec(sourceCode)) !== null) {
      functions.push({
        name: match[1],
        type: 'arrow'
      });
    }

    return functions;
  }

  /**
   * Extract class names from source code
   */
  extractClasses(sourceCode) {
    const classes = [];
    let match;

    this.classRegex.lastIndex = 0;
    while ((match = this.classRegex.exec(sourceCode)) !== null) {
      classes.push({
        name: match[1],
        type: 'class'
      });
    }

    return classes;
  }

  /**
   * Calculate relative import path from test file to source file
   */
  getRelativeImportPath(testFilePath, sourceFilePath) {
    const testDir = path.dirname(testFilePath);
    const relativePath = path.relative(testDir, sourceFilePath);

    // Normalize path separators and remove file extension
    let importPath = relativePath.replace(/\\/g, '/');
    importPath = importPath.replace(/\.(js|ts|jsx|tsx)$/, '');

    // Ensure path starts with ./ or ../
    if (!importPath.startsWith('.')) {
      importPath = './' + importPath;
    }

    return importPath;
  }

  /**
   * Generate test file content
   */
  generateTestContent(sourceFilePath, testFilePath, functions, classes) {
    const importPath = this.getRelativeImportPath(testFilePath, sourceFilePath);
    const sourceFileName = path.basename(sourceFilePath, path.extname(sourceFilePath));

    let content = `import { describe, it, expect } from 'vitest';\n`;

    // Generate imports for functions
    if (functions.length > 0) {
      const functionNames = functions.map(f => f.name).join(', ');
      content += `import { ${functionNames} } from '${importPath}';\n`;
    }

    // Generate imports for classes
    if (classes.length > 0) {
      const classNames = classes.map(c => c.name).join(', ');
      content += `import { ${classNames} } from '${importPath}';\n`;
    }

    content += `\n`;

    // Generate test suites for functions
    functions.forEach(func => {
      content += `describe('${func.name}', () => {\n`;
      content += `  it('should exist', () => {\n`;
      content += `    expect(${func.name}).toBeDefined();\n`;
      content += `    expect(typeof ${func.name}).toBe('function');\n`;
      content += `  });\n\n`;

      content += `  it('should work correctly', () => {\n`;
      content += `    // TODO: Add test implementation\n`;
      content += `    expect(true).toBe(true);\n`;
      content += `  });\n\n`;

      content += `  it('should handle edge cases', () => {\n`;
      content += `    // TODO: Add edge case tests\n`;
      content += `    expect(true).toBe(true);\n`;
      content += `  });\n`;
      content += `});\n\n`;
    });

    // Generate test suites for classes
    classes.forEach(cls => {
      content += `describe('${cls.name}', () => {\n`;
      content += `  it('should exist', () => {\n`;
      content += `    expect(${cls.name}).toBeDefined();\n`;
      content += `    expect(typeof ${cls.name}).toBe('function');\n`;
      content += `  });\n\n`;

      content += `  it('should work correctly', () => {\n`;
      content += `    // TODO: Add test implementation\n`;
      content += `    const instance = new ${cls.name}();\n`;
      content += `    expect(instance).toBeInstanceOf(${cls.name});\n`;
      content += `  });\n\n`;

      content += `  it('should handle edge cases', () => {\n`;
      content += `    // TODO: Add edge case tests\n`;
      content += `    expect(true).toBe(true);\n`;
      content += `  });\n`;
      content += `});\n\n`;
    });

    return content.trim() + '\n';
  }

  /**
   * Determine test file path based on source file location
   */
  getTestFilePath(sourceFilePath, useTestsDir = true) {
    const dir = path.dirname(sourceFilePath);
    const ext = path.extname(sourceFilePath);
    const baseName = path.basename(sourceFilePath, ext);

    if (useTestsDir) {
      // Use __tests__ directory
      const testsDir = path.join(dir, '__tests__');
      return path.join(testsDir, `${baseName}.test${ext}`);
    } else {
      // Co-locate test file
      return path.join(dir, `${baseName}.test${ext}`);
    }
  }

  /**
   * Validate and generate test file
   */
  validate(sourceFilePath, options = {}) {
    try {
      const {
        useTestsDir = true,
        customTestPath = null
      } = options;

      // Check if source file exists
      if (!fs.existsSync(sourceFilePath)) {
        return {
          success: false,
          error: `Source file not found: ${sourceFilePath}`
        };
      }

      // Read source file
      const sourceCode = fs.readFileSync(sourceFilePath, 'utf8');

      // Extract functions and classes
      const functions = this.extractFunctions(sourceCode);
      const classes = this.extractClasses(sourceCode);

      // Check if there's anything to test
      if (functions.length === 0 && classes.length === 0) {
        return {
          success: false,
          error: 'No functions or classes found to generate tests for'
        };
      }

      // Determine test file path
      const testFilePath = customTestPath || this.getTestFilePath(sourceFilePath, useTestsDir);

      // Generate test content
      const content = this.generateTestContent(sourceFilePath, testFilePath, functions, classes);

      return {
        success: true,
        content: content,
        testFilePath: testFilePath,
        functions: functions,
        classes: classes
      };

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Generate and write test file
   */
  generateTestFile(sourceFilePath, options = {}) {
    const result = this.validate(sourceFilePath, options);

    if (!result.success) {
      return result;
    }

    try {
      const { testFilePath, content } = result;

      // Create directory if it doesn't exist
      const testDir = path.dirname(testFilePath);
      if (!fs.existsSync(testDir)) {
        fs.mkdirSync(testDir, { recursive: true });
      }

      // Write test file
      fs.writeFileSync(testFilePath, content, 'utf8');

      return {
        ...result,
        message: `Test file generated successfully: ${testFilePath}`
      };

    } catch (error) {
      return {
        success: false,
        error: `Failed to write test file: ${error.message}`
      };
    }
  }
}

module.exports = new TestGeneratorValidator();
