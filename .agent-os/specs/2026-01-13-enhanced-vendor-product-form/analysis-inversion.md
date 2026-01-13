# Inversion Analysis: Enhanced Vendor Product Form

**Purpose**: Transform "what should work" to "what could fail" to preemptively address failure modes.

## Failure Mode Analysis

### FM-1: Form Complexity Overwhelms Users

**What Could Fail**: Vendors see a massive form with 25+ fields and abandon product creation.

**Prevention**:
- Progressive disclosure with collapsible sections
- Default to collapsed state for advanced sections
- Clear section headers indicating tier requirements
- "Quick Create" mode that shows only essential fields
- Progress indicator showing completion percentage

**Detection**:
- Track form abandonment rate (started but not submitted)
- Heatmap analysis on which sections get expanded
- Time-on-form metrics

**Recovery**:
- Autosave drafts to localStorage every 30 seconds
- Resume from draft on return
- "Save as Draft" explicit button

---

### FM-2: Image URL Validation Causes Frustration

**What Could Fail**: Users enter invalid image URLs and only discover issues on form submit.

**Prevention**:
- Validate URL format on blur
- Async check that URL returns valid image (with timeout)
- Show thumbnail preview on successful validation
- Clear error state with suggested fix

**Detection**:
- Track validation error frequency by field
- Monitor time between image entry and successful validation

**Recovery**:
- Allow saving with invalid URLs (soft validation warning)
- Provide "Skip for now" option
- Image placeholder shows on product page if URL fails

---

### FM-3: Array Fields Lose Data

**What Could Fail**: Adding/removing items in arrays (images, specs, features) causes data loss or corruption.

**Prevention**:
- Use React Hook Form's `useFieldArray` with stable keys
- Confirm before removing items ("Remove this specification?")
- Undo capability for removals (toast with undo button)
- Never mutate array in place; always create new arrays

**Detection**:
- Log array operations (add/remove/reorder)
- Track "removed then re-added" patterns
- Monitor form state consistency

**Recovery**:
- Autosave includes array state
- Backend accepts partial arrays gracefully
- API returns what was actually saved for verification

---

### FM-4: Tier Gating Confusion

**What Could Fail**: Free/Tier 1 vendors see locked fields, get frustrated, or try to bypass restrictions.

**Prevention**:
- Clear visual indication of tier requirements per section
- "Upgrade to unlock" messaging with value proposition
- Hide locked sections entirely OR show greyed-out preview
- Consistent tier messaging across platform

**Detection**:
- Track clicks on locked sections
- Monitor tier upgrade conversions from product form
- Support tickets about "missing" features

**Recovery**:
- If vendor upgrades mid-session, refresh to unlock fields
- No data loss on tier change
- Grace period for downgraded vendors to edit existing products

---

### FM-5: Category/Tag Selection Performance

**What Could Fail**: Large category/tag lists cause slow rendering or difficult selection.

**Prevention**:
- Use virtualized dropdown (react-select with virtualization)
- Search/filter functionality in multi-select
- Limit visible items, show "and X more" with expand
- Pre-fetch categories/tags on form open

**Detection**:
- Monitor dropdown open-to-select time
- Track search usage in multi-selects
- Measure render time with large lists

**Recovery**:
- Fallback to simple checkboxes if virtualization fails
- Server-side search for very large lists
- Cache category/tag lists in session

---

### FM-6: Form Submission Fails Silently

**What Could Fail**: Network error or validation failure doesn't communicate clearly to user.

**Prevention**:
- Disable submit button during submission
- Show loading state with spinner
- Display specific error messages from API
- Highlight fields with validation errors
- Scroll to first error

**Detection**:
- Track submission attempts vs successes
- Log all API errors with context
- Monitor retry patterns

**Recovery**:
- Retry button for network errors
- Form state preserved on failure
- "Try again" with last known good state

---

### FM-7: Backend Schema Mismatch

**What Could Fail**: Frontend sends data that backend/Payload CMS rejects (schema drift).

**Prevention**:
- Shared Zod schemas between frontend and API
- Type safety with TypeScript end-to-end
- API returns detailed validation errors
- Schema version checking

**Detection**:
- Log all ValidationError instances
- Alert on new error types
- E2E tests catch schema drift

**Recovery**:
- API accepts partial valid data where possible
- Frontend strips unknown fields
- Clear error message: "Field X is not supported"

---

### FM-8: Mobile Form Unusability

**What Could Fail**: Complex form is unusable on mobile devices.

**Prevention**:
- Responsive design with mobile-first approach
- Sheet/drawer instead of modal for mobile
- Larger touch targets (min 44px)
- Simplified layout on small screens
- Consider mobile-specific flow

**Detection**:
- Track device type on form interactions
- Monitor mobile abandonment rate
- Usability testing on real devices

**Recovery**:
- "Continue on desktop" option
- Email draft link to self
- Minimum viable mobile form (basic fields only)

---

### FM-9: Accessibility Violations

**What Could Fail**: Dynamic form sections are inaccessible to screen reader users.

**Prevention**:
- Proper ARIA labels for all controls
- Live regions for dynamic content
- Focus management on section expand/collapse
- Keyboard navigation for all actions
- Test with actual screen readers

**Detection**:
- Automated a11y testing (axe-core)
- Manual screen reader testing
- User feedback from a11y community

**Recovery**:
- Alternative text-based input for complex controls
- Accessible error summaries
- Skip links within form

---

### FM-10: Concurrent Edit Conflicts

**What Could Fail**: Two sessions (or admin + vendor) edit same product simultaneously.

**Prevention**:
- Last-write-wins with timestamp
- Show "edited by X at Y" warning
- Optimistic locking (version number)
- Consider real-time collaboration (future)

**Detection**:
- Log conflicting save attempts
- Track products with frequent edit conflicts
- Alert on version mismatches

**Recovery**:
- Show diff of conflicting changes
- Allow merge or override choice
- Preserve both versions temporarily

## Priority Matrix

| Failure Mode | Likelihood | Impact | Priority |
|--------------|------------|--------|----------|
| FM-1: Form Complexity | High | High | **P0** |
| FM-2: Image URL Validation | Medium | Medium | P1 |
| FM-3: Array Data Loss | Medium | High | **P0** |
| FM-4: Tier Gating Confusion | Medium | Medium | P1 |
| FM-5: Category/Tag Performance | Low | Medium | P2 |
| FM-6: Silent Submit Failure | Medium | High | **P0** |
| FM-7: Schema Mismatch | Low | High | P1 |
| FM-8: Mobile Unusability | Medium | Medium | P1 |
| FM-9: Accessibility | Medium | High | **P0** |
| FM-10: Concurrent Edits | Low | Medium | P2 |

## Implementation Checkpoints

1. **Before starting UI work**: Verify all fields in schema match API expectations
2. **After each section**: Test with screen reader, verify keyboard navigation
3. **Before integration**: Load test with maximum array sizes
4. **Before release**: Mobile usability testing, tier gating verification
