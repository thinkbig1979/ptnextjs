'use client';

import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  AlertCircle,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

export type ImportStatus = 'success' | 'partial' | 'failed';

export interface ImportHistoryItem {
  id: string;
  importDate: string;
  status: ImportStatus;
  rowsProcessed: number;
  successfulRows: number;
  failedRows: number;
  filename?: string;
  changes?: Array<{
    rowNumber: number;
    field: string;
    oldValue: unknown;
    newValue: unknown;
  }>;
  errors?: Array<{
    rowNumber: number;
    field: string;
    message: string;
  }>;
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export function getStatusDisplay(status: ImportStatus): {
  variant: 'default' | 'destructive';
  className: string;
  icon: React.ReactElement;
  label: string;
} {
  switch (status) {
    case 'success':
      return {
        variant: 'default' as const,
        className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
        icon: <CheckCircle className="h-3 w-3 mr-1" />,
        label: 'Success',
      };
    case 'partial':
      return {
        variant: 'default' as const,
        className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
        icon: <AlertTriangle className="h-3 w-3 mr-1" />,
        label: 'Partial',
      };
    case 'failed':
      return {
        variant: 'destructive' as const,
        className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
        icon: <AlertCircle className="h-3 w-3 mr-1" />,
        label: 'Failed',
      };
  }
}

interface ImportDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  importItem: ImportHistoryItem | null;
}

export function ImportDetailsDialog({ open, onOpenChange, importItem }: ImportDetailsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Import Details</DialogTitle>
          <DialogDescription>
            Detailed information about this import operation
          </DialogDescription>
        </DialogHeader>

        {importItem && (
          <ScrollArea className="h-[60vh] pr-4">
            <div className="space-y-6">
              {/* Summary */}
              <div>
                <h3 className="font-semibold mb-3">Summary</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Date:</span>
                    <p className="font-medium">{formatDate(importItem.importDate)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Status:</span>
                    <div className="mt-1">
                      <Badge className={getStatusDisplay(importItem.status).className}>
                        {getStatusDisplay(importItem.status).icon}
                        {getStatusDisplay(importItem.status).label}
                      </Badge>
                    </div>
                  </div>
                  {importItem.filename && (
                    <div>
                      <span className="text-muted-foreground">Filename:</span>
                      <p className="font-medium">{importItem.filename}</p>
                    </div>
                  )}
                  <div>
                    <span className="text-muted-foreground">Rows Processed:</span>
                    <p className="font-medium">{importItem.rowsProcessed}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Successful:</span>
                    <p className="font-medium text-green-600 dark:text-green-400">
                      {importItem.successfulRows}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Failed:</span>
                    <p className="font-medium text-red-600 dark:text-red-400">
                      {importItem.failedRows}
                    </p>
                  </div>
                </div>
              </div>

              {/* Errors */}
              {importItem.errors && importItem.errors.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2 text-red-600 dark:text-red-400">
                    <AlertCircle className="h-4 w-4" />
                    Errors ({importItem.errors.length})
                  </h3>
                  <div className="space-y-2">
                    {importItem.errors.map((error, index) => (
                      <div
                        key={`error-${error.rowNumber}-${error.field}-${index}`}
                        className="rounded-md border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/10 p-3 text-sm"
                      >
                        <div className="flex items-start gap-2">
                          <Badge variant="outline" className="shrink-0">
                            Row {error.rowNumber}
                          </Badge>
                          <div className="flex-1">
                            <p className="font-medium text-red-800 dark:text-red-400">
                              {error.field}
                            </p>
                            <p className="text-red-700 dark:text-red-300 mt-1">
                              {error.message}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Changes */}
              {importItem.changes && importItem.changes.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Changes Made ({importItem.changes.length})
                  </h3>
                  <div className="space-y-2">
                    {importItem.changes.map((change, index) => (
                      <div
                        key={`change-${change.rowNumber}-${change.field}-${index}`}
                        className="rounded-md border bg-muted/50 p-3 text-sm"
                      >
                        <div className="flex items-start gap-2">
                          <Badge variant="outline" className="shrink-0">
                            Row {change.rowNumber}
                          </Badge>
                          <div className="flex-1">
                            <p className="font-medium">{change.field}</p>
                            <div className="mt-1 grid grid-cols-2 gap-2">
                              <div>
                                <span className="text-xs text-muted-foreground">Old:</span>
                                <p className="text-muted-foreground line-through">
                                  {String(change.oldValue || 'N/A')}
                                </p>
                              </div>
                              <div>
                                <span className="text-xs text-muted-foreground">New:</span>
                                <p className="text-green-600 dark:text-green-400 font-medium">
                                  {String(change.newValue || 'N/A')}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* No errors or changes */}
              {(!importItem.errors || importItem.errors.length === 0) &&
               (!importItem.changes || importItem.changes.length === 0) && (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No detailed error or change information available for this import.
                </div>
              )}
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}
