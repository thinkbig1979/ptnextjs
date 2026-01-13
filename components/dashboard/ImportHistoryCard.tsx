'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Loader2,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';
import { useVendorDashboard } from '@/lib/context/VendorDashboardContext';
import { HelpTooltip } from '@/components/help';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

// Types
type ImportStatus = 'success' | 'partial' | 'failed';

interface ImportHistoryItem {
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

interface Pagination {
  page: number;
  limit: number;
  totalPages: number;
  totalDocs: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  nextPage: number | null;
  prevPage: number | null;
}

interface ImportHistoryResponse {
  success: boolean;
  data: ImportHistoryItem[];
  pagination: Pagination;
  filters: {
    status: string | null;
    startDate: string | null;
    endDate: string | null;
  };
}

/**
 * ImportHistoryCard Component
 *
 * Dashboard card component for displaying import history with filtering and pagination.
 *
 * Features:
 * - Paginated table view of import history
 * - Status filtering (all, success, partial, failed)
 * - Color-coded status badges
 * - View details dialog showing errors and changes
 * - Loading and empty states
 * - Formatted dates
 *
 * API Integration:
 * - Fetches from: GET /api/portal/vendors/[id]/import-history
 * - Query params: page, limit, status
 */
export function ImportHistoryCard() {
  const { vendor } = useVendorDashboard();

  // State
  const [history, setHistory] = useState<ImportHistoryItem[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [selectedImport, setSelectedImport] = useState<ImportHistoryItem | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  const ITEMS_PER_PAGE = 10;

  /**
   * Fetch import history from API
   */
  const fetchHistory = useCallback(async (): Promise<void> => {
    if (!vendor?.id) return;

    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: ITEMS_PER_PAGE.toString(),
      });

      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      const response = await fetch(
        `/api/portal/vendors/${vendor.id}/import-history?${params.toString()}`,
        {
          credentials: 'include',
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch import history');
      }

      const data: ImportHistoryResponse = await response.json();
      setHistory(data.data);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching import history:', error);
      toast.error('Failed to load import history', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setLoading(false);
    }
  }, [vendor?.id, page, statusFilter]);

  /**
   * Fetch history on mount and when dependencies change
   */
  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  /**
   * Handle status filter change
   */
  const handleFilterChange = (value: string): void => {
    setStatusFilter(value);
    setPage(1); // Reset to first page when filter changes
  };

  /**
   * Handle page navigation
   */
  const handlePreviousPage = (): void => {
    if (pagination?.hasPrevPage) {
      setPage(page - 1);
    }
  };

  const handleNextPage = (): void => {
    if (pagination?.hasNextPage) {
      setPage(page + 1);
    }
  };

  /**
   * Handle view details
   */
  const handleViewDetails = (importItem: ImportHistoryItem): void => {
    setSelectedImport(importItem);
    setDetailsDialogOpen(true);
  };

  /**
   * Format date for display
   */
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  /**
   * Get status badge variant and icon
   */
  const getStatusDisplay = (status: ImportStatus): {
    variant: 'default' | 'destructive';
    className: string;
    icon: React.ReactElement;
    label: string;
  } => {
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
  };

  // Loading state
  if (loading && history.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Import History
          </CardTitle>
          <CardDescription>
            View past import operations and their results
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="flex items-center gap-2">
                  <FileSpreadsheet className="h-5 w-5" />
                  Import History
                </CardTitle>
                <HelpTooltip
                  title="Import History"
                  content="Track all your past import operations with timestamps and status. View details to see which rows succeeded, which failed, and what errors occurred. Use this to verify imports and troubleshoot issues."
                  side="right"
                  iconSize={16}
                />
              </div>
              <CardDescription>
                View past import operations and their results
              </CardDescription>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Filter:</span>
              <Select value={statusFilter} onValueChange={handleFilterChange}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="partial">Partial</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
              <HelpTooltip
                title="Import Status Types"
                content="Success: All rows imported without errors. Partial: Some rows imported, but others had errors. Failed: Import could not be completed due to critical errors."
                side="left"
                iconSize={14}
              />
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Empty State */}
          {history.length === 0 ? (
            <div className="text-center py-12">
              <FileSpreadsheet className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground text-sm">
                {statusFilter !== 'all'
                  ? `No ${statusFilter} imports found`
                  : 'No import history yet. Upload an Excel file to get started.'}
              </p>
            </div>
          ) : (
            <>
              {/* History Table */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Rows Processed</TableHead>
                      <TableHead className="text-right">Success</TableHead>
                      <TableHead className="text-right">Failed</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                        </TableCell>
                      </TableRow>
                    ) : (
                      history.map((item) => {
                        const statusDisplay = getStatusDisplay(item.status);
                        return (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">
                              {formatDate(item.importDate)}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={statusDisplay.variant}
                                className={statusDisplay.className}
                              >
                                {statusDisplay.icon}
                                {statusDisplay.label}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              {item.rowsProcessed}
                            </TableCell>
                            <TableCell className="text-right text-green-600 dark:text-green-400">
                              {item.successfulRows}
                            </TableCell>
                            <TableCell className="text-right text-red-600 dark:text-red-400">
                              {item.failedRows}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewDetails(item)}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                Details
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Page {pagination.page} of {pagination.totalPages} ({pagination.totalDocs} total imports)
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePreviousPage}
                      disabled={!pagination.hasPrevPage || loading}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleNextPage}
                      disabled={!pagination.hasNextPage || loading}
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Import Details</DialogTitle>
            <DialogDescription>
              Detailed information about this import operation
            </DialogDescription>
          </DialogHeader>

          {selectedImport && (
            <ScrollArea className="h-[60vh] pr-4">
              <div className="space-y-6">
                {/* Summary */}
                <div>
                  <h3 className="font-semibold mb-3">Summary</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Date:</span>
                      <p className="font-medium">{formatDate(selectedImport.importDate)}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Status:</span>
                      <div className="mt-1">
                        <Badge className={getStatusDisplay(selectedImport.status).className}>
                          {getStatusDisplay(selectedImport.status).icon}
                          {getStatusDisplay(selectedImport.status).label}
                        </Badge>
                      </div>
                    </div>
                    {selectedImport.filename && (
                      <div>
                        <span className="text-muted-foreground">Filename:</span>
                        <p className="font-medium">{selectedImport.filename}</p>
                      </div>
                    )}
                    <div>
                      <span className="text-muted-foreground">Rows Processed:</span>
                      <p className="font-medium">{selectedImport.rowsProcessed}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Successful:</span>
                      <p className="font-medium text-green-600 dark:text-green-400">
                        {selectedImport.successfulRows}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Failed:</span>
                      <p className="font-medium text-red-600 dark:text-red-400">
                        {selectedImport.failedRows}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Errors */}
                {selectedImport.errors && selectedImport.errors.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2 text-red-600 dark:text-red-400">
                      <AlertCircle className="h-4 w-4" />
                      Errors ({selectedImport.errors.length})
                    </h3>
                    <div className="space-y-2">
                      {selectedImport.errors.map((error, index) => (
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
                {selectedImport.changes && selectedImport.changes.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Changes Made ({selectedImport.changes.length})
                    </h3>
                    <div className="space-y-2">
                      {selectedImport.changes.map((change, index) => (
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
                {(!selectedImport.errors || selectedImport.errors.length === 0) &&
                 (!selectedImport.changes || selectedImport.changes.length === 0) && (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    No detailed error or change information available for this import.
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
