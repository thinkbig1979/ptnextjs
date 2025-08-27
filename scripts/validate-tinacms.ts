#!/usr/bin/env tsx

/**
 * TinaCMS Content Validation Script
 * Validates that all TinaCMS content files are properly formatted and accessible
 * This replaces the Strapi validation for the TinaCMS migration
 */

import { tinaCMSDataService } from '../lib/tinacms-data-service';

const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message: string, color?: keyof typeof COLORS) {
  const colorCode = color ? COLORS[color] : '';
  console.log(`${colorCode}${message}${COLORS.reset}`);
}

async function main() {
  try {
    log('\n🔍 TinaCMS Content Validation Starting...', 'cyan');
    log('=' .repeat(60), 'blue');

    const startTime = Date.now();

    // Run comprehensive validation
    const validation = await tinaCMSDataService.validateCMSContent();

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    log('\n' + '='.repeat(60), 'blue');
    
    if (validation.isValid) {
      log('✅ TinaCMS Content Validation PASSED', 'green');
      log(`⏱️  Validation completed in ${duration}s`, 'cyan');
      log('\n🚀 Ready for build!', 'bright');
    } else {
      log('❌ TinaCMS Content Validation FAILED', 'red');
      log(`⏱️  Validation completed in ${duration}s`, 'cyan');
      
      log('\n💥 Validation Errors:', 'red');
      validation.errors.forEach((error, index) => {
        log(`   ${index + 1}. ${error}`, 'yellow');
      });
      
      log('\n🔧 Please fix the above errors and try again.', 'yellow');
      process.exit(1);
    }

  } catch (error) {
    log('\n💥 TinaCMS validation failed with error:', 'red');
    console.error(error);
    log('\n🔧 Please check your TinaCMS content files and try again.', 'yellow');
    process.exit(1);
  }
}

// Run the validation
if (require.main === module) {
  main().catch((error) => {
    log('\n💥 Unexpected error during TinaCMS validation:', 'red');
    console.error(error);
    process.exit(1);
  });
}

export { main as validateTinaCMSContent };