'use client';

import * as React from 'react';
import type { Control, UseFormSetValue, UseFormWatch } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { FolderTree, Tags, Check, ChevronsUpDown, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FormSection } from './FormSection';
import type {
  ExtendedProductFormValues,
  TierLevel,
  CategoryOption,
  TagOption,
} from './types';

interface CategoriesTagsSectionProps {
  control: Control<ExtendedProductFormValues>;
  watch: UseFormWatch<ExtendedProductFormValues>;
  setValue: UseFormSetValue<ExtendedProductFormValues>;
  currentTier?: TierLevel;
  errorCount?: number;
  disabled?: boolean;
}

interface CategoriesResponse {
  docs: CategoryOption[];
  totalDocs: number;
}

interface TagsResponse {
  docs: TagOption[];
  totalDocs: number;
}

/**
 * Custom hook to fetch categories from API
 */
function useCategories() {
  const [categories, setCategories] = React.useState<CategoryOption[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    async function fetchCategories() {
      try {
        setIsLoading(true);
        const response = await fetch('/api/categories');
        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }
        const data: CategoriesResponse = await response.json();
        if (!cancelled) {
          setCategories(data.docs);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load categories');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    fetchCategories();

    return () => {
      cancelled = true;
    };
  }, []);

  return { categories, isLoading, error };
}

/**
 * Custom hook to fetch tags from API
 */
function useTags() {
  const [tags, setTags] = React.useState<TagOption[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    async function fetchTags() {
      try {
        setIsLoading(true);
        const response = await fetch('/api/tags');
        if (!response.ok) {
          throw new Error('Failed to fetch tags');
        }
        const data: TagsResponse = await response.json();
        if (!cancelled) {
          setTags(data.docs);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load tags');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    fetchTags();

    return () => {
      cancelled = true;
    };
  }, []);

  return { tags, isLoading, error };
}

/**
 * Multi-select dropdown component using Popover + Command
 */
interface MultiSelectProps<T extends { id: string | number; name: string }> {
  options: T[];
  selected: (string | number)[];
  onChange: (selected: (string | number)[]) => void;
  placeholder: string;
  searchPlaceholder: string;
  emptyMessage: string;
  isLoading?: boolean;
  error?: string | null;
  disabled?: boolean;
  getOptionColor?: (option: T) => string | undefined;
}

function MultiSelect<T extends { id: string | number; name: string }>({
  options,
  selected,
  onChange,
  placeholder,
  searchPlaceholder,
  emptyMessage,
  isLoading = false,
  error = null,
  disabled = false,
  getOptionColor,
}: MultiSelectProps<T>) {
  const [open, setOpen] = React.useState(false);

  const selectedOptions = React.useMemo(() => {
    return options.filter((opt) =>
      selected.some((s) => String(s) === String(opt.id))
    );
  }, [options, selected]);

  const handleSelect = (optionId: string | number) => {
    const stringId = String(optionId);
    const isSelected = selected.some((s) => String(s) === stringId);

    if (isSelected) {
      onChange(selected.filter((s) => String(s) !== stringId));
    } else {
      onChange([...selected, optionId]);
    }
  };

  const handleRemove = (optionId: string | number, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(selected.filter((s) => String(s) !== String(optionId)));
  };

  if (error) {
    return (
      <div className="text-sm text-destructive border border-destructive/50 rounded-md p-3">
        {error}
      </div>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between min-h-[40px] h-auto"
          disabled={disabled || isLoading}
        >
          <div className="flex flex-wrap gap-1 flex-1 text-left">
            {isLoading ? (
              <span className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading...
              </span>
            ) : selectedOptions.length === 0 ? (
              <span className="text-muted-foreground">{placeholder}</span>
            ) : (
              selectedOptions.map((option) => {
                const color = getOptionColor?.(option);
                return (
                  <Badge
                    key={option.id}
                    variant="secondary"
                    className={cn(
                      'mr-1 mb-1',
                      color && `bg-${color}-100 text-${color}-800 dark:bg-${color}-900/30 dark:text-${color}-300`
                    )}
                    style={color ? { backgroundColor: `${color}20`, color: color } : undefined}
                  >
                    {option.name}
                    <button
                      type="button"
                      className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={(e) => handleRemove(option.id, e)}
                      aria-label={`Remove ${option.name}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                );
              })
            )}
          </div>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full min-w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = selected.some(
                  (s) => String(s) === String(option.id)
                );
                const color = getOptionColor?.(option);
                return (
                  <CommandItem
                    key={option.id}
                    value={option.name}
                    onSelect={() => handleSelect(option.id)}
                  >
                    <div
                      className={cn(
                        'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary',
                        isSelected
                          ? 'bg-primary text-primary-foreground'
                          : 'opacity-50 [&_svg]:invisible'
                      )}
                    >
                      <Check className="h-4 w-4" />
                    </div>
                    {color && (
                      <span
                        className="w-3 h-3 rounded-full mr-2 shrink-0"
                        style={{ backgroundColor: color }}
                      />
                    )}
                    <span>{option.name}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

/**
 * CategoriesTagsSection - Product categorization with multi-select dropdowns
 *
 * Fields:
 * - categories[] - Array of category IDs
 * - tags[] - Array of tag IDs
 *
 * Fetches available categories and tags from API endpoints:
 * - GET /api/categories
 * - GET /api/tags
 */
export function CategoriesTagsSection({
  control,
  watch,
  setValue,
  currentTier,
  errorCount = 0,
  disabled = false,
}: CategoriesTagsSectionProps) {
  const { categories, isLoading: categoriesLoading, error: categoriesError } = useCategories();
  const { tags, isLoading: tagsLoading, error: tagsError } = useTags();

  const selectedCategories = watch('categories') || [];
  const selectedTags = watch('tags') || [];

  return (
    <FormSection
      title="Categories & Tags"
      description="Organize your product for better discoverability"
      icon={<FolderTree className="h-5 w-5" />}
      currentTier={currentTier}
      errorCount={errorCount}
      testId="categories-tags-section"
      defaultOpen
    >
      <div className="space-y-6">
        {/* Categories */}
        <FormField
          control={control}
          name="categories"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categories</FormLabel>
              <FormDescription>
                Select one or more categories for this product
              </FormDescription>
              <FormControl>
                <MultiSelect
                  options={categories}
                  selected={field.value || []}
                  onChange={(value) => {
                    field.onChange(value);
                  }}
                  placeholder="Select categories..."
                  searchPlaceholder="Search categories..."
                  emptyMessage="No categories found."
                  isLoading={categoriesLoading}
                  error={categoriesError}
                  disabled={disabled}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Tags */}
        <FormField
          control={control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Tags className="h-4 w-4" />
                Tags
              </FormLabel>
              <FormDescription>
                Add tags to help users find this product
              </FormDescription>
              <FormControl>
                <MultiSelect
                  options={tags}
                  selected={field.value || []}
                  onChange={(value) => {
                    field.onChange(value);
                  }}
                  placeholder="Select tags..."
                  searchPlaceholder="Search tags..."
                  emptyMessage="No tags found."
                  isLoading={tagsLoading}
                  error={tagsError}
                  disabled={disabled}
                  getOptionColor={(tag) => tag.color}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Summary */}
        {(selectedCategories.length > 0 || selectedTags.length > 0) && (
          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              Selected: {selectedCategories.length} {selectedCategories.length === 1 ? 'category' : 'categories'}, {selectedTags.length} {selectedTags.length === 1 ? 'tag' : 'tags'}
            </p>
          </div>
        )}
      </div>
    </FormSection>
  );
}

export default CategoriesTagsSection;
