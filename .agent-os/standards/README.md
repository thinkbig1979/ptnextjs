# Agent OS Standards

Coding standards and best practices for Agent OS projects.

## Directory Structure

| Directory | Content |
|-----------|---------|
| `global/` | Language-agnostic standards |
| `frontend/` | Frontend-specific patterns |
| `backend/` | Backend-specific patterns |
| `testing/` | Testing standards |

## Key Documents

| Document | Purpose |
|----------|---------|
| `test-infrastructure.md` | Test reliability standards (v2.9+) |
| `best-practices.md` | Comprehensive best practices |
| `reference-format.md` | Code reference format |

## Standards by Category

### Global (`global/`)
| File | Purpose |
|------|---------|
| `coding-style.md` | Indentation, naming, formatting |
| `conventions.md` | General conventions |
| `error-handling.md` | Error handling patterns |
| `tech-stack.md` | Technology stack standards |

### Frontend (`frontend/`)
| File | Purpose |
|------|---------|
| `react-patterns.md` | React best practices |
| `typescript-patterns.md` | TypeScript patterns |
| `javascript-patterns.md` | JavaScript patterns |
| `html-patterns.md` | HTML patterns |
| `styling.md` | CSS/styling standards |

### Backend (`backend/`)
| File | Purpose |
|------|---------|
| `api-patterns.md` | REST API patterns |
| `database.md` | Database standards |
| `rails-patterns.md` | Rails-specific patterns |
| `python-patterns.md` | Python patterns |

### Testing (`testing/`)
| File | Purpose |
|------|---------|
| `test-strategies.md` | Testing strategies |

### Root Level
| File | Purpose |
|------|---------|
| `test-infrastructure.md` | Test reliability (v2.9) |
| `best-practices.md` | Comprehensive best practices |
| `reference-format.md` | Code reference format |

## Enforcement

Standards are enforced via:

1. **Quality Hooks** - Automatic validation on file write
   - Configured in: `config.yml` → `quality_hooks`
   - Validators in: `hooks/validators/`

2. **Code Review** - Manual review against standards

3. **CI Checks** - Automated CI validation

## Quick Reference: Code Style

| Element | Convention | Example |
|---------|------------|---------|
| Indentation | 2 spaces | `if (x) {\n  return y;\n}` |
| Variables | snake_case | `user_name`, `is_active` |
| Classes | PascalCase | `UserProfile`, `AuthService` |
| Constants | UPPER_SNAKE_CASE | `MAX_RETRIES`, `API_BASE_URL` |
| Strings | Single quotes | `'hello'` (double for interpolation) |

## Configuration

Validation rules configured in:
- `config.yml` → `quality_hooks`
- `hooks/config.yml` → validator-specific rules

## See Also

- [../hooks/README.md](../hooks/README.md) - Hook system
- [../docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md) - System architecture
- [../CLAUDE.md](../CLAUDE.md) - Main reference
