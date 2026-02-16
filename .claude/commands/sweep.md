---
description: Codebase health sweep - find and fix dead code, unused deps, type errors, stale references
globs:
alwaysApply: false
version: 1.0
encoding: UTF-8
---

# Sweep (Codebase Health)

> **Automated Maintenance**: Find dead exports, unused dependencies, TypeScript errors, and stale references in a single pass
> **Safe by Default**: Only auto-fixes safe changes, flags risky ones for review

## When to Use

- Periodic codebase hygiene (weekly/monthly)
- After large feature implementations
- Before releases to catch accumulated drift
- When codebase feels cluttered or you suspect dead code

## Usage

```bash
/sweep                          # Full sweep: analyze + safe fixes
/sweep --dry-run                # Analysis only, no fixes
/sweep --fix-all                # Fix safe issues, report risky ones
/sweep --category=types         # Only TypeScript errors
/sweep --category=deps          # Only unused dependencies
/sweep --category=exports       # Only dead exports
/sweep --category=todos         # Only TODO/FIXME inventory
```

## What It Checks

| Category | What | Tool |
|----------|------|------|
| **TypeScript** | Compilation errors | `tsc --noEmit` |
| **Dead Exports** | Unused exports, dead files | `knip` or grep analysis |
| **Dependencies** | Unused packages in package.json | `knip` or import analysis |
| **Stale References** | Imports of deleted modules, broken barrel files | grep + import tracing |
| **Code Markers** | TODO, FIXME, HACK, @deprecated comments | grep inventory |
| **Large Files** | Files over 500 lines that may need splitting | file analysis |

## Safety Model

- **SAFE** (auto-fix): Unused exports, dead files with no importers, clearly unused devDependencies
- **REVIEW** (report only): Large refactors, indirect usage patterns, script-only dependencies
- **SKIP** (ignore): Ambiguous cases, anything that could break runtime behavior

## Instructions

@.agent-os/instructions/core/sweep.md

ARGUMENTS: $ARGUMENTS
