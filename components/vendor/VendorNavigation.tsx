'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { SubscriptionTierBadge } from '@/components/shared/SubscriptionTierBadge';
import {
  LayoutDashboard,
  User,
  Package,
  Settings,
  CreditCard,
  LogOut,
  Database,
} from 'lucide-react';

export interface VendorNavigationProps {
  className?: string;
}

/**
 * VendorNavigation Component
 *
 * Sidebar navigation for vendor dashboard with tier-based link visibility,
 * active route highlighting, and logout functionality.
 */
export function VendorNavigation({ className }: VendorNavigationProps) {
  const pathname = usePathname();
  const { user, tier, logout } = useAuth();

  const navigationItems = [
    {
      href: '/vendor/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      visible: true,
    },
    {
      href: '/vendor/dashboard/profile',
      label: 'Profile',
      icon: User,
      visible: true,
    },
    {
      href: '/vendor/dashboard/data-management',
      label: 'Data Management',
      icon: Database,
      visible: true,
    },
    {
      href: '/vendor/dashboard/products',
      label: 'Products',
      icon: Package,
      visible: tier === 'tier2', // Only visible for tier2 vendors
    },
    {
      href: '/vendor/dashboard/subscription',
      label: 'Subscription',
      icon: CreditCard,
      visible: true,
    },
    {
      href: '/vendor/dashboard/settings',
      label: 'Settings',
      icon: Settings,
      visible: true,
    },
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <nav
      role="navigation"
      aria-label="Vendor dashboard navigation"
      className={`flex flex-col h-full bg-card dark:bg-slate-900 border-r border-border dark:border-slate-800 ${className || ''}`}
    >
      {/* Sidebar Header */}
      <div className="p-6">
        <h2 className="text-lg font-semibold text-foreground dark:text-white mb-2">Vendor Portal</h2>
        {user && tier && (
          <div className="flex flex-col gap-2">
            <p className="text-sm text-muted-foreground dark:text-muted-foreground truncate">{user.email}</p>
            <SubscriptionTierBadge tier={tier} />
          </div>
        )}
      </div>

      <Separator />

      {/* Navigation Links */}
      <div className="flex-1 px-3 py-4 space-y-1">
        {navigationItems
          .filter((item) => item.visible)
          .map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-label={item.label}
                aria-current={isActive ? 'page' : undefined}
                className={`
                  flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium
                  transition-colors duration-150
                  ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-950 text-accent dark:text-accent'
                      : 'text-foreground dark:text-muted-foreground hover:bg-muted dark:hover:bg-slate-800 hover:text-foreground dark:hover:text-white'
                  }
                `}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
                <span>{item.label}</span>
              </Link>
            );
          })}
      </div>

      <Separator />

      {/* Logout Button */}
      <div className="p-4">
        <Button
          onClick={handleLogout}
          variant="ghost"
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
          aria-label="Logout"
        >
          <LogOut className="mr-3 h-5 w-5" aria-hidden="true" />
          Logout
        </Button>
      </div>
    </nav>
  );
}
