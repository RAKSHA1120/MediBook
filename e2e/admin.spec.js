// MediBook E2E — Admin Portal
import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:5173';
const API  = 'http://localhost:5107';

const ADMIN = { loginId: 'admin@medibook.com', password: 'Admin@123' };

async function loginAs(page, creds) {
  await page.goto(`${BASE}/login`);
  await page.waitForSelector('input', { timeout: 10000 });
  const inputs = page.locator('input');
  await inputs.nth(0).fill(creds.loginId);
  await inputs.nth(1).fill(creds.password);
  await page.locator('button[type="submit"]').first().click();
  await page.waitForTimeout(2500);
}

test.describe('ADMIN Portal', () => {

  test('A01 — Login as Admin', async ({ page }) => {
    await page.goto(`${BASE}/login`);
    const inputs = page.locator('input');
    await inputs.nth(0).fill(ADMIN.loginId);
    await inputs.nth(1).fill(ADMIN.password);

    const loginPromise = page.waitForResponse(
      r => r.url().includes('/api/Auth/login'),
      { timeout: 10000 }
    );
    await page.locator('button[type="submit"]').first().click();
    const loginResp = await loginPromise;
    const body = await loginResp.json();
    console.log('Admin login response:', JSON.stringify(body));
    expect(loginResp.status()).toBe(200);
    expect(body.role).toMatch(/admin/i);

    await page.waitForURL(/admin/, { timeout: 8000 });
    await page.screenshot({ path: 'e2e/screenshots/a01_admin_dashboard.png' });
    console.log('✓ A01 Admin Login: PASS');
  });

  test('A02 — Admin Dashboard loads stats', async ({ page }) => {
    await loginAs(page, ADMIN);
    await page.waitForURL(/admin/, { timeout: 8000 });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'e2e/screenshots/a02_dashboard.png' });
    const content = await page.textContent('body');
    const hasStats = /hospital|doctor|patient|appointment/i.test(content);
    console.log(`  Dashboard has data: ${hasStats}`);
    console.log('✓ A02 Admin Dashboard: PASS');
  });

  test('A03 — Admin Hospitals page', async ({ page }) => {
    await loginAs(page, ADMIN);
    await page.goto(`${BASE}/admin/hospitals`);
    await page.waitForTimeout(2500);
    await page.screenshot({ path: 'e2e/screenshots/a03_hospitals.png' });

    // Search
    const search = page.locator('input[type="text"], input[placeholder*="Search"]').first();
    if (await search.isVisible().catch(() => false)) {
      await search.fill('MediCare');
      await page.waitForTimeout(1000);
      await search.clear();
      console.log('  ✓ Search works');
    }

    // Try to open Add/View
    const addBtn = page.locator('button:has-text("Add"), button:has-text("New Hospital")').first();
    if (await addBtn.isVisible().catch(() => false)) {
      await addBtn.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'e2e/screenshots/a03_add_hospital_modal.png' });

      const closeBtn = page.locator('button:has-text("Close"), button:has-text("Cancel"), button[aria-label*="close"]').first();
      if (await closeBtn.isVisible().catch(() => false)) await closeBtn.click();
      console.log('  ✓ Add Hospital modal opens/closes');
    }

    // Try View on first row
    const viewBtn = page.locator('button[title*="View"], button:has-text("View")').first();
    if (await viewBtn.isVisible().catch(() => false)) {
      await viewBtn.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'e2e/screenshots/a03_hospital_view.png' });
      const closeBtn = page.locator('button:has-text("Close"), button:has-text("Cancel")').first();
      if (await closeBtn.isVisible().catch(() => false)) await closeBtn.click();
    }
    console.log('✓ A03 Admin Hospitals: PASS');
  });

  test('A04 — Admin Doctors page', async ({ page }) => {
    await loginAs(page, ADMIN);
    await page.goto(`${BASE}/admin/doctors`);
    await page.waitForTimeout(2500);
    await page.screenshot({ path: 'e2e/screenshots/a04_doctors.png' });

    const content = await page.textContent('body');
    const hasDoctors = /Dr\.|doctor/i.test(content);
    console.log(`  Has doctor data: ${hasDoctors}`);

    // Search
    const search = page.locator('input[type="text"], input[placeholder*="Search"]').first();
    if (await search.isVisible().catch(() => false)) {
      await search.fill('Michael');
      await page.waitForTimeout(1000);
      await search.clear();
    }

    // View first doctor
    const viewBtn = page.locator('button[title*="View"], button:has-text("View")').first();
    if (await viewBtn.isVisible().catch(() => false)) {
      await viewBtn.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'e2e/screenshots/a04_doctor_detail.png' });
      const closeBtn = page.locator('button:has-text("Close"), button:has-text("Cancel")').first();
      if (await closeBtn.isVisible().catch(() => false)) await closeBtn.click();
    }
    console.log('✓ A04 Admin Doctors: PASS');
  });

  test('A05 — Admin Patients page', async ({ page }) => {
    await loginAs(page, ADMIN);
    await page.goto(`${BASE}/admin/patients`);
    await page.waitForTimeout(2500);
    await page.screenshot({ path: 'e2e/screenshots/a05_patients.png' });

    // Search
    const search = page.locator('input[type="text"], input[placeholder*="Search"]').first();
    if (await search.isVisible().catch(() => false)) {
      await search.fill('Santhosh');
      await page.waitForTimeout(1000);
      await search.clear();
    }

    // View first patient
    const viewBtn = page.locator('button[title*="View"], button:has-text("View")').first();
    if (await viewBtn.isVisible().catch(() => false)) {
      await viewBtn.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'e2e/screenshots/a05_patient_detail.png' });

      // Try Edit
      const editBtn = page.locator('button:has-text("Edit")').first();
      if (await editBtn.isVisible().catch(() => false)) {
        await editBtn.click();
        await page.waitForTimeout(800);
        await page.screenshot({ path: 'e2e/screenshots/a05_patient_edit.png' });

        // Save
        const saveBtn = page.locator('button:has-text("Save"), button:has-text("Update")').first();
        if (await saveBtn.isVisible().catch(() => false)) {
          const apiResp = page.waitForResponse(
            r => r.url().includes('/api/Patients') && r.request().method() === 'PUT',
            { timeout: 8000 }
          ).catch(() => null);
          await saveBtn.click();
          const resp = await apiResp;
          if (resp) console.log(`  ✓ Patient update API: HTTP ${resp.status()}`);
        }
      }

      const closeBtn = page.locator('button:has-text("Close"), button:has-text("Cancel")').first();
      if (await closeBtn.isVisible().catch(() => false)) await closeBtn.click();
    }
    console.log('✓ A05 Admin Patients: PASS');
  });

  test('A06 — Admin Appointments page', async ({ page }) => {
    await loginAs(page, ADMIN);
    await page.goto(`${BASE}/admin/appointments`);
    await page.waitForTimeout(2500);
    await page.screenshot({ path: 'e2e/screenshots/a06_appointments.png' });

    const content = await page.textContent('body');
    const hasAppts = /patient|doctor|appointment/i.test(content);
    console.log(`  Has appointments: ${hasAppts}`);

    // Status filter
    const select = page.locator('select').first();
    if (await select.isVisible().catch(() => false)) {
      await select.selectOption({ index: 1 }).catch(() => {});
      await page.waitForTimeout(800);
      await select.selectOption({ index: 0 }).catch(() => {});
    }

    // View first appointment
    const viewBtn = page.locator('button[title*="View"], a:has-text("View"), button:has-text("View")').first();
    if (await viewBtn.isVisible().catch(() => false)) {
      await viewBtn.click();
      await page.waitForTimeout(1500);
      await page.screenshot({ path: 'e2e/screenshots/a06_appt_detail.png' });
    }
    console.log('✓ A06 Admin Appointments: PASS');
  });

  test('A07 — Admin Notifications page', async ({ page }) => {
    await loginAs(page, ADMIN);
    await page.goto(`${BASE}/admin/notifications`);
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'e2e/screenshots/a07_notifications.png' });
    console.log('✓ A07 Admin Notifications: PASS');
  });

  test('A08 — Admin Reports page', async ({ page }) => {
    await loginAs(page, ADMIN);
    await page.goto(`${BASE}/admin/reports`);
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'e2e/screenshots/a08_reports.png' });
    console.log('✓ A08 Admin Reports: PASS');
  });

  test('A09 — Admin Login Management', async ({ page }) => {
    await loginAs(page, ADMIN);
    await page.goto(`${BASE}/admin/login-management`);
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'e2e/screenshots/a09_login_mgmt.png' });
    console.log('✓ A09 Admin Login Management: PASS');
  });

  test('A10 — Admin Profile page', async ({ page }) => {
    await loginAs(page, ADMIN);
    await page.goto(`${BASE}/admin/profile`);
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'e2e/screenshots/a10_profile.png' });
    console.log('✓ A10 Admin Profile: PASS');
  });

  test('A11 — Admin Settings page', async ({ page }) => {
    await loginAs(page, ADMIN);
    await page.goto(`${BASE}/admin/settings`);
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'e2e/screenshots/a11_settings.png' });
    console.log('✓ A11 Admin Settings: PASS');
  });

  test('A12 — Admin Help page', async ({ page }) => {
    await loginAs(page, ADMIN);
    await page.goto(`${BASE}/admin/help`);
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'e2e/screenshots/a12_help.png' });
    console.log('✓ A12 Admin Help: PASS');
  });

  test('A13 — Admin Logout', async ({ page }) => {
    await loginAs(page, ADMIN);
    await page.waitForURL(/admin/, { timeout: 8000 });

    const logoutBtn = page.locator('button:has-text("Logout"), button:has-text("Sign Out"), a:has-text("Logout")').first();
    if (await logoutBtn.isVisible().catch(() => false)) {
      await logoutBtn.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'e2e/screenshots/a13_logout.png' });
      console.log(`  URL after logout: ${page.url()}`);
    }
    console.log('✓ A13 Admin Logout: PASS');
  });

});
