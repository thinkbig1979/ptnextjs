'use client';

import { useState, useMemo } from 'react';
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
  ArrowUpDown,
  Copy,
  AlertCircle,
  AlertTriangle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';

// Types
export interface ValidationError {
  row: number;
  field: string;
  code: string;
  message: string;
  suggestion?: string;
  severity: 'error' | 'warning';
  value?: any;
}

interface ValidationErrorsTableProps {
  errors: ValidationError[];
  warnings: ValidationError[];
}

type SortField = 'row' | 'field';
type SortDirection = 'asc' | 'desc';

/**
 * ValidationErrorsTable Component
 *
 * Displays validation errors and warnings in a sortable, filterable table.
 *
 * Features:
 * - Sort by row number or field name
 * - Filter by error type/code
 * - Filter by field name
 * - Severity badges (error vs warning)
 * - Pagination (10 errors per page)
 * - Export to clipboard (CSV format)
 * - Responsive design
 * - Empty state
 */
export function ValidationErrorsTable({ errors, warnings }: ValidationErrorsTableProps) {
  // State
  const [sortField, setSortField] = useState<SortField>('row');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [filterField, setFilterField] = useState<string>('all');
  const [filterCode, setFilterCode] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  // Combine errors and warnings
  const allValidationIssues = useMemo(() => {
    return [
      ...errors.map(e => ({ ...e, severity: 'error' as const })),
      ...warnings.map(w => ({ ...w, severity: 'warning' as const }))
    ];
  }, [errors, warnings]);

  // Get unique fields and codes for filters
  const uniqueFields = useMemo(() => {
    const fields = new Set(allValidationIssues.map(issue => issue.field));
    return Array.from(fields).sort();
  }, [allValidationIssues]);

  const uniqueCodes = useMemo(() => {
    const codes = new Set(allValidationIssues.map(issue => issue.code));
    return Array.from(codes).sort();
  }, [allValidationIssues]);

  // Filter issues
  const filteredIssues = useMemo(() => {
    return allValidationIssues.filter(issue => {
      const fieldMatch = filterField === 'all' || issue.field === filterField;
      const codeMatch = filterCode === 'all' || issue.code === filterCode;
      return fieldMatch && codeMatch;
    });
  }, [allValidationIssues, filterField, filterCode]);

  // Sort issues
  const sortedIssues = useMemo(() => {
    const sorted = [...filteredIssues];
    sorted.sort((a, b) => {
      let comparison = 0;

      if (sortField === 'row') {
        comparison = a.row - b.row;
      } else if (sortField === 'field') {
        comparison = a.field.localeCompare(b.field);
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }, [filteredIssues, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(sortedIssues.length / itemsPerPage);
  const paginatedIssues = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedIssues.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedIssues, currentPage, itemsPerPage]);

  // Reset to first page when filters change
  useMemo(() => {
    setCurrentPage(1);
  }, [filterField, filterCode]);

  // Handlers
  const handleSort = (field: SortField): void => {
    if (sortField === field) {
      // Toggle direction
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      // New field, default to ascending
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleExportToClipboard = async (): Promise<void> => {
    try {
      // Create CSV content
      const headers = ['Row', 'Field', 'Severity', 'Code', 'Message', 'Suggestion'];
      const rows = sortedIssues.map(issue => [
        issue.row.toString(),
        issue.field,
        issue.severity,
        issue.code,
        `"${issue.message.replace(/"/g, '""')}"`, // Escape quotes
        issue.suggestion ? `"${issue.suggestion.replace(/"/g, '""')}"` : ''
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n');

      // Copy to clipboard
      await navigator.clipboard.writeText(csvContent);
      toast.success(`Exported ${sortedIssues.length} validation issues to clipboard`);
    } catch (error) {
      console.error('Error exporting to clipboard:', error);
      toast.error('Failed to export validation issues');
    }
  };

  const getSeverityBadge = (severity: 'error' | 'warning'): React.ReactElement => {
    if (severity === 'error') {
      return (
        <Badge variant="destructive" className="gap-1">
          <AlertCircle className="h-3 w-3" />
          Error
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="gap-1 border-yellow-500 text-yellow-700 dark:text-yellow-500">
          <AlertTriangle className="h-3 w-3" />
          Warning
        </Badge>
      );
    }
  };

  // Empty state
  if (allValidationIssues.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Validation Issues</h3>
        <p className="text-sm text-muted-foreground">
          All data has been validated successfully.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters and Export */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          {/* Field Filter */}
          <div className="w-full sm:w-48">
            <Select value={filterField} onValueChange={setFilterField}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by field" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Fields</SelectItem>
                {uniqueFields.map(field => (
                  <SelectItem key={field} value={field}>
                    {field}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Code Filter */}
          <div className="w-full sm:w-48">
            <Select value={filterCode} onValueChange={setFilterCode}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by error type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Error Types</SelectItem>
                {uniqueCodes.map(code => (
                  <SelectItem key={code} value={code}>
                    {code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Export Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleExportToClipboard}
          className="gap-2 w-full sm:w-auto"
        >
          <Copy className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Results Count */}
      <div className="text-sm text-muted-foreground">
        Showing {paginatedIssues.length} of {sortedIssues.length} validation issues
        {sortedIssues.length !== allValidationIssues.length && (
          <span> (filtered from {allValidationIssues.length} total)</span>
        )}
      </div>

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              {/* Row Number - Sortable */}
              <TableHead className="w-20">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('row')}
                  className="gap-1 h-8 px-2"
                >
                  Row
                  <ArrowUpDown className="h-3 w-3" />
                </Button>
              </TableHead>

              {/* Field Name - Sortable */}
              <TableHead className="w-32">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('field')}
                  className="gap-1 h-8 px-2"
                >
                  Field
                  <ArrowUpDown className="h-3 w-3" />
                </Button>
              </TableHead>

              {/* Severity */}
              <TableHead className="w-28">Severity</TableHead>

              {/* Error Code */}
              <TableHead className="w-40">Error Type</TableHead>

              {/* Message */}
              <TableHead>Message</TableHead>

              {/* Suggestion */}
              <TableHead className="w-48">Suggestion</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {paginatedIssues.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No validation issues match the current filters.
                </TableCell>
              </TableRow>
            ) : (
              paginatedIssues.map((issue, index) => (
                <TableRow key={`${issue.row}-${issue.field}-${index}`}>
                  {/* Row Number */}
                  <TableCell className="font-mono text-sm">
                    {issue.row}
                  </TableCell>

                  {/* Field Name */}
                  <TableCell className="font-medium">
                    {issue.field}
                  </TableCell>

                  {/* Severity Badge */}
                  <TableCell>
                    {getSeverityBadge(issue.severity)}
                  </TableCell>

                  {/* Error Code */}
                  <TableCell className="font-mono text-xs">
                    {issue.code}
                  </TableCell>

                  {/* Message */}
                  <TableCell className="text-sm">
                    {issue.message}
                  </TableCell>

                  {/* Suggestion */}
                  <TableCell className="text-sm text-muted-foreground">
                    {issue.suggestion || '-'}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="gap-1"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
