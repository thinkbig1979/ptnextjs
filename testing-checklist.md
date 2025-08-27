# Testing Checklist - Phase 3.2

## Overview
Comprehensive testing checklist for validating Strapi CMS integration and ensuring all data types, relationships, and functionality work correctly.

**Generated**: 2025-08-25  
**Phase**: 3.2 - Migration Documentation  
**Purpose**: Validate complete integration before production deployment

---

## Pre-Testing Setup

### Environment Preparation
- [ ] Strapi CMS running on http://localhost:1337
- [ ] Next.js app running on http://localhost:3000  
- [ ] All schemas and components installed
- [ ] Sample data imported
- [ ] API tokens configured
- [ ] Environment variables set

### Test Data Requirements
- [ ] Minimum 5 partners with different categories
- [ ] Minimum 10 products from different partners
- [ ] Minimum 3 blog posts in different categories
- [ ] Minimum 2 team members
- [ ] All reference data (categories, tags)
- [ ] Company info populated
- [ ] Sample media files uploaded

---

## Phase 1: Schema & Structure Testing

### 1.1 Content Type Schema Validation
**Partners Collection**
- [ ] Partner creation with all required fields
- [ ] Unique name and slug constraints working
- [ ] Category relation connects properly
- [ ] Tags many-to-many relation works  
- [ ] Products one-to-many relation works
- [ ] SEO component attaches correctly
- [ ] Draft/publish workflow functions
- [ ] Field validation rules enforce correctly

**Products Collection**  
- [ ] Product creation with all required fields
- [ ] Partner relation (many-to-one) works
- [ ] Category relation (many-to-one) works
- [ ] Tags many-to-many relation works
- [ ] ProductImage component (repeatable) works
- [ ] Feature component (repeatable) works
- [ ] Main image selection logic works
- [ ] SEO component attaches correctly

**Blog Posts Collection**
- [ ] Blog post creation with all fields
- [ ] Blog category relation works
- [ ] Tags many-to-many relation works
- [ ] Rich text content saves properly
- [ ] Published date validation works
- [ ] Featured flag functions correctly
- [ ] SEO component attaches correctly

**Team Members Collection**
- [ ] Team member creation works
- [ ] Email validation functions
- [ ] LinkedIn URL validation works
- [ ] Order field affects display sequence
- [ ] No unwanted relations exist

**Reference Collections (Categories, Tags, Blog Categories)**
- [ ] Unique constraints prevent duplicates
- [ ] Color field validates hex format
- [ ] Relations back to main content work
- [ ] Usage counts update correctly (tags)

**Company Info Single Type**
- [ ] Only one instance can be created
- [ ] All required fields enforce validation
- [ ] Phone number validation works
- [ ] Email validation works
- [ ] Social media component works
- [ ] SEO component works

### 1.2 Component Validation

**ProductImage Component**
- [ ] Image upload and attachment works
- [ ] Alt text saves correctly
- [ ] Main image flag functions
- [ ] Caption field works
- [ ] Order field affects sequence
- [ ] Multiple images per product supported

**Feature Component**
- [ ] Title field required validation
- [ ] Description rich text works
- [ ] Icon field accepts values
- [ ] Order field affects sequence
- [ ] Multiple features per product supported

**SEO Component**
- [ ] Meta title length validation (60 chars)
- [ ] Meta description length validation (160 chars)
- [ ] Keywords field accepts comma-separated values
- [ ] OG image upload works
- [ ] Canonical URL validation works
- [ ] No-index flag functions

**Social Media Component**
- [ ] All URL fields validate format
- [ ] Platform-specific URL validation works
- [ ] Optional fields can be empty
- [ ] Links display correctly in frontend

---

## Phase 2: API Endpoint Testing

### 2.1 Basic CRUD Operations

**GET Endpoints**
```bash
# Test all collection endpoints
curl http://localhost:1337/api/partners
curl http://localhost:1337/api/products  
curl http://localhost:1337/api/blog-posts
curl http://localhost:1337/api/team-members
curl http://localhost:1337/api/categories
curl http://localhost:1337/api/blog-categories
curl http://localhost:1337/api/tags

# Test single type endpoint
curl http://localhost:1337/api/company-info

# Test individual item endpoints
curl http://localhost:1337/api/partners/1
curl http://localhost:1337/api/products/1
```

**Expected Results Checklist**:
- [ ] All endpoints return 200 status
- [ ] Response format matches Strapi structure
- [ ] All required fields present in response
- [ ] Timestamps (createdAt, updatedAt, publishedAt) included
- [ ] No sensitive data exposed in public endpoints

### 2.2 Relationship Population Testing

**Partner Relations**
```bash
curl "http://localhost:1337/api/partners?populate=*"
curl "http://localhost:1337/api/partners/1?populate[0]=category&populate[1]=tags&populate[2]=products"
```

**Validation Checklist**:
- [ ] Category data populated correctly
- [ ] Tags array populated with tag objects
- [ ] Products array shows related products
- [ ] SEO component data included
- [ ] No circular reference issues

**Product Relations**
```bash
curl "http://localhost:1337/api/products?populate=*"
curl "http://localhost:1337/api/products/1?populate[0]=partner&populate[1]=category&populate[2]=tags&populate[3]=product_images&populate[4]=features"
```

**Validation Checklist**:
- [ ] Partner object populated correctly
- [ ] Category object populated
- [ ] Tags array populated
- [ ] ProductImage components populated
- [ ] Feature components populated  
- [ ] Image URLs accessible
- [ ] Component order preserved

**Blog Post Relations**
```bash
curl "http://localhost:1337/api/blog-posts?populate[0]=blog_category&populate[1]=tags"
```

**Validation Checklist**:
- [ ] Blog category populated correctly
- [ ] Tags array populated
- [ ] Rich text content renders properly
- [ ] Published date in correct format

### 2.3 Filtering and Search Testing

**Category Filtering**
```bash
curl "http://localhost:1337/api/partners?filters[category][name][\$eq]=Navigation%20Systems"
curl "http://localhost:1337/api/products?filters[category][name][\$eq]=Navigation%20Systems"
```

**Tag Filtering**
```bash  
curl "http://localhost:1337/api/partners?filters[tags][name][\$in]=Marine,Navigation"
curl "http://localhost:1337/api/products?filters[tags][name][\$in]=Marine,Navigation"
```

**Featured Content**
```bash
curl "http://localhost:1337/api/partners?filters[featured][\$eq]=true"
curl "http://localhost:1337/api/blog-posts?filters[featured][\$eq]=true"
```

**Text Search**
```bash
curl "http://localhost:1337/api/partners?filters[\$or][0][name][\$containsi]=raymarine&filters[\$or][1][description][\$containsi]=radar"
curl "http://localhost:1337/api/products?filters[\$or][0][name][\$containsi]=axiom&filters[\$or][1][description][\$containsi]=gps"
```

**Validation Checklist**:
- [ ] Category filters return correct results
- [ ] Tag filters work with multiple values
- [ ] Featured flags filter correctly
- [ ] Text search finds relevant results
- [ ] Case-insensitive search works
- [ ] No results return empty array (not error)

### 2.4 Pagination Testing

```bash
curl "http://localhost:1337/api/partners?pagination[page]=1&pagination[pageSize]=5"
curl "http://localhost:1337/api/products?pagination[page]=2&pagination[pageSize]=3"
```

**Validation Checklist**:
- [ ] Page parameter works correctly
- [ ] PageSize parameter limits results
- [ ] Meta object includes pagination info
- [ ] Total count reflects filtered results
- [ ] Page count calculated correctly
- [ ] Out-of-range pages handled gracefully

### 2.5 Sorting Testing

```bash
curl "http://localhost:1337/api/partners?sort=name:asc"
curl "http://localhost:1337/api/products?sort=createdAt:desc"
curl "http://localhost:1337/api/blog-posts?sort=published_at:desc"
```

**Validation Checklist**:
- [ ] Ascending sort works correctly
- [ ] Descending sort works correctly
- [ ] Date sorting functions properly
- [ ] String sorting is case-insensitive
- [ ] Multiple sort criteria work
- [ ] Invalid sort fields handled gracefully

---

## Phase 3: Data Integrity Testing

### 3.1 Relationship Integrity

**Foreign Key Validation**
- [ ] Cannot create product without valid partner ID
- [ ] Cannot create partner without valid category ID
- [ ] Cannot delete partner that has products
- [ ] Cannot delete category that has partners/products
- [ ] Tag deletion removes from junction tables

**Many-to-Many Relationships**
- [ ] Adding tags to partners creates junction entries
- [ ] Removing tags from partners removes junction entries
- [ ] Same tag can be used by multiple entities
- [ ] Tag deletion removes all junction entries

**Component Relationships**
- [ ] Product images belong only to their product
- [ ] Features belong only to their product
- [ ] Component deletion doesn't affect other products
- [ ] Component ordering preserved

### 3.2 Data Validation Testing

**Required Field Validation**
- [ ] Cannot save partner without name
- [ ] Cannot save product without partner relation
- [ ] Cannot save blog post without category
- [ ] Required components cannot be empty

**Unique Constraint Validation**
- [ ] Duplicate partner names rejected
- [ ] Duplicate slugs rejected within entity type
- [ ] Duplicate category names rejected
- [ ] Unique constraints work across all entities

**Format Validation**
- [ ] Invalid email addresses rejected
- [ ] Invalid URLs rejected
- [ ] Invalid phone numbers rejected
- [ ] Invalid hex colors rejected
- [ ] Invalid date formats rejected

**Length Validation**
- [ ] Meta titles over 60 chars warned/rejected
- [ ] Meta descriptions over 160 chars warned/rejected
- [ ] Text fields respect max length limits
- [ ] Minimum length requirements enforced

### 3.3 Component Data Integrity

**ProductImage Components**
- [ ] Cannot have multiple main images per product
- [ ] Image order preserved correctly
- [ ] Alt text saves and displays correctly
- [ ] Captions save and display correctly

**Feature Components**
- [ ] Feature order preserved correctly
- [ ] Rich text descriptions save correctly
- [ ] Icons display properly
- [ ] Duplicate feature titles handled

**SEO Components**
- [ ] SEO data saves independently per content item
- [ ] OG images link correctly
- [ ] Canonical URLs validate properly
- [ ] No-index flags function correctly

---

## Phase 4: Frontend Integration Testing

### 4.1 Next.js Static Data Service Testing

**Service Layer Connection**
```bash
# Test static data service methods
node -e "
const { staticDataService } = require('./lib/static-data-service');
staticDataService.getAllPartners().then(console.log);
"
```

**Validation Checklist**:
- [ ] staticDataService connects to Strapi successfully
- [ ] All data fetching methods work correctly
- [ ] Caching layer functions properly
- [ ] Error handling works for failed requests
- [ ] Type transformations work correctly

### 4.2 Page Generation Testing

**Static Generation**
```bash
npm run build
```

**Validation Checklist**:
- [ ] All partner pages generate successfully
- [ ] All product pages generate successfully  
- [ ] All blog post pages generate successfully
- [ ] Homepage generates with featured content
- [ ] No build errors or warnings
- [ ] Generated pages load correctly

**Partner Pages**
- [ ] Partner detail pages display all information
- [ ] Related products show correctly
- [ ] Category and tags display properly
- [ ] Images load and display correctly
- [ ] SEO metadata renders in head

**Product Pages**
- [ ] Product detail pages display all information
- [ ] Partner information shows correctly
- [ ] Product images display properly
- [ ] Features list renders correctly
- [ ] Main image selection works
- [ ] SEO metadata renders in head

**Blog Pages**
- [ ] Blog listing shows all posts
- [ ] Category filtering works
- [ ] Featured posts display correctly
- [ ] Individual blog posts render properly
- [ ] Rich text content displays correctly

### 4.3 Search and Filter Integration

**Component Integration**
- [ ] Search components connect to API correctly
- [ ] Filter dropdowns populate from API data
- [ ] Search results update dynamically
- [ ] Filter combinations work correctly
- [ ] Pagination controls function properly

**Performance**
- [ ] Search response times acceptable (<500ms)
- [ ] Filter changes respond quickly
- [ ] Images load without blocking content
- [ ] No memory leaks in search components

### 4.4 SEO and Meta Tags Testing

**Meta Tags**
```bash
curl -s http://localhost:3000/partners/raymarine | grep "<meta"
curl -s http://localhost:3000/products/axiom-pro | grep "<meta"
```

**Validation Checklist**:
- [ ] Page titles use SEO meta_title when available
- [ ] Meta descriptions use SEO meta_description
- [ ] Open Graph images display correctly
- [ ] Canonical URLs set properly
- [ ] No-index directives respected
- [ ] Structured data markup included

---

## Phase 5: Performance Testing

### 5.1 API Performance

**Response Time Testing**
```bash
# Test response times for various endpoints
time curl http://localhost:1337/api/partners
time curl http://localhost:1337/api/products?populate=*
time curl http://localhost:1337/api/partners/1?populate=products
```

**Performance Benchmarks**:
- [ ] Basic list endpoints < 200ms
- [ ] Populated endpoints < 500ms
- [ ] Complex queries < 1000ms
- [ ] Search queries < 800ms
- [ ] Image serving < 300ms

### 5.2 Database Performance

**Query Optimization**
```sql
-- Check for missing indexes
SHOW INDEXES FROM partners;
SHOW INDEXES FROM products;
SHOW INDEXES FROM partners_tags_links;
```

**Validation Checklist**:
- [ ] Foreign key indexes exist
- [ ] Junction table indexes exist
- [ ] Slug fields indexed for lookups
- [ ] Featured flags indexed
- [ ] No full table scans in common queries

### 5.3 Memory and Resource Usage

**Memory Testing**
- [ ] Strapi memory usage stable under load
- [ ] No memory leaks in repeated requests
- [ ] Image processing doesn't consume excessive memory
- [ ] Database connections properly managed

**Resource Limits**
- [ ] File upload size limits appropriate
- [ ] API rate limiting configured
- [ ] Database connection pooling working
- [ ] Disk space monitoring in place

---

## Phase 6: Security Testing

### 6.1 API Security

**Authentication Testing**
```bash
# Test public endpoints (should work)
curl http://localhost:1337/api/partners

# Test protected endpoints (should fail without token)
curl -X POST http://localhost:1337/api/partners

# Test with valid token (should work)
curl -X POST http://localhost:1337/api/partners \
  -H "Authorization: Bearer VALID_TOKEN"
```

**Authorization Testing**
- [ ] Public read access works correctly
- [ ] Anonymous users cannot create/update/delete
- [ ] Admin users have full access
- [ ] Content managers have appropriate access
- [ ] API tokens work with correct permissions

### 6.2 Input Validation Security

**SQL Injection Prevention**
```bash
# Test malicious input handling
curl "http://localhost:1337/api/partners?filters[name][\$eq]='; DROP TABLE partners; --"
```

**XSS Prevention**
- [ ] Script tags in content properly escaped
- [ ] HTML in text fields sanitized
- [ ] Rich text content filtered appropriately
- [ ] User input validation prevents XSS

**Data Validation**
- [ ] Oversized payloads rejected
- [ ] Invalid JSON handled gracefully
- [ ] Required field validation enforced
- [ ] Type validation prevents injection

### 6.3 CORS and Headers

**CORS Configuration**
```bash
curl -H "Origin: http://malicious-site.com" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS http://localhost:1337/api/partners
```

**Security Headers**
- [ ] CORS headers properly configured
- [ ] Only allowed origins can access API
- [ ] Security headers present in responses
- [ ] Sensitive information not exposed in headers

---

## Phase 7: Error Handling Testing

### 7.1 API Error Responses

**Invalid Requests**
```bash
# Test invalid endpoints
curl http://localhost:1337/api/nonexistent

# Test invalid parameters
curl http://localhost:1337/api/partners/999999

# Test invalid population
curl "http://localhost:1337/api/partners?populate=nonexistent_field"
```

**Error Response Validation**:
- [ ] 404 for non-existent resources
- [ ] 400 for invalid parameters
- [ ] Proper error messages in responses
- [ ] No stack traces exposed in production
- [ ] Consistent error format across endpoints

### 7.2 Frontend Error Handling

**Service Layer Errors**
- [ ] Network errors handled gracefully
- [ ] Invalid API responses handled
- [ ] Timeout errors display user-friendly messages
- [ ] Fallback content shown when CMS unavailable

**Component Error Boundaries**
- [ ] Component errors don't crash entire page
- [ ] Error boundaries display fallback UI
- [ ] Error logging captures issues
- [ ] Recovery mechanisms work properly

### 7.3 Data Corruption Scenarios

**Missing Relations**
- [ ] Products with deleted partners handled
- [ ] Missing category references handled
- [ ] Broken image links handled gracefully
- [ ] Invalid component data handled

**Malformed Data**
- [ ] Invalid dates handled properly
- [ ] Missing required fields handled
- [ ] Corrupted rich text handled
- [ ] Invalid URLs don't break rendering

---

## Phase 8: User Acceptance Testing

### 8.1 Content Management Testing

**Admin User Experience**
- [ ] Content creation workflows intuitive
- [ ] Relationship selection works smoothly
- [ ] Component editing user-friendly
- [ ] Media upload and management easy
- [ ] Draft/publish workflow clear

**Content Editor Experience**  
- [ ] Rich text editor functions properly
- [ ] Image insertion and alignment works
- [ ] SEO fields easy to understand and fill
- [ ] Preview functionality works
- [ ] Bulk operations available where needed

### 8.2 End User Testing

**Website Performance**
- [ ] Pages load quickly (<3 seconds)
- [ ] Search functionality responsive
- [ ] Mobile experience optimized
- [ ] Images optimize for different devices
- [ ] Navigation intuitive and fast

**Content Quality**
- [ ] All content displays correctly
- [ ] Images have appropriate alt text
- [ ] Links work correctly
- [ ] Contact information accurate
- [ ] SEO metadata improves search visibility

---

## Testing Summary Report Template

### Test Execution Summary
- **Test Date**: [Date]
- **Environment**: [Development/Staging/Production]
- **Tester**: [Name]
- **Strapi Version**: [Version]
- **Next.js Version**: [Version]

### Results Overview
- **Total Tests**: [Number]
- **Passed**: [Number] ✅
- **Failed**: [Number] ❌
- **Skipped**: [Number] ⏭️

### Critical Issues Found
1. [Issue description and severity]
2. [Issue description and severity]

### Performance Metrics
- **Average API Response Time**: [X]ms
- **Page Load Time**: [X]s
- **Memory Usage**: [X]MB
- **Build Time**: [X]s

### Recommendations
- [ ] [Recommendation 1]
- [ ] [Recommendation 2]
- [ ] [Recommendation 3]

### Sign-off Criteria
- [ ] All critical tests passing
- [ ] Performance within acceptable limits
- [ ] Security requirements met
- [ ] User acceptance criteria satisfied
- [ ] Documentation complete

---

## Final Validation Checklist

Before production deployment:

### Technical Validation
- [ ] All automated tests passing
- [ ] Performance benchmarks met
- [ ] Security scan completed and passed
- [ ] Backup and recovery procedures tested
- [ ] Monitoring and alerting configured

### Content Validation
- [ ] All required content migrated
- [ ] Content quality review completed
- [ ] SEO optimization verified
- [ ] Image optimization completed
- [ ] Broken links check passed

### Process Validation
- [ ] Content management workflows documented
- [ ] User training completed
- [ ] Support procedures established
- [ ] Maintenance schedule defined
- [ ] Rollback procedures tested

**Final Approval**: [ ] System ready for production deployment

---

This comprehensive testing checklist ensures thorough validation of the complete Strapi CMS integration before production deployment.