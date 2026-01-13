/**
 * Help system type definitions for the Vendor Dashboard
 */

/**
 * Content displayed in a tooltip
 */
export interface TooltipContent {
  /** Main tooltip text */
  text: string;
  /** Optional title for the tooltip */
  title?: string;
  /** Optional URL for "Learn more" link */
  learnMoreUrl?: string;
}

/**
 * Help content for a specific form field
 */
export interface FieldHelp {
  /** Unique identifier matching the form field name */
  fieldName: string;
  /** Tooltip content for the field */
  tooltip: TooltipContent;
  /** Placeholder text suggestion */
  placeholder?: string;
  /** Character limits for text fields */
  characterLimits?: {
    min?: number;
    max: number;
  };
  /** Example values to show users */
  examples?: string[];
}

/**
 * Help content for a form section
 */
export interface SectionHelp {
  /** Section identifier */
  sectionId: string;
  /** Section title for display */
  title: string;
  /** Brief description of the section's purpose */
  description: string;
  /** Help content for individual fields in this section */
  fields: FieldHelp[];
}

/**
 * Complete help content for a page or feature
 */
export interface PageHelp {
  /** Page identifier */
  pageId: string;
  /** Page title */
  title: string;
  /** Overview description */
  description: string;
  /** Sections within this page */
  sections: SectionHelp[];
}
