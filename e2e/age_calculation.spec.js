import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:5173';

test.describe('Automatic Age Calculation from Date of Birth (Patient Profile)', () => {

  test.beforeEach(async ({ page }) => {
    // Navigate to login and seed session for Patient
    await page.goto(`${BASE}/login`);
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
        dob: '1995-01-01',
        address: '123 Healthcare Ave',
        city: 'Chennai',
        state: 'Tamil Nadu',
        pincode: '600017'
      }));
    });
  });

  test('AC01 — Existing patient: DOB display format and auto-calculated Age on load', async ({ page }) => {
    await page.goto(`${BASE}/profile`);
    await page.waitForSelector('.profile-section-card');

    // Verify view mode contains Date of Birth and Age fields
    const dobLabel = page.locator('.profile-field-group', { hasText: 'Date of Birth' });
    const ageLabel = page.locator('.profile-field-group', { hasText: 'Age' });

    await expect(dobLabel).toBeVisible();
    await expect(ageLabel).toBeVisible();

    // Verify that Age is a valid numeric value derived from DOB
    const ageValue = await ageLabel.locator('.field-value-text').innerText();
    expect(parseInt(ageValue, 10)).toBeGreaterThan(0);
  });

  test('AC02 — Edit Profile: Age field is read-only / disabled and cannot be typed into', async ({ page }) => {
    await page.goto(`${BASE}/profile`);
    await page.waitForSelector('.profile-section-card');

    // Click Edit Profile
    await page.locator('button', { hasText: 'Edit Profile' }).click();

    const ageInput = page.locator('#input-age');
    await expect(ageInput).toBeVisible();
    await expect(ageInput).toHaveAttribute('readonly', '');
    await expect(ageInput).toBeDisabled();

    // Attempting to type into disabled/read-only age field should not change value
    const initialAge = await ageInput.inputValue();
    await ageInput.focus().catch(() => {});
    await page.keyboard.type('99').catch(() => {});
    expect(await ageInput.inputValue()).toBe(initialAge);
  });

  test('AC03 — Real-time Age updates upon DOB change, birthday milestones, and leap years', async ({ page }) => {
    await page.goto(`${BASE}/profile`);
    await page.waitForSelector('.profile-section-card');
    await page.locator('button', { hasText: 'Edit Profile' }).click();

    const dobInput = page.locator('#input-dob');
    const ageInput = page.locator('#input-age');

    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1; // 1-12
    const currentDay = today.getDate(); // 1-31

    // Helper to format YYYY-MM-DD
    const fmt = (y, m, d) => `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

    // Case 1: Birthday is EXACTLY today (born 20 years ago today)
    const exactBirthdayDob = fmt(currentYear - 20, currentMonth, currentDay);
    await dobInput.fill(exactBirthdayDob);
    expect(await ageInput.inputValue()).toBe('20');

    // Case 2: Birthday is ONE DAY BEFORE today (birthday already passed this year -> completed 20 years)
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const dayBeforeDob = fmt(currentYear - 20, yesterday.getMonth() + 1, yesterday.getDate());
    await dobInput.fill(dayBeforeDob);
    expect(await ageInput.inputValue()).toBe('20');

    // Case 3: Birthday is ONE DAY AFTER today (birthday has NOT occurred yet this year -> 19 years)
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const dayAfterDob = fmt(currentYear - 20, tomorrow.getMonth() + 1, tomorrow.getDate());
    await dobInput.fill(dayAfterDob);
    expect(await ageInput.inputValue()).toBe('19');

    // Case 4: Several months before today (birthday passed -> 20 years)
    // If today is September (9), 20-02-2006 is February (passed -> 20)
    await dobInput.fill('2006-02-20');
    // Calculate expected for 2006-02-20
    const expectedFeb = (currentMonth > 2 || (currentMonth === 2 && currentDay >= 20)) ? currentYear - 2006 : currentYear - 2006 - 1;
    expect(await ageInput.inputValue()).toBe(String(expectedFeb));

    // Case 5: Several months after today (birthday not yet reached -> age - 1)
    await dobInput.fill('2006-10-20');
    const expectedOct = (currentMonth > 10 || (currentMonth === 10 && currentDay >= 20)) ? currentYear - 2006 : currentYear - 2006 - 1;
    expect(await ageInput.inputValue()).toBe(String(expectedOct));

    // Case 6: Leap-year DOB: 2004-02-29
    await dobInput.fill('2004-02-29');
    const expectedLeap = (currentMonth > 2 || (currentMonth === 2 && currentDay >= 29)) ? currentYear - 2004 : currentYear - 2004 - 1;
    expect(await ageInput.inputValue()).toBe(String(expectedLeap));
  });

  test('AC04 — Clearing DOB clears Age immediately and triggers required validation', async ({ page }) => {
    await page.goto(`${BASE}/profile`);
    await page.waitForSelector('.profile-section-card');
    await page.locator('button', { hasText: 'Edit Profile' }).click();

    const dobInput = page.locator('#input-dob');
    const ageInput = page.locator('#input-age');

    // Clear DOB
    await dobInput.fill('');
    expect(await ageInput.inputValue()).toBe('');

    // Try to save changes with empty DOB
    await page.locator('button', { hasText: 'Save Changes' }).click();
    await expect(page.locator('.field-error-text').filter({ hasText: /Date of Birth is required/i })).toBeVisible();
    await page.locator('button', { hasText: 'Cancel' }).click();
  });

  test('AC05 — Future DOB shows validation error and clears Age', async ({ page }) => {
    await page.goto(`${BASE}/profile`);
    await page.waitForSelector('.profile-section-card');
    await page.locator('button', { hasText: 'Edit Profile' }).click();

    const dobInput = page.locator('#input-dob');
    const ageInput = page.locator('#input-age');

    // Set future date (next year)
    const nextYear = new Date().getFullYear() + 1;
    await dobInput.fill(`${nextYear}-01-01`);

    expect(await ageInput.inputValue()).toBe('');
    await expect(page.locator('.field-error-text').filter({ hasText: /Date of Birth cannot be in the future/i })).toBeVisible();

    // Try to save changes with future DOB
    await page.locator('button', { hasText: 'Save Changes' }).click();
    await expect(page.locator('.field-error-text').filter({ hasText: /Date of Birth cannot be in the future/i })).toBeVisible();
    await page.locator('button', { hasText: 'Cancel' }).click();
  });

  test('AC06 — Saving profile persists DOB & calculated Age; refreshing retains consistent state', async ({ page }) => {
    await page.goto(`${BASE}/profile`);
    await page.waitForSelector('.profile-section-card');
    await page.locator('button', { hasText: 'Edit Profile' }).click();

    const dobInput = page.locator('#input-dob');
    const ageInput = page.locator('#input-age');

    // Set DOB to 2000-05-15
    await dobInput.fill('2000-05-15');
    const expectedAge = await ageInput.inputValue();
    expect(parseInt(expectedAge, 10)).toBeGreaterThan(0);

    // Save profile
    await page.locator('button', { hasText: 'Save Changes' }).click();
    await expect(page.locator('.toast-container')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('.toast-container')).toContainText(/Profile updated successfully/i);

    // Verify View mode has formatted DOB (15-05-2000) and calculated Age
    const dobLabel = page.locator('.profile-field-group', { hasText: 'Date of Birth' });
    const ageLabel = page.locator('.profile-field-group', { hasText: 'Age' });

    await expect(dobLabel.locator('.field-value-text')).toHaveText('15-05-2000');
    await expect(ageLabel.locator('.field-value-text')).toHaveText(expectedAge);

    // Refresh page and confirm persistence
    await page.reload();
    await page.waitForSelector('.profile-section-card');

    await expect(dobLabel.locator('.field-value-text')).toHaveText('15-05-2000');
    await expect(ageLabel.locator('.field-value-text')).toHaveText(expectedAge);
  });

});
