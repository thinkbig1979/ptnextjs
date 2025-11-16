'use client';

import React, { useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  FileSpreadsheet,
  X,
} from 'lucide-react';
import type {
  ValidationResult,
  ValidationError,
} from '@/lib/services/ImportValidationService';
import type { ParseResult } from '@/lib/services/ExcelParserService';
import { ValidationErrorsTable } from './ValidationErrorsTable';

/**
 * Props for ExcelPreviewDialog component
 */
export interface ExcelPreviewDialogProps {
  /** Whether the dialog is open */
  open: boolean;
  /** Callback when dialog is closed */
  onClose: () => void;
  /** Callback when import is confirmed */
  onConfirm: () => void;
  /** Validation result from ImportValidationService */
  validationResult: ValidationResult;
  /** Parse result from ExcelParserService */
  parseResult: ParseResult;
  /** Whether import is in progress */
  isLoading?: boolean;
}

/**
 * Interface for change tracking
 */
interface ChangeRecord {
  rowNumber: number;
  field: string;
  oldValue: any;
  newValue: any;
}

/**
 * ExcelPreviewDialog Component
 *
 * Modal dialog for previewing Excel import data with validation errors and change indicators.
 *
 * Features:
 * - Summary section showing total rows, valid rows, errors, and warnings
 * - Three tabs: Data Preview, Validation Errors, Changes
 * - Data preview table with row numbers and error highlighting
 * - Validation errors table with severity badges
 * - Changes table showing field-by-field modifications
 * - Confirm/Cancel buttons with conditional disabling
 * - Scrollable content areas for large datasets
 * - Responsive design with max-w-6xl container
 *
 * Usage:
 * ```tsx
 * <ExcelPreviewDialog
 *   open={isPreviewOpen}
 *   onClose={() => setIsPreviewOpen(false)}
 *   onConfirm={handleConfirmImport}
 *   validationResult={validationResult}
 *   parseResult={parseResult}
 *   isLoading={isImporting}
 * />
 * ```
 */
export function ExcelPreviewDialog({
  open,
  onClose,
  onConfirm,
  validationResult,
  parseResult,
  isLoading = false,
}: ExcelPreviewDialogProps) {
  /**
   * Extract and separate validation errors and warnings
   * Map from ImportValidationService format (rowNumber) to ValidationErrorsTable format (row)
   */
  const { errors: validationErrors, warnings: validationWarnings } = useMemo(() => {
    const errors: any[] = [];
    const warnings: any[] = [];

    validationResult.rows.forEach((row) => {
      // Map errors
      const mappedErrors = row.errors.map(error => ({
        ...error,
        row: error.rowNumber,
      }));
      errors.push(...mappedErrors);

      // Map warnings
      const mappedWarnings = row.warnings.map(warning => ({
        ...warning,
        row: warning.rowNumber,
      }));
      warnings.push(...mappedWarnings);
    });

    return { errors, warnings };
  }, [validationResult]);

  /**
   * Generate change records by comparing current data with parsed data
   * In a real implementation, this would compare against existing vendor data
   */
  const changes = useMemo<ChangeRecord[]>(() => {
    const changeRecords: ChangeRecord[] = [];

    // For now, we'll treat all non-empty parsed data as changes
    // In a real implementation, this would compare against existing vendor data
    parseResult.rows.forEach((row) => {
      Object.entries(row.data).forEach(([field, newValue]) => {
        if (newValue !== undefined && newValue !== null && newValue !== '') {
          changeRecords.push({
            rowNumber: row.rowNumber,
            field,
            oldValue: '', // Would come from existing data
            newValue,
          });
        }
      });
    });

    return changeRecords;
  }, [parseResult]);

  /**
   * Get all field names from parsed data for table headers
   */
  const fieldNames = useMemo(() => {
    const fields = new Set<string>();
    parseResult.rows.forEach((row) => {
      Object.keys(row.data).forEach((field) => fields.add(field));
    });
    return Array.from(fields).sort();
  }, [parseResult]);

  /**
   * Determine if a row has validation errors
   */
  const getRowErrors = (rowNumber: number) => {
    const row = validationResult.rows.find((r) => r.rowNumber === rowNumber);
    return row?.errors || [];
  };

  /**
   * Check if confirm button should be disabled
   */
  const isConfirmDisabled = !validationResult.valid || isLoading;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Import Preview
          </DialogTitle>
        </DialogHeader>

        {/* Summary Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4">
          <div className="flex flex-col gap-1">
            <span className="text-sm text-muted-foreground">Total Rows</span>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-semibold">
                {validationResult.summary.totalRows}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-sm text-muted-foreground">Valid Rows</span>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-semibold text-green-600">
                {validationResult.summary.validRows}
              </span>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <CheckCircle className="h-3 w-3 mr-1" />
                {validationResult.summary.validRows}
              </Badge>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-sm text-muted-foreground">Errors</span>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-semibold text-red-600">
                {validationResult.summary.totalErrors}
              </span>
              {validationResult.summary.totalErrors > 0 && (
                <Badge variant="destructive">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {validationResult.summary.totalErrors}
                </Badge>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-sm text-muted-foreground">Warnings</span>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-semibold text-yellow-600">
                {validationResult.summary.totalWarnings}
              </span>
              {validationResult.summary.totalWarnings > 0 && (
                <Badge
                  variant="outline"
                  className="bg-yellow-50 text-yellow-700 border-yellow-200"
                >
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  {validationResult.summary.totalWarnings}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <Tabs defaultValue="preview" className="flex-1 flex flex-col min-h-0">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="preview">Data Preview</TabsTrigger>
            <TabsTrigger value="errors">
              Validation Errors
              {validationResult.summary.totalErrors > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {validationResult.summary.totalErrors}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="changes">
              Changes
              <Badge variant="outline" className="ml-2">
                {changes.length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          {/* Data Preview Tab */}
          <TabsContent value="preview" className="flex-1 min-h-0 mt-4">
            <ScrollArea className="h-[400px] rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16 sticky left-0 bg-background">
                      Row
                    </TableHead>
                    {fieldNames.map((field) => (
                      <TableHead key={field} className="min-w-[150px]">
                        {field}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parseResult.rows.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={fieldNames.length + 1}
                        className="text-center text-muted-foreground py-8"
                      >
                        No data to preview
                      </TableCell>
                    </TableRow>
                  ) : (
                    parseResult.rows.map((row) => {
                      const rowErrors = getRowErrors(row.rowNumber);
                      const hasErrors = rowErrors.length > 0;

                      return (
                        <TableRow
                          key={row.rowNumber}
                          className={hasErrors ? 'bg-red-50 hover:bg-red-100' : ''}
                        >
                          <TableCell className="font-medium sticky left-0 bg-background">
                            <div className="flex items-center gap-1">
                              {row.rowNumber}
                              {hasErrors && (
                                <AlertCircle className="h-4 w-4 text-red-600" />
                              )}
                            </div>
                          </TableCell>
                          {fieldNames.map((field) => (
                            <TableCell key={field} className="font-mono text-sm">
                              {row.data[field] !== undefined && row.data[field] !== null
                                ? String(row.data[field])
                                : '-'}
                            </TableCell>
                          ))}
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </TabsContent>

          {/* Validation Errors Tab */}
          <TabsContent value="errors" className="flex-1 min-h-0 mt-4">
            <ScrollArea className="h-[400px]">
              <ValidationErrorsTable errors={validationErrors} warnings={validationWarnings} />
            </ScrollArea>
          </TabsContent>

          {/* Changes Tab */}
          <TabsContent value="changes" className="flex-1 min-h-0 mt-4">
            <ScrollArea className="h-[400px] rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-20">Row</TableHead>
                    <TableHead className="w-48">Field</TableHead>
                    <TableHead>Old Value</TableHead>
                    <TableHead>New Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {changes.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center text-muted-foreground py-8"
                      >
                        No changes detected
                      </TableCell>
                    </TableRow>
                  ) : (
                    changes.map((change, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">
                          {change.rowNumber}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {change.field}
                        </TableCell>
                        <TableCell className="text-muted-foreground font-mono text-sm">
                          {change.oldValue || <span className="italic">empty</span>}
                        </TableCell>
                        <TableCell className="font-medium font-mono text-sm">
                          {change.newValue}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <DialogFooter className="flex-shrink-0">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isConfirmDisabled}
            className="bg-green-600 hover:bg-green-700"
          >
            {isLoading ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Importing...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Confirm Import
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
