/**
 * Computed Fields Utilities
 *
 * Client-side utilities for computing derived fields from vendor data.
 * These computations match the backend logic to ensure consistency.
 */

/**
 * Compute years in business from founded year
 *
 * Matches backend logic and YearsInBusinessDisplay component
 *
 * @param foundedYear - Year company was founded
 * @returns Years in business or null if invalid
 */
export function computeYearsInBusiness(foundedYear?: number | null): number | null {
  if (!foundedYear || foundedYear < 1800 || foundedYear > new Date().getFullYear()) {
    return null;
  }
  return new Date().getFullYear() - foundedYear;
}

/**
 * Compute company age category
 *
 * @param foundedYear - Year company was founded
 * @returns Age category string or null
 */
export function computeAgeCategory(foundedYear?: number | null): string | null {
  const years = computeYearsInBusiness(foundedYear);

  if (years === null) return null;

  if (years < 5) return 'Emerging';
  if (years < 10) return 'Growing';
  if (years < 20) return 'Established';
  return 'Industry Veteran';
}

/**
 * Compute profile completion percentage
 *
 * @param vendor - Vendor data object
 * @returns Completion percentage (0-100)
 */
export function computeProfileCompletion(vendor: Record<string, any>): number {
  const requiredFields = [
    'companyName',
    'slug',
    'description',
    'contactEmail',
    'logo',
  ];

  const optionalFields = [
    'website',
    'linkedinUrl',
    'foundedYear',
    'longDescription',
    'certifications',
    'awards',
    'caseStudies',
    'teamMembers',
    'locations',
  ];

  let completedRequired = 0;
  let completedOptional = 0;

  // Check required fields (60% weight)
  for (const field of requiredFields) {
    if (vendor[field] && vendor[field] !== '') {
      completedRequired++;
    }
  }

  // Check optional fields (40% weight)
  for (const field of optionalFields) {
    const value = vendor[field];
    if (value) {
      // Check if array has items
      if (Array.isArray(value) && value.length > 0) {
        completedOptional++;
      }
      // Check if string is not empty
      else if (typeof value === 'string' && value.length > 0) {
        completedOptional++;
      }
      // Check if object is not empty
      else if (typeof value === 'object' && Object.keys(value).length > 0) {
        completedOptional++;
      }
      // Check if number is valid
      else if (typeof value === 'number' && !isNaN(value)) {
        completedOptional++;
      }
    }
  }

  const requiredScore = (completedRequired / requiredFields.length) * 60;
  const optionalScore = (completedOptional / optionalFields.length) * 40;

  return Math.round(requiredScore + optionalScore);
}

/**
 * Compute profile strength indicator
 *
 * @param completionPercentage - Profile completion percentage
 * @returns Strength indicator object
 */
export function computeProfileStrength(completionPercentage: number): {
  label: string;
  color: string;
  description: string;
} {
  if (completionPercentage < 30) {
    return {
      label: 'Weak',
      color: 'red',
      description: 'Complete more fields to improve your profile visibility',
    };
  }
  if (completionPercentage < 60) {
    return {
      label: 'Fair',
      color: 'orange',
      description: 'Add more details to stand out to potential clients',
    };
  }
  if (completionPercentage < 90) {
    return {
      label: 'Good',
      color: 'blue',
      description: 'Your profile is looking great! Add a few more details',
    };
  }
  return {
    label: 'Excellent',
    color: 'green',
    description: 'Your profile is complete and optimized',
  };
}

/**
 * Compute social media follower total
 *
 * @param vendor - Vendor data object
 * @returns Total follower count across all platforms
 */
export function computeTotalFollowers(vendor: Record<string, any>): number {
  const linkedinFollowers = vendor.linkedinFollowers ?? 0;
  const instagramFollowers = vendor.instagramFollowers ?? 0;
  const twitterFollowers = vendor.twitterFollowers ?? 0;

  return linkedinFollowers + instagramFollowers + twitterFollowers;
}

/**
 * Format number with thousand separators
 *
 * @param num - Number to format
 * @returns Formatted number string
 */
export function formatNumber(num: number | null | undefined): string {
  if (num === null || num === undefined || isNaN(num)) return '0';
  return num.toLocaleString();
}

/**
 * Format large numbers with K/M suffix
 *
 * @param num - Number to format
 * @returns Formatted number string with suffix
 */
export function formatLargeNumber(num: number | null | undefined): string {
  if (num === null || num === undefined || isNaN(num)) return '0';

  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
}

/**
 * Compute average rating from reviews
 *
 * @param reviews - Array of review objects with rating field
 * @returns Average rating or null
 */
export function computeAverageRating(reviews?: Array<{ rating: number }>): number | null {
  if (!reviews || reviews.length === 0) return null;

  const sum = reviews.reduce((acc, review) => acc + (review.rating ?? 0), 0);
  return sum / reviews.length;
}

/**
 * Compute formatted rating display
 *
 * @param rating - Rating value (0-5)
 * @returns Formatted rating string (e.g., "4.5")
 */
export function formatRating(rating: number | null | undefined): string {
  if (rating === null || rating === undefined || isNaN(rating)) return '0.0';
  return rating.toFixed(1);
}

/**
 * Check if vendor data is complete enough for public display
 *
 * @param vendor - Vendor data object
 * @returns Boolean indicating if vendor is display-ready
 */
export function isVendorPublishReady(vendor: Record<string, any>): boolean {
  const requiredFields = ['companyName', 'slug', 'description', 'contactEmail'];

  return requiredFields.every((field) => {
    const value = vendor[field];
    return value && value !== '';
  });
}

/**
 * Compute missing required fields for publishing
 *
 * @param vendor - Vendor data object
 * @returns Array of missing field names
 */
export function getMissingRequiredFields(vendor: Record<string, any>): string[] {
  const requiredFields = [
    { key: 'companyName', label: 'Company Name' },
    { key: 'slug', label: 'URL Slug' },
    { key: 'description', label: 'Short Description' },
    { key: 'contactEmail', label: 'Contact Email' },
    { key: 'logo', label: 'Company Logo' },
  ];

  const missing: string[] = [];

  for (const field of requiredFields) {
    const value = vendor[field.key];
    if (!value || value === '') {
      missing.push(field.label);
    }
  }

  return missing;
}

/**
 * Compute recommended next steps for profile improvement
 *
 * @param vendor - Vendor data object
 * @returns Array of recommended action strings
 */
export function getRecommendedActions(vendor: Record<string, any>): string[] {
  const actions: string[] = [];

  if (!vendor.logo) {
    actions.push('Upload your company logo');
  }
  if (!vendor.website) {
    actions.push('Add your website URL');
  }
  if (!vendor.foundedYear) {
    actions.push('Add your company founding year');
  }
  if (!vendor.longDescription) {
    actions.push('Write a detailed company description');
  }
  if (!vendor.locations || vendor.locations.length === 0) {
    actions.push('Add your company location');
  }
  if (!vendor.certifications || vendor.certifications.length === 0) {
    actions.push('Add industry certifications');
  }
  if (!vendor.caseStudies || vendor.caseStudies.length === 0) {
    actions.push('Share a success story or case study');
  }

  return actions;
}
