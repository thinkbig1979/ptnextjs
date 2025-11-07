// __tests__/lib/utils/file-upload.test.ts

import {
  validateExcelFile,
  uploadFile,
  formatFileSize,
  getFileExtension,
  type FileValidationResult,
  type UploadProgress,
  type UploadOptions
} from '@/lib/utils/file-upload';

describe('file-upload utilities', () => {
  describe('validateExcelFile', () => {
    it('should validate valid .xlsx file', () => {
      const file = new File(['test content'], 'test.xlsx', {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      const result = validateExcelFile(file);

      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should validate valid .xls file', () => {
      const file = new File(['test content'], 'test.xls', {
        type: 'application/vnd.ms-excel'
      });

      const result = validateExcelFile(file);

      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should accept .xlsx file with fallback extension check', () => {
      // Some browsers may not set the correct MIME type
      const file = new File(['test content'], 'test.xlsx', {
        type: 'application/octet-stream'
      });

      const result = validateExcelFile(file);

      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should accept .xls file with fallback extension check', () => {
      const file = new File(['test content'], 'test.xls', {
        type: 'application/octet-stream'
      });

      const result = validateExcelFile(file);

      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject files over 5MB', () => {
      const largeContent = new Array(6 * 1024 * 1024).fill('a').join('');
      const file = new File([largeContent], 'large.xlsx', {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      const result = validateExcelFile(file);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('File size exceeds 5MB limit');
    });

    it('should accept files exactly at 5MB limit', () => {
      const content = new Array(5 * 1024 * 1024).fill('a').join('');
      const file = new File([content], 'exactly5mb.xlsx', {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      const result = validateExcelFile(file);

      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject non-Excel files by MIME type', () => {
      const file = new File(['test content'], 'test.pdf', {
        type: 'application/pdf'
      });

      const result = validateExcelFile(file);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid file type. Please upload .xlsx or .xls files only');
    });

    it('should reject non-Excel files by extension', () => {
      const file = new File(['test content'], 'test.txt', {
        type: 'text/plain'
      });

      const result = validateExcelFile(file);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid file type. Please upload .xlsx or .xls files only');
    });

    it('should handle files with uppercase extensions', () => {
      const file = new File(['test content'], 'test.XLSX', {
        type: 'application/octet-stream'
      });

      const result = validateExcelFile(file);

      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should handle files with mixed case extensions', () => {
      const file = new File(['test content'], 'test.XlSx', {
        type: 'application/octet-stream'
      });

      const result = validateExcelFile(file);

      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });

  describe('uploadFile', () => {
    let mockXHR: Partial<XMLHttpRequest>;
    let xhrInstance: any;
    let originalXMLHttpRequest: typeof XMLHttpRequest;

    beforeEach(() => {
      // Save original XMLHttpRequest
      originalXMLHttpRequest = global.XMLHttpRequest;

      // Create mock XHR
      mockXHR = {
        open: jest.fn(),
        send: jest.fn(),
        upload: {
          addEventListener: jest.fn()
        } as any,
        addEventListener: jest.fn(),
        status: 200,
        statusText: 'OK',
        response: JSON.stringify({ success: true })
      };

      xhrInstance = mockXHR;

      // Mock XMLHttpRequest constructor
      global.XMLHttpRequest = jest.fn(() => xhrInstance) as any;
    });

    afterEach(() => {
      // Restore original XMLHttpRequest
      global.XMLHttpRequest = originalXMLHttpRequest;
    });

    it('should upload file successfully without progress tracking', async () => {
      const file = new File(['test content'], 'test.xlsx', {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      // Mock fetch
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ success: true })
      });

      const options: UploadOptions = {
        url: '/api/upload',
        file
      };

      const response = await uploadFile(options);

      expect(global.fetch).toHaveBeenCalledWith('/api/upload', {
        method: 'POST',
        body: expect.any(FormData)
      });
      expect(response).toBeDefined();
    });

    it('should track upload progress', async () => {
      const file = new File(['test content'], 'test.xlsx', {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      const progressCallback = jest.fn();
      let progressHandler: ((event: ProgressEvent) => void) | null = null;
      let loadHandler: (() => void) | null = null;

      // Capture event handlers
      mockXHR.upload!.addEventListener = jest.fn((event: string, handler: any) => {
        if (event === 'progress') {
          progressHandler = handler;
        }
      });

      mockXHR.addEventListener = jest.fn((event: string, handler: any) => {
        if (event === 'load') {
          loadHandler = handler;
        }
      });

      const options: UploadOptions = {
        url: '/api/upload',
        file,
        onProgress: progressCallback
      };

      const uploadPromise = uploadFile(options);

      // Simulate progress event
      if (progressHandler) {
        progressHandler({
          lengthComputable: true,
          loaded: 50,
          total: 100
        } as ProgressEvent);
      }

      // Simulate load event
      if (loadHandler) {
        loadHandler();
      }

      await uploadPromise;

      expect(progressCallback).toHaveBeenCalledWith({
        loaded: 50,
        total: 100,
        percentage: 50
      });

      expect(mockXHR.open).toHaveBeenCalledWith('POST', '/api/upload');
      expect(mockXHR.send).toHaveBeenCalledWith(expect.any(FormData));
    });

    it('should include additional data in upload', async () => {
      const file = new File(['test content'], 'test.xlsx', {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      let capturedFormData: FormData | null = null;

      mockXHR.send = jest.fn((formData: any) => {
        capturedFormData = formData;
      });

      let loadHandler: (() => void) | null = null;
      mockXHR.addEventListener = jest.fn((event: string, handler: any) => {
        if (event === 'load') {
          loadHandler = handler;
        }
      });

      const options: UploadOptions = {
        url: '/api/upload',
        file,
        onProgress: jest.fn(),
        additionalData: {
          vendorId: '123',
          importType: 'products'
        }
      };

      const uploadPromise = uploadFile(options);

      // Simulate load event
      if (loadHandler) {
        loadHandler();
      }

      await uploadPromise;

      expect(capturedFormData).toBeInstanceOf(FormData);
      if (capturedFormData) {
        expect(capturedFormData.get('vendorId')).toBe('123');
        expect(capturedFormData.get('importType')).toBe('products');
        expect(capturedFormData.get('file')).toBeInstanceOf(File);
      }
    });

    it('should handle upload error with progress tracking', async () => {
      const file = new File(['test content'], 'test.xlsx', {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      let errorHandler: (() => void) | null = null;
      mockXHR.addEventListener = jest.fn((event: string, handler: any) => {
        if (event === 'error') {
          errorHandler = handler;
        }
      });

      const options: UploadOptions = {
        url: '/api/upload',
        file,
        onProgress: jest.fn()
      };

      const uploadPromise = uploadFile(options);

      // Simulate error event
      if (errorHandler) {
        errorHandler();
      }

      await expect(uploadPromise).rejects.toThrow('Upload failed');
    });

    it('should handle HTTP error status with progress tracking', async () => {
      const file = new File(['test content'], 'test.xlsx', {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      mockXHR.status = 500;
      mockXHR.statusText = 'Internal Server Error';

      let loadHandler: (() => void) | null = null;
      mockXHR.addEventListener = jest.fn((event: string, handler: any) => {
        if (event === 'load') {
          loadHandler = handler;
        }
      });

      const options: UploadOptions = {
        url: '/api/upload',
        file,
        onProgress: jest.fn()
      };

      const uploadPromise = uploadFile(options);

      // Simulate load event
      if (loadHandler) {
        loadHandler();
      }

      await expect(uploadPromise).rejects.toThrow('Upload failed: Internal Server Error');
    });

    it('should calculate progress percentage correctly', async () => {
      const file = new File(['test content'], 'test.xlsx', {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      const progressCallback = jest.fn();
      let progressHandler: ((event: ProgressEvent) => void) | null = null;
      let loadHandler: (() => void) | null = null;

      mockXHR.upload!.addEventListener = jest.fn((event: string, handler: any) => {
        if (event === 'progress') {
          progressHandler = handler;
        }
      });

      mockXHR.addEventListener = jest.fn((event: string, handler: any) => {
        if (event === 'load') {
          loadHandler = handler;
        }
      });

      const options: UploadOptions = {
        url: '/api/upload',
        file,
        onProgress: progressCallback
      };

      const uploadPromise = uploadFile(options);

      // Simulate multiple progress events
      if (progressHandler) {
        progressHandler({
          lengthComputable: true,
          loaded: 25,
          total: 100
        } as ProgressEvent);

        progressHandler({
          lengthComputable: true,
          loaded: 75,
          total: 100
        } as ProgressEvent);

        progressHandler({
          lengthComputable: true,
          loaded: 100,
          total: 100
        } as ProgressEvent);
      }

      // Simulate load event
      if (loadHandler) {
        loadHandler();
      }

      await uploadPromise;

      expect(progressCallback).toHaveBeenCalledTimes(3);
      expect(progressCallback).toHaveBeenNthCalledWith(1, {
        loaded: 25,
        total: 100,
        percentage: 25
      });
      expect(progressCallback).toHaveBeenNthCalledWith(2, {
        loaded: 75,
        total: 100,
        percentage: 75
      });
      expect(progressCallback).toHaveBeenNthCalledWith(3, {
        loaded: 100,
        total: 100,
        percentage: 100
      });
    });

    it('should not call progress callback when lengthComputable is false', async () => {
      const file = new File(['test content'], 'test.xlsx', {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      const progressCallback = jest.fn();
      let progressHandler: ((event: ProgressEvent) => void) | null = null;
      let loadHandler: (() => void) | null = null;

      mockXHR.upload!.addEventListener = jest.fn((event: string, handler: any) => {
        if (event === 'progress') {
          progressHandler = handler;
        }
      });

      mockXHR.addEventListener = jest.fn((event: string, handler: any) => {
        if (event === 'load') {
          loadHandler = handler;
        }
      });

      const options: UploadOptions = {
        url: '/api/upload',
        file,
        onProgress: progressCallback
      };

      const uploadPromise = uploadFile(options);

      // Simulate progress event with lengthComputable = false
      if (progressHandler) {
        progressHandler({
          lengthComputable: false,
          loaded: 50,
          total: 0
        } as ProgressEvent);
      }

      // Simulate load event
      if (loadHandler) {
        loadHandler();
      }

      await uploadPromise;

      expect(progressCallback).not.toHaveBeenCalled();
    });
  });

  describe('formatFileSize', () => {
    it('should format 0 bytes correctly', () => {
      expect(formatFileSize(0)).toBe('0 Bytes');
    });

    it('should format bytes correctly', () => {
      expect(formatFileSize(500)).toBe('500 Bytes');
      expect(formatFileSize(1023)).toBe('1023 Bytes');
    });

    it('should format KB correctly', () => {
      expect(formatFileSize(1024)).toBe('1 KB');
      expect(formatFileSize(1536)).toBe('1.5 KB');
      expect(formatFileSize(2048)).toBe('2 KB');
      expect(formatFileSize(10240)).toBe('10 KB');
    });

    it('should format MB correctly', () => {
      expect(formatFileSize(1048576)).toBe('1 MB');
      expect(formatFileSize(1572864)).toBe('1.5 MB');
      expect(formatFileSize(5242880)).toBe('5 MB');
      expect(formatFileSize(10485760)).toBe('10 MB');
    });

    it('should format GB correctly', () => {
      expect(formatFileSize(1073741824)).toBe('1 GB');
      expect(formatFileSize(1610612736)).toBe('1.5 GB');
      expect(formatFileSize(5368709120)).toBe('5 GB');
    });

    it('should round to 2 decimal places', () => {
      expect(formatFileSize(1234567)).toBe('1.18 MB');
      expect(formatFileSize(9876543)).toBe('9.42 MB');
    });

    it('should handle 1 byte correctly', () => {
      expect(formatFileSize(1)).toBe('1 Bytes');
    });
  });

  describe('getFileExtension', () => {
    it('should extract .xlsx extension', () => {
      expect(getFileExtension('document.xlsx')).toBe('.xlsx');
    });

    it('should extract .xls extension', () => {
      expect(getFileExtension('document.xls')).toBe('.xls');
    });

    it('should extract extension from path with multiple dots', () => {
      expect(getFileExtension('my.file.name.xlsx')).toBe('.xlsx');
    });

    it('should convert extension to lowercase', () => {
      expect(getFileExtension('DOCUMENT.XLSX')).toBe('.xlsx');
      expect(getFileExtension('Document.XLS')).toBe('.xls');
    });

    it('should handle files with no extension', () => {
      expect(getFileExtension('document')).toBe('document');
    });

    it('should handle files with only extension', () => {
      expect(getFileExtension('.xlsx')).toBe('.xlsx');
    });

    it('should extract other common extensions', () => {
      expect(getFileExtension('document.pdf')).toBe('.pdf');
      expect(getFileExtension('image.png')).toBe('.png');
      expect(getFileExtension('archive.zip')).toBe('.zip');
    });

    it('should handle paths with directories', () => {
      expect(getFileExtension('/path/to/document.xlsx')).toBe('.xlsx');
      expect(getFileExtension('C:\\Users\\Documents\\file.xls')).toBe('.xls');
    });
  });
});
