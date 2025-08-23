# Content Fallback Control System

## Overview

The Content Fallback Control System provides comprehensive control over content availability behavior in the Next.js application with Strapi CMS integration. This system allows developers to control whether static fallback content is used when the CMS is unavailable.

## Environment Variables

### Core CMS Variables (Existing)
- `USE_STRAPI_CMS`: Enable/disable Strapi CMS usage
- `NEXT_PUBLIC_USE_STRAPI_CMS`: Client-side CMS flag
- `STRAPI_API_URL`: Strapi API endpoint
- `NEXT_PUBLIC_STRAPI_API_URL`: Client-side API endpoint

### New Fallback Control Variable
- `DISABLE_CONTENT_FALLBACK`: Controls static content fallback behavior
  - **Default**: `false` (fallback enabled for backward compatibility)
  - **When `true`**: Disables static content fallback, returns empty/null data when CMS unavailable
  - **When `false`**: Uses static fallback data when CMS unavailable (existing behavior)

## Behavior Matrix

| Strapi Available | Fallback Setting | Result |
|-----------------|------------------|--------|
| ✅ Available | Enabled | Uses Strapi CMS data |
| ✅ Available | Disabled | Uses Strapi CMS data |
| ❌ Unavailable | Enabled | Uses static fallback data |
| ❌ Unavailable | Disabled | Returns empty/null data |

## Implementation Details

### DataService Class Updates

The `DataService` class in `/lib/data-service.ts` has been enhanced with:

1. **Environment Variable Parsing**:
   ```typescript
   const DISABLE_CONTENT_FALLBACK = process.env.DISABLE_CONTENT_FALLBACK === 'true';
   ```

2. **Fallback Control Method**:
   ```typescript
   private shouldUseFallback(): boolean {
     if (DISABLE_CONTENT_FALLBACK) {
       console.log('DataService: Content fallback disabled by DISABLE_CONTENT_FALLBACK');
       return false;
     }
     return true;
   }
   ```

3. **Enhanced Logging**:
   ```typescript
   private logContentSource(contentType: string, source: 'strapi' | 'fallback' | 'empty') {
     const messages = {
       strapi: `${contentType}: Using Strapi CMS data`,
       fallback: `${contentType}: Using static fallback data (CMS unavailable)`,
       empty: `${contentType}: Returning empty data (CMS unavailable, fallback disabled)`
     };
     console.log(`DataService: ${messages[source]}`);
   }
   ```

### Updated Content Methods

All content methods have been updated to respect the fallback control:

- `getCategories()` - Returns `[]` when fallback disabled
- `getPartners()` - Returns `[]` when fallback disabled
- `getProducts()` - Returns `[]` when fallback disabled  
- `getBlogPosts()` - Returns `[]` when fallback disabled
- `getTeamMembers()` - Returns `[]` when fallback disabled
- `getCompanyInfo()` - Returns `null` when fallback disabled
- All search methods - Return `[]` when fallback disabled

### Component Safety Updates

Components have been updated to handle potential null/empty data:

1. **Footer Component** (`/components/footer.tsx`):
   ```typescript
   {companyInfo?.tagline || "Excellence in superyacht technology solutions"}
   {companyInfo?.email || "contact@paulthames.com"}
   {companyInfo?.phone || "+31 20 123 4567"}
   ```

2. **Hero Section** (`/components/hero-section.tsx`):
   ```typescript
   {companyInfo?.description || "Amsterdam's premier superyacht technology consultancy..."}
   ```

3. **CTA Section** (`/components/cta-section.tsx`):
   ```typescript
   {companyInfo?.phone || "+31 20 123 4567"}
   ```

4. **About Page** (`/app/about/page.tsx`):
   ```typescript
   {companyInfo?.tagline || "Excellence in superyacht technology solutions"}
   {companyInfo && (
     <div className="mb-20">
       {/* Company story content */}
     </div>
   )}
   ```

## Usage Examples

### Development Environment with Fallback Enabled (Default)
```bash
# .env
USE_STRAPI_CMS=true
DISABLE_CONTENT_FALLBACK=false  # or omit (default)
```
- Uses Strapi when available
- Falls back to static data when Strapi unavailable

### Production Environment with Fallback Disabled
```bash
# .env.production
USE_STRAPI_CMS=true
DISABLE_CONTENT_FALLBACK=true
```
- Uses Strapi when available
- Returns empty data when Strapi unavailable
- Prevents serving stale static content in production

### Testing Environment with Static Content Only
```bash
# .env.test
USE_STRAPI_CMS=false
DISABLE_CONTENT_FALLBACK=false
```
- Always uses static fallback data
- Useful for testing without CMS dependency

### Strict CMS-Only Environment
```bash
# .env
USE_STRAPI_CMS=true
DISABLE_CONTENT_FALLBACK=true
```
- Only returns data when CMS is available
- Useful for environments where content must be fresh

## Logging and Debugging

The system provides comprehensive logging for content source tracking:

```
DataService: Environment check
DataService: USE_STRAPI = true
DataService: DISABLE_CONTENT_FALLBACK = false
DataService: Partners: Using Strapi CMS data
DataService: Products: Using static fallback data (CMS unavailable)
DataService: Blog Posts: Returning empty data (CMS unavailable, fallback disabled)
```

## Build Process Compatibility

- ✅ Next.js build succeeds even when content is unavailable
- ✅ Static generation works with empty content
- ✅ TypeScript type safety maintained
- ✅ No build failures due to content unavailability

## Backward Compatibility

- ✅ Existing deployments continue working unchanged
- ✅ Default behavior remains the same (fallback enabled)
- ✅ All existing environment variables work as before
- ✅ No breaking changes to existing components

## Security Considerations

- Environment variables are validated during startup
- No sensitive data exposed in fallback content
- CMS availability checks use secure health checks
- Build process doesn't fail due to CMS unavailability

## Monitoring and Alerts

The system logs all content source decisions, enabling monitoring:

1. **Content Source Tracking**: Each content request logs its source
2. **Fallback Usage Monitoring**: Track when fallback is used
3. **CMS Health Monitoring**: 5-minute cached health checks
4. **Build Success Guarantee**: Builds never fail due to content issues

## Troubleshooting

### Issue: Components showing empty content
**Solution**: Check if `DISABLE_CONTENT_FALLBACK=true` and CMS is unavailable

### Issue: Build failures
**Solution**: Ensure components handle null/empty content gracefully

### Issue: Stale content in production
**Solution**: Set `DISABLE_CONTENT_FALLBACK=true` in production

### Issue: Development environment not using CMS
**Solution**: Verify `USE_STRAPI_CMS=true` and CMS is running

## Testing

The system can be tested using different environment configurations:

```bash
# Test fallback enabled
DISABLE_CONTENT_FALLBACK=false npm run build

# Test fallback disabled  
DISABLE_CONTENT_FALLBACK=true npm run build

# Test with CMS disabled
USE_STRAPI_CMS=false npm run build
```

## Migration Guide

For existing deployments:

1. **No immediate action required** - system defaults to current behavior
2. **Optional**: Add `DISABLE_CONTENT_FALLBACK=false` to make setting explicit
3. **Production optimization**: Consider setting `DISABLE_CONTENT_FALLBACK=true` in production
4. **Testing**: Verify application behavior with different environment configurations

## Files Modified

- `/lib/data-service.ts` - Core implementation
- `/.env` - Environment variable example
- `/components/footer.tsx` - Null-safe props handling
- `/components/hero-section.tsx` - Null-safe props handling  
- `/components/cta-section.tsx` - Null-safe props handling
- `/app/about/page.tsx` - Conditional rendering for null data
- `/test-fallback-behavior.js` - Testing utilities
- `/CONTENT_FALLBACK_SYSTEM.md` - This documentation