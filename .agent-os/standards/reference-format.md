# File Reference Format Standard

## Overview

This document defines the standard format for file references across all Agent OS documentation, specifications, tasks, and validation reports.

## Standard Format

Use `file_path:line_number` for all file references in specs and documentation.

### Syntax

```
absolute_or_relative_path:line_number
absolute_or_relative_path:start_line-end_line
```

## Examples

### Good Examples ✅

- `src/models/user.rb:42` - Single line reference
- `app/controllers/auth_controller.ts:105-120` - Line range reference
- `@.agent-os/standards/rails-patterns.md:250` - Agent OS file reference
- `config/database.yml:15` - Configuration file reference
- `/home/user/project/lib/utils.py:88` - Absolute path reference
- `README.md:1` - Root file reference

### Bad Examples 🔴

- `user.rb line 42` - Not machine-parseable
- `See auth_controller.ts` - No line number
- `In the User model` - Vague reference
- `line 42 of user.rb` - Wrong order
- `user.rb#L42` - GitHub-specific format (not universal)

## Usage Guidelines

### In Specifications

When referencing existing code or specifying implementation locations:

```markdown
## Implementation Details

The authentication logic should be added to:
- `app/controllers/sessions_controller.rb:25-40`

Following the pattern established in:
- `app/controllers/users_controller.rb:18-22`
```

### In Task Files

When providing context or specifying deliverables:

```markdown
## Context
Review the existing implementation at:
- `src/services/payment_processor.ts:150-200`

## Deliverables
Update the following files:
- `src/services/payment_processor.ts:175` - Add retry logic
```

### In Validation Reports

When documenting test results or issues:

```markdown
## Issues Found
- Type error in `src/models/order.ts:88`
- Missing validation in `app/validators/user_validator.rb:42-45`
```

### In Comments and Documentation

When writing inline comments that reference other files:

```ruby
# See app/models/user.rb:105 for authentication implementation
def authenticate(token)
  # ...
end
```

## Tool Support

Many editors and IDEs support `file:line` format for quick navigation:

- **VS Code**: Ctrl+Click (or Cmd+Click on macOS) on `file:line` references
- **vim**: `:e +42 file.rb` to open file at line 42
- **JetBrains IDEs**: Ctrl+Click on file:line references
- **Emacs**: `C-x C-f file:line` in some configurations
- **Command Line**: Many tools accept this format (e.g., `vim file.rb:42`)

## Benefits

1. **Machine-parseable**: Tools can extract file and line information
2. **Universal**: Works across different editors and platforms
3. **Precise**: Exact location specified, no ambiguity
4. **Consistent**: Single format across all documentation
5. **Navigable**: Most editors support clicking these references

## Relative vs Absolute Paths

### Use Relative Paths When:
- Referencing files within the same project
- Creating portable documentation
- Working with version-controlled documentation

### Use Absolute Paths When:
- Referencing system files
- Referencing files outside the project
- Providing exact locations in validation reports

## Special Prefixes

- `@.agent-os/` - References to Agent OS framework files (relative to `.agent-os/` directory)
- `~/` - References to user home directory (shell expansion)

## Migration Notes

When updating existing documentation:
1. Search for patterns like "line X", "see file Y", etc.
2. Replace with standardized `file:line` format
3. Ensure file paths are relative to project root when possible
4. Add line numbers where specific locations are referenced

## Related Standards

- See `@.agent-os/standards/code-style.md` for general code style guidelines
- See `@.agent-os/standards/best-practices.md` for development best practices
