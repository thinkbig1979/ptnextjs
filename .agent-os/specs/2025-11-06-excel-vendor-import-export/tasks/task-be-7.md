# Task BE-7: Create ImportExecutionService

**Status:** 🔒 Blocked (waiting for BE-6)
**Agent:** backend-nodejs-specialist
**Estimated Time:** 6 hours
**Phase:** Backend Implementation
**Dependencies:** BE-6

## Objective

Create a service that executes validated vendor data imports with atomic transactions, rollback capability, and comprehensive audit logging.

## Context Requirements

- Review BE-6: ValidationResult structure
- Review Payload CMS transaction patterns
- Review vendor collection schema in payload.config.ts
- Review technical-spec.md section 2.5 on import execution

## Acceptance Criteria

- [ ] File created at `/home/edwin/development/ptnextjs/lib/services/ImportExecutionService.ts`
- [ ] Execute atomic imports with transaction support
- [ ] Update existing vendor data (not create new vendors)
- [ ] Rollback on any error during import
- [ ] Create import history records
- [ ] Track changes (before/after snapshots)
- [ ] Handle partial updates (only update provided fields)
- [ ] Return execution result with success/failure details
- [ ] Comprehensive error handling with specific error codes
- [ ] Performance optimized for batch operations
- [ ] TypeScript type safety
- [ ] JSDoc documentation

## Detailed Specifications

### Service Structure

```typescript
// /home/edwin/development/ptnextjs/lib/services/ImportExecutionService.ts

import payload from 'payload';
import { VendorTier, Vendor } from '@/lib/types';
import { RowValidationResult } from './ImportValidationService';

export interface ImportOptions {
  vendorId: string;
  userId: string;
  overwriteExisting: boolean;
  dryRun?: boolean;
}

export interface FieldChange {
  field: string;
  oldValue: any;
  newValue: any;
}

export interface ImportedRow {
  rowNumber: number;
  success: boolean;
  changes: FieldChange[];
  error?: string;
}

export interface ImportExecutionResult {
  success: boolean;
  totalRows: number;
  successfulRows: number;
  failedRows: number;
  rows: ImportedRow[];
  importHistoryId?: string;
  error?: string;
}

export class ImportExecutionService {
  static async execute(
    validatedRows: RowValidationResult[],
    options: ImportOptions
  ): Promise<ImportExecutionResult> {
    // Implementation: atomic transaction-based import
    // 1. Start transaction
    // 2. Get current vendor data
    // 3. Apply changes
    // 4. Create import history record
    // 5. Commit or rollback
    // Full implementation required (400+ lines)
  }

  private static async createImportHistory(
    options: ImportOptions,
    result: ImportExecutionResult
  ): Promise<string> {
    // Create import history record in Payload CMS
  }

  private static calculateChanges(
    oldData: Partial<Vendor>,
    newData: Record<string, any>
  ): FieldChange[] {
    // Calculate field-by-field changes
  }
}
```

## Testing Requirements

### Unit Tests

```typescript
// Test atomic transactions
// Test rollback on errors
// Test change tracking
// Test import history creation
// Test dry-run mode
```

## Evidence Requirements

- [ ] Service file created
- [ ] Unit tests passing
- [ ] Integration tests with Payload CMS
- [ ] Transaction rollback works correctly
- [ ] Import history records created

## Next Steps

Used by BE-11 (Excel import API route)
