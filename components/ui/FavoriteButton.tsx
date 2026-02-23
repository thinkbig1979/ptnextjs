'use client';

import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFavorites } from '@/lib/hooks/useFavorites';

interface FavoriteButtonProps {
  id: string;
  type: 'product' | 'vendor';
  size?: 'sm' | 'default';
  className?: string;
}

export function FavoriteButton({ id, type, size = 'default', className }: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorited = isFavorite(id, type);

  return (
    <Button
      variant="ghost"
      size={size === 'sm' ? 'icon' : 'default'}
      className={className}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFavorite(id, type);
      }}
      aria-label={favorited ? `Remove from favorites` : `Add to favorites`}
    >
      <Heart
        className={`h-4 w-4 ${favorited ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`}
      />
    </Button>
  );
}
