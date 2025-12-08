# Task: impl-env - Update Environment Configuration

## Task Metadata
- **Task ID**: impl-env
- **Phase**: Phase 2 - Backend Implementation
- **Agent**: backend-nodejs-specialist
- **Estimated Time**: 10-15 minutes
- **Dependencies**: [impl-jwt]
- **Status**: [ ] Not Started

## Task Description
Update environment variable documentation and examples to include the new optional JWT secrets.

## Specifics
- **Files to Modify**:
  - `.env.example`
  - `README.md` (if it documents env vars)

- **New Environment Variables**:
  ```bash
  # JWT Secrets (Optional - will derive from PAYLOAD_SECRET if not set)
  # For maximum security, set separate secrets in production
  JWT_ACCESS_SECRET=your-access-secret-min-32-chars
  JWT_REFRESH_SECRET=your-refresh-secret-min-32-chars
  ```

- **Documentation Notes**:
  - These are OPTIONAL - system works without them
  - Fallback derivation from PAYLOAD_SECRET
  - Recommended for production environments
  - Minimum 32 characters for security

## Acceptance Criteria
- [ ] .env.example includes new variables with comments
- [ ] Comments explain optional nature
- [ ] Comments explain security recommendation
- [ ] Existing deployments continue to work without changes

## Context Requirements
- Reference existing .env.example format

## Implementation Notes
- Don't make these required
- Clear documentation prevents confusion
- Follow existing .env.example style

## Quality Gates
- [ ] .env.example is valid (parseable)
- [ ] No existing required vars changed
- [ ] Comments are clear and helpful
