---
version: 5.1.0
last-updated: 2026-01-02
related-files:
  - CLAUDE.md
---


# Agent OS Standards

## Key Documents

| Document | Purpose |
|----------|---------|
| `naming-conventions.md` | **Canonical** naming rules by language (v5.1+) |
| `testing-standards.md` | Canonical testing reference (v4.9+) |
| `e2e-ui-testing-standards.md` | UI-specific E2E patterns (v5.1+) |
| `best-practices.md` | TDD and compounding engineering |
| `reference-format.md` | Code reference format |
| `evolution-scoring.md` | Timelessness/evolution evaluation rubric (v5.2+) |

## Directory Structure

| Directory | Content |
|-----------|---------|
| `global/` | Language-agnostic: coding-style, conventions, error-handling, tech-stack |
| `frontend/` | React, TypeScript, JavaScript, HTML, styling patterns |
| `backend/` | API, database, Rails, Python patterns |
| `testing/` | Testing strategies |

## Quick Reference: Code Style

**For comprehensive naming rules by language, see `naming-conventions.md` (canonical reference).**

| Element | Convention | Notes |
|---------|------------|-------|
| Indentation | 2 spaces | Never tabs |
| TS/JS Variables | `camelCase` | `userName`, `isActive` |
| Python Variables | `snake_case` | `user_name`, `is_active` |
| Classes | `PascalCase` | `UserProfile`, `AuthService` |
| Constants | `UPPER_SNAKE_CASE` | `MAX_RETRIES` |
| Strings | Single quotes | `'hello'` |

## Enforcement

1. **Quality Hooks** - `hooks/validators/` (config: `config.yml`)
2. **Code Review** - Manual standards review
3. **CI Checks** - Automated validation

## See Also

- `../hooks/README.md` - Hook system
- `../CLAUDE.md` - Main reference
