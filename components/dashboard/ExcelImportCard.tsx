'use client';

import { useState, useRef, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Upload, AlertCircle, FileSpreadsheet, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useTierAccess } from '@/hooks/useTierAccess';
import { useVendorDashboard } from '@/lib/context/VendorDashboardContext';
import { UpgradePromptCard } from './UpgradePromptCard';
import { uploadFile } from '@/lib/utils/file-upload';

import { ExcelPreviewDialog } from './ExcelPreviewDialog';

type ImportPhase = 'idle' | 'uploading' | 'validating' | 'preview' | 'importing' | 'complete';

interface ValidationError {
  field: string;
  message: string;
  rowNumber?: number;
  severity: 'error' | 'warning';
}

interface RowValidationResult {
  rowNumber: number;
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  data: Record<string, unknown>;
}

interface ValidationResult {
  valid: boolean;
  rows: RowValidationResult[];
  summary: {
    totalRows: number;
    validRows: number;
    errorRows: number;
    warningRows: number;
    totalErrors: number;
    totalWarnings: number;
  };
  errorsByField: Record<string, number>;
}

interface ParseResult {
  success: boolean;
  rows: Array<{ rowNumber: number; data: Record<string, unknown> }>;
  metadata?: {
    filename: string;
    rowCount: number;
    columnCount: number;
  };
  errors?: string[];
}

interface PreviewResponse {
  phase: 'preview';
  parseResult: ParseResult;
  validationResult: ValidationResult;
  message: string;
  error?: string;
}

interface ExecuteResponse {
  phase: 'execute';
  executionResult: {
    success: boolean;
    summary: {
      successCount: number;
      errorCount: number;
      warningCount: number;
    };
    changes: Array<{ rowNumber: number; field: string; oldValue: unknown; newValue: unknown }>;
    errors: Array<{ rowNumber: number; field: string; message: string }>;
  };
  message: string;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_FILE_TYPES = [
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel'
];

/**
 * ExcelImportCard Component
 *
 * Dashboard card component for uploading and importing Excel files with validation preview.
 *
 * Features:
 * - File upload dropzone (drag-and-drop + click)
 * - Tier 2+ restriction enforcement with upgrade prompt
 * - File validation (type, size)
 * - Multi-phase workflow: upload → validate → preview → import
 * - Progress indicators throughout workflow
 * - Validation preview dialog
 * - Error handling and toast notifications
 * - Complete/success state with reset
 *
 * Workflow States:
 * 1. idle - Show upload dropzone
 * 2. uploading - Show upload progress
 * 3. validating - Show "Validating data..." spinner
 * 4. preview - Show validation results dialog
 * 5. importing - Show "Importing..." progress
 * 6. complete - Show success message
 *
 * API Endpoints:
 * - POST /api/portal/vendors/[id]/excel-import?phase=preview - Upload and validate
 * - POST /api/portal/vendors/[id]/excel-import?phase=execute - Execute import
 */
export function ExcelImportCard() {
  const [phase, setPhase] = useState<ImportPhase>('idle');
  const [file, setFile] = useState<File | null>(null);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { vendor } = useVendorDashboard();
  const { hasAccess, tier, upgradePath } = useTierAccess('excel-import', vendor?.tier);

  /**
   * Validate file before upload
   */
  const validateFile = useCallback((file: File): string | null => {
    // Check file type
    if (!ACCEPTED_FILE_TYPES.includes(file.type) && !file.name.endsWith('.xlsx')) {
      return 'Invalid file type. Please upload an Excel file (.xlsx)';
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      const maxSizeMB = (MAX_FILE_SIZE / (1024 * 1024)).toFixed(1);
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1);
      return `File size (${fileSizeMB}MB) exceeds maximum limit of ${maxSizeMB}MB`;
    }

    return null;
  }, []);

  /**
   * Handle file selection
   */
  const handleFileSelect = useCallback((selectedFile: File): void => {
    const validationError = validateFile(selectedFile);
    if (validationError) {
      setError(validationError);
      toast.error('Invalid file', {
        description: validationError
      });
      return;
    }

    setFile(selectedFile);
    setError(null);
    toast.success('File selected', {
      description: `${selectedFile.name} is ready for upload`
    });
  }, [validateFile]);

  /**
   * Handle file input change
   */
  const handleFileInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>): void => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  }, [handleFileSelect]);

  /**
   * Handle drag and drop events
   */
  const handleDragEnter = useCallback((e: React.DragEvent): void => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent): void => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent): void => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent): void => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  }, [handleFileSelect]);

  /**
   * Upload file and validate (preview phase)
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

      // Upload and validate with real progress tracking
      const response = await uploadFile({
        url: `/api/portal/vendors/${vendor.id}/excel-import?phase=preview`,
        file,
        onProgress: (progress) => {
          setUploadProgress(progress.percentage);
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Upload failed');
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
      toast.error('Upload failed', {
        description: errorMessage
      });
    }
  }, [file, vendor]);

  /**
   * Execute import after validation
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

      // Execute import with uploadFile utility
      const response = await uploadFile({
        url: `/api/portal/vendors/${vendor.id}/excel-import?phase=execute`,
        file,
        additionalData: {
          confirmed: 'true'
        }
      });

      if (!response.ok) {
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
      toast.error('Import failed', {
        description: errorMessage
      });
    }
  }, [file, vendor, validationResult]);

  /**
   * Cancel preview and return to idle
   */
  const handleCancelPreview = useCallback((): void => {
    setPhase('idle');
    setValidationResult(null);
    setParseResult(null);
    setError(null);
  }, []);

  /**
   * Reset to initial state
   */
  const handleReset = useCallback((): void => {
    setPhase('idle');
    setFile(null);
    setValidationResult(null);
    setParseResult(null);
    setUploadProgress(0);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  /**
   * Trigger file input click
   */
  const handleBrowseClick = useCallback((): void => {
    fileInputRef.current?.click();
  }, []);

  // Show upgrade prompt for users without access
  if (!hasAccess) {
    return (
      <UpgradePromptCard
        currentTier={tier}
        targetTier={upgradePath}
        feature="Excel Import/Export"
        benefits={[
          'Import vendor data from Excel spreadsheets',
          'Bulk update products, certifications, and team members',
          'Export current data to Excel format',
          'Download tier-appropriate templates',
          'Automatic data validation',
        ]}
      />
    );
  }

  // Show loading state if vendor data hasn't loaded yet
  if (!vendor) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Excel Import
          </CardTitle>
          <CardDescription>
            Loading vendor information...
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Excel Import
          </CardTitle>
          <CardDescription>
            Upload an Excel file to import or update your vendor data
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Idle State - File Upload Dropzone */}
          {phase === 'idle' && (
            <div className="space-y-4">
              <div
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`
                  border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
                  transition-colors duration-200
                  ${isDragging
                    ? 'border-primary bg-primary/5'
                    : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50'
                  }
                `}
                onClick={handleBrowseClick}
              >
                <FileSpreadsheet className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium mb-2">
                  {file ? file.name : 'Drop Excel file here or click to browse'}
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  Maximum file size: 5MB (.xlsx files only)
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
              </div>

              {file && (
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileSpreadsheet className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">{file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleReset}>
                    Remove
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Uploading State */}
          {phase === 'uploading' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <p className="font-medium">Uploading file...</p>
              </div>
              <Progress value={uploadProgress} className="h-2" />
              <p className="text-sm text-muted-foreground">
                {file?.name} ({(file?.size || 0 / 1024).toFixed(1)} KB)
              </p>
            </div>
          )}

          {/* Validating State */}
          {phase === 'validating' && (
            <div className="flex items-center gap-3 p-6 justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <p className="font-medium text-lg">Validating data...</p>
            </div>
          )}

          {/* Preview State - Show validation summary */}
          {phase === 'preview' && validationResult && parseResult && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Total Rows</p>
                  <p className="text-2xl font-bold">{validationResult.summary.totalRows}</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Valid Rows</p>
                  <p className="text-2xl font-bold text-green-600">
                    {validationResult.summary.validRows}
                  </p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Errors</p>
                  <p className="text-2xl font-bold text-red-600">
                    {validationResult.summary.totalErrors}
                  </p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Warnings</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {validationResult.summary.totalWarnings}
                  </p>
                </div>
              </div>

              {/* TODO: Add ExcelPreviewDialog here when FE-6 is complete */}
              {/* This is a placeholder for the full preview dialog */}
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {validationResult.valid
                    ? 'All data validated successfully. Ready to import.'
                    : `Found ${validationResult.summary.errorRows} rows with errors. Please review and fix before importing.`}
                </AlertDescription>
              </Alert>

              {!validationResult.valid && (
                <div className="max-h-60 overflow-y-auto border rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Validation Errors</h4>
                  <div className="space-y-2">
                    {validationResult.rows
                      .filter(row => !row.valid)
                      .slice(0, 10) // Show first 10 errors
                      .map((row) => (
                        <div key={row.rowNumber} className="text-sm">
                          <p className="font-medium text-red-600">Row {row.rowNumber}:</p>
                          <ul className="list-disc list-inside pl-4">
                            {row.errors.map((error, idx) => (
                              <li key={idx}>{error.field}: {error.message}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    {validationResult.summary.errorRows > 10 && (
                      <p className="text-sm text-muted-foreground">
                        ... and {validationResult.summary.errorRows - 10} more errors
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Importing State */}
          {phase === 'importing' && (
            <div className="flex items-center gap-3 p-6 justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <p className="font-medium text-lg">Importing data...</p>
            </div>
          )}

          {/* Complete State */}
          {phase === 'complete' && (
            <div className="flex flex-col items-center gap-4 p-6">
              <CheckCircle className="h-12 w-12 text-green-600" />
              <div className="text-center">
                <p className="font-semibold text-lg mb-2">Import Completed Successfully!</p>
                <p className="text-sm text-muted-foreground">
                  Your vendor data has been updated.
                </p>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-between">
          {phase === 'idle' && (
            <>
              <div />
              <Button
                onClick={handleUploadAndValidate}
                disabled={!file}
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload and Validate
              </Button>
            </>
          )}

          {phase === 'preview' && (
            <>
              <Button variant="outline" onClick={handleCancelPreview}>
                Cancel
              </Button>
              <Button
                onClick={handleExecuteImport}
                disabled={!validationResult?.valid}
              >
                {validationResult?.valid ? 'Confirm Import' : 'Fix Errors First'}
              </Button>
            </>
          )}

          {phase === 'complete' && (
            <>
              <div />
              <Button onClick={handleReset}>
                Import Another File
              </Button>
            </>
          )}

          {(phase === 'uploading' || phase === 'validating' || phase === 'importing') && (
            <>
              <div />
              <Button disabled>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </Button>
            </>
          )}
        </CardFooter>
      </Card>

      {/* TODO: Add ExcelPreviewDialog here when FE-6 is complete */}
      {/* <ExcelPreviewDialog
        open={phase === 'preview'}
        onClose={handleCancelPreview}
        onConfirm={handleExecuteImport}
        validationResult={validationResult}
        parseResult={parseResult}
      /> */}
    </>
  );
}
