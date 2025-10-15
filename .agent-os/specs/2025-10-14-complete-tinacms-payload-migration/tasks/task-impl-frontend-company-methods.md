# Task IMPL-FRONTEND-COMPANY-METHODS: Add Company Info Methods

## Task Metadata
- **Task ID**: impl-frontend-company-methods
- **Phase**: Phase 3 - Frontend Implementation
- **Agent Assignment**: implementation-specialist
- **Estimated Time**: 1 hour
- **Dependencies**: test-frontend-dataservice
- **Status**: Ready for Implementation
- **Priority**: Low

## Task Description

Implement company information data access method in PayloadCMSDataService. Company is a singleton collection with single record.

## Specifics

### Method to Implement

```typescript
async getCompanyInfo(): Promise<Company | null>
```

### Key Requirements
- Singleton collection (always returns first/only record)
- Implement caching
- Transform media paths (logo, images)
- Transform Lexical rich text

## Acceptance Criteria

- [ ] getCompanyInfo() implemented
- [ ] Caching working
- [ ] Tests pass
- [ ] No TypeScript errors

## Evidence Required

- Updated `lib/payload-cms-data-service.ts`
- Test results

## Context Requirements

**Related Tasks:** test-frontend-dataservice
