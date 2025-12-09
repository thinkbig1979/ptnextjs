const fs = require('fs');
const path = require('path');

// Files to update
const files = [
  'tests/e2e/vendor-dashboard-flow.spec.ts',
  'tests/e2e/tier-restriction-flow.spec.ts',
  'tests/e2e/vendor-dashboard.spec.ts',
  'tests/e2e/vendor-onboarding/03-authentication.spec.ts',
  'tests/e2e/verify-single-form.spec.ts',
  'tests/e2e/verify-data-mapping.spec.ts',
  'tests/e2e/verify-form-save.spec.ts',
  'tests/e2e/vendor-dashboard-enhanced.spec.ts',
  'tests/e2e/team-members-manager.spec.ts',
  'tests/e2e/promotion-pack-form.spec.ts',
  'tests/e2e/excel-template-download.spec.ts',
  'tests/e2e/dashboard-integration.spec.ts',
  'tests/e2e/certifications-awards-manager.spec.ts',
  'tests/e2e/brand-story-tier-fix.spec.ts',
  'tests/e2e/admin-approval-flow.spec.ts',
  'tests/e2e/debug-vendor-update.spec.ts',
  'tests/e2e/simple-form-test.spec.ts',
  'tests/e2e/debug-vendor-data.spec.ts',
  'tests/e2e/debug-save-button.spec.ts',
  'tests/e2e/debug-form-submission.spec.ts',
  'tests/e2e/comprehensive-form-save-test.spec.ts',
];

const baseDir = '/home/edwin/development/ptnextjs';
let updatedCount = 0;
let skippedCount = 0;

files.forEach(file => {
  const filePath = path.join(baseDir, file);

  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');

      if (content.includes('@test.com')) {
        const newContent = content.replace(/@test\.com/g, '@example.com');
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`✓ Updated: ${file}`);
        updatedCount++;
      } else {
        skippedCount++;
      }
    } else {
      console.log(`✗ File not found: ${file}`);
    }
  } catch (error) {
    console.error(`✗ Error processing ${file}:`, error.message);
  }
});

console.log('\n' + '='.repeat(60));
console.log(`Summary:`);
console.log(`  Updated: ${updatedCount} files`);
console.log(`  Skipped: ${skippedCount} files (no @test.com found)`);
console.log(`  Total: ${files.length} files`);
console.log('='.repeat(60));
