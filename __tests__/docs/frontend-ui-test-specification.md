# Frontend UI Test Specification

**Document Version**: 1.0
**Created**: 2025-10-24
**Task**: TEST-FRONTEND-UI
**Coverage Target**: All dashboard and public profile components with tier-aware functionality

---

## Overview

This document specifies the comprehensive test strategy for all frontend UI components in the tier structure implementation, including:

- 15+ dashboard form components
- Tier-aware field visibility and access control
- Upgrade prompt interactions
- Array CRUD operations (certifications, awards, case studies, team)
- Computed field calculations (Years in Business)
- Public profile tier-responsive sections
- VendorCard variants with tier badges
- Accessibility compliance (WCAG 2.1 AA)
- Responsive layouts (mobile, tablet, desktop)

---

## Test Organization

### Directory Structure

```
__tests__/
├── components/
│   ├── dashboard/
│   │   ├── BasicInfoForm.test.tsx              ✅ EXISTS (reference)
│   │   ├── VendorDashboard.test.tsx            📝 NEW
│   │   ├── ProfileEditTabs.test.tsx            📝 NEW
│   │   ├── BrandStoryForm.test.tsx             📝 NEW
│   │   ├── CertificationsAwardsManager.test.tsx 📝 NEW
│   │   ├── CaseStudiesManager.test.tsx         📝 NEW
│   │   ├── TeamMembersManager.test.tsx         📝 NEW
│   │   └── PromotionPackForm.test.tsx          📝 NEW
│   ├── vendors/
│   │   ├── VendorCard.test.tsx                 📝 NEW
│   │   ├── TierBadge.test.tsx                  📝 NEW
│   │   ├── YearsInBusinessDisplay.test.tsx     📝 NEW
│   │   └── VendorProfilePage.test.tsx          📝 NEW
│   └── shared/
│       └── TierUpgradePrompt.test.tsx          📝 NEW
├── integration/
│   ├── dashboard/
│   │   ├── tier-tab-visibility.test.tsx        📝 NEW
│   │   ├── form-validation-flow.test.tsx       📝 NEW
│   │   └── computed-fields.test.tsx            📝 NEW
│   └── vendors/
│       ├── public-profile-tier-display.test.tsx 📝 NEW
│       └── vendor-card-rendering.test.tsx      📝 NEW
├── fixtures/
│   ├── vendors-tier-data.ts                    ✅ EXISTS
│   ├── form-test-data.ts                       📝 NEW
│   └── ui-component-mocks.ts                   📝 NEW
└── utils/
    ├── test-helpers.ts                         📝 NEW
    └── tier-test-utils.ts                      📝 NEW
```

---

## Test Categories

### 1. Component Unit Tests

**Purpose**: Test individual components in isolation
**Focus**: Rendering, props, user interactions, validation, accessibility
**Tool**: React Testing Library + Jest
**Coverage Target**: 80%+ per component

### 2. Integration Tests

**Purpose**: Test component interaction and data flow
**Focus**: Tier access control, form workflows, API integration
**Tool**: React Testing Library + MSW
**Coverage Target**: 80%+ for critical flows

### 3. Accessibility Tests

**Purpose**: Ensure WCAG 2.1 AA compliance
**Focus**: Keyboard navigation, ARIA attributes, screen reader support
**Tool**: jest-axe + React Testing Library
**Coverage Target**: 100% for interactive components

### 4. Responsive Tests

**Purpose**: Verify layout across breakpoints
**Focus**: Mobile (<640px), Tablet (640-1024px), Desktop (≥1024px)
**Tool**: matchMedia mocking + React Testing Library
**Coverage Target**: All page components

---

## Component Test Specifications

### Dashboard Components

#### 1. VendorDashboard (Page Component)

**File**: `__tests__/components/dashboard/VendorDashboard.test.tsx`

**Test Suites**:

1. **Rendering**
   - Renders dashboard container
   - Shows loading skeleton while fetching data
   - Displays vendor data when loaded
   - Shows error state on fetch failure

2. **Authentication**
   - Redirects to login if not authenticated
   - Blocks access for non-vendor users
   - Allows access for authenticated vendor

3. **Data Fetching** (SWR)
   - Fetches vendor data on mount
   - Caches data appropriately
   - Refetches on focus
   - Mutates cache on save success

4. **Save Functionality**
   - Disables save button while saving
   - Shows loading spinner during save
   - Displays success toast on save success
   - Shows error toast on save failure
   - Preserves form data on error

5. **Preview Feature**
   - Opens public profile in new tab
   - Passes current vendor slug to preview URL

**Mock Requirements**:
- `useAuth()` hook for authentication state
- `useSWR()` for data fetching
- `useRouter()` for navigation
- API handlers for GET/PUT `/api/portal/vendors/[id]`

**Fixtures**: `mockTier1Vendor`, `mockTier2Vendor`, `mockTier3Vendor`

---

#### 2. ProfileEditTabs (Container Component)

**File**: `__tests__/components/dashboard/ProfileEditTabs.test.tsx`

**Test Suites**:

1. **Tab Visibility (Tier-Aware)**
   - Free tier: Shows 2 tabs (Basic Info, Locations)
   - Tier 1: Shows 7 tabs (adds Brand Story, Certifications, Case Studies, Team, Products)
   - Tier 2: Shows 8 tabs (adds Promotion)
   - Tier 3: Shows all 9 tabs
   - Hides locked tabs completely (no disabled state)

2. **Tab Navigation**
   - Switches tabs on click
   - Preserves form state when switching tabs
   - Updates URL hash with active tab
   - Restores tab from URL hash on load

3. **Form Coordination**
   - Passes correct vendor data to each form
   - Calls onSave with merged data from active form
   - Handles validation errors from individual forms
   - Prevents tab switch if form is dirty with unsaved changes

4. **Upgrade Prompts**
   - Shows UpgradePromptCard in locked tab content
   - Displays correct target tier for each locked feature
   - Links to contact sales with tier context

5. **Responsive Behavior**
   - Desktop: Horizontal tabs
   - Tablet: Horizontal scrollable tabs
   - Mobile: Dropdown select for tab navigation

**Mock Requirements**:
- `useTierAccess()` hook for tier checking
- Child form components (BasicInfoForm, BrandStoryForm, etc.)

**Fixtures**: All tier vendor fixtures

**Critical Test Cases**:
```typescript
describe('Tier-Based Tab Visibility', () => {
  it.each([
    { tier: 'free', expectedTabCount: 2, expectedTabs: ['Basic Info', 'Locations'] },
    { tier: 'tier1', expectedTabCount: 7, expectedTabs: ['Basic Info', 'Locations', 'Brand Story', 'Certifications', 'Case Studies', 'Team', 'Products'] },
    { tier: 'tier2', expectedTabCount: 8, expectedTabs: ['Basic Info', 'Locations', 'Brand Story', 'Certifications', 'Case Studies', 'Team', 'Products', 'Promotion'] },
    { tier: 'tier3', expectedTabCount: 9, expectedTabs: ['Basic Info', 'Locations', 'Brand Story', 'Certifications', 'Case Studies', 'Team', 'Products', 'Promotion', 'Advanced'] },
  ])('shows correct tabs for $tier', ({ tier, expectedTabCount, expectedTabs }) => {
    // Test implementation
  });
});
```

---

#### 3. BrandStoryForm (Form Component - Tier 1+)

**File**: `__tests__/components/dashboard/BrandStoryForm.test.tsx`

**Test Suites**:

1. **Rendering**
   - Renders all form fields for Tier 1+ users
   - Shows UpgradePromptCard for Free tier users
   - Displays current field values from vendor data
   - Shows YearsInBusinessDisplay as computed field

2. **Field Validation**
   - foundedYear: Must be between 1800 and current year
   - foundedYear: Shows error for future year
   - foundedYear: Shows error for year < 1800
   - foundedYear: Optional field (can be null)
   - website: Must be valid URL format
   - socialProofMetrics: Validates numeric ranges (0-100 for satisfaction)
   - longDescription: Enforces max length

3. **Computed Field (Years in Business)**
   - Auto-calculates when foundedYear entered
   - Updates in real-time as foundedYear changes
   - Shows "Not specified" when foundedYear is null
   - Shows null for invalid years (future, < 1800)
   - Displays as Badge with proper formatting

4. **Form Submission**
   - Validates all fields before submission
   - Calls onSubmit with form data
   - Disables submit button while submitting
   - Shows loading spinner on submit button
   - Resets form on successful submission
   - Preserves data on submission failure

5. **Social Proof Metrics Section**
   - Renders all metric fields (totalProjects, employeeCount, etc.)
   - Validates numeric constraints
   - Shows optional badge for optional fields
   - Groups fields logically in UI

6. **Video Introduction Section**
   - Renders video URL input
   - Validates video URL format
   - Shows video thumbnail if URL provided
   - Allows removal of video

7. **Accessibility**
   - All fields have accessible labels
   - Validation errors announced to screen readers
   - Keyboard navigation works correctly
   - Focus management on error

8. **Responsive Behavior**
   - Mobile: Stacked single column
   - Tablet: 2-column grid for metrics
   - Desktop: 2-column grid with full-width description

**Mock Requirements**:
- `useTierAccess()` for tier checking
- `useForm()` from React Hook Form
- Rich text editor component

**Fixtures**: `mockTier1Vendor`, form validation test data

**Critical Test Cases**:
```typescript
describe('Years in Business Computation', () => {
  it('computes years correctly from foundedYear', () => {
    const currentYear = new Date().getFullYear();
    render(<BrandStoryForm vendor={{ foundedYear: 2010 }} />);

    const yearsDisplay = screen.getByTestId('years-in-business');
    expect(yearsDisplay).toHaveTextContent(`${currentYear - 2010}`);
  });

  it('updates in real-time when foundedYear changes', async () => {
    render(<BrandStoryForm vendor={{ foundedYear: null }} />);

    const foundedYearInput = screen.getByLabelText(/founded year/i);
    fireEvent.change(foundedYearInput, { target: { value: '2015' } });

    await waitFor(() => {
      const yearsDisplay = screen.getByTestId('years-in-business');
      expect(yearsDisplay).toHaveTextContent('10');
    });
  });
});
```

---

#### 4. CertificationsAwardsManager (Array Manager - Tier 1+)

**File**: `__tests__/components/dashboard/CertificationsAwardsManager.test.tsx`

**Test Suites**:

1. **Rendering**
   - Shows two sections: Certifications and Awards
   - Displays empty state when no items
   - Renders all certification items in list
   - Renders all award items in list
   - Shows "Add" buttons for each section

2. **Add Certification Flow**
   - Opens modal on "Add Certification" click
   - Renders form with all required fields
   - Validates required fields (name, issuingOrganization, dateObtained)
   - Validates optional fields (expiryDate, credentialId, credentialUrl)
   - Closes modal on cancel
   - Adds item to list on successful submit
   - Calls onUpdate callback with new array

3. **Edit Certification Flow**
   - Opens modal with pre-filled data on edit click
   - Allows modification of all fields
   - Validates changes
   - Updates item in list on submit
   - Calls onUpdate with modified array

4. **Delete Certification Flow**
   - Shows confirmation dialog on delete click
   - Cancels deletion if user declines
   - Removes item from list on confirm
   - Calls onUpdate with filtered array

5. **Add Award Flow**
   - Opens modal on "Add Award" click
   - Renders form with award-specific fields
   - Validates required fields (title, awardingOrganization, dateReceived)
   - Adds award to list on submit

6. **Edit/Delete Award Flow**
   - Same patterns as certification tests

7. **Tier Access Control**
   - Shows UpgradePromptCard for Free tier users
   - Allows full access for Tier 1+ users
   - Disables add/edit/delete for Free tier

8. **Validation**
   - Prevents duplicate certification names
   - Validates date formats (YYYY-MM-DD)
   - Validates URL formats for credentialUrl
   - Enforces max string lengths

9. **Accessibility**
   - Modal has proper ARIA attributes
   - Focus trapped in modal when open
   - ESC key closes modal
   - Focus returns to trigger button on close

10. **Responsive Behavior**
    - Mobile: List items stacked, full-width modals
    - Tablet/Desktop: Grid layout for items, centered modals

**Mock Requirements**:
- `useTierAccess()` for tier checking
- Dialog/Modal component
- Form validation (Zod)

**Fixtures**: Certification and award test data

---

#### 5. CaseStudiesManager (Array Manager - Tier 1+)

**File**: `__tests__/components/dashboard/CaseStudiesManager.test.tsx`

**Test Suites**:

1. **Rendering**
   - Displays list of case studies
   - Shows empty state with "Add Case Study" prompt
   - Renders case study cards with preview
   - Shows featured badge on featured case studies

2. **Add Case Study Flow**
   - Opens full-screen modal on "Add" click
   - Renders rich form with all fields
   - Includes rich text editor for descriptions
   - Supports image gallery uploads
   - Validates required fields (title, description, projectDate)
   - Saves case study on submit

3. **Edit Case Study Flow**
   - Opens modal with existing data
   - Allows modification of all fields
   - Preserves existing images
   - Allows adding/removing images
   - Updates case study in list

4. **Delete Case Study Flow**
   - Shows confirmation with warning
   - Removes case study on confirm

5. **Featured Toggle**
   - Allows marking case study as featured
   - Shows featured badge on card
   - Allows un-featuring

6. **Image Gallery Management**
   - Supports multiple image uploads
   - Shows image previews
   - Allows reordering images (drag-and-drop)
   - Allows removing individual images
   - Validates image formats and sizes

7. **Rich Content Editing**
   - Rich text editor works for challenge, solution, results
   - Supports basic formatting (bold, italic, lists)
   - Preserves formatting on save

8. **Tier Access Control**
   - Free tier sees UpgradePromptCard
   - Tier 1+ has full access

**Mock Requirements**:
- Rich text editor (Lexical)
- Image uploader component
- Dialog component

**Fixtures**: Case study test data with images

---

#### 6. TeamMembersManager (Array Manager - Tier 1+)

**File**: `__tests__/components/dashboard/TeamMembersManager.test.tsx`

**Test Suites**:

1. **Rendering**
   - Displays team member grid
   - Shows empty state
   - Renders team member cards with photos

2. **Add Team Member Flow**
   - Opens modal on "Add Member" click
   - Renders form with all fields
   - Includes photo uploader
   - Validates required fields (name, role)
   - Adds member to grid

3. **Edit Team Member Flow**
   - Opens modal with existing data
   - Allows updating photo
   - Updates member in grid

4. **Delete Team Member Flow**
   - Shows confirmation dialog
   - Removes member on confirm

5. **Display Order Management**
   - Shows up/down arrows for reordering
   - Moves member up in list
   - Moves member down in list
   - Saves new order

6. **Photo Upload**
   - Supports image upload
   - Shows preview of uploaded photo
   - Validates image size and format
   - Shows placeholder if no photo

7. **LinkedIn Integration**
   - Validates LinkedIn URL format
   - Shows LinkedIn icon if URL provided

**Mock Requirements**:
- Image uploader
- Dialog component

**Fixtures**: Team member test data

---

#### 7. PromotionPackForm (Form Component - Tier 3 Only)

**File**: `__tests__/components/dashboard/PromotionPackForm.test.tsx`

**Test Suites**:

1. **Rendering**
   - Shows form for Tier 3 users
   - Shows UpgradePromptCard for Tier 2 and below

2. **Feature Toggles**
   - Renders all promotion pack feature checkboxes
   - Allows toggling featuredPlacement
   - Allows toggling editorialCoverage
   - Allows toggling searchHighlight
   - Allows toggling newsletterSpotlight
   - Allows toggling socialMediaPromotion

3. **Form Submission**
   - Submits all selected features
   - Persists selections
   - Shows success message

4. **Tier Access Control**
   - Blocks Free, Tier 1, Tier 2 users
   - Shows upgrade prompt with benefits

**Mock Requirements**:
- `useTierAccess()` hook

**Fixtures**: `mockTier3Vendor`

---

### Vendor Display Components

#### 8. VendorCard (List Item Component)

**File**: `__tests__/components/vendors/VendorCard.test.tsx`

**Test Suites**:

1. **Rendering**
   - Displays vendor logo
   - Shows company name
   - Shows description excerpt
   - Displays tier badge
   - Shows featured star for Tier 3 featured vendors
   - Shows years in business badge (Tier 1+)

2. **Tier Badge Display**
   - Shows correct color for each tier (Free: gray, T1: blue, T2: purple, T3: gold)
   - Shows correct icon for each tier
   - Displays tier label text

3. **Featured Indicator**
   - Shows star icon for featured=true
   - Hides star for featured=false
   - Only Tier 2+ vendors can be featured

4. **Click Interaction**
   - Navigates to vendor profile on card click
   - Uses correct slug in URL

5. **Responsive Layout**
   - Mobile: Stacked vertical layout
   - Tablet: Horizontal layout with image left
   - Desktop: Horizontal layout with larger image

6. **Accessibility**
   - Card is keyboard accessible
   - Has proper ARIA role
   - Company name is accessible link

**Mock Requirements**:
- `useRouter()` for navigation
- TierBadge component
- YearsInBusinessDisplay component

**Fixtures**: All tier vendor fixtures

---

#### 9. TierBadge (Display Component)

**File**: `__tests__/components/vendors/TierBadge.test.tsx`

**Test Suites**:

1. **Rendering**
   - Renders badge with tier label
   - Shows correct color for tier
   - Shows icon if showIcon=true
   - Hides icon if showIcon=false

2. **Tier Variants**
   - Free tier: Gray background, Circle icon, "Free" text
   - Tier 1: Blue background, Star icon, "Tier 1" text
   - Tier 2: Purple background, Sparkles icon, "Tier 2" text
   - Tier 3: Gold background, Crown icon, "Tier 3" text

3. **Size Variants**
   - sm: Small padding and text
   - md: Medium padding and text (default)
   - lg: Large padding and text

4. **Accessibility**
   - Has role="status" for screen readers
   - Tier level is announced

**Mock Requirements**: None

**Fixtures**: None (simple props testing)

---

#### 10. YearsInBusinessDisplay (Computed Field Component)

**File**: `__tests__/components/vendors/YearsInBusinessDisplay.test.tsx`

**Test Suites**:

1. **Rendering**
   - Shows computed years when foundedYear provided
   - Shows "Not specified" when foundedYear is null
   - Shows label if showLabel=true
   - Hides label if showLabel=false

2. **Computation Logic**
   - Computes currentYear - foundedYear correctly
   - Returns null for foundedYear < 1800
   - Returns null for foundedYear > currentYear
   - Handles edge case of foundedYear = currentYear (0 years)

3. **Variant Styles**
   - badge: Renders as Badge component
   - inline: Renders as inline text

4. **Accessibility**
   - Has proper ARIA label
   - Announces years in business to screen readers

**Mock Requirements**: None

**Fixtures**: foundedYear test cases (valid, invalid, null, future)

**Critical Test Cases**:
```typescript
describe('Computation Logic', () => {
  const currentYear = new Date().getFullYear();

  it.each([
    { foundedYear: 2010, expected: currentYear - 2010 },
    { foundedYear: 2000, expected: currentYear - 2000 },
    { foundedYear: currentYear, expected: 0 },
    { foundedYear: 1800, expected: currentYear - 1800 },
  ])('computes years correctly for foundedYear $foundedYear', ({ foundedYear, expected }) => {
    render(<YearsInBusinessDisplay foundedYear={foundedYear} />);
    expect(screen.getByText(expected.toString())).toBeInTheDocument();
  });

  it.each([
    { foundedYear: 1799, label: 'below minimum' },
    { foundedYear: currentYear + 1, label: 'future year' },
    { foundedYear: null, label: 'null' },
  ])('shows "Not specified" for $label', ({ foundedYear }) => {
    render(<YearsInBusinessDisplay foundedYear={foundedYear} />);
    expect(screen.getByText(/not specified/i)).toBeInTheDocument();
  });
});
```

---

#### 11. VendorProfilePage (Public Page Component)

**File**: `__tests__/components/vendors/VendorProfilePage.test.tsx`

**Test Suites**:

1. **Data Fetching**
   - Fetches vendor by slug on mount
   - Shows loading skeleton while fetching
   - Displays vendor data when loaded
   - Shows 404 error for invalid slug

2. **Tier-Responsive Sections**
   - All tiers: Shows basic info, locations map
   - Tier 1+: Shows certifications, awards, case studies, team
   - Tier 2+: Shows products section, featured badge
   - Tier 3: Shows promotion pack features, editorial content

3. **Hero Section**
   - Displays vendor logo
   - Shows company name
   - Shows description
   - Displays tier badge
   - Shows years in business badge (Tier 1+)
   - Shows featured star (Tier 2+ featured vendors)

4. **Locations Section**
   - Shows all locations on map
   - Free tier: Max 1 location
   - Tier 1: Max 5 locations
   - Tier 2: Max 10 locations
   - Tier 3: Unlimited locations
   - Marks HQ location prominently

5. **Certifications Section (Tier 1+)**
   - Displays certification grid
   - Shows certification details
   - Hides section for Free tier

6. **Case Studies Section (Tier 1+)**
   - Displays case study cards
   - Opens detail modal on click
   - Shows featured case studies first

7. **Team Section (Tier 1+)**
   - Displays team member grid
   - Shows photos and roles
   - Links to LinkedIn profiles

8. **Products Section (Tier 2+)**
   - Shows vendor products
   - Links to product detail pages

9. **Contact Section**
   - Shows contact information
   - Displays contact form/button
   - Links to social media

10. **Responsive Behavior**
    - Mobile: Single column, stacked sections
    - Tablet: 2-column grid for sections
    - Desktop: 2-column with sidebar

11. **SEO**
    - Sets correct page title
    - Sets meta description
    - Sets OG tags for social sharing

**Mock Requirements**:
- `useSWR()` for data fetching
- API handler for GET `/api/vendors/[slug]`
- Map component
- All section components

**Fixtures**: All tier vendor fixtures

---

#### 12. TierUpgradePrompt (Modal/Card Component)

**File**: `__tests__/components/shared/TierUpgradePrompt.test.tsx`

**Test Suites**:

1. **Rendering**
   - Displays current tier badge
   - Shows required tier badge
   - Lists feature name
   - Shows benefits of upgrading

2. **Tier Upgrade Paths**
   - Free → Tier 1: Shows Tier 1 benefits
   - Tier 1 → Tier 2: Shows Tier 2 benefits
   - Tier 2 → Tier 3: Shows Tier 3 benefits

3. **CTA Button**
   - Shows "Contact Sales" button
   - Links to contact form with tier context
   - Includes current and target tier in URL params

4. **Modal Behavior**
   - Can be dismissed
   - Calls onClose callback

5. **Styling**
   - Uses shadcn Dialog component
   - Responsive modal size

**Mock Requirements**:
- Dialog component
- TierBadge component

**Fixtures**: Tier upgrade scenarios

---

## Integration Test Specifications

### Dashboard Integration Tests

#### 1. Tier Tab Visibility Integration Test

**File**: `__tests__/integration/dashboard/tier-tab-visibility.test.tsx`

**Purpose**: Verify complete tier-based tab visibility across all tier levels

**Test Flow**:
1. Mock authentication with different tier levels
2. Render VendorDashboard
3. Verify correct tabs displayed for each tier
4. Verify locked tab content shows upgrade prompts
5. Verify tab switching works for accessible tabs

**Critical Scenarios**:
- Free tier user sees only Basic Info and Locations
- Tier 1 user sees 7 tabs, can access all
- Tier 2 user sees 8 tabs, can access all
- Tier 3 user sees all 9 tabs, can access all
- Clicking locked tab shows upgrade prompt (if implemented)

**Mock Requirements**:
- Authentication context with different tiers
- Vendor data for each tier

---

#### 2. Form Validation Flow Integration Test

**File**: `__tests__/integration/dashboard/form-validation-flow.test.tsx`

**Purpose**: Test complete form submission workflow with validation

**Test Flow**:
1. Render dashboard with specific form
2. Fill in invalid data
3. Attempt submission
4. Verify validation errors displayed
5. Fix errors
6. Submit successfully
7. Verify API called with correct data
8. Verify success message shown
9. Verify form reset

**Critical Scenarios**:
- BasicInfoForm: Invalid email shows error, valid submission succeeds
- BrandStoryForm: Invalid foundedYear shows error, valid submission succeeds
- CertificationsManager: Duplicate certification rejected, valid addition succeeds

**Mock Requirements**:
- API handlers with validation responses
- Form validation schemas

---

#### 3. Computed Fields Integration Test

**File**: `__tests__/integration/dashboard/computed-fields.test.tsx`

**Purpose**: Verify computed field calculations across components

**Test Flow**:
1. Render BrandStoryForm
2. Enter foundedYear
3. Verify YearsInBusinessDisplay updates in real-time
4. Submit form
5. Verify backend receives foundedYear
6. Mock backend response with computed yearsInBusiness
7. Verify display shows backend-computed value

**Critical Scenarios**:
- Client-side computation matches backend computation
- Edge cases handled identically (null, invalid years)
- Real-time updates work correctly
- Saved data persists and displays correctly

**Mock Requirements**:
- BrandStoryForm component
- YearsInBusinessDisplay component
- API handlers with computed field responses

---

### Vendor Profile Integration Tests

#### 4. Public Profile Tier Display Integration Test

**File**: `__tests__/integration/vendors/public-profile-tier-display.test.tsx`

**Purpose**: Verify tier-responsive section visibility on public profiles

**Test Flow**:
1. Mock API responses for vendors at each tier
2. Render VendorProfilePage for Free tier vendor
3. Verify only basic sections shown
4. Render for Tier 1 vendor
5. Verify Tier 1+ sections shown
6. Render for Tier 2 vendor
7. Verify Tier 2+ sections shown
8. Render for Tier 3 vendor
9. Verify all sections shown

**Critical Scenarios**:
- Free tier: Basic info + locations only
- Tier 1: Adds certifications, case studies, team
- Tier 2: Adds products, featured badge
- Tier 3: Adds promotion features, editorial content

**Mock Requirements**:
- API handlers for GET `/api/vendors/[slug]` with tier filtering
- All tier vendor fixtures

---

#### 5. Vendor Card Rendering Integration Test

**File**: `__tests__/integration/vendors/vendor-card-rendering.test.tsx`

**Purpose**: Test VendorCard with all tier variants in list context

**Test Flow**:
1. Render list of VendorCards with mixed tiers
2. Verify each card shows correct tier badge
3. Verify featured vendors show star icon
4. Verify Tier 1+ vendors show years in business
5. Click card and verify navigation

**Critical Scenarios**:
- Grid of cards renders correctly
- Tier badges are color-coded
- Featured indication only on Tier 2+
- Years in business only on Tier 1+

**Mock Requirements**:
- Array of vendor fixtures (all tiers)
- Router mock

---

## Test Utilities

### 1. Test Helpers

**File**: `__tests__/utils/test-helpers.ts`

**Purpose**: Reusable render helpers with providers

**Utilities**:

```typescript
// Render with all required providers
export function renderWithProviders(
  component: React.ReactElement,
  options: {
    tier?: TierLevel;
    vendor?: Partial<Vendor>;
    authenticated?: boolean;
  } = {}
) {
  const { tier = 'free', vendor, authenticated = true } = options;

  return render(
    <AuthProvider initialAuth={{ authenticated, user: { tier } }}>
      <VendorDashboardProvider initialVendor={vendor}>
        <TierAccessProvider tier={tier}>
          {component}
        </TierAccessProvider>
      </VendorDashboardProvider>
    </AuthProvider>
  );
}

// Mock tier access hook
export function mockTierAccess(tier: TierLevel) {
  return {
    tier,
    canAccessField: (field: string) => TierValidationService.validateFieldAccess(tier, field),
    canAccessFeature: (feature: string) => TierValidationService.canAccessFeature(tier, feature),
    getLocationLimit: () => getTierLocationLimit(tier),
  };
}

// Wait for async operations
export async function waitForLoadingToFinish() {
  await waitFor(() => {
    expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
  });
}

// Fill form field helper
export async function fillFormField(labelText: string, value: string) {
  const field = screen.getByLabelText(new RegExp(labelText, 'i'));
  fireEvent.change(field, { target: { value } });
  fireEvent.blur(field);
}

// Submit form helper
export async function submitForm(buttonText: string = 'save') {
  const submitButton = screen.getByRole('button', { name: new RegExp(buttonText, 'i') });
  fireEvent.click(submitButton);
}
```

---

### 2. Tier Test Utilities

**File**: `__tests__/utils/tier-test-utils.ts`

**Purpose**: Tier-specific test helpers

**Utilities**:

```typescript
// Generate tier test cases for parameterized tests
export function generateTierTestCases() {
  return [
    {
      tier: 'free',
      expectedTabs: 2,
      expectedFields: ['companyName', 'slug', 'description', 'logo', 'email', 'phone'],
      lockedFields: ['foundedYear', 'certifications', 'awards', 'caseStudies'],
    },
    {
      tier: 'tier1',
      expectedTabs: 7,
      expectedFields: ['companyName', 'slug', 'description', 'logo', 'email', 'phone', 'foundedYear', 'certifications', 'awards'],
      lockedFields: ['promotionPack'],
    },
    {
      tier: 'tier2',
      expectedTabs: 8,
      expectedFields: ['companyName', 'foundedYear', 'certifications', 'featuredInCategory'],
      lockedFields: ['promotionPack'],
    },
    {
      tier: 'tier3',
      expectedTabs: 9,
      expectedFields: ['companyName', 'foundedYear', 'certifications', 'promotionPack'],
      lockedFields: [],
    },
  ];
}

// Validate field access for tier
export function assertFieldAccess(tier: TierLevel, field: string, shouldAccess: boolean) {
  const canAccess = TierValidationService.validateFieldAccess(tier, field);
  expect(canAccess).toBe(shouldAccess);
}

// Get tier label for display
export function getTierLabel(tier: TierLevel): string {
  const labels: Record<TierLevel, string> = {
    free: 'Free',
    tier1: 'Tier 1',
    tier2: 'Tier 2',
    tier3: 'Tier 3',
  };
  return labels[tier];
}

// Get tier color for badge testing
export function getTierColor(tier: TierLevel): string {
  const colors: Record<TierLevel, string> = {
    free: 'gray',
    tier1: 'blue',
    tier2: 'purple',
    tier3: 'gold',
  };
  return colors[tier];
}
```

---

## Mock Data Fixtures

### 1. Form Test Data

**File**: `__tests__/fixtures/form-test-data.ts`

**Purpose**: Test data for form validation scenarios

**Fixtures**:

```typescript
export const validBasicInfoData = {
  companyName: 'Test Marine Services',
  slug: 'test-marine-services',
  description: 'Quality marine services provider',
  email: 'contact@testmarine.com',
  phone: '+1-555-0100',
  website: 'https://testmarine.com',
};

export const invalidBasicInfoData = {
  companyName: '', // Empty (invalid)
  slug: 'invalid slug!', // Contains special chars (invalid)
  email: 'not-an-email', // Invalid format
  phone: '123', // Too short
};

export const validBrandStoryData = {
  foundedYear: 2010,
  website: 'https://example.com',
  linkedinUrl: 'https://linkedin.com/company/example',
  totalProjects: 150,
  employeeCount: 25,
  clientSatisfactionScore: 95,
};

export const invalidBrandStoryData = {
  foundedYear: 1799, // Below minimum
  website: 'not-a-url', // Invalid format
  clientSatisfactionScore: 101, // Above maximum
};

export const validCertificationData = {
  name: 'ISO 9001:2015',
  issuingOrganization: 'ISO',
  dateObtained: '2020-06-15',
  expiryDate: '2023-06-15',
  credentialId: 'ISO-12345',
  credentialUrl: 'https://iso.org/verify/12345',
};

export const validAwardData = {
  title: 'Best Marine Service Provider 2022',
  awardingOrganization: 'Yachting Excellence Awards',
  dateReceived: '2022-11-10',
  description: 'Recognized for outstanding service quality',
};

export const validCaseStudyData = {
  title: '150ft Mega Yacht Refit',
  client: 'Confidential Owner',
  projectDate: '2022-05',
  description: 'Complete interior and exterior refit',
  challenge: 'Tight deadline and complex requirements',
  solution: 'Assembled specialized team',
  results: 'Delivered 2 weeks ahead of schedule',
  testimonial: 'Exceptional work',
  images: ['https://example.com/image1.jpg'],
};

export const validTeamMemberData = {
  name: 'John Smith',
  role: 'Lead Marine Engineer',
  bio: '20 years of experience',
  photo: 'https://example.com/john.jpg',
  linkedinUrl: 'https://linkedin.com/in/johnsmith',
  displayOrder: 1,
};
```

---

### 2. UI Component Mocks

**File**: `__tests__/fixtures/ui-component-mocks.ts`

**Purpose**: Mock implementations of UI components for testing

**Mocks**:

```typescript
// Mock rich text editor
export const MockRichTextEditor = ({ onChange, initialValue }: any) => (
  <textarea
    data-testid="rich-text-editor"
    defaultValue={initialValue}
    onChange={(e) => onChange(e.target.value)}
  />
);

// Mock image uploader
export const MockMediaUploader = ({ onUpload, value }: any) => (
  <div data-testid="media-uploader">
    <input
      type="file"
      onChange={(e) => {
        const file = e.target.files?.[0];
        if (file) onUpload({ url: `https://example.com/${file.name}` });
      }}
    />
    {value && <img src={value} alt="Preview" />}
  </div>
);

// Mock toast notifications
export const mockToast = {
  success: jest.fn(),
  error: jest.fn(),
  info: jest.fn(),
};
```

---

## Accessibility Test Checklist

### WCAG 2.1 AA Compliance Requirements

**All Interactive Components Must Have**:

1. **Keyboard Navigation**
   - [ ] All interactive elements focusable via Tab
   - [ ] Focus order follows visual order
   - [ ] Focus visible (outline or highlight)
   - [ ] Modals trap focus appropriately
   - [ ] ESC key closes modals/dialogs

2. **ARIA Attributes**
   - [ ] Form fields have aria-label or associated label
   - [ ] Buttons have aria-label for icon-only buttons
   - [ ] Modals have aria-modal="true"
   - [ ] Validation errors have aria-invalid and aria-describedby
   - [ ] Loading states have aria-busy or aria-live

3. **Screen Reader Support**
   - [ ] All images have alt text
   - [ ] Form errors announced to screen readers
   - [ ] Success messages announced with aria-live
   - [ ] Dynamic content changes announced
   - [ ] Skip links provided for navigation

4. **Color Contrast**
   - [ ] Text has minimum 4.5:1 contrast ratio
   - [ ] Large text has minimum 3:1 contrast ratio
   - [ ] Focus indicators have minimum 3:1 contrast
   - [ ] Interactive elements distinguishable without color alone

5. **Form Accessibility**
   - [ ] Labels associated with inputs (htmlFor)
   - [ ] Required fields marked with aria-required
   - [ ] Error messages linked with aria-describedby
   - [ ] Field hints provided with aria-describedby

**Testing Approach**:
- Use jest-axe for automated accessibility testing
- Manual keyboard navigation testing
- Screen reader testing with NVDA/JAWS (manual)

**Example Test**:
```typescript
import { axe, toHaveNoViolations } from 'jest-axe';
expect.extend(toHaveNoViolations);

it('has no accessibility violations', async () => {
  const { container } = render(<BasicInfoForm {...mockProps} />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

---

## Responsive Testing Strategy

### Breakpoints to Test

1. **Mobile**: < 640px (320px, 375px, 414px)
2. **Tablet**: 640px - 1024px (768px, 834px)
3. **Desktop**: ≥ 1024px (1280px, 1440px, 1920px)

### Testing Approach

**Mock matchMedia**:
```typescript
function mockMatchMedia(width: number) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches: query.includes(`max-width: ${width}px`) || query.includes(`min-width: ${width}px`),
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
}
```

**Responsive Test Pattern**:
```typescript
describe('Responsive Behavior', () => {
  it.each([
    { width: 375, expectedLayout: 'stacked' },
    { width: 768, expectedLayout: 'grid-2col' },
    { width: 1280, expectedLayout: 'grid-3col' },
  ])('renders $expectedLayout at $width px', ({ width, expectedLayout }) => {
    mockMatchMedia(width);
    render(<VendorCard {...mockProps} />);

    const container = screen.getByTestId('vendor-card');
    expect(container).toHaveClass(expectedLayout);
  });
});
```

---

## Test Coverage Goals

### Coverage Targets

**Overall Target**: ≥ 80% across all metrics

**Per-Category Targets**:
- **Statements**: ≥ 80%
- **Branches**: ≥ 75%
- **Functions**: ≥ 80%
- **Lines**: ≥ 80%

**Critical Path Coverage**: 100%
- Tier validation logic
- Computed field calculations
- Form submission workflows
- API integration points

### Coverage Exclusions

**Exclude from coverage**:
- Next.js generated files
- Third-party library wrappers
- Test utilities and fixtures
- Type definition files

---

## Test Execution Strategy

### Execution Order

**Phase 1: Component Unit Tests** (Parallel)
- Run all component unit tests concurrently
- Estimated time: 5-10 minutes
- Target: 80%+ component coverage

**Phase 2: Integration Tests** (Sequential)
- Run integration tests that depend on multiple components
- Estimated time: 3-5 minutes
- Target: 80%+ integration flow coverage

**Phase 3: Accessibility Tests** (Parallel)
- Run jest-axe tests on all interactive components
- Estimated time: 2-3 minutes
- Target: 0 accessibility violations

### CI/CD Integration

**Pre-commit**:
- Run unit tests for changed files only
- Fast feedback (< 1 minute)

**Pull Request**:
- Run full test suite
- Generate coverage report
- Block merge if coverage drops below 80%

**Post-merge**:
- Run full test suite including E2E
- Update coverage baseline

---

## Test Maintenance Guidelines

### When to Update Tests

1. **Component Props Change**: Update test fixtures and prop assertions
2. **New Feature Added**: Add new test cases for feature
3. **Bug Fixed**: Add regression test for bug
4. **Tier Logic Changed**: Update tier access test cases
5. **Validation Rules Changed**: Update validation test cases

### Test Smell Prevention

**Avoid**:
- Testing implementation details (internal state, private methods)
- Brittle selectors (relying on CSS classes instead of roles/labels)
- Over-mocking (mocking too much reduces test value)
- Duplicate test cases (DRY principle applies to tests too)

**Prefer**:
- Testing user-facing behavior
- Semantic queries (getByRole, getByLabelText)
- Integration tests over unit tests when appropriate
- Parameterized tests for similar scenarios

---

## Authentication Test Notes

**Test Credentials** (from `/home/edwin/development/ptnextjs/temp/creds.md`):

**CMS Admin**:
- Email: admin@paulthames.com
- Password: admin123456

**Test Vendor**:
- Email: testvendor@test.com
- Password: 123

**Usage**:
- Use test vendor credentials for E2E tests
- Mock authentication in unit/integration tests
- Never commit credentials to test files

---

## Summary

This test specification provides comprehensive coverage for:
- ✅ **13 component test files** for dashboard and vendor display
- ✅ **5 integration test files** for critical user flows
- ✅ **2 test utility files** for reusable helpers
- ✅ **2 fixture files** for test data
- ✅ **Accessibility checklist** for WCAG 2.1 AA compliance
- ✅ **Responsive testing strategy** for 3 breakpoints
- ✅ **Coverage goals** with 80%+ target
- ✅ **Execution strategy** for CI/CD integration

**Total Test Estimates**:
- Component unit tests: ~400+ test cases
- Integration tests: ~50+ test cases
- Accessibility tests: ~50+ test cases
- Total: ~500+ test cases

**Time to Implement**:
- Component tests: 8-10 hours
- Integration tests: 3-4 hours
- Test utilities: 1-2 hours
- Fixtures: 1 hour
- **Total**: ~15 hours

---

**Generated for Task TEST-FRONTEND-UI**
**Created**: 2025-10-24
**Agent OS v2.2.0**
