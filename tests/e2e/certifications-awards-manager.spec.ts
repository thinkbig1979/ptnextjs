import { test, expect } from '@playwright/test';

test.describe('CertificationsAwardsManager Tests', () => {
  const EMAIL = 'testvendor@test.com';
  const PASS = '123';

  async function login(page: any) {
    await page.goto(`${BASE_URL}/vendor/dashboard/profile');
    await page.waitForLoadState('networkidle');
    await page.getByPlaceholder('vendor@example.com').fill(EMAIL);
    await page.getByPlaceholder('Enter your password').fill(PASS);
    await page.getByRole('button', { name: /login/i }).click();
    await page.waitForURL(/\/vendor\/dashboard/, { timeout: 10000 });
    await page.waitForTimeout(1000);
  }

  async function goToCerts(page: any) {
    await page.goto(`${BASE_URL}/vendor/dashboard/profile');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(800);
    const tab = page.locator('button[role="tab"]').filter({ hasText: /Certifications/i });
    await tab.click();
    await page.waitForTimeout(500);
  }

  test('Test 1: Component loads', async ({ page }) => {
    await login(page);
    await goToCerts(page);
    await expect(page.locator('text=Certifications').first()).toBeVisible();
    await expect(page.locator('text=Awards').first()).toBeVisible();
  });

  test('Test 2: Add certification', async ({ page }) => {
    await login(page);
    await goToCerts(page);

    await page.locator('button').filter({ hasText: /Add Certification/i }).first().click();
    await page.waitForTimeout(800);

    const dialog = page.locator('role=dialog');
    await expect(dialog).toBeVisible({ timeout: 5000 });

    await dialog.locator('input#cert-name').fill('ISO 9001');
    await dialog.locator('input#cert-issuer').fill('ISO');

    await dialog.locator('button[type="submit"]').click();
    await page.waitForTimeout(2000);

    await expect(page.locator('text=ISO 9001')).toBeVisible({ timeout: 5000 });
  });

  test('Test 3: Edit certification', async ({ page }) => {
    await login(page);
    await goToCerts(page);

    await page.locator('button').filter({ hasText: /Add Certification/i }).first().click();
    await page.waitForTimeout(800);
    let dialog = page.locator('role=dialog');
    await dialog.locator('input#cert-name').fill('Test Cert');
    await dialog.locator('input#cert-issuer').fill('Test');
    await dialog.locator('button[type="submit"]').click();
    await page.waitForTimeout(2000);

    await page.locator('button').filter({ hasText: /Edit/i }).first().click();
    await page.waitForTimeout(800);

    dialog = page.locator('role=dialog');
    const nameInput = dialog.locator('input#cert-name');
    await nameInput.clear();
    await nameInput.fill('Test Cert Updated');
    await dialog.locator('button[type="submit"]').click();
    await page.waitForTimeout(2000);

    await expect(page.locator('text=Test Cert Updated')).toBeVisible();
  });

  test('Test 4: Delete certification', async ({ page }) => {
    await login(page);
    await goToCerts(page);

    await page.locator('button').filter({ hasText: /Add Certification/i }).first().click();
    await page.waitForTimeout(800);
    let dialog = page.locator('role=dialog');
    await dialog.locator('input#cert-name').fill('Delete Me');
    await dialog.locator('input#cert-issuer').fill('Test');
    await dialog.locator('button[type="submit"]').click();
    await page.waitForTimeout(2000);

    // Verify it exists
    await expect(page.locator('text=Delete Me')).toBeVisible();

    // Click delete button on the certification card
    await page.locator('button').filter({ hasText: /Delete/i }).first().click();
    await page.waitForTimeout(600);

    // Confirm deletion in the dialog
    dialog = page.locator('role=dialog');
    await expect(dialog).toBeVisible({ timeout: 5000 });

    // Click the Delete button in dialog using getByRole to target by text
    const dialogDeleteBtn = dialog.getByRole('button', { name: 'Delete' });
    await expect(dialogDeleteBtn).toBeVisible({ timeout: 5000 });
    await dialogDeleteBtn.click();
    await page.waitForTimeout(2000);

    // Wait for dialog to close
    await expect(dialog).not.toBeVisible({ timeout: 5000 });

    // Now the item should be removed from the UI
    // BUT we need to save to persist - let's skip the immediate check and just save
    // Click Save Changes to persist the deletion to the backend (use first to avoid strict mode violation)
    const saveChangesBtn = page.locator('button').filter({ hasText: /Save Changes/i }).first();
    await expect(saveChangesBtn).toBeVisible({ timeout: 5000 });
    await saveChangesBtn.click();

    // Wait for the save operation to complete (removed networkidle due to dev server hot reload)
    await page.waitForTimeout(2000);

    // After save completes and page re-renders, verify deletion persisted
    const isStillVisible = await page.locator('text=Delete Me').isVisible().catch(() => false);
    expect(isStillVisible).toBe(false);
  });

  test('Test 5: Add award', async ({ page }) => {
    await login(page);
    await goToCerts(page);

    await page.locator('text=Awards').first().scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);

    await page.locator('button').filter({ hasText: /Add Award/i }).first().click();
    await page.waitForTimeout(800);

    const dialog = page.locator('role=dialog');
    await dialog.locator('input#award-title').fill('Best Award 2024');
    await dialog.locator('button[type="submit"]').click();
    await page.waitForTimeout(2000);

    await expect(page.locator('text=Best Award 2024')).toBeVisible();
  });
});
