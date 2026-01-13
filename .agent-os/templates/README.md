# Agent OS Templates

Template files for specifications, patterns, and generated outputs.

## Directory Structure

| Directory/File | Purpose | Status |
|----------------|---------|--------|
| `spec-templates/` | Specification templates for create-spec workflow | ✅ Active |
| `patterns/` | Code pattern templates (backend, frontend, testing) | ✅ Active |
| `ultra-thinking/` | Advanced analysis templates | ✅ Active |
| `test-output/` | Example generated specification files | 🔧 Test fixtures |

## Template Files

### Actively Used

| File | Purpose | Referenced By |
|------|---------|---------------|
| `inversion-analysis.md.template` | Inversion lens output | create-spec, inversion-lens-guide |
| `pre-mortem-analysis.md.template` | Pre-mortem analysis output | create-spec, pre-mortem-lens-guide |
| `session-ledger.md.template` | Session tracking template | session-start-ledger.js, execute-tasks |
| `quick-spec.md.template` | Quick spec format | /quick-spec command |

### Infrastructure

| File | Purpose | Notes |
|------|---------|-------|
| `learning-pattern.md.template` | Learning adoption template | Used by adopting-learnings.md |
| `pattern-documentation-template.md` | Pattern documentation format | Reference format |
| `quality-config-template.yml` | Quality gate configuration | Example config |
| `triage-state-readme-template.md` | Triage state documentation | Used by /triage |

### Validation Tools

| File | Purpose |
|------|---------|
| `template-validator.js` | Validate template syntax |
| `integration-test.js` | Test template system |

## Spec Templates

| Template | Description |
|----------|-------------|
| `standard-spec-template.md` | Full specification format |
| `minimal-spec-template.md` | Lightweight specification |
| `testing-strategy-template.md` | Testing strategy section |
| `quality-gates-template.md` | Quality gate definitions |
| `implementation-guide-template.md` | Implementation guidance |
| `integration-requirements-template.md` | Integration requirements |
| `architecture-decisions-template.md` | Architecture decisions |

## Pattern Templates

Organized by domain:
- `backend/` - Backend code patterns (api.md.template)
- `frontend/` - Frontend code patterns (components.md, routing.md)
- `global/` - Cross-cutting patterns (naming.md)
- `_metadata.yml.template` - Pattern metadata

## Validation

Template syntax validation:
```bash
node templates/template-validator.js templates/spec-templates/
```

## Usage

Templates are used by:
- `instructions/core/create-spec.md` - Specification creation
- `instructions/core/create-tasks.md` - Task breakdown
- `.claude/commands/quick-spec.md` - Quick specifications
- Quality lenses (Inversion, Pre-Mortem, Evolution)

---

**Version**: Agent OS v5.1.0
**Last Audit**: 2026-01-02
