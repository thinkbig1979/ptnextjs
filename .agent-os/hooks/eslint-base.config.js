/**
 * Agent OS ESLint Base Configuration
 *
 * Provides strict TypeScript/JavaScript quality rules that all projects should follow.
 * Projects can extend this config or the linting validator will use it as a fallback.
 *
 * Usage in project:
 *   // eslint.config.js
 *   import agentOsBase from '~/.agent-os/hooks/eslint-base.config.js';
 *   export default [...agentOsBase, { /* project overrides */ }];
 *
 * Or in .eslintrc.json:
 *   { "extends": ["~/.agent-os/hooks/eslint-base.config.js"] }
 *
 * Version: 1.0.0
 */

module.exports = {
  // Parser for TypeScript
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  },

  // Plugins
  plugins: [
    '@typescript-eslint'
  ],

  // Environments
  env: {
    browser: true,
    node: true,
    es2022: true
  },

  // Rules - Strict quality enforcement
  rules: {
    // ===========================================
    // CRITICAL: Type Safety (These MUST be errors)
    // ===========================================

    // NO EXPLICIT ANY - This is why this config exists
    '@typescript-eslint/no-explicit-any': 'error',

    // Prevent unsafe any usage patterns
    '@typescript-eslint/no-unsafe-assignment': 'warn',
    '@typescript-eslint/no-unsafe-member-access': 'warn',
    '@typescript-eslint/no-unsafe-call': 'warn',
    '@typescript-eslint/no-unsafe-return': 'warn',
    '@typescript-eslint/no-unsafe-argument': 'warn',

    // ===========================================
    // TypeScript Best Practices
    // ===========================================

    // Enforce consistent type imports
    '@typescript-eslint/consistent-type-imports': ['warn', {
      prefer: 'type-imports',
      disallowTypeAnnotations: false
    }],

    // Prefer nullish coalescing
    '@typescript-eslint/prefer-nullish-coalescing': 'warn',

    // Prefer optional chaining
    '@typescript-eslint/prefer-optional-chain': 'warn',

    // No unused variables (TypeScript version)
    '@typescript-eslint/no-unused-vars': ['warn', {
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_',
      caughtErrorsIgnorePattern: '^_'
    }],

    // No floating promises (must be awaited or voided)
    '@typescript-eslint/no-floating-promises': 'warn',

    // No misused promises
    '@typescript-eslint/no-misused-promises': 'warn',

    // ===========================================
    // General JavaScript Quality
    // ===========================================

    // Enforce const where possible
    'prefer-const': 'warn',

    // No console in production code (warn, not error)
    'no-console': 'warn',

    // No debugger statements
    'no-debugger': 'error',

    // Require === and !==
    'eqeqeq': ['error', 'always', { null: 'ignore' }],

    // No eval
    'no-eval': 'error',

    // No implied eval
    'no-implied-eval': 'error',

    // ===========================================
    // Code Style (warnings, auto-fixable)
    // ===========================================

    // Consistent brace style
    'brace-style': ['warn', '1tbs', { allowSingleLine: true }],

    // Trailing commas
    'comma-dangle': ['warn', 'es5'],

    // Semicolons
    'semi': ['warn', 'always'],

    // Single quotes
    'quotes': ['warn', 'single', { avoidEscape: true }]
  },

  // Override rules for specific file patterns
  overrides: [
    {
      // Test files - relax some rules
      files: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/*.spec.tsx', '**/tests/**/*'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'warn', // Allow in tests but still warn
        '@typescript-eslint/no-unsafe-assignment': 'off',
        '@typescript-eslint/no-unsafe-member-access': 'off',
        '@typescript-eslint/no-unsafe-call': 'off',
        'no-console': 'off'
      }
    },
    {
      // Config files - more relaxed
      files: ['*.config.js', '*.config.ts', 'vite.config.*', 'vitest.config.*', 'playwright.config.*'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'warn',
        'no-console': 'off'
      }
    },
    {
      // JavaScript files (no TypeScript rules)
      files: ['**/*.js', '**/*.jsx', '**/*.mjs', '**/*.cjs'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-unsafe-assignment': 'off',
        '@typescript-eslint/no-unsafe-member-access': 'off',
        '@typescript-eslint/no-unsafe-call': 'off',
        '@typescript-eslint/no-unsafe-return': 'off',
        '@typescript-eslint/no-unsafe-argument': 'off'
      }
    }
  ],

  // Files/directories to ignore
  ignorePatterns: [
    'node_modules/',
    'dist/',
    'build/',
    '.next/',
    'coverage/',
    '*.min.js',
    '*.generated.*'
  ]
};
