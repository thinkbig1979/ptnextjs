---
description: UX/UI Specification Completeness Checklist for Agent OS
version: 1.0
encoding: UTF-8
---

# UX/UI Specification Completeness Checklist

## Overview

This checklist ensures UX/UI specifications are **architecture-first, implementation-ready, and world-class**. It prevents catastrophic failures like missing navigation, unspecified layouts, or incomplete component patterns.

**Core Principle**: Specify foundation before aesthetics. Architecture → Layout → Components → Polish.

---

## Critical Pre-Specification Questions

### 1. Feature Classification
- [ ] **Backend required?** (API endpoints, database changes, business logic)
- [ ] **Frontend required?** (User interface, user input, data display)
- [ ] **Classification:** Full-stack | Backend-only | Frontend-only

**Rule**: Never proceed without explicit classification. "If exists" or "TBD" = specification failure.

---

## Phase 1: Application Architecture (REQUIRED FIRST)

### 1.1 Route Structure
- [ ] **All routes explicitly listed** (no "TBD" or conditional routes)
- [ ] **Route hierarchy defined** (parent-child relationships)
- [ ] **Route paths specified** (exact URL patterns)
- [ ] **Authentication requirements per route** (public, authenticated, role-based)
- [ ] **Example route map provided** (visual tree structure)

**Anti-Pattern**: "App Navigation Bar (if exists)" → FAILURE
**Correct**: "App Navigation Bar: Left sidebar, 280px fixed width, contains Dashboard, Templates, Settings"

### 1.2 Global Layout Shell
- [ ] **Header specification** (height, contents, sticky behavior, logo placement)
- [ ] **Sidebar specification** (width, position, items, collapse behavior) OR no sidebar decision made explicitly
- [ ] **Main content area** (max-width, padding, scroll behavior, centering)
- [ ] **Footer specification** (if applicable, or explicitly state "no footer")
- [ ] **Layout component file paths** (e.g., `components/layout/AppShell.tsx`)

**Required**: ASCII or visual diagram of global layout structure

### 1.3 Navigation Structure
- [ ] **Primary navigation type** (sidebar, top bar, hybrid, tabs)
- [ ] **Navigation items list** (every menu item with label and destination)
- [ ] **Active state behavior** (how current page is highlighted)
- [ ] **Mobile navigation** (hamburger menu, drawer, or responsive alternative)
- [ ] **Breadcrumbs** (when shown, how generated, example)
- [ ] **User menu** (location, trigger, items like Profile, Settings, Logout)
- [ ] **Navigation component file paths** (e.g., `components/layout/AppSidebar.tsx`)

**Required**: State management approach for navigation (router hook, manual state)

### 1.4 User Entry Points
- [ ] **How users access the application** (landing page, direct routes)
- [ ] **Default route defined** (where `/` leads)
- [ ] **Feature entry points** (how users navigate to each major feature)
- [ ] **Deep linking behavior** (if applicable)

---

## Phase 2: Layout Systems & Containers (REQUIRED SECOND)

### 2.1 Container Specification
- [ ] **Page container padding** (exact pixel values for desktop, tablet, mobile)
- [ ] **Page container max-width** (with specific breakpoints)
- [ ] **Section container specifications** (margins, padding, widths)
- [ ] **Responsive behavior** (how containers adapt at each breakpoint)
- [ ] **Tailwind class examples** (complete utility classes for each use case)

**Required Format**:
```tsx
// Page container example
<div className="max-w-7xl mx-auto px-4 py-8 md:px-8 md:py-12 lg:px-12 lg:py-16">
  {/* Content */}
</div>
```

### 2.2 Spacing System Implementation Guide
- [ ] **Complete spacing scale** (4px to 64px with use cases)
- [ ] **Usage matrix** (which spacing for which context: page padding, section gaps, card padding)
- [ ] **Responsive spacing adjustments** (how spacing changes at breakpoints)
- [ ] **Vertical rhythm rules** (spacing between stacked elements)
- [ ] **Code examples for every pattern** (copy-paste ready)

**Required Table**:
| Context                     | Desktop | Tablet | Mobile | Tailwind Classes           |
|-----------------------------|---------|--------|--------|----------------------------|
| Page container horizontal   | 48px    | 32px   | 16px   | px-4 md:px-8 lg:px-12     |
| Page container vertical     | 64px    | 48px   | 32px   | py-8 md:py-12 lg:py-16    |
| Section vertical spacing    | 64px    | 48px   | 32px   | space-y-8 md:space-y-12   |
| Card padding                | 24px    | 24px   | 16px   | p-4 md:p-6                |

### 2.3 Typography System Implementation Guide
- [ ] **Heading hierarchy** (H1-H6 with exact font sizes, weights, line heights)
- [ ] **Body text sizes** (default, small, metadata with use cases)
- [ ] **Visual hierarchy rules** (when to use each level, spacing guidelines)
- [ ] **Complete Tailwind class names** (no pixel-only values)
- [ ] **Dark mode text colors** (if applicable)
- [ ] **Usage examples with context** (page titles, section headers, card titles, body text)

**Required Format**:
```tsx
// H1 - Page Title
<h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900 dark:text-gray-50">
  Template Library
</h1>
// Use: Once per page, main page title
```

### 2.4 Page Layout Architecture
- [ ] **Layout pattern per page** (Dashboard Grid, Form Centered, List + Detail, Master-Detail, Wizard)
- [ ] **ASCII diagram of page structure** (header, sidebar, main content, footer)
- [ ] **Responsive behavior per breakpoint** (desktop, tablet, mobile layouts)
- [ ] **Component hierarchy** (parent-child component tree)
- [ ] **Grid/Flexbox specifications** (columns, gaps, alignment)

**Required**: Specific layout implementation examples with Tailwind classes

---

## Phase 3: Component Patterns (REQUIRED THIRD)

### 3.1 Component Library Strategy
- [ ] **Component library decision** (shadcn, custom, specific library)
- [ ] **Library components list** (if using library: which components, import paths, variants)
- [ ] **Custom components list** (if custom: base primitives to build)
- [ ] **Component integration approach** (how library components are customized)

**If using component library**:
- [ ] **Library components to use** (Button, Card, Modal, Form components with import paths)
- [ ] **Customization strategy** (theme overrides, wrapper components)
- [ ] **Props and variants** (which variants of each component: primary/secondary buttons, card styles)

**If custom components**:
- [ ] **Base UI primitives** (Button, Card, Input, Modal, etc. with full specifications)
- [ ] **Styling approach** (CSS Modules, Tailwind, CSS-in-JS with specifics)
- [ ] **State specifications** (default, hover, active, disabled, loading, error)

### 3.2 Component Specifications
For EACH component:
- [ ] **Component purpose** (what user problem it solves)
- [ ] **Complete markup example** (full JSX/HTML with classes)
- [ ] **All spacing values** (internal padding, margins, gaps)
- [ ] **All state variations** (default, hover, active, disabled, loading, error, empty)
- [ ] **Responsive behavior** (how component adapts at breakpoints)
- [ ] **Accessibility requirements** (ARIA labels, keyboard navigation, screen reader support)
- [ ] **Integration examples** (how component is used in context)

**Required Format for Cards**:
```tsx
<Card className="p-6 space-y-4">
  <CardHeader className="pb-4 border-b space-y-3">
    {/* Title and metadata */}
  </CardHeader>
  <CardContent className="py-4 space-y-4">
    {/* Description */}
  </CardContent>
  <CardFooter className="pt-4 border-t">
    {/* Actions */}
  </CardFooter>
</Card>
```
- Card padding: 24px all sides (`p-6`)
- Header elements: 12px spacing (`space-y-3`)
- Content elements: 16px spacing (`space-y-4`)
- Section dividers: 16px padding + 1px border

### 3.3 Navigation Components
- [ ] **Navigation component specifications** (sidebar nav, top bar nav, mobile drawer)
- [ ] **Active route highlighting** (how implemented: router hook, manual state)
- [ ] **Mobile responsive behavior** (collapse pattern, drawer, overlay)
- [ ] **Breadcrumbs implementation** (auto-generated or manual, pattern)
- [ ] **User menu implementation** (trigger, dropdown items, positioning)

### 3.4 Form Components
- [ ] **Form layout patterns** (vertical, horizontal, inline)
- [ ] **Input field specifications** (text, select, checkbox, radio, textarea with validation)
- [ ] **Form validation approach** (client-side library, custom, error display)
- [ ] **Submit button states** (default, loading, disabled, success, error)
- [ ] **Error display patterns** (inline, toast, alert banner)

---

## Phase 4: User Flows & Interaction Patterns (REQUIRED FOURTH)

### 4.1 User Flow Specifications
For EACH user flow:
- [ ] **Starting point** (which page/state user begins)
- [ ] **Step-by-step flow** (every user action and system response)
- [ ] **Component interactions** (which component renders, which events fire)
- [ ] **State changes** (how application state updates at each step)
- [ ] **Navigation changes** (route changes, page loads)
- [ ] **Loading states** (what user sees during async operations)
- [ ] **Success path** (notification, navigation, UI update)
- [ ] **Error path** (error display, form preservation, recovery action)

**Required Format**:
```
Flow: Create Template
1. Starting Point: Template Library page (/templates)
2. Trigger: Click "New Template" button (Button component from library)
3. Action: Navigate to /templates/new
4. Page Loads: CreateTemplateForm component renders
5. User Interaction: Fill form fields with validation
6. Submit: Button shows loading spinner
7. Success Path: Toast notification, navigate to /templates/:id
8. Error Path: Inline error messages, form data preserved
```

### 4.2 Component Interaction Patterns
- [ ] **Master-Detail pattern** (if applicable: how components communicate)
- [ ] **Modal workflow** (trigger, content, actions, dismissal)
- [ ] **Form submission pattern** (validation, loading, success, error standardized)
- [ ] **Data flow between components** (props drilling, context, state management)

### 4.3 Component Integration Map
- [ ] **How components work together** (parent-child data flow)
- [ ] **State management between components** (global state, shared state, prop passing)
- [ ] **API data flow** (where fetched, how cached, how shared)
- [ ] **Event handling patterns** (event bubbling, custom events, callbacks)

---

## Phase 5: Interaction Patterns & Polish (REQUIRED LAST)

### 5.1 Interactive States
- [ ] **Hover effects** (for buttons, cards, links with timing)
- [ ] **Active states** (click/press states with timing)
- [ ] **Focus states** (keyboard navigation with WCAG compliance)
- [ ] **Loading states** (spinners, skeletons, progress indicators)
- [ ] **Error states** (error messages, error boundaries, fallback UI)
- [ ] **Empty states** (no data scenarios with helpful messaging)

### 5.2 Animations & Transitions
- [ ] **Animation timings** (duration, easing functions)
- [ ] **Transition effects** (fade, slide, scale with specific values)
- [ ] **Micro-interactions** (button press, card hover, menu expand)
- [ ] **Performance considerations** (GPU acceleration, will-change)

---

## Critical Validation Gates

### Architecture Completeness (CRITICAL - DO NOT SKIP)
- [ ] All application routes explicitly defined (no "TBD")
- [ ] Navigation structure fully specified (no "if exists")
- [ ] Global layout completely specified (no conditional language)
- [ ] Page hierarchy defined (no implicit assumptions)
- [ ] User entry points identified (no guesswork)
- [ ] Authentication flows defined (if applicable)
- [ ] Error pages specified (404, 500, etc.)

**If ANY checkbox above is unchecked: SPECIFICATION IS INCOMPLETE. FIX BEFORE PROCEEDING.**

### Layout Completeness
- [ ] Container widths specified for all breakpoints
- [ ] Padding specified for all breakpoints
- [ ] Spacing between elements specified
- [ ] Responsive behavior defined
- [ ] Max-widths defined
- [ ] Overflow behavior specified

### Typography Completeness
- [ ] All heading levels defined (H1-H6)
- [ ] Body text sizes defined
- [ ] Line heights specified
- [ ] Letter spacing specified (if custom)
- [ ] Font weights specified
- [ ] Visual hierarchy rules documented
- [ ] Usage guidelines with examples

### Component Completeness
- [ ] All component states specified (default, hover, active, focus, disabled, loading, error)
- [ ] Internal spacing defined
- [ ] External spacing/margins defined
- [ ] Responsive behavior specified
- [ ] Accessibility requirements listed
- [ ] Code example provided
- [ ] Integration example provided

### Interaction Completeness
- [ ] All hover states defined
- [ ] All active states defined
- [ ] All focus states defined
- [ ] All loading states defined
- [ ] All error states defined
- [ ] Animation timings specified
- [ ] Transition easing specified

### Code Readiness Test (FINAL GATE)
**Critical Question**: Can a developer implement this without asking ANY questions?
- [ ] **No ambiguous descriptions** (all concrete and specific)
- [ ] **No missing decisions** (all architectural choices made)
- [ ] **No conditional language** (no "if exists", "TBD", "optional" for core features)
- [ ] **Complete code examples** (copy-paste ready with Tailwind classes)

**If developer needs to ask questions: SPECIFICATION IS INCOMPLETE.**

---

## The 5 Commandments of World-Class UX/UI Specifications

### 1. Thou Shalt Specify Architecture Before Aesthetics
- ✅ Route maps, navigation, and global layout come FIRST
- ❌ Animation timings and hover effects come LAST

### 2. Thou Shalt Not Use "If Exists" or "TBD" for Core Features
- ✅ Every architectural element must be explicitly specified
- ❌ Conditional language indicates incomplete thinking

### 3. Thou Shalt Provide Implementation-Ready Code Examples
- ✅ Abstract descriptions fail. Concrete code examples succeed.
- ✅ Include complete Tailwind class names, not just pixel values

### 4. Thou Shalt Create Usage Matrices for Design Tokens
- ✅ A spacing scale without usage guidance is useless
- ✅ Show developers EXACTLY which value to use in which context

### 5. Thou Shalt Validate Specifications Before Implementation
- ✅ Run the "Code Readiness Test": Can a developer implement this without questions?
- ❌ If no, the specification is incomplete. Fix it before coding begins.

---

## Specification Anti-Patterns (NEVER DO THESE)

### ❌ Anti-Pattern 1: "Specify Polish Before Foundation"
```
Day 1-3: Design pixel-perfect card components ❌
Day 4-5: Define hover animations ❌
Day 6-7: Specify color transitions ❌
Day 8:   Realize users can't navigate to the page ❌❌❌
```

### ✅ Correct Approach: "Foundation Before Aesthetics"
```
Day 1:   Define application architecture (shell, navigation, routes) ✅
Day 2:   Define page hierarchy and user flows ✅
Day 3:   Define layout systems and containers ✅
Day 4-5: Define component patterns ✅
Day 6-7: Define interaction patterns ✅
Day 8:   Define visual polish (animations, shadows, etc.) ✅
```

### ❌ Anti-Pattern 2: "Conditional Core Architecture"
**Dangerous Phrases**:
- "App Navigation Bar (if exists)" ❌
- "Header component (if needed)" ❌
- "Routing structure (to be determined)" ❌
- "Global layout (TBD)" ❌

**Correct Phrasing**:
- "App Navigation Bar: Left sidebar, 280px fixed width, contains..." ✅
- "Header component: Full-width sticky header with logo, search, user menu" ✅
- "Routing structure: /dashboard (home), /templates (library), /settings" ✅
- "Global layout: Sidebar + main content area with max-width 1400px" ✅

### ❌ Anti-Pattern 3: "Assumption of Implicit Knowledge"
**What Fails**:
- Specification assumes "app shell exists somewhere" ❌
- Roadmap assumes "navigation is handled elsewhere" ❌
- Tasks assume "users can access the page somehow" ❌

**Why This Fails**:
Different team members (or AI agents) working in isolation will make different assumptions. Result: Nobody builds it.

**Solution**:
Use this Explicit Completeness Checklist. Check every box. No assumptions.

---

## Usage Instructions

### For Specification Authors
1. **Before writing ANY UI specification**: Complete Phase 1 (Application Architecture)
2. **Phase 1 must pass Critical Validation Gates before proceeding**
3. **Work through phases in order**: 1 → 2 → 3 → 4 → 5
4. **Check every box in each phase**
5. **Run Code Readiness Test before marking specification complete**

### For Specification Reviewers
1. **Verify Phase 1 is complete first** (if not, reject immediately)
2. **Check for anti-patterns** (conditional language, missing decisions)
3. **Run Code Readiness Test**: "Can I implement this without asking questions?"
4. **If answer is 'no': Specification is incomplete, request revisions**

### For Task Creators
1. **Verify specification passed all validation gates**
2. **Reference specific sections when creating tasks**
3. **Ensure task sequence matches phase order**: Architecture → Layout → Components → Polish
4. **Include specification file paths in task context requirements**

### For Implementers
1. **If specification is incomplete: STOP and request specification completion**
2. **Never make architectural assumptions**: Clarify with specification author
3. **Follow specifications exactly**: Deviations require specification updates
4. **Provide feedback**: If specification was unclear, report gaps for improvement

---

## Success Metrics

### Specification Quality Indicators
- ✅ **Zero clarification questions during implementation**
- ✅ **All architectural decisions explicitly documented**
- ✅ **Complete code examples for all patterns**
- ✅ **Usage matrices for all design tokens**
- ✅ **Passed Code Readiness Test**

### Failed Specification Indicators
- ❌ **Developer asks "How should I..." questions**
- ❌ **Phrases like "if exists", "TBD", "optional" for core features**
- ❌ **Missing navigation or routing specifications**
- ❌ **Pixel values without Tailwind class equivalents**
- ❌ **Ambiguous layout or spacing descriptions**

---

## Conclusion

This checklist prevents the catastrophic failure pattern: **"Detailed specifications without foundational architecture are like perfectly designed furniture for a house with no doors."**

**Architecture must come first, always.**

Use this checklist religiously. Check every box. Never skip phases. Never use conditional language for core features. Provide implementation-ready code examples.

The result: **World-class UX/UI specifications that produce world-class implementations.**
