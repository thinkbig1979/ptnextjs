# Implementation Guide: [FEATURE_NAME]

## Context
[FEATURE_DESCRIPTION]

## AI Development Notes

### Context for AI Agents
Information to help AI agents understand this feature:
- **Complexity Level**: [Low/Medium/High/Very High]
- **Domain Knowledge Required**: [List specific domains - e.g., Authentication, Database Design, API Integration, Frontend State Management]
- **Similar Patterns**: [Reference similar features in codebase - e.g., "See user-authentication module for similar pattern", "Follows standard CRUD pattern used in admin panel"]
- **Common Pitfalls**: [Known issues to avoid - e.g., "Avoid n+1 queries on related data", "Remember to handle race conditions in concurrent updates"]

### Implementation Guidance
- **Recommended Approach**: [Suggested implementation strategy - e.g., "Start with database schema, then build API layer, finally add frontend components", "Use test-driven development for critical business logic"]
- **Code Patterns to Follow**: [Reference to standards/patterns - e.g., "Follow Repository pattern from standards/code-style.md", "Use snake_case for methods per Agent OS standards"]
- **Testing Strategy**: [Test-first, integration tests, etc. - e.g., "Write unit tests for business logic, integration tests for API endpoints, browser tests for UI flows"]

### Constraints
- **Must Not**: [Hard constraints - e.g., "Must not expose sensitive data in API responses", "Must not skip authentication middleware"]
- **Should Avoid**: [Soft constraints - e.g., "Avoid deeply nested components", "Minimize external dependencies"]
- **Performance Requirements**: [Speed, memory, etc. - e.g., "API responses < 200ms p95", "Support 1000 concurrent users", "Keep bundle size under 500KB"]

### Agent Collaboration
- **Best Agent for Task**: [implementation-specialist, frontend-specialist, etc. - e.g., "implementation-specialist for backend logic, frontend-specialist for React components"]
- **Estimated Token Usage**: [Low/Medium/High - e.g., "High - complex business logic with multiple integration points"]
- **Parallel Execution**: [Can this be parallelized? - e.g., "Yes - frontend and backend can be developed in parallel after API contract is defined"]

## Overview
This implementation guide provides a comprehensive development approach for [FEATURE_NAME], following Agent OS standards for systematic product development.

## Technical Foundation

### Architecture Overview
- **Primary Components**: [MAIN_COMPONENTS]
- **Technology Stack**: [TECH_STACK]
- **Dependencies**: [EXTERNAL_DEPENDENCIES]
- **Integration Points**: [INTEGRATION_POINTS]

### File Structure
```
[PROJECT_ROOT]/
├── [FEATURE_DIRECTORY]/
│   ├── components/
│   │   ├── [COMPONENT_NAME].tsx
│   │   └── __tests__/
│   ├── hooks/
│   │   ├── [HOOK_NAME].ts
│   │   └── __tests__/
│   ├── utils/
│   │   ├── [UTILITY_NAME].ts
│   │   └── __tests__/
│   ├── types/
│   │   └── [TYPE_DEFINITIONS].ts
│   └── index.ts
```

## Implementation Strategy

### Phase 1: Foundation Setup
**Duration**: [FOUNDATION_DURATION]
**Owner**: Implementation Specialist

#### Core Infrastructure
1. **Data Models**
   - [ ] Define TypeScript interfaces in `types/[TYPE_DEFINITIONS].ts`
   - [ ] Implement validation schemas using [VALIDATION_LIBRARY]
   - [ ] Create database migrations if applicable
   - [ ] Set up ORM models with proper relationships

2. **Base Components**
   - [ ] Create foundational UI components in `components/`
   - [ ] Implement core business logic in `utils/`
   - [ ] Set up custom hooks for state management in `hooks/`
   - [ ] Configure routing and navigation updates

#### Configuration
- [ ] Environment variable setup for [ENV_VARIABLES]
- [ ] API endpoint configuration
- [ ] Database connection strings
- [ ] Third-party service integrations

### Phase 2: Core Feature Development
**Duration**: [DEVELOPMENT_DURATION]
**Owner**: Implementation Specialist + Integration Coordinator

#### Primary Features
1. **[MAIN_FEATURE_1]**
   - **Location**: `[FILE_PATH_1]`
   - **Dependencies**: [FEATURE_1_DEPS]
   - **Implementation Steps**:
     ```typescript
     // [FEATURE_1_CODE_SNIPPET]
     ```
   - **Validation**: [FEATURE_1_VALIDATION]

2. **[MAIN_FEATURE_2]**
   - **Location**: `[FILE_PATH_2]`
   - **Dependencies**: [FEATURE_2_DEPS]
   - **Implementation Steps**:
     ```typescript
     // [FEATURE_2_CODE_SNIPPET]
     ```
   - **Validation**: [FEATURE_2_VALIDATION]

3. **[MAIN_FEATURE_3]**
   - **Location**: `[FILE_PATH_3]`
   - **Dependencies**: [FEATURE_3_DEPS]
   - **Implementation Steps**:
     ```typescript
     // [FEATURE_3_CODE_SNIPPET]
     ```
   - **Validation**: [FEATURE_3_VALIDATION]

#### Integration Components
- [ ] API client setup and configuration
- [ ] State management integration ([STATE_LIBRARY])
- [ ] Error boundary implementation
- [ ] Loading states and user feedback
- [ ] Form validation and submission handling

### Phase 3: Advanced Features & Optimization
**Duration**: [OPTIMIZATION_DURATION]
**Owner**: Implementation Specialist + Quality Assurance

#### Performance Optimization
- [ ] Code splitting and lazy loading implementation
- [ ] Memoization for expensive computations
- [ ] Database query optimization
- [ ] Caching strategy implementation
- [ ] Bundle size analysis and optimization

#### Advanced Features
- [ ] [ADVANCED_FEATURE_1]: [DESCRIPTION_1]
- [ ] [ADVANCED_FEATURE_2]: [DESCRIPTION_2]
- [ ] [ADVANCED_FEATURE_3]: [DESCRIPTION_3]

## Development Guidelines

### Code Style Standards
Following Agent OS code style guidelines:

```typescript
// Method naming: snake_case
const process_user_data = (userData: UserData): ProcessedData => {
  // Implementation
}

// Class naming: PascalCase
class UserDataProcessor {
  // Implementation
}

// Constants: UPPER_SNAKE_CASE
const MAX_RETRY_ATTEMPTS = 3;
```

### Error Handling Pattern
```typescript
try {
  const result = await [OPERATION_NAME]([PARAMETERS]);
  return { success: true, data: result };
} catch (error) {
  logger.error(`[FEATURE_NAME] operation failed:`, error);
  return {
    success: false,
    error: error instanceof Error ? error.message : 'Unknown error'
  };
}
```

### Testing Requirements
- Unit tests for all utility functions
- Component testing with React Testing Library
- Integration tests for API endpoints
- End-to-end tests for critical user flows
- Minimum 80% code coverage requirement

## API Integration

### Endpoints
```typescript
// API endpoint definitions
const API_ENDPOINTS = {
  [ENDPOINT_1]: '/api/[PATH_1]',
  [ENDPOINT_2]: '/api/[PATH_2]',
  [ENDPOINT_3]: '/api/[PATH_3]',
} as const;
```

### Request/Response Schemas
```typescript
interface [REQUEST_INTERFACE] {
  [REQUEST_FIELDS]
}

interface [RESPONSE_INTERFACE] {
  [RESPONSE_FIELDS]
}
```

## Database Schema & ERD

> **Note**: For comprehensive ERD guidance, see `templates/spec-templates/ERD_GENERATION_GUIDE.md`

### Entity-Relationship Diagram

Use Mermaid ERD syntax to visualize database schema and relationships:

```mermaid
erDiagram
    [ENTITY_1] ||--o{ [ENTITY_2] : [RELATIONSHIP_LABEL]
    [ENTITY_1] {
        uuid id PK
        varchar [field_1] UK "Description"
        varchar [field_2]
        timestamp created_at
        timestamp updated_at
    }
    [ENTITY_2] ||--|{ [ENTITY_3] : [RELATIONSHIP_LABEL]
    [ENTITY_2] {
        uuid id PK
        uuid [entity_1]_id FK
        varchar [field_1]
        varchar status "pending, processing, completed"
        timestamp created_at
    }
    [ENTITY_3] {
        uuid id PK
        uuid [entity_2]_id FK
        uuid [entity_4]_id FK
        int quantity
        decimal price
    }
    [ENTITY_4] ||--o{ [ENTITY_3] : "used in"
    [ENTITY_4] {
        uuid id PK
        varchar name
        text description
        decimal price
        int stock
    }
```

**Cardinality Reference**:
- `||--||` One-to-one exactly
- `||--o|` One-to-zero-or-one
- `||--o{` One-to-many
- `}o--o{` Many-to-many

### Database Tables

Document each table with detailed field specifications:

#### [TABLE_NAME_1] Table

**Table Name**: `[table_name_1]`

**Purpose**: [TABLE_PURPOSE_DESCRIPTION]

**Primary Key**: `id` (UUID)

**Indexes**:
- Unique index on `[unique_field]`
- Index on `[indexed_field]` for [REASON]
- Index on `created_at` for sorting

**Constraints**:
- `[field]` must be unique and not null
- `[field]` not null
- `[field]` must be one of: '[VALUE_1]', '[VALUE_2]', '[VALUE_3]'

| Column | Type | Constraints | Default | Description |
|--------|------|-------------|---------|-------------|
| id | UUID | PK, NOT NULL | gen_random_uuid() | Primary identifier |
| [field_1] | VARCHAR(255) | UNIQUE, NOT NULL | - | [FIELD_DESCRIPTION] |
| [field_2] | VARCHAR(255) | NOT NULL | - | [FIELD_DESCRIPTION] |
| [field_3] | TEXT | - | - | [FIELD_DESCRIPTION] |
| created_at | TIMESTAMP | NOT NULL | CURRENT_TIMESTAMP | Record creation time |
| updated_at | TIMESTAMP | NOT NULL | CURRENT_TIMESTAMP | Last update time |

[Repeat for additional tables...]

### Relationships

Document foreign key relationships and their cascade behaviors:

#### [entity_1] → [entity_2] (One-to-many)
- **Foreign Key**: `[table_2].[entity_1]_id` references `[table_1].id`
- **On Delete**: CASCADE (deleting [entity_1] deletes all their [entity_2]s)
- **On Update**: CASCADE
- **Rationale**: [RELATIONSHIP_JUSTIFICATION]

#### [entity_2] → [entity_3] (One-to-many)
- **Foreign Key**: `[table_3].[entity_2]_id` references `[table_2].id`
- **On Delete**: CASCADE
- **On Update**: CASCADE
- **Rationale**: [RELATIONSHIP_JUSTIFICATION]

#### [entity_4] → [entity_3] (One-to-many)
- **Foreign Key**: `[table_3].[entity_4]_id` references `[table_4].id`
- **On Delete**: RESTRICT (cannot delete if referenced)
- **On Update**: CASCADE
- **Rationale**: [RELATIONSHIP_JUSTIFICATION]

### Migration Strategy

Document how the schema will be created/updated:

```sql
-- Migration: [MIGRATION_DESCRIPTION]
-- Version: [VERSION_NUMBER]
-- Date: [MIGRATION_DATE]

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create [TABLE_NAME_1] table
CREATE TABLE [table_name_1] (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  [field_1] VARCHAR(255) UNIQUE NOT NULL,
  [field_2] VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_[table_name_1]_[field_1] ON [table_name_1]([field_1]);
CREATE INDEX idx_[table_name_1]_created_at ON [table_name_1](created_at);

-- Create additional tables...
-- [ADDITIONAL_TABLE_DEFINITIONS]

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_[table_name_1]_updated_at BEFORE UPDATE ON [table_name_1]
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### ORM Model Mapping

Show how ERD maps to ORM models:

#### Rails ActiveRecord Example

```ruby
# app/models/[model_name].rb
class [ModelName] < ApplicationRecord
  has_many :[related_models], dependent: :destroy
  belongs_to :[parent_model], optional: true

  validates :[field_name], presence: true, uniqueness: true
  validates :[field_name], presence: true

  enum status: {
    [status_1]: '[status_1]',
    [status_2]: '[status_2]',
    [status_3]: '[status_3]'
  }
end
```

#### TypeScript/TypeORM Example

```typescript
// src/models/[model-name].entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm';

@Entity('[table_name]')
export class [ModelName] {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  [field_name]: string;

  @Column({ type: 'varchar', length: 255 })
  [field_name]: string;

  @ManyToOne(() => [ParentModel], parent => parent.[child_collection], { onDelete: 'CASCADE' })
  @JoinColumn({ name: '[parent]_id' })
  [parent]: [ParentModel];

  @OneToMany(() => [ChildModel], child => child.[parent])
  [children]: [ChildModel][];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
```

#### Python/SQLAlchemy Example

```python
# models/[model_name].py
from sqlalchemy import Column, String, DateTime, ForeignKey, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
import enum

from database import Base

class [StatusEnum](enum.Enum):
    [STATUS_1] = '[status_1]'
    [STATUS_2] = '[status_2]'
    [STATUS_3] = '[status_3]'

class [ModelName](Base):
    __tablename__ = '[table_name]'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    [field_name] = Column(String(255), unique=True, nullable=False, index=True)
    [field_name] = Column(String(255), nullable=False)
    status = Column(Enum([StatusEnum]), nullable=False, default=[StatusEnum].[STATUS_1])
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    [children] = relationship('[ChildModel]', back_populates='[parent]', cascade='all, delete-orphan')
```

## Security Considerations

### Data Protection
- [ ] Input validation and sanitization
- [ ] SQL injection prevention
- [ ] XSS protection measures
- [ ] CSRF token implementation
- [ ] Rate limiting configuration

### Authentication & Authorization
- [ ] User permission checks
- [ ] Role-based access control
- [ ] Session management
- [ ] API key validation
- [ ] Audit logging implementation

## Deployment Strategy

### Build Process
```bash
# Build commands
[BUILD_COMMANDS]
```

### Environment Configuration
```bash
# Environment variables
[ENV_CONFIG]
```

### Deployment Steps
1. [ ] Run full test suite
2. [ ] Build production artifacts
3. [ ] Database migration execution
4. [ ] Blue-green deployment process
5. [ ] Health check verification
6. [ ] Rollback plan activation if needed

## Monitoring & Observability

### Metrics to Track
- [METRIC_1]: [DESCRIPTION_1]
- [METRIC_2]: [DESCRIPTION_2]
- [METRIC_3]: [DESCRIPTION_3]

### Logging Strategy
```typescript
// Logging implementation
const logger = {
  info: (message: string, context?: object) => { /* implementation */ },
  error: (message: string, error?: Error) => { /* implementation */ },
  warn: (message: string, context?: object) => { /* implementation */ },
};
```

### Health Checks
- [ ] Application health endpoint
- [ ] Database connectivity check
- [ ] Third-party service availability
- [ ] Performance metrics collection

## Quality Gates

### Definition of Done
- [ ] All acceptance criteria met
- [ ] Code review completed and approved
- [ ] Unit tests passing with 80%+ coverage
- [ ] Integration tests passing
- [ ] Security review completed
- [ ] Performance benchmarks met
- [ ] Documentation updated
- [ ] Deployment script tested

### Acceptance Criteria
1. **Functional Requirements**
   - [ ] [ACCEPTANCE_CRITERIA_1]
   - [ ] [ACCEPTANCE_CRITERIA_2]
   - [ ] [ACCEPTANCE_CRITERIA_3]

2. **Non-Functional Requirements**
   - [ ] Response time < [RESPONSE_TIME_TARGET]ms
   - [ ] 99.9% uptime requirement
   - [ ] Support for [CONCURRENT_USERS] concurrent users
   - [ ] Mobile responsive design
   - [ ] Accessibility compliance (WCAG 2.1 AA)

## Reusability Analysis

Identify opportunities to extract reusable components following compounding engineering principles. See `@.agent-os/standards/best-practices.md` for philosophy.

### Existing Patterns to Reuse
What existing code/patterns can be leveraged?

- **Pattern/Component**: [Name]
  - **Location**: `file:line`
  - **How to reuse**: [Brief description]
  - **Modifications needed**: [None/Minor/Adapt]

Example:
- **Pattern/Component**: User authentication middleware
  - **Location**: `src/middleware/auth.ts:15`
  - **How to reuse**: Import and apply to protected routes
  - **Modifications needed**: None - works as-is

### New Reusable Components
What components should be extracted for future reuse?

- **Component**: [Name and purpose]
  - **Abstraction level**: [Utility/Service/Module/Library]
  - **Future use cases**: [List potential reuses]
  - **Documentation needed**: [What to document]

Example:
- **Component**: Email validation and sanitization
  - **Abstraction level**: Utility function
  - **Future use cases**: All forms with email input, user registration, profile updates
  - **Documentation needed**: API docs, examples, edge cases

### Knowledge to Capture
What learnings should be documented for next time?

- **Pattern/Anti-pattern**: [Name]
  - **Description**: [What was learned]
  - **Documentation location**: [Where to add it]
  - **Example code**: [If applicable]

Example:
- **Pattern**: Rate limiting with Redis
  - **Description**: Sliding window algorithm prevents burst abuse
  - **Documentation location**: `@.agent-os/patterns/rate-limiting.md`
  - **Example code**: See implementation in `src/middleware/rate-limit.ts:25-60`

### Compound Value Assessment
How does this feature increase system compounding value?

- **Immediate value**: [Direct benefit of this feature]
- **Future value**: [How it makes future features easier]
- **Compound factor**: [Estimate: Low/Medium/High/Very High]

Example:
- **Immediate value**: User can reset forgotten passwords
- **Future value**: Email sending infrastructure can be reused for notifications, 2FA, marketing
- **Compound factor**: High - email system is foundation for 5+ future features

### Refactoring Opportunities
What existing code should be refactored to improve reusability?

- **Location**: `file:line`
  - **Current issue**: [What makes it hard to reuse]
  - **Proposed refactor**: [How to improve it]
  - **Impact**: [Benefits of refactoring]
  - **Priority**: [High/Medium/Low]

Example:
- **Location**: `src/services/user_service.rb:45-120`
  - **Current issue**: Monolithic method mixes validation, DB access, email sending
  - **Proposed refactor**: Extract validation → `validate_user_input`, email → `send_welcome_email`
  - **Impact**: Each piece reusable independently, easier to test
  - **Priority**: High - blocks 3 upcoming features

## Code Examples

This section provides concrete code examples demonstrating key implementation patterns for [FEATURE_NAME]. These examples serve as practical guides for developers implementing the specification.

### Example 1: Core Feature Implementation

**Purpose**: Demonstrate the primary functionality implementation

**File**: `[EXAMPLE_FILE_PATH_1]`

```typescript
// Example: Implementing [CORE_FEATURE_NAME]
// This example shows the recommended pattern for [FEATURE_DESCRIPTION]

import { [REQUIRED_IMPORTS] } from '[IMPORT_PATH]';

/**
 * [FUNCTION_DESCRIPTION]
 * @param {[PARAM_TYPE]} [param_name] - [PARAM_DESCRIPTION]
 * @returns {[RETURN_TYPE]} [RETURN_DESCRIPTION]
 */
const [function_name] = ([parameters]: [PARAM_TYPES]): [RETURN_TYPE] => {
  // Input validation
  if (![VALIDATION_CONDITION]) {
    throw new Error('[ERROR_MESSAGE]');
  }

  // Core implementation logic
  const result = [IMPLEMENTATION_LOGIC];

  // Return processed result
  return result;
};

export { [function_name] };
```

**Key Points**:
- [KEY_POINT_1]
- [KEY_POINT_2]
- [KEY_POINT_3]

**Common Pitfalls to Avoid**:
- ❌ [ANTI_PATTERN_1]: [WHY_TO_AVOID_1]
- ❌ [ANTI_PATTERN_2]: [WHY_TO_AVOID_2]
- ✅ Instead: [RECOMMENDED_APPROACH]

### Example 2: API Integration Pattern

**Purpose**: Demonstrate proper API integration with error handling

**File**: `[EXAMPLE_FILE_PATH_2]`

```typescript
// Example: API integration with proper error handling and retry logic

import { [API_CLIENT] } from '[API_PATH]';

interface [REQUEST_INTERFACE] {
  [REQUEST_FIELDS]
}

interface [RESPONSE_INTERFACE] {
  [RESPONSE_FIELDS]
}

const [api_function_name] = async (
  [request_params]: [REQUEST_INTERFACE]
): Promise<[RESPONSE_INTERFACE]> => {
  try {
    // Make API call with proper typing
    const response = await [API_CLIENT].[method_name]({
      [request_params]
    });

    // Validate response
    if (!response.success) {
      throw new Error(`API error: ${response.error}`);
    }

    // Transform and return data
    return {
      [transformed_data]
    };
  } catch (error) {
    // Proper error logging
    logger.error(`[FEATURE_NAME] API call failed:`, {
      error: error instanceof Error ? error.message : 'Unknown error',
      params: [request_params]
    });

    // Re-throw with context
    throw new Error(`Failed to [OPERATION_DESCRIPTION]: ${error}`);
  }
};
```

**Key Points**:
- Proper TypeScript typing for request/response
- Comprehensive error handling with logging
- Response validation before processing
- Contextual error messages for debugging

### Example 3: Component Usage

**Purpose**: Show how to use the component in a real-world scenario

**File**: `[EXAMPLE_FILE_PATH_3]`

```typescript
// Example: Using [COMPONENT_NAME] in a parent component

import React, { useState, useEffect } from 'react';
import { [COMPONENT_NAME] } from '[COMPONENT_PATH]';
import { [HOOK_NAME] } from '[HOOK_PATH]';

export const [ParentComponentName] = () => {
  // State management
  const [state, setState] = useState<[STATE_TYPE]>([INITIAL_STATE]);
  const { [hook_data] } = [HOOK_NAME]();

  // Effect for data loading
  useEffect(() => {
    const load_data = async () => {
      try {
        const data = await [fetch_function]();
        setState(data);
      } catch (error) {
        console.error('[ERROR_CONTEXT]:', error);
      }
    };

    load_data();
  }, []);

  // Event handlers
  const handle_event = ([event_params]) => {
    // Event handling logic
    [EVENT_HANDLER_IMPLEMENTATION]
  };

  return (
    <[COMPONENT_NAME]
      [prop_1]={[prop_1_value]}
      [prop_2]={[prop_2_value]}
      on[Event]={handle_event}
    />
  );
};
```

**Key Points**:
- Proper state management setup
- Effect hooks for data loading
- Event handler implementation
- Component prop passing

### Example 4: Testing Pattern

**Purpose**: Demonstrate recommended testing approach

**File**: `[EXAMPLE_TEST_FILE_PATH]`

```typescript
// Example: Comprehensive test suite for [FEATURE_NAME]

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { [COMPONENT_OR_FUNCTION] } from '../[SOURCE_FILE]';

describe('[FEATURE_NAME]', () => {
  // Test setup
  const mock_data = {
    [MOCK_DATA_FIELDS]
  };

  beforeEach(() => {
    // Reset mocks and state before each test
    jest.clearAllMocks();
  });

  describe('[FUNCTIONALITY_GROUP]', () => {
    it('should handle successful case correctly', async () => {
      // Arrange
      const expected_result = [EXPECTED_VALUE];

      // Act
      const result = await [FUNCTION_CALL](mock_data);

      // Assert
      expect(result).toEqual(expected_result);
    });

    it('should handle error cases gracefully', async () => {
      // Arrange
      const invalid_data = [INVALID_INPUT];

      // Act & Assert
      await expect([FUNCTION_CALL](invalid_data))
        .rejects
        .toThrow('[EXPECTED_ERROR_MESSAGE]');
    });

    it('should handle edge cases', () => {
      // Test edge cases
      const edge_cases = [
        { input: [EDGE_CASE_1], expected: [EXPECTED_1] },
        { input: [EDGE_CASE_2], expected: [EXPECTED_2] },
      ];

      edge_cases.forEach(({ input, expected }) => {
        const result = [FUNCTION_CALL](input);
        expect(result).toBe(expected);
      });
    });
  });
});
```

**Key Points**:
- AAA (Arrange, Act, Assert) pattern
- Comprehensive edge case coverage
- Proper mock management
- Clear test descriptions

### Example 5: Configuration Example

**Purpose**: Show proper configuration setup

**File**: `[CONFIG_FILE_PATH]`

```typescript
// Example: Configuration setup for [FEATURE_NAME]

export const [FEATURE_CONFIG] = {
  // API Configuration
  api: {
    baseUrl: process.env.[API_BASE_URL_ENV] || '[DEFAULT_API_URL]',
    timeout: [TIMEOUT_MS],
    retryAttempts: [RETRY_COUNT],
    retryDelay: [RETRY_DELAY_MS],
  },

  // Feature Flags
  features: {
    [FEATURE_FLAG_1]: process.env.[FEATURE_FLAG_1_ENV] === 'true',
    [FEATURE_FLAG_2]: process.env.[FEATURE_FLAG_2_ENV] === 'true',
  },

  // Performance Settings
  performance: {
    cacheTimeout: [CACHE_TIMEOUT_SECONDS],
    maxConcurrentRequests: [MAX_CONCURRENT],
    debounceDelay: [DEBOUNCE_MS],
  },

  // Validation Rules
  validation: {
    [VALIDATION_RULE_1]: [RULE_VALUE_1],
    [VALIDATION_RULE_2]: [RULE_VALUE_2],
  },
} as const;

// Type-safe configuration access
export type [FeatureConfig] = typeof [FEATURE_CONFIG];
```

**Key Points**:
- Environment variable integration
- Type-safe configuration
- Sensible defaults
- Clear organization by category

### Good vs. Bad Examples

#### Good Example ✅
```typescript
// GOOD: Clear function names, proper error handling, typed parameters
const process_user_registration = async (
  user_data: UserRegistrationData
): Promise<RegistrationResult> => {
  // Validate input
  const validation_result = validate_user_data(user_data);
  if (!validation_result.is_valid) {
    return { success: false, errors: validation_result.errors };
  }

  try {
    // Process registration
    const user = await create_user(user_data);
    await send_welcome_email(user.email);

    return { success: true, user_id: user.id };
  } catch (error) {
    logger.error('User registration failed:', error);
    return { success: false, errors: ['Registration failed'] };
  }
};
```

#### Bad Example ❌
```typescript
// BAD: Unclear naming, no error handling, untyped
const doStuff = async (data) => {
  const u = await db.create(data);
  email(u.e);
  return u.id;
};
```

**Why the first example is better**:
- Clear, descriptive function names using snake_case (Agent OS standard)
- Proper input validation before processing
- Comprehensive error handling with logging
- TypeScript types for safety
- Returns structured results with success status

### Integration Example

**Purpose**: Demonstrate how components integrate together

```typescript
// Example: Full integration of [FEATURE_NAME] components

import { [COMPONENT_A] } from './components/[COMPONENT_A]';
import { [COMPONENT_B] } from './components/[COMPONENT_B]';
import { [SERVICE_NAME] } from './services/[SERVICE_NAME]';
import { [HOOK_NAME] } from './hooks/[HOOK_NAME]';

export const [IntegratedFeature] = () => {
  // Use custom hook for state management
  const {
    [state_value],
    [action_function],
    [loading],
    [error]
  } = [HOOK_NAME]();

  // Handle integration actions
  const handle_integration = async () => {
    try {
      // Service layer interaction
      const result = await [SERVICE_NAME].[method_name]([params]);

      // Update state through hook
      [action_function](result);
    } catch (err) {
      console.error('Integration failed:', err);
    }
  };

  return (
    <div>
      <[COMPONENT_A]
        data={[state_value]}
        onAction={handle_integration}
      />
      <[COMPONENT_B]
        loading={[loading]}
        error={[error]}
      />
    </div>
  );
};
```

**Key Integration Points**:
- Custom hooks manage shared state
- Service layer handles business logic
- Components remain presentational
- Error handling at integration boundaries

### Additional Resources

**Related Code Examples**:
- [RELATED_EXAMPLE_1]: See `[FILE_PATH_1]` for [DESCRIPTION_1]
- [RELATED_EXAMPLE_2]: See `[FILE_PATH_2]` for [DESCRIPTION_2]
- [RELATED_EXAMPLE_3]: See `[FILE_PATH_3]` for [DESCRIPTION_3]

**Code Style References**:
- See `standards/code-style.md` for Agent OS code style guidelines
- See `standards/best-practices.md` for development best practices
- See `standards/tech-stack.md` for technology choices and rationale

## Deep Analysis

This specification underwent ultra-thinking protocol analysis to ensure comprehensive quality:

### Analysis Artifacts
- **[Stakeholder Analysis](./analysis-stakeholder.md)**: Multi-stakeholder impact assessment covering Developer, Operations, User, Security, Business, and QA perspectives
- **[Scenario Exploration](./analysis-scenarios.md)**: Risk-prioritized scenarios across edge cases, failures, scale, security, user behavior, integration, and operational concerns
- **[Multi-Angle Review](./analysis-multi-angle.md)**: Comprehensive review from Technical Excellence, Business Value, Risk Management, Team Collaboration, UX, and Long-term Vision angles

### Key Findings Summary

#### Stakeholder Impact Ratings
- **Developer Impact**: [RATING/5] ⭐ - [BRIEF_SUMMARY]
- **Operations Impact**: [RATING/5] ⭐ - [BRIEF_SUMMARY]
- **User Impact**: [RATING/5] ⭐ - [BRIEF_SUMMARY]
- **Security Impact**: [RATING/5] ⭐ - [BRIEF_SUMMARY]
- **Business Impact**: [RATING/5] ⭐ - [BRIEF_SUMMARY]
- **Quality Impact**: [RATING/5] ⭐ - [BRIEF_SUMMARY]

#### Critical Scenarios Identified
**High Risk (P1)**: [COUNT] scenarios
- [P1_SCENARIO_1]: [MITIGATION_APPROACH]
- [P1_SCENARIO_2]: [MITIGATION_APPROACH]
- [P1_SCENARIO_3]: [MITIGATION_APPROACH]

**Medium Risk (P2)**: [COUNT] scenarios
**Low Risk (P3)**: [COUNT] scenarios

#### Multi-Angle Review Results
**Overall Rating**: [AVERAGE_RATING/5] ⭐
**Recommendation**: [✅ Proceed / ⚠️ Proceed with Caution / ❌ Needs Revision]

**Critical Issues Addressed**:
1. [CRITICAL_ISSUE_1]: [HOW_ADDRESSED]
2. [CRITICAL_ISSUE_2]: [HOW_ADDRESSED]

**Important Improvements Incorporated**:
1. [IMPROVEMENT_1]
2. [IMPROVEMENT_2]

### Implementation Readiness Checklist
- [ ] Technical architecture is sound
- [ ] Business value is clear and measurable
- [ ] Risks are identified and mitigated
- [ ] Team can execute with available skills/resources
- [ ] User experience meets quality standards
- [ ] Long-term maintainability is acceptable

**Ready for Implementation**: [YES/NO/CONDITIONAL]

## Risk Mitigation

### Technical Risks
| Risk | Impact | Probability | Mitigation Strategy |
|------|--------|-------------|-------------------|
| [RISK_1] | [IMPACT_1] | [PROB_1] | [MITIGATION_1] |
| [RISK_2] | [IMPACT_2] | [PROB_2] | [MITIGATION_2] |
| [RISK_3] | [IMPACT_3] | [PROB_3] | [MITIGATION_3] |

### Contingency Plans
- **Plan A**: [PRIMARY_APPROACH]
- **Plan B**: [FALLBACK_APPROACH]
- **Plan C**: [EMERGENCY_APPROACH]

## Timeline & Milestones

### Development Timeline
```
Week 1: [WEEK_1_GOALS]
Week 2: [WEEK_2_GOALS]
Week 3: [WEEK_3_GOALS]
Week 4: [WEEK_4_GOALS]
```

### Key Milestones
- [ ] **Milestone 1** ([DATE_1]): [MILESTONE_1_DESCRIPTION]
- [ ] **Milestone 2** ([DATE_2]): [MILESTONE_2_DESCRIPTION]
- [ ] **Milestone 3** ([DATE_3]): [MILESTONE_3_DESCRIPTION]
- [ ] **Final Delivery** ([DELIVERY_DATE]): [FINAL_DELIVERABLE]

## Resources & Documentation

### Technical Documentation
- [DOC_LINK_1]: [DOC_DESCRIPTION_1]
- [DOC_LINK_2]: [DOC_DESCRIPTION_2]
- [DOC_LINK_3]: [DOC_DESCRIPTION_3]

### External Resources
- [RESOURCE_1]: [RESOURCE_DESCRIPTION_1]
- [RESOURCE_2]: [RESOURCE_DESCRIPTION_2]
- [RESOURCE_3]: [RESOURCE_DESCRIPTION_3]

---

**Template Version**: 2.0.0
**Last Updated**: [CURRENT_DATE]
**Next Review**: [REVIEW_DATE]