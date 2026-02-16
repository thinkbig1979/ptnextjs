---
description: "Codebase health sweep - automated maintenance and drift prevention"
version: 1.0
---

# Codebase Health Sweep

Automated codebase maintenance that finds and fixes accumulated drift: dead exports, unused dependencies, TypeScript errors, stale references, and code markers.

## Prerequisites

- Project must have a `package.json` (for dependency analysis)
- TypeScript projects should have `tsconfig.json`
- Git repository (for safe rollback if fixes break anything)

## Arguments

Parse the `$ARGUMENTS` variable:

```yaml
--dry-run:       Analysis only, no fixes applied
--fix-all:       Apply all SAFE fixes automatically
--category=X:    Run only one category (types, deps, exports, todos, large-files, stale-refs)
```

Default (no arguments): Full sweep with safe fixes.

## Phase 1: Analysis (NO fixes yet)

Run all analysis tools and collect findings. Do NOT fix anything in this phase.

### Step 1.1: TypeScript Compilation

```bash
npx tsc --noEmit 2>&1
```

Capture all errors. Group by:
- Missing imports
- Type mismatches
- Unused variables (if strict)
- Configuration issues

### Step 1.2: Dead Exports and Unused Files

**If `knip` is available:**
```bash
npx knip --reporter json 2>/dev/null
```

**If `knip` is not available**, perform manual analysis:
```yaml
FOR EACH exported symbol in src/:
  1. Search for import references across the codebase
  2. If zero references found outside its own file, flag as potentially dead
  3. Check barrel files (index.ts) for re-exports

FOR EACH file in src/:
  1. Check if any other file imports from it
  2. If zero importers and not an entry point, flag as potentially dead
```

### Step 1.3: Unused Dependencies

**If `knip` is available:**
```bash
npx knip --include dependencies --reporter json 2>/dev/null
```

**If not**, perform manual analysis:
```yaml
FOR EACH dependency in package.json.dependencies:
  1. Search for: import/require statements referencing the package
  2. Search for: package name in config files (next.config, tailwind.config, etc.)
  3. If zero references found, flag as potentially unused

FOR EACH devDependency in package.json.devDependencies:
  1. Search for: usage in scripts, config files, and test files
  2. If zero references, flag as potentially unused
```

### Step 1.4: Stale References

```yaml
FOR EACH import statement in src/:
  1. Verify the imported module/file exists
  2. Verify the imported symbol is actually exported by that module
  3. Flag any broken imports

CHECK barrel files (index.ts, index.js):
  1. Verify all re-exported modules exist
  2. Flag any re-exports of deleted modules
```

### Step 1.5: Code Markers Inventory

```bash
# Search for maintenance markers
grep -rn "TODO\|FIXME\|HACK\|@deprecated\|XXX" src/ --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx"
```

Group by marker type and list with file:line references.

### Step 1.6: Large File Detection

```yaml
FOR EACH file in src/:
  IF line count > 500:
    FLAG for review with current line count
    SUGGEST potential split points (multiple classes, many exports)
```

## Phase 2: Triage

Categorize every finding from Phase 1:

```yaml
categories:
  SAFE:     # Auto-fixable without risk
    - Unused exports with zero importers
    - Dead files with zero importers (not entry points)
    - Clearly unused devDependencies (not referenced anywhere)
    - Broken imports of deleted modules (remove the import line)

  REVIEW:   # Needs human judgment
    - Dependencies only used in scripts or config (not imported in code)
    - Large files that may need architectural decisions to split
    - Exports used only via dynamic imports or string references
    - Dependencies that may be peer dependencies of other packages

  SKIP:     # Ambiguous or risky
    - Runtime-only dependencies (loaded dynamically)
    - Files that may be entry points (pages, API routes, workers)
    - Exports referenced in external packages or plugins
```

Write triage results to TodoWrite with clear categories.

## Phase 3: Safe Fixes

**If `--dry-run` is set, SKIP this phase entirely.**

Apply all SAFE fixes:

```yaml
FOR EACH SAFE finding:
  1. Apply the fix (remove dead export, delete dead file, remove unused dep)
  2. Run `npx tsc --noEmit` after each batch of related fixes
  3. IF fix breaks compilation:
     - Immediately REVERT the fix
     - Recategorize as REVIEW
  4. IF fix succeeds:
     - Mark as completed in TodoWrite

AFTER all safe fixes:
  1. Run full test suite (if available): npm test / pnpm test
  2. IF any tests fail:
     - Identify which fix caused the failure
     - Revert that fix
     - Recategorize as REVIEW
```

## Phase 4: Report

Generate a summary report:

```markdown
## Codebase Health Sweep Results

### Fixed (SAFE)
- Removed N unused exports across M files
- Deleted N dead files (-X lines)
- Removed N unused dependencies from package.json
- Fixed N broken import references

### Needs Review (REVIEW)
- [file:line] Description of finding and why it needs review
- ...

### Skipped
- [file:line] Description and reason for skipping
- ...

### Code Markers
- N TODO items
- N FIXME items
- N HACK items
- N @deprecated items

### Large Files (>500 lines)
- [file] - N lines (suggest: split into X and Y)
- ...
```

**If fixes were applied:**
```bash
git add -A
git commit -m "chore: codebase health sweep - [summary of changes]"
```

Do NOT push. Let the user review the commit first.

## Configuration

From `config.yml`:

```yaml
codebase_sweep:
  enabled: true
  categories:
    typescript: true
    dead_exports: true
    unused_deps: true
    stale_refs: true
    code_markers: true
    large_files: true
  thresholds:
    large_file_lines: 500
  enforcement_mode: "advisory"  # advisory | warning
  auto_fix: true                # Apply SAFE fixes automatically
```

## Integration with Other Commands

- Run `/sweep` before `/create-spec` to start from a clean baseline
- Run `/sweep` after `/run` or `/orchestrate` to catch any drift introduced
- `/validate-system` checks Agent OS health; `/sweep` checks project code health
