"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { YachtMaintenanceRecord } from "@/lib/types";

interface MaintenanceHistoryProps {
  records: YachtMaintenanceRecord[];
  filterBySystem?: string;
  filterByType?: 'routine' | 'repair' | 'upgrade' | 'inspection';
  filterByStatus?: 'completed' | 'in-progress' | 'scheduled';
  viewMode?: 'timeline' | 'list';
  showSummary?: boolean;
  showTotalCost?: boolean;
  expandable?: boolean;
  className?: string;
}

export function MaintenanceHistory({
  records,
  filterBySystem,
  filterByType,
  filterByStatus,
  viewMode = 'timeline',
  showSummary = false,
  showTotalCost = false,
  expandable = false,
  className
}: MaintenanceHistoryProps) {
  const [expandedRecord, setExpandedRecord] = React.useState<number | null>(null);

  const filteredRecords = React.useMemo(() => {
    return records
      .filter(record => {
        if (filterBySystem && record.system !== filterBySystem) return false;
        if (filterByType && record.type !== filterByType) return false;
        if (filterByStatus && record.status !== filterByStatus) return false;
        return true;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [records, filterBySystem, filterByType, filterByStatus]);

  const getTypeBadgeClass = (type: string) => {
    switch (type) {
      case 'routine':
        return 'bg-accent/10 text-accent';
      case 'repair':
        return 'bg-red-100 text-red-800';
      case 'upgrade':
        return 'bg-green-100 text-green-800';
      case 'inspection':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-muted text-gray-800';
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-accent/10 text-accent';
      case 'scheduled':
        return 'bg-muted text-gray-800';
      default:
        return 'bg-muted text-gray-800';
    }
  };

  const totalCost = React.useMemo(() => {
    return filteredRecords
      .filter(record => record.cost)
      .reduce((total, record) => {
        const cost = record.cost?.replace(/[^0-9.]/g, '');
        return total + (parseFloat(cost || '0') || 0);
      }, 0);
  }, [filteredRecords]);

  const summary = React.useMemo(() => {
    const completed = filteredRecords.filter(r => r.status === 'completed').length;
    const inProgress = filteredRecords.filter(r => r.status === 'in-progress').length;
    const scheduled = filteredRecords.filter(r => r.status === 'scheduled').length;

    return { completed, inProgress, scheduled };
  }, [filteredRecords]);

  if (filteredRecords.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          No maintenance records available.
        </p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {showSummary && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Maintenance Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-lg font-semibold">Total Records: {filteredRecords.length}</p>
              </div>
              <div>
                <p className="text-lg font-semibold text-green-600">Completed: {summary.completed}</p>
              </div>
              <div>
                <p className="text-lg font-semibold text-accent">In Progress: {summary.inProgress}</p>
              </div>
              <div>
                <p className="text-lg font-semibold text-muted-foreground">Scheduled: {summary.scheduled}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {showTotalCost && totalCost > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold">Total Cost: ${totalCost.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <div
        className={cn(
          "space-y-4",
          viewMode === 'timeline' && "timeline-view"
        )}
        data-testid="maintenance-timeline"
      >
        {filteredRecords.map((record, index) => (
          <Card
            key={index}
            className="transition-all duration-200 hover:shadow-md"
            data-testid={`maintenance-record-${index}`}
            data-date={record.date}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge className={getTypeBadgeClass(record.type)}>
                      {record.type.charAt(0).toUpperCase() + record.type.slice(1)}
                    </Badge>
                    <Badge className={getStatusBadgeClass(record.status)}>
                      {record.status === 'in-progress' ? 'In Progress' :
                       record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                    </Badge>
                  </div>
                  <div>
                    <p className="font-semibold">{record.system}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(record.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
                {expandable && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpandedRecord(expandedRecord === index ? null : index)}
                    data-testid={`expand-record-${index}`}
                  >
                    {expandedRecord === index ? 'Less' : 'More'}
                  </Button>
                )}
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              <div className="space-y-3">
                <p className="text-sm">{record.description}</p>

                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  {record.vendor && (
                    <span><strong>Vendor:</strong> {record.vendor}</span>
                  )}
                  {record.cost && (
                    <span><strong>Cost:</strong> {record.cost}</span>
                  )}
                </div>

                {record.nextService && (
                  <p className="text-sm text-muted-foreground">
                    <strong>Next service:</strong> {new Date(record.nextService).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                )}

                {expandable && expandedRecord === index && (
                  <div className="pt-3 border-t border-border">
                    <p className="text-sm font-medium mb-2">Full Details</p>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <p><strong>Type:</strong> {record.type}</p>
                      <p><strong>Status:</strong> {record.status}</p>
                      <p><strong>Description:</strong> {record.description}</p>
                      {record.vendor && <p><strong>Vendor:</strong> {record.vendor}</p>}
                      {record.cost && <p><strong>Cost:</strong> {record.cost}</p>}
                      {record.nextService && <p><strong>Next Service:</strong> {record.nextService}</p>}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}