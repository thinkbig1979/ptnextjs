'use client';

import React, { useState } from 'react';
import { VendorNavigation } from '@/components/vendor/VendorNavigation';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';

export interface VendorDashboardLayoutProps {
  children: React.ReactNode;
}

/**
 * VendorDashboardLayout Component
 *
 * Layout wrapper for vendor dashboard pages with responsive sidebar navigation.
 * Sidebar is fixed on desktop (>=768px) and collapsible via hamburger menu on mobile.
 */
export default function VendorDashboardLayout({ children }: VendorDashboardLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile Menu Button - Only visible on mobile */}
      <div className="fixed top-4 left-4 z-50 md:hidden">
        <Button
          onClick={toggleMobileMenu}
          variant="outline"
          size="icon"
          aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
          className="bg-white shadow-lg"
        >
          {isMobileMenuOpen ? (
            <X className="h-5 w-5" aria-hidden="true" />
          ) : (
            <Menu className="h-5 w-5" aria-hidden="true" />
          )}
        </Button>
      </div>

      {/* Sidebar - Fixed on desktop, overlay on mobile */}
      <aside
        className={`
          fixed md:static inset-y-0 left-0 z-40
          w-64 transform transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        <VendorNavigation className="h-full" />
      </aside>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={toggleMobileMenu}
          aria-hidden="true"
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-gray-50 md:ml-0">
        <div className="container mx-auto px-4 py-8 md:px-8 md:py-12 mt-16 md:mt-0">
          {children}
        </div>
      </main>
    </div>
  );
}
