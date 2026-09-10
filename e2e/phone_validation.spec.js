import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:5173';

test.describe('Global 10-Digit Phone Number Validation', () => {

  test('PV01 — Patient Sign Up: input attributes and typing restrictions', async ({ page }) => {
    await page.goto(`${BASE}/login`);
    await page.waitForSelector('.role-selector');

    // Switch to Sign Up tab
    const signUpTab = page.locator('.auth-toggle-btn', { hasText: 'Sign Up' });
    await signUpTab.click();

    // Find the mobile number input
    const mobileInput = page.locator('input[placeholder="Enter 10-digit mobile number"]');
    await expect(mobileInput).toBeVisible();

    // 1. Verify attributes
    await expect(mobileInput).toHaveAttribute('type', 'tel');
    await expect(mobileInput).toHaveAttribute('inputmode', 'numeric');
    await expect(mobileInput).toHaveAttribute('maxlength', '10');

    // 2. Typing non-numeric characters should be prevented or filtered
    await mobileInput.click();
    await page.keyboard.type('abc!@#');
    expect(await mobileInput.inputValue()).toBe('');

    // 3. Typing digits should work up to 10 characters
    await page.keyboard.type('9876543210123'); // 13 chars
    expect(await mobileInput.inputValue()).toBe('9876543210'); // Capped at 10
  });

  test('PV02 — Patient Sign Up: Validation feedback on invalid formats and blocking submission', async ({ page }) => {
    await page.goto(`${BASE}/login`);
    const signUpTab = page.locator('.auth-toggle-btn', { hasText: 'Sign Up' });
    await signUpTab.click();

    const nameInput = page.locator('input[placeholder="Enter your full name"]');
    const ageInput = page.locator('input[placeholder="e.g. 32"]');
    const genderSelect = page.locator('select').first();
    const mobileInput = page.locator('input[placeholder="Enter 10-digit mobile number"]');
    const passwordInput = page.locator('#password');
    const confirmPasswordInput = page.locator('#confirmPassword');
    const submitBtn = page.locator('button[type="submit"]');

    await nameInput.fill('John Doe');
    await ageInput.fill('30');
    await genderSelect.selectOption('Male');
    await passwordInput.fill('MediBook@123');
    await confirmPasswordInput.fill('MediBook@123');
    await page.locator('label.checkbox').click();

    // 1. Test 9 digits (123456789) -> rejected
    await mobileInput.fill('123456789');
    await submitBtn.click();
    await expect(page.locator('.form-error').filter({ hasText: /Phone number must be exactly 10 digits\./i })).toBeVisible();

    // 2. Test empty value -> required field error
    await mobileInput.fill('');
    await submitBtn.click();
    await expect(page.locator('.form-error').filter({ hasText: /Mobile number is required\./i })).toBeVisible();

    // 3. Test valid 10 digits (9876543210) -> error is cleared
    await mobileInput.fill('9876543210');
    await expect(page.locator('.form-error').filter({ hasText: /Phone number must be exactly 10 digits\./i })).toHaveCount(0);
  });

  test('PV03 — Paste handling: tests all specified paste conditions', async ({ page }) => {
    await page.goto(`${BASE}/login`);
    const signUpTab = page.locator('.auth-toggle-btn', { hasText: 'Sign Up' });
    await signUpTab.click();

    const mobileInput = page.locator('input[placeholder="Enter 10-digit mobile number"]');

    // Case 1: Paste "9876543210" -> accepted
    await mobileInput.evaluate((el) => {
      const dt = new DataTransfer();
      dt.setData('text/plain', '9876543210');
      el.dispatchEvent(new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true }));
    });
    expect(await mobileInput.inputValue()).toBe('9876543210');

    // Case 2: Paste "98765432101" (11 digits) -> must not result in an 11-digit phone value
    await mobileInput.evaluate((el) => {
      const dt = new DataTransfer();
      dt.setData('text/plain', '98765432101');
      el.dispatchEvent(new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true }));
    });
    const val11 = await mobileInput.inputValue();
    expect(val11.length).toBeLessThanOrEqual(10);
    expect(val11).not.toBe('98765432101');

    // Case 3: Paste "+919876543210" -> must not result in a valid phone value
    await mobileInput.evaluate((el) => {
      const dt = new DataTransfer();
      dt.setData('text/plain', '+919876543210');
      el.dispatchEvent(new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true }));
    });
    const valPlus = await mobileInput.inputValue();
    expect(valPlus).not.toBe('9876543210');
    expect(/^[0-9]{10}$/.test(valPlus)).toBe(false);

    // Case 4: Paste "98765abc10" -> must not result in a valid phone value
    await mobileInput.evaluate((el) => {
      const dt = new DataTransfer();
      dt.setData('text/plain', '98765abc10');
      el.dispatchEvent(new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true }));
    });
    const valAlpha = await mobileInput.inputValue();
    expect(valAlpha).toBe('9876510');
    expect(/^[0-9]{10}$/.test(valAlpha)).toBe(false);
  });

  test('PV04 — Patient Sign In: Dual-mode handling for mobile vs email', async ({ page }) => {
    await page.goto(`${BASE}/login`);
    const loginInput = page.locator('input[placeholder="Enter 10-digit mobile or email"]');
    const passwordInput = page.locator('#password');
    const submitBtn = page.locator('button[type="submit"]');

    await passwordInput.fill('MediBook@123');

    // 1. Enter invalid mobile (9 digits: 123456789) -> rejected as phone number
    await loginInput.fill('123456789');
    await submitBtn.click();
    await expect(page.locator('.form-error').filter({ hasText: /Phone number must be exactly 10 digits\./i })).toBeVisible();

    // 2. Enter invalid mobile (+919876543210) -> rejected as phone number
    await loginInput.fill('+919876543210');
    await submitBtn.click();
    await expect(page.locator('.form-error').filter({ hasText: /Phone number must be exactly 10 digits\./i })).toBeVisible();

    // 3. Enter email address (contains @) -> should NOT trigger phone number validation
    await loginInput.fill('testpatient@example.com');
    await submitBtn.click();
    await expect(page.locator('.form-error').filter({ hasText: /Phone number must be exactly 10 digits\./i })).toHaveCount(0);
  });

  test('PV05 — Forgot Password Modal: Registered mobile validation', async ({ page }) => {
    await page.goto(`${BASE}/login`);

    // Click Forgot password link
    await page.locator('.forgot-password-link').click();

    // Verify modal is open
    const modal = page.locator('.modal-container');
    await expect(modal).toBeVisible();

    const resetMobileInput = page.locator('#reset-mobile-input');
    await expect(resetMobileInput).toHaveAttribute('type', 'tel');
    await expect(resetMobileInput).toHaveAttribute('inputmode', 'numeric');
    await expect(resetMobileInput).toHaveAttribute('maxlength', '10');

    // Test typing non-numeric characters
    await resetMobileInput.click();
    await page.keyboard.type('abc!@#');
    expect(await resetMobileInput.inputValue()).toBe('');

    // Fill invalid 9-digit mobile and attempt submit
    await resetMobileInput.fill('987654321');
    const newPwdInput = page.locator('#reset-new-password-input');
    const confirmPwdInput = page.locator('#reset-confirm-password-input');
    await newPwdInput.fill('MediBook@123');
    await confirmPwdInput.fill('MediBook@123');

    await modal.locator('button[type="submit"]').click();
    await expect(modal.locator('.form-error').filter({ hasText: /Phone number must be exactly 10 digits\./i })).toBeVisible();
  });

  test('PV06 — Patient Profile Edit: Mobile number validation & attributes', async ({ page }) => {
    await page.goto(`${BASE}/login`);
    await page.evaluate(() => {
      sessionStorage.setItem('medibook_current_user', JSON.stringify({
        id: 1,
        name: 'Raksha',
        role: 'Patient',
        refId: 1
      }));
    });

    await page.goto(`${BASE}/profile`);
    await page.waitForSelector('.profile-section-card');

    // Click Edit Profile
    const editBtn = page.locator('button', { hasText: 'Edit Profile' });
    await editBtn.click();

    const phoneInput = page.locator('#input-phone');
    await expect(phoneInput).toBeVisible();
    await expect(phoneInput).toHaveAttribute('type', 'tel');
    await expect(phoneInput).toHaveAttribute('inputmode', 'numeric');
    await expect(phoneInput).toHaveAttribute('maxlength', '10');

    // Enter 9 digits and try to save -> rejected
    await phoneInput.fill('987654321');
    await page.locator('button', { hasText: 'Save Changes' }).click();
    await expect(page.locator('.field-error-text').filter({ hasText: /Phone number must be exactly 10 digits\./i })).toBeVisible();

    // Enter valid 10 digits -> error cleared
    await phoneInput.fill('9876543210');
    await expect(page.locator('.field-error-text').filter({ hasText: /Phone number must be exactly 10 digits\./i })).toHaveCount(0);
  });

  test('PV07 — Settings Page: Mobile number validation & attributes', async ({ page }) => {
    await page.goto(`${BASE}/login`);
    await page.evaluate(() => {
      sessionStorage.setItem('medibook_current_user', JSON.stringify({
        id: 1,
        name: 'Raksha',
        role: 'Patient',
        refId: 1
      }));
    });

    await page.goto(`${BASE}/settings`);
    await page.waitForSelector('.settings-page');

    // Click Edit Profile button in Account Settings card
    const editBtn = page.locator('button', { hasText: 'Edit Profile' }).first();
    await editBtn.click();

    const phoneInput = page.locator('#settings-phone');
    await expect(phoneInput).toBeVisible();
    await expect(phoneInput).toHaveAttribute('type', 'tel');
    await expect(phoneInput).toHaveAttribute('inputmode', 'numeric');
    await expect(phoneInput).toHaveAttribute('maxlength', '10');

    // Enter invalid 9 digits and try to save
    await phoneInput.fill('123456789');
    await page.locator('.settings-section-card button', { hasText: 'Save Changes' }).click();
    await expect(page.locator('.toast-container')).toBeVisible();
    await expect(page.locator('.toast-container')).toContainText(/Phone number must be exactly 10 digits\./i);
  });

});
