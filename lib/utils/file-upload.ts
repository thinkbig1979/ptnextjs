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
 * @param file - The file to validate
 * @returns FileValidationResult indicating if the file is valid and any error message
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
 * @param options - Upload options including URL, file, progress callback, and additional data
 * @returns Promise resolving to Response object
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
 * @param bytes - Number of bytes to format
 * @returns Human-readable file size string (e.g., "1.5 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Get file extension from filename
 * @param filename - The filename to extract extension from
 * @returns File extension in lowercase (e.g., ".xlsx")
 */
export function getFileExtension(filename: string): string {
  return filename.substring(filename.lastIndexOf('.')).toLowerCase();
}
