/**
 * Generate Excel test fixtures for E2E tests
 *
 * Run with: npx ts-node tests/test-fixtures/generate-excel-fixtures.ts
 */
import ExcelJS from 'exceljs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generateValidFixture() {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Vendor Data');

  // Headers matching tier 2 fields from excel-field-mappings.ts
  // IMPORTANT: Headers must exactly match excelColumn values (without asterisks)
  worksheet.columns = [
    { header: 'Company Name', key: 'companyName', width: 25 },
    { header: 'Short Description', key: 'description', width: 40 },
    { header: 'Contact Email', key: 'contactEmail', width: 30 },
    { header: 'Contact Phone', key: 'contactPhone', width: 20 },
    { header: 'Website URL', key: 'website', width: 30 },
    { header: 'Founded Year', key: 'foundedYear', width: 15 },
  ];

  // Add 3 valid rows
  worksheet.addRow({
    companyName: 'Test Vendor 1',
    description: 'A leading provider of marine navigation systems for superyachts',
    contactEmail: 'contact@testvendor1.com',
    contactPhone: '+1-555-111-1111',
    website: 'https://www.testvendor1.com',
    foundedYear: 2010,
  });

  worksheet.addRow({
    companyName: 'Test Vendor 2',
    description: 'Premium yacht interiors and luxury furnishings specialist',
    contactEmail: 'info@testvendor2.com',
    contactPhone: '+1-555-222-2222',
    website: 'https://www.testvendor2.com',
    foundedYear: 2015,
  });

  worksheet.addRow({
    companyName: 'Test Vendor 3',
    description: 'Expert marine engineering and propulsion systems',
    contactEmail: 'sales@testvendor3.com',
    contactPhone: '+1-555-333-3333',
    website: 'https://www.testvendor3.com',
    foundedYear: 2005,
  });

  // Style header row
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF4472C4' },
  };
  worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

  await workbook.xlsx.writeFile(path.join(__dirname, 'valid-vendor-data.xlsx'));
  console.log('✅ Generated valid-vendor-data.xlsx');
}

async function generateInvalidFixture() {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Vendor Data');

  // Same headers as valid fixture (without asterisks)
  worksheet.columns = [
    { header: 'Company Name', key: 'companyName', width: 25 },
    { header: 'Short Description', key: 'description', width: 40 },
    { header: 'Contact Email', key: 'contactEmail', width: 30 },
    { header: 'Contact Phone', key: 'contactPhone', width: 20 },
    { header: 'Website URL', key: 'website', width: 30 },
    { header: 'Founded Year', key: 'foundedYear', width: 15 },
  ];

  // Row 2: Empty company name (required field error)
  worksheet.addRow({
    companyName: '', // ERROR: Empty required field
    description: 'Valid description for test',
    contactEmail: 'valid@email.com',
    contactPhone: '+1-555-444-4444',
    website: 'https://www.validsite.com',
    foundedYear: 2020,
  });

  // Row 3: Invalid email format
  worksheet.addRow({
    companyName: 'Invalid Email Vendor',
    description: 'This vendor has an invalid email address',
    contactEmail: 'not-a-valid-email', // ERROR: Invalid email format
    contactPhone: '+1-555-555-5555',
    website: 'https://www.validsite2.com',
    foundedYear: 2018,
  });

  // Row 4: Invalid URL format
  worksheet.addRow({
    companyName: 'Invalid URL Vendor',
    description: 'This vendor has an invalid website URL',
    contactEmail: 'valid2@email.com',
    contactPhone: '+1-555-666-6666',
    website: 'not-a-valid-url', // ERROR: Invalid URL format
    foundedYear: 2019,
  });

  // Style header row
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF4472C4' },
  };
  worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

  await workbook.xlsx.writeFile(path.join(__dirname, 'invalid-vendor-data.xlsx'));
  console.log('✅ Generated invalid-vendor-data.xlsx');
}

async function main() {
  console.log('Generating Excel test fixtures...\n');
  await generateValidFixture();
  await generateInvalidFixture();
  console.log('\n✅ All fixtures generated successfully!');
}

main().catch(console.error);
