---
version: 5.1.0
last-updated: 2026-01-02
related-files:
  - instructions/core/create-spec.md
---


# Steps 6-9: Core Spec File Creation

## Step 6: Date Determination

**Subagent**: date-checker

Output: YYYY-MM-DD format
Store for folder naming

## Step 7: Spec Folder Creation

**Subagent**: file-creator

```
CREATE: {AGENT_OS_ROOT}/.agent-os/specs/YYYY-MM-DD-spec-name/

Rules:
  - kebab-case
  - Max 5 words
  - Descriptive

Examples:
  - 2025-03-15-password-reset-flow
  - 2025-03-16-user-profile-dashboard
```

## Step 8: Create spec.md

**Subagent**: file-creator

File: `{AGENT_OS_ROOT}/.agent-os/specs/YYYY-MM-DD-spec-name/spec.md`

```markdown
# Spec Requirements Document

> Spec: [SPEC_NAME]
> Created: [CURRENT_DATE]

## Overview
[1-2 sentences: goal and objective]

## User Stories

### [STORY_TITLE]
As a [USER_TYPE], I want to [ACTION], so that [BENEFIT].
[DETAILED_WORKFLOW]

## Spec Scope
1. **[FEATURE]** - [ONE_SENTENCE]
2. **[FEATURE]** - [ONE_SENTENCE]

## Out of Scope
- [EXCLUDED_1]
- [EXCLUDED_2]

## Expected Deliverable
1. [TESTABLE_OUTCOME_1]
2. [TESTABLE_OUTCOME_2]
```

## Step 9: Create spec-lite.md

**Subagent**: file-creator

File: `{AGENT_OS_ROOT}/.agent-os/specs/YYYY-MM-DD-spec-name/spec-lite.md`

```markdown
# Spec Summary (Lite)

[1-3 sentences summarizing goal and objective]
```

Example: "Implement secure password reset via email verification to reduce support tickets and enable self-service account recovery. Users can request reset link, receive time-limited token via email, and set new password following security best practices."
