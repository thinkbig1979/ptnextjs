---
version: 5.1.0
last-updated: 2026-01-02
related-files:
  - instructions/core/create-spec.md
---


# Step 9.5: Create UX/UI Spec (Conditional)

**Subagent**: file-creator

**Condition**: `IF spec_requires_frontend_or_ui`

File: `{AGENT_OS_ROOT}/.agent-os/specs/YYYY-MM-DD-spec-name/sub-specs/ux-ui-spec.md`

**CRITICAL**: Architecture-first approach. Specifying components WITHOUT navigation = unusable feature.

**Template**: `@.agent-os/instructions/utilities/ux-ui-specification-checklist.md`

---

## Phase 1: Application Architecture (REQUIRED FIRST)

### 1.1 Feature Classification
```
**Feature Type**: [FULL_STACK | FRONTEND_ONLY | BACKEND_ONLY]
**Frontend Required**: [YES | NO]
**Backend Required**: [YES | NO]
**Justification**: [why]
```

### 1.2 Route Structure
```
/route-path-1                -> [Page] - [Purpose]
/route-path-2/:id            -> [Page] - [Purpose]

**Integration**: [how integrates with existing nav]
**Parent Route**: [if nested]
**Guards**: [auth requirements]

NEVER: "Routes (TBD)"
ALWAYS: Explicit list with exact paths
```

### 1.3 Global Layout Integration
```
**Strategy**: [NEW_LAYOUT | EXTEND_EXISTING | USE_EXISTING]

IF NEW_LAYOUT:
+---------------------------------+
| Header: [HEIGHT] [STICKY] [CONTENTS] |
+----------+----------------------+
| Sidebar  | Main Content         |
| [WIDTH]  | [MAX-WIDTH] [SCROLL] |
+----------+----------------------+

**Components**:
- [FILE_PATH]: [Component] - [Purpose]

IF EXTEND_EXISTING:
- Existing: [FILE_PATH]
- Modifications: [changes]
- New: [FILE_PATHs]

IF USE_EXISTING:
- Existing: [FILE_PATH]
- No changes

NEVER: "Layout (TBD)"
ALWAYS: Explicit decision with paths
```

### 1.4 Navigation Structure
```
**Primary Nav**: [HOW_FEATURE_APPEARS]
**Component**: [FILE_PATH]

**Items to Add/Modify**:
- **[Label]**: [Route] - [Icon] - [Position]

**Active State**: [ROUTER_HOOK | MANUAL_STATE]
**Mobile**: [HAMBURGER | BOTTOM_TABS | COLLAPSIBLE]
  - Breakpoint: [PIXELS]
  - Component: [FILE_PATH]

**Breadcrumbs** (if applicable):
- Pattern: [HOME > SECTION > PAGE]
- Generation: [AUTO | MANUAL]
- Component: [FILE_PATH]

**Entry Points**:
1. [Entry Point 1]: [How accessed] - [From where]
2. [Entry Point 2]: [Alternative]

NEVER: "Navigation (TBD)"
ALWAYS: Explicit items with labels/routes/positioning
```

### 1.5 User Flow Architecture
```
#### Flow 1: [NAME]
1. **Start**: [PAGE] at [ROUTE]
2. **Trigger**: [ACTION] - Click "[TEXT]" ([COMPONENT])
3. **Navigation**: Navigate to [ROUTE] or [MODAL]
4. **Page Loads**: [COMPONENT] renders with [DATA]
5. **User Interaction**: [WHAT_USER_DOES]
6. **Validation**: [CLIENT_SIDE_APPROACH]
7. **Submit**: [WHAT_HAPPENS] - [API_CALL]
8. **Success**:
   - Notification: [TOAST/ALERT] with "[MESSAGE]"
   - Navigation: [WHERE_NEXT]
   - UI Update: [WHAT_CHANGES]
9. **Error**:
   - Display: [HOW_SHOWN]
   - Form State: [PRESERVED | CLEARED]
   - Recovery: [CAN_RETRY | MUST_START_OVER]

NEVER: "User clicks somewhere"
ALWAYS: Step-by-step with exact components/routes/states
```

---

## Phase 2: Layout Systems (REQUIRED SECOND)

### 2.1 Container Specifications
```tsx
<div className="max-w-[MAX] mx-auto px-[MOBILE] md:px-[TABLET] lg:px-[DESKTOP] py-[MOBILE] md:py-[TABLET] lg:py-[DESKTOP]">
```

| Breakpoint | H Padding | V Padding | Max Width | Tailwind |
|------------|-----------|-----------|-----------|----------|
| Mobile (<768) | [PX] | [PX] | [VALUE] | px-[X] py-[Y] |
| Tablet (768-1023) | [PX] | [PX] | [VALUE] | md:px-[X] md:py-[Y] |
| Desktop (>=1024) | [PX] | [PX] | [VALUE] | lg:px-[X] lg:py-[Y] max-w-[X] |

NEVER: "Card padding: 20px" (no responsive/classes)
ALWAYS: Full responsive spec with Tailwind

### 2.2 Spacing System

| Context | Desktop | Tablet | Mobile | Tailwind | Use Case |
|---------|---------|--------|--------|----------|----------|
| Page container H | [PX] | [PX] | [PX] | px-[X] md:px-[Y] | Outer margins |
| Page container V | [PX] | [PX] | [PX] | py-[X] md:py-[Y] | Top/bottom |
| Section spacing | [PX] | [PX] | [PX] | space-y-[X] md:space-y-[Y] | Between sections |
| Card padding | [PX] | [PX] | [PX] | p-[X] md:p-[Y] | Internal |
| Card grid gaps | [PX] | [PX] | [PX] | gap-[X] md:gap-[Y] | Between cards |

### 2.3 Typography System

**H1 - Page Title**
```tsx
<h1 className="text-[SIZE] font-[WEIGHT] leading-[HEIGHT] text-gray-900 dark:text-gray-50">
```
- Size: [PX] ([REM])
- Weight: [NUMBER] ([NAME])
- Line Height: [VALUE]
- Use: Once per page
- Spacing After: [PX] (`mb-[X]`)

**H2 - Section Header**
- Size: [PX] ([REM])
- Weight: [NUMBER] ([NAME])
- Use: Major sections
- Spacing After: [PX] (`mb-[X]`)

**H3 - Subsection/Card**
- Size: [PX] ([REM])
- Weight: [NUMBER] ([NAME])
- Use: Cards, dialogs, subsections
- Spacing After: [PX] (`mb-[X]`)

**Body - Default**
```tsx
<p className="text-[SIZE] leading-[HEIGHT] text-gray-700 dark:text-gray-300">
```

**Body - Small**
```tsx
<p className="text-[SIZE] leading-[HEIGHT] text-gray-600 dark:text-gray-400">
```
- Use: Timestamps, metadata, auxiliary

**Hierarchy Rules**:
1. H1 largest - immediate focal point
2. H2 creates content blocks - [SPACING] before
3. H3 stands out - min [SPACING] after
4. Body comfortable reading line-height ([VALUE])
5. Metadata de-emphasized via size AND color

### 2.4 Page Layout Patterns

For each page:

```
#### [PAGE_NAME] Layout ([ROUTE])

**Pattern**: [Dashboard Grid | Form Centered | List + Detail | Master-Detail | Wizard]

**Structure**:
+-----------------------------+
| Header ([H1] [Actions])     |
+-----------------------------+
| Main Content                |
| - [GRID/FLEX]: [SPECS]      |
| - [RESPONSIVE]              |
|                             |
| Sidebar (if applicable):   |
| - Width: [VALUE]            |
+-----------------------------+

**Component Hierarchy**:
[PageComponent] ([FILE_PATH])
+-- [PageHeader] ([FILE_PATH])
|   +-- [Breadcrumbs]
|   +-- [H1 Title]
|   +-- [ActionButtons]
+-- [MainContent] ([GRID/FLEX])
|   +-- [Component1] ([FILE_PATH])
|   +-- [Component2] ([FILE_PATH])
+-- [Sidebar] ([FILE_PATH])

**Responsive**:
- Desktop (>=1024): [3-col grid, full sidebar]
- Tablet (768-1023): [2-col, collapsible sidebar]
- Mobile (<768): [Single col, drawer]

**Implementation**:
```tsx
<div className="[CONTAINER_CLASSES]">
  <header className="[HEADER_CLASSES]">
    <h1 className="[H1_CLASSES]">[Title]</h1>
    <div className="[ACTIONS_CLASSES]">
      {/* Actions */}
    </div>
  </header>
  <div className="[LAYOUT_CLASSES]">
    {/* Content */}
  </div>
</div>
```

---

## Phase 3: Component Patterns (REQUIRED THIRD)

### 3.1 Component Library Strategy

**Library**: [NAME | Custom]

**IF using library**:

| Component | Import | Purpose | Variants | Props | Usage |
|-----------|--------|---------|----------|-------|-------|
| Button | `import { Button } from '[PATH]'` | [purpose] | primary, secondary, destructive | variant, size, disabled, loading | form submit, actions |
| Card | `import { Card, CardHeader } from '[PATH]'` | [purpose] | - | className | content grouping |

**Example**:
```tsx
<Button variant="primary" size="md" onClick={handleSubmit}>
  Submit
</Button>
```

**Custom Components** (built on library):
- **[NAME]**: Combines [base] for [purpose]
  - Built from: [COMPONENTS]
  - Purpose: [USE_CASE]
  - File: [PATH]
  - Props: [PROPS]

**IF custom**:

**Base Primitives**:

**Button** ([FILE_PATH]):
- Props: variant, size, disabled, loading, onClick, children
- States:
  - Default: [STYLES with Tailwind]
  - Hover: [HOVER]
  - Active: [ACTIVE]
  - Disabled: [DISABLED]
  - Loading: [LOADING with spinner]
- Implementation:
```tsx
export function Button({ variant, size, disabled, loading, onClick, children }: ButtonProps) {
  return (
    <button
      className={cn(
        'base-classes',
        variant === 'primary' && 'primary-classes',
        disabled && 'disabled-classes'
      )}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading && <Spinner className="mr-2" />}
      {children}
    </button>
  )
}
```

[Continue for Card, Modal, Form components]

**Styling**: [CSS Modules | Tailwind | Styled Components | CSS-in-JS]

### 3.2 Component Specifications

For EACH component:

```
#### [COMPONENT_NAME] (e.g., TemplateCard)

**Purpose**: [User problem solved]
**File**: [FILE_PATH]

**Props**:
```typescript
interface [Name]Props {
  prop1: type
  prop2: type
  onAction?: () => void
}
```

**Structure & Spacing**:
```tsx
<Card className="p-[VALUE] space-y-[VALUE]">
  <CardHeader className="pb-[VALUE] border-b border-gray-[VALUE]">
    <CardTitle className="[TYPOGRAPHY]">[Title]</CardTitle>
    <div className="flex gap-[VALUE] text-[SIZE]">
      [Metadata]
    </div>
  </CardHeader>
  <CardContent className="pt-[VALUE] space-y-[VALUE]">
    <p className="[TYPOGRAPHY] line-clamp-[VALUE]">[Description]</p>
  </CardContent>
  <CardFooter className="pt-[VALUE] border-t flex justify-between">
    <div className="flex gap-[VALUE]">[Actions]</div>
    <p className="text-[SIZE] text-gray-[VALUE]">[Timestamp]</p>
  </CardFooter>
</Card>
```

**Spacing Breakdown**:
- Card padding: [PX] (`p-[VALUE]`)
- Header bottom: [PX] (`pb-[VALUE]`) + border
- Title to metadata: [PX] (`space-y-[VALUE]`)
- Content top/bottom: [PX] (`pt-[VALUE]`, `pb-[VALUE]`)
- Actions gap: [PX] (`gap-[VALUE]`)

**State Variations**:
- Default: [BASE]
- Hover: `hover:shadow-md hover:-translate-y-0.5 transition-all duration-150`
- Active: [ACTIVE]
- Disabled: `opacity-50 cursor-not-allowed`
- Loading: [SKELETON/SPINNER]
- Error: `border-red-500 bg-red-50`
- Empty: [EMPTY_STATE]

**Responsive**:
- Desktop: [FULL_SPEC]
- Tablet: [ADJUSTMENTS]
- Mobile: [MOBILE_LAYOUT]

**Accessibility**:
- ARIA: [LABELS]
- Keyboard: [TAB_ORDER, ENTER]
- Screen reader: [ANNOUNCEMENTS]
- Focus: [FOCUS_RING]

**Integration**:
```tsx
// In TemplateLibraryPage
<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
  {templates.map(t => (
    <TemplateCard
      key={t.id}
      title={t.title}
      onUse={() => handleUse(t.id)}
    />
  ))}
</div>
```

NEVER: "Card with padding and title"
ALWAYS: Complete spec with markup, spacing, states, responsive, a11y, integration

[Repeat for EVERY component]
```

---

## Phase 4: Interaction Patterns (REQUIRED LAST)

### 4.1 Interactive States

**Hover**:
- Buttons: `hover:bg-[COLOR] hover:shadow-md transition-colors duration-150`
- Cards: `hover:shadow-lg hover:-translate-y-1 transition-all duration-200`
- Links: `hover:text-[COLOR] hover:underline transition-colors duration-100`

**Active**:
- Buttons: `active:scale-95 transition-transform duration-75`
- Cards: `active:shadow-sm active:translate-y-0 transition-all duration-75`

**Focus** (WCAG 2.1 AA):
- All interactive: `focus:outline-none focus:ring-2 focus:ring-[COLOR] focus:ring-offset-2`
- Keyboard: Tab order follows visual hierarchy

**Loading**:
- Buttons: [SPINNER, disabled]
- Pages: [SKELETON/SPINNER]
- Components: [SHIMMER/PULSE]

**Error**:
- Fields: `border-red-500 text-red-900 placeholder-red-300 focus:ring-red-500`
- Inline: `text-sm text-red-600 mt-1`
- Banners: [ALERT with error styling]

**Empty**:
- Lists: [ILLUSTRATION, HEADING, DESCRIPTION, CTA]
- Search: [MESSAGE, SUGGESTIONS, CLEAR_BUTTON]
- First-time: [ONBOARDING, TUTORIAL_LINK]

### 4.2 Animations

**Page Transitions**:
- Route changes: [FADE/SLIDE/NONE]
- Duration: [MS]
- Easing: [EASE_IN_OUT/LINEAR/CUBIC_BEZIER]

**Component Animations**:
- Modal: `transition-opacity duration-300 ease-in-out` + `transition-transform duration-300`
- Dropdown: `transition-all duration-200 ease-out`
- Toast: Slide from [TOP_RIGHT/BOTTOM_RIGHT], fade after [SECONDS]

**Micro-interactions**:
- Button press: `active:scale-95`
- Card hover: `hover:-translate-y-1` + shadow
- Checkbox: [ANIMATION 150ms]
- Spinner: [ROTATION infinite]

**Performance**:
- GPU: Use `transform`/`opacity` (not `top`/`left`/`width`/`height`)
- Will-change: Sparingly on frequently animated
- Reduced motion: Respect `prefers-reduced-motion`

### 4.3 Form Validation

**Approach**: [Zod | Yup | CUSTOM]

**Timing**:
- On blur: Validate when user leaves field
- On submit: Validate entire form
- Real-time (optional): Password strength, username availability

**Error Display**:
- Inline: Below each invalid field
- Summary: Top of form if multiple errors
- Highlighting: Red border on invalid

**Success**:
- Toast: "[ACTION] successful" with checkmark
- Redirect: Navigate to [PAGE] after [DELAY]
- UI update: Show created/updated item immediately

---

## Validation Gates

**Phase 1**:
- [ ] All routes explicit (no "TBD")
- [ ] Navigation fully specified (no "if exists")
- [ ] Layout integration defined (NEW|EXTEND|USE)
- [ ] User entry points identified
- [ ] User flows step-by-step

**Phase 2**:
- [ ] Container specs with responsive
- [ ] Spacing usage matrix with Tailwind
- [ ] Typography with hierarchy rules
- [ ] Page layouts with component hierarchy

**Phase 3**:
- [ ] Component library strategy
- [ ] All components: markup, spacing, states
- [ ] Accessibility for each
- [ ] Integration examples

**Phase 4**:
- [ ] Interactive states (hover, active, focus, loading, error, empty)
- [ ] Animations/transitions
- [ ] Form validation/feedback

**Code Readiness**:
**Question**: "Can developer implement without ANY questions?"
- [ ] No ambiguity
- [ ] No missing architectural decisions
- [ ] No conditional language for core ("if exists", "TBD")
- [ ] Complete code examples with Tailwind

**IF developer would ask questions: INCOMPLETE**

---

## Anti-Patterns

**NEVER**:
1. "If Exists" language ("Layout (TBD)", "Routes (if needed)")
2. Pixels without Tailwind ("padding: 20px" vs "p-5")
3. Missing responsive ("width: 1200px" vs "mobile 100%, desktop 1200px")
4. Vague components ("Use card" vs [full spec])
5. Polish before foundation (Day 1: animations, Day 8: realize no nav)

**ALWAYS**:
1. Explicit architectural decisions
2. Responsive with Tailwind classes
3. Complete component specs
4. Foundation -> Components -> Polish

---

## Success Indicators

- Zero clarification questions during implementation
- All architectural decisions explicit
- Complete code examples
- Usage matrices for design tokens
- Passed Code Readiness Test

## Failed Indicators

- "How should I..." questions
- "if exists", "TBD", "optional" for core
- Missing navigation/routing
- Pixels without Tailwind
- Ambiguous layout/spacing
