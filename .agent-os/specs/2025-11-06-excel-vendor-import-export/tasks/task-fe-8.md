# Task FE-8: Create File Upload Utilities

**Status:** 🔒 Blocked (waiting for FE-4)
**Agent:** frontend-react-specialist
**Estimated Time:** 2 hours
**Phase:** Frontend Implementation
**Dependencies:** FE-4

## Objective

Create reusable utility functions for file upload handling.

## Context Requirements

- Review file validation requirements (5MB, .xlsx only)
- Review multipart/form-data handling in Next.js
- Review progress tracking patterns

## Acceptance Criteria

- [ ] File created at `/home/edwin/development/ptnextjs/lib/utils/file-upload.ts`
- [ ] File validation function (type, size, extension)
- [ ] Upload with progress tracking
- [ ] FormData builder for multipart uploads
- [ ] Error handling utilities
- [ ] Type-safe interfaces
- [ ] JSDoc documentation

## Detailed Specifications

```typescript
// /home/edwin/development/ptnextjs/lib/utils/file-upload.ts

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface UploadOptions {
  url: string;
  file: File;
  onProgress?: (progress: UploadProgress) => void;
  additionalData?: Record<string, string>;
}

/**
 * Validate file for Excel import
 */
export function validateExcelFile(file: File): FileValidationResult {
  const MAX_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPES = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel'
  ];
  const ALLOWED_EXTENSIONS = ['.xlsx', '.xls'];

  // Check file size
  if (file.size > MAX_SIZE) {
    return {
      valid: false,
      error: `File size exceeds ${MAX_SIZE / 1024 / 1024}MB limit`
    };
  }

  // Check file type
  if (!ALLOWED_TYPES.includes(file.type)) {
    // Fallback to extension check
    const extension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      return {
        valid: false,
        error: 'Invalid file type. Please upload .xlsx or .xls files only'
      };
    }
  }

  return { valid: true };
}

/**
 * Upload file with progress tracking
 */
export async function uploadFile(options: UploadOptions): Promise<Response> {
  const formData = new FormData();
  formData.append('file', options.file);

  // Add additional data if provided
  if (options.additionalData) {
    Object.entries(options.additionalData).forEach(([key, value]) => {
      formData.append(key, value);
    });
  }

  // Use XMLHttpRequest for progress tracking if callback provided
  if (options.onProgress) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          options.onProgress!({
            loaded: event.loaded,
            total: event.total,
            percentage: Math.round((event.loaded / event.total) * 100)
          });
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(new Response(xhr.response, {
            status: xhr.status,
            statusText: xhr.statusText
          }));
        } else {
          reject(new Error(`Upload failed: ${xhr.statusText}`));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed'));
      });

      xhr.open('POST', options.url);
      xhr.send(formData);
    });
  }

  // Fallback to fetch if no progress tracking needed
  return fetch(options.url, {
    method: 'POST',
    body: formData
  });
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Get file extension
 */
export function getFileExtension(filename: string): string {
  return filename.substring(filename.lastIndexOf('.')).toLowerCase();
}
```

## Testing Requirements

```typescript
// __tests__/lib/utils/file-upload.test.ts

describe('file-upload utilities', () => {
  describe('validateExcelFile', () => {
    it('should validate valid .xlsx file');
    it('should reject files over 5MB');
    it('should reject non-Excel files');
    it('should accept .xls files');
  });

  describe('uploadFile', () => {
    it('should upload file successfully');
    it('should track progress');
    it('should include additional data');
  });

  describe('formatFileSize', () => {
    it('should format bytes correctly');
    it('should format KB correctly');
    it('should format MB correctly');
  });
});
```

## Evidence Requirements

- [ ] Utility file created
- [ ] All functions implemented
- [ ] Unit tests passing
- [ ] Used by ExcelImportCard

## Success Metrics

- File validation is robust
- Upload with progress works
- Utilities are reusable
- Tests achieve >90% coverage
