'use client';

import { useState } from 'react';
import type { Control, UseFormWatch, UseFormSetValue } from 'react-hook-form';
import { useFieldArray } from 'react-hook-form';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Image as ImageIcon, Plus, Trash2, ImageOff, Star, Info } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { cn } from '@/lib/utils';
import { FormSection } from './FormSection';
import { HelpTooltip } from '@/components/help';
import type { ExtendedProductFormValues, TierLevel, ProductImage } from './types';

interface ImagesSectionProps {
  control: Control<ExtendedProductFormValues>;
  watch: UseFormWatch<ExtendedProductFormValues>;
  setValue: UseFormSetValue<ExtendedProductFormValues>;
  currentTier?: TierLevel;
  errorCount?: number;
  disabled?: boolean;
}

/**
 * Image preview component with error handling
 */
function ImagePreview({ url }: { url: string }) {
  const [error, setError] = useState(false);

  if (error || !url) {
    return (
      <div className="h-16 w-16 flex items-center justify-center bg-muted rounded">
        <ImageOff className="h-8 w-8 text-muted-foreground" />
      </div>
    );
  }

  return (
    <img
      src={url}
      alt=""
      className="h-16 w-16 object-cover rounded"
      onError={() => setError(true)}
    />
  );
}

/**
 * ImagesSection - Product images with URL input and management
 *
 * Fields:
 * - images[].url - Image URL (required)
 * - images[].altText - Alt text for accessibility (optional)
 * - images[].isMain - Main product image flag (only one)
 * - images[].caption - Image caption (optional)
 *
 * Features thumbnail preview, main image selection, and undo on remove.
 * Requires tier2 access.
 */
export function ImagesSection({
  control,
  watch,
  setValue,
  currentTier,
  errorCount = 0,
  disabled = false,
}: ImagesSectionProps) {
  const [newImageUrl, setNewImageUrl] = useState('');
  const [urlError, setUrlError] = useState('');

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'images',
  });

  const images = watch('images') || [];

  const handleAddImage = () => {
    const url = newImageUrl.trim();
    if (!url) {
      setUrlError('Please enter a URL');
      return;
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      setUrlError('Please enter a valid URL');
      return;
    }

    append({
      url,
      altText: '',
      isMain: fields.length === 0, // First image is main by default
      caption: '',
    });
    setNewImageUrl('');
    setUrlError('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddImage();
    }
  };

  const handleMainImageChange = (index: number) => {
    // Update all images to set only one as main
    images.forEach((img, i) => {
      setValue(`images.${i}.isMain`, i === index, { shouldDirty: true });
    });
  };

  const handleRemove = (index: number) => {
    const removedImage = images[index];
    const wasMain = removedImage?.isMain;
    remove(index);

    // If removed image was main and there are other images, set first as main
    if (wasMain && images.length > 1) {
      const newIndex = index === 0 ? 0 : 0;
      setTimeout(() => {
        setValue(`images.${newIndex}.isMain`, true, { shouldDirty: true });
      }, 0);
    }

    toast.success('Image removed', {
      description: 'The image has been removed from the product.',
      action: {
        label: 'Undo',
        onClick: () => {
          append(removedImage as ProductImage);
        },
      },
    });
  };

  const mainImageIndex = images.findIndex((img) => img?.isMain);

  return (
    <FormSection
      title="Product Images"
      description="Add product photos and media"
      icon={<ImageIcon className="h-5 w-5" />}
      tierRequired="tier2"
      currentTier={currentTier}
      errorCount={errorCount}
      testId="images-section"
    >
      <div className="space-y-4">
        {/* Image Guidelines */}
        <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground">
          <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium text-foreground">Image Recommendations</p>
            <p>Recommended size: 1200x800px. Supported formats: JPEG, PNG, WebP. First image becomes the main product image.</p>
          </div>
        </div>

        {/* Add Image Input */}
        <div className="flex gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="text-sm font-medium">Add Image URL</span>
              <HelpTooltip
                content="Enter a direct link to your product image. Use high-quality images for best results. The first image becomes the main product image."
                title="Product Images"
                iconSize={14}
              />
            </div>
            <Input
              placeholder="https://example.com/product-image.jpg"
              value={newImageUrl}
              onChange={(e) => {
                setNewImageUrl(e.target.value);
                setUrlError('');
              }}
              onKeyDown={handleKeyDown}
              disabled={disabled}
              className={cn(urlError && 'border-destructive')}
            />
            {urlError && (
              <p className="text-sm text-destructive mt-1">{urlError}</p>
            )}
          </div>
          <Button
            type="button"
            onClick={handleAddImage}
            disabled={disabled || !newImageUrl.trim()}
            className="mt-[26px]"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add
          </Button>
        </div>

        {/* Images List */}
        {fields.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <ImageIcon className="mx-auto h-12 w-12 mb-2 opacity-50" />
            <p className="font-medium">No images added yet</p>
            <p className="text-sm">Add image URLs to showcase your product</p>
          </div>
        ) : (
          <div className="space-y-3">
            {fields.map((field, index) => {
              const image = images[index];
              return (
                <Card key={field.id}>
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      {/* Thumbnail */}
                      <div className="flex-shrink-0">
                        <ImagePreview url={image?.url || ''} />
                      </div>

                      {/* Details */}
                      <div className="flex-1 space-y-3">
                        {/* URL Display */}
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm truncate flex-1 text-muted-foreground">
                            {image?.url}
                          </p>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {/* Main Image Indicator */}
                            <button
                              type="button"
                              onClick={() => handleMainImageChange(index)}
                              disabled={disabled}
                              className={cn(
                                'flex items-center gap-1 text-xs px-2 py-1 rounded-full transition-colors',
                                mainImageIndex === index
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                              )}
                            >
                              <Star
                                className={cn(
                                  'h-3 w-3',
                                  mainImageIndex === index && 'fill-current'
                                )}
                              />
                              Main
                            </button>

                            {/* Remove */}
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemove(index)}
                              disabled={disabled}
                              className="text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Alt Text and Caption */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <FormField
                            control={control}
                            name={`images.${index}.altText`}
                            render={({ field }) => (
                              <FormItem>
                                <div className="flex items-center gap-1">
                                  <FormLabel className="text-xs">Alt Text</FormLabel>
                                  <HelpTooltip
                                    content="Describe the image for screen readers and search engines. Good alt text improves accessibility and SEO."
                                    title="Alt Text"
                                    iconSize={12}
                                  />
                                </div>
                                <FormControl>
                                  <Input
                                    placeholder="Marine navigation system on yacht bridge"
                                    maxLength={255}
                                    disabled={disabled}
                                    {...field}
                                    value={field.value || ''}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={control}
                            name={`images.${index}.caption`}
                            render={({ field }) => (
                              <FormItem>
                                <div className="flex items-center gap-1">
                                  <FormLabel className="text-xs">Caption</FormLabel>
                                  <HelpTooltip
                                    content="Optional caption displayed below the image in galleries."
                                    title="Image Caption"
                                    iconSize={12}
                                  />
                                </div>
                                <FormControl>
                                  <Input
                                    placeholder="X5 Navigation System - Bridge Installation"
                                    maxLength={255}
                                    disabled={disabled}
                                    {...field}
                                    value={field.value || ''}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </FormSection>
  );
}

export default ImagesSection;
