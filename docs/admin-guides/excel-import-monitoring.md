# Admin Guide: Excel Import Monitoring and Support

This guide helps administrators monitor vendor Excel imports, troubleshoot issues, and provide support.

## Table of Contents

1. [Overview](#overview)
2. [Accessing Import History](#accessing-import-history)
3. [Understanding Import Records](#understanding-import-records)
4. [Monitoring Import Activity](#monitoring-import-activity)
5. [Troubleshooting Vendor Issues](#troubleshooting-vendor-issues)
6. [Common Support Scenarios](#common-support-scenarios)
7. [Database Queries](#database-queries)
8. [Security and Compliance](#security-and-compliance)
9. [Best Practices](#best-practices)

---

## Overview

As an administrator, you have full visibility into all vendor Excel import activity for:
- **Monitoring**: Track import success rates and patterns
- **Support**: Help vendors troubleshoot import issues
- **Audit**: Review data changes for compliance
- **Analysis**: Identify common problems and improve UX

### Admin Capabilities

- View all vendor import history (not just your own)
- Access detailed error logs and change records
- Query import history via API with admin privileges
- Review validation errors to help vendors fix data
- Monitor tier usage and upgrade opportunities

---

## Accessing Import History

### Via API (Recommended for Monitoring)

**Endpoint**: `GET /api/portal/vendors/[vendorId]/import-history`

**Admin Access**: Admins can access any vendor's history regardless of ownership.

```javascript
// Get import history for any vendor (admin only)
const response = await fetch(
  '/api/portal/vendors/vendor_123/import-history?page=1&limit=50',
  {
    headers: {
      'Authorization': `Bearer ${adminToken}`
    }
  }
);

const data = await response.json();
```

### Query Parameters for Filtering

```javascript
// Filter by status
'/api/portal/vendors/vendor_123/import-history?status=failed'

// Filter by date range
'/api/portal/vendors/vendor_123/import-history?startDate=2025-11-01&endDate=2025-11-07'

// Combine filters
'/api/portal/vendors/vendor_123/import-history?status=partial&startDate=2025-11-01&limit=100'
```

### Via Payload CMS Admin Panel

1. Log in to `/admin`
2. Navigate to **Collections → Import History**
3. Use filters to find specific records:
   - Filter by vendor
   - Filter by status (success/partial/failed)
   - Filter by date range
   - Sort by import date (newest first)

### Via Vendor Dashboard (Admin Impersonation)

1. Navigate to vendor's dashboard
2. Scroll to **Import History** card
3. View imports as the vendor sees them
4. Useful for understanding vendor's perspective

---

## Understanding Import Records

### Import History Record Structure

```typescript
interface ImportHistoryRecord {
  id: string;                    // Unique record ID
  vendor: string | Vendor;       // Vendor ID or populated vendor object
  user: string | User;           // User ID or populated user object
  importDate: string;            // ISO timestamp
  status: 'success' | 'partial' | 'failed';
  rowsProcessed: number;         // Total rows in file
  successfulRows: number;        // Rows imported successfully
  failedRows: number;            // Rows that failed
  filename: string;              // Original uploaded filename
  changes: FieldChange[];        // Array of field changes
  errors: ImportError[];         // Array of errors
  createdAt: string;             // Record creation timestamp
  updatedAt: string;             // Record update timestamp
}

interface FieldChange {
  field: string;                 // Field name (e.g., 'name', 'email')
  oldValue: any;                 // Value before import
  newValue: any;                 // Value after import
}

interface ImportError {
  rowNumber: number;             // Excel row number
  error: string;                 // Error message
}
```

### Import Status Meanings

| Status | Meaning | Action Required |
|--------|---------|-----------------|
| `success` | All rows imported successfully | None - routine success |
| `partial` | Some rows succeeded, some failed | Review to help vendor fix failures |
| `failed` | All rows failed or critical error | Investigate and assist vendor |

### Reading the Changes Array

Changes array shows field-by-field modifications:

```json
{
  "changes": [
    {
      "field": "name",
      "oldValue": "Old Company Name",
      "newValue": "New Company Name"
    },
    {
      "field": "email",
      "oldValue": "old@company.com",
      "newValue": "new@company.com"
    }
  ]
}
```

**Interpreting Changes:**
- Empty `oldValue` = field was previously empty
- Same old and new value = no actual change (shouldn't appear)
- Null values = field was cleared (rare in current implementation)

### Reading the Errors Array

Errors array lists import failures:

```json
{
  "errors": [
    {
      "rowNumber": 3,
      "error": "Invalid email format"
    },
    {
      "rowNumber": 5,
      "error": "Company Name is required"
    }
  ]
}
```

**Error Analysis:**
- `rowNumber`: Excel row (1-based, row 1 is header)
- `error`: Human-readable error message
- Look for patterns: same error multiple times = systematic issue

---

## Monitoring Import Activity

### Daily Monitoring Tasks

**Morning Review** (5 minutes):
1. Check failed imports from past 24 hours
2. Identify vendors needing support
3. Review error patterns

```javascript
// Get all failed imports from last 24 hours (across all vendors)
// Note: Requires custom endpoint or manual aggregation
const yesterday = new Date(Date.now() - 24*60*60*1000).toISOString();
// Query each vendor or use Payload admin panel filter
```

**Weekly Analysis** (15 minutes):
1. Calculate success rate metrics
2. Identify most common errors
3. Review tier-based import patterns
4. Note vendors importing frequently (possible issues or high engagement)

### Key Metrics to Track

**Success Rate**:
```
Success Rate = (successful imports / total imports) × 100%
```

**Average Import Size**:
```
Avg Size = total rows processed / total imports
```

**Error Rate by Field**:
- Track which fields cause most validation errors
- Indicates need for better documentation or UI improvements

**Import Frequency by Tier**:
- Tier 2: Expected usage
- Tier 3-4: Higher usage expected
- Free/Tier 1: Should be zero (not authorized)

### Red Flags to Watch For

1. **Multiple Failed Imports by Same Vendor**
   - Indicates user struggling with feature
   - Proactive outreach recommended

2. **Same Error Across Multiple Vendors**
   - May indicate documentation issue
   - Could be systemic problem (template outdated)

3. **Unusually Large Imports**
   - Files near 5MB limit
   - May hit performance issues

4. **Rapid Repeated Imports**
   - Same vendor importing every few minutes
   - Possible automation or confusion

5. **Partial Imports with High Failure Rate**
   - Example: 10 rows processed, 8 failed
   - Indicates data quality issue

---

## Troubleshooting Vendor Issues

### Vendor Reports: "My import failed"

**Step 1: Locate Import Record**
```javascript
// Get vendor's recent imports
GET /api/portal/vendors/{vendorId}/import-history?limit=10
```

**Step 2: Check Status**
- `failed`: Critical error, nothing imported
- `partial`: Some data imported, some failed
- `success`: Should not have failed (check if vendor confused)

**Step 3: Review Errors**
```json
{
  "errors": [
    {
      "rowNumber": 2,
      "error": "Invalid email format"
    }
  ]
}
```

**Step 4: Guide Vendor**
- Explain exact error and row number
- Provide correct format example
- Suggest re-downloading template if structure issues

### Vendor Reports: "Data didn't update"

**Common Causes:**

1. **Empty Cells in Excel**
   - Empty cells don't overwrite existing data
   - Solution: Tell vendor to enter data in all fields they want to change

2. **Import Status Was Partial/Failed**
   - Check import history status
   - Some rows may have failed

3. **Wrong Vendor Profile**
   - Vendor looking at different profile
   - Verify they're logged in as correct user

4. **Caching Issue**
   - Browser showing old data
   - Suggest hard refresh (Ctrl+F5)

5. **Tier Restrictions**
   - Field not available for their tier
   - Check if field access denied in errors

**Verification Steps:**
```javascript
// 1. Get import record
GET /api/portal/vendors/{vendorId}/import-history/{importId}

// 2. Check changes array - verify field was listed
// 3. Get current vendor data
GET /api/vendors/{vendorId} (Payload API)

// 4. Compare changes to current data
```

### Vendor Reports: "Can't download template"

**Troubleshooting:**

1. **Verify Tier Access**
   - Template download available to all tiers
   - Check user is logged in

2. **Check Vendor Status**
   - Must be approved vendor
   - Pending vendors may not have access

3. **Browser Issues**
   - Try different browser
   - Clear cache
   - Disable ad blockers

4. **Network Issues**
   - Check server logs for errors
   - Verify endpoint is responding

### Vendor Reports: "Template has wrong fields"

**Possible Causes:**

1. **Tier Changed**
   - Vendor upgraded/downgraded
   - Old template cached
   - Solution: Download fresh template

2. **Using Old Template**
   - Downloaded template months ago
   - Fields may have changed
   - Solution: Always use current template

3. **Tier Confusion**
   - Vendor thinks they have higher tier
   - Check actual tier in database
   - Explain tier-based field access

---

## Common Support Scenarios

### Scenario 1: Vendor Can't Import (Tier Restriction)

**Issue**: Vendor with Tier 1 trying to import

**Response**:
```
"Import functionality requires Tier 2 or higher subscription.
Your current tier is Tier 1.

To use import features:
1. Upgrade to Tier 2+ through your dashboard
2. OR continue using manual profile editing

Would you like help with the upgrade process?"
```

**Action**: Guide to tier upgrade request feature

### Scenario 2: Validation Errors on All Rows

**Issue**: Every row fails validation

**Common Causes**:
- Modified column headers
- Wrong file format
- Data in wrong columns
- Using template from different tier

**Response**:
```
"Your import shows validation errors on all rows, which typically means:

1. Column headers were modified
   → Download fresh template, don't change headers

2. File structure incorrect
   → Use our template, don't create from scratch

3. Data in wrong columns
   → Verify data matches column headers

Please download a new template and try again."
```

### Scenario 3: Email Format Errors

**Issue**: Multiple "Invalid email format" errors

**Example Error**: `Invalid email format` on row 3, 5, 7

**Common Causes**:
- Missing @ symbol
- Missing domain
- Spaces in email
- Using display name format

**Response**:
```
"Email validation failed on rows 3, 5, and 7.

Valid email format: name@domain.com

Common mistakes:
✗ name@domain (missing .com)
✗ name domain.com (missing @)
✗ Name <name@domain.com> (display name format)
✓ name@domain.com (correct)

Please fix these emails and re-import."
```

### Scenario 4: URL Format Errors

**Issue**: URL validation failures

**Common Causes**:
- Missing http:// or https://
- Spaces in URL
- Incomplete URL

**Response**:
```
"URL validation failed. URLs must include protocol.

Examples:
✗ www.example.com (missing protocol)
✗ example.com (missing protocol and www)
✓ https://www.example.com (correct)
✓ https://example.com (also correct)

Add https:// to all website URLs and try again."
```

### Scenario 5: String Too Long

**Issue**: Text exceeds maximum length

**Response**:
```
"Field 'description' exceeds maximum length on row 2.
Maximum: 1000 characters
Current: 1543 characters

Please shorten your description by ~550 characters.

Tips:
- Be concise
- Remove unnecessary details
- Save full version elsewhere
- Split into multiple fields if available"
```

### Scenario 6: Missing Required Fields

**Issue**: Required field left empty

**Response**:
```
"Required field 'Company Name' is empty on row 2.

Fields marked with * in the header are required.

For Tier 2:
- Company Name *
- Email Address *
- Website *

Please fill in all required fields."
```

---

## Database Queries

### Useful Payload CMS Queries

**Find Recent Failed Imports**:
```typescript
const failedImports = await payload.find({
  collection: 'import_history',
  where: {
    status: { equals: 'failed' },
    importDate: {
      greater_than_equal: new Date(Date.now() - 7*24*60*60*1000).toISOString()
    }
  },
  sort: '-importDate',
  limit: 50
});
```

**Find Imports by Vendor**:
```typescript
const vendorImports = await payload.find({
  collection: 'import_history',
  where: {
    vendor: { equals: vendorId }
  },
  sort: '-importDate',
  depth: 2  // Include vendor and user data
});
```

**Count Imports by Status**:
```typescript
const statusCounts = {
  success: await payload.count({
    collection: 'import_history',
    where: { status: { equals: 'success' } }
  }),
  partial: await payload.count({
    collection: 'import_history',
    where: { status: { equals: 'partial' } }
  }),
  failed: await payload.count({
    collection: 'import_history',
    where: { status: { equals: 'failed' } }
  })
};
```

**Find Large Imports**:
```typescript
const largeImports = await payload.find({
  collection: 'import_history',
  where: {
    rowsProcessed: { greater_than: 100 }
  },
  sort: '-rowsProcessed'
});
```

---

## Security and Compliance

### Audit Trail

Import history provides complete audit trail:
- **Who**: User ID linked to each import
- **When**: Timestamp of each import
- **What**: Field-by-field changes recorded
- **Result**: Success/failure status logged

**Compliance Uses**:
- Data change tracking
- User activity monitoring
- Security incident investigation
- Regulatory reporting

### Data Privacy

**PII in Import History**:
- Import history contains vendor data (names, emails, etc.)
- Treat as sensitive information
- Access restricted to admins only
- Not exposed in public APIs

**Data Retention**:
- Import history kept indefinitely
- Consider periodic archival for very old records
- Comply with data retention policies

### Security Monitoring

**Watch For**:
1. **Unauthorized access attempts**
   - Vendors trying to access other vendors' data
   - Should be blocked by authorization checks

2. **Suspicious import patterns**
   - Automated rapid imports
   - Unusually large files
   - Identical imports repeated

3. **Data exfiltration attempts**
   - Excessive exports
   - Bulk data access patterns

---

## Best Practices

### For Monitoring

1. **Daily quick checks**: 5 minutes reviewing failures
2. **Weekly analysis**: 15 minutes on patterns and metrics
3. **Monthly reports**: Success rates, common errors, tier usage
4. **Proactive outreach**: Contact vendors with repeated failures

### For Support

1. **Check history first**: Don't ask vendor for details you can see
2. **Be specific**: Reference exact row numbers and fields
3. **Provide examples**: Show correct format, not just error message
4. **Offer alternatives**: If import too complex, suggest manual entry
5. **Document patterns**: Create KB articles for common issues

### For Documentation

1. **Update user guide**: Add real-world examples from support cases
2. **Improve templates**: Add better examples based on common errors
3. **Enhance validation**: Add validation messages that help users
4. **Create tutorials**: Video walkthrough for complex scenarios

### For System Health

1. **Monitor performance**: Track import processing times
2. **Check error rates**: >10% failure rate indicates issues
3. **Review tier restrictions**: Ensure proper enforcement
4. **Test regularly**: Import test files periodically
5. **Update field mappings**: As vendor schema evolves

---

## Escalation Procedures

### When to Escalate to Development

1. **Systematic Failures**
   - Same error affecting multiple vendors
   - Failures that shouldn't be possible
   - Validation rules incorrect

2. **Performance Issues**
   - Imports taking >1 minute
   - Timeouts or server errors
   - File size limits being hit frequently

3. **Data Integrity Issues**
   - Import succeeded but data incorrect
   - Fields not updating despite success
   - Rollback not working properly

4. **Security Concerns**
   - Authorization bypass attempts
   - Suspicious data access patterns
   - Potential injection attacks

### Escalation Information to Provide

When escalating to development:
- Import History ID
- Vendor ID and tier
- Exact error messages
- Steps to reproduce
- Expected vs actual behavior
- Any patterns noticed
- Screenshots if relevant

---

## Reporting

### Weekly Report Template

```markdown
# Excel Import Weekly Report
**Week**: Nov 1-7, 2025

## Summary
- Total Imports: 47
- Success Rate: 85% (40/47)
- Partial Imports: 4
- Failed Imports: 3
- Unique Vendors: 23

## Top Errors
1. Invalid email format (12 occurrences)
2. String too long (8 occurrences)
3. Missing required field (5 occurrences)

## Notable Issues
- Vendor ABC123 had 3 failed imports (contacted for support)
- Large spike in imports on Nov 5 (product launch)

## Actions Taken
- Updated user guide with email format examples
- Reached out to 2 vendors with repeated failures
- Documented new error pattern in KB

## Recommendations
- Consider adding inline email validation in template
- Review maximum string lengths for description fields
```

---

## Resources

### Internal Documentation
- API Documentation: `/docs/api/excel-import-export.md`
- User Guide: `/docs/user-guides/vendor-excel-import-export.md`
- Architecture: `/docs/architecture/excel-import-export-architecture.md`

### Code References
- Import History Collection: `/payload/collections/ImportHistory.ts`
- Import History API: `/app/api/portal/vendors/[id]/import-history/route.ts`
- Services: `/lib/services/ImportExecutionService.ts`

### Support Resources
- Vendor Support Email: support@example.com
- Internal Slack: #vendor-support
- Ticket System: [URL]

---

**Last Updated**: 2025-11-07
**Document Version**: 1.0
**Maintainer**: Engineering Team
