---
version: 5.1.0
last-updated: 2026-01-02
related-files:
  - instructions/core/create-spec.md
---


# Steps 10.1-10.5: Create Sub-Specs

**Subagent**: file-creator

All sub-specs go in: `{AGENT_OS_ROOT}/.agent-os/specs/YYYY-MM-DD-spec-name/sub-specs/`

---

## Step 10.1: Implementation Guide

**Template**: `@.agent-os/templates/spec-templates/implementation-guide-template.md`

**File**: `sub-specs/implementation-guide.md`

**Content**:
- Development approach
- Architecture overview
- Implementation strategy
- Development workflow
- QA requirements

---

## Step 10.2: Testing Strategy

**Template**: `@.agent-os/templates/spec-templates/testing-strategy-template.md`

**File**: `sub-specs/testing-strategy.md`

**Content**:
- Testing framework
- Test types (unit, integration, E2E)
- Test data management
- CI integration

---

## Step 10.3: Integration Requirements

**Template**: `@.agent-os/templates/spec-templates/integration-requirements-template.md`

**File**: `sub-specs/integration-requirements.md`

**Content**:
- System integration points
- API requirements
- Database integration
- External services
- Compatibility requirements

---

## Step 10.4: Quality Gates

**Template**: `@.agent-os/templates/spec-templates/quality-gates-template.md`

**File**: `sub-specs/quality-gates.md`

**Content**:
- Quality metrics
- Validation criteria
- Automated checks
- Compliance requirements

---

## Step 10.5: Architecture Decisions

**Template**: `@.agent-os/templates/spec-templates/architecture-decisions-template.md`

**File**: `sub-specs/architecture-decisions.md`

**Content**:
- Decision records (ADRs)
- Technical constraints
- Design principles
- Technology choices

---

## Step 11: Create Database Schema (Conditional)

**Condition**: `IF spec_requires_database_changes`

**File**: `sub-specs/database-schema.md`

```markdown
# Database Schema

## Changes
- New tables
- New columns
- Modifications
- Migrations

## Specifications
- Exact SQL/migration syntax
- Indexes and constraints
- Foreign key relationships

## Rationale
- Reason for each change
- Performance considerations
- Data integrity rules
```

---

## Step 12: Create API Spec (Conditional)

**Condition**: `IF spec_requires_api_changes`

**File**: `sub-specs/api-spec.md`

```markdown
# API Specification

## Endpoints

### [METHOD] [PATH]

**Purpose**: [DESCRIPTION]
**Parameters**: [LIST]
**Response**: [FORMAT]
**Errors**: [POSSIBLE_ERRORS]

## Controllers
- Action names
- Business logic
- Error handling

## Purpose
- Endpoint rationale
- Integration with features
```
