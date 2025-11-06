# Task INT-1: Integrate File Upload with API

**Status:** 🔒 Blocked (waiting for BE-11,FE-4,FE-8)
**Agent:** integration-coordinator
**Estimated Time:** 4 hours
**Phase:** Frontend-Backend Integration
**Dependencies:** BE-11, FE-4, FE-8

## Objective

Integrate the frontend file upload workflow with the backend import API, ensuring proper multipart/form-data handling, progress tracking, and error handling.

## Context Requirements

- Review BE-11: Excel import API route implementation
- Review FE-4: ExcelImportCard component
- Review FE-8: File upload utilities
- Review error handling strategy from PRE-2

## Acceptance Criteria

- [ ] File upload successfully sends to API
- [ ] Progress tracking works throughout upload
- [ ] Preview phase returns validation results correctly
- [ ] Execute phase triggers import successfully
- [ ] Error responses handled gracefully
- [ ] Network errors caught and displayed
- [ ] Timeout handling (large files)
- [ ] CORS issues resolved (if any)
- [ ] Content-Type headers correct
- [ ] End-to-end flow tested manually

## Detailed Specifications

### Integration Points

1. **File Upload to Preview API**
```typescript
// In ExcelImportCard component
const handleFileUpload = async (file: File) => {
  setPhase('uploading');

  const response = await uploadFile({
    url: `/api/portal/vendors/${vendorId}/excel-import?phase=preview`,
    file,
    onProgress: (progress) => {
      setUploadProgress(progress.percentage);
    }
  });

  if (!response.ok) {
    // Handle error
    const error = await response.json();
    toast({
      title: 'Upload failed',
      description: error.message || 'Please try again',
      variant: 'destructive'
    });
    setPhase('idle');
    return;
  }

  const result = await response.json();
  setValidationResult(result.validationResult);
  setParseResult(result.parseResult);
  setPhase('preview');
};
```

2. **Import Execution**
```typescript
const handleConfirmImport = async () => {
  setPhase('importing');

  const response = await uploadFile({
    url: `/api/portal/vendors/${vendorId}/excel-import?phase=execute`,
    file: selectedFile,
    additionalData: {
      confirmed: 'true'
    }
  });

  if (!response.ok) {
    // Handle error
    setPhase('preview');
    return;
  }

  const result = await response.json();
  setExecutionResult(result.executionResult);
  setPhase('complete');

  toast({
    title: 'Import successful',
    description: `${result.executionResult.successfulRows} rows imported successfully`
  });
};
```

### Error Handling Strategy

**Network Errors:**
- Connection timeout: Show retry button
- 413 Payload Too Large: Inform user about size limit
- 500 Server Error: Show generic error + retry
- 401/403: Redirect to login or show permission error

**Validation Errors:**
- Display in preview dialog
- Allow user to cancel and fix Excel file
- Highlight problematic rows/fields

**Import Errors:**
- Show detailed error message
- Preserve uploaded file for retry
- Log error for debugging

## Testing Requirements

### Integration Tests

```typescript
describe('File Upload Integration', () => {
  it('should upload file and receive validation results');
  it('should handle progress tracking');
  it('should execute import after confirmation');
  it('should handle network errors gracefully');
  it('should handle 413 payload too large');
  it('should handle 401 unauthorized');
  it('should handle validation errors');
  it('should handle import execution errors');
});
```

### Manual Testing Checklist

- [ ] Upload small file (<1MB) - works
- [ ] Upload large file (4-5MB) - shows progress
- [ ] Upload file >5MB - rejected with clear message
- [ ] Upload non-Excel file - rejected
- [ ] Upload file with validation errors - shows errors
- [ ] Confirm import after validation - executes successfully
- [ ] Test with slow network (throttle in DevTools)
- [ ] Test with network disconnection
- [ ] Test with invalid authentication token

## Evidence Requirements

- [ ] Integration tests passing
- [ ] Manual test checklist completed
- [ ] Screenshots of successful upload flow
- [ ] Screenshots of error handling
- [ ] Video recording of complete workflow (optional)

## Implementation Notes

- Use XMLHttpRequest for upload progress (fetch doesn't support progress)
- Handle file size limits both client and server side
- Implement exponential backoff for retries
- Log errors for debugging but don't expose sensitive info to user
- Test with various network conditions

## Next Steps

This integration is required for:
- INT-2: Validation preview flow
- INT-3: Progress tracking
- INT-4: End-to-end workflow testing

## Success Metrics

- File uploads work reliably
- Progress tracking is accurate
- Error messages are user-friendly
- No silent failures
- Zero data loss during upload
