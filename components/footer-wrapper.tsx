'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import { Footer } from './footer';
import type { CompanyInfo } from '@/lib/types';

interface FooterWrapperProps {
  companyInfo?: CompanyInfo;
}

/**
 * FooterWrapper Component
 *
 * Client wrapper that conditionally renders the Footer based on the current path.
 * Hides the footer on vendor dashboard pages where it's not needed.
 */
export function FooterWrapper({ companyInfo }: FooterWrapperProps): React.JSX.Element | null {
  const pathname = usePathname();

  // Hide footer on vendor dashboard pages
  if (pathname?.startsWith('/vendor/dashboard')) {
    return null;
  }

  return <Footer companyInfo={companyInfo} />;
}
