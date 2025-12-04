# Language-Specific Standards Integration

## Overview

This document describes how language-specific code standards are integrated into the Agent OS hooks configuration system.

## Changes Made

The `hooks/config.yml` file has been updated to reference three comprehensive language-specific standards documents:

1. **Ruby on Rails**: `standards/backend/rails-patterns.md`
2. **TypeScript/React**: `standards/frontend/typescript-patterns.md`
3. **Python**: `standards/backend/python-patterns.md`

## Configuration Structure

### Standards Documentation Section

A new `standards_documentation` section has been added at line 129 that maps each language to its standards file:

```yaml
standards_documentation:
  rails:
    enabled: true
    standards_file: "standards/backend/rails-patterns.md"
    file_patterns:
      - "**/*.rb"
      - "**/Gemfile"
      - "**/Rakefile"
      - "**/*.rake"
    applies_to_validators:
      - linting
      - formatting
      - security_scan
      - code_quality

  typescript:
    enabled: true
    standards_file: "standards/frontend/typescript-patterns.md"
    file_patterns:
      - "**/*.ts"
      - "**/*.tsx"
    applies_to_validators:
      - linting
      - formatting
      - type_checking
      - security_scan
      - code_quality

  python:
    enabled: true
    standards_file: "standards/backend/python-patterns.md"
    file_patterns:
      - "**/*.py"
    applies_to_validators:
      - linting
      - formatting
      - type_checking
      - security_scan
      - code_quality
```

### Validation Rules Updates

Each language's validation rules section now includes a `standards_reference` field:

- **TypeScript** (line 211): `standards_reference: "standards/frontend/typescript-patterns.md"`
- **Python** (line 249): `standards_reference: "standards/backend/python-patterns.md"`
- **Ruby** (line 288): `standards_reference: "standards/backend/rails-patterns.md"` (newly added)

### New Ruby/Rails Validation Section

A complete Ruby validation configuration has been added (lines 284-315) including:

- Syntax checking with `ruby -c`
- Formatting and linting with RuboCop
- Support for `.rb`, `Gemfile`, `Rakefile`, and `.rake` files
- Rails-specific linting rules
- RSpec integration

## How It Works

### File Type Detection

When a file is created or edited, the hooks system:

1. Matches the file extension against `file_patterns` in each language configuration
2. Loads the corresponding `standards_reference` document
3. Applies the validators listed in `applies_to_validators`

### Validator Integration

Validators reference the standards documents to:

- **Linting**: Enforce naming conventions, code organization, and pattern usage
- **Formatting**: Apply consistent style (indentation, quotes, line length)
- **Type Checking**: Validate type annotations and usage
- **Security Scanning**: Check for language-specific security vulnerabilities
- **Code Quality**: Ensure adherence to best practices defined in standards

## File Mappings

| File Type | Standards Document | Validators Applied |
|-----------|-------------------|-------------------|
| `*.rb`, `Gemfile`, `Rakefile`, `*.rake` | `standards/backend/rails-patterns.md` | linting, formatting, security_scan, code_quality |
| `*.ts`, `*.tsx` | `standards/frontend/typescript-patterns.md` | linting, formatting, type_checking, security_scan, code_quality |
| `*.py` | `standards/backend/python-patterns.md` | linting, formatting, type_checking, security_scan, code_quality |

## Benefits

1. **Centralized Standards**: All code style rules are documented in comprehensive markdown files
2. **Automated Enforcement**: Hooks automatically validate against standards on every file operation
3. **Developer Guidance**: Developers can reference detailed standards documents for best practices
4. **Consistency**: Same standards apply whether code is written by humans or AI agents
5. **Extensibility**: Easy to add new languages or update existing standards

## Verification

All configuration changes have been validated:

- ✅ YAML syntax is valid
- ✅ All three standards files exist and are accessible
- ✅ File patterns correctly map to their standards
- ✅ All validators are properly configured

## Future Enhancements

Potential improvements to consider:

1. Add standards for JavaScript (`standards/frontend/javascript-patterns.md`)
2. Add standards for CSS/SCSS (`standards/frontend/css-patterns.md`)
3. Create validator implementations that parse and enforce rules from standards documents
4. Add automated testing to verify standards compliance
5. Generate lint configuration files (`.eslintrc`, `.rubocop.yml`, etc.) from standards documents

## Related Documentation

- `/home/edwin/.agent-os/hooks/config.yml` - Main hooks configuration
- `/home/edwin/.agent-os/standards/backend/rails-patterns.md` - Rails code standards
- `/home/edwin/.agent-os/standards/frontend/typescript-patterns.md` - TypeScript/React standards
- `/home/edwin/.agent-os/standards/backend/python-patterns.md` - Python code standards
- `/home/edwin/.agent-os/hooks/README.md` - Hooks system overview
