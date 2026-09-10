import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:5173';

const mockNotifications = [
  {
    id: 101,
    userId: 2,
    title: "Appointment Confirmed",
    message: "Your appointment with Dr. Priya has been confirmed.",
    type: "appointment",
    subType: "confirmed",
    appointmentId: 1,
    isRead: false,
    createdAt: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 102,
    userId: 2,
    title: "Appointment Reminder",
    message: "You have an appointment coming up tomorrow at 10:00 AM.",
    type: "reminder",
    subType: "reminder",
    appointmentId: 1,
    isRead: false,
    createdAt: new Date(Date.now() - 7200000).toISOString()
  },
  {
    id: 103,
    userId: 2,
    title: "System Update",
    message: "Welcome to MediBook Hospital Booking Portal.",
    type: "system",
    subType: "system",
    appointmentId: null,
    isRead: true,
    createdAt: new Date(Date.now() - 86400000).toISOString()
  }
];

test.describe('Patient Notifications - Mark all as read & State Sync', () => {

  test('N01 — Displays unread badges, dots, and handles Mark all as read successfully', async ({ page }) => {
    let currentNotifs = JSON.parse(JSON.stringify(mockNotifications));
    const markedReadIds = [];

    // Mock backend endpoints to ensure test is deterministic
    await page.route('**/api/Notifications/user/*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(currentNotifs)
      });
    });

    await page.route('**/api/Notifications/*/read', async (route) => {
      const url = route.request().url();
      const match = url.match(/\/Notifications\/(\d+)\/read/);
      if (match) {
        const id = parseInt(match[1], 10);
        markedReadIds.push(id);
        const item = currentNotifs.find(n => n.id === id);
        if (item) {
          item.isRead = true;
        }
      }
      await route.fulfill({ status: 204 });
    });

    // Set authenticated patient in sessionStorage
    await page.goto(`${BASE}/login`);
    await page.evaluate(() => {
      const user = {
        id: 2,
        name: "Raksha N",
        email: "patient@medibook.com",
        role: "patient"
      };
      sessionStorage.setItem("medibook_current_user", JSON.stringify(user));
    });

    // Navigate to /notifications
    await page.goto(`${BASE}/notifications`);
    await page.waitForSelector('.notifications-page', { timeout: 10000 });
    await page.waitForSelector('.notification-card', { timeout: 10000 });

    // 1. Check title
    await expect(page.locator('.page-header-title')).toHaveText('Notifications');

    // 2. Check unread count (2 unread items)
    const navbarBadge = page.locator('.navbar-icon-button .notification-badge');
    await expect(navbarBadge).toHaveText('2');

    const sidebarBadge = page.locator('.sidebar-badge-count');
    await expect(sidebarBadge).toHaveText('2');

    // "Mark all as read" button should be present
    const markAllBtn = page.locator('.btn-mark-all-read');
    await expect(markAllBtn).toBeVisible();

    // Check blue unread dots are present (2 unread cards)
    const unreadDots = page.locator('.unread-dot-badge');
    await expect(unreadDots).toHaveCount(2);

    // Take screenshot before click
    await page.screenshot({ path: 'e2e/screenshots/notif_01_before_mark_all.png' });

    // 3. Click "Mark all as read"
    await markAllBtn.click();

    // 4. Verify API calls made for each unread notification
    expect(markedReadIds).toContain(101);
    expect(markedReadIds).toContain(102);

    // 5. Verify success toast appears
    const toastMessage = page.locator('.toast');
    await expect(toastMessage).toBeVisible();
    await expect(toastMessage).toContainText('All notifications marked as read.');

    // 6. Confirm unread dots disappear
    await expect(page.locator('.unread-dot-badge')).toHaveCount(0);

    // 7. Confirm sidebar notification badge disappears
    await expect(page.locator('.sidebar-badge-count')).toHaveCount(0);

    // 8. Confirm navbar notification badge disappears
    await expect(page.locator('.navbar-icon-button .notification-badge')).toHaveCount(0);

    // 9. Confirm "Mark all as read" button disappears
    await expect(page.locator('.btn-mark-all-read')).toHaveCount(0);

    // 10. Confirm cards remain visible in the list (all 3 cards still present)
    const cards = page.locator('.notification-card');
    await expect(cards).toHaveCount(3);

    // Take screenshot after mark all as read
    await page.screenshot({ path: 'e2e/screenshots/notif_02_after_mark_all.png' });

    // 11. Refresh page and confirm notifications remain read
    await page.reload();
    await page.waitForSelector('.notifications-page', { timeout: 10000 });
    await page.waitForSelector('.notification-card', { timeout: 10000 });

    await expect(page.locator('.unread-dot-badge')).toHaveCount(0);
    await expect(page.locator('.navbar-icon-button .notification-badge')).toHaveCount(0);
    await expect(page.locator('.sidebar-badge-count')).toHaveCount(0);
    await expect(page.locator('.notification-card')).toHaveCount(3);
  });

  test('N02 — Individual card click marks only that notification as read', async ({ page }) => {
    let currentNotifs = [
      {
        id: 101,
        userId: 2,
        title: "General Notification 1",
        message: "This notification stays on page when clicked.",
        type: "system",
        subType: "system",
        appointmentId: null,
        isRead: false,
        createdAt: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: 102,
        userId: 2,
        title: "General Notification 2",
        message: "Second unread notification.",
        type: "reminder",
        subType: "reminder",
        appointmentId: null,
        isRead: false,
        createdAt: new Date(Date.now() - 7200000).toISOString()
      }
    ];
    const markedReadIds = [];

    await page.route('**/api/Notifications/user/*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(currentNotifs)
      });
    });

    await page.route('**/api/Notifications/*/read', async (route) => {
      const url = route.request().url();
      const match = url.match(/\/Notifications\/(\d+)\/read/);
      if (match) {
        const id = parseInt(match[1], 10);
        markedReadIds.push(id);
        const item = currentNotifs.find(n => n.id === id);
        if (item) item.isRead = true;
      }
      await route.fulfill({ status: 204 });
    });

    await page.goto(`${BASE}/login`);
    await page.evaluate(() => {
      const user = { id: 2, name: "Raksha N", email: "patient@medibook.com", role: "patient" };
      sessionStorage.setItem("medibook_current_user", JSON.stringify(user));
    });

    await page.goto(`${BASE}/notifications`);
    await page.waitForSelector('.notifications-page', { timeout: 10000 });
    await page.waitForSelector('.notification-card', { timeout: 10000 });

    // Initial unread: 2
    await expect(page.locator('.navbar-icon-button .notification-badge')).toHaveText('2');
    await expect(page.locator('.sidebar-badge-count')).toHaveText('2');
    await expect(page.locator('.unread-dot-badge')).toHaveCount(2);

    // Click on the first notification card (id 101)
    await page.locator('.notification-card').first().click();

    // Verify PUT was called for 101
    expect(markedReadIds).toContain(101);

    // Unread count should drop to 1
    await expect(page.locator('.navbar-icon-button .notification-badge')).toHaveText('1');
    await expect(page.locator('.sidebar-badge-count')).toHaveText('1');
    await expect(page.locator('.unread-dot-badge')).toHaveCount(1);
  });

  test('N03 — Error handling: if a mark-as-read request fails, keep failed item unread and show error toast', async ({ page }) => {
    let currentNotifs = [
      {
        id: 201,
        userId: 2,
        title: "Test Notification 1",
        message: "Message 1",
        type: "appointment",
        isRead: false,
        createdAt: new Date().toISOString()
      },
      {
        id: 202,
        userId: 2,
        title: "Test Notification 2",
        message: "Message 2",
        type: "appointment",
        isRead: false,
        createdAt: new Date().toISOString()
      }
    ];

    await page.route('**/api/Notifications/user/*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(currentNotifs)
      });
    });

    // Fail notification 202
    await page.route('**/api/Notifications/*/read', async (route) => {
      const url = route.request().url();
      if (url.includes('/Notifications/202/read')) {
        await route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ message: "DB Error" }) });
      } else {
        await route.fulfill({ status: 204 });
      }
    });

    await page.goto(`${BASE}/login`);
    await page.evaluate(() => {
      const user = { id: 2, name: "Raksha N", email: "patient@medibook.com", role: "patient" };
      sessionStorage.setItem("medibook_current_user", JSON.stringify(user));
    });

    await page.goto(`${BASE}/notifications`);
    await page.waitForSelector('.notifications-page', { timeout: 10000 });
    await page.waitForSelector('.notification-card', { timeout: 10000 });

    await expect(page.locator('.navbar-icon-button .notification-badge')).toHaveText('2');
    await expect(page.locator('.unread-dot-badge')).toHaveCount(2);

    // Click "Mark all as read"
    await page.locator('.btn-mark-all-read').click();

    // Error toast should show
    const toastMessage = page.locator('.toast');
    await expect(toastMessage).toBeVisible();
    await expect(toastMessage).toContainText('Failed to mark 1 notification as read.');

    // Item 202 should remain unread
    await expect(page.locator('.unread-dot-badge')).toHaveCount(1);
    await expect(page.locator('.navbar-icon-button .notification-badge')).toHaveText('1');
    await expect(page.locator('.sidebar-badge-count')).toHaveText('1');
  });

  test('N04 — Real-time SignalR notification arrives, increments badge, and can be marked as read', async ({ page }) => {
    let currentNotifs = [
      {
        id: 1,
        userId: 2,
        title: "Old Read Notification",
        message: "This notification is already read.",
        type: "system",
        isRead: true,
        createdAt: new Date(Date.now() - 100000).toISOString()
      }
    ];
    const markedReadIds = [];

    await page.route('**/api/Notifications/user/*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(currentNotifs)
      });
    });

    await page.route('**/api/Notifications/*/read', async (route) => {
      const url = route.request().url();
      const match = url.match(/\/Notifications\/(\d+)\/read/);
      if (match) {
        const id = parseInt(match[1], 10);
        markedReadIds.push(id);
        const item = currentNotifs.find(n => n.id === id);
        if (item) item.isRead = true;
      }
      await route.fulfill({ status: 204 });
    });

    await page.goto(`${BASE}/login`);
    await page.evaluate(() => {
      const user = { id: 2, name: "Raksha N", email: "patient@medibook.com", role: "patient" };
      sessionStorage.setItem("medibook_current_user", JSON.stringify(user));
    });

    await page.goto(`${BASE}/notifications`);
    await page.waitForSelector('.notifications-page', { timeout: 10000 });
    await page.waitForSelector('.notification-card', { timeout: 10000 });

    // Initially 0 unread
    await expect(page.locator('.navbar-icon-button .notification-badge')).toHaveCount(0);
    await expect(page.locator('.sidebar-badge-count')).toHaveCount(0);
    await expect(page.locator('.btn-mark-all-read')).toHaveCount(0);

    // Simulate incoming real-time notification via SignalR listener
    await page.evaluate(() => {
      window.__notificationHub?.listeners?.forEach((listener) => {
        listener({
          id: 999,
          userId: 2,
          title: "Appointment Booked",
          message: "Your new appointment has been scheduled.",
          type: "appointment",
          isRead: false,
          createdAt: new Date().toISOString()
        });
      });
    });

    // Unread count should increment to 1 on navbar and sidebar
    await expect(page.locator('.navbar-icon-button .notification-badge')).toHaveText('1');
    await expect(page.locator('.sidebar-badge-count')).toHaveText('1');

    // "Mark all as read" button should become visible
    const markAllBtn = page.locator('.btn-mark-all-read');
    await expect(markAllBtn).toBeVisible();

    // Blue dot should appear on the new card
    await expect(page.locator('.unread-dot-badge')).toHaveCount(1);

    // Click "Mark all as read" on the newly arrived notification
    await markAllBtn.click();

    // Verify PUT /api/Notifications/999/read was called
    expect(markedReadIds).toContain(999);

    // Verify badges and dots disappear
    await expect(page.locator('.navbar-icon-button .notification-badge')).toHaveCount(0);
    await expect(page.locator('.sidebar-badge-count')).toHaveCount(0);
    await expect(page.locator('.unread-dot-badge')).toHaveCount(0);
    await expect(page.locator('.btn-mark-all-read')).toHaveCount(0);
  });

});
