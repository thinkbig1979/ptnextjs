'use client';

import React from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, Plus } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

/**
 * Product Management Page
 *
 * Allows Tier 2+ vendors to manage their product listings.
 * This is a placeholder implementation that will be expanded with full CRUD functionality.
 */
export default function ProductManagementPage() {
  const { tier } = useAuth();

  // Check if user has access to product management
  if (!tier || tier === 'free') {
    return (
      <div className="container max-w-4xl py-8">
        <Alert>
          <Package className="h-4 w-4" />
          <AlertDescription>
            Product management is available for Tier 2+ vendors. Please upgrade your subscription to access this feature.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Product Management</h1>
        <p className="text-muted-foreground">
          Manage your product listings and showcase your offerings to potential customers.
        </p>
      </div>

      <div className="mb-6">
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add New Product
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Products</CardTitle>
          <CardDescription>
            View and manage all your product listings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No products yet. Click "Add New Product" to get started.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
