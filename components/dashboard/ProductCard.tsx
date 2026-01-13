'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Pencil, Trash2 } from 'lucide-react';
import { Product, Category } from '@/lib/types';

export interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onPublishToggle: (product: Product, published: boolean) => void;
  isPublishing?: boolean;
}

export function ProductCard({
  product,
  onEdit,
  onDelete,
  onPublishToggle,
  isPublishing = false,
}: ProductCardProps) {
  // Determine if product is published
  const isPublished = product.publishedAt != null || (product as any).published === true;

  // Extract categories - handle both array of Category objects or strings
  const categories = React.useMemo(() => {
    if (!product.category && !(product as any).categories) {
      return [];
    }

    // Handle categories array (relationship field)
    if ((product as any).categories) {
      const cats = (product as any).categories;
      if (Array.isArray(cats)) {
        return cats.map((cat: Category | string) => {
          if (typeof cat === 'string') {
            return cat;
          }
          return cat.name;
        });
      }
    }

    // Handle legacy category field (single string)
    if (product.category) {
      return [product.category];
    }

    return [];
  }, [product]);

  // Get short description
  const getShortDescription = () => {
    // Check for shortDescription field
    if ((product as any).shortDescription) {
      return (product as any).shortDescription;
    }

    // Fallback to description if it's a string
    if (typeof product.description === 'string') {
      return product.description.slice(0, 100) + (product.description.length > 100 ? '...' : '');
    }

    return null;
  };

  const shortDescription = getShortDescription();

  // Display categories (max 3 with +N indicator)
  const displayCategories = categories.slice(0, 3);
  const remainingCount = categories.length - 3;

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <CardTitle className="text-xl font-semibold">{product.name}</CardTitle>
          <Badge variant={isPublished ? 'default' : 'secondary'}>
            {isPublished ? 'Published' : 'Draft'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Description */}
        <div className="text-sm text-muted-foreground">
          {shortDescription ? (
            <p>{shortDescription}</p>
          ) : (
            <p className="italic">No description</p>
          )}
        </div>

        {/* Categories */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {displayCategories.map((category) => (
              <Badge key={`category-${category}`} variant="outline" className="text-xs">
                {category}
              </Badge>
            ))}
            {remainingCount > 0 && (
              <Badge variant="outline" className="text-xs">
                +{remainingCount}
              </Badge>
            )}
          </div>
        )}

        {/* Publish Toggle */}
        <div className="flex items-center justify-between pt-2">
          <label htmlFor={`publish-${product.id}`} className="text-sm font-medium">
            Published
          </label>
          <Switch
            id={`publish-${product.id}`}
            checked={isPublished}
            onCheckedChange={(checked) => onPublishToggle(product, checked)}
            disabled={isPublishing}
            aria-label="Publish product"
          />
        </div>
      </CardContent>

      <CardFooter className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEdit(product)}
          className="flex-1"
        >
          <Pencil className="mr-2 h-4 w-4" />
          Edit
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onDelete(product)}
          className="flex-1 text-destructive hover:bg-destructive hover:text-destructive-foreground"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </Button>
      </CardFooter>
    </Card>
  );
}
