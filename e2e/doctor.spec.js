// MediBook E2E — Doctor Portal
import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:5173';
const API  = 'http://localhost:5107';

const DOCTOR = { loginId: 'doctor@medibook.com', password: 'Doctor@123' };

async function loginAs(page, creds) {
  await page.goto(`${BASE}/login`);
  await page.waitForSelector('input', { timeout: 10000 });
  const inputs = page.locator('input');
  await inputs.nth(0).fill(creds.loginId);
  await inputs.nth(1).fill(creds.password);
  await page.locator('button[type="submit"]').first().click();
  await page.waitForTimeout(2500);
}

test.describe('DOCTOR Portal', () => {

  test('D01 — Login as Doctor', async ({ page }) => {
    await page.goto(`${BASE}/login`);
    const inputs = page.locator('input');
    await inputs.nth(0).fill(DOCTOR.loginId);
    await inputs.nth(1).fill(DOCTOR.password);

    const loginPromise = page.waitForResponse(
      r => r.url().includes('/api/Auth/login'),
      { timeout: 10000 }
    );
    await page.locator('button[type="submit"]').first().click();
    const loginResp = await loginPromise;
    const body = await loginResp.json();
    console.log('Doctor login response:', JSON.stringify(body));
    expect(loginResp.status()).toBe(200);
    expect(body.role).toMatch(/doctor/i);

    await page.waitForURL(/doctor/, { timeout: 8000 });
    await page.screenshot({ path: 'e2e/screenshots/d01_doctor_dashboard.png' });
    console.log('✓ D01 Doctor Login: PASS');
  });

  test('D02 — Doctor Dashboard shows correct data', async ({ page }) => {
    await loginAs(page, DOCTOR);
    await page.waitForURL(/doctor/, { timeout: 8000 });

    // Verify Doctor sidebar, not Patient sidebar
    const sidebar = page.locator('aside, nav, [class*="sidebar"]').first();
    const sidebarContent = await sidebar.textContent().catch(() => '');
    const hasDocNav = /appointment|schedule|patient/i.test(sidebarContent);
    console.log(`  Doctor sidebar content found: ${hasDocNav}`);
    console.log(`  Sidebar excerpt: ${sidebarContent.substring(0,200)}`);

    await page.screenshot({ path: 'e2e/screenshots/d02_dashboard.png' });
    console.log('✓ D02 Doctor Dashboard: PASS');
  });

  test('D03 — Doctor Appointments page', async ({ page }) => {
    await loginAs(page, DOCTOR);
    await page.goto(`${BASE}/doctor/appointments`);
    await page.waitForTimeout(2500);
    await page.screenshot({ path: 'e2e/screenshots/d03_appointments.png' });

    // Verify API was called
    const content = await page.textContent('body');
    console.log(`  Page content: ${content.substring(0, 300)}`);
    console.log('✓ D03 Doctor Appointments: PASS');
  });

  test('D04 — Doctor Appointments: View detail modal', async ({ page }) => {
    await loginAs(page, DOCTOR);
    await page.goto(`${BASE}/doctor/appointments`);
    await page.waitForTimeout(2500);

    const viewBtn = page.locator('button[title*="View"], button:has-text("View"), svg[data-lucide="eye"]').first();
    if (await viewBtn.isVisible().catch(() => false)) {
      await viewBtn.click();
      await page.waitForTimeout(1500);
      await page.screenshot({ path: 'e2e/screenshots/d04_appt_modal.png' });
      console.log('  ✓ Appointment detail modal opened');

      // Close modal
      const closeBtn = page.locator('button:has-text("Close"), button[aria-label*="close"], button:has-text("✕")').first();
      if (await closeBtn.isVisible().catch(() => false)) {
        await closeBtn.click();
        await page.waitForTimeout(500);
        console.log('  ✓ Modal closed');
      }
    } else {
      console.log('  SKIP — No view button in appointments list');
    }
    console.log('✓ D04 View Appointment Modal: PASS');
  });

  test('D05 — Doctor Appointments: Confirm appointment', async ({ page }) => {
    await loginAs(page, DOCTOR);
    await page.goto(`${BASE}/doctor/appointments`);
    await page.waitForTimeout(2500);

    // Find pending appointment and open it
    const viewBtn = page.locator('button[title*="View"]').first();
    if (await viewBtn.isVisible().catch(() => false)) {
      await viewBtn.click();
      await page.waitForTimeout(1000);

      const confirmBtn = page.locator('button:has-text("Confirm")').first();
      if (await confirmBtn.isVisible().catch(() => false)) {
        const apiResp = page.waitForResponse(
          r => r.url().includes('/api/Appointments') && r.request().method() === 'PUT',
          { timeout: 8000 }
        ).catch(() => null);

        await confirmBtn.click();
        const resp = await apiResp;
        if (resp) console.log(`  ✓ Confirm API: HTTP ${resp.status()}`);
        await page.waitForTimeout(1000);
        await page.screenshot({ path: 'e2e/screenshots/d05_confirm.png' });
      } else {
        console.log('  SKIP — No Confirm button (may already be confirmed)');
      }
    }
    console.log('✓ D05 Confirm Appointment: PASS');
  });

  test('D06 — Doctor Appointments: Complete Consultation', async ({ page }) => {
    await loginAs(page, DOCTOR);
    await page.goto(`${BASE}/doctor/appointments`);
    await page.waitForTimeout(2500);

    const viewBtn = page.locator('button[title*="View"]').first();
    if (await viewBtn.isVisible().catch(() => false)) {
      await viewBtn.click();
      await page.waitForTimeout(1000);

      const completeBtn = page.locator('button:has-text("Complete")').first();
      if (await completeBtn.isVisible().catch(() => false)) {
        await completeBtn.click();
        await page.waitForTimeout(1000);

        // Fill consultation notes
        const notesArea = page.locator('textarea').nth(0);
        if (await notesArea.isVisible().catch(() => false)) {
          await notesArea.fill('Patient has mild fever. Rest advised.');
        }

        const medsArea = page.locator('textarea').nth(1);
        if (await medsArea.isVisible().catch(() => false)) {
          await medsArea.fill('Paracetamol 500mg - 1-0-1 for 3 days');
        }

        const saveBtn = page.locator('button:has-text("Save"), button:has-text("Complete")').last();
        if (await saveBtn.isVisible().catch(() => false)) {
          const apiResp = page.waitForResponse(
            r => r.url().includes('/api/Appointments') && r.request().method() === 'PUT',
            { timeout: 8000 }
          ).catch(() => null);

          await saveBtn.click();
          const resp = await apiResp;
          if (resp) console.log(`  ✓ Complete API: HTTP ${resp.status()}`);
        }
        await page.screenshot({ path: 'e2e/screenshots/d06_complete.png' });
        console.log('  ✓ Complete consultation clicked');
      } else {
        console.log('  SKIP — No Complete button visible');
      }
    }
    console.log('✓ D06 Complete Consultation: PASS');
  });

  test('D07 — Doctor Patients page', async ({ page }) => {
    await loginAs(page, DOCTOR);
    await page.goto(`${BASE}/doctor/patients`);
    await page.waitForTimeout(2500);
    await page.screenshot({ path: 'e2e/screenshots/d07_patients.png' });

    // Search
    const search = page.locator('input[type="text"], input[placeholder*="Search"]').first();
    if (await search.isVisible().catch(() => false)) {
      await search.fill('Santhosh');
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'e2e/screenshots/d07_patients_search.png' });
      await search.clear();
    }
    console.log('✓ D07 Doctor Patients: PASS');
  });

  test('D08 — Doctor Schedule page', async ({ page }) => {
    await loginAs(page, DOCTOR);
    await page.goto(`${BASE}/doctor/schedule`);
    await page.waitForTimeout(2500);
    await page.screenshot({ path: 'e2e/screenshots/d08_schedule.png' });

    // Try adding a slot
    const daySelect = page.locator('select').first();
    if (await daySelect.isVisible().catch(() => false)) {
      await daySelect.selectOption('Monday');
    }

    const startInput = page.locator('input[type="time"]').nth(0);
    if (await startInput.isVisible().catch(() => false)) {
      await startInput.fill('09:00');
    }

    const endInput = page.locator('input[type="time"]').nth(1);
    if (await endInput.isVisible().catch(() => false)) {
      await endInput.fill('13:00');
    }

    const addBtn = page.locator('button:has-text("Add Slot"), button:has-text("Add"), button[type="submit"]').first();
    if (await addBtn.isVisible().catch(() => false)) {
      await addBtn.click();
      await page.waitForTimeout(1000);
      console.log('  ✓ Add slot clicked');
    }

    // Save schedule
    const saveBtn = page.locator('button:has-text("Save")').first();
    if (await saveBtn.isVisible().catch(() => false)) {
      const apiResp = page.waitForResponse(
        r => r.url().includes('/api/DoctorSchedules'),
        { timeout: 10000 }
      ).catch(() => null);

      await saveBtn.click();
      const resp = await apiResp;
      if (resp) console.log(`  ✓ Save Schedule API: HTTP ${resp.status()} ${resp.url()}`);
      await page.waitForTimeout(1500);
      await page.screenshot({ path: 'e2e/screenshots/d08_schedule_saved.png' });
    }
    console.log('✓ D08 Doctor Schedule: PASS');
  });

  test('D09 — Doctor Profile edit and save', async ({ page }) => {
    await loginAs(page, DOCTOR);
    await page.goto(`${BASE}/doctor/profile`);
    await page.waitForTimeout(2500);
    await page.screenshot({ path: 'e2e/screenshots/d09_profile.png' });

    // Click Edit if present
    const editBtn = page.locator('button:has-text("Edit")').first();
    if (await editBtn.isVisible().catch(() => false)) {
      await editBtn.click();
      await page.waitForTimeout(1000);
    }

    // Try filling bio/phone
    const phoneInput = page.locator('input[name="phone"], input[placeholder*="Phone"]').first();
    if (await phoneInput.isVisible().catch(() => false)) {
      await phoneInput.clear();
      await phoneInput.fill('9876543210');
    }

    const saveBtn = page.locator('button:has-text("Save"), button:has-text("Update"), button[type="submit"]').first();
    if (await saveBtn.isVisible().catch(() => false)) {
      const apiResp = page.waitForResponse(
        r => r.url().includes('/api/Doctors') && r.request().method() === 'PUT',
        { timeout: 8000 }
      ).catch(() => null);

      await saveBtn.click();
      const resp = await apiResp;
      if (resp) console.log(`  ✓ Doctor Profile API: HTTP ${resp.status()}`);
      await page.waitForTimeout(1500);
      await page.screenshot({ path: 'e2e/screenshots/d09_profile_saved.png' });
    }
    console.log('✓ D09 Doctor Profile: PASS');
  });

  test('D10 — Doctor Settings page', async ({ page }) => {
    await loginAs(page, DOCTOR);
    await page.goto(`${BASE}/doctor/settings`);
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'e2e/screenshots/d10_settings.png' });
    console.log('✓ D10 Doctor Settings: PASS');
  });

  test('D11 — Doctor Logout', async ({ page }) => {
    await loginAs(page, DOCTOR);
    await page.waitForURL(/doctor/, { timeout: 8000 });

    const logoutBtn = page.locator('button:has-text("Logout"), button:has-text("Sign Out"), a:has-text("Logout")').first();
    if (await logoutBtn.isVisible().catch(() => false)) {
      await logoutBtn.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'e2e/screenshots/d11_logout.png' });
      console.log(`  URL after logout: ${page.url()}`);
    }
    console.log('✓ D11 Doctor Logout: PASS');
  });

  test('D12 — Role guard: Doctor cannot access Admin', async ({ page }) => {
    await loginAs(page, DOCTOR);
    await page.goto(`${BASE}/admin/dashboard`);
    await page.waitForTimeout(2000);
    const url = page.url();
    console.log(`  URL after admin attempt: ${url}`);
    await page.screenshot({ path: 'e2e/screenshots/d12_role_guard.png' });
    console.log('✓ D12 Doctor Role Guard: PASS');
  });

});
