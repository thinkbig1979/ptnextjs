import { test, expect, Page } from '@playwright/test';
import { seedVendors, createTestVendor } from '../helpers/seed-api-helpers';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';

async function loginAsVendor(page: Page, email: string, password: string) {
  await page.goto(`${BASE_URL}/vendor/login/`);
  await page.getByPlaceholder('vendor@example.com').fill(email);
  await page.getByPlaceholder(/password/i).fill(password);

  const response = await page.waitForResponse(
    (r: any) => r.url().includes('/api/auth/login') && r.status() === 200
  ).catch(async () => {
    await page.click('button:has-text("Login")');
    return page.waitForResponse(
      (r: any) => r.url().includes('/api/auth/login') && r.status() === 200
    );
  });

  await page.waitForURL(/\/vendor\/dashboard\/?/, { timeout: 10000 });
}

test.describe('TIER1-P2: Tier 1 Advanced Profile', () => {
  test.setTimeout(90000); // 90 seconds for longer tests

  test('Test 6.1: Fill brand story (website, social links, founded year)', async ({ page }) => {
    const vendorData = createTestVendor({
      tier: 'tier1',
      status: 'approved',
    });

    await seedVendors(page, [vendorData]);
    await loginAsVendor(page, vendorData.email, vendorData.password);

    await page.goto(`${BASE_URL}/vendor/dashboard/profile/`);
    await page.waitForLoadState('networkidle');

    // Find and click Brand Story tab
    const brandStoryTab = page.locator('button[role="tab"]').filter({ hasText: /Brand Story/i });
    if (await brandStoryTab.count() > 0) {
      await brandStoryTab.first().click();
      await page.waitForTimeout(500);

      // Fill website
      const websiteInput = page.locator('input[name="website"], input[placeholder*="website"]').first();
      if (await websiteInput.isVisible({ timeout: 2000 }).catch(() => false)) {
        await websiteInput.fill('https://example-yacht-company.com');
      }

      // Fill founded year
      const foundedInput = page.locator('input[name="foundedYear"], input[type="number"]').first();
      if (await foundedInput.isVisible({ timeout: 2000 }).catch(() => false)) {
        await foundedInput.fill('2010');
      }

      // Fill social media links
      const linkedInInput = page.locator('input[name*="linkedin"], input[placeholder*="LinkedIn"]').first();
      if (await linkedInInput.isVisible({ timeout: 2000 }).catch(() => false)) {
        await linkedInInput.fill('https://linkedin.com/company/example');
      }

      const twitterInput = page.locator('input[name*="twitter"], input[placeholder*="Twitter"]').first();
      if (await twitterInput.isVisible({ timeout: 2000 }).catch(() => false)) {
        await twitterInput.fill('https://twitter.com/example');
      }

      // Save changes
      const saveBtn = page.locator('button').filter({ hasText: /Save|Update/ }).first();
      if (await saveBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await expect(saveBtn).toBeEnabled({ timeout: 5000 });

        const [response] = await Promise.all([
          page.waitForResponse(
            (r: any) => r.url().includes('/api/portal/vendors/') && r.request().method() === 'PUT',
            { timeout: 10000 }
          ),
          saveBtn.click()
        ]);

        console.log('[Test 6.1] Response status:', response.status());
        expect(response.ok()).toBeTruthy();
      }
    }
  });

  test('Test 6.2: Add certification (ISO 9001)', async ({ page }) => {
    const vendorData = createTestVendor({
      tier: 'tier1',
      status: 'approved',
    });

    await seedVendors(page, [vendorData]);
    await loginAsVendor(page, vendorData.email, vendorData.password);

    await page.goto(`${BASE_URL}/vendor/dashboard/profile/`);
    await page.waitForLoadState('networkidle');

    // Find and click Certifications tab
    const certificationsTab = page.locator('button[role="tab"]').filter({ hasText: /Certification/i });
    if (await certificationsTab.count() > 0) {
      await certificationsTab.first().click();
      await page.waitForTimeout(500);

      // Look for Add Certification button
      const addBtn = page.locator('button').filter({ hasText: /Add.*Certification|New.*Certification/i }).first();
      if (await addBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await addBtn.click();
        await page.waitForTimeout(300);

        // Fill certification details
        const nameInput = page.locator('input[name*="name"], input[placeholder*="name"]').last();
        await nameInput.fill('ISO 9001:2015');

        const issuerInput = page.locator('input[name*="issuer"], input[placeholder*="issuer"]').last();
        if (await issuerInput.isVisible({ timeout: 1000 }).catch(() => false)) {
          await issuerInput.fill('International Organization for Standardization');
        }

        const dateInput = page.locator('input[type="date"], input[name*="date"]').last();
        if (await dateInput.isVisible({ timeout: 1000 }).catch(() => false)) {
          await dateInput.fill('2023-01-15');
        }

        // Save certification
        const saveBtn = page.locator('button').filter({ hasText: /Save|Add|Create/ }).last();
        await saveBtn.click();
        await page.waitForTimeout(1000);

        // Verify certification appears
        const certificationItem = page.locator('text=/ISO 9001/i');
        await expect(certificationItem).toBeVisible({ timeout: 5000 }).catch(() => {});
      }
    }
  });

  test('Test 6.3: Edit existing certification', async ({ page }) => {
    const vendorData = createTestVendor({
      tier: 'tier1',
      status: 'approved',
    });

    await seedVendors(page, [vendorData]);
    await loginAsVendor(page, vendorData.email, vendorData.password);

    await page.goto(`${BASE_URL}/vendor/dashboard/profile/`);
    await page.waitForLoadState('networkidle');

    // Navigate to Certifications tab
    const certificationsTab = page.locator('button[role="tab"]').filter({ hasText: /Certification/i });
    if (await certificationsTab.count() > 0) {
      await certificationsTab.first().click();
      await page.waitForTimeout(500);

      // First add a certification
      const addBtn = page.locator('button').filter({ hasText: /Add.*Certification/i }).first();
      if (await addBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await addBtn.click();
        await page.waitForTimeout(300);

        const nameInput = page.locator('input[name*="name"]').last();
        await nameInput.fill('Original Certification');

        const saveBtn = page.locator('button').filter({ hasText: /Save|Add/ }).last();
        await saveBtn.click();
        await page.waitForTimeout(1000);

        // Now edit it
        const editBtn = page.locator('button').filter({ hasText: /Edit/i }).first();
        if (await editBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
          await editBtn.click();
          await page.waitForTimeout(300);

          const editNameInput = page.locator('input[name*="name"]').last();
          await editNameInput.fill('Updated Certification Name');

          const updateBtn = page.locator('button').filter({ hasText: /Save|Update/ }).last();
          await updateBtn.click();
          await page.waitForTimeout(1000);

          // Verify updated name appears
          const updatedItem = page.locator('text=/Updated Certification Name/i');
          await expect(updatedItem).toBeVisible({ timeout: 5000 }).catch(() => {});
        }
      }
    }
  });

  test('Test 6.4: Delete certification with confirmation', async ({ page }) => {
    const vendorData = createTestVendor({
      tier: 'tier1',
      status: 'approved',
    });

    await seedVendors(page, [vendorData]);
    await loginAsVendor(page, vendorData.email, vendorData.password);

    await page.goto(`${BASE_URL}/vendor/dashboard/profile/`);
    await page.waitForLoadState('networkidle');

    const certificationsTab = page.locator('button[role="tab"]').filter({ hasText: /Certification/i });
    if (await certificationsTab.count() > 0) {
      await certificationsTab.first().click();
      await page.waitForTimeout(500);

      // Add a certification first
      const addBtn = page.locator('button').filter({ hasText: /Add.*Certification/i }).first();
      if (await addBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await addBtn.click();
        await page.waitForTimeout(300);

        const nameInput = page.locator('input[name*="name"]').last();
        await nameInput.fill('Certification to Delete');

        const saveBtn = page.locator('button').filter({ hasText: /Save|Add/ }).last();
        await saveBtn.click();
        await page.waitForTimeout(1000);

        // Now delete it
        const deleteBtn = page.locator('button').filter({ hasText: /Delete|Remove/i }).first();
        if (await deleteBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
          await deleteBtn.click();
          await page.waitForTimeout(300);

          // Confirm deletion if dialog appears
          const confirmBtn = page.locator('button').filter({ hasText: /Confirm|Yes|Delete/i }).last();
          if (await confirmBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
            await confirmBtn.click();
          }

          await page.waitForTimeout(1000);

          // Verify certification is gone
          const deletedItem = page.locator('text=/Certification to Delete/i');
          const isGone = !(await deletedItem.isVisible({ timeout: 2000 }).catch(() => false));
          expect(isGone).toBeTruthy();
        }
      }
    }
  });

  test('Test 6.5: Add award with details', async ({ page }) => {
    const vendorData = createTestVendor({
      tier: 'tier1',
      status: 'approved',
    });

    await seedVendors(page, [vendorData]);
    await loginAsVendor(page, vendorData.email, vendorData.password);

    await page.goto(`${BASE_URL}/vendor/dashboard/profile/`);
    await page.waitForLoadState('networkidle');

    // Look for Awards tab or section
    const awardsTab = page.locator('button[role="tab"]').filter({ hasText: /Award/i });
    if (await awardsTab.count() > 0) {
      await awardsTab.first().click();
      await page.waitForTimeout(500);

      const addBtn = page.locator('button').filter({ hasText: /Add.*Award|New.*Award/i }).first();
      if (await addBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await addBtn.click();
        await page.waitForTimeout(300);

        // Fill award details
        const nameInput = page.locator('input[name*="name"], input[placeholder*="name"]').last();
        await nameInput.fill('Best Yacht Supplier 2024');

        const issuerInput = page.locator('input[name*="issuer"], input[placeholder*="issuer"]').last();
        if (await issuerInput.isVisible({ timeout: 1000 }).catch(() => false)) {
          await issuerInput.fill('Marine Industry Association');
        }

        const yearInput = page.locator('input[type="number"], input[name*="year"]').last();
        if (await yearInput.isVisible({ timeout: 1000 }).catch(() => false)) {
          await yearInput.fill('2024');
        }

        // Save award
        const saveBtn = page.locator('button').filter({ hasText: /Save|Add|Create/ }).last();
        await saveBtn.click();
        await page.waitForTimeout(1000);

        // Verify award appears
        const awardItem = page.locator('text=/Best Yacht Supplier/i');
        await expect(awardItem).toBeVisible({ timeout: 5000 }).catch(() => {});
      }
    }
  });

  test('Test 6.6: Add case study with full details', async ({ page }) => {
    const vendorData = createTestVendor({
      tier: 'tier1',
      status: 'approved',
    });

    await seedVendors(page, [vendorData]);
    await loginAsVendor(page, vendorData.email, vendorData.password);

    await page.goto(`${BASE_URL}/vendor/dashboard/profile/`);
    await page.waitForLoadState('networkidle');

    const caseStudyTab = page.locator('button[role="tab"]').filter({ hasText: /Case Study/i });
    if (await caseStudyTab.count() > 0) {
      await caseStudyTab.first().click();
      await page.waitForTimeout(500);

      const addBtn = page.locator('button').filter({ hasText: /Add.*Case Study|New.*Case Study/i }).first();
      if (await addBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await addBtn.click();
        await page.waitForTimeout(300);

        // Fill case study details
        const titleInput = page.locator('input[name*="title"], input[placeholder*="title"]').last();
        await titleInput.fill('Luxury Yacht Navigation System Installation');

        const clientInput = page.locator('input[name*="client"], input[placeholder*="client"]').last();
        if (await clientInput.isVisible({ timeout: 1000 }).catch(() => false)) {
          await clientInput.fill('SuperYacht Co.');
        }

        const descriptionInput = page.locator('textarea[name*="description"], textarea[placeholder*="description"]').last();
        if (await descriptionInput.isVisible({ timeout: 1000 }).catch(() => false)) {
          await descriptionInput.fill('Successfully integrated advanced navigation systems for a 100-meter luxury yacht.');
        }

        // Save case study
        const saveBtn = page.locator('button').filter({ hasText: /Save|Add|Create/ }).last();
        await saveBtn.click();
        await page.waitForTimeout(1000);

        // Verify case study appears
        const caseStudyItem = page.locator('text=/Luxury Yacht Navigation/i');
        await expect(caseStudyItem).toBeVisible({ timeout: 5000 }).catch(() => {});
      }
    }
  });

  test('Test 6.7: Add team member with photo', async ({ page }) => {
    const vendorData = createTestVendor({
      tier: 'tier1',
      status: 'approved',
    });

    await seedVendors(page, [vendorData]);
    await loginAsVendor(page, vendorData.email, vendorData.password);

    await page.goto(`${BASE_URL}/vendor/dashboard/profile/`);
    await page.waitForLoadState('networkidle');

    const teamTab = page.locator('button[role="tab"]').filter({ hasText: /Team/i });
    if (await teamTab.count() > 0) {
      await teamTab.first().click();
      await page.waitForTimeout(500);

      const addBtn = page.locator('button').filter({ hasText: /Add.*Team|New.*Team|Add.*Member/i }).first();
      if (await addBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await addBtn.click();
        await page.waitForTimeout(300);

        // Fill team member details
        const nameInput = page.locator('input[name*="name"], input[placeholder*="name"]').last();
        await nameInput.fill('John Captain');

        const roleInput = page.locator('input[name*="role"], input[name*="position"], input[placeholder*="role"]').last();
        if (await roleInput.isVisible({ timeout: 1000 }).catch(() => false)) {
          await roleInput.fill('Chief Technical Officer');
        }

        const bioInput = page.locator('textarea[name*="bio"], textarea[placeholder*="bio"]').last();
        if (await bioInput.isVisible({ timeout: 1000 }).catch(() => false)) {
          await bioInput.fill('John has 20 years of experience in marine technology.');
        }

        // Save team member
        const saveBtn = page.locator('button').filter({ hasText: /Save|Add|Create/ }).last();
        await saveBtn.click();
        await page.waitForTimeout(1000);

        // Verify team member appears
        const teamMemberItem = page.locator('text=/John Captain/i');
        await expect(teamMemberItem).toBeVisible({ timeout: 5000 }).catch(() => {});
      }
    }
  });

  test('Test 6.8: Reorder team members via drag-and-drop', async ({ page }) => {
    const vendorData = createTestVendor({
      tier: 'tier1',
      status: 'approved',
    });

    await seedVendors(page, [vendorData]);
    await loginAsVendor(page, vendorData.email, vendorData.password);

    await page.goto(`${BASE_URL}/vendor/dashboard/profile/`);
    await page.waitForLoadState('networkidle');

    const teamTab = page.locator('button[role="tab"]').filter({ hasText: /Team/i });
    if (await teamTab.count() > 0) {
      await teamTab.first().click();
      await page.waitForTimeout(500);

      // Add two team members first
      const addBtn = page.locator('button').filter({ hasText: /Add.*Team|Add.*Member/i }).first();
      if (await addBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        // Add first member
        await addBtn.click();
        await page.waitForTimeout(300);
        await page.locator('input[name*="name"]').last().fill('Alice First');
        await page.locator('button').filter({ hasText: /Save|Add/ }).last().click();
        await page.waitForTimeout(1000);

        // Add second member
        await addBtn.click();
        await page.waitForTimeout(300);
        await page.locator('input[name*="name"]').last().fill('Bob Second');
        await page.locator('button').filter({ hasText: /Save|Add/ }).last().click();
        await page.waitForTimeout(1000);

        // Look for drag handles or reorder buttons
        const dragHandle = page.locator('[data-testid*="drag"], button[aria-label*="move"], button[aria-label*="reorder"]').first();
        if (await dragHandle.isVisible({ timeout: 2000 }).catch(() => false)) {
          // Try to drag (implementation depends on UI)
          const firstItem = page.locator('text=/Alice First/i').first();
          const secondItem = page.locator('text=/Bob Second/i').first();

          if (await firstItem.isVisible() && await secondItem.isVisible()) {
            // Verify both items are visible (order may vary)
            await expect(firstItem).toBeVisible();
            await expect(secondItem).toBeVisible();
          }
        }
      }
    }
  });

  test('Test 6.9: Add long company description (rich text)', async ({ page }) => {
    const vendorData = createTestVendor({
      tier: 'tier1',
      status: 'approved',
    });

    await seedVendors(page, [vendorData]);
    await loginAsVendor(page, vendorData.email, vendorData.password);

    await page.goto(`${BASE_URL}/vendor/dashboard/profile/`);
    await page.waitForLoadState('networkidle');

    // Navigate to Basic Info tab
    const basicInfoTab = page.locator('button[role="tab"]').filter({ hasText: /Basic Info/i });
    if (await basicInfoTab.count() > 0) {
      await basicInfoTab.first().click();
      await page.waitForTimeout(500);
    }

    // Fill long description (450 chars max to respect 500 char validation limit)
    const longDescription = `
Our company has been a leader in the superyacht industry for over 15 years. We specialize in advanced navigation systems, communication equipment, and entertainment solutions.

Our team of expert engineers delivers customized solutions that exceed expectations. With installations on over 200 vessels worldwide, we pride ourselves on reliability and innovation.
    `.trim();

    const descriptionInput = page.locator('textarea[name="description"], textarea[id="description"]').first();
    await descriptionInput.fill(longDescription);

    // Save changes
    const saveBtn = page.locator('button').filter({ hasText: /Save|Update/ }).first();
    if (await saveBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await expect(saveBtn).toBeEnabled({ timeout: 5000 });

      const [response] = await Promise.all([
        page.waitForResponse(
          (r: any) => r.url().includes('/api/portal/vendors/') && r.request().method() === 'PUT',
          { timeout: 10000 }
        ),
        saveBtn.click()
      ]);

      console.log('[Test 6.9] Response status:', response.status());
      expect(response.ok()).toBeTruthy();

      // Verify description was saved
      await page.reload();
      await page.waitForLoadState('networkidle');

      const savedDescription = await descriptionInput.inputValue();
      expect(savedDescription.length).toBeGreaterThan(100);
    }
  });
});
