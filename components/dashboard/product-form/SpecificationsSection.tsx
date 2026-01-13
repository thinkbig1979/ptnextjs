'use client';

import { useRef } from 'react';
import type { Control } from 'react-hook-form';
import { useFieldArray } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ListChecks, Plus, Trash2 } from 'lucide-react';
import { FormSection } from './FormSection';
import type { ExtendedProductFormValues, TierLevel } from './types';

interface SpecificationsSectionProps {
  control: Control<ExtendedProductFormValues>;
  currentTier?: TierLevel;
  errorCount?: number;
  disabled?: boolean;
}

/**
 * SpecificationsSection - Technical specifications with label/value pairs
 *
 * Fields:
 * - specifications[].label - Specification name (required)
 * - specifications[].value - Specification value (required)
 *
 * Two-column layout on desktop, stacked on mobile.
 * Requires tier2 access.
 */
export function SpecificationsSection({
  control,
  currentTier,
  errorCount = 0,
  disabled = false,
}: SpecificationsSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'specifications',
  });

  const handleAdd = () => {
    append({ label: '', value: '' });
    // Focus on new row's label field after render
    setTimeout(() => {
      const inputs = containerRef.current?.querySelectorAll('input[name^="specifications"]');
      if (inputs && inputs.length >= 2) {
        const lastLabel = inputs[inputs.length - 2] as HTMLInputElement;
        lastLabel?.focus();
      }
    }, 0);
  };

  return (
    <FormSection
      title="Technical Specifications"
      description="Product technical details"
      icon={<ListChecks className="h-5 w-5" />}
      tierRequired="tier2"
      currentTier={currentTier}
      errorCount={errorCount}
      testId="specifications-section"
    >
      <div ref={containerRef} className="space-y-4">
        {fields.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <ListChecks className="mx-auto h-12 w-12 mb-2 opacity-50" />
            <p className="font-medium">No specifications added yet</p>
            <p className="text-sm">Add technical details like dimensions, weight, etc.</p>
            <Button
              type="button"
              variant="outline"
              onClick={handleAdd}
              className="mt-4"
              disabled={disabled}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add your first specification
            </Button>
          </div>
        ) : (
          <>
            {/* Header row for desktop */}
            <div className="hidden md:grid md:grid-cols-[1fr_1fr_40px] gap-4 text-sm font-medium text-muted-foreground pb-2">
              <span>Label</span>
              <span>Value</span>
              <span></span>
            </div>

            {fields.map((field, index) => (
              <div
                key={field.id}
                className="grid grid-cols-1 md:grid-cols-[1fr_1fr_40px] gap-4 items-start"
              >
                <FormField
                  control={control}
                  name={`specifications.${index}.label`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="md:sr-only">Label</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Display Size"
                          maxLength={100}
                          disabled={disabled}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name={`specifications.${index}.value`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="md:sr-only">Value</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., 15 inches"
                          maxLength={500}
                          disabled={disabled}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => remove(index)}
                  aria-label={`Remove specification ${index + 1}`}
                  disabled={disabled}
                  className="text-muted-foreground hover:text-destructive mt-[22px] md:mt-0"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              onClick={handleAdd}
              disabled={disabled}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Specification
            </Button>
          </>
        )}
      </div>
    </FormSection>
  );
}

export default SpecificationsSection;
