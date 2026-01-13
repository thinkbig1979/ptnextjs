'use client';

import * as React from 'react';
import { HelpCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

export interface HelpTooltipProps {
  /** Main content text for the tooltip */
  content: string;
  /** Optional title displayed at the top of the tooltip */
  title?: string;
  /** Optional URL for a "Learn more" link */
  learnMoreUrl?: string;
  /** Additional CSS classes for the trigger button */
  className?: string;
  /** Size of the help icon in pixels */
  iconSize?: number;
  /** Side of the trigger to position the tooltip */
  side?: 'top' | 'right' | 'bottom' | 'left';
  /** Alignment of the tooltip relative to the trigger */
  align?: 'start' | 'center' | 'end';
}

/**
 * HelpTooltip - Displays contextual help information in a tooltip
 *
 * Wraps the existing shadcn/ui tooltip with a help circle icon trigger.
 * Fully accessible with keyboard navigation support.
 *
 * @example
 * <HelpTooltip
 *   content="Enter your company's legal business name"
 *   title="Business Name"
 *   learnMoreUrl="/help/business-name"
 * />
 */
export function HelpTooltip({
  content,
  title,
  learnMoreUrl,
  className,
  iconSize = 16,
  side = 'top',
  align = 'center',
}: HelpTooltipProps) {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <button
            type="button"
            className={cn(
              'inline-flex items-center justify-center rounded-full',
              'text-muted-foreground hover:text-foreground',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              'transition-colors duration-200',
              className
            )}
            aria-label={title ? `Help: ${title}` : 'Help information'}
          >
            <HelpCircle size={iconSize} />
          </button>
        </TooltipTrigger>
        <TooltipContent
          side={side}
          align={align}
          className="max-w-xs"
        >
          <div className="space-y-1.5">
            {title && (
              <p className="font-semibold text-sm">{title}</p>
            )}
            <p className="text-sm">{content}</p>
            {learnMoreUrl && (
              <a
                href={learnMoreUrl}
                className="inline-block text-xs text-primary hover:underline mt-1"
                target="_blank"
                rel="noopener noreferrer"
              >
                Learn more
              </a>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default HelpTooltip;
