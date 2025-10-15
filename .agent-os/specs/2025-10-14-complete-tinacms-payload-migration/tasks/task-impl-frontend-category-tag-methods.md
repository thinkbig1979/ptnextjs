# Task IMPL-FRONTEND-CATEGORY-TAG-METHODS: Add Category and Tag Methods

## Task Metadata
- **Task ID**: impl-frontend-category-tag-methods
- **Phase**: Phase 3 - Frontend Implementation
- **Agent Assignment**: implementation-specialist
- **Estimated Time**: 2 hours
- **Dependencies**: test-frontend-dataservice
- **Status**: Ready for Implementation
- **Priority**: Medium

## Task Description

Implement category and tag data access methods in PayloadCMSDataService including getCategories(), getCategoryBySlug(), getTags(), getTagBySlug(), and getPopularTags().

## Specifics

### Methods to Implement

```typescript
async getCategories(): Promise<Category[]>
async getCategoryBySlug(slug: string): Promise<Category | null>
async getTags(): Promise<Tag[]>
async getTagBySlug(slug: string): Promise<Tag | null>
async getPopularTags(limit: number = 10): Promise<Tag[]>
```

### Key Requirements
- Implement caching (5-minute TTL)
- Transform media paths
- getPopularTags() sorts by usageCount DESC
- Error handling returns empty arrays/null

## Acceptance Criteria

- [ ] All 5 methods implemented with caching
- [ ] getPopularTags() sorts by usageCount
- [ ] All tests pass from test-frontend-dataservice
- [ ] No TypeScript errors

## Evidence Required

- Updated `lib/payload-cms-data-service.ts`
- Test results showing all category/tag tests passing

## Context Requirements

**Technical Spec:** Lines 657-708 (Tags Collection)
**Related Tasks:** impl-backend-tags, test-frontend-dataservice
