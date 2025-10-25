# Accessibility Test Checklist (WCAG 2.1 AA)

**Document Version**: 1.0
**Created**: 2025-10-24
**Task**: TEST-FRONTEND-UI
**Target**: WCAG 2.1 Level AA Compliance

---

## Overview

This checklist ensures all frontend components meet WCAG 2.1 Level AA accessibility standards. Each interactive component must pass all applicable criteria before being marked as complete.

---

## Testing Tools

### Automated Testing
- [ ] **jest-axe**: Automated accessibility testing in Jest
- [ ] **axe-core**: Core accessibility testing engine
- [ ] **eslint-plugin-jsx-a11y**: Linting for JSX accessibility

### Manual Testing
- [ ] **Keyboard only**: Navigate entire interface without mouse
- [ ] **Screen Reader**: Test with NVDA (Windows) or VoiceOver (Mac)
- [ ] **Contrast Checker**: Verify color contrast ratios
- [ ] **Zoom**: Test at 200% zoom level

---

## Principle 1: Perceivable

### 1.1 Text Alternatives

**Guideline**: Provide text alternatives for non-text content

#### Images
- [ ] All images have meaningful `alt` text
- [ ] Decorative images have empty `alt=""` or are CSS backgrounds
- [ ] Complex images (charts, diagrams) have detailed descriptions
- [ ] Vendor logos have company name as alt text
- [ ] Team member photos have names as alt text

**Test Method**:
```typescript
it('all images have alt text', () => {
  render(<Component />);
  const images = screen.getAllByRole('img');
  images.forEach(img => {
    expect(img).toHaveAttribute('alt');
  });
});
```

#### Icons
- [ ] Icon-only buttons have `aria-label`
- [ ] Icons with adjacent text don't duplicate info
- [ ] Icon meanings are clear from context or label
- [ ] Tier badge icons have descriptive text

**Test Method**:
```typescript
it('icon-only buttons have aria-label', () => {
  render(<Component />);
  const iconButtons = screen.getAllByRole('button');
  iconButtons.forEach(button => {
    if (!button.textContent) {
      expect(button).toHaveAttribute('aria-label');
    }
  });
});
```

---

### 1.2 Time-based Media

**Guideline**: Provide alternatives for time-based media

#### Video Introduction
- [ ] Videos have captions/subtitles
- [ ] Video player controls are accessible
- [ ] Video thumbnails have descriptive alt text
- [ ] Video duration is announced

---

### 1.3 Adaptable

**Guideline**: Content can be presented in different ways

#### Information and Relationships
- [ ] Headings use proper heading hierarchy (h1 → h2 → h3)
- [ ] Form labels associated with inputs (`<label for="">`)
- [ ] Lists use semantic HTML (`<ul>`, `<ol>`, `<li>`)
- [ ] Tables use semantic HTML with headers
- [ ] Form field groups use `<fieldset>` and `<legend>`

**Test Method**:
```typescript
it('form labels are associated with inputs', () => {
  render(<FormComponent />);
  const inputs = screen.getAllByRole('textbox');
  inputs.forEach(input => {
    const labelId = input.getAttribute('aria-labelledby') || input.getAttribute('id');
    expect(screen.getByLabelText(labelId)).toBe(input);
  });
});
```

#### Meaningful Sequence
- [ ] Reading order follows visual order
- [ ] Tab order is logical
- [ ] Content makes sense when CSS is disabled
- [ ] Form fields appear in logical order

**Test Method**: Manual keyboard navigation testing

#### Sensory Characteristics
- [ ] Instructions don't rely solely on shape, size, or position
- [ ] Color is not the only way to convey information
- [ ] Tier badges use both color AND text labels
- [ ] Error states use both color AND icons/text

**Test Method**:
```typescript
it('tier badges use text labels not just color', () => {
  render(<TierBadge tier="tier1" />);
  expect(screen.getByText('Tier 1')).toBeInTheDocument();
});
```

---

### 1.4 Distinguishable

**Guideline**: Make it easier for users to see and hear content

#### Color Contrast
- [ ] Normal text has 4.5:1 contrast ratio minimum
- [ ] Large text (18pt+) has 3:1 contrast ratio minimum
- [ ] Interactive elements have 3:1 contrast ratio
- [ ] Focus indicators have 3:1 contrast ratio
- [ ] Disabled elements meet contrast requirements

**Test Method**: Use browser DevTools or WebAIM Contrast Checker

**Components Requiring Contrast Verification**:
- [ ] Primary buttons
- [ ] Secondary buttons
- [ ] Form field labels
- [ ] Form field borders
- [ ] Error messages
- [ ] Tier badges (all colors)
- [ ] Links
- [ ] Headings

#### Use of Color
- [ ] Errors indicated by more than just red color
- [ ] Required fields marked with asterisk AND color
- [ ] Links distinguishable by underline or other means
- [ ] Chart/graph data distinguishable without color

**Test Method**:
```typescript
it('required fields marked with asterisk', () => {
  render(<FormField required label="Company Name" />);
  expect(screen.getByText(/\*/)).toBeInTheDocument();
});
```

#### Text Resize
- [ ] Text remains readable at 200% zoom
- [ ] No horizontal scrolling at 200% zoom (for 1280px wide)
- [ ] No content overlap at 200% zoom
- [ ] Text can be resized without assistive technology

**Test Method**: Manual testing with browser zoom

#### Text Spacing
- [ ] Content doesn't break when users adjust:
  - Line height to 1.5x font size
  - Paragraph spacing to 2x font size
  - Letter spacing to 0.12x font size
  - Word spacing to 0.16x font size

**Test Method**: Use browser DevTools to adjust CSS

#### Images of Text
- [ ] Text is actual text, not images
- [ ] Logos can be images of text (exception)
- [ ] Decorative text images have alternatives

---

## Principle 2: Operable

### 2.1 Keyboard Accessible

**Guideline**: All functionality available from keyboard

#### Keyboard Navigation
- [ ] All interactive elements focusable with Tab
- [ ] Tab order is logical
- [ ] Shift+Tab moves focus backwards
- [ ] Focus visible on all focusable elements
- [ ] No keyboard traps (can escape all elements)

**Test Method**:
```typescript
it('supports keyboard navigation', () => {
  render(<Component />);
  const firstElement = screen.getAllByRole('button')[0];
  const secondElement = screen.getAllByRole('button')[1];

  firstElement.focus();
  expect(firstElement).toHaveFocus();

  fireEvent.keyDown(firstElement, { key: 'Tab' });
  expect(secondElement).toHaveFocus();
});
```

**Components Requiring Keyboard Testing**:
- [ ] ProfileEditTabs (Arrow keys switch tabs)
- [ ] Modals (Focus trapped, ESC closes)
- [ ] Forms (Tab through fields)
- [ ] Dropdowns (Arrow keys navigate)
- [ ] Array managers (CRUD operations via keyboard)

#### No Keyboard Trap
- [ ] Can escape modals with ESC key
- [ ] Can navigate out of all components
- [ ] Custom controls don't trap focus
- [ ] Modals return focus to trigger on close

**Test Method**:
```typescript
it('modal can be closed with ESC key', () => {
  render(<Modal open={true} onClose={onClose} />);
  const dialog = screen.getByRole('dialog');

  fireEvent.keyDown(dialog, { key: 'Escape' });

  expect(onClose).toHaveBeenCalled();
});
```

#### Keyboard Shortcuts
- [ ] Single key shortcuts can be disabled or remapped
- [ ] Shortcuts documented in help text
- [ ] No conflicts with browser/OS shortcuts

---

### 2.2 Enough Time

**Guideline**: Provide users enough time to read and use content

#### Timing Adjustable
- [ ] Time limits can be turned off or extended
- [ ] User warned before time expires
- [ ] Auto-save prevents data loss

**Note**: Most components in this implementation don't have time limits

#### Pause, Stop, Hide
- [ ] Auto-playing content can be paused
- [ ] Moving/blinking content can be stopped
- [ ] Auto-updating content can be paused

---

### 2.3 Seizures and Physical Reactions

**Guideline**: Do not design content that causes seizures

#### Three Flashes
- [ ] No content flashes more than 3 times per second
- [ ] No large bright flashing areas

**Note**: No flashing content in tier implementation

---

### 2.4 Navigable

**Guideline**: Provide ways to help users navigate and find content

#### Bypass Blocks
- [ ] Skip to main content link provided
- [ ] Proper heading structure allows navigation
- [ ] Landmark regions defined (header, nav, main, footer)

**Test Method**:
```typescript
it('has proper landmark regions', () => {
  render(<Page />);
  expect(screen.getByRole('banner')).toBeInTheDocument(); // header
  expect(screen.getByRole('navigation')).toBeInTheDocument(); // nav
  expect(screen.getByRole('main')).toBeInTheDocument(); // main
  expect(screen.getByRole('contentinfo')).toBeInTheDocument(); // footer
});
```

#### Page Titled
- [ ] Each page has descriptive `<title>`
- [ ] Title describes page content/purpose
- [ ] Dynamic pages update title

**Test Method**: Verify in browser or E2E tests

#### Focus Order
- [ ] Focus order matches visual order
- [ ] Focus order makes sense
- [ ] No unexpected focus jumps

**Test Method**: Manual keyboard navigation

#### Link Purpose
- [ ] Link text describes destination
- [ ] "Click here" avoided
- [ ] Context makes link purpose clear
- [ ] Upgrade CTA links are descriptive

**Test Method**:
```typescript
it('links have descriptive text', () => {
  render(<Component />);
  const links = screen.getAllByRole('link');
  links.forEach(link => {
    expect(link).not.toHaveTextContent(/^click here$/i);
    expect(link.textContent.length).toBeGreaterThan(3);
  });
});
```

#### Multiple Ways
- [ ] Search functionality available
- [ ] Navigation menu provided
- [ ] Breadcrumbs on detail pages

#### Headings and Labels
- [ ] Headings describe topic/purpose
- [ ] Labels describe purpose of form fields
- [ ] Labels positioned before/above fields

---

### 2.5 Input Modalities

**Guideline**: Make it easier to operate functionality through various inputs

#### Pointer Gestures
- [ ] Multi-point gestures have single-pointer alternative
- [ ] Path-based gestures have single-pointer alternative

**Note**: No complex gestures in tier implementation

#### Pointer Cancellation
- [ ] Click events on up-event (not down-event)
- [ ] Actions can be aborted before completion

#### Label in Name
- [ ] Visible label text matches accessible name
- [ ] Button text matches `aria-label` (if both present)

**Test Method**:
```typescript
it('visible label matches accessible name', () => {
  render(<Button>Save Profile</Button>);
  const button = screen.getByRole('button', { name: /save profile/i });
  expect(button).toHaveTextContent(/save profile/i);
});
```

#### Motion Actuation
- [ ] Motion-triggered actions have UI alternative
- [ ] Motion actuation can be disabled

**Note**: No motion actuation in tier implementation

---

## Principle 3: Understandable

### 3.1 Readable

**Guideline**: Make text content readable and understandable

#### Language of Page
- [ ] Page language defined (`<html lang="en">`)
- [ ] Language changes marked up (`<span lang="fr">`)

#### Language of Parts
- [ ] Foreign phrases marked with language
- [ ] Proper names don't need language markup

---

### 3.2 Predictable

**Guideline**: Make web pages appear and operate in predictable ways

#### On Focus
- [ ] Focus doesn't trigger unexpected context changes
- [ ] Focus doesn't submit forms
- [ ] Focus doesn't open dialogs unexpectedly

**Test Method**:
```typescript
it('focus does not trigger unexpected changes', () => {
  const onChange = jest.fn();
  render(<Input onChange={onChange} />);

  const input = screen.getByRole('textbox');
  input.focus();

  expect(onChange).not.toHaveBeenCalled();
});
```

#### On Input
- [ ] Typing doesn't trigger unexpected changes
- [ ] Dropdown selection doesn't auto-submit
- [ ] Checkbox click doesn't navigate away

#### Consistent Navigation
- [ ] Navigation menu in same location on all pages
- [ ] Navigation order consistent across pages
- [ ] Breadcrumbs follow same pattern

#### Consistent Identification
- [ ] Icons used consistently across site
- [ ] Tier badges styled consistently
- [ ] Buttons have consistent styling
- [ ] Form fields follow same patterns

---

### 3.3 Input Assistance

**Guideline**: Help users avoid and correct mistakes

#### Error Identification
- [ ] Errors identified in text
- [ ] Error location clearly indicated
- [ ] Errors described in text, not just color

**Test Method**:
```typescript
it('validation errors are clearly identified', async () => {
  render(<Form />);

  await submitForm();

  await waitFor(() => {
    const errorMessage = screen.getByRole('alert');
    expect(errorMessage).toHaveTextContent(/email is required/i);

    const errorField = screen.getByLabelText(/email/i);
    expect(errorField).toHaveAttribute('aria-invalid', 'true');
    expect(errorField).toHaveAttribute('aria-describedby');
  });
});
```

**Components Requiring Error Testing**:
- [ ] BasicInfoForm
- [ ] BrandStoryForm
- [ ] CertificationsAwardsManager
- [ ] CaseStudiesManager
- [ ] TeamMembersManager

#### Labels or Instructions
- [ ] Form fields have labels
- [ ] Required fields marked
- [ ] Input format described (e.g., "YYYY-MM-DD")
- [ ] Character limits shown

**Test Method**:
```typescript
it('required fields are marked', () => {
  render(<Form />);

  const requiredFields = screen.getAllByLabelText(/\*/);
  expect(requiredFields.length).toBeGreaterThan(0);
});
```

#### Error Suggestion
- [ ] Validation errors suggest corrections
- [ ] Examples provided for complex formats
- [ ] Clear instructions for fixing errors

**Examples**:
- "Email must be in format: user@example.com"
- "Founded year must be between 1800 and 2025"
- "Password must be at least 8 characters"

#### Error Prevention
- [ ] Confirmation for destructive actions (delete)
- [ ] Review step before final submission
- [ ] Ability to reverse actions (undo)

**Test Method**:
```typescript
it('confirms before deleting', () => {
  render(<ArrayManager />);

  const deleteButton = screen.getByRole('button', { name: /delete/i });
  fireEvent.click(deleteButton);

  expect(screen.getByRole('dialog')).toBeInTheDocument();
  expect(screen.getByText(/are you sure/i)).toBeInTheDocument();
});
```

---

## Principle 4: Robust

### 4.1 Compatible

**Guideline**: Maximize compatibility with current and future tools

#### Parsing
- [ ] HTML validates (no duplicate IDs, proper nesting)
- [ ] Proper opening and closing tags
- [ ] Unique ID attributes

**Test Method**: Use W3C HTML Validator

#### Name, Role, Value
- [ ] All interactive elements have accessible name
- [ ] All interactive elements have correct role
- [ ] States and properties communicated to AT

**Test Method**:
```typescript
it('custom components have proper ARIA attributes', () => {
  render(<CustomDropdown />);

  const dropdown = screen.getByRole('combobox');
  expect(dropdown).toHaveAttribute('aria-expanded');
  expect(dropdown).toHaveAttribute('aria-haspopup');
  expect(dropdown).toHaveAttribute('aria-controls');
});
```

**ARIA Attributes to Verify**:
- [ ] `aria-label` on icon buttons
- [ ] `aria-labelledby` on form fields
- [ ] `aria-describedby` on fields with hints/errors
- [ ] `aria-invalid` on fields with errors
- [ ] `aria-required` on required fields
- [ ] `aria-expanded` on expandable elements
- [ ] `aria-selected` on selected items
- [ ] `aria-checked` on checkboxes
- [ ] `aria-live` on dynamic content
- [ ] `aria-modal` on modal dialogs

---

## Component-Specific Checklists

### ProfileEditTabs

- [ ] Tabs use proper `role="tablist"` structure
- [ ] Tab triggers have `role="tab"`
- [ ] Tab panels have `role="tabpanel"`
- [ ] Active tab has `aria-selected="true"`
- [ ] Tab panels have `aria-labelledby` pointing to tab
- [ ] Arrow keys navigate between tabs
- [ ] Tab key moves focus into tab panel
- [ ] Home/End keys jump to first/last tab

**Test Method**:
```typescript
it('tabs follow ARIA tablist pattern', () => {
  render(<ProfileEditTabs />);

  const tablist = screen.getByRole('tablist');
  expect(tablist).toBeInTheDocument();

  const tabs = screen.getAllByRole('tab');
  expect(tabs[0]).toHaveAttribute('aria-selected', 'true');

  const tabpanel = screen.getByRole('tabpanel');
  expect(tabpanel).toHaveAttribute('aria-labelledby');
});
```

---

### Modal Dialogs

- [ ] Dialog has `role="dialog"`
- [ ] Dialog has `aria-modal="true"`
- [ ] Dialog has `aria-labelledby` pointing to title
- [ ] Dialog has `aria-describedby` pointing to description
- [ ] Focus trapped within dialog
- [ ] First focusable element receives focus on open
- [ ] Focus returns to trigger on close
- [ ] ESC key closes dialog

**Test Method**:
```typescript
it('dialog follows ARIA dialog pattern', () => {
  render(<Dialog open={true} />);

  const dialog = screen.getByRole('dialog');
  expect(dialog).toHaveAttribute('aria-modal', 'true');
  expect(dialog).toHaveAttribute('aria-labelledby');

  const title = screen.getByRole('heading', { name: /dialog title/i });
  expect(dialog.getAttribute('aria-labelledby')).toBe(title.id);
});
```

---

### Forms

- [ ] Form has `role="form"` or is a `<form>` element
- [ ] All fields have associated labels
- [ ] Required fields marked with `aria-required="true"`
- [ ] Error fields marked with `aria-invalid="true"`
- [ ] Errors linked via `aria-describedby`
- [ ] Fieldsets group related fields
- [ ] Success messages announced with `aria-live`

**Test Method**:
```typescript
it('form follows accessibility best practices', () => {
  render(<BasicInfoForm />);

  const form = screen.getByRole('form');
  expect(form).toBeInTheDocument();

  const requiredField = screen.getByLabelText(/company name/i);
  expect(requiredField).toHaveAttribute('aria-required', 'true');
});
```

---

### Data Tables

- [ ] Table has `<caption>` or `aria-label`
- [ ] Headers use `<th>` with `scope` attribute
- [ ] Complex tables have `aria-rowcount`, `aria-colcount`
- [ ] Sortable columns announce sort state

**Note**: Limited table usage in tier implementation

---

## Automated Testing Setup

### jest-axe Integration

```typescript
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

describe('Accessibility Tests', () => {
  it('has no accessibility violations', async () => {
    const { container } = render(<Component />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

### ESLint jsx-a11y Setup

```json
{
  "extends": ["plugin:jsx-a11y/recommended"],
  "rules": {
    "jsx-a11y/anchor-is-valid": "error",
    "jsx-a11y/alt-text": "error",
    "jsx-a11y/aria-props": "error",
    "jsx-a11y/aria-proptypes": "error",
    "jsx-a11y/aria-unsupported-elements": "error",
    "jsx-a11y/click-events-have-key-events": "error",
    "jsx-a11y/heading-has-content": "error",
    "jsx-a11y/label-has-associated-control": "error",
    "jsx-a11y/no-autofocus": "warn"
  }
}
```

---

## Manual Testing Checklist

### Screen Reader Testing

**Tools**: NVDA (Windows), VoiceOver (Mac), JAWS (Windows)

- [ ] All headings announced correctly
- [ ] All form labels announced
- [ ] All buttons announced with purpose
- [ ] All links announced with destination
- [ ] Form errors announced
- [ ] Dynamic content changes announced
- [ ] Modal dialogs announced
- [ ] Loading states announced

### Keyboard-Only Testing

- [ ] Complete entire user flow without mouse
- [ ] All interactive elements reachable
- [ ] Focus visible at all times
- [ ] No keyboard traps
- [ ] Shortcuts work as expected

### Zoom Testing

- [ ] Test at 200% zoom
- [ ] No horizontal scrolling
- [ ] All content readable
- [ ] All controls usable

### Color Contrast Testing

**Tools**: WebAIM Contrast Checker, browser DevTools

- [ ] All text meets 4.5:1 ratio
- [ ] All interactive elements meet 3:1 ratio
- [ ] Focus indicators meet 3:1 ratio

---

## Success Criteria

**Component Complete When**:
- [ ] Automated tests pass (jest-axe)
- [ ] Manual keyboard test passes
- [ ] Manual screen reader test passes
- [ ] Color contrast verified
- [ ] All applicable WCAG criteria met

**Feature Complete When**:
- [ ] All components pass accessibility tests
- [ ] User flows tested end-to-end
- [ ] Accessibility documentation complete
- [ ] Team trained on accessibility requirements

---

**Document Version**: 1.0
**Last Updated**: 2025-10-24
**Compliance Target**: WCAG 2.1 Level AA
**Next Review**: After implementation completion
