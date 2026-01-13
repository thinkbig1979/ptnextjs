/**
 * Help System - Central exports for the Vendor Dashboard Help System
 *
 * This module provides:
 * - Type definitions for help content
 * - Pre-configured help content for all dashboard sections
 */

// Type exports
export type {
  TooltipContent,
  FieldHelp,
  SectionHelp,
  PageHelp,
} from './types';

// Content exports - Registration flow
export { registrationHelp } from './content/registration';

// Content exports - Vendor profile sections
export { basicInfoHelp } from './content/basic-info';
export { locationsHelp } from './content/locations';
export { productsHelp } from './content/products';
export { brandStoryHelp } from './content/brand-story';

// Content exports - Subscription management
export { tierSystemHelp, tierFeatureHelp } from './content/tier-system';
export { subscriptionHelp } from './content/subscription';
