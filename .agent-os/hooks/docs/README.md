# Agent OS Hooks System - Complete Documentation

## Overview

Agent OS provides two complementary hook systems that run automatically on every file write/edit operation:

1. **TDD Validator** (PreToolUse) - Enforces test-driven development workflow
2. **Quality Hooks** (PostToolUse) - Validates code quality and applies auto-fixes

**Combined Benefits:**
- Zero manual intervention required
- Automatic error detection and auto-fixing
- TDD enforcement (RED-GREEN-REFACTOR)
- ~0.8s overhead per file
- 60% context token savings

---

## Architecture

```
Claude Code Write/Edit Operation
            |
            v
+------------------------------------------+
| PreToolUse Hook: TDD Validator (~16ms)   |
| .agent-os/hooks/tdd-validator.sh         |
| - Detect file type (test/doc/config/impl)|
| - Load TDD state, check phase            |
| - Apply enforcement (STRICT/STANDARD)    |
| - Exit 0 = Allow, Exit 1 = Block         |
+------------------------------------------+
            |
            v
+------------------------------------------+
| File Write/Edit Operation (if allowed)   |
+------------------------------------------+
            |
            v
+------------------------------------------+
| PostToolUse Hook: Quality Validator      |
| .claude/hooks/validate-file.js (~50-200ms)|
| - Syntax, formatting, linting            |
| - Auto-fixes applied                     |
| - Always exits 0 (never blocks)          |
+------------------------------------------+
```

### File Structure

```
hooks/
├── runner.js                 # Core hook orchestration
├── performance-monitor.js    # Performance tracking
├── tdd-validator.sh          # TDD enforcement (PreToolUse)
├── config.yml                # Hook configuration
├── validators/               # Individual validators
│   ├── syntax_check.js       # Syntax validation
│   ├── formatting.js         # Code formatting (Prettier, Black)
│   ├── linting.js           # Linting (ESLint, Ruff)
│   ├── security_scan.js     # Security vulnerability detection
│   └── test_generator.js    # Test scaffolding generation
└── docs/                    # This documentation
    └── README.md
```

---

## Installation

### Automated Installation

```bash
# Install quality hooks
~/.agent-os/setup/install-hooks.sh

# Install TDD hooks
~/.agent-os/setup/install-tdd-hooks.sh
```

### Installation Options

```bash
# Install in specific project
~/.agent-os/setup/install-hooks.sh --target=/path/to/project

# Preview without making changes
~/.agent-os/setup/install-hooks.sh --dry-run

# Force reinstall (overwrites existing)
~/.agent-os/setup/install-hooks.sh --force
```

### NPM Dependencies

```bash
npm install --save-dev prettier eslint typescript js-yaml chalk
```

---

## Configuration

### Main Configuration: `hooks/config.yml`

```yaml
hooks:
  enabled: true
  mode: balanced          # strict | balanced | minimal
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
    - name: linting
      enabled: true
      priority: 3
      auto_fix: true
    - name: security_scan
      enabled: true
      priority: 6

validation_rules:
  typescript:
    file_patterns: ["**/*.ts", "**/*.tsx"]
    tools: {formatter: "prettier", linter: "eslint"}
    rules: {max_line_length: 100, indent_size: 2, quote_style: "single"}

exclusions:
  ignore_directories: ["node_modules", ".git", "dist", "build"]
  ignore_files: ["*.min.js", "*.min.css", "package-lock.json"]
```

### Validation Modes

| Mode | Behavior |
|------|----------|
| **strict** | Blocks on failure |
| **balanced** | Warns, auto-fixes, continues (recommended) |
| **minimal** | Critical validators only (syntax, security) |

### Claude Settings: `.claude/settings.json`

```json
{
  "hooks": {
    "PreToolUse": [{
      "matcher": "Write|Edit",
      "hooks": [{
        "type": "command",
        "command": "bash \"$CLAUDE_PROJECT_DIR\"/.agent-os/hooks/tdd-validator.sh \"$CLAUDE_HOOK_TOOL_PARAMETERS_file_path\""
      }]
    }],
    "PostToolUse": [{
      "matcher": "Write|Edit",
      "hooks": [{
        "type": "command",
        "command": "node \"$CLAUDE_PROJECT_DIR\"/.claude/hooks/validate-file.js"
      }]
    }]
  }
}
```

---

## Validators

| Validator | Priority | Auto-Fix | Time | Purpose |
|-----------|----------|----------|------|---------|
| syntax_check | 1 | No | 50-100ms | Validate syntax (JS, TS, Python, JSON, YAML) |
| formatting | 2 | Yes | 100-200ms | Apply Prettier/Black formatting |
| linting | 3 | Yes | 200-500ms | ESLint/Ruff/Stylelint rules |
| imports | 4 | Yes | 50-100ms | Sort and organize imports |
| type_checking | 5 | No | 300-800ms | tsc/mypy validation |
| security_scan | 6 | No | 50-150ms | Detect vulnerabilities and secrets |
| test_generator | 7 | Yes | 100-200ms | Generate test scaffolding |

### What Gets Auto-Fixed

**Always Auto-Fixed:**
- Code formatting (indentation, spacing, quotes)
- Import sorting and organization
- Trailing whitespace
- Missing semicolons (if configured)
- Unused imports removal

**Warned (Not Auto-Fixed):**
- Type errors
- Logic errors
- Security vulnerabilities
- Complex linting issues

---

## TDD Enforcement

### State File Location

`.agent-os/tdd-state/[task-id].json`

```json
{
  "task_id": "impl-auth-001",
  "current_phase": "GREEN",
  "enforcement_level": "STRICT",
  "test_failures": 0,
  "phase_history": [...],
  "metrics": { "tests_written": 12, "tests_passing": 12 }
}
```

### Phase Enforcement

| Phase | STRICT | STANDARD | RELAXED |
|-------|--------|----------|---------|
| `INIT` | Block impl | Warn, allow | Allow |
| `RED` | Block changes | Warn, allow | Allow |
| `GREEN` | Allow | Allow | Allow |
| `REFACTOR` | Allow | Allow | Allow |
| `COMPLETE` | Allow | Allow | Allow |

### Usage

Hooks run automatically. For manual testing:

```bash
export TDD_TASK_ID=impl-auth-001
bash .agent-os/hooks/tdd-validator.sh src/auth.js

# Debug mode
TDD_DEBUG=1 bash .agent-os/hooks/tdd-validator.sh src/auth.js
```

---

## Language-Specific Standards

The hook system integrates with language-specific standards files:

| Language | Standards File | File Patterns |
|----------|----------------|---------------|
| Ruby/Rails | `standards/backend/rails-patterns.md` | `*.rb`, `Gemfile`, `*.rake` |
| TypeScript | `standards/frontend/typescript-patterns.md` | `*.ts`, `*.tsx` |
| Python | `standards/backend/python-patterns.md` | `*.py` |

Configure in `hooks/config.yml`:

```yaml
standards_documentation:
  typescript:
    enabled: true
    standards_file: "standards/frontend/typescript-patterns.md"
    file_patterns: ["**/*.ts", "**/*.tsx"]
    applies_to_validators: [linting, formatting, type_checking]
```

---

## Performance

### Execution Times

| Operation | PreToolUse (TDD) | Tool | PostToolUse (Quality) | Total |
|-----------|------------------|------|----------------------|-------|
| Test file | ~16ms | <10ms | ~50-100ms | ~76-126ms |
| Implementation (GREEN) | ~16ms | <10ms | ~50-200ms | ~76-226ms |
| Implementation (INIT, STRICT) | ~16ms | Blocked | N/A | ~16ms |
| Documentation/Config | ~5ms (skip) | <10ms | ~10ms (skip) | ~25ms |

### Optimizations

- **Parallel Execution** - Run validators concurrently
- **Smart Caching** - Cache results for unchanged files (30 min)
- **Incremental Validation** - Only validate changed code sections
- **Lazy Loading** - Load validators only when needed

### Performance Monitoring

```bash
npm run hooks:performance
```

---

## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| Hook not triggering | Check `.claude/settings.json`, verify script executable |
| Validators not running | Check `enabled: true` in config.yml |
| State file not found | Set `TDD_TASK_ID`, verify path |
| Always blocks/allows | Check enforcement level in state or config.yml |
| Formatter not installed | `npm install -g prettier` / `pip install black` |
| Auto-fix not working | Enable `auto_fix: true` on validator |
| Timeout | Increase `timeout_seconds` in config |
| Performance issues | Enable parallel, incremental, caching |

### Permission Issues

```bash
chmod +x .agent-os/hooks/*.js
chmod +x .agent-os/hooks/*.sh
```

---

## Custom Validators

Create a custom validator in `hooks/validators/`:

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
file_creation:
  validators:
    - name: custom_validator
      enabled: true
      priority: 8
```

---

## NPM Scripts

These scripts are added to your `package.json`:

```json
{
  "scripts": {
    "hooks:test-write": "node .agent-os/hooks/runner.js write-hook",
    "hooks:test-edit": "node .agent-os/hooks/runner.js edit-hook",
    "hooks:performance": "node .agent-os/hooks/performance-monitor.js"
  }
}
```

---

## Best Practices

1. Use balanced mode for development
2. Keep formatters/linters updated
3. Review auto-fixes before committing
4. Exclude generated/vendor files
5. Monitor performance and adjust as needed
6. Document exceptions with comments
7. Run `bd sync` at session end (Beads integration)

---

## API Usage

```javascript
const { writeWithHooks, editWithHooks } = require('./hooks/write-wrapper.js');

// Create file with validation
const result = await writeWithHooks('/path/to/file.js', content);
console.log('Auto-fixed:', result.autoFixed);

// Edit file with validation
const editResult = await editWithHooks('/path/to/file.js', oldContent, newContent);
```

---

## Related Files

- **Hook Runner**: `hooks/runner.js`
- **TDD Validator**: `hooks/tdd-validator.sh`
- **Configuration**: `hooks/config.yml`
- **Installation**: `setup/install-hooks.sh`, `setup/install-tdd-hooks.sh`
- **TDD State**: `.agent-os/tdd-state/[task-id].json`
- **Main Config**: `config.yml` (tdd_enforcement, quality_hooks sections)

---

**Version**: Agent OS v5.1.0 | Quality Hooks v2.6.1
