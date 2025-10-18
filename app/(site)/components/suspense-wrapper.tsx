
"use client";

import { Suspense } from "react";

interface SuspenseWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function SuspenseWrapper({ children, fallback }: SuspenseWrapperProps) {
  return (
    <Suspense fallback={fallback || <div className="animate-pulse bg-muted/20 h-8 w-full rounded" />}>
      {children}
    </Suspense>
  );
}
