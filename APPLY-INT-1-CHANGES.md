# How to Apply INT-1 Integration Changes

## Quick Summary

The integration tests have been created at:
- `/home/edwin/development/ptnextjs/__tests__/integration/file-upload-integration.test.tsx`

The ExcelImportCard component needs 4 small changes to integrate with the file-upload utility.

## Option 1: Automatic Application (Recommended)

Run this command from the project root:

```bash
cd /home/edwin/development/ptnextjs

# Create backup
cp components/dashboard/ExcelImportCard.tsx components/dashboard/ExcelImportCard.tsx.backup

# Apply changes using sed
sed -i "12 a import { uploadFile } from '@/lib/utils/file-upload';" components/dashboard/ExcelImportCard.tsx
```

Then manually update the two functions as shown in Option 2 below.

## Option 2: Manual Changes

Edit `/home/edwin/development/ptnextjs/components/dashboard/ExcelImportCard.tsx`:

### Change 1: Add Import (Line 12)
After the line:
```typescript
import { UpgradePromptCard } from './UpgradePromptCard';
```

Add:
```typescript
import { uploadFile } from '@/lib/utils/file-upload';
```

### Change 2: Update handleUploadAndValidate Function (Lines ~211-280)

Replace the entire function with this version that uses `uploadFile`:

```typescript
  /**
   * Upload file and validate (preview phase)
   * Integrated with file-upload utilities for progress tracking
   */
  const handleUploadAndValidate = useCallback(async () => {
    if (!file || !vendor) {
      toast.error('Error', {
        description: 'No file selected or vendor information unavailable'
      });
      return;
    }

    try {
      setPhase('uploading');
      setUploadProgress(0);
      setError(null);

      // Upload and validate using the file-upload utility
      const response = await uploadFile({
        url: `/api/portal/vendors/${vendor.id}/excel-import?phase=preview`,
        file,
        onProgress: (progress) => {
          setUploadProgress(progress.percentage);
        }
      });

      if (!response.ok) {
        // Handle specific HTTP status codes
        if (response.status === 401) {
          throw new Error('Authentication required. Please log in again.');
        }

        if (response.status === 403) {
          throw new Error('You do not have permission to perform this action.');
        }

        if (response.status === 413) {
          throw new Error('File size exceeds the maximum limit of 5MB. Please upload a smaller file.');
        }

        if (response.status === 500) {
          throw new Error('Server error occurred. Please try again later.');
        }

        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Upload failed with status ${response.status}`);
      }

      const data: PreviewResponse = await response.json();

      setPhase('validating');

      // Brief validating state
      await new Promise(resolve => setTimeout(resolve, 500));

      setParseResult(data.parseResult);
      setValidationResult(data.validationResult);
      setPhase('preview');

      if (data.validationResult.valid) {
        toast.success('Validation successful', {
          description: `${data.validationResult.summary.totalRows} rows ready for import`
        });
      } else {
        toast.warning('Validation errors found', {
          description: `${data.validationResult.summary.errorRows} rows have errors`
        });
      }

    } catch (error) {
      console.error('Upload/validation error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      setError(errorMessage);
      setPhase('idle');

      // Show appropriate toast based on error type
      if (errorMessage.includes('Authentication') || errorMessage.includes('permission')) {
        toast.error('Access Denied', {
          description: errorMessage
        });
      } else if (errorMessage.includes('size exceeds')) {
        toast.error('File Too Large', {
          description: errorMessage
        });
      } else if (errorMessage.includes('Server error')) {
        toast.error('Server Error', {
          description: errorMessage,
          action: {
            label: 'Retry',
            onClick: () => handleUploadAndValidate()
          }
        });
      } else if (errorMessage.includes('network') || errorMessage.includes('fetch') || errorMessage.includes('Failed to fetch')) {
        toast.error('Network Error', {
          description: 'Please check your connection and try again.',
          action: {
            label: 'Retry',
            onClick: () => handleUploadAndValidate()
          }
        });
      } else {
        toast.error('Upload failed', {
          description: errorMessage
        });
      }
    }
  }, [file, vendor]);
```

### Change 3: Update handleExecuteImport Function (Lines ~285-341)

Replace the entire function with:

```typescript
  /**
   * Execute import after validation
   * Integrated with file-upload utilities
   */
  const handleExecuteImport = useCallback(async () => {
    if (!file || !vendor || !validationResult?.valid) {
      toast.error('Error', {
        description: 'Cannot execute import with validation errors'
      });
      return;
    }

    try {
      setPhase('importing');
      setError(null);

      // Execute import using the file-upload utility
      const response = await uploadFile({
        url: `/api/portal/vendors/${vendor.id}/excel-import?phase=execute`,
        file,
        additionalData: {
          confirmed: 'true'
        }
      });

      if (!response.ok) {
        // Handle specific HTTP status codes
        if (response.status === 401) {
          throw new Error('Authentication required. Please log in again.');
        }

        if (response.status === 403) {
          throw new Error('You do not have permission to perform this action.');
        }

        if (response.status === 500) {
          throw new Error('Server error occurred during import. Please try again later.');
        }

        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Import failed');
      }

      const data: ExecuteResponse = await response.json();

      setPhase('complete');

      if (data.executionResult.success) {
        toast.success('Import successful', {
          description: `Successfully imported ${data.executionResult.summary.successCount} records`
        });
      } else {
        toast.warning('Import completed with errors', {
          description: `${data.executionResult.summary.successCount} successful, ${data.executionResult.summary.errorCount} failed`
        });
      }

      // Refresh vendor data
      // TODO: Add vendor data refresh when context supports it

    } catch (error) {
      console.error('Import execution error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Import failed';
      setError(errorMessage);
      setPhase('preview');

      // Show appropriate toast based on error type
      if (errorMessage.includes('Authentication') || errorMessage.includes('permission')) {
        toast.error('Access Denied', {
          description: errorMessage
        });
      } else if (errorMessage.includes('Server error')) {
        toast.error('Server Error', {
          description: errorMessage,
          action: {
            label: 'Retry',
            onClick: () => handleExecuteImport()
          }
        });
      } else if (errorMessage.includes('network') || errorMessage.includes('fetch') || errorMessage.includes('Failed to fetch')) {
        toast.error('Network Error', {
          description: 'Please check your connection and try again.',
          action: {
            label: 'Retry',
            onClick: () => handleExecuteImport()
          }
        });
      } else {
        toast.error('Import failed', {
          description: errorMessage
        });
      }
    }
  }, [file, vendor, validationResult]);
```

### Change 4: Add Progress Percentage Display (Line ~493-495)

Find this line:
```typescript
                {file?.name} ({(file?.size || 0 / 1024).toFixed(1)} KB)
```

Replace with:
```typescript
                {file?.name} ({(file?.size || 0 / 1024).toFixed(1)} KB) - {uploadProgress}%
```

## Verification

After making the changes, verify with:

```bash
# Type check
npm run type-check

# Run tests
npm run test -- file-upload-integration

# Start dev server and test manually
npm run dev
```

## What Changed

### Before INT-1:
- Used `fetch()` directly (no progress tracking)
- Simulated progress with `setInterval`
- Generic error messages
- No retry functionality

### After INT-1:
- Uses `uploadFile()` utility (real progress via XMLHttpRequest)
- Accurate progress percentage
- Specific error messages for each HTTP status
- Retry buttons for network/server errors
- Better user experience

## Files Created

1. `/home/edwin/development/ptnextjs/__tests__/integration/file-upload-integration.test.tsx`
2. `/home/edwin/development/ptnextjs/INT-1-INTEGRATION-SUMMARY.md`
3. `/home/edwin/development/ptnextjs/APPLY-INT-1-CHANGES.md` (this file)

## Task Status

- ✅ Integration tests created
- ⚠️ ExcelImportCard.tsx needs manual update (4 changes above)
- ✅ File upload utility works as-is (no changes needed)

Once you apply the 4 changes above, INT-1 will be complete!
