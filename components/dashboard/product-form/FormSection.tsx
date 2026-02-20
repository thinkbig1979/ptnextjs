'use client';

import * as React from 'react';
import { ChevronDown, Lock } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { TierLevel } from './types';

interface FormSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  tierRequired?: TierLevel;
  currentTier?: TierLevel;
  icon?: React.ReactNode;
  errorCount?: number;
  testId?: string;
  className?: string;
}

/**
 * Get display name for tier level
 */
function getTierDisplayName(tier: TierLevel): string {
  switch (tier) {
    case 'tier1':
      return 'Tier 1';
    case 'tier2':
      return 'Tier 2';
    case 'tier3':
      return 'Tier 3';
    default:
      return tier;
  }
}

/**
 * Check if current tier meets the required tier
 */
function hasTierAccess(currentTier: TierLevel | undefined, requiredTier: TierLevel): boolean {
  const tierHierarchy: Record<TierLevel, number> = {
    free: 0,
    tier1: 1,
    tier2: 2,
    tier3: 3,
  };

  const currentLevel = tierHierarchy[currentTier || 'free'];
  const requiredLevel = tierHierarchy[requiredTier];

  return currentLevel >= requiredLevel;
}

/**
 * Tier Upgrade Prompt component shown in locked sections
 */
function TierUpgradePrompt({ tier }: { tier: TierLevel }) {
  return (
    <div className="p-6 text-center bg-muted/50 rounded-b-lg border-t">
      <Lock className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
      <h3 className="font-medium mb-2">Upgrade Required</h3>
      <p className="text-sm text-muted-foreground mb-4">
        This feature requires {getTierDisplayName(tier)} or higher.
      </p>
      <Button variant="outline" asChild>
        <a href="/portal/settings/subscription">View Upgrade Options</a>
      </Button>
    </div>
  );
}

/**
 * FormSection - Reusable collapsible section component for the product form
 *
 * Features:
 * - Collapsible accordion-style section
 * - Tier gating with locked state and upgrade prompt
 * - Error count badge display
 * - Keyboard accessible (Enter/Space to toggle)
 * - ARIA attributes for screen readers
 */
export function FormSection({
  title,
  description,
  children,
  defaultOpen = false,
  tierRequired,
  currentTier,
  icon,
  errorCount = 0,
  testId,
  className,
}: FormSectionProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);
  const contentId = React.useId();
  const triggerId = React.useId();

  // Check if the section is accessible based on tier
  const isLocked = tierRequired ? !hasTierAccess(currentTier, tierRequired) : false;

  // Prevent opening locked sections
  const handleOpenChange = (open: boolean) => {
    if (isLocked) {
      return;
    }
    setIsOpen(open);
  };

  return (
    <div
      data-testid={testId}
      className={cn(
        'border rounded-lg bg-card overflow-hidden',
        isLocked && 'opacity-75',
        className
      )}
    >
      <Collapsible open={isOpen} onOpenChange={handleOpenChange}>
        <CollapsibleTrigger asChild>
          <button
            id={triggerId}
            type="button"
            className={cn(
              'w-full flex items-center justify-between p-4 text-left transition-colors',
              'hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-inset',
              isLocked && 'cursor-not-allowed'
            )}
            aria-expanded={isOpen}
            aria-controls={contentId}
            disabled={isLocked}
          >
            <div className="flex items-center gap-3">
              {icon && (
                <span className="flex-shrink-0 text-muted-foreground">{icon}</span>
              )}
              <div>
                <span className="font-medium text-foreground">{title}</span>
                {description && (
                  <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Tier badge for restricted content */}
              {tierRequired && isLocked && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Lock className="h-3 w-3" />
                  <span>{getTierDisplayName(tierRequired)}</span>
                </Badge>
              )}

              {/* Error count badge */}
              {errorCount > 0 && !isLocked && (
                <Badge variant="destructive" className="tabular-nums">
                  {errorCount} {errorCount === 1 ? 'error' : 'errors'}
                </Badge>
              )}

              {/* Expand/collapse indicator */}
              <ChevronDown
                className={cn(
                  'h-5 w-5 text-muted-foreground transition-transform duration-200',
                  isOpen && 'rotate-180'
                )}
                aria-hidden="true"
              />
            </div>
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent
          id={contentId}
          aria-labelledby={triggerId}
          className="data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up"
        >
          {isLocked ? (
            <TierUpgradePrompt tier={tierRequired!} />
          ) : (
            <div className="p-4 pt-0 border-t">{children}</div>
          )}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

