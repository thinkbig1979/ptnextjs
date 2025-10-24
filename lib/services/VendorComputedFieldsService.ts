/**
 * VendorComputedFieldsService - Computed field calculations for vendors
 *
 * Handles runtime computation of derived fields like yearsInBusiness.
 * These fields are computed from stored data rather than stored directly.
 */

export interface VendorWithComputed {
  yearsInBusiness?: number | null;
  [key: string]: any;
}

export class VendorComputedFieldsService {
  /**
   * Compute years in business from founded year
   *
   * @param foundedYear - Year company was founded
   * @returns Number of years in business, or null if invalid
   */
  static computeYearsInBusiness(foundedYear?: number | null): number | null {
    // Handle null or undefined
    if (!foundedYear) {
      return null;
    }

    const currentYear = new Date().getFullYear();

    // Validate founded year is reasonable
    if (foundedYear < 1800 || foundedYear > currentYear) {
      console.warn(
        `[VendorComputedFields] Invalid foundedYear: ${foundedYear}. Must be between 1800 and ${currentYear}.`
      );
      return null;
    }

    // Calculate years in business
    const years = currentYear - foundedYear;

    // Sanity check
    if (years < 0) {
      console.warn(
        `[VendorComputedFields] Negative years in business computed for foundedYear: ${foundedYear}`
      );
      return null;
    }

    return years;
  }

  /**
   * Enrich vendor data with computed fields
   *
   * @param vendor - Vendor object to enrich
   * @returns Vendor object with computed fields added
   */
  static enrichVendorData<T extends Record<string, any>>(
    vendor: T
  ): T & VendorWithComputed {
    // Create shallow copy to avoid mutation
    const enriched = { ...vendor } as T & VendorWithComputed;

    // Compute years in business if foundedYear exists
    if ('foundedYear' in vendor) {
      enriched.yearsInBusiness = this.computeYearsInBusiness(
        vendor.foundedYear as number | undefined
      );
    }

    return enriched;
  }

  /**
   * Enrich multiple vendors with computed fields
   *
   * @param vendors - Array of vendor objects
   * @returns Array of enriched vendor objects
   */
  static enrichVendorsData<T extends Record<string, any>>(
    vendors: T[]
  ): (T & VendorWithComputed)[] {
    return vendors.map((vendor) => this.enrichVendorData(vendor));
  }

  /**
   * Compute all derived metrics for a vendor
   * (Extensible for future computed fields)
   *
   * @param vendor - Vendor object
   * @returns Object with all computed metrics
   */
  static computeAllMetrics(vendor: Record<string, any>): {
    yearsInBusiness: number | null;
    // Add more computed fields here in the future
  } {
    return {
      yearsInBusiness: this.computeYearsInBusiness(vendor.foundedYear),
      // Future computed fields:
      // totalRevenue: this.computeTotalRevenue(vendor.projects),
      // averageProjectSize: this.computeAvgProjectSize(vendor.projects),
      // etc.
    };
  }

  /**
   * Validate founded year for data integrity
   *
   * @param foundedYear - Year to validate
   * @returns true if valid, false otherwise
   */
  static isValidFoundedYear(foundedYear?: number | null): boolean {
    if (!foundedYear) return false;

    const currentYear = new Date().getFullYear();
    return foundedYear >= 1800 && foundedYear <= currentYear;
  }

  /**
   * Get founded year validation constraints
   *
   * @returns Object with min and max founded year
   */
  static getFoundedYearConstraints(): { min: number; max: number } {
    return {
      min: 1800,
      max: new Date().getFullYear(),
    };
  }
}

export default VendorComputedFieldsService;
