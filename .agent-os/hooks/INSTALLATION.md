# Hook System Installation Guide

## Quick Start

### Automated Installation

Install the hook system in your project with a single command:

```bash
~/.agent-os/setup/install-hooks.sh
```

This will:
- Create `.agent-os/hooks/` directory structure
- Install required npm dependencies (js-yaml, chalk)
- Copy all hook files and validators
- Create default configuration file
- Add npm scripts for manual testing
- Set proper file permissions

### Installation Options

```bash
# Install in current directory
~/.agent-os/setup/install-hooks.sh

# Install in specific project
~/.agent-os/setup/install-hooks.sh --target=/path/to/project

# Preview installation without making changes
~/.agent-os/setup/install-hooks.sh --dry-run

# Force reinstall (overwrites existing installation)
~/.agent-os/setup/install-hooks.sh --force

# Show help
~/.agent-os/setup/install-hooks.sh --help
```

## What Gets Installed

### Directory Structure

```
project/
├── .agent-os/
│   └── hooks/
│       ├── runner.js                 # Main hook runner
│       ├── performance-monitor.js    # Performance tracking
│       ├── config.yml                # Configuration file
│       ├── README.md                 # Documentation
│       ├── validators/               # Validation modules
│       │   ├── syntax_check.js
│       │   ├── linting.js
│       │   ├── formatting.js
│       │   ├── security_scan.js
│       │   └── test_generator.js
│       └── reports/                  # Validation reports (optional)
└── package.json                      # Updated with hook scripts
```

### NPM Dependencies

The following dependencies are installed:
- `js-yaml` - YAML configuration parsing
- `chalk` - Colored console output

These are installed as dev dependencies in your project.

### NPM Scripts

Three convenience scripts are added to your `package.json`:

```json
{
  "scripts": {
    "hooks:test-write": "node .agent-os/hooks/runner.js write-hook",
    "hooks:test-edit": "node .agent-os/hooks/runner.js edit-hook",
    "hooks:performance": "node .agent-os/hooks/performance-monitor.js"
  }
}
```

## Post-Installation

### 1. Review Configuration

Edit `.agent-os/hooks/config.yml` to customize:

```yaml
hooks:
  enabled: true
  mode: balanced  # strict | balanced | minimal
  fail_on_error: false
  show_detailed_output: true
  timeout_seconds: 30
```

### 2. Choose Validation Mode

**Strict Mode** - All validations must pass, blocks on failure
```yaml
hooks:
  mode: strict
  fail_on_error: true
```

**Balanced Mode** - Run all validations, warn but don't block (recommended)
```yaml
hooks:
  mode: balanced
  fail_on_error: false
```

**Minimal Mode** - Only critical validations (syntax, security)
```yaml
hooks:
  mode: minimal
  fail_on_error: false
```

### 3. Enable/Disable Validators

Control which validators run:

```yaml
file_creation:
  validators:
    - name: syntax_check
      enabled: true      # Toggle validators
      priority: 1

    - name: formatting
      enabled: true
      auto_fix: true     # Automatically fix issues

    - name: linting
      enabled: true
      auto_fix: true
```

### 4. Configure Language-Specific Rules

Customize validation rules per language:

```yaml
validation_rules:
  typescript:
    enabled: true
    rules:
      max_line_length: 100
      indent_size: 2
      quote_style: 'single'
      semicolons: true
    linting:
      extends:
        - "eslint:recommended"
        - "plugin:@typescript-eslint/recommended"
```

### 5. Test Installation (Optional)

Manually test hooks before Claude uses them:

```bash
# Test write hook on a file
npm run hooks:test-write src/example.ts

# Test edit hook on a file
npm run hooks:test-edit src/example.ts

# View performance metrics
npm run hooks:performance
```

## Automatic Hook Execution

Once installed, hooks run automatically when Claude Code uses file operations:

| Claude Tool | Hook Triggered | Validations Run |
|-------------|----------------|-----------------|
| `Write` | write-hook | All file_creation validators |
| `Edit` | edit-hook | All file_edit validators |
| `NotebookEdit` | edit-hook | All file_edit validators |

No manual intervention required - validation happens seamlessly.

## Updating Hooks

The hook system is automatically updated when you run:

```bash
~/.agent-os/setup/update.sh
```

This will:
- Update hook runner and validators to latest versions
- Preserve your custom configuration (unless --force is used)
- Add new validators and features

### Force Update (Overwrites Config)

```bash
~/.agent-os/setup/update.sh --force
```

Use this if you want to reset to default configuration.

## Troubleshooting

### Hooks Not Running

1. Check hooks are enabled in config:
   ```yaml
   hooks:
     enabled: true
   ```

2. Verify file permissions:
   ```bash
   chmod +x .agent-os/hooks/runner.js
   chmod +x .agent-os/hooks/performance-monitor.js
   ```

3. Check npm dependencies installed:
   ```bash
   npm list js-yaml chalk
   ```

### Validation Errors

1. Review error messages in hook output
2. Check language-specific configuration
3. Temporarily disable problematic validators:
   ```yaml
   file_creation:
     validators:
       - name: problematic_validator
         enabled: false
   ```

### Performance Issues

1. Enable performance optimizations:
   ```yaml
   performance:
     parallel_execution:
       enabled: true
       max_workers: 4
     smart_caching:
       enabled: true
     incremental_validation:
       enabled: true
   ```

2. Reduce timeout if validations take too long:
   ```yaml
   hooks:
     timeout_seconds: 15  # Reduce from 30
   ```

3. Switch to minimal mode for faster execution:
   ```yaml
   hooks:
     mode: minimal
   ```

### Permission Denied Errors

Make sure scripts are executable:
```bash
chmod +x .agent-os/hooks/*.js
```

## Uninstalling

To remove the hook system:

```bash
# Remove hooks directory
rm -rf .agent-os/hooks

# Remove npm dependencies
npm uninstall js-yaml chalk

# Remove npm scripts from package.json (manual edit)
# Remove: hooks:test-write, hooks:test-edit, hooks:performance
```

## Performance Impact

### Typical Overhead

- Small files (<100 lines): 50-100ms
- Medium files (100-500 lines): 100-200ms
- Large files (500-1000 lines): 200-500ms
- Very large files (1000+ lines): 500-1000ms

### Optimizations

The hook system includes several optimizations:

1. **Parallel Execution** - Run validators concurrently
2. **Smart Caching** - Cache results for unchanged files (30 min)
3. **Incremental Validation** - Only validate changed code sections
4. **Lazy Loading** - Load validators only when needed

### Performance Monitoring

Track actual performance in your project:

```bash
npm run hooks:performance
```

This shows:
- Average execution time per hook type
- Cache hit rates
- Validator-specific timings
- Optimization effectiveness

## Advanced Configuration

### Custom Validators

Add your own validators:

1. Create validator in `.agent-os/hooks/validators/custom.js`
2. Add to config:
   ```yaml
   file_creation:
     validators:
       - name: custom
         enabled: true
         priority: 10
   ```

### Exclude Directories/Files

Skip validation for certain files:

```yaml
exclusions:
  ignore_directories:
    - "node_modules"
    - "dist"
    - "build"

  ignore_files:
    - "*.min.js"
    - "*.generated.*"

  ignore_patterns:
    - "**/vendor/**"
```

### IDE Integration

Generate IDE configuration files:

```yaml
integrations:
  ide:
    generate_config_files: true
    configs:
      - ".editorconfig"
      - ".prettierrc"
      - ".eslintrc.json"
```

## Support

For issues, questions, or feature requests:
- Check README.md for detailed documentation
- Review config.yml for all available options
- Run with `--dry-run` to preview changes
- Use `--help` flag for command usage

## Next Steps

1. ✅ Installation complete
2. 📝 Review and customize `.agent-os/hooks/config.yml`
3. 🧪 (Optional) Test with `npm run hooks:test-*`
4. 🚀 Start using Claude Code - hooks work automatically!
5. 📊 Monitor performance with `npm run hooks:performance`

Happy coding with automated quality checks!
