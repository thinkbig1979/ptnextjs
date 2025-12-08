#!/usr/bin/env node
/**
 * Verification script for AuditLogs collection setup
 * Checks that all required components are in place
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying AuditLogs Collection Setup\n');

let allChecks = true;

// Check 1: AuditLogs.ts exists
const auditLogsPath = path.join(__dirname, '..', 'payload', 'collections', 'AuditLogs.ts');
if (fs.existsSync(auditLogsPath)) {
  console.log('✓ AuditLogs.ts exists');
  const content = fs.readFileSync(auditLogsPath, 'utf8');

  // Verify key components
  if (content.includes('slug: \'audit_logs\'')) {
    console.log('  ✓ Collection slug configured');
  } else {
    console.log('  ✗ Collection slug missing');
    allChecks = false;
  }

  if (content.includes('LOGIN_SUCCESS')) {
    console.log('  ✓ Event types defined');
  } else {
    console.log('  ✗ Event types missing');
    allChecks = false;
  }

  if (content.includes('isAdmin')) {
    console.log('  ✓ Access control configured');
  } else {
    console.log('  ✗ Access control missing');
    allChecks = false;
  }
} else {
  console.log('✗ AuditLogs.ts NOT FOUND');
  allChecks = false;
}

// Check 2: payload.config.ts import
console.log('');
const configPath = path.join(__dirname, '..', 'payload.config.ts');
const configContent = fs.readFileSync(configPath, 'utf8');

if (configContent.includes("import AuditLogs from './payload/collections/AuditLogs'")) {
  console.log('✓ AuditLogs import present in payload.config.ts');
} else {
  console.log('✗ AuditLogs import MISSING from payload.config.ts');
  console.log('  Run: node scripts/add-audit-logs.js');
  allChecks = false;
}

// Check 3: collections array
if (configContent.match(/collections:\s*\[[^\]]*AuditLogs[^\]]*\]/s)) {
  console.log('✓ AuditLogs registered in collections array');
} else {
  console.log('✗ AuditLogs NOT registered in collections array');
  console.log('  Run: node scripts/add-audit-logs.js');
  allChecks = false;
}

// Summary
console.log('\n' + '='.repeat(50));
if (allChecks) {
  console.log('✅ All checks passed! AuditLogs collection is ready.');
  console.log('\nNext steps:');
  console.log('1. Run: npm run type-check');
  console.log('2. Run: npm run dev');
  console.log('3. Visit: http://localhost:3000/admin');
  console.log('4. Look for "Audit Logs" under "System" group');
  process.exit(0);
} else {
  console.log('❌ Some checks failed. Please complete the setup.');
  console.log('\nTo fix:');
  console.log('  node scripts/add-audit-logs.js');
  process.exit(1);
}
