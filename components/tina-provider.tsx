'use client';

import React from 'react';
import { ReactNode } from 'react';

interface TinaProviderProps {
  children: ReactNode;
}

/**
 * TinaCMS Provider Component
 * 
 * Wraps the application to provide TinaCMS functionality.
 * For static generation, this primarily provides development-time features.
 */
export function TinaProvider({ children }: TinaProviderProps) {
  // For static generation, we'll just pass through the children
  // TinaCMS editing features are only active in development mode
  return <>{children}</>;
}