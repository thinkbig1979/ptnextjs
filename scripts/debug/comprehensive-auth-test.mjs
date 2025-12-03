#!/usr/bin/env node
/**
 * Comprehensive Authentication Testing
 * Tests the login flow with seeded vendors
 */

import fetch from 'node-fetch';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const BASE_URL = 'http://localhost:3000';
const TIMEOUT = 10000; // 10 seconds

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function checkServerHealth() {
  try {
    const response = await fetch(`${BASE_URL}/`, { timeout: 5000 });
    return response.ok;
  } catch (error) {
    return false;
  }
}

async function seedVendor(vendorData) {
  const response = await fetch(`${BASE_URL}/api/test/vendors/seed`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify([vendorData]),
    timeout: 10000,
  });

  if (!response.ok) {
    throw new Error(`Seed API failed: ${response.status}`);
  }

  const data = await response.json();
  if (!data.success || !data.vendorIds || data.vendorIds.length === 0) {
    throw new Error(`Vendor creation failed: ${JSON.stringify(data.errors)}`);
  }

  return data.vendorIds[0];
}

async function testLogin(email, password) {
  const startTime = Date.now();

  try {
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      timeout: TIMEOUT,
    });

    const duration = Date.now() - startTime;
    const data = await response.json();

    return {
      success: response.ok,
      statusCode: response.status,
      duration,
      data,
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    return {
      success: false,
      statusCode: null,
      duration,
      error: error.message,
    };
  }
}

async function main() {
  console.log('========================================');
  console.log('Authentication Testing');
  console.log('========================================\n');

  // Check server health
  console.log('1. Checking server health...');
  const isHealthy = await checkServerHealth();

  if (!isHealthy) {
    console.error('❌ Server is not responding');
    console.log('\nStarting dev server...');
    try {
      await execAsync('npm run dev:clean 2>/dev/null &', { cwd: '/home/edwin/development/ptnextjs' });
      console.log('Waiting for server to start...');
      await sleep(15000);
    } catch (error) {
      console.error('Failed to start server:', error.message);
      process.exit(1);
    }
  } else {
    console.log('✓ Server is running\n');
  }

  // Test 1: Seed vendor
  console.log('2. Creating test vendor via seed API...');
  const timestamp = Date.now();
  const testVendor = {
    companyName: `Auth Test ${timestamp}`,
    email: `authtest-${timestamp}@test.example.com`,
    password: 'AuthTest123!@#',
    tier: 'free',
    status: 'approved',
  };

  try {
    const vendorId = await seedVendor(testVendor);
    console.log(`✓ Vendor created: ${vendorId}\n`);
  } catch (error) {
    console.error(`❌ Vendor creation failed: ${error.message}\n`);
    process.exit(1);
  }

  // Test 2: Login with valid credentials
  console.log('3. Testing login with valid credentials...');
  const loginResult = await testLogin(testVendor.email, testVendor.password);

  console.log(`   Status: ${loginResult.statusCode || 'ERROR'}`);
  console.log(`   Duration: ${loginResult.duration}ms`);

  if (loginResult.success) {
    console.log('   ✓ Login successful\n');
    if (loginResult.data.user) {
      console.log(`   User data: ${JSON.stringify(loginResult.data.user)}\n`);
    }
  } else {
    console.log(`   ❌ Login failed: ${loginResult.error || 'Unknown error'}\n`);
    console.log(`   Response: ${JSON.stringify(loginResult.data)}\n`);
  }

  // Test 3: Login with invalid credentials
  console.log('4. Testing login with invalid credentials...');
  const invalidLoginResult = await testLogin('invalid@test.example.com', 'InvalidPass123!@#');

  console.log(`   Status: ${invalidLoginResult.statusCode || 'ERROR'}`);
  console.log(`   Duration: ${invalidLoginResult.duration}ms`);

  if (invalidLoginResult.statusCode === 401) {
    console.log('   ✓ Correctly rejected invalid credentials\n');
  } else {
    console.log(`   ⚠ Unexpected status code: ${invalidLoginResult.statusCode}\n`);
  }

  // Test 4: Check response time is acceptable
  console.log('5. Checking response time...');
  if (loginResult.duration < 5000) {
    console.log(`   ✓ Login completed in ${loginResult.duration}ms (acceptable)\n`);
  } else {
    console.log(`   ❌ Login took ${loginResult.duration}ms (too slow)\n`);
  }

  console.log('========================================');
  console.log('Testing Complete');
  console.log('========================================');

  // Exit with appropriate code
  process.exit(loginResult.success ? 0 : 1);
}

main().catch(error => {
  console.error('Test error:', error);
  process.exit(1);
});
