---
description: Agent OS Quality Hooks System Guide
version: 1.1
---

# Quality Hooks System Guide

Automatic validation and quality assurance for all file operations.

**Benefits:** Zero manual intervention, auto error detection, auto-fix capabilities, ~0.8s overhead, 60% context token savings.

## Architecture

```
hooks/
├── runner.js          # Core orchestration (HookRunner)
├── config.yml         # Configuration
└── validators/        # Validator implementations
    ├── formatting.js, linting.js, security_scan.js
    ├── syntax_check.js, test_generator.js
```

## Execution Flow

```
File Write/Edit → HookRunner → Detect file type → Run validators (parallel)
→ Aggregate results → Apply auto-fixes → Display summary → Finalize
```

## Validators

| Validator | Priority | Auto-Fix | Purpose |
|-----------|----------|----------|---------|
| syntax_check | 1 | No | Validate syntax (JS, TS, Python, JSON, YAML, CSS) |
| formatting | 2 | Yes | Apply Prettier/Black formatting |
| linting | 3 | Yes | ESLint/Ruff/Stylelint rules |
| imports | 4 | Yes | Sort and organize imports |
| type_checking | 5 | No | tsc/mypy validation |
| security_scan | 6 | No | Detect vulnerabilities, secrets |
| test_generator | 7 | Yes | Generate test scaffolding |

## Configuration

```yaml
# hooks/config.yml
hooks:
  enabled: true
  mode: balanced  # strict | balanced | minimal
  fail_on_error: false
  timeout_seconds: 30

file_creation:
  validators:
    - name: syntax_check
      enabled: true
      priority: 1
    - name: formatting
      enabled: true
      priority: 2
      auto_fix: true

validation_rules:
  javascript:
    file_patterns: ["**/*.js", "**/*.jsx"]
    tools: {formatter: "prettier", linter: "eslint"}
    rules: {max_line_length: 100, indent_size: 2, quote_style: "single"}

exclusions:
  ignore_directories: ["node_modules", ".git", "dist", "build"]
  ignore_files: ["*.min.js", "*.min.css", "package-lock.json"]
```

## Validation Modes

| Mode | Behavior |
|------|----------|
| **strict** | Blocks on failure |
| **balanced** | Warns, auto-fixes, continues (recommended) |
| **minimal** | Critical only (syntax, security) |

## Performance

**Per-file overhead:** ~0.8s (parallel execution)
- Syntax: ~100ms, Formatting: ~300ms, Linting: ~250ms
- Type check: ~150ms, Security: ~100ms

**Optimizations:** Parallel execution, incremental validation, smart caching

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Validator not running | Check `enabled: true` in config.yml |
| Formatter not installed | `npm install -g prettier` / `pip install black` |
| Auto-fix not working | Enable `auto_fix: true` on validator |
| Timeout | Increase `timeout_seconds` in config |
| Performance | Enable parallel, incremental, caching |

## Custom Validators

```javascript
// hooks/validators/custom_validator.js
class CustomValidator {
  async validate(filePath, options = {}) {
    return {
      passed: boolean,
      errors: [],
      warnings: [],
      fixed: boolean,
      content: string
    };
  }
}
module.exports = new CustomValidator();
```

Add to config.yml:
```yaml
validators:
  - name: custom_validator
    enabled: true
    priority: 8
```

## Best Practices

1. Use balanced mode for development
2. Keep formatters/linters updated
3. Review auto-fixes before committing
4. Exclude generated/vendor files
5. Monitor performance, adjust as needed
6. Document exceptions with comments
