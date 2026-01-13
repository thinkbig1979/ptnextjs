---
version: 5.1.0
last-updated: 2026-01-02
related-files:
  - instructions/core/create-spec.md
---


# Step 10: Create Technical Spec

**Subagent**: file-creator

File: `{AGENT_OS_ROOT}/.agent-os/specs/YYYY-MM-DD-spec-name/sub-specs/technical-spec.md`

---

## Template

```markdown
# Technical Specification

## Feature Classification

**Feature Type**: [BACKEND_ONLY | FRONTEND_ONLY | FULL_STACK]
**Frontend Required**: [YES | NO]
**Backend Required**: [YES | NO]
**Justification**: [why]

---

## Frontend Implementation (if applicable)

### UI Components

#### **[COMPONENT_1]**
- Type: [Page | Form | Modal | Card | List]
- Purpose: [User problem solved]
- Interactions: [Click, submit, select]
- State: [Local | Global | API]
- Routing: [URL path]

### Frontend State Management

**Pattern**: [Context API | Pinia | Zustand | Redux]

**Stores**:
- **[STORE]**: [What manages]
  - Shape: [TypeScript interface/JSON]
  - Actions: [List]
  - Computed: [Derived state]

### Frontend Routing

**Routes**:
- **[PATH]**: [Component] - [Purpose]

**Guards**: [Auth/authz requirements]

### UI Specifications

**Design**:
- Responsive: [mobile, tablet, desktop]
- Accessibility: [WCAG 2.1 AA]
- Loading: [How show async]
- Error: [How display errors]
- Empty: [What when no data]

**Form Validations** (if applicable):
- **[FIELD]**: [Rules]

### Component Architecture

**Strategy**: {DETECTED_FROM_TECH_STACK}

{IF component_library in tech_stack}
**Library**: {NAME} ({VERSION})

**Components to Use**:
- **{COMPONENT}** (`{IMPORT}`): {PURPOSE}
  - Usage: {USE_CASES}
  - Variants: {VARIANTS}
  - Props: {KEY_PROPS}

**Custom** (built on library):
- **{CUSTOM}**: Combines {base} for {purpose}
  - Built from: {COMPONENTS}
  - Purpose: {USE_CASE}
  - Props: {PROPS}

{ELSE}
**Library**: None (custom)

**Base Primitives**:
- **Button**: Reusable button
  - Props: variant, size, disabled, loading, onClick
  - Styling: {CSS_APPROACH}
  - States: default, hover, active, disabled, loading

- **Card**: Container for grouping
  - Props: title, children, actions, footer
  - Styling: {CSS_APPROACH}

- **Modal**: Overlay dialog
  - Props: isOpen, onClose, title, children
  - Implementation: Portal with backdrop

- **Form**: Input, Select, Checkbox, Radio, Textarea
  - Validation: {LIBRARY_OR_CUSTOM}
  - Error handling: {APPROACH}

**Custom Complex**:
- **{COMPONENT}**: {DESCRIPTION}
  - Built from: {PRIMITIVES}
  - Purpose: {USE_CASE}
{ENDIF}

### Page Layout Architecture

**Approach**: {DETECTED_FROM_TECH_STACK}

**Global Layout**:
```
+-------------------------+
|  Header (h-{HEIGHT})    |
+------+------------------+
|{NAV} |  Main Content    |
+------+------------------+
```

**Implementation**:
{IF library_has_layout}
- Using: {LIBRARY_LAYOUT_COMPONENTS}
- Grid: {CONFIGURATION}
- Breakpoints: {RESPONSIVE}
{ELSE}
- Using: CSS Grid for page, Flexbox for components
- Grid: {COLUMNS, GAP, RESPONSIVE}
- Breakpoints: {from tech-stack or 640px, 1024px}
{ENDIF}

**Page-Specific**:

#### {PAGE} Layout
- Pattern: [Dashboard Grid | Form Centered | List+Detail | Master-Detail | Wizard]
- Structure:
  ```
  - Header: {BREADCRUMBS, TITLE, ACTIONS}
  - Main: {PRIMARY_SECTIONS}
  - Sidebar: {FILTERS, METADATA} (if applicable)
  ```
- Responsive:
  - Desktop (>=1024): {3-col, full sidebar}
  - Tablet (640-1024): {2-col, collapsible sidebar}
  - Mobile (<640): {Single col, drawer}

**Component Hierarchy**:
```
{PageComponent}
+-- {HeaderComponent}
|   +-- {Breadcrumbs}
|   +-- {PageTitle}
|   +-- {ActionButtons}
+-- {MainContent}
|   +-- {Component1}
|   +-- {Component2}
+-- {Sidebar}
```

### Navigation Architecture

**Pattern**: {DETECTED or Hybrid}

**Structure**:
```
{Primary Nav}
+-- {Route1} ({PATH})
+-- {Route2} ({PATH})
|   +-- {SubRoute1}
|   +-- {SubRoute2}
+-- {UserMenu}
```

**Implementation**:
{IF library_has_nav}
- Primary: {LIBRARY_NAV_COMPONENT}
- Mobile: {LIBRARY_MOBILE_MENU}
- Breadcrumbs: {LIBRARY_BREADCRUMB}
- User Menu: {LIBRARY_DROPDOWN}
{ELSE}
- Primary: Custom {NavSidebar | NavBar}
  - Structure: {DESCRIPTION}
  - Styling: {CSS_APPROACH}
  - Mobile: {DRAWER/OVERLAY}
- Breadcrumbs: Custom
  - Generation: {AUTO | MANUAL}
- User Menu: Custom dropdown
  - Trigger: {AVATAR_CLICK | USERNAME_CLICK}
{ENDIF}

**Components**:

{IF sidebar_nav}
- **{MainNav}**: Sidebar
  - Position: {fixed-left | sticky}
  - Width: {240px desktop, full mobile overlay}
  - Active: {HIGHLIGHT_APPROACH}
  - Collapsible: {YES/NO}
  - Mobile: {OVERLAY_DRAWER}
{ENDIF}

{IF top_bar}
- **{TopNav}**: Horizontal bar
  - Layout: {FLEX_DESCRIPTION}
  - Sticky: {YES/NO}
  - Mobile: {HAMBURGER | STACK}
{ENDIF}

- **{Breadcrumbs}**: On {all | specific}
  - Pattern: {Home > Section > Page}
  - Implementation: {LIBRARY | CUSTOM}

- **{UserMenu}**: Account dropdown
  - Location: {top-right}
  - Trigger: {INTERACTION}
  - Items: {LIST}

**State**:
- Active Route: {ROUTER_HOOK | MANUAL}
- Mobile Menu: {LOCAL | GLOBAL}
- Breadcrumb Data: {AUTO | MANUAL}

### User Flow & Interaction

**Primary Flows**:

#### Flow {N}: {NAME}
1. **Start**: {PAGE}
2. **Trigger**: {ACTION} - Click "{TEXT}" ({COMPONENT from library/custom})
3. **Action**: {WHAT_HAPPENS}
   - {IF nav}: Navigate to {ROUTE}
   - {IF modal}: Open {MODAL}
   - {IF state}: Update {STATE}
4. **Loads**: {COMPONENT} renders
   - Uses {FORM/DISPLAY_COMPONENTS}
   - Validation: {APPROACH}
   - Loading: {INDICATOR}
5. **Interaction**: {WHAT_USER_DOES}
   - Real-time: {VALIDATION, SUGGESTIONS}
   - Errors: {HOW_DISPLAYED}
6. **Submit**: {FINAL_ACTION}
   - Loading: {BUTTON_SPINNER, OVERLAY}
   - API: {METHOD} {ENDPOINT}
7. **Success**:
   - Notification: {TOAST/ALERT from library/custom}
   - Navigation: {WHERE}
   - UI: {CHANGES}
8. **Error**:
   - Display: {COMPONENT_LOCATION}
   - Form: {PRESERVED | CLEARED}
   - Recovery: {WHAT_USER_CAN_DO}

**Component Interaction**:

- **{PATTERN}** (Master-Detail, Modal Workflow, etc):
  - {COMPONENT_A} (using {LIBRARY or custom}) ->
  - User: {CLICK, SELECT} ->
  - {COMPONENT_B} {displays, updates, navigates}
  - State: {HOW_COMMUNICATE}
  - Data: {COMPONENT_A -> STATE -> COMPONENT_B}

**Form Submission** (standardized):
1. User fills ({FORM_IMPLEMENTATION: library/custom})
2. Client validation: {LIBRARY and APPROACH}
3. Submit button: {LOADING_STATE}
4. API: {METHOD} {ENDPOINT}
5. Success: {NOTIFICATION} + {NAVIGATION/UPDATE}
6. Error: {ERROR_DISPLAY} + {FORM_HANDLING}

### Component Integration Map

**How Components Work Together**:

#### {FEATURE} Integration
```
User Action: {INITIAL}
|
{PAGE_COMPONENT} {WHAT_DOES}
|
Data flows:
  +-> {CHILD_1} (receives {DATA})
  +-> {CHILD_2} (receives {DATA})
  +-> {CHILD_3} (receives {DATA})
|
User interacts: {INTERACTION}
|
{RESULTING_ACTION}
```

#### Page -> Container -> Presentational
```
{PageComponent} (manages routing, fetches data)
  | passes data props
{ContainerComponent} (manages state, handles events)
  | passes data + handlers
{PresentationalComponent} (displays only, emits events)
  ^ emits interaction events
{ContainerComponent} (handles events, updates state/calls API)
  ^ updates page state
{PageComponent}
```

**State Flow**:
- **Global** ({STATE_SOLUTION}):
  - Auth, user prefs, theme
  - Accessed: {HOW}

- **Shared** (props/context):
  - {PARENT} manages
  - Passes to: {CHILDREN}

- **API Data**:
  - Fetched: {WHERE}
  - Cached: {STRATEGY}
  - Shared: {METHOD}

---

## Backend Implementation (if applicable)

### API Endpoints

#### **[METHOD] [ENDPOINT]**

**Purpose**: [What does]
**Authentication**: [Required | Public]
**Authorization**: [Role requirements]

**Request**:
```typescript
interface RequestBody {
  field1: string
  field2: number
}
interface QueryParams {
  param1?: string
}
```

**Response**:
```typescript
interface SuccessResponse {
  success: true
  data: { /* shape */ }
}
interface ErrorResponse {
  success: false
  error: {
    code: string
    message: string
  }
}
```

**Status Codes**:
- 200: Success
- 400: Validation error
- 401: Unauthorized
- 403: Forbidden
- 500: Server error

### Business Logic

**Core Rules**:
1. [Rule 1]
2. [Rule 2]

**Validation**:
- Server-side: [What validate]
- Data Integrity: [Uniqueness, referential integrity]
- Business Constraints: [Domain rules]

**Service Layer**:
- **[SERVICE]**: [Responsibility]
  - Methods: [List]
  - Dependencies: [What depends on]

### Database Schema

**Tables/Collections**:

#### **[TABLE]**
```sql
CREATE TABLE table_name (
  id UUID PRIMARY KEY,
  field1 VARCHAR(255) NOT NULL,
  field2 INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_field1 ON table_name(field1);
```

**Relationships**: [Description]
**Migrations**: [What migrations needed]

---

## Frontend-Backend Integration (if full-stack)

### API Contract

**Owner**: Backend provides, Frontend consumes

**Type Sharing**:
- [Shared TypeScript package]
- [OpenAPI/Swagger codegen]
- [Manual definitions]

**Data Flow**:
1. User action in Frontend ->
2. API call to Backend ->
3. Backend processes/responds ->
4. Frontend updates UI

### Integration Points

**Frontend Calls Backend For**:
- [User action] -> [API endpoint]

**Error Handling**:
- Network: [How frontend handles failures]
- Validation: [How backend errors displayed]
- Auth: [Redirect to login, token refresh]

### Testing Strategy

**Frontend**:
- Unit: components
- Integration: state management
- Mock: backend API responses

**Backend**:
- Unit: business logic
- Integration: API endpoints
- Database: integration tests

**E2E**:
- Full workflows UI -> DB
- Critical path scenarios
- Error handling scenarios

---

## Implementation Architecture

### Component Structure

#### **[PRIMARY_COMPONENT]**
- Responsibilities: [LIST]
- Implementation: [APPROACH]
- Dependencies: [LIST]
- Interfaces: [CONTRACTS]

### Data Flow

1. **[STEP_1]**: [DETAILS] ->
2. **[STEP_2]**: [DETAILS] ->
3. **[STEP_3]**: [DETAILS]

### State Management

**Pattern**: [PATTERN]
**Implementation**: [DETAILS]

**Stores**:
- **[STORE_1]**: [STRUCTURE]
- **[STORE_2]**: [STRUCTURE]

### Error Handling

**Strategy**: [STRATEGY]

**Scenarios**:
- **[SCENARIO_1]**: [HANDLING]
- **[SCENARIO_2]**: [HANDLING]

**Format**:
```json
{
  "success": false,
  "error": {
    "code": "[CODE]",
    "message": "[USER_FRIENDLY]",
    "details": "[TECHNICAL]",
    "timestamp": "[ISO]"
  }
}
```

## Integration Points

### Existing Code Dependencies

#### **[DEPENDENCY_1]**
- Purpose: [WHY]
- Interface: [REQUIREMENTS]
- Data exchange: [DETAILS]
- Error handling: [APPROACH]

### API Contracts

#### **[METHOD] [ENDPOINT]**

**Purpose**: [WHAT]

**Request**:
```json
{
  "[FIELD_1]": "[TYPE_1]",
  "[FIELD_2]": "[TYPE_2]"
}
```

**Response**:
```json
{
  "[FIELD_1]": "[TYPE_1]"
}
```

**Errors**: [DETAILS]

### Database Interactions

#### **[TABLE]**

**Operations**: [LIST]

**Queries**:
- **[QUERY_1]**: [IMPLEMENTATION]

**Indexes**: [LIST]
**Constraints**: [LIST]

### External Services

#### **[SERVICE]**

**Protocol**: [PROTOCOL]
**Authentication**: [METHOD]

**Endpoints**:
- **[ENDPOINT_1]**: [USAGE]

**Rate Limiting**: [LIMITS]
**Error Handling**: [APPROACH]
**Timeout**: [SETTINGS]

## Implementation Patterns

### Design Patterns

**Primary**:
- **[PATTERN]**: [USAGE_GUIDANCE]

**Rationale**: [JUSTIFICATION]

### Code Organization

```
[ROOT]/
+-- src/
|   +-- components/
|   |   +-- [FEATURE_COMPONENTS]/
|   +-- services/
|   |   +-- [FEATURE_SERVICES]/
|   +-- utils/
|   |   +-- [FEATURE_UTILITIES]/
|   +-- types/
|   |   +-- [FEATURE_TYPES]/
|   +-- tests/
|       +-- [FEATURE_TESTS]/
+-- docs/
    +-- [FEATURE_DOCS]/
```

**Guidelines**:
- Components: [STRUCTURE]
- Services: [STRUCTURE]
- Utilities: [STRUCTURE]
- Tests: [STRUCTURE]

### Naming Conventions

- Components: [PATTERN]
- Services: [PATTERN]
- Utilities: [PATTERN]
- Types: [PATTERN]
- Constants: [PATTERN]

**Variables**:
- Functions: [CONVENTION]
- Variables: [CONVENTION]
- Methods: [CONVENTION]

### Coding Standards

Reference: `@.agent-os/standards/best-practices.md`

**Key Standards**:
- Indentation: 2 spaces (never tabs)
- Line length: Max 100 chars
- Comments: Explain "why" not "what"
- Error handling: Always include proper handling
- Type safety: Use TypeScript where applicable

**Quality**:
- Test coverage: Min 80% for new code
- Documentation: All public APIs documented
- Performance: [STANDARDS]
- Security: [STANDARDS]

## Performance Criteria

### Response Time

**Target**: [TIME]
**Measurement**: [POINTS]
**Optimization**: [STRATEGIES]

### Throughput

**Target**: [THROUGHPUT]
**Load Testing**: [SCENARIOS]
**Scalability**: [REQUIREMENTS]

### Concurrency

**Concurrent Users**: [LIMIT]
**Resource Management**: [STRATEGY]
**Bottleneck Prevention**: [MEASURES]

## Security Requirements

### Authentication

**Method**: [METHOD]
**Token Management**: [STRATEGY]
**Session Handling**: [APPROACH]

### Authorization

**Model**: [MODEL]
**Permission Validation**: [STRATEGY]
**Access Control**: [IMPLEMENTATION]

### Data Protection

**Encryption**: [STANDARD]
**Data at Rest**: [PROTECTION]
**Data in Transit**: [PROTECTION]
**Sensitive Data**: [HANDLING]

### Input Validation

**Approach**: [APPROACH]
**Sanitization**: [RULES]
**Injection Prevention**: [MEASURES]

## Quality Validation

### Technical Depth

- Implementation Readiness: Sufficient detail for immediate implementation
- Technical Accuracy: Validated for accuracy/feasibility
- Completeness: All required details present

### Integration

- Compatibility: Compatible with existing codebase/architecture
- Dependencies: All identified, integration points defined
- API Contracts: Consistent and complete

### Performance

- Benchmarks: Measurable and achievable
- Resources: Validated requirements/optimizations
- Scalability: Realistic and well-defined

### Security

- Standards Compliance: Verified
- Vulnerability Assessment: Identified/addressed
- Auth/Authz: Secure implementation

## Technical Requirements

- [REQUIREMENT_1]
- [REQUIREMENT_2]

## External Dependencies (Conditional)

[ONLY_IF_NEW_DEPENDENCIES]
- **[LIBRARY]** - [PURPOSE]
- Justification: [REASON]
- Version: [SPECIFICATIONS]
```
