#!/usr/bin/env node
/**
 * Quick verification script for location fix
 */

console.log('Testing vendor seed API with locations...\n');

const testVendor = {
  companyName: 'Location Test Vendor',
  email: `test-${Date.now()}@example.com`,
  password: 'SecurePassword123!',
  tier: 'tier2',
  description: 'Test vendor with locations',
  locations: [
    {
      name: 'Monaco HQ',
      city: 'Monaco',
      country: 'Monaco',
      latitude: 43.7384,
      longitude: 7.4246,
      isHQ: true
    },
    {
      name: 'Cannes Office',
      city: 'Cannes',
      country: 'France',
      latitude: 43.5528,
      longitude: 7.0174,
      isHQ: false
    }
  ]
};

try {
  const response = await fetch('http://localhost:3000/api/test/vendors/seed', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify([testVendor]),
  });

  const data = await response.json();

  console.log('Response status:', response.status);
  console.log('Response data:', JSON.stringify(data, null, 2));

  if (data.success && data.vendorIds && data.vendorIds.length > 0) {
    console.log('\n✅ SUCCESS: Vendor created with locations!');
    console.log(`   Vendor ID: ${data.vendorIds[0]}`);

    // Verify the vendor has locations
    const vendorResponse = await fetch(`http://localhost:3000/api/portal/vendors/${data.vendorIds[0]}`);
    const vendorData = await vendorResponse.json();

    if (vendorData.locations && vendorData.locations.length > 0) {
      console.log(`\n✅ VERIFIED: Vendor has ${vendorData.locations.length} location(s)`);
      vendorData.locations.forEach((loc, i) => {
        console.log(`   ${i + 1}. ${loc.city}, ${loc.country} ${loc.isHQ ? '(HQ)' : ''}`);
      });
    } else {
      console.log('\n❌ ERROR: Vendor created but has no locations');
    }
  } else {
    console.log('\n❌ FAILED: Could not create vendor');
    if (data.errors) {
      console.log('Errors:', data.errors);
    }
  }
} catch (error) {
  console.error('\n❌ ERROR:', error.message);
  process.exit(1);
}
