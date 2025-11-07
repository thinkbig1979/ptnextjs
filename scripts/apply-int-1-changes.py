#!/usr/bin/env python3
"""
Script to apply INT-1 integration changes to ExcelImportCard.tsx
"""

import re

# Read the file
file_path = 'components/dashboard/ExcelImportCard.tsx'
with open(file_path, 'r') as f:
    content = f.read()

# 1. Add import statement after UpgradePromptCard
content = content.replace(
    "import { UpgradePromptCard } from './UpgradePromptCard';",
    "import { UpgradePromptCard } from './UpgradePromptCard';\nimport { uploadFile } from '@/lib/utils/file-upload';"
)

# 2. Replace handleUploadAndValidate function
old_upload_function = r'''  \/\*\*
   \* Upload file and validate \(preview phase\)
   \*\/
  const handleUploadAndValidate = useCallback\(async \(\) => \{
    if \(!file \|\| !vendor\) \{
      toast\.error\('Error', \{
        description: 'No file selected or vendor information unavailable'
      \}\);
      return;
    \}

    try \{
      setPhase\('uploading'\);
      setUploadProgress\(0\);
      setError\(null\);

      \/\/ Simulate upload progress
      const progressInterval = setInterval\(\(\) => \{
        setUploadProgress\(\(prev\) => Math\.min\(prev \+ 10, 90\)\);
      \}, 100\);

      \/\/ Create form data
      const formData = new FormData\(\);
      formData\.append\('file', file\);

      \/\/ Upload and validate
      const response = await fetch\(
        `\/api\/portal\/vendors\/\$\{vendor\.id\}\/excel-import\?phase=preview`,
        \{
          method: 'POST',
          body: formData,
        \}
      \);

      clearInterval\(progressInterval\);
      setUploadProgress\(100\);

      if \(!response\.ok\) \{
        const errorData = await response\.json\(\)\.catch\(\(\) => \(\{\}\)\);
        throw new Error\(errorData\.error \|\| 'Upload failed'\);
      \}

      const data: PreviewResponse = await response\.json\(\);

      setPhase\('validating'\);

      \/\/ Brief validating state
      await new Promise\(resolve => setTimeout\(resolve, 500\)\);

      setParseResult\(data\.parseResult\);
      setValidationResult\(data\.validationResult\);
      setPhase\('preview'\);

      if \(data\.validationResult\.valid\) \{
        toast\.success\('Validation successful', \{
          description: `\$\{data\.validationResult\.summary\.totalRows\} rows ready for import`
        \}\);
      \} else \{
        toast\.warning\('Validation errors found', \{
          description: `\$\{data\.validationResult\.summary\.errorRows\} rows have errors`
        \}\);
      \}

    \} catch \(error\) \{
      console\.error\('Upload\/validation error:', error\);
      const errorMessage = error instanceof Error \? error\.message : 'Upload failed';
      setError\(errorMessage\);
      setPhase\('idle'\);
      toast\.error\('Upload failed', \{
        description: errorMessage
      \}\);
    \}
  \}, \[file, vendor\]\);'''

new_upload_function = '''  /**
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
  }, [file, vendor]);'''

# Use non-regex replacement for complex function
# Find the start and end of the function
start_marker = "  /**\n   * Upload file and validate (preview phase)\n   */"
end_marker = "  }, [file, vendor]);"

# Find handleUploadAndValidate
start_idx = content.find(start_marker)
if start_idx != -1:
    # Find the matching end
    temp_idx = content.find(end_marker, start_idx)
    if temp_idx != -1:
        end_idx = temp_idx + len(end_marker)
        # Replace the function
        content = content[:start_idx] + new_upload_function + content[end_idx:]

# 3. Replace handleExecuteImport function similarly
new_execute_function = '''  /**
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
  }, [file, vendor, validationResult]);'''

start_marker_execute = "  /**\n   * Execute import after validation\n   */"
end_marker_execute = "  }, [file, vendor, validationResult]);"

start_idx = content.find(start_marker_execute)
if start_idx != -1:
    temp_idx = content.find(end_marker_execute, start_idx)
    if temp_idx != -1:
        end_idx = temp_idx + len(end_marker_execute)
        content = content[:start_idx] + new_execute_function + content[end_idx:]

# 4. Update upload progress display
content = content.replace(
    "                {file?.name} ({(file?.size || 0 / 1024).toFixed(1)} KB)",
    "                {file?.name} ({(file?.size || 0 / 1024).toFixed(1)} KB) - {uploadProgress}%"
)

# Write the updated content
with open(file_path, 'w') as f:
    f.write(content)

print("✅ Successfully applied INT-1 integration changes to ExcelImportCard.tsx")
print("Changes made:")
print("  1. Added uploadFile import")
print("  2. Updated handleUploadAndValidate with file-upload utility")
print("  3. Updated handleExecuteImport with file-upload utility")
print("  4. Enhanced progress display with percentage")
