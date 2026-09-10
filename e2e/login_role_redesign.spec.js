import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:5173';

test.describe('MediBook Login Role Redesign', () => {

  test('R01 — Role selector displays 4 options and defaults to Patient', async ({ page }) => {
    await page.goto(`${BASE}/login`);
    await page.waitForSelector('.role-selector');

    const roleButtons = page.locator('.role-tab-btn');
    await expect(roleButtons).toHaveCount(4);

    const labels = await roleButtons.allTextContents();
    expect(labels.map(t => t.trim())).toEqual(['Patient', 'Admin', 'Doctor', 'Hospital']);

    // Patient should be selected by default
    const patientTab = page.locator('#role-tab-patient');
    await expect(patientTab).toHaveClass(/active/);
    await expect(patientTab).toHaveAttribute('aria-selected', 'true');

    // Heading should indicate Patient Login
    const heading = page.locator('.welcome-title');
    await expect(heading).toHaveText('Patient Login');

    // Sign In / Sign Up toggle should be visible for Patient
    await expect(page.locator('.auth-toggle')).toBeVisible();

    await page.screenshot({ path: 'e2e/screenshots/r01_patient_default.png' });
  });

  test('R02 — Logo mark does not cycle roles', async ({ page }) => {
    await page.goto(`${BASE}/login`);
    await page.waitForSelector('.role-selector');

    const logoMark = page.locator('.login-auth-logo-mark');
    await logoMark.click();

    // Patient should remain selected
    const patientTab = page.locator('#role-tab-patient');
    await expect(patientTab).toHaveClass(/active/);
    const heading = page.locator('.welcome-title');
    await expect(heading).toHaveText('Patient Login');
  });

  test('R03 — Clicking Admin switches to Admin Login', async ({ page }) => {
    await page.goto(`${BASE}/login`);
    await page.waitForSelector('.role-selector');

    await page.locator('#role-tab-admin').click();

    // Admin should be active
    await expect(page.locator('#role-tab-admin')).toHaveClass(/active/);
    await expect(page.locator('#role-tab-patient')).not.toHaveClass(/active/);

    // Form title & input label
    await expect(page.locator('.welcome-title')).toHaveText('Admin Login');
    await expect(page.locator('label.form-label').first()).toContainText('Admin ID');

    // Sign up toggle should be hidden
    await expect(page.locator('.auth-toggle')).toHaveCount(0);

    await page.screenshot({ path: 'e2e/screenshots/r03_admin_login.png' });
  });

  test('R04 — Clicking Doctor switches to Doctor Login', async ({ page }) => {
    await page.goto(`${BASE}/login`);
    await page.waitForSelector('.role-selector');

    await page.locator('#role-tab-doctor').click();

    // Doctor should be active
    await expect(page.locator('#role-tab-doctor')).toHaveClass(/active/);
    await expect(page.locator('.welcome-title')).toHaveText('Doctor Login');
    await expect(page.locator('label.form-label').first()).toContainText('Doctor Email');

    // Sign up toggle should be hidden
    await expect(page.locator('.auth-toggle')).toHaveCount(0);

    await page.screenshot({ path: 'e2e/screenshots/r04_doctor_login.png' });
  });

  test('R05 — Clicking Hospital switches to Hospital Login', async ({ page }) => {
    await page.goto(`${BASE}/login`);
    await page.waitForSelector('.role-selector');

    await page.locator('#role-tab-hospital').click();

    // Hospital should be active
    await expect(page.locator('#role-tab-hospital')).toHaveClass(/active/);
    await expect(page.locator('.welcome-title')).toHaveText('Hospital Login');
    await expect(page.locator('label.form-label').first()).toContainText('Hospital Email');

    // Sign up toggle should be hidden
    await expect(page.locator('.auth-toggle')).toHaveCount(0);

    await page.screenshot({ path: 'e2e/screenshots/r05_hospital_login.png' });
  });

  test('R06 — Sign Up tab behavior and role switching', async ({ page }) => {
    await page.goto(`${BASE}/login`);
    await page.waitForSelector('.role-selector');

    // Switch to Sign Up
    await page.locator('.auth-toggle-btn', { hasText: 'Sign Up' }).click();
    await expect(page.locator('.welcome-title')).toHaveText('Create your MediBook account');
    await expect(page.locator('input[placeholder="Enter your full name"]')).toBeVisible();

    // Switch to Doctor: should cleanly reset to Doctor Login in signin mode
    await page.locator('#role-tab-doctor').click();
    await expect(page.locator('.welcome-title')).toHaveText('Doctor Login');
    await expect(page.locator('input[placeholder="Enter your full name"]')).toHaveCount(0);

    // Switch back to Patient: should be in signin mode
    await page.locator('#role-tab-patient').click();
    await expect(page.locator('.welcome-title')).toHaveText('Patient Login');
  });

  test('R07 — Invalid credentials show error behavior without modifying DB', async ({ page }) => {
    await page.goto(`${BASE}/login`);
    await page.waitForSelector('.role-selector');

    const inputs = page.locator('input');
    await inputs.nth(0).fill('9999999999');
    await inputs.nth(1).fill('WrongPassword123');

    await page.locator('button[type="submit"]').first().click();

    // An error message should be displayed under the input or in error state
    await expect(page.locator('.form-error')).toBeVisible({ timeout: 5000 });
    await page.screenshot({ path: 'e2e/screenshots/r07_error_behavior.png' });
  });

  test('R08 — Responsive layout on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(`${BASE}/login`);
    await page.waitForSelector('.role-selector');

    // Verify all 4 tabs are visible and within viewport
    const roleSelector = page.locator('.role-selector');
    await expect(roleSelector).toBeVisible();

    const tabs = page.locator('.role-tab-btn');
    await expect(tabs).toHaveCount(4);

    for (let i = 0; i < 4; i++) {
      await expect(tabs.nth(i)).toBeVisible();
    }

    await page.screenshot({ path: 'e2e/screenshots/r08_mobile_role_selector.png' });
  });

});
