'use client';

import type { Control } from 'react-hook-form';
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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Sparkles,
  Plus,
  Trash2,
  Star,
  Shield,
  Zap,
  Award,
  Check,
  Clock,
  Globe,
  Heart,
  Lock,
  Rocket,
  Settings,
  Target,
  ThumbsUp,
  TrendingUp,
  Wifi,
  Wrench,
  type LucideIcon,
} from 'lucide-react';
import { FormSection } from './FormSection';
import { HelpTooltip } from '@/components/help';
import type { ExtendedProductFormValues, TierLevel } from './types';

interface FeaturesSectionProps {
  control: Control<ExtendedProductFormValues>;
  currentTier?: TierLevel;
  errorCount?: number;
  disabled?: boolean;
}

// Common Lucide icons for features
const FEATURE_ICONS: Array<{ value: string; label: string; icon: LucideIcon }> = [
  { value: 'star', label: 'Star', icon: Star },
  { value: 'shield', label: 'Shield', icon: Shield },
  { value: 'zap', label: 'Zap', icon: Zap },
  { value: 'award', label: 'Award', icon: Award },
  { value: 'check', label: 'Check', icon: Check },
  { value: 'clock', label: 'Clock', icon: Clock },
  { value: 'globe', label: 'Globe', icon: Globe },
  { value: 'heart', label: 'Heart', icon: Heart },
  { value: 'lock', label: 'Lock', icon: Lock },
  { value: 'rocket', label: 'Rocket', icon: Rocket },
  { value: 'settings', label: 'Settings', icon: Settings },
  { value: 'target', label: 'Target', icon: Target },
  { value: 'thumbs-up', label: 'ThumbsUp', icon: ThumbsUp },
  { value: 'trending-up', label: 'TrendingUp', icon: TrendingUp },
  { value: 'wifi', label: 'Wifi', icon: Wifi },
  { value: 'wrench', label: 'Wrench', icon: Wrench },
];

/**
 * Get icon component by name
 */
function getIconComponent(iconName: string | undefined): LucideIcon | null {
  if (!iconName) return null;
  const found = FEATURE_ICONS.find((i) => i.value === iconName);
  return found?.icon || null;
}

/**
 * FeaturesSection - Product features with title, description, and icons
 *
 * Fields:
 * - features[].title - Feature name (required)
 * - features[].description - Feature description (optional)
 * - features[].icon - Lucide icon name (optional)
 * - features[].order - Display order
 *
 * Card-based layout for each feature.
 * Requires tier2 access.
 */
export function FeaturesSection({
  control,
  currentTier,
  errorCount = 0,
  disabled = false,
}: FeaturesSectionProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'features',
  });

  const handleAdd = () => {
    append({
      title: '',
      description: '',
      icon: '',
      order: fields.length,
    });
  };

  return (
    <FormSection
      title="Key Features"
      description="Highlight product capabilities"
      icon={<Sparkles className="h-5 w-5" />}
      tierRequired="tier2"
      currentTier={currentTier}
      errorCount={errorCount}
      testId="features-section"
    >
      <div className="space-y-4">
        {/* Section Help */}
        <FormDescription className="flex items-center gap-1.5">
          <span>Highlight key capabilities and benefits with optional icons.</span>
          <HelpTooltip
            content="Key features and benefits that set your product apart. Add icons for visual appeal. Focus on what makes your product valuable to customers."
            title="Key Features"
            iconSize={14}
          />
        </FormDescription>

        {fields.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Sparkles className="mx-auto h-12 w-12 mb-2 opacity-50" />
            <p className="font-medium">No features added yet</p>
            <p className="text-sm">Highlight key capabilities and benefits</p>
            <Button
              type="button"
              variant="outline"
              onClick={handleAdd}
              className="mt-4"
              disabled={disabled}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add your first feature
            </Button>
          </div>
        ) : (
          <>
            {fields.map((field, index) => (
              <Card key={field.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Feature {index + 1}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => remove(index)}
                      aria-label={`Remove feature ${index + 1}`}
                      disabled={disabled}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Icon selector */}
                    <FormField
                      control={control}
                      name={`features.${index}.icon`}
                      render={({ field }) => {
                        const IconComponent = getIconComponent(field.value || '');
                        return (
                          <FormItem className="w-full sm:w-32">
                            <div className="flex items-center gap-1">
                              <FormLabel>Icon</FormLabel>
                              <HelpTooltip
                                content="Optional icon to visually represent this feature."
                                title="Feature Icon"
                                iconSize={12}
                              />
                            </div>
                            <Select
                              onValueChange={(value) => field.onChange(value === 'none' ? '' : value)}
                              value={field.value || 'none'}
                              disabled={disabled}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="None">
                                    {IconComponent && (
                                      <div className="flex items-center gap-2">
                                        <IconComponent className="h-4 w-4" />
                                      </div>
                                    )}
                                  </SelectValue>
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="none">None</SelectItem>
                                {FEATURE_ICONS.map(({ value, label, icon: Icon }) => (
                                  <SelectItem key={value} value={value}>
                                    <div className="flex items-center gap-2">
                                      <Icon className="h-4 w-4" />
                                      <span>{label}</span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        );
                      }}
                    />

                    {/* Title */}
                    <FormField
                      control={control}
                      name={`features.${index}.title`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <div className="flex items-center gap-1">
                            <FormLabel>Title <span className="text-destructive">*</span></FormLabel>
                            <HelpTooltip
                              content="Short, compelling feature headline that catches attention."
                              title="Feature Title"
                              iconSize={12}
                            />
                          </div>
                          <FormControl>
                            <Input
                              placeholder="e.g., Real-time GPS Tracking"
                              maxLength={200}
                              disabled={disabled}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Description */}
                  <FormField
                    control={control}
                    name={`features.${index}.description`}
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center gap-1">
                          <FormLabel>Description</FormLabel>
                          <HelpTooltip
                            content="Brief explanation of the feature and its benefit to the customer."
                            title="Feature Description"
                            iconSize={12}
                          />
                        </div>
                        <FormControl>
                          <Textarea
                            placeholder="Track vessel position with sub-meter accuracy in real-time..."
                            className="resize-none min-h-[60px]"
                            rows={2}
                            maxLength={1000}
                            disabled={disabled}
                            {...field}
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            ))}

            <Button
              type="button"
              variant="outline"
              onClick={handleAdd}
              disabled={disabled}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Feature
            </Button>
          </>
        )}
      </div>
    </FormSection>
  );
}

