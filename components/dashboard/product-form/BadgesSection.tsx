'use client';

import type { Control, UseFormWatch } from 'react-hook-form';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Award, Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FormSection } from './FormSection';
import { HelpTooltip } from '@/components/help';
import type { ExtendedProductFormValues, TierLevel, Badge as BadgeType } from './types';

interface BadgesSectionProps {
  control: Control<ExtendedProductFormValues>;
  watch: UseFormWatch<ExtendedProductFormValues>;
  currentTier?: TierLevel;
  errorCount?: number;
  disabled?: boolean;
}

const BADGE_TYPES = [
  { value: 'secondary', label: 'Default', description: 'Gray, standard badge' },
  { value: 'outline', label: 'Outline', description: 'Border only' },
  { value: 'success', label: 'Success', description: 'Green, for certifications' },
  { value: 'warning', label: 'Warning', description: 'Yellow, for notices' },
  { value: 'info', label: 'Info', description: 'Blue, for features' },
] as const;

/**
 * Get variant and additional classes for badge type
 */
function getBadgeStyles(type: BadgeType['type']) {
  switch (type) {
    case 'success':
      return {
        variant: 'secondary' as const,
        className: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800',
      };
    case 'warning':
      return {
        variant: 'secondary' as const,
        className: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800',
      };
    case 'info':
      return {
        variant: 'secondary' as const,
        className: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
      };
    case 'outline':
      return { variant: 'outline' as const, className: '' };
    case 'secondary':
    default:
      return { variant: 'secondary' as const, className: '' };
  }
}

/**
 * BadgesSection - Quality badges and certifications
 *
 * Fields:
 * - badges[].label - Badge text (required)
 * - badges[].type - Badge style variant
 * - badges[].icon - Optional Lucide icon name
 * - badges[].order - Display order
 *
 * Requires tier2 access.
 */
export function BadgesSection({
  control,
  watch,
  currentTier,
  errorCount = 0,
  disabled = false,
}: BadgesSectionProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'badges',
  });

  return (
    <FormSection
      title="Quality Badges"
      description="Certifications, awards, and indicators"
      icon={<Award className="h-5 w-5" />}
      tierRequired="tier2"
      currentTier={currentTier}
      errorCount={errorCount}
      testId="badges-section"
    >
      <div className="space-y-4">
        {/* Section Help */}
        <FormDescription className="flex items-center gap-1.5">
          <span>Add badges for certifications, awards, and status indicators.</span>
          <HelpTooltip
            content="Visual labels highlighting certifications, awards, or status indicators like 'New', 'Sale', or 'Popular'. Use Success (green) for certifications, Info (blue) for features."
            title="Quality Badges"
            iconSize={14}
          />
        </FormDescription>

        {fields.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Award className="mx-auto h-12 w-12 mb-2 opacity-50" />
            <p className="font-medium">No badges added yet</p>
            <p className="text-sm">Add certifications, awards, or quality indicators</p>
            <Button
              type="button"
              variant="outline"
              onClick={() => append({ label: '', type: 'success', order: 0 })}
              className="mt-4"
              disabled={disabled}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add your first badge
            </Button>
          </div>
        ) : (
          <>
            {fields.map((field, index) => {
              const badgeType = watch(`badges.${index}.type`) || 'secondary';
              const badgeLabel = watch(`badges.${index}.label`) || '';
              const { variant, className } = getBadgeStyles(badgeType);

              return (
                <div
                  key={field.id}
                  className="grid grid-cols-1 md:grid-cols-[1fr_140px_auto_auto] gap-4 items-end p-4 border rounded-lg"
                >
                  {/* Label */}
                  <FormField
                    control={control}
                    name={`badges.${index}.label`}
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center gap-1">
                          <FormLabel>Badge Text <span className="text-destructive">*</span></FormLabel>
                          <HelpTooltip
                            content="The text displayed in the badge. Keep it short and descriptive."
                            title="Badge Text"
                            iconSize={12}
                          />
                        </div>
                        <FormControl>
                          <Input
                            placeholder="e.g., ISO 9001 Certified"
                            maxLength={100}
                            disabled={disabled}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Type */}
                  <FormField
                    control={control}
                    name={`badges.${index}.type`}
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center gap-1">
                          <FormLabel>Style</FormLabel>
                          <HelpTooltip
                            content="Badge color style: Success (green) for certifications, Info (blue) for features, Warning (yellow) for notices."
                            title="Badge Style"
                            iconSize={12}
                          />
                        </div>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          disabled={disabled}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Style" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {BADGE_TYPES.map(({ value, label }) => (
                              <SelectItem key={value} value={value}>
                                {label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Preview */}
                  <div className="flex items-center justify-center min-w-[100px]">
                    <Badge variant={variant} className={cn(className)}>
                      {badgeLabel || 'Preview'}
                    </Badge>
                  </div>

                  {/* Remove */}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(index)}
                    aria-label={`Remove badge ${index + 1}`}
                    disabled={disabled}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}

            <Button
              type="button"
              variant="outline"
              onClick={() => append({ label: '', type: 'success', order: fields.length })}
              disabled={disabled}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Badge
            </Button>
          </>
        )}
      </div>
    </FormSection>
  );
}

export default BadgesSection;
