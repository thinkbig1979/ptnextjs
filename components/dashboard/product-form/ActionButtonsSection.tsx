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
import { Card, CardContent } from '@/components/ui/card';
import { MousePointerClick, Plus, Trash2 } from 'lucide-react';
import { FormSection } from './FormSection';
import type { ExtendedProductFormValues, TierLevel } from './types';

interface ActionButtonsSectionProps {
  control: Control<ExtendedProductFormValues>;
  watch: UseFormWatch<ExtendedProductFormValues>;
  currentTier?: TierLevel;
  errorCount?: number;
  disabled?: boolean;
}

const BUTTON_TYPES = [
  { value: 'primary', label: 'Primary' },
  { value: 'secondary', label: 'Secondary' },
  { value: 'outline', label: 'Outline' },
] as const;

const ACTION_TYPES = [
  { value: 'contact', label: 'Contact Form', needsData: false },
  { value: 'quote', label: 'Request Quote', needsData: false },
  { value: 'download', label: 'Download File', needsData: true },
  { value: 'external_link', label: 'External Link', needsData: true },
  { value: 'video', label: 'Play Video', needsData: true },
] as const;

/**
 * ActionButtonsSection - Call-to-action button configuration
 *
 * Fields:
 * - actionButtons[].label - Button text (required)
 * - actionButtons[].type - Button style (primary/secondary/outline)
 * - actionButtons[].action - Action type (contact/quote/download/external_link/video)
 * - actionButtons[].actionData - URL for download/external_link/video actions
 * - actionButtons[].icon - Optional Lucide icon name
 * - actionButtons[].order - Display order
 *
 * Shows live preview of configured button.
 * Requires tier2 access.
 */
export function ActionButtonsSection({
  control,
  watch,
  currentTier,
  errorCount = 0,
  disabled = false,
}: ActionButtonsSectionProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'actionButtons',
  });

  const watchedButtons = watch('actionButtons') || [];

  return (
    <FormSection
      title="Action Buttons"
      description="Call-to-action buttons for product page"
      icon={<MousePointerClick className="h-5 w-5" />}
      tierRequired="tier2"
      currentTier={currentTier}
      errorCount={errorCount}
      testId="action-buttons-section"
    >
      <div className="space-y-4">
        {fields.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MousePointerClick className="mx-auto h-12 w-12 mb-2 opacity-50" />
            <p className="font-medium">No action buttons added yet</p>
            <p className="text-sm">Add buttons like Contact Us, Request Quote, etc.</p>
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                append({ label: '', type: 'primary', action: 'contact', order: 0 })
              }
              className="mt-4"
              disabled={disabled}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add your first button
            </Button>
          </div>
        ) : (
          <>
            {fields.map((field, index) => {
              const currentAction = watchedButtons[index]?.action;
              const needsActionData = ACTION_TYPES.find(
                (a) => a.value === currentAction
              )?.needsData;
              const buttonLabel = watchedButtons[index]?.label || 'Button Preview';
              const buttonType = watchedButtons[index]?.type || 'primary';

              return (
                <Card key={field.id}>
                  <CardContent className="pt-6 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-muted-foreground">
                        Button {index + 1}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(index)}
                        disabled={disabled}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Label */}
                    <FormField
                      control={control}
                      name={`actionButtons.${index}.label`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Button Label <span className="text-destructive">*</span></FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., Contact Us"
                              maxLength={100}
                              disabled={disabled}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Type and Action Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={control}
                        name={`actionButtons.${index}.type`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Button Style</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                              disabled={disabled}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select style" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {BUTTON_TYPES.map(({ value, label }) => (
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

                      <FormField
                        control={control}
                        name={`actionButtons.${index}.action`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Action Type</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                              disabled={disabled}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select action" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {ACTION_TYPES.map(({ value, label }) => (
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
                    </div>

                    {/* Action Data (conditional) */}
                    {needsActionData && (
                      <FormField
                        control={control}
                        name={`actionButtons.${index}.actionData`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>URL</FormLabel>
                            <FormControl>
                              <Input
                                type="url"
                                placeholder="https://..."
                                maxLength={500}
                                disabled={disabled}
                                {...field}
                                value={field.value || ''}
                              />
                            </FormControl>
                            <FormDescription>
                              {currentAction === 'download' && 'Link to downloadable file'}
                              {currentAction === 'external_link' && 'External website URL'}
                              {currentAction === 'video' && 'Video URL (YouTube, Vimeo, etc.)'}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    {/* Preview */}
                    <div className="pt-2 border-t">
                      <span className="text-xs text-muted-foreground mb-2 block">
                        Preview:
                      </span>
                      <Button
                        variant={buttonType === 'primary' ? 'default' : buttonType}
                        size="sm"
                        type="button"
                        className="pointer-events-none"
                      >
                        {buttonLabel}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            <Button
              type="button"
              variant="outline"
              onClick={() =>
                append({
                  label: '',
                  type: 'primary',
                  action: 'contact',
                  order: fields.length,
                })
              }
              disabled={disabled}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Action Button
            </Button>
          </>
        )}
      </div>
    </FormSection>
  );
}

export default ActionButtonsSection;
