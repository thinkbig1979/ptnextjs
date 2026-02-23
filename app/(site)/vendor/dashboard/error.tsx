'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[DashboardError]', error);
  }, [error]);

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="text-center max-w-md space-y-6">
        <div className="flex justify-center">
          <AlertTriangle className="h-12 w-12 text-destructive" />
        </div>
        <h1 className="text-2xl font-semibold text-foreground">
          Dashboard error
        </h1>
        <p className="text-muted-foreground">
          Something went wrong loading your dashboard. This could be a temporary
          issue. Try refreshing, or log out and back in if the problem continues.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={reset} variant="default">
            Try again
          </Button>
          <Button variant="outline" asChild>
            <a href="/vendor/dashboard">Back to dashboard</a>
          </Button>
          <Button variant="ghost" asChild>
            <a href="/contact">Contact support</a>
          </Button>
        </div>
        {error.digest && (
          <p className="text-xs text-muted-foreground">
            Error reference: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
