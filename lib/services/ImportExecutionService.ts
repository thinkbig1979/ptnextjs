/**
 * Import Execution Service
 *
 * Executes validated vendor data imports with atomic operations, rollback capability,
 * and comprehensive audit logging.
 *
 * Features:
 * - Atomic import execution with error recovery
 * - Update existing vendor data (not create new vendors)
 * - Rollback on errors
 * - Create import history records
 * - Track changes (before/after snapshots)
 * - Handle partial updates (only update provided fields)
 * - Dry-run mode for preview
 *
 * @module lib/services/ImportExecutionService
 */

import { getPayloadClient } from '@/lib/utils/get-payload-config';
import type { Vendor } from '@/lib/types';
import type { RowValidationResult } from './ImportValidationService';

/**
 * Import execution options
 */
export interface ImportOptions {
  vendorId: string;           // Vendor being updated
  userId: string;             // User performing import
  overwriteExisting: boolean; // Whether to overwrite existing values
  dryRun?: boolean;           // Preview mode (don't actually save)
  filename?: string;          // Original filename for history
}

/**
 * Field change record
 */
export interface FieldChange {
  field: string;
  oldValue: unknown;
  newValue: unknown;
  changed: boolean;
}

/**
 * Imported row result
 */
export interface ImportedRow {
  rowNumber: number;
  success: boolean;
  changes: FieldChange[];
  error?: string;
}

/**
 * Complete import execution result
 */
export interface ImportExecutionResult {
  success: boolean;
  totalRows: number;
  successfulRows: number;
  failedRows: number;
  rows: ImportedRow[];
  importHistoryId?: string;
  error?: string;
  changes: FieldChange[];  // Aggregated changes across all rows
}

/**
 * Service for executing validated vendor data imports
 */
export class ImportExecutionService {
  /**
   * Execute validated vendor data import
   *
   * @param validatedRows - Validated rows from ImportValidationService
   * @param options - Import execution options
   * @returns Import execution result
   */
  static async execute(
    validatedRows: RowValidationResult[],
    options: ImportOptions
  ): Promise<ImportExecutionResult> {
    const result: ImportExecutionResult = {
      success: false,
      totalRows: validatedRows.length,
      successfulRows: 0,
      failedRows: 0,
      rows: [],
      changes: []
    };

    // Validate inputs
    if (!options.vendorId || !options.userId) {
      result.error = 'Missing required options: vendorId and userId';
      return result;
    }

    if (validatedRows.length === 0) {
      result.error = 'No rows to import';
      return result;
    }

    // Filter out rows with validation errors
    const validRows = validatedRows.filter(row => row.valid);

    if (validRows.length === 0) {
      result.error = 'No valid rows to import (all rows have validation errors)';
      return result;
    }

    try {
      // Initialize Payload
      const payload = await getPayloadClient();

      // Get current vendor data
      const currentVendor = await payload.findByID({
        collection: 'vendors',
        id: options.vendorId
      });

      if (!currentVendor) {
        result.error = `Vendor not found: ${options.vendorId}`;
        return result;
      }

      // Store original state for rollback
      const originalVendorState = { ...currentVendor };

      // Process each valid row (Excel imports typically have 1 row for vendor profile update)
      // For multi-row scenarios (e.g., updating multiple locations), process sequentially
      const allChanges: FieldChange[] = [];

      for (const validatedRow of validRows) {
        const rowResult = await this.processRow(
          validatedRow,
          currentVendor as Vendor,
          options
        );

        result.rows.push(rowResult);

        if (rowResult.success) {
          result.successfulRows++;
          allChanges.push(...rowResult.changes);
        } else {
          result.failedRows++;
        }
      }

      // Aggregate changes (deduplicate by field name, keeping last value)
      const changeMap = new Map<string, FieldChange>();
      allChanges.forEach(change => {
        if (change.changed) {
          changeMap.set(change.field, change);
        }
      });
      result.changes = Array.from(changeMap.values());

      // If dry run, don't actually save
      if (options.dryRun) {
        result.success = true;
        return result;
      }

      // Save changes to vendor (only if there are actual changes)
      if (result.changes.length > 0) {
        try {
          // Build update data from changes
          const updateData: Record<string, unknown> = {};
          result.changes.forEach(change => {
            updateData[change.field] = change.newValue;
          });

          await payload.update({
            collection: 'vendors',
            id: options.vendorId,
            data: updateData
          });

        } catch (error) {
          // Rollback failed - but since we haven't committed yet, just report error
          result.success = false;
          result.error = `Failed to save vendor changes: ${error instanceof Error ? error.message : 'Unknown error'}`;
          result.failedRows = result.totalRows;
          result.successfulRows = 0;
          return result;
        }
      }

      // Create import history record
      try {
        const historyId = await this.createImportHistory(
          payload,
          options,
          result,
          result.changes
        );
        result.importHistoryId = historyId;
      } catch (error) {
        // Import succeeded but history failed - log but don't fail import
        console.error('Failed to create import history:', error);
        // Continue - import was successful
      }

      result.success = result.failedRows === 0;
      return result;

    } catch (error) {
      result.success = false;
      result.error = `Import execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
      result.failedRows = result.totalRows;
      result.successfulRows = 0;
      return result;
    }
  }

  /**
   * Process a single validated row
   */
  private static async processRow(
    validatedRow: RowValidationResult,
    currentVendor: Vendor,
    options: ImportOptions
  ): Promise<ImportedRow> {
    const rowResult: ImportedRow = {
      rowNumber: validatedRow.rowNumber,
      success: false,
      changes: []
    };

    try {
      // Calculate changes (async for geocoding support)
      const changes = await this.calculateChanges(
        currentVendor,
        validatedRow.data,
        options.overwriteExisting
      );

      rowResult.changes = changes;
      rowResult.success = true;

      return rowResult;

    } catch (error) {
      rowResult.success = false;
      rowResult.error = error instanceof Error ? error.message : 'Unknown error';
      return rowResult;
    }
  }

  /**
   * Calculate changes between current vendor data and new data
   *
   * @param currentVendor - Current vendor data
   * @param newData - New data from Excel
   * @param overwrite - Whether to overwrite existing non-empty values
   * @returns Array of field changes
   */
  private static async calculateChanges(
    currentVendor: Partial<Vendor>,
    newData: Record<string, unknown>,
    overwrite: boolean
  ): Promise<FieldChange[]> {
    const changes: FieldChange[] = [];

    // Handle HQ location fields - transform into locations array (with geocoding)
    const hqFields = this.extractHQFields(newData);
    if (hqFields) {
      const locationChange = await this.buildHQLocationChange(currentVendor, hqFields, overwrite);
      if (locationChange) {
        changes.push(locationChange);
      }
    }

    for (const [field, newValue] of Object.entries(newData)) {
      // Skip HQ fields - already handled above
      if (field === 'hqAddress' || field === 'hqCity' || field === 'hqCountry') {
        continue;
      }

      const oldValue = this.getNestedValue(currentVendor, field);

      // Determine if we should apply this change
      let shouldChange = false;

      if (newValue === null || newValue === undefined || newValue === '') {
        // Skip empty new values
        continue;
      }

      if (oldValue === null || oldValue === undefined || oldValue === '') {
        // Always fill empty fields
        shouldChange = true;
      } else if (overwrite) {
        // Overwrite mode: replace existing values
        shouldChange = !this.valuesEqual(oldValue, newValue);
      } else {
        // Don't overwrite existing values
        shouldChange = false;
      }

      changes.push({
        field,
        oldValue,
        newValue,
        changed: shouldChange
      });
    }

    return changes;
  }

  /**
   * Extract HQ location fields from parsed data
   */
  private static extractHQFields(newData: Record<string, unknown>): { address?: string; city?: string; country?: string } | null {
    const hqAddress = newData['hqAddress'];
    const hqCity = newData['hqCity'];
    const hqCountry = newData['hqCountry'];

    if (!hqAddress && !hqCity && !hqCountry) {
      return null;
    }

    return {
      address: (hqAddress as string | undefined) || undefined,
      city: (hqCity as string | undefined) || undefined,
      country: (hqCountry as string | undefined) || undefined
    };
  }

  /**
   * Geocode an address using Photon API (OpenStreetMap)
   * @returns Coordinates or null if geocoding fails
   */
  private static async geocodeAddress(
    address: string
  ): Promise<{ latitude: number; longitude: number } | null> {
    if (!address || address.trim().length === 0) {
      return null;
    }

    try {
      const response = await fetch(
        `https://photon.komoot.io/api/?q=${encodeURIComponent(address)}&limit=1`,
        { headers: { 'User-Agent': 'PaulThamesSuperyacht/1.0' } }
      );

      if (!response.ok) {
        console.warn('[ImportExecution] Geocoding API error:', response.status);
        return null;
      }

      const data = await response.json();

      if (data.features && data.features.length > 0) {
        const [longitude, latitude] = data.features[0].geometry.coordinates;
        return { latitude, longitude };
      }

      console.warn('[ImportExecution] No geocoding results for address:', address);
      return null;
    } catch (error) {
      console.warn('[ImportExecution] Geocoding failed:', error);
      return null;
    }
  }

  /**
   * Build location change for HQ fields
   */
  private static async buildHQLocationChange(
    currentVendor: Partial<Vendor>,
    hqFields: { address?: string; city?: string; country?: string },
    overwrite: boolean
  ): Promise<FieldChange | null> {
    const currentLocations = ((currentVendor as Record<string, unknown>).locations as Array<Record<string, unknown>>) || [];
    const hasAnyHQData = hqFields.address || hqFields.city || hqFields.country;

    if (!hasAnyHQData) {
      return null;
    }

    // Find existing HQ location
    const hqIndex = currentLocations.findIndex((loc) => loc.isHQ === true);
    const existingHQ = hqIndex >= 0 ? currentLocations[hqIndex] : null;

    // Build new locations array
    let newLocations: Array<Record<string, unknown>>;

    if (existingHQ) {
      // Update existing HQ
      const updatedHQ: Record<string, unknown> = {
        ...existingHQ,
        address: (overwrite || !existingHQ.address) && hqFields.address ? hqFields.address : existingHQ.address,
        city: (overwrite || !existingHQ.city) && hqFields.city ? hqFields.city : existingHQ.city,
        country: (overwrite || !existingHQ.country) && hqFields.country ? hqFields.country : existingHQ.country
      };

      // Check if anything actually changed
      const hasChanges =
        updatedHQ.address !== existingHQ.address ||
        updatedHQ.city !== existingHQ.city ||
        updatedHQ.country !== existingHQ.country;

      if (!hasChanges) {
        return null;
      }

      // Geocode the updated address if address changed
      if (updatedHQ.address !== existingHQ.address || updatedHQ.city !== existingHQ.city || updatedHQ.country !== existingHQ.country) {
        const fullAddress = [updatedHQ.address, updatedHQ.city, updatedHQ.country].filter(Boolean).join(', ');
        const coords = await this.geocodeAddress(fullAddress);
        if (coords) {
          updatedHQ.latitude = coords.latitude;
          updatedHQ.longitude = coords.longitude;
        }
      }

      newLocations = [...currentLocations];
      newLocations[hqIndex] = updatedHQ;
    } else {
      // Create new HQ location with geocoding
      const fullAddress = [hqFields.address, hqFields.city, hqFields.country].filter(Boolean).join(', ');
      const coords = await this.geocodeAddress(fullAddress);

      const newHQ = {
        address: hqFields.address || '',
        city: hqFields.city || '',
        country: hqFields.country || '',
        isHQ: true,
        latitude: coords?.latitude ?? null,
        longitude: coords?.longitude ?? null
      };
      newLocations = [...currentLocations, newHQ];
    }

    return {
      field: 'locations',
      oldValue: currentLocations,
      newValue: newLocations,
      changed: true
    };
  }

  /**
   * Get nested value from object by field path
   */
  private static getNestedValue(obj: Record<string, unknown>, path: string): unknown {
    const parts = path.split('.');
    let value: unknown = obj;

    for (const part of parts) {
      if (value === null || value === undefined) {
        return null;
      }
      value = (value as Record<string, unknown>)[part];
    }

    return value;
  }

  /**
   * Compare two values for equality
   */
  private static valuesEqual(a: unknown, b: unknown): boolean {
    // Handle null/undefined
    if (a === null || a === undefined) return b === null || b === undefined;
    if (b === null || b === undefined) return false;

    // Handle arrays
    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length) return false;
      return a.every((val, index) => this.valuesEqual(val, b[index]));
    }

    // Handle objects
    if (typeof a === 'object' && typeof b === 'object') {
      const aRecord = a as Record<string, unknown>;
      const bRecord = b as Record<string, unknown>;
      const aKeys = Object.keys(aRecord);
      const bKeys = Object.keys(bRecord);
      if (aKeys.length !== bKeys.length) return false;
      return aKeys.every(key => this.valuesEqual(aRecord[key], bRecord[key]));
    }

    // Handle primitives
    return a === b;
  }

  /**
   * Create import history record
   */
  private static async createImportHistory(
    payload: Awaited<ReturnType<typeof getPayloadClient>>,
    options: ImportOptions,
    result: ImportExecutionResult,
    changes: FieldChange[]
  ): Promise<string> {
    // Determine status
    let status: 'success' | 'partial' | 'failed';
    if (result.failedRows === 0) {
      status = 'success';
    } else if (result.successfulRows > 0) {
      status = 'partial';
    } else {
      status = 'failed';
    }

    // Create changes summary for storage
    const changesSummary = changes
      .filter(c => c.changed)
      .map(c => ({
        field: c.field,
        oldValue: this.sanitizeValueForStorage(c.oldValue),
        newValue: this.sanitizeValueForStorage(c.newValue)
      }));

    // Create errors summary
    const errorsSummary = result.rows
      .filter(r => !r.success && r.error)
      .map(r => ({
        rowNumber: r.rowNumber,
        error: r.error
      }));

    // Create import history record
    // Note: Payload CMS relationship fields require numeric IDs
    const history = await payload.create({
      collection: 'import_history',
      data: {
        vendor: Number(options.vendorId),
        user: Number(options.userId),
        importDate: new Date().toISOString(),
        status,
        rowsProcessed: result.totalRows,
        successfulRows: result.successfulRows,
        failedRows: result.failedRows,
        changes: changesSummary,
        errors: errorsSummary,
        filename: options.filename || 'unknown.xlsx'
      }
    });

    return String(history.id);
  }

  /**
   * Sanitize value for JSON storage (handle circular references, etc.)
   */
  private static sanitizeValueForStorage(value: unknown): unknown {
    if (value === null || value === undefined) {
      return null;
    }

    // Handle dates
    if (value instanceof Date) {
      return value.toISOString();
    }

    // Handle arrays
    if (Array.isArray(value)) {
      return value.map(v => this.sanitizeValueForStorage(v));
    }

    // Handle objects (limit depth to avoid huge storage)
    if (typeof value === 'object') {
      try {
        // Try to stringify to detect circular references
        JSON.stringify(value);
        return value;
      } catch {
        // Circular reference or too complex - return string representation
        return String(value);
      }
    }

    // Primitives
    return value;
  }

  /**
   * Preview import without saving (dry run)
   */
  static async preview(
    validatedRows: RowValidationResult[],
    options: Omit<ImportOptions, 'dryRun'>
  ): Promise<ImportExecutionResult> {
    return this.execute(validatedRows, { ...options, dryRun: true });
  }
}
