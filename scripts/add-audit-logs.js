#!/usr/bin/env node
/**
 * Script to add AuditLogs import and registration to payload.config.ts
 * This is a one-time migration script
 */

const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '..', 'payload.config.ts');

// Read the file
let content = fs.readFileSync(configPath, 'utf8');

// Add the import after ImportHistory
const importToAdd = "import AuditLogs from './payload/collections/AuditLogs';";
const importHistoryLine = "import ImportHistory from './payload/collections/ImportHistory';";

if (!content.includes(importToAdd)) {
  content = content.replace(
    importHistoryLine,
    `${importHistoryLine}\n${importToAdd}`
  );
  console.log('✓ Added AuditLogs import');
} else {
  console.log('✓ AuditLogs import already exists');
}

// Add to collections array
const collectionsToAdd = '    AuditLogs,';
const importHistoryCollection = '    ImportHistory,';

if (!content.includes(collectionsToAdd)) {
  content = content.replace(
    importHistoryCollection,
    `${importHistoryCollection}\n${collectionsToAdd}`
  );
  console.log('✓ Added AuditLogs to collections array');
} else {
  console.log('✓ AuditLogs already in collections array');
}

// Write the file back
fs.writeFileSync(configPath, content, 'utf8');
console.log('\n✓ Successfully updated payload.config.ts');
