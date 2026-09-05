# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: admin.spec.js >> ADMIN Portal >> A13 — Admin Logout
- Location: e2e\admin.spec.js:246:3

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
          - textbox "Enter 10-digit mobile number" [ref=e42]
        - generic [ref=e43]:
          - generic [ref=e44]:
            - generic [ref=e45]: Password *
            - link "Forgot password?" [ref=e46] [cursor=pointer]:
              - /url: "#forgot"
          - generic [ref=e47]:
            - textbox "Password *" [ref=e50]:
              - /placeholder: Enter your password
            - button [ref=e51] [cursor=pointer]
        - generic [ref=e56] [cursor=pointer]:
          - checkbox "✓ Remember me"
          - generic [ref=e57]: ✓
          - generic [ref=e58]: Remember me
        - button "Sign In" [ref=e60] [cursor=pointer]
      - generic [ref=e61]:
        - generic [ref=e62]: Or continue with
        - generic [ref=e64]:
          - button "Google" [disabled] [ref=e65]
          - button "Microsoft" [disabled] [ref=e71]
    - generic [ref=e77]:
      - generic [ref=e78]: © 2026 MediBook. All rights reserved.
      - generic [ref=e79]:
        - link "Terms of Service" [ref=e80] [cursor=pointer]:
          - /url: "#terms"
        - link "Privacy Policy" [ref=e81] [cursor=pointer]:
          - /url: "#privacy"
```

# Test source

```ts
  148 |         await page.waitForTimeout(800);
  149 |         await page.screenshot({ path: 'e2e/screenshots/a05_patient_edit.png' });
  150 | 
  151 |         // Save
  152 |         const saveBtn = page.locator('button:has-text("Save"), button:has-text("Update")').first();
  153 |         if (await saveBtn.isVisible().catch(() => false)) {
  154 |           const apiResp = page.waitForResponse(
  155 |             r => r.url().includes('/api/Patients') && r.request().method() === 'PUT',
  156 |             { timeout: 8000 }
  157 |           ).catch(() => null);
  158 |           await saveBtn.click();
  159 |           const resp = await apiResp;
  160 |           if (resp) console.log(`  ✓ Patient update API: HTTP ${resp.status()}`);
  161 |         }
  162 |       }
  163 | 
  164 |       const closeBtn = page.locator('button:has-text("Close"), button:has-text("Cancel")').first();
  165 |       if (await closeBtn.isVisible().catch(() => false)) await closeBtn.click();
  166 |     }
  167 |     console.log('✓ A05 Admin Patients: PASS');
  168 |   });
  169 | 
  170 |   test('A06 — Admin Appointments page', async ({ page }) => {
  171 |     await loginAs(page, ADMIN);
  172 |     await page.goto(`${BASE}/admin/appointments`);
  173 |     await page.waitForTimeout(2500);
  174 |     await page.screenshot({ path: 'e2e/screenshots/a06_appointments.png' });
  175 | 
  176 |     const content = await page.textContent('body');
  177 |     const hasAppts = /patient|doctor|appointment/i.test(content);
  178 |     console.log(`  Has appointments: ${hasAppts}`);
  179 | 
  180 |     // Status filter
  181 |     const select = page.locator('select').first();
  182 |     if (await select.isVisible().catch(() => false)) {
  183 |       await select.selectOption({ index: 1 }).catch(() => {});
  184 |       await page.waitForTimeout(800);
  185 |       await select.selectOption({ index: 0 }).catch(() => {});
  186 |     }
  187 | 
  188 |     // View first appointment
  189 |     const viewBtn = page.locator('button[title*="View"], a:has-text("View"), button:has-text("View")').first();
  190 |     if (await viewBtn.isVisible().catch(() => false)) {
  191 |       await viewBtn.click();
  192 |       await page.waitForTimeout(1500);
  193 |       await page.screenshot({ path: 'e2e/screenshots/a06_appt_detail.png' });
  194 |     }
  195 |     console.log('✓ A06 Admin Appointments: PASS');
  196 |   });
  197 | 
  198 |   test('A07 — Admin Notifications page', async ({ page }) => {
  199 |     await loginAs(page, ADMIN);
  200 |     await page.goto(`${BASE}/admin/notifications`);
  201 |     await page.waitForTimeout(1500);
  202 |     await page.screenshot({ path: 'e2e/screenshots/a07_notifications.png' });
  203 |     console.log('✓ A07 Admin Notifications: PASS');
  204 |   });
  205 | 
  206 |   test('A08 — Admin Reports page', async ({ page }) => {
  207 |     await loginAs(page, ADMIN);
  208 |     await page.goto(`${BASE}/admin/reports`);
  209 |     await page.waitForTimeout(1500);
  210 |     await page.screenshot({ path: 'e2e/screenshots/a08_reports.png' });
  211 |     console.log('✓ A08 Admin Reports: PASS');
  212 |   });
  213 | 
  214 |   test('A09 — Admin Login Management', async ({ page }) => {
  215 |     await loginAs(page, ADMIN);
  216 |     await page.goto(`${BASE}/admin/login-management`);
  217 |     await page.waitForTimeout(2000);
  218 |     await page.screenshot({ path: 'e2e/screenshots/a09_login_mgmt.png' });
  219 |     console.log('✓ A09 Admin Login Management: PASS');
  220 |   });
  221 | 
  222 |   test('A10 — Admin Profile page', async ({ page }) => {
  223 |     await loginAs(page, ADMIN);
  224 |     await page.goto(`${BASE}/admin/profile`);
  225 |     await page.waitForTimeout(1500);
  226 |     await page.screenshot({ path: 'e2e/screenshots/a10_profile.png' });
  227 |     console.log('✓ A10 Admin Profile: PASS');
  228 |   });
  229 | 
  230 |   test('A11 — Admin Settings page', async ({ page }) => {
  231 |     await loginAs(page, ADMIN);
  232 |     await page.goto(`${BASE}/admin/settings`);
  233 |     await page.waitForTimeout(1500);
  234 |     await page.screenshot({ path: 'e2e/screenshots/a11_settings.png' });
  235 |     console.log('✓ A11 Admin Settings: PASS');
  236 |   });
  237 | 
  238 |   test('A12 — Admin Help page', async ({ page }) => {
  239 |     await loginAs(page, ADMIN);
  240 |     await page.goto(`${BASE}/admin/help`);
  241 |     await page.waitForTimeout(1500);
  242 |     await page.screenshot({ path: 'e2e/screenshots/a12_help.png' });
  243 |     console.log('✓ A12 Admin Help: PASS');
  244 |   });
  245 | 
  246 |   test('A13 — Admin Logout', async ({ page }) => {
  247 |     await loginAs(page, ADMIN);
> 248 |     await page.waitForURL(/admin/, { timeout: 8000 });
      |                ^ TimeoutError: page.waitForURL: Timeout 8000ms exceeded.
  249 | 
  250 |     const logoutBtn = page.locator('button:has-text("Logout"), button:has-text("Sign Out"), a:has-text("Logout")').first();
  251 |     if (await logoutBtn.isVisible().catch(() => false)) {
  252 |       await logoutBtn.click();
  253 |       await page.waitForTimeout(2000);
  254 |       await page.screenshot({ path: 'e2e/screenshots/a13_logout.png' });
  255 |       console.log(`  URL after logout: ${page.url()}`);
  256 |     }
  257 |     console.log('✓ A13 Admin Logout: PASS');
  258 |   });
  259 | 
  260 | });
  261 | 
```