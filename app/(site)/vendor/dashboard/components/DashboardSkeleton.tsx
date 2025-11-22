'use client';

import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * DashboardSkeleton Component
 *
 * Loading skeleton for the vendor dashboard page.
 * Displays placeholder elements while vendor data is being fetched.
 */
export function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-muted dark:bg-background">
      {/* Header Skeleton */}
      <div className="border-b border-border dark:border-border bg-card dark:bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-8 w-48" />
            </div>
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-6">
            {/* Welcome Card Skeleton */}
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48 mb-2" />
                <Skeleton className="h-4 w-full max-w-md" />
              </CardHeader>
            </Card>

            {/* Stats Cards Skeleton */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-5 w-32 mb-2" />
                    <Skeleton className="h-4 w-48" />
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-2 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Content Card Skeleton */}
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-40 mb-2" />
                <Skeleton className="h-4 w-full max-w-lg" />
              </CardHeader>
              <CardContent className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Skeleton className="h-5 w-5 rounded-full flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-3 w-full max-w-md" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Skeleton */}
          <aside className="space-y-6">
            {/* Tier Card Skeleton */}
            <Card>
              <CardHeader>
                <Skeleton className="h-5 w-32 mb-2" />
                <Skeleton className="h-4 w-40" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-6 w-16" />
                </div>
                <Skeleton className="h-px w-full" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-9 w-full" />
              </CardContent>
            </Card>

            {/* Quick Actions Card Skeleton */}
            <Card>
              <CardHeader>
                <Skeleton className="h-5 w-28 mb-2" />
                <Skeleton className="h-4 w-36" />
              </CardHeader>
              <CardContent className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-9 w-full" />
                ))}
              </CardContent>
            </Card>

            {/* Resources Card Skeleton */}
            <Card>
              <CardHeader>
                <Skeleton className="h-5 w-24 mb-2" />
                <Skeleton className="h-4 w-40" />
              </CardHeader>
              <CardContent className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-4 w-full" />
                ))}
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default DashboardSkeleton;
