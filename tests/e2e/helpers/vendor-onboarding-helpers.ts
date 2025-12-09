/**
 * Vendor Onboarding Test Helpers
 *
 * Comprehensive helper functions for vendor onboarding E2E tests.
 * These helpers support the complete vendor lifecycle from registration to tier 3.
 */

import { Page, BrowserContext, Cookie } from '@playwright/test';

const API_BASE = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';

// ============================================================================
// Type Definitions
// ============================================================================

export interface VendorTestData {
  email: string;
  companyName: string;
  password: string;
  contactName?: string;
  contactPhone?: string;
  website?: string;
  description?: string;
  tier?: 'free' | 'tier1' | 'tier2' | 'tier3';
  featured?: boolean;
  id?: string;
  slug?: string;
}

export interface LocationData {
  name: string;
  address?: string;
  city: string;
  state?: string;
  postalCode?: string;
  country: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
  isHQ?: boolean;
}

export interface CertificationData {
  name: string;
  issuer: string;
  dateIssued?: string;
  expirationDate?: string;
  description?: string;
}

export interface TeamMemberData {
  name: string;
  title: string;
  bio?: string;
  email?: string;
  linkedinUrl?: string;
  photo?: string;
}

export interface CaseStudyData {
  title: string;
  description: string;
  client?: string;
  projectYear?: string;
  challenge?: string;
  solution?: string;
  results?: string;
  featured?: boolean;
}

export interface ProductData {
  name: string;
  description: string;
  category?: string;
  manufacturer?: string;
  model?: string;
  price?: number;
  published?: boolean;
}

// ============================================================================
// Test Data Generation
// ============================================================================

/**
 * Generate unique vendor test data
 */
export function generateUniqueVendorData(
  overrides?: Partial<VendorTestData>
): VendorTestData {
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(7);

  return {
    email: `vendor-${timestamp}-${randomId}@test.example.com`,
    companyName: `Test Company ${timestamp}`,
    password: 'SecureTestPass123!@#',
    contactName: 'Test Contact',
    contactPhone: '+1-555-0123',
    website: 'https://test-example.com',
    description: 'Test vendor company for E2E testing',
    tier: 'free',
    featured: false,
    ...overrides,
  };
}

/**
 * Generate test location data
 */
export function generateLocationData(overrides?: Partial<LocationData>): LocationData {
  return {
    name: 'Test Office',
    address: '123 Test Street',
    city: 'Monaco',
    country: 'Monaco',
    postalCode: '98000',
    isHQ: false,
    ...overrides,
  };
}

/**
 * Generate test certification data
 */
export function generateCertificationData(
  overrides?: Partial<CertificationData>
): CertificationData {
  return {
    name: 'ISO 9001:2015',
    issuer: 'ISO',
    dateIssued: '2020-01-01',
    expirationDate: '2025-01-01',
    ...overrides,
  };
}

// ============================================================================
// Registration Helpers
// ============================================================================

/**
 * Fill vendor registration form
 */
export async function fillRegistrationForm(
  page: Page,
  data: VendorTestData
): Promise<void> {
  console.log(`[Registration] Filling form for: ${data.email}`);

  // Simplified registration form - only 4 fields + terms checkbox
  await page.getByPlaceholder('vendor@example.com').fill(data.email);
  await page.getByPlaceholder('Your Company Ltd').fill(data.companyName);
  await page.getByPlaceholder('Enter strong password').fill(data.password);
  await page.getByPlaceholder('Re-enter password').fill(data.password);

  // Accept terms
  await page.getByRole('checkbox', { name: /agree.*terms/i }).check();

  console.log(`[Registration] Form filled successfully`);
}

/**
 * Complete vendor registration and return vendor ID
 */
export async function registerVendor(
  page: Page,
  data?: Partial<VendorTestData>
): Promise<VendorTestData & { id: string; slug: string }> {
  const vendorData = generateUniqueVendorData(data);

  console.log(`[Registration] Starting registration for: ${vendorData.email}`);

  await page.goto('/vendor/register/');
  await fillRegistrationForm(page, vendorData);

  // Wait for API response
  const apiResponsePromise = page.waitForResponse(
    (response) =>
      response.url().includes('/api/portal/vendors/register') &&
      (response.status() === 201 || response.status() === 200)
  );

  await page.click('button[type="submit"]');

  const apiResponse = await apiResponsePromise;
  const responseBody = await apiResponse.json();

  if (!responseBody.success || !responseBody.data?.vendorId) {
    throw new Error(
      `Registration failed: ${JSON.stringify(responseBody)}`
    );
  }

  const vendorId = responseBody.data.vendorId;
  console.log(`[Registration] Vendor registered with ID: ${vendorId}`);

  return {
    ...vendorData,
    id: vendorId,
    slug: vendorData.companyName.toLowerCase().replace(/\s+/g, '-'),
  };
}

// ============================================================================
// Authentication Helpers
// ============================================================================

/**
 * Login vendor and return vendor ID
 */
export async function loginVendor(
  page: Page,
  email: string,
  password: string
): Promise<string> {
  console.log(`[Auth] Logging in vendor: ${email}`);

  await page.goto('/vendor/login/');
  await page.getByPlaceholder('vendor@example.com').fill(email);
  await page.getByPlaceholder(/password/i).fill(password);

  const loginResponsePromise = page.waitForResponse(
    (response) => response.url().includes('/api/auth/login')
  );

  await page.click('button:has-text("Login")');

  const loginResponse = await loginResponsePromise;

  if (loginResponse.status() !== 200) {
    const errorBody = await loginResponse.json().catch(() => ({}));
    throw new Error(
      `Login failed: ${loginResponse.status()} - ${JSON.stringify(errorBody)}`
    );
  }

  // Wait for redirect to dashboard
  await page.waitForURL(/\/vendor\/dashboard\/?/, { timeout: 10000 });

  console.log(`[Auth] Login successful`);

  // Get vendor ID from profile API
  const profileResponse = await page.request.get(
    `${API_BASE}/api/portal/vendors/profile`
  );

  if (profileResponse.ok()) {
    const profileData = await profileResponse.json();
    const vendorId = profileData.vendor?.id || profileData.data?.id;
    console.log(`[Auth] Vendor ID: ${vendorId}`);
    return vendorId;
  }

  throw new Error('Failed to get vendor ID after login');
}

/**
 * Login vendor using VendorTestData
 */
export async function loginVendorWithData(
  page: Page,
  vendor: VendorTestData
): Promise<string> {
  return await loginVendor(page, vendor.email, vendor.password);
}

/**
 * Logout vendor
 */
export async function logoutVendor(page: Page): Promise<void> {
  console.log(`[Auth] Logging out vendor`);

  const logoutButton = page.locator('button:has-text("Logout"), a:has-text("Logout")').first();

  if (await logoutButton.isVisible()) {
    await logoutButton.click();
    await page.waitForURL(/\/vendor\/login\/?/, { timeout: 5000 });
    console.log(`[Auth] Logout successful`);
  } else {
    console.log(`[Auth] Logout button not found, navigating to login`);
    await page.goto('/vendor/login/');
  }
}

/**
 * Get auth cookies
 */
export async function getAuthCookies(context: BrowserContext): Promise<Cookie[]> {
  return await context.cookies();
}

// ============================================================================
// Admin Helpers
// ============================================================================

/**
 * Approve vendor via admin action
 * NOTE: This requires admin API endpoint or database access
 */
export async function approveVendor(
  page: Page,
  vendorId: string
): Promise<void> {
  console.log(`[Admin] Approving vendor: ${vendorId}`);

  // Attempt to use admin API endpoint
  const response = await page.request.post(
    `${API_BASE}/api/admin/vendors/${vendorId}/approve`,
    {
      headers: { 'Content-Type': 'application/json' },
    }
  );

  if (response.ok()) {
    console.log(`[Admin] Vendor approved via API`);
    return;
  }

  // Fallback: Direct database update (requires implementation)
  console.warn(
    `[Admin] Admin approval API not available. Manual approval required.`
  );

  throw new Error(
    'Admin approval endpoint not available. Please implement /api/admin/vendors/[id]/approve or approve manually.'
  );
}

/**
 * Upgrade vendor tier via admin action
 */
export async function upgradeTier(
  page: Page,
  vendorId: string,
  tier: 'tier1' | 'tier2' | 'tier3'
): Promise<void> {
  console.log(`[Admin] Upgrading vendor ${vendorId} to ${tier}`);

  const response = await page.request.put(
    `${API_BASE}/api/admin/vendors/${vendorId}/tier`,
    {
      headers: { 'Content-Type': 'application/json' },
      data: { tier },
    }
  );

  if (response.ok()) {
    console.log(`[Admin] Tier upgraded successfully`);
    return;
  }

  console.warn(`[Admin] Tier upgrade API not available`);
  throw new Error(
    'Tier upgrade endpoint not available. Please implement /api/admin/vendors/[id]/tier'
  );
}

// ============================================================================
// Vendor Creation Helpers
// ============================================================================

/**
 * Create and approve vendor (complete setup)
 */
export async function createAndApproveVendor(
  page: Page,
  overrides?: Partial<VendorTestData>
): Promise<VendorTestData & { id: string; slug: string }> {
  const vendor = await registerVendor(page, overrides);

  try {
    await approveVendor(page, vendor.id);
  } catch (error) {
    console.warn(`[Setup] Vendor approval failed, vendor may need manual approval`);
    console.warn(`[Setup] Vendor ID: ${vendor.id}, Email: ${vendor.email}`);
  }

  return vendor;
}

/**
 * Create vendor with specific tier
 */
export async function createVendorWithTier(
  page: Page,
  tier: 'free' | 'tier1' | 'tier2' | 'tier3',
  overrides?: Partial<VendorTestData>
): Promise<VendorTestData & { id: string; slug: string }> {
  const vendor = await createAndApproveVendor(page, overrides);

  if (tier !== 'free') {
    try {
      await upgradeTier(page, vendor.id, tier);
    } catch (error) {
      console.warn(`[Setup] Tier upgrade failed, vendor remains at free tier`);
    }
  }

  return vendor;
}

// ============================================================================
// Profile Editing Helpers
// ============================================================================

/**
 * Navigate to profile editor
 */
export async function navigateToProfileEditor(page: Page): Promise<void> {
  await page.goto('/vendor/dashboard/profile/');
  await page.waitForLoadState('networkidle');
}

/**
 * Update basic info
 */
export async function updateBasicInfo(
  page: Page,
  data: {
    companyName?: string;
    description?: string;
    contactPhone?: string;
    contactEmail?: string;
  }
): Promise<void> {
  console.log(`[Profile] Updating basic info`);

  await navigateToProfileEditor(page);

  if (data.companyName) {
    await page.fill('input[name="companyName"]', data.companyName);
  }
  if (data.description) {
    await page.fill('textarea[name="description"]', data.description);
  }
  if (data.contactPhone) {
    await page.fill('input[name="contactPhone"]', data.contactPhone);
  }
  if (data.contactEmail) {
    await page.fill('input[name="contactEmail"]', data.contactEmail);
  }

  await page.click('button:has-text("Save")');
  await page.waitForResponse((response) =>
    response.url().includes('/api/portal/vendors/')
  );

  console.log(`[Profile] Basic info updated`);
}

/**
 * Fill brand story form (Tier 1+)
 */
export async function fillBrandStory(
  page: Page,
  data: {
    website?: string;
    linkedinUrl?: string;
    twitterUrl?: string;
    foundedYear?: string;
    totalProjects?: string;
    employeeCount?: string;
    clientSatisfactionScore?: string;
    longDescription?: string;
  }
): Promise<void> {
  console.log(`[Profile] Filling brand story`);

  await navigateToProfileEditor(page);
  await page.click('[role="tab"]:has-text("Brand Story")');

  if (data.website) {
    await page.fill('input[name="website"]', data.website);
  }
  if (data.linkedinUrl) {
    await page.fill('input[name="linkedinUrl"]', data.linkedinUrl);
  }
  if (data.twitterUrl) {
    await page.fill('input[name="twitterUrl"]', data.twitterUrl);
  }
  if (data.foundedYear) {
    await page.fill('input[name="foundedYear"]', data.foundedYear);
  }
  if (data.totalProjects) {
    await page.fill('input[name="totalProjects"]', data.totalProjects);
  }
  if (data.employeeCount) {
    await page.fill('input[name="employeeCount"]', data.employeeCount);
  }
  if (data.clientSatisfactionScore) {
    await page.fill(
      'input[name="clientSatisfactionScore"]',
      data.clientSatisfactionScore
    );
  }
  if (data.longDescription) {
    const richTextEditor = page.locator(
      '[data-lexical-editor="true"], [contenteditable="true"]'
    );
    if (await richTextEditor.isVisible()) {
      await richTextEditor.fill(data.longDescription);
    } else {
      await page.fill('textarea[name="longDescription"]', data.longDescription);
    }
  }

  await page.click('button:has-text("Save")');
  await page.waitForResponse((response) =>
    response.url().includes('/api/portal/vendors/')
  );

  console.log(`[Profile] Brand story filled`);
}

// ============================================================================
// Certification Helpers
// ============================================================================

/**
 * Add certification
 */
export async function addCertification(
  page: Page,
  data: CertificationData
): Promise<void> {
  console.log(`[Profile] Adding certification: ${data.name}`);

  await navigateToProfileEditor(page);
  await page.click('[role="tab"]:has-text("Certifications")');

  await page.click('button:has-text("Add Certification")');

  await page.fill('input[name="certificationName"]', data.name);
  await page.fill('input[name="issuingOrganization"]', data.issuer);

  if (data.dateIssued) {
    await page.fill('input[name="dateIssued"]', data.dateIssued);
  }
  if (data.expirationDate) {
    await page.fill('input[name="expirationDate"]', data.expirationDate);
  }
  if (data.description) {
    await page.fill('textarea[name="certificationDescription"]', data.description);
  }

  await page.click('button:has-text("Add"), button:has-text("Save Certification")');

  console.log(`[Profile] Certification added`);
}

// ============================================================================
// Location Helpers
// ============================================================================

/**
 * Add location
 */
export async function addLocation(
  page: Page,
  data: LocationData
): Promise<void> {
  console.log(`[Profile] Adding location: ${data.name}`);

  await navigateToProfileEditor(page);
  await page.click('[role="tab"]:has-text("Locations")');

  await page.click('button:has-text("Add Location")');

  await page.fill('input[name="locationName"]', data.name);

  if (data.address) {
    await page.fill('input[name="address"]', data.address);
  }

  await page.fill('input[name="city"]', data.city);

  if (data.state) {
    await page.fill('input[name="state"]', data.state);
  }
  if (data.postalCode) {
    await page.fill('input[name="postalCode"]', data.postalCode);
  }

  await page.fill('input[name="country"]', data.country);

  if (data.phone) {
    await page.fill('input[name="phone"]', data.phone);
  }

  if (data.isHQ) {
    await page.check('input[name="isHQ"]');
  }

  // Geocode if no coordinates provided
  if (!data.latitude || !data.longitude) {
    const geocodeBtn = page.locator('button:has-text("Geocode Address")');
    if (await geocodeBtn.isVisible()) {
      await geocodeBtn.click();
      await page.waitForTimeout(2000); // Wait for geocoding
    }
  } else {
    await page.fill('input[name="latitude"]', data.latitude.toString());
    await page.fill('input[name="longitude"]', data.longitude.toString());
  }

  await page.click('button:has-text("Save Location")');

  console.log(`[Profile] Location added`);
}

// ============================================================================
// Team Member Helpers
// ============================================================================

/**
 * Add team member
 */
export async function addTeamMember(
  page: Page,
  data: TeamMemberData
): Promise<void> {
  console.log(`[Profile] Adding team member: ${data.name}`);

  await navigateToProfileEditor(page);
  await page.click('[role="tab"]:has-text("Team")');

  await page.click('button:has-text("Add Team Member")');

  await page.fill('input[name="name"]', data.name);
  await page.fill('input[name="title"]', data.title);

  if (data.bio) {
    await page.fill('textarea[name="bio"]', data.bio);
  }
  if (data.email) {
    await page.fill('input[name="email"]', data.email);
  }
  if (data.linkedinUrl) {
    await page.fill('input[name="linkedinUrl"]', data.linkedinUrl);
  }
  if (data.photo) {
    await page.locator('input[type="file"][name="photo"]').setInputFiles(data.photo);
  }

  await page.click('button:has-text("Save Team Member")');

  console.log(`[Profile] Team member added`);
}

// ============================================================================
// Case Study Helpers
// ============================================================================

/**
 * Add case study
 */
export async function addCaseStudy(
  page: Page,
  data: CaseStudyData
): Promise<void> {
  console.log(`[Profile] Adding case study: ${data.title}`);

  await navigateToProfileEditor(page);
  await page.click('[role="tab"]:has-text("Case Studies")');

  await page.click('button:has-text("Add Case Study")');

  await page.fill('input[name="title"]', data.title);
  await page.fill('textarea[name="description"]', data.description);

  if (data.client) {
    await page.fill('input[name="client"]', data.client);
  }
  if (data.projectYear) {
    await page.fill('input[name="projectYear"]', data.projectYear);
  }
  if (data.challenge) {
    await page.fill('textarea[name="challenge"]', data.challenge);
  }
  if (data.solution) {
    await page.fill('textarea[name="solution"]', data.solution);
  }
  if (data.results) {
    await page.fill('textarea[name="results"]', data.results);
  }
  if (data.featured) {
    await page.check('input[name="featured"]');
  }

  await page.click('button:has-text("Save Case Study")');

  console.log(`[Profile] Case study added`);
}

// ============================================================================
// Product Helpers
// ============================================================================

/**
 * Add product
 */
export async function addProduct(
  page: Page,
  data: ProductData
): Promise<void> {
  console.log(`[Product] Adding product: ${data.name}`);

  await page.goto('/vendor/dashboard/products/');

  await page.click('button:has-text("Add Product")');

  await page.fill('input[name="productName"]', data.name);
  await page.fill('textarea[name="description"]', data.description);

  if (data.category) {
    await page.selectOption('select[name="category"]', data.category);
  }
  if (data.manufacturer) {
    await page.fill('input[name="manufacturer"]', data.manufacturer);
  }
  if (data.model) {
    await page.fill('input[name="model"]', data.model);
  }
  if (data.price) {
    await page.fill('input[name="price"]', data.price.toString());
  }

  await page.click('button:has-text("Save Product")');

  console.log(`[Product] Product added`);
}

// ============================================================================
// Assertion Helpers
// ============================================================================

/**
 * Expect toast message
 */
export async function expectToast(
  page: Page,
  message: string | RegExp
): Promise<void> {
  const toast = page.locator('.sonner-toast, [role="status"]').first();
  await toast.waitFor({ state: 'visible', timeout: 5000 });

  if (typeof message === 'string') {
    await page.locator(`.sonner-toast:has-text("${message}")`).waitFor({ state: 'visible' });
  } else {
    // For regex, check text content
    const toastText = await toast.textContent();
    if (!toastText || !message.test(toastText)) {
      throw new Error(`Toast message "${toastText}" does not match pattern ${message}`);
    }
  }
}

/**
 * Wait for API response with timeout
 */
export async function waitForAPIResponse(
  page: Page,
  urlPattern: string | RegExp,
  timeout: number = 10000
): Promise<any> {
  const response = await page.waitForResponse(
    (response) => {
      const url = response.url();
      if (typeof urlPattern === 'string') {
        return url.includes(urlPattern);
      }
      return urlPattern.test(url);
    },
    { timeout }
  );

  return response;
}

// ============================================================================
// Cleanup Helpers
// ============================================================================

/**
 * Cleanup test vendor
 */
export async function cleanupVendor(
  page: Page,
  vendorId: string
): Promise<void> {
  console.log(`[Cleanup] Removing test vendor: ${vendorId}`);

  try {
    await page.request.delete(`${API_BASE}/api/test/vendors/${vendorId}`);
    console.log(`[Cleanup] Vendor removed`);
  } catch (error) {
    console.warn(`[Cleanup] Failed to remove vendor: ${error}`);
  }
}

// ============================================================================
// Wait Helpers
// ============================================================================

/**
 * Wait for cache revalidation (ISR)
 */
export async function waitForCacheRevalidation(
  page: Page,
  delayMs: number = 2000
): Promise<void> {
  console.log(`[Wait] Waiting ${delayMs}ms for cache revalidation`);
  await page.waitForTimeout(delayMs);
}

/**
 * Navigate to vendor public profile
 */
export async function navigateToPublicProfile(
  page: Page,
  slug: string
): Promise<void> {
  console.log(`[Navigate] Loading public profile: ${slug}`);
  await page.goto(`/vendors/${slug}/`);
  await page.waitForLoadState('networkidle');
}
