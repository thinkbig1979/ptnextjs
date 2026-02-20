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
} from 'lucide-react';
import { toast } from 'sonner';
import { useVendorDashboard } from '@/lib/context/VendorDashboardContext';
import { HelpTooltip } from '@/components/help';
import {
  ImportDetailsDialog,
  formatDate,
  getStatusDisplay,
} from '@/components/dashboard/ImportDetailsDialog';
import type { ImportHistoryItem } from '@/components/dashboard/ImportDetailsDialog';

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

export function ImportHistoryCard() {
  const { vendor } = useVendorDashboard();

  const [history, setHistory] = useState<ImportHistoryItem[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [selectedImport, setSelectedImport] = useState<ImportHistoryItem | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  const ITEMS_PER_PAGE = 10;

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

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleFilterChange = (value: string): void => {
    setStatusFilter(value);
    setPage(1);
  };

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

  const handleViewDetails = (importItem: ImportHistoryItem): void => {
    setSelectedImport(importItem);
    setDetailsDialogOpen(true);
  };

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

      <ImportDetailsDialog
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
        importItem={selectedImport}
      />
    </>
  );
}
