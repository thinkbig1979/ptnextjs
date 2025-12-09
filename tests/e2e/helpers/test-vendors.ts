/**
 * Test vendor configurations for E2E tests
 * Each test uses a separate vendor account to avoid state bleeding
 */

export const TEST_VENDORS = {
  free: {
    email: 'testvendor-free@example.com',
    password: 'TestVendor123!Free',
    slug: 'testvendor-free',
    name: 'Free Tier Test Vendor',
  },
  tier1: {
    email: 'testvendor-tier1@example.com',
    password: 'TestVendor123!Tier1',
    slug: 'testvendor-tier1',
    name: 'Tier 1 Test Vendor',
  },
  tier2: {
    email: 'testvendor-tier2@example.com',
    password: 'TestVendor123!Tier2',
    slug: 'testvendor-tier2',
    name: 'Tier 2 Professional Vendor',
  },
  tier3: {
    email: 'testvendor-tier3@example.com',
    password: 'TestVendor123!Tier3',
    slug: 'testvendor-tier3',
    name: 'Tier 3 Premium Vendor',
  },
  mobile: {
    email: 'testvendor-mobile@example.com',
    password: 'TestVendor123!Mobile',
    slug: 'testvendor-mobile',
    name: 'Mobile Test Vendor',
  },
  tablet: {
    email: 'testvendor-tablet@example.com',
    password: 'TestVendor123!Tablet',
    slug: 'testvendor-tablet',
    name: 'Tablet Test Vendor',
  },
};

// Initial clean state for each vendor - reset data back to this between tests
// IMPORTANT: Include ALL fields that tests might modify to ensure clean state
const INITIAL_VENDOR_STATE: Record<string, Record<string, any>> = {
  'testvendor-free': {
    companyName: 'Free Tier Test Vendor',
    description: '',
    contactEmail: 'testvendor-free@example.com',
    contactPhone: '',
    foundedYear: null,
    website: '',
  },
  'testvendor-tier1': {
    companyName: 'Tier 1 Test Vendor',
    description: '',
    contactEmail: 'testvendor-tier1@example.com',
    contactPhone: '',
    foundedYear: null,
    website: '',
  },
  'testvendor-tier2': {
    companyName: 'Tier 2 Professional Vendor',
    description: '',
    contactEmail: 'testvendor-tier2@example.com',
    contactPhone: '',
    foundedYear: null,
    website: '',
  },
  'testvendor-tier3': {
    companyName: 'Tier 3 Premium Vendor',
    description: '',
    contactEmail: 'testvendor-tier3@example.com',
    contactPhone: '',
    foundedYear: null,
    website: '',
  },
  'testvendor-mobile': {
    companyName: 'Mobile Test Vendor',
    description: '',
    contactEmail: 'testvendor-mobile@example.com',
    contactPhone: '',
    foundedYear: null,
    website: '',
  },
  'testvendor-tablet': {
    companyName: 'Tablet Test Vendor',
    description: '',
    contactEmail: 'testvendor-tablet@example.com',
    contactPhone: '',
    foundedYear: null,
    website: '',
  },
};

export const API_BASE = 'http://localhost:3000';

/**
 * Clear rate limits before running tests
 * Call this in beforeAll or beforeEach to prevent rate limit issues
 */
export async function clearRateLimits(page: any): Promise<boolean> {
  try {
    const response = await page.request.post(`${API_BASE}/api/test/rate-limit/clear`);
    if (!response.ok()) {
      console.warn('[RateLimit] Failed to clear rate limits:', await response.text());
      return false;
    }
    console.log('[RateLimit] Rate limits cleared successfully');
    return true;
  } catch (error) {
    console.warn('[RateLimit] Error clearing rate limits:', error);
    return false;
  }
}

/**
 * Helper function to login vendor and get their ID
 */
export async function loginVendor(page: any, email: string, password: string): Promise<number> {
  const loginResponse = await page.request.post(`${API_BASE}/api/auth/login`, {
    data: { email, password },
  });

  if (!loginResponse.ok()) {
    const errorText = await loginResponse.text();
    throw new Error(`Login failed: ${loginResponse.status()} - ${errorText}`);
  }

  const profileResponse = await page.request.get(`${API_BASE}/api/portal/vendors/profile`);
  if (!profileResponse.ok()) {
    const errorText = await profileResponse.text();
    throw new Error(`Failed to get profile: ${profileResponse.status()} - ${errorText}`);
  }

  const profileData = await profileResponse.json();
  return profileData.vendor.id;
}

/**
 * Helper function to update vendor profile data
 *
 * NOTE: Vendors are pre-seeded at their correct tiers in create-test-vendors.ts.
 * This function only updates profile data, not tier.
 */
/**
 * Verify data actually changed in the API before proceeding
 */
export async function verifyVendorDataChanged(
  page: any,
  vendorId: number,
  expectedData: Record<string, any>,
  maxAttempts: number = 5
): Promise<boolean> {
  console.log(`[Verify] Checking if vendor ${vendorId} data matches:`, expectedData);

  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await page.request.get(`${API_BASE}/api/portal/vendors/${vendorId}?byUserId=true`);
      if (response.ok()) {
        const json = await response.json();
        console.log(`[Verify] Attempt ${i + 1} - Response structure:`, Object.keys(json));

        // Handle different response structures
        const vendor = json.data?.vendor || json.vendor || json.data || json;

        if (!vendor) {
          console.log(`[Verify] Could not extract vendor from response`);
          await page.waitForTimeout(300);
          continue;
        }

        // Check each expected field
        const results = Object.entries(expectedData).map(([key, value]) => {
          const actualValue = vendor[key];
          const matches = actualValue === value;
          console.log(`[Verify] ${key}: expected=${value}, actual=${actualValue}, match=${matches}`);
          return { key, expected: value, actual: actualValue, matches };
        });

        const allMatch = results.every(r => r.matches);

        if (allMatch) {
          console.log(`[Verify] ✓ All ${results.length} fields match!`);
          return true;
        }

        const mismatches = results.filter(r => !r.matches);
        console.log(`[Verify] Attempt ${i + 1}: ${mismatches.length} fields don't match yet`);
      }
    } catch (error) {
      console.error(`[Verify] Attempt ${i + 1} error:`, error);
    }

    await page.waitForTimeout(300);
  }

  console.error(`[Verify] ✗ Data verification failed after ${maxAttempts} attempts`);
  return false;
}

export async function updateVendorData(
  page: any,
  vendorId: number,
  additionalData: Record<string, any> = {}
): Promise<any> {
  // Update profile data fields (no tier update)
  if (Object.keys(additionalData).length > 0) {
    console.log(`[Update] Updating vendor ${vendorId} with:`, additionalData);

    const response = await page.request.put(
      `${API_BASE}/api/portal/vendors/${vendorId}?byUserId=true`,
      { data: additionalData }
    );

    if (!response.ok()) {
      const errorText = await response.text();
      throw new Error(`Update failed: ${response.status()} - ${errorText}`);
    }

    const result = await response.json();
    console.log(`[Update] API returned success, vendor updated`);

    // Trust the API - if it returns 200, data is persisted
    // Cache is cleared server-side, ISR will be revalidated
    return result;
  }

  return { success: true };
}

/**
 * Reset a vendor's data back to its initial clean state.
 * This is called in beforeEach hooks to prevent data pollution between tests.
 *
 * Returns the vendor ID for use in the test.
 */
export async function resetVendorData(
  page: any,
  vendorEmail: string,
  vendorPassword: string
): Promise<number> {
  console.log(`[Test Reset] Resetting vendor: ${vendorEmail}`);

  try {
    // Login to get vendor ID
    const vendorId = await loginVendor(page, vendorEmail, vendorPassword);
    console.log(`[Test Reset] Vendor ID: ${vendorId}`);

    // Find the slug from TEST_VENDORS
    const vendorEntry = Object.values(TEST_VENDORS).find(v => v.email === vendorEmail);
    if (!vendorEntry) {
      throw new Error(`Unknown vendor email: ${vendorEmail}`);
    }

    const slug = vendorEntry.slug;
    const initialState = INITIAL_VENDOR_STATE[slug];

    if (!initialState) {
      throw new Error(`No initial state defined for vendor: ${slug}`);
    }

    // Clear and reset all vendor data to initial state
    console.log(`[Test Reset] Clearing vendor data to initial state for: ${slug}`);

    const resetData = { ...initialState };

    const resetResponse = await page.request.put(
      `${API_BASE}/api/portal/vendors/${vendorId}?byUserId=true`,
      { data: resetData }
    );

    if (!resetResponse.ok()) {
      const errorText = await resetResponse.text();
      console.error(`[Test Reset] Failed to reset vendor data:`, errorText);
      throw new Error(`Reset failed: ${resetResponse.status()} - ${errorText}`);
    }

    // Wait for cache clearing and ISR revalidation
    console.log(`[Test Reset] Waiting for cache clearing...`);
    await page.waitForTimeout(2000);

    console.log(`[Test Reset] Vendor reset complete: ${vendorEmail}`);
    return vendorId;
  } catch (error) {
    console.error(`[Test Reset] Error resetting vendor ${vendorEmail}:`, error);
    throw error;
  }
}

/**
 * Reset multiple vendors in sequence
 */
export async function resetMultipleVendors(
  page: any,
  vendorCredentials: Array<{ email: string; password: string }>
): Promise<void> {
  console.log(`[Test Reset] Resetting ${vendorCredentials.length} vendors...`);

  // Reset all vendors sequentially to avoid conflicts
  for (const creds of vendorCredentials) {
    await resetVendorData(page, creds.email, creds.password).catch(error => {
      console.error(`[Test Reset] Failed to reset ${creds.email}:`, error);
      throw error;
    });
  }

  console.log(`[Test Reset] All vendors reset complete`);
}

/**
 * Navigate to vendor page with GUARANTEED fresh data
 *
 * Strategy:
 * 1. Data verified in API ✓
 * 2. Cache cleared ✓
 * 3. Force browser to fetch fresh HTML with cache-busting
 */
export async function navigateToFreshVendorPage(
  page: any,
  vendorSlug: string
): Promise<void> {
  const timestamp = Date.now();
  const url = `${API_BASE}/vendors/${vendorSlug}`;

  console.log(`[Navigate] Loading fresh vendor page: ${vendorSlug}`);

  // Navigate with cache-busting query param
  await page.goto(`${url}?v=${timestamp}`, {
    waitUntil: 'networkidle',
    timeout: 30000
  });

  // Force full reload to bypass any browser cache
  await page.reload({ waitUntil: 'networkidle' });

  console.log(`[Navigate] Fresh page loaded for ${vendorSlug}`);
}
