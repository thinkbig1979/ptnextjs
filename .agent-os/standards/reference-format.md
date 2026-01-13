---
version: 5.1.0
last-updated: 2026-01-02
---


# File Reference Format Standard

## Format

Use `file_path:line_number` for all file references.

```
path:line              # Single line
path:start-end         # Line range
```

## Examples

| Good | Bad |
|------|-----|
| `src/models/user.rb:42` | `user.rb line 42` |
| `app/controllers/auth.ts:105-120` | `See auth.ts` |
| `@.agent-os/standards/rails.md:250` | `In the User model` |
| `/home/user/project/utils.py:88` | `user.rb#L42` |

## Usage

**In specs**: `app/controllers/sessions_controller.rb:25-40`
**In tasks**: `src/services/payment.ts:175` - Add retry logic
**In reports**: Type error in `src/models/order.ts:88`
**In code**: `# See app/models/user.rb:105`

## Path Guidelines

| Context | Path Type |
|---------|-----------|
| Same project | Relative |
| System/external files | Absolute |

## Special Prefixes

- `@.agent-os/` - Agent OS framework files
- `~/` - User home directory
