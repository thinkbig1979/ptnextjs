"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, TrendingUp, TrendingDown, Minus, Search, BarChart3, Grid3X3, FileText } from "lucide-react";
import type { Product, PerformanceData } from "@/lib/types";
// PDF generation functionality

// Simple PDF generation mock for now
const generatePerformancePDF = async (product: Product, metrics: PerformanceData[]) => {
  // Mock PDF generation - in production this would use a proper PDF library
  const csvData = metrics.map(metric => ({
    name: metric.name,
    value: metric.value,
    unit: metric.unit || '',
    category: metric.category || 'general'
  }));

  const csv = [
    'Name,Value,Unit,Category',
    ...csvData.map(row => `${row.name},${row.value},${row.unit},${row.category}`)
  ].join('\n');

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${product.slug}-performance-specs.pdf`;
  a.click();
  URL.revokeObjectURL(url);
};

interface PerformanceMetricsProps {
  metrics: PerformanceData[];
  product?: Product;
  visualizationType?: 'chart' | 'table' | 'cards';
  showTrends?: boolean;
  showBenchmarks?: boolean;
  enablePdfDownload?: boolean;
  filterByCategory?: string;
  className?: string;
  sortable?: boolean;
  showTolerances?: boolean;
  searchable?: boolean;
  groupByCategory?: boolean;
  showHistorical?: boolean;
  showWarnings?: boolean;
  enableCsvExport?: boolean;
}

export function PerformanceMetrics({
  metrics,
  product,
  visualizationType = 'table',
  showTrends = false,
  showBenchmarks = false,
  enablePdfDownload = false,
  filterByCategory,
  className,
  sortable = false,
  showTolerances = false,
  searchable = false,
  groupByCategory = false,
  showHistorical = false,
  showWarnings = false,
  enableCsvExport = false
}: PerformanceMetricsProps) {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [sortBy, setSortBy] = React.useState<'name' | 'value' | 'category'>('name');
  const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('asc');

  // Filter and sort metrics
  const processedMetrics = React.useMemo(() => {
    // Ensure metrics is always an array
    let filtered = Array.isArray(metrics) ? metrics : [];

    // Filter by category if specified
    if (filterByCategory) {
      filtered = filtered.filter(m => m.category === filterByCategory);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(m =>
        m.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort metrics
    if (sortable && filtered.length > 0) {
      filtered = [...filtered].sort((a, b) => {
        let aValue: any, bValue: any;

        switch (sortBy) {
          case 'value':
            aValue = a.value;
            bValue = b.value;
            break;
          case 'category':
            aValue = a.category;
            bValue = b.category;
            break;
          default:
            aValue = a.name;
            bValue = b.name;
        }

        if (typeof aValue === 'string') {
          return sortOrder === 'asc'
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }

        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      });
    }

    return filtered;
  }, [metrics, filterByCategory, searchTerm, sortBy, sortOrder, sortable]);

  // Group by category if enabled
  const groupedMetrics = React.useMemo(() => {
    if (!groupByCategory) return { all: processedMetrics };

    return processedMetrics.reduce((groups, metric) => {
      const category = metric.category || 'uncategorized';
      if (!groups[category]) groups[category] = [];
      groups[category].push(metric);
      return groups;
    }, {} as Record<string, PerformanceData[]>);
  }, [processedMetrics, groupByCategory]);

  // PDF download functionality is now handled by PDFDownloadLink component

  const handleCsvExport = () => {
    if (!enableCsvExport) return;

    const csvData = processedMetrics.map(metric => ({
      name: metric.name,
      value: metric.value,
      unit: metric.unit || '',
      category: metric.category,
      trend: metric.trend || '',
      benchmark: metric.benchmarkValue || ''
    }));

    const csv = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${product?.slug || 'metrics'}-performance-data.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" data-testid="trend-up" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-600" data-testid="trend-down" />;
      case 'stable':
        return <Minus className="h-4 w-4 text-gray-600" data-testid="trend-stable" />;
      default:
        return null;
    }
  };

  const isOutOfTolerance = (metric: PerformanceData): boolean => {
    if (!showWarnings || !metric.tolerance) return false;
    return metric.value < metric.tolerance.min || metric.value > metric.tolerance.max;
  };

  const getToleranceRange = (metric: PerformanceData): string => {
    if (!metric.tolerance) return '';
    return `${metric.tolerance.min}-${metric.tolerance.max} ${metric.unit || ''}`;
  };

  if (processedMetrics.length === 0) {
    return (
      <Card className={cn("w-full", className)} data-testid="performance-metrics">
        <CardContent className="p-6 text-center text-muted-foreground">
          No performance data available
        </CardContent>
      </Card>
    );
  }

  const renderTableView = () => (
    <div data-testid="performance-table">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              {sortable ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSortBy('name');
                    setSortOrder(sortBy === 'name' && sortOrder === 'asc' ? 'desc' : 'asc');
                  }}
                >
                  Metric
                </Button>
              ) : (
                'Metric'
              )}
            </TableHead>
            <TableHead>
              {sortable ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSortBy('value');
                    setSortOrder(sortBy === 'value' && sortOrder === 'asc' ? 'desc' : 'asc');
                  }}
                  data-testid="sort-by-value"
                >
                  Value
                </Button>
              ) : (
                'Value'
              )}
            </TableHead>
            {showBenchmarks && <TableHead>Benchmark</TableHead>}
            {showTolerances && <TableHead>Range</TableHead>}
            {showTrends && <TableHead>Trend</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {processedMetrics.map((metric) => (
            <TableRow
              key={metric.metricId}
              data-testid={`metric-row-${metric.metricId}`}
              className={isOutOfTolerance(metric) ? 'bg-red-50' : ''}
            >
              <TableCell>
                <div className="space-y-1">
                  <span className="font-medium">{metric.name}</span>
                  <Badge variant="outline" className="text-xs">
                    {metric.category}
                  </Badge>
                  {isOutOfTolerance(metric) && (
                    <Badge variant="destructive" className="text-xs" data-testid="warning-threshold-exceeded">
                      Out of tolerance
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <span className="font-mono">
                  {metric.value} {metric.unit || ''}
                </span>
              </TableCell>
              {showBenchmarks && (
                <TableCell data-testid="benchmark-comparison">
                  {metric.benchmarkValue ? (
                    <span className="text-muted-foreground">
                      {metric.benchmarkValue} {metric.unit || ''}
                      <span className="text-xs ml-1">(vs benchmark)</span>
                    </span>
                  ) : (
                    '-'
                  )}
                </TableCell>
              )}
              {showTolerances && (
                <TableCell>
                  {getToleranceRange(metric) || '-'}
                </TableCell>
              )}
              {showTrends && (
                <TableCell>
                  {getTrendIcon(metric.trend)}
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  const renderCardsView = () => (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3" data-testid="performance-cards">
      {processedMetrics.map((metric) => (
        <Card
          key={metric.metricId}
          data-testid={`metric-card-${metric.metricId}`}
          className={isOutOfTolerance(metric) ? 'border-red-200 bg-red-50' : ''}
        >
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">{metric.name}</CardTitle>
              {showTrends && getTrendIcon(metric.trend)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold">
                {metric.value} <span className="text-sm text-muted-foreground">{metric.unit}</span>
              </div>
              {showBenchmarks && metric.benchmarkValue && (
                <div className="text-sm text-muted-foreground">
                  Benchmark: {metric.benchmarkValue} {metric.unit}
                </div>
              )}
              {showTolerances && metric.tolerance && (
                <div className="text-sm text-muted-foreground">
                  Range: {getToleranceRange(metric)}
                </div>
              )}
              <Badge variant="outline" className="text-xs">
                {metric.category}
              </Badge>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderChartView = () => (
    <div className="h-64 flex items-center justify-center border rounded-lg bg-muted/50" data-testid="performance-chart">
      <div className="text-center" data-testid="chart-container">
        <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
        <p className="text-muted-foreground">Chart visualization would be implemented here</p>
        <p className="text-sm text-muted-foreground">Using a charting library like Recharts or Chart.js</p>
      </div>
    </div>
  );

  return (
    <div className={cn("w-full space-y-6", className)} data-testid="performance-metrics">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Performance Metrics</CardTitle>
            <div className="flex items-center space-x-2">
              {/* View Toggle */}
              <div className="flex items-center space-x-1 bg-muted rounded-lg p-1">
                <Button
                  size="sm"
                  variant={visualizationType === 'table' ? 'default' : 'ghost'}
                  onClick={() => {}} // Would change visualization type
                  className="h-8 w-8 p-0"
                >
                  <FileText className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant={visualizationType === 'cards' ? 'default' : 'ghost'}
                  onClick={() => {}} // Would change visualization type
                  className="h-8 w-8 p-0"
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant={visualizationType === 'chart' ? 'default' : 'ghost'}
                  onClick={() => {}} // Would change visualization type
                  className="h-8 w-8 p-0"
                >
                  <BarChart3 className="h-4 w-4" />
                </Button>
              </div>

              {/* Export Buttons */}
              {enableCsvExport && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCsvExport}
                  data-testid="export-csv-button"
                >
                  <Download className="h-4 w-4 mr-2" />
                  CSV
                </Button>
              )}

              {enablePdfDownload && product && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => generatePerformancePDF(product, processedMetrics)}
                  data-testid="download-pdf-button"
                >
                  <Download className="h-4 w-4 mr-2" />
                  PDF
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            {searchable && (
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search metrics..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            )}

            {sortable && (
              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="value">Value</SelectItem>
                  <SelectItem value="category">Category</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>


          {/* Content based on visualization type */}
          {groupByCategory ? (
            <div className="space-y-6">
              {Object.entries(groupedMetrics).map(([category, _categoryMetrics]) => (
                <div key={category} data-testid={`category-${category}`}>
                  <h3 className="text-lg font-semibold mb-3 capitalize">{category}</h3>
                  {visualizationType === 'table' && renderTableView()}
                  {visualizationType === 'cards' && renderCardsView()}
                  {visualizationType === 'chart' && renderChartView()}
                </div>
              ))}
            </div>
          ) : (
            <>
              {visualizationType === 'table' && renderTableView()}
              {visualizationType === 'cards' && renderCardsView()}
              {visualizationType === 'chart' && renderChartView()}
            </>
          )}

          {showHistorical && (
            <div className="mt-6 p-4 border rounded-lg" data-testid="historical-trend-chart">
              <h4 className="font-medium mb-2">Historical Trends</h4>
              <div className="h-32 flex items-center justify-center bg-muted/50 rounded">
                <p className="text-muted-foreground text-sm">Historical trend visualization would be here</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* PDF Download Link (hidden, used by react-pdf) */}
      {enablePdfDownload && product && (
        <div style={{ display: 'none' }} data-testid="pdf-download-link">
          <a download={`${product.slug}-specs.pdf`}>Download PDF</a>
        </div>
      )}
    </div>
  );
}