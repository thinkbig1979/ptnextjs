# Agent OS Quality Hooks System

## Overview

The Quality Hooks System provides **automatic quality enforcement** for all file operations in Agent OS. Every file write and edit is validated and auto-fixed in real-time, ensuring consistent code quality without manual intervention.

## Features

### 🎯 Automatic Validation
- Runs on every file write/edit operation
- Zero manual intervention required
- Transparent operation (doesn't block workflow)
- ~0.8s overhead per file

### 🔧 Auto-Fix Capabilities
- **Formatting** - Prettier, Black (100% auto-fix)
- **Linting** - ESLint, Pylint, Stylelint (~80% auto-fix)
- **Import Organization** - Sort and remove unused imports
- **Test Generation** - Create test scaffolding automatically

### 🌐 Multi-Language Support
JavaScript, TypeScript, Python, CSS, JSON, YAML, Markdown, and 15+ more

### 📊 60% Token Savings
Prevents iteration cycles by catching and fixing issues immediately

## Quick Start

```bash
# Install hook system
~/.agent-os/setup/install-hooks.sh

# Install npm dependencies
npm install --save-dev prettier eslint typescript js-yaml chalk

# Hooks run automatically - no manual action needed
```

## File Structure

```
hooks/
├── config.yml                   # Configuration
├── runner.js                    # Core orchestration
├── write-wrapper.js            # Integration layer
├── performance-monitor.js      # Performance tracking
├── validators/                 # Individual validators
│   ├── syntax_check.js        # Syntax validation
│   ├── formatting.js          # Code formatting
│   ├── linting.js             # Linting with auto-fix
│   ├── security_scan.js       # Security vulnerabilities
│   └── test_generator.js      # Test scaffolding
└── tests/                      # Test suite
```

## How It Works

1. **Agent writes/edits file** → Triggers hooks automatically
2. **Validators run in parallel** → ~0.8s total
3. **Auto-fixes applied** → Formatting, linting, imports
4. **File written with fixes** → Agent sees clean code
5. **Test file generated** → If applicable

## Configuration

Edit `hooks/config.yml`:

```yaml
hooks:
  enabled: true
  mode: "balanced"  # strict | balanced | minimal
  auto_fix: true
  
  validators:
    - syntax_check
    - formatting
    - linting
    - security_scan
    - test_generator
```

## Validators

| Validator | Purpose | Auto-Fix | Time |
|-----------|---------|----------|------|
| syntax_check | Validate syntax | No | 50-100ms |
| formatting | Code formatting | Yes | 100-200ms |
| linting | Code quality | Yes | 200-500ms |
| imports_organization | Sort/clean imports | Yes | 50-100ms |
| type_checking | Type validation | No | 300-800ms |
| security_scan | Vulnerability detection | No | 50-150ms |
| test_generator | Test scaffolding | Yes | 100-200ms |

## Performance

**Execution Time**: ~800ms (parallel execution)

**Token Savings**:
- Without hooks: 3,000 tokens per file (write → discover issues → fix → verify)
- With hooks: 1,000 tokens per file (issues auto-fixed)
- **Savings: 2,000 tokens (67% reduction)**

## Documentation

- **Comprehensive Guide**: `instructions/utilities/quality-hooks-guide.md`
- **Installation**: `INSTALLATION.md`
- **Implementation**: `QUALITY_HOOKS_IMPLEMENTATION.md`
- **Test Results**: `tests/TEST_RESULTS.md`

## Troubleshooting

**Validators not running?**
- Check `config.yml` - ensure `enabled: true`
- Install npm packages: `npm install --save-dev prettier eslint`

**Slow performance?**
- Use `minimal` mode in config
- Disable slow validators (type_checking)

**Too many warnings?**
- Configure `.eslintrc` and `.prettierrc` for your project
- Adjust validation rules in `config.yml`

## Manual Testing (Optional)

```bash
# Test file creation
npm run hooks:test-write src/file.js

# Test file editing
npm run hooks:test-edit src/file.js

# Performance analysis
npm run hooks:performance
```

## API Usage

```javascript
const { writeWithHooks, editWithHooks } = require('./hooks/write-wrapper.js');

// Create file with validation
const result = await writeWithHooks('/path/to/file.js', content);
console.log('Auto-fixed:', result.autoFixed);

// Edit file with validation
const editResult = await editWithHooks('/path/to/file.js', oldContent, newContent);
```

## What Gets Auto-Fixed

✅ **Always Auto-Fixed**:
- Code formatting (indentation, spacing, quotes)
- Import sorting and organization
- Trailing whitespace
- Missing semicolons (if configured)
- Unused imports removal

⚠️ **Warned (Not Auto-Fixed)**:
- Type errors
- Logic errors
- Security vulnerabilities
- Complex linting issues

## Performance Monitoring

```javascript
const monitor = require('./hooks/performance-monitor.js');

// Get performance stats
const stats = monitor.getStats();

// Print formatted table
monitor.printStats();
```

## Version

**Current Version**: v2.2.1
**Part of**: Agent OS Automatic Quality Enforcement System

## License

Part of Agent OS - see main repository for license information

---

For comprehensive documentation, see: `instructions/utilities/quality-hooks-guide.md`
