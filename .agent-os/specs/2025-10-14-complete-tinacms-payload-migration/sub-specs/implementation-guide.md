# Implementation Guide

This is the implementation guide for the spec detailed in @.agent-os/specs/2025-10-14-complete-tinacms-payload-migration/spec.md

## Development Approach

**Methodology**: Phased incremental approach with continuous testing
**Development Workflow**: Feature branch → Testing → Code review → Merge to main
**Team Coordination**: Single developer initially, clear documentation for future collaboration

## Phase-by-Phase Implementation

### Phase 1: Backend Schema Migration (Days 1-2)

**Goal**: Create all Payload collections with complete TinaCMS field parity

**Steps**:

1. **Update Existing Collections** (Day 1 Morning)
   ```bash
   # Edit payload/collections/Vendors.ts
   # Add all missing fields from technical-spec.md
   - image, founded, location, partner
   - services, statistics, achievements arrays
   - Enhanced certifications, awards arrays
   - socialProof, videoIntroduction, caseStudies, innovationHighlights
   - teamMembers, yachtProjects arrays
   - seo group, category/tags relationships
   ```

   **Validation**:
   - Run `npm run dev:tinacms` to start dev server
   - Navigate to `/admin` (Payload admin)
   - Create test vendor with all new fields
   - Verify all fields save correctly

2. **Update Products Collection** (Day 1 Afternoon)
   ```bash
   # Edit payload/collections/Products.ts
   # Add all missing fields
   - price, tags relationship
   - features, benefits, services arrays
   - pricing group, actionButtons, badges arrays
   - comparisonMetrics, integrationCompatibility
   - ownerReviews, visualDemo
   - seo group
   ```

   **Validation**:
   - Create test product with all new fields
   - Verify array fields work correctly
   - Test complex nested structures (comparison metrics, visual demo)

3. **Create New Collections** (Day 2)
   ```bash
   # Create new collection files
   touch payload/collections/Yachts.ts
   touch payload/collections/BlogPosts.ts
   touch payload/collections/TeamMembers.ts
   touch payload/collections/CompanyInfo.ts
   touch payload/collections/Tags.ts

   # Enhance existing Categories.ts with all TinaCMS fields

   # Update payload.config.ts to register new collections
   ```

   **Implementation order**:
   a. Categories (enhance existing)
   b. Tags (new, simple)
   c. TeamMembers (new, simple)
   d. CompanyInfo (new, singleton)
   e. BlogPosts (new, medium complexity)
   f. Yachts (new, high complexity)

   **Validation per collection**:
   - Run Payload migrations: The migrations run automatically when schema changes
   - Test in Payload admin interface
   - Create sample records with all fields
   - Verify relationships work correctly

### Phase 2: Data Migration Scripts (Days 3-4)

**Goal**: Migrate all TinaCMS markdown content to Payload database

**Day 3: Migration Script Foundation**

1. **Set up migration project structure**
   ```bash
   mkdir -p scripts/migrate-tinacms-to-payload
   cd scripts/migrate-tinacms-to-payload

   # Create script files
   touch index.ts
   touch migrate-categories.ts
   touch migrate-tags.ts
   touch migrate-vendors.ts
   touch migrate-products.ts
   touch migrate-yachts.ts
   touch migrate-blog-posts.ts
   touch migrate-team-members.ts
   touch migrate-company-info.ts

   mkdir utils
   touch utils/parse-markdown.ts
   touch utils/transform-media-paths.ts
   touch utils/validate-data.ts
   touch utils/resolve-relationships.ts
   ```

2. **Implement core utilities**
   ```typescript
   // utils/parse-markdown.ts
   import matter from 'gray-matter';
   import fs from 'fs';

   export function parseMarkdownFile(filePath: string) {
     const content = fs.readFileSync(filePath, 'utf-8');
     const { data, content: body } = matter(content);
     return { frontmatter: data, body };
   }

   // utils/transform-media-paths.ts
   export function transformMediaPath(path: string): string {
     if (!path) return '';
     if (path.startsWith('http')) return path;
     if (path.startsWith('/media/')) return path;
     return `/media/${path.replace(/^\/+/, '')}`;
   }

   // utils/validate-data.ts
   export function validateVendorData(data: any): { isValid: boolean; errors: string[] } {
     const errors: string[] = [];
     if (!data.companyName) errors.push('Missing company name');
     if (!data.slug) errors.push('Missing slug');
     return { isValid: errors.length === 0, errors };
   }
   ```

3. **Implement simple migrations first** (Categories, Tags)
   ```typescript
   // migrate-categories.ts
   import { getPayload } from 'payload';
   import config from '@/payload.config';
   import fs from 'fs';
   import path from 'path';
   import { parseMarkdownFile } from './utils/parse-markdown';

   export async function migrateCategories(payload: any) {
     const categoriesDir = path.join(process.cwd(), 'content/categories');
     const files = fs.readdirSync(categoriesDir).filter(f => f.endsWith('.md'));

     for (const file of files) {
       const { frontmatter } = parseMarkdownFile(path.join(categoriesDir, file));

       const categoryData = {
         name: frontmatter.name,
         slug: frontmatter.slug,
         description: frontmatter.description || '',
         icon: frontmatter.icon || '',
         color: frontmatter.color || '#0066cc',
         order: frontmatter.order || 999,
       };

       await payload.create({
         collection: 'categories',
         data: categoryData,
       });

       console.log(`✅ Migrated category: ${categoryData.name}`);
     }
   }
   ```

**Day 4: Complex Migrations**

1. **Implement vendor migration** (most complex)
   ```typescript
   // migrate-vendors.ts
   export async function migrateVendors(payload: any) {
     // Read all vendor markdown files
     // Transform all TinaCMS fields to Payload format
     // Resolve category/tag relationships
     // Handle all nested arrays (certifications, awards, case studies, etc.)
     // Insert into Payload database
     // Validate and log results
   }
   ```

2. **Implement product migration**
   ```typescript
   // migrate-products.ts
   export async function migrateProducts(payload: any) {
     // Read all product markdown files
     // Transform to Payload format
     // Resolve vendor, category, tag relationships
     // Handle complex structures (comparison metrics, visual demo, reviews)
     // Insert into database
   }
   ```

3. **Implement yacht, blog, team, company migrations**

4. **Create main orchestrator**
   ```typescript
   // index.ts
   import { getPayload } from 'payload';
   import config from '@/payload.config';

   async function migrateAll() {
     const payload = await getPayload({ config });

     console.log('🚀 Starting TinaCMS → Payload CMS migration...\n');

     // Migrate in dependency order
     await migrateCategories(payload);
     await migrateTags(payload);
     await migrateCompanyInfo(payload);
     await migrateTeamMembers(payload);
     await migrateVendors(payload);
     await migrateProducts(payload);
     await migrateYachts(payload);
     await migrateBlogPosts(payload);

     console.log('\n✅ Migration complete!');

     // Validation
     await validateMigration(payload);
   }

   migrateAll().catch(console.error);
   ```

5. **Testing**
   - Run migration in development environment
   - Validate all records created
   - Check relationships
   - Verify data integrity

### Phase 3: Frontend Data Service Enhancement (Day 5)

**Goal**: Enhance PayloadCMSDataService with complete feature parity

**Steps**:

1. **Add Missing Methods** (Morning)
   ```typescript
   // lib/payload-cms-data-service.ts

   // Add yacht methods
   async getAllYachts(): Promise<Yacht[]> { /* implementation */ }
   async getYachtBySlug(slug: string): Promise<Yacht | null> { /* implementation */ }
   async getFeaturedYachts(): Promise<Yacht[]> { /* implementation */ }

   // Add category methods (enhance existing)
   async getCategories(): Promise<Category[]> { /* implementation */ }

   // Add tag methods
   async getAllTags(): Promise<Tag[]> { /* implementation */ }
   async getTagBySlug(slug: string): Promise<Tag | null> { /* implementation */ }

   // Add company info method
   async getCompanyInfo(): Promise<CompanyInfo> { /* implementation */ }
   ```

2. **Enhance Transform Methods** (Afternoon)
   ```typescript
   // Update transformPayloadVendor to include all new fields
   private transformPayloadVendor(doc: any): Vendor {
     return {
       // ... existing fields ...

       // New fields
       services: doc.services || [],
       statistics: doc.statistics || [],
       achievements: doc.achievements || [],
       certifications: doc.certifications || [],
       awards: doc.awards || [],
       socialProof: doc.socialProof || {},
       videoIntroduction: doc.videoIntroduction || {},
       caseStudies: doc.caseStudies || [],
       innovationHighlights: doc.innovationHighlights || [],
       teamMembers: doc.teamMembers || [],
       yachtProjects: doc.yachtProjects || [],
       seo: doc.seo || {},
     };
   }

   // Similar updates for transformPayloadProduct
   ```

3. **Testing**
   - Unit tests for all new methods
   - Integration tests with Payload API
   - Verify data transformations correct

### Phase 4: Frontend Page Migration (Days 6-7)

**Goal**: Update all pages to use PayloadCMSDataService

**Day 6: Vendor/Product Pages**

1. **Update vendor pages**
   ```typescript
   // app/vendors/page.tsx
   // OLD: import tinaCMSDataService from '@/lib/tinacms-data-service';
   // NEW:
   import payloadCMSDataService from '@/lib/payload-cms-data-service';

   export default async function VendorsPage() {
     const vendors = await payloadCMSDataService.getAllVendors();
     const categories = await payloadCMSDataService.getCategories();
     // ... rest of implementation
   }

   // app/vendors/[slug]/page.tsx
   export async function generateStaticParams() {
     const slugs = await payloadCMSDataService.getVendorSlugs();
     return slugs.map(slug => ({ slug }));
   }

   export default async function VendorDetailPage({ params }: { params: { slug: string } }) {
     const vendor = await payloadCMSDataService.getVendorBySlug(params.slug);
     // ... render with all enhanced fields
   }
   ```

2. **Update product pages**
   ```typescript
   // app/products/page.tsx
   // app/products/[slug]/page.tsx
   // Same pattern as vendors
   ```

3. **Test builds**
   ```bash
   npm run build
   # Verify all vendor and product pages build successfully
   ```

**Day 7: Yacht/Blog/Team/Company Pages**

1. **Create yacht pages** (currently don't exist in app)
   ```bash
   mkdir -p app/yachts
   touch app/yachts/page.tsx
   touch app/yachts/[slug]/page.tsx
   ```

2. **Update blog pages**
   ```typescript
   // app/blog/page.tsx
   // app/blog/[slug]/page.tsx
   ```

3. **Update team page**
   ```typescript
   // app/team/page.tsx
   ```

4. **Update company/about pages**
   ```typescript
   // app/about/page.tsx
   ```

5. **Update homepage**
   ```typescript
   // app/page.tsx
   // Update to fetch featured content from Payload
   ```

6. **Full build test**
   ```bash
   npm run build
   # Should build all pages successfully from Payload data
   ```

### Phase 5: Testing & Validation (Days 8-9)

**Goal**: Comprehensive testing and issue resolution

**Day 8: Automated Testing**

1. **Unit tests**
   ```bash
   npm run test
   # Run all PayloadCMSDataService tests
   # Run all transform method tests
   ```

2. **Integration tests**
   ```bash
   # Test Payload API endpoints
   # Test data fetching in pages
   ```

3. **Build validation**
   ```bash
   npm run build
   # Verify build completes successfully
   # Check build time (should be < 5 minutes)
   # Verify all pages generated
   ```

**Day 9: Manual QA & Performance**

1. **Manual testing checklist**:
   - [ ] Browse all vendor profiles
   - [ ] Verify all enhanced fields display (certifications, awards, case studies, etc.)
   - [ ] Browse all product pages
   - [ ] Test comparison metrics, reviews, visual demos
   - [ ] Browse yacht profiles
   - [ ] Test timeline, supplier map, maintenance history
   - [ ] Browse blog posts
   - [ ] Check team page
   - [ ] Check about/company page
   - [ ] Test search and filtering
   - [ ] Test category/tag navigation

2. **Performance testing**:
   - Measure page load times
   - Verify caching working (5-minute TTL)
   - Check API response times
   - Monitor database query performance

3. **Issue resolution**:
   - Document any issues found
   - Fix high-priority issues
   - Create tickets for low-priority items

### Phase 6: Production Migration (Day 10)

**Goal**: Deploy to production with data migration

**Pre-Production Checklist**:
- [ ] All tests passing
- [ ] Manual QA complete
- [ ] Build successful
- [ ] Database backup created
- [ ] Migration scripts tested in staging
- [ ] Rollback plan documented
- [ ] Monitoring in place

**Production Deployment Steps**:

1. **Backup production data**
   ```bash
   # Backup TinaCMS markdown files
   tar -czf tinacms-backup-$(date +%Y%m%d).tar.gz content/

   # Backup Payload database (if existing)
   pg_dump -U postgres database_name > payload-backup-$(date +%Y%m%d).sql
   ```

2. **Run migration**
   ```bash
   # Set production environment
   export NODE_ENV=production
   export DATABASE_URL=<production_postgres_url>

   # Run migration scripts
   npm run migrate:tinacms-to-payload
   ```

3. **Validate migration**
   ```bash
   # Check record counts
   # Verify relationships
   # Spot-check key content
   ```

4. **Deploy frontend**
   ```bash
   # Build with production data
   npm run build

   # Deploy to hosting (Vercel/Netlify)
   npm run deploy
   ```

5. **Post-deployment verification**
   - Smoke test critical pages
   - Monitor error logs
   - Check performance metrics
   - Verify all functionality works

## Development Best Practices

**Code Quality**:
- Run ESLint before commits: `npm run lint`
- Run type checking: `npm run type-check`
- Write tests for new code
- Document complex logic

**Git Workflow**:
```bash
# Create feature branch for each phase
git checkout -b feat/payload-schema-migration
git checkout -b feat/data-migration
git checkout -b feat/frontend-payload-integration

# Commit frequently with clear messages
git commit -m "feat(payload): add enhanced vendor fields"
git commit -m "feat(migration): implement vendor migration script"
git commit -m "feat(frontend): update vendor pages to use Payload"
```

**Testing Strategy**:
- Test each phase before moving to next
- Run full build after each major change
- Manual QA of affected features
- Automated tests for data service methods

## Troubleshooting Common Issues

**Issue: Payload migration fails**
- Check DATABASE_URL is correct
- Verify Payload config syntax
- Check for field type mismatches

**Issue: Data migration script errors**
- Validate markdown files parse correctly
- Check for missing required fields
- Verify relationship IDs exist

**Issue: Build fails after frontend migration**
- Check all imports updated correctly
- Verify data service methods exist
- Check for null/undefined data handling

**Issue: Missing data in production**
- Verify migration completed successfully
- Check database record counts
- Review migration logs for errors

## Success Metrics

- [ ] All 8 Payload collections created
- [ ] 100% TinaCMS field parity achieved
- [ ] All markdown content migrated (0% data loss)
- [ ] All relationships intact
- [ ] All pages using Payload data exclusively
- [ ] Build time < 5 minutes
- [ ] Zero critical bugs in production
- [ ] Performance metrics maintained or improved
