# Task INT-2: Integrate Validation Preview Flow

**Status:** 🔒 Blocked (waiting for BE-11,FE-6,FE-7)
**Agent:** integration-coordinator
**Estimated Time:** 3 hours
**Phase:** Frontend-Backend Integration
**Dependencies:** BE-11, FE-6, FE-7

## Objective

Integrate the validation preview dialog with backend validation results, ensuring errors and warnings are displayed clearly and users can make informed decisions.

## Context Requirements

- Review BE-6: ImportValidationService output format
- Review FE-6: ExcelPreviewDialog component
- Review FE-7: ValidationErrorsTable component

## Acceptance Criteria

- [ ] Validation results from API correctly displayed in preview dialog
- [ ] All validation error types properly formatted
- [ ] Row numbers match between API and UI
- [ ] Field names correctly mapped
- [ ] Suggestions displayed where available
- [ ] Error counts accurate in summary
- [ ] Confirm button disabled when errors exist
- [ ] Warnings allow import but show clear indicators
- [ ] Data preview shows highlighted errors
- [ ] Changes preview accurate

## Detailed Specifications

### Data Flow

```
API Response → Transform → ExcelPreviewDialog → ValidationErrorsTable
```

### Transformation Logic

```typescript
// Transform API validation result to UI format
function transformValidationResult(apiResult: any) {
  return {
    summary: {
      totalRows: apiResult.summary.totalRows,
      validRows: apiResult.summary.validRows,
      errorRows: apiResult.summary.errorRows,
      warningRows: apiResult.summary.warningRows,
      canImport: apiResult.valid
    },
    rows: apiResult.rows.map(row => ({
      rowNumber: row.rowNumber,
      hasErrors: row.errors.length > 0,
      hasWarnings: row.warnings.length > 0,
      data: row.data,
      errors: row.errors,
      warnings: row.warnings
    })),
    errorsByField: apiResult.errorsByField
  };
}
```

### UI Integration Points

1. **Summary Display**
- Show total counts prominently
- Color-code by severity (red for errors, yellow for warnings)
- Display "Ready to Import" or "Cannot Import" status

2. **Errors Tab**
- Group errors by field or row
- Allow sorting and filtering
- Show error codes and messages
- Display suggestions

3. **Data Preview Tab**
- Highlight rows with errors (red background)
- Highlight rows with warnings (yellow background)
- Show tooltips on hover with error details

## Testing Requirements

### Integration Tests

```typescript
describe('Validation Preview Integration', () => {
  it('should display validation results correctly');
  it('should show error counts in summary');
  it('should highlight error rows');
  it('should display error messages');
  it('should show suggestions');
  it('should disable confirm for errors');
  it('should allow confirm with warnings');
  it('should group errors by field');
});
```

### Manual Testing

- [ ] Upload file with validation errors
- [ ] Verify error counts match API response
- [ ] Verify all errors displayed in table
- [ ] Verify row highlighting works
- [ ] Verify suggestions shown
- [ ] Verify confirm button state

## Evidence Requirements

- [ ] Integration tests passing
- [ ] Manual testing completed
- [ ] Screenshots showing error display
- [ ] Error highlighting visible

## Success Metrics

- Validation results clearly communicated
- Users understand what needs fixing
- No data loss in transformation
- UI matches API response exactly
