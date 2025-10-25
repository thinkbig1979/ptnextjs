import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';
const CREDENTIALS = {
  email: 'testvendor@test.com',
  password: '123',
};

test.describe('TeamMembersManager Component', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to vendor dashboard login
    await page.goto(`${BASE_URL}/vendor/dashboard`);

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Login
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');

    if (await emailInput.isVisible()) {
      await emailInput.fill(CREDENTIALS.email);
      await passwordInput.fill(CREDENTIALS.password);
      await page.click('button[type="submit"]');
      await page.waitForLoadState('networkidle');
    }

    // Click Edit Profile to access profile tabs
    await page.waitForSelector('text=Edit Profile', { timeout: 10000 });
    await page.click('text=Edit Profile');
    await page.waitForLoadState('networkidle');

    // Navigate to Team tab
    await page.waitForSelector('text=Team', { timeout: 10000 });
    await page.click('text=Team');
    await page.waitForLoadState('networkidle');
  });

  test('Test 1: Should render TeamMembersManager component', async ({ page }) => {
    // Check for main heading (use first to avoid strict mode violation)
    await expect(page.locator('h3:has-text("Team Members")').first()).toBeVisible();

    // Check for Add Team Member button
    await expect(page.locator('button:has-text("Add Team Member")').first()).toBeVisible();

    // Check for search input
    await expect(page.locator('input[placeholder*="Search team members"]').first()).toBeVisible();
  });

  test('Test 2: Should open add team member modal', async ({ page }) => {
    // Click Add Team Member button
    await page.click('button:has-text("Add Team Member")');

    // Wait for modal to open
    await page.waitForSelector('dialog[open]', { timeout: 5000 });

    // Check modal title
    await expect(page.locator('h2:has-text("Add Team Member")')).toBeVisible();

    // Check required form fields
    await expect(page.locator('label:has-text("Name")')).toBeVisible();
    await expect(page.locator('label:has-text("Role")')).toBeVisible();
    await expect(page.locator('label:has-text("Bio")')).toBeVisible();
    await expect(page.locator('label:has-text("Photo URL")')).toBeVisible();
    await expect(page.locator('label:has-text("LinkedIn")')).toBeVisible();
    await expect(page.locator('label:has-text("Email")')).toBeVisible();
  });

  test('Test 3: Should validate required fields', async ({ page }) => {
    // Click Add Team Member button
    await page.click('button:has-text("Add Team Member")');
    await page.waitForSelector('dialog[open]');

    // Try to submit without filling required fields
    await page.click('button:has-text("Add Team Member")');

    // Check for validation errors
    await expect(page.locator('text=Name is required')).toBeVisible({ timeout: 3000 });
    await expect(page.locator('text=Role is required')).toBeVisible({ timeout: 3000 });
  });

  test('Test 4: Should add a new team member', async ({ page }) => {
    // Click Add Team Member button
    await page.click('button:has-text("Add Team Member")');
    await page.waitForSelector('dialog[open]');

    // Fill in form fields
    await page.fill('input#name', 'John Doe');
    await page.fill('input#role', 'Chief Engineer');
    await page.fill('textarea#bio', 'Expert marine engineer with 15 years of experience.');
    await page.fill('input#image', 'https://via.placeholder.com/150');
    await page.fill('input#linkedin', 'https://linkedin.com/in/johndoe');
    await page.fill('input[type="email"]#email', 'john.doe@example.com');

    // Submit form
    await page.click('button[type="submit"]:has-text("Add Team Member")');

    // Wait for modal to close and member to be added
    await page.waitForSelector('dialog[open]', { state: 'hidden', timeout: 5000 });

    // Verify team member appears in list
    await expect(page.locator('h3:has-text("John Doe")')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Chief Engineer')).toBeVisible();
  });

  test('Test 5: Should validate LinkedIn URL format', async ({ page }) => {
    // Click Add Team Member button
    await page.click('button:has-text("Add Team Member")');
    await page.waitForSelector('dialog[open]');

    // Fill required fields
    await page.fill('input#name', 'Jane Smith');
    await page.fill('input#role', 'Sales Director');

    // Try invalid LinkedIn URL
    await page.fill('input#linkedin', 'invalid-url');

    // Blur to trigger validation
    await page.locator('input#linkedin').blur();

    // Check for validation error
    await expect(page.locator('text=Must be a valid LinkedIn')).toBeVisible({ timeout: 3000 });

    // Fix with valid URL
    await page.fill('input#linkedin', 'https://linkedin.com/in/janesmith');

    // Error should disappear
    await expect(page.locator('text=Must be a valid LinkedIn')).not.toBeVisible({ timeout: 3000 });
  });

  test('Test 6: Should show email privacy note', async ({ page }) => {
    // Click Add Team Member button
    await page.click('button:has-text("Add Team Member")');
    await page.waitForSelector('dialog[open]');

    // Check for privacy note near email field
    await expect(page.locator('text=This email will be visible on your public profile')).toBeVisible();
  });

  test('Test 7: Should edit team member', async ({ page }) => {
    // First add a team member
    await page.click('button:has-text("Add Team Member")');
    await page.waitForSelector('dialog[open]');
    await page.fill('input#name', 'Test Person');
    await page.fill('input#role', 'Test Role');
    await page.click('button[type="submit"]:has-text("Add Team Member")');
    await page.waitForSelector('dialog[open]', { state: 'hidden' });

    // Click Edit button on the team member card
    await page.click('button:has-text("Edit")');
    await page.waitForSelector('dialog[open]');

    // Check modal title changed to Edit
    await expect(page.locator('h2:has-text("Edit Team Member")')).toBeVisible();

    // Update name
    await page.fill('input#name', 'Updated Person');

    // Submit
    await page.click('button[type="submit"]:has-text("Update Team Member")');
    await page.waitForSelector('dialog[open]', { state: 'hidden' });

    // Verify update
    await expect(page.locator('h3:has-text("Updated Person")')).toBeVisible({ timeout: 5000 });
  });

  test('Test 8: Should delete team member with confirmation', async ({ page }) => {
    // First add a team member
    await page.click('button:has-text("Add Team Member")');
    await page.waitForSelector('dialog[open]');
    await page.fill('input#name', 'To Be Deleted');
    await page.fill('input#role', 'Test Role');
    await page.click('button[type="submit"]:has-text("Add Team Member")');
    await page.waitForSelector('dialog[open]', { state: 'hidden' });

    // Verify member exists
    await expect(page.locator('h3:has-text("To Be Deleted")')).toBeVisible();

    // Click Delete button
    await page.click('button:has-text("Delete")');

    // Check for confirmation dialog
    await expect(page.locator('h2:has-text("Delete Team Member")')).toBeVisible({ timeout: 3000 });
    await expect(page.locator('text=To Be Deleted')).toBeVisible();

    // Confirm deletion
    await page.click('button:has-text("Delete")');

    // Verify member is removed
    await expect(page.locator('h3:has-text("To Be Deleted")')).not.toBeVisible({ timeout: 5000 });
  });

  test('Test 9: Should filter team members by search', async ({ page }) => {
    // Add two team members
    // First member
    await page.click('button:has-text("Add Team Member")');
    await page.waitForSelector('dialog[open]');
    await page.fill('input#name', 'Alice Johnson');
    await page.fill('input#role', 'Engineer');
    await page.click('button[type="submit"]:has-text("Add Team Member")');
    await page.waitForSelector('dialog[open]', { state: 'hidden' });

    // Second member
    await page.click('button:has-text("Add Team Member")');
    await page.waitForSelector('dialog[open]');
    await page.fill('input#name', 'Bob Williams');
    await page.fill('input#role', 'Manager');
    await page.click('button[type="submit"]:has-text("Add Team Member")');
    await page.waitForSelector('dialog[open]', { state: 'hidden' });

    // Verify both visible
    await expect(page.locator('h3:has-text("Alice Johnson")')).toBeVisible();
    await expect(page.locator('h3:has-text("Bob Williams")')).toBeVisible();

    // Search for Alice
    await page.fill('input[placeholder*="Search team members"]', 'Alice');

    // Only Alice should be visible
    await expect(page.locator('h3:has-text("Alice Johnson")')).toBeVisible();
    await expect(page.locator('h3:has-text("Bob Williams")')).not.toBeVisible();
  });

  test('Test 10: Should display circular photo preview', async ({ page }) => {
    // Add a team member with photo
    await page.click('button:has-text("Add Team Member")');
    await page.waitForSelector('dialog[open]');
    await page.fill('input#name', 'Photo Test');
    await page.fill('input#role', 'Tester');
    await page.fill('input#image', 'https://via.placeholder.com/150');
    await page.click('button[type="submit"]:has-text("Add Team Member")');
    await page.waitForSelector('dialog[open]', { state: 'hidden' });

    // Check for circular photo in card
    const photoImg = page.locator('img[alt="Photo Test"]').first();
    await expect(photoImg).toBeVisible({ timeout: 5000 });

    // Check if image has rounded-full class (circular)
    const className = await photoImg.getAttribute('class');
    expect(className).toContain('rounded-full');
  });
});
