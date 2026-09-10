import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:5173';
const API_BASE = 'http://localhost:5107';

test.describe('Strong Password Requirements & Reset Flow', () => {

  test('PR01 — Patient Sign Up: Displays real-time checklist and 3-level strength meter', async ({ page }) => {
    await page.goto(`${BASE}/login`);
    await page.waitForSelector('.role-selector');

    // Switch to Sign Up tab
    const signUpTab = page.locator('.auth-toggle-btn', { hasText: 'Sign Up' });
    await signUpTab.click();
    await expect(signUpTab).toHaveClass(/active/);

    // Verify PasswordStrengthIndicator is present
    const strengthContainer = page.locator('.password-strength-container');
    await expect(strengthContainer).toBeVisible();

    const passwordInput = page.locator('#password');

    // 1. Test "123456" (6 chars, only digits) -> Weak
    await passwordInput.fill('123456');
    await expect(page.locator('[data-testid="password-strength-badge"]')).toHaveText('Weak');
    await expect(page.locator('[data-testid="criteria-length"]')).toHaveClass(/criteria-unmet/);
    await expect(page.locator('[data-testid="criteria-upper"]')).toHaveClass(/criteria-unmet/);
    await expect(page.locator('[data-testid="criteria-lower"]')).toHaveClass(/criteria-unmet/);
    await expect(page.locator('[data-testid="criteria-number"]')).toHaveClass(/criteria-met/);
    await expect(page.locator('[data-testid="criteria-special"]')).toHaveClass(/criteria-unmet/);

    // 2. Test "password" (8 chars, lowercase only) -> Weak
    await passwordInput.fill('password');
    await expect(page.locator('[data-testid="password-strength-badge"]')).toHaveText('Weak');
    await expect(page.locator('[data-testid="criteria-length"]')).toHaveClass(/criteria-met/);
    await expect(page.locator('[data-testid="criteria-lower"]')).toHaveClass(/criteria-met/);
    await expect(page.locator('[data-testid="criteria-upper"]')).toHaveClass(/criteria-unmet/);
    await expect(page.locator('[data-testid="criteria-number"]')).toHaveClass(/criteria-unmet/);
    await expect(page.locator('[data-testid="criteria-special"]')).toHaveClass(/criteria-unmet/);

    // 3. Test "Password123" (8+ chars, upper, lower, number, but NO special char) -> Medium
    await passwordInput.fill('Password123');
    await expect(page.locator('[data-testid="password-strength-badge"]')).toHaveText('Medium');
    await expect(page.locator('[data-testid="criteria-length"]')).toHaveClass(/criteria-met/);
    await expect(page.locator('[data-testid="criteria-upper"]')).toHaveClass(/criteria-met/);
    await expect(page.locator('[data-testid="criteria-lower"]')).toHaveClass(/criteria-met/);
    await expect(page.locator('[data-testid="criteria-number"]')).toHaveClass(/criteria-met/);
    await expect(page.locator('[data-testid="criteria-special"]')).toHaveClass(/criteria-unmet/);

    // Try submitting with weak password -> blocked by validation
    await page.locator('button[type="submit"]').click();
    await expect(page.locator('.form-error').filter({ hasText: /strong password/i })).toBeVisible();

    // 4. Test "MediBook@123" (satisfies all 5 criteria) -> Strong
    await passwordInput.fill('MediBook@123');
    await expect(page.locator('[data-testid="password-strength-badge"]')).toHaveText('Strong');
    await expect(page.locator('[data-testid="criteria-length"]')).toHaveClass(/criteria-met/);
    await expect(page.locator('[data-testid="criteria-upper"]')).toHaveClass(/criteria-met/);
    await expect(page.locator('[data-testid="criteria-lower"]')).toHaveClass(/criteria-met/);
    await expect(page.locator('[data-testid="criteria-number"]')).toHaveClass(/criteria-met/);
    await expect(page.locator('[data-testid="criteria-special"]')).toHaveClass(/criteria-met/);

    // 5. Test Confirm Password mismatch
    const confirmInput = page.locator('#confirmPassword');
    await confirmInput.fill('MediBook@999');
    await page.locator('button[type="submit"]').click();
    await expect(page.locator('.form-error').filter({ hasText: /passwords do not match/i })).toBeVisible();

    await page.screenshot({ path: 'e2e/screenshots/pr01_patient_signup_rules.png' });
  });

  test('PR02 — Patient Forgot Password: Controlled setup validates strong password rules & reset modal', async ({ page }) => {
    // Intercept reset-password API with controlled test setup (DO NOT change seeded database passwords)
    let resetPayload = null;
    await page.route('**/api/Users/reset-password', async (route) => {
      resetPayload = route.request().postDataJSON();
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Password has been reset successfully.' }),
      });
    });

    await page.goto(`${BASE}/login`);
    await page.waitForSelector('.role-selector');

    // Click "Forgot password?" link
    const forgotLink = page.locator('.forgot-password-link');
    await expect(forgotLink).toBeVisible();
    await forgotLink.click();

    // Modal opens
    const modal = page.locator('.reset-password-modal');
    await expect(modal).toBeVisible();
    await expect(modal.locator('.modal-title')).toHaveText('Reset Patient Password');

    // Verify PasswordStrengthIndicator is inside the modal
    const modalStrength = modal.locator('.password-strength-container');
    await expect(modalStrength).toBeVisible();

    // Enter weak password in modal
    const mobileInput = modal.locator('#reset-mobile-input');
    const newPwdInput = modal.locator('#reset-new-password-input');
    const confirmPwdInput = modal.locator('#reset-confirm-password-input');

    await mobileInput.fill('9876543210');
    await newPwdInput.fill('weakpass');
    await confirmPwdInput.fill('weakpass');

    // Submit -> blocked by validation
    await modal.locator('#confirm-reset-btn').click();
    await expect(modal.locator('.form-error').filter({ hasText: /strong password/i })).toBeVisible();
    await page.screenshot({ path: 'e2e/screenshots/pr02_modal_open_weak_password.png' });
    expect(resetPayload).toBeNull(); // API was never called with weak password

    // Now fill strong password with mismatch
    await newPwdInput.fill('StrongPass@2026');
    await confirmPwdInput.fill('StrongPass@Mismatch');
    await modal.locator('#confirm-reset-btn').click();
    await expect(modal.locator('.form-error').filter({ hasText: /passwords do not match/i })).toBeVisible();
    expect(resetPayload).toBeNull();

    // Now fill matching strong password
    await confirmPwdInput.fill('StrongPass@2026');
    await modal.locator('#confirm-reset-btn').click();

    // Verify API called with controlled test payload
    await expect(modal).not.toBeVisible();
    expect(resetPayload).toEqual({
      mobile: '9876543210',
      newPassword: 'StrongPass@2026',
    });

    // Verify success banner displayed on Login page
    const successBanner = page.locator('.auth-success-banner');
    await expect(successBanner).toBeVisible();
    await expect(successBanner).toContainText('Password has been reset successfully!');

    await page.screenshot({ path: 'e2e/screenshots/pr02_patient_reset_success.png' });
  });

  test('PR03 — Backend API: Rejects weak registration and weak patient reset', async ({ request }) => {
    // 1. Backend register rejects weak password
    const regResWeak = await request.post(`${API_BASE}/api/Auth/register`, {
      data: {
        name: 'Safe Test User',
        mobile: '0000000000',
        password: 'weak',
        gender: 'Male',
        age: 30,
      },
    });
    expect(regResWeak.status()).toBe(400);
    const regWeakJson = await regResWeak.json();
    expect(regWeakJson.message).toMatch(/at least 8 characters/i);

    // 2. Backend register rejects missing special character
    const regResNoSpecial = await request.post(`${API_BASE}/api/Auth/register`, {
      data: {
        name: 'Safe Test User',
        mobile: '0000000000',
        password: 'Password123',
        gender: 'Male',
        age: 30,
      },
    });
    expect(regResNoSpecial.status()).toBe(400);
    const regNoSpecialJson = await regResNoSpecial.json();
    expect(regNoSpecialJson.message).toMatch(/special character/i);

    // 3. Backend reset-password validates mobile or loginId is required
    const resetResMissingId = await request.post(`${API_BASE}/api/Users/reset-password`, {
      data: {
        mobile: '',
        newPassword: 'MediBook@123',
      },
    });
    expect(resetResMissingId.status()).toBe(400);
    const missingIdJson = await resetResMissingId.json();
    expect(missingIdJson.message).toMatch(/mobile number or login id is required/i);
  });

  test('PR04 — Existing Login: Normal login does not enforce password strength', async ({ page }) => {
    await page.goto(`${BASE}/login`);
    await page.waitForSelector('.role-selector');

    // On normal sign-in tab, strength indicator must NOT be visible
    await expect(page.locator('.auth-toggle-btn.active')).toHaveText('Sign In');
    await expect(page.locator('.password-strength-container')).not.toBeVisible();

    // Password input field does not block typing existing passwords
    const pwdInput = page.locator('#password');
    await pwdInput.fill('ExistingPassword');
    // Still not visible
    await expect(page.locator('.password-strength-container')).not.toBeVisible();
  });

  test('PR05 — Role Isolation: Doctor, Hospital, Admin do not show forgot password modal or patient password rules', async ({ page }) => {
    await page.goto(`${BASE}/login`);

    // Switch to Doctor
    await page.locator('#role-tab-doctor').click();
    await expect(page.locator('.welcome-title')).toHaveText('Doctor Login');
    // Password strength indicator is not present
    await expect(page.locator('.password-strength-container')).not.toBeVisible();

    // Switch to Admin
    await page.locator('#role-tab-admin').click();
    await expect(page.locator('.welcome-title')).toHaveText('Admin Login');
    // Forgot password link is not shown for Admin
    await expect(page.locator('.forgot-password-link')).not.toBeVisible();

    // Switch to Hospital
    await page.locator('#role-tab-hospital').click();
    await expect(page.locator('.welcome-title')).toHaveText('Hospital Login');
    await expect(page.locator('.password-strength-container')).not.toBeVisible();
  });

});
