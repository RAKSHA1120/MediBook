# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: admin.spec.js >> ADMIN Portal >> A02 — Admin Dashboard loads stats
- Location: e2e\admin.spec.js:43:3

# Error details

```
TimeoutError: page.waitForURL: Timeout 8000ms exceeded.
=========================== logs ===========================
waiting for navigation until "load"
============================================================
```

# Page snapshot

```yaml
- generic [ref=e4]:
  - generic [ref=e5]:
    - img "Hospital Background"
    - generic [ref=e6]:
      - heading "Manage Healthcare Better, Together" [level=2] [ref=e7]: Manage HealthcareBetter, Together
      - paragraph [ref=e8]: MediBook helps patients easily find specialists, book consultations, and manage health records securely.
    - generic [ref=e9]:
      - generic [ref=e10]: Secure Data Protection
      - generic [ref=e15]: Instant Appointment Booking
      - generic [ref=e21]: Connected Care Platform
  - generic [ref=e25]:
    - generic [ref=e26]:
      - generic "Toggle Login Mode" [ref=e27] [cursor=pointer]
      - generic [ref=e31]: MediBook
    - generic [ref=e32]:
      - generic [ref=e33]:
        - heading "Welcome to MediBook" [level=1] [ref=e34]
        - paragraph [ref=e35]: Sign in to access your healthcare management dashboard.
      - generic [ref=e36]:
        - button "Sign In" [ref=e37] [cursor=pointer]
        - button "Sign Up" [ref=e38] [cursor=pointer]
      - generic [ref=e39]:
        - generic [ref=e40]:
          - generic [ref=e41]: Mobile Number*
          - textbox "Enter 10-digit mobile number" [ref=e42]: admin@medibook.com
        - generic [ref=e43]:
          - generic [ref=e44]:
            - generic [ref=e45]: Password *
            - link "Forgot password?" [ref=e46] [cursor=pointer]:
              - /url: "#forgot"
          - generic [ref=e47]:
            - textbox "Password *" [ref=e50]:
              - /placeholder: Enter your password
              - text: Admin@123
            - button [ref=e51] [cursor=pointer]
        - generic [ref=e56] [cursor=pointer]:
          - checkbox "✓ Remember me"
          - generic [ref=e57]: ✓
          - generic [ref=e58]: Remember me
        - generic [ref=e59]:
          - button "Loading..." [disabled]
      - generic [ref=e60]:
        - generic [ref=e61]: Or continue with
        - generic [ref=e63]:
          - button "Google" [disabled] [ref=e64]
          - button "Microsoft" [disabled] [ref=e70]
    - generic [ref=e76]:
      - generic [ref=e77]: © 2026 MediBook. All rights reserved.
      - generic [ref=e78]:
        - link "Terms of Service" [ref=e79] [cursor=pointer]:
          - /url: "#terms"
        - link "Privacy Policy" [ref=e80] [cursor=pointer]:
          - /url: "#privacy"
```

# Test source

```ts
  1   | // MediBook E2E — Admin Portal
  2   | import { test, expect } from '@playwright/test';
  3   | 
  4   | const BASE = 'http://localhost:5173';
  5   | const API  = 'http://localhost:5107';
  6   | 
  7   | const ADMIN = { loginId: 'admin@medibook.com', password: 'Admin@123' };
  8   | 
  9   | async function loginAs(page, creds) {
  10  |   await page.goto(`${BASE}/login`);
  11  |   await page.waitForSelector('input', { timeout: 10000 });
  12  |   const inputs = page.locator('input');
  13  |   await inputs.nth(0).fill(creds.loginId);
  14  |   await inputs.nth(1).fill(creds.password);
  15  |   await page.locator('button[type="submit"]').first().click();
  16  |   await page.waitForTimeout(2500);
  17  | }
  18  | 
  19  | test.describe('ADMIN Portal', () => {
  20  | 
  21  |   test('A01 — Login as Admin', async ({ page }) => {
  22  |     await page.goto(`${BASE}/login`);
  23  |     const inputs = page.locator('input');
  24  |     await inputs.nth(0).fill(ADMIN.loginId);
  25  |     await inputs.nth(1).fill(ADMIN.password);
  26  | 
  27  |     const loginPromise = page.waitForResponse(
  28  |       r => r.url().includes('/api/Auth/login'),
  29  |       { timeout: 10000 }
  30  |     );
  31  |     await page.locator('button[type="submit"]').first().click();
  32  |     const loginResp = await loginPromise;
  33  |     const body = await loginResp.json();
  34  |     console.log('Admin login response:', JSON.stringify(body));
  35  |     expect(loginResp.status()).toBe(200);
  36  |     expect(body.role).toMatch(/admin/i);
  37  | 
  38  |     await page.waitForURL(/admin/, { timeout: 8000 });
  39  |     await page.screenshot({ path: 'e2e/screenshots/a01_admin_dashboard.png' });
  40  |     console.log('✓ A01 Admin Login: PASS');
  41  |   });
  42  | 
  43  |   test('A02 — Admin Dashboard loads stats', async ({ page }) => {
  44  |     await loginAs(page, ADMIN);
> 45  |     await page.waitForURL(/admin/, { timeout: 8000 });
      |                ^ TimeoutError: page.waitForURL: Timeout 8000ms exceeded.
  46  |     await page.waitForTimeout(2000);
  47  |     await page.screenshot({ path: 'e2e/screenshots/a02_dashboard.png' });
  48  |     const content = await page.textContent('body');
  49  |     const hasStats = /hospital|doctor|patient|appointment/i.test(content);
  50  |     console.log(`  Dashboard has data: ${hasStats}`);
  51  |     console.log('✓ A02 Admin Dashboard: PASS');
  52  |   });
  53  | 
  54  |   test('A03 — Admin Hospitals page', async ({ page }) => {
  55  |     await loginAs(page, ADMIN);
  56  |     await page.goto(`${BASE}/admin/hospitals`);
  57  |     await page.waitForTimeout(2500);
  58  |     await page.screenshot({ path: 'e2e/screenshots/a03_hospitals.png' });
  59  | 
  60  |     // Search
  61  |     const search = page.locator('input[type="text"], input[placeholder*="Search"]').first();
  62  |     if (await search.isVisible().catch(() => false)) {
  63  |       await search.fill('MediCare');
  64  |       await page.waitForTimeout(1000);
  65  |       await search.clear();
  66  |       console.log('  ✓ Search works');
  67  |     }
  68  | 
  69  |     // Try to open Add/View
  70  |     const addBtn = page.locator('button:has-text("Add"), button:has-text("New Hospital")').first();
  71  |     if (await addBtn.isVisible().catch(() => false)) {
  72  |       await addBtn.click();
  73  |       await page.waitForTimeout(1000);
  74  |       await page.screenshot({ path: 'e2e/screenshots/a03_add_hospital_modal.png' });
  75  | 
  76  |       const closeBtn = page.locator('button:has-text("Close"), button:has-text("Cancel"), button[aria-label*="close"]').first();
  77  |       if (await closeBtn.isVisible().catch(() => false)) await closeBtn.click();
  78  |       console.log('  ✓ Add Hospital modal opens/closes');
  79  |     }
  80  | 
  81  |     // Try View on first row
  82  |     const viewBtn = page.locator('button[title*="View"], button:has-text("View")').first();
  83  |     if (await viewBtn.isVisible().catch(() => false)) {
  84  |       await viewBtn.click();
  85  |       await page.waitForTimeout(1000);
  86  |       await page.screenshot({ path: 'e2e/screenshots/a03_hospital_view.png' });
  87  |       const closeBtn = page.locator('button:has-text("Close"), button:has-text("Cancel")').first();
  88  |       if (await closeBtn.isVisible().catch(() => false)) await closeBtn.click();
  89  |     }
  90  |     console.log('✓ A03 Admin Hospitals: PASS');
  91  |   });
  92  | 
  93  |   test('A04 — Admin Doctors page', async ({ page }) => {
  94  |     await loginAs(page, ADMIN);
  95  |     await page.goto(`${BASE}/admin/doctors`);
  96  |     await page.waitForTimeout(2500);
  97  |     await page.screenshot({ path: 'e2e/screenshots/a04_doctors.png' });
  98  | 
  99  |     const content = await page.textContent('body');
  100 |     const hasDoctors = /Dr\.|doctor/i.test(content);
  101 |     console.log(`  Has doctor data: ${hasDoctors}`);
  102 | 
  103 |     // Search
  104 |     const search = page.locator('input[type="text"], input[placeholder*="Search"]').first();
  105 |     if (await search.isVisible().catch(() => false)) {
  106 |       await search.fill('Michael');
  107 |       await page.waitForTimeout(1000);
  108 |       await search.clear();
  109 |     }
  110 | 
  111 |     // View first doctor
  112 |     const viewBtn = page.locator('button[title*="View"], button:has-text("View")').first();
  113 |     if (await viewBtn.isVisible().catch(() => false)) {
  114 |       await viewBtn.click();
  115 |       await page.waitForTimeout(1000);
  116 |       await page.screenshot({ path: 'e2e/screenshots/a04_doctor_detail.png' });
  117 |       const closeBtn = page.locator('button:has-text("Close"), button:has-text("Cancel")').first();
  118 |       if (await closeBtn.isVisible().catch(() => false)) await closeBtn.click();
  119 |     }
  120 |     console.log('✓ A04 Admin Doctors: PASS');
  121 |   });
  122 | 
  123 |   test('A05 — Admin Patients page', async ({ page }) => {
  124 |     await loginAs(page, ADMIN);
  125 |     await page.goto(`${BASE}/admin/patients`);
  126 |     await page.waitForTimeout(2500);
  127 |     await page.screenshot({ path: 'e2e/screenshots/a05_patients.png' });
  128 | 
  129 |     // Search
  130 |     const search = page.locator('input[type="text"], input[placeholder*="Search"]').first();
  131 |     if (await search.isVisible().catch(() => false)) {
  132 |       await search.fill('Santhosh');
  133 |       await page.waitForTimeout(1000);
  134 |       await search.clear();
  135 |     }
  136 | 
  137 |     // View first patient
  138 |     const viewBtn = page.locator('button[title*="View"], button:has-text("View")').first();
  139 |     if (await viewBtn.isVisible().catch(() => false)) {
  140 |       await viewBtn.click();
  141 |       await page.waitForTimeout(1000);
  142 |       await page.screenshot({ path: 'e2e/screenshots/a05_patient_detail.png' });
  143 | 
  144 |       // Try Edit
  145 |       const editBtn = page.locator('button:has-text("Edit")').first();
```