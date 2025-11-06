'use client';

import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, RefreshCw } from 'lucide-react';

export interface DashboardErrorProps {
  /**
   * Error message to display
   */
  error?: Error | string | null;

  /**
   * Callback for retry action
   */
  onRetry?: () => void;

  /**
   * Optional title override
   */
  title?: string;
}

/**
 * DashboardError Component
 *
 * Displays an error state for the vendor dashboard with retry functionality.
 *
 * Features:
 * - Error message display
 * - Retry button
 * - User-friendly error formatting
 */
export function DashboardError({
  error,
  onRetry,
  title = 'Failed to Load Dashboard',
}: DashboardErrorProps) {
  const errorMessage =
    error instanceof Error
      ? error.message
      : typeof error === 'string'
      ? error
      : 'An unexpected error occurred while loading your dashboard.';

  return (
    <div className="min-h-screen bg-muted dark:bg-gray-900 flex items-center justify-center p-4">
      <Card className="max-w-lg w-full">
        <CardContent className="pt-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{title}</AlertTitle>
            <AlertDescription className="mt-2">
              {errorMessage}
            </AlertDescription>
          </Alert>

          {onRetry && (
            <div className="mt-6 flex justify-center">
              <Button onClick={onRetry} className="gap-2">
                <RefreshCw className="h-4 w-4" aria-hidden="true" />
                Try Again
              </Button>
            </div>
          )}

          <div className="mt-6 text-center text-sm text-muted-foreground dark:text-muted-foreground">
            <p>If this problem persists, please contact support.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default DashboardError;
