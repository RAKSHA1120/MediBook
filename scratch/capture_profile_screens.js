import { chromium } from '@playwright/test';

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  // Navigate and seed patient session
  await page.goto('http://localhost:5173/login');
  await page.evaluate(() => {
    sessionStorage.setItem('medibook_current_user', JSON.stringify({
      id: 1,
      name: 'Raksha',
      role: 'Patient',
      refId: 1,
      mobile: '9876543210',
      phone: '9876543210',
      gender: 'Female'
    }));
    localStorage.setItem('medibook_profile_1', JSON.stringify({
      id: 1,
      name: 'Raksha',
      role: 'Patient',
      refId: 1,
      phone: '9876543210',
      mobile: '9876543210',
      email: 'raksha@example.com',
      gender: 'Female',
      bloodGroup: 'O+',
      dob: '2006-02-20',
      address: '123 Healthcare Ave',
      city: 'Chennai',
      state: 'Tamil Nadu',
      pincode: '600017'
    }));
  });

  await page.goto('http://localhost:5173/profile');
  await page.waitForSelector('.profile-section-card');
  await page.waitForTimeout(500);

  // 1. Capture View Mode
  await page.screenshot({ path: 'C:/Users/raksh/.gemini/antigravity-ide/brain/4d2f7a79-7865-4d5e-b974-d56002b93b35/age_01_profile_view_mode.png', fullPage: true });

  // 2. Click Edit Profile
  await page.locator('button', { hasText: 'Edit Profile' }).click();
  await page.waitForSelector('#input-age');
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'C:/Users/raksh/.gemini/antigravity-ide/brain/4d2f7a79-7865-4d5e-b974-d56002b93b35/age_02_profile_edit_mode.png', fullPage: true });

  // 3. Change DOB to test real-time update
  await page.locator('#input-dob').fill('2000-05-15');
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'C:/Users/raksh/.gemini/antigravity-ide/brain/4d2f7a79-7865-4d5e-b974-d56002b93b35/age_03_profile_recalculated.png', fullPage: true });

  await browser.close();
  console.log('Screenshots captured successfully.');
})();
