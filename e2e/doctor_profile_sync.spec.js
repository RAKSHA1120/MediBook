import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:5173';
const API_BASE = 'http://localhost:5107/api';

test.describe('Doctor Profile Data Synchronization', () => {

  test('Doctor Profile displays real registered data and no fake defaults', async ({ page }) => {
    // 1. Query existing Hospitals API to determine the actual HospitalId for "KSR H1"
    const hospRes = await fetch(`${API_BASE}/Hospitals`);
    expect(hospRes.ok).toBeTruthy();
    const hospitals = await hospRes.json();
    const ksrH1 = hospitals.find(h => h.name.trim().toLowerCase() === 'ksr h1');
    expect(ksrH1).toBeTruthy();
    const actualHospitalId = ksrH1.id;
    console.log(`[TEST] Resolved KSR H1 Hospital ID dynamically: ${actualHospitalId}`);

    // 2. Create a Doctor account with registration details
    const timestamp = Date.now();
    const doctorEmail = `doc.sync.${timestamp}@ksr.com`;
    const doctorPassword = 'Password123!';
    const doctorName = 'Ravi Sync';

    const userRes = await fetch(`${API_BASE}/Users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: doctorName,
        email: doctorEmail,
        password: doctorPassword,
        role: 'doctor'
      })
    });
    expect(userRes.ok).toBeTruthy();
    const user = await userRes.json();

    const docRes = await fetch(`${API_BASE}/Doctors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user.id,
        name: doctorName,
        qualification: 'MBBS',
        specialty: 'General Medicine',
        experience: 5,
        email: doctorEmail,
        phone: '9876543210',
        dob: '1996-05-20',
        isActive: true,
        hospitalId: actualHospitalId
      })
    });
    expect(docRes.ok).toBeTruthy();
    const doc = await docRes.json();
    console.log(`[TEST] Doctor registered: DoctorId=${doc.id}, UserId=${user.id}`);

    // 3. Login as Doctor through UI
    await page.goto(`${BASE}/login`);
    await page.waitForSelector('.role-selector');
    await page.locator('#role-tab-doctor').click();
    await expect(page.locator('#role-tab-doctor')).toHaveClass(/active/);

    const inputs = page.locator('input');
    await inputs.nth(0).fill(doctorEmail);
    await page.locator('#password').fill(doctorPassword);
    await page.locator('button[type="submit"]').click();

    // Should navigate to /doctor/dashboard
    await page.waitForURL('**/doctor/dashboard', { timeout: 10000 });

    // 4. Navigate to Doctor Profile
    await page.goto(`${BASE}/doctor/profile`);
    await page.waitForSelector('.doctor-profile-page');
    await page.waitForTimeout(1000); // allow API fetch to settle

    const profileText = await page.innerText('.doctor-profile-page');

    // 5. Verify real data matches
    expect(profileText).toContain('Ravi Sync');
    expect(profileText).toContain('MBBS');
    expect(profileText).toContain('General Medicine');
    expect(profileText).toContain('5 Years');
    expect(profileText).toContain('KSR H1');
    expect(profileText).toContain('9876543210');
    expect(profileText).toContain(doctorEmail);

    // 6. Verify fake / mock defaults are absent
    expect(profileText).not.toContain('MD, DM');
    expect(profileText).not.toContain('City Heart Center');
    expect(profileText).not.toContain('12 Years');
    expect(profileText).not.toContain('REG-2018-94821');
    expect(profileText).not.toContain('8041234567');
    expect(profileText).not.toContain('Sarah Smith');

    console.log('[TEST] Doctor Profile real data verified successfully!');
  });

  test('Non-regression: Admin, Hospital, and Patient login work correctly', async ({ page }) => {
    // 1. Admin login
    await page.goto(`${BASE}/login`);
    await page.waitForSelector('.role-selector');
    await page.locator('#role-tab-admin').click();
    const adminInputs = page.locator('input');
    await adminInputs.nth(0).fill('admin@medibook.com');
    await page.locator('#password').fill('Admin@123');
    await page.locator('button[type="submit"]').click();
    await page.waitForURL('**/admin/dashboard', { timeout: 10000 });
    console.log('[TEST] Admin login confirmed.');

    // Clear session for next login
    await page.evaluate(() => sessionStorage.clear());

    // 2. Hospital login
    await page.goto(`${BASE}/login`);
    await page.waitForSelector('.role-selector');
    await page.locator('#role-tab-hospital').click();
    const hospInputs = page.locator('input');
    await hospInputs.nth(0).fill('hospital@medibook.com');
    await page.locator('#password').fill('Hospital@123');
    await page.locator('button[type="submit"]').click();
    await page.waitForURL('**/hospital/dashboard', { timeout: 10000 });
    console.log('[TEST] Hospital login confirmed.');

    // Clear session for next login
    await page.evaluate(() => sessionStorage.clear());

    // 3. Patient login
    await page.goto(`${BASE}/login`);
    await page.waitForSelector('.role-selector');
    await page.locator('#role-tab-patient').click();
    const patInputs = page.locator('input');
    await patInputs.nth(0).fill('patient@medibook.com');
    await page.locator('#password').fill('Patient@123');
    await page.locator('button[type="submit"]').click();
    await page.waitForURL('**/patient-dashboard', { timeout: 10000 });
    console.log('[TEST] Patient login confirmed.');
  });
});
