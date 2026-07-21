import { test, expect } from '../../fixtures/auth';
import { env } from '../../helpers/env';
import { waitForHealth } from '../../helpers/health';
import { waitForFrontend } from '../../helpers/frontend';
import { users } from '../../data/users';
import { AdminDashboardPage } from '../../pages/AdminDashboardPage';
import { AdminUsersPage } from '../../pages/AdminUsersPage';
import { AdminWarningsPage } from '../../pages/AdminWarningsPage';
import { AdminContentPage } from '../../pages/AdminContentPage';
import { ensureStudentUnlocked, safeCleanup } from '../../helpers/apiCleanup';

test.describe('admin', () => {
  test.skip(
    !env.requireServices,
    'Set REQUIRE_SERVICES=true and start frontend + backend (with db:seed:demo)',
  );

  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async () => {
    test.setTimeout(90_000);
    await waitForHealth({ timeoutMs: 15_000 });
    await waitForFrontend({ timeoutMs: 15_000 });
  });

  test('admin can open dashboard overview', async ({ page, asAdmin }) => {
    void asAdmin;
    const dashboard = new AdminDashboardPage(page);
    await dashboard.goto();
    await dashboard.expectLoaded();
  });

  test('admin can search users and see locked Sam', async ({ page, asAdmin }) => {
    void asAdmin;
    const usersPage = new AdminUsersPage(page);
    await usersPage.goto();

    await usersPage.search('alex.demo');
    await usersPage.expectUserStatus('alex.demo@loopi.com', 'Active');

    await usersPage.filterStatus('Locked');
    await usersPage.search('sam.demo');
    await usersPage.expectUserStatus('sam.demo@loopi.com', 'Locked');
  });

  test('admin can lock and unlock Jamie', async ({ page, asAdmin, adminSession }) => {
    void asAdmin;

    await safeCleanup(async () => {
      await ensureStudentUnlocked(adminSession.accessToken, users.jamie.email);
    });

    const usersPage = new AdminUsersPage(page);

    try {
      await usersPage.goto();
      await usersPage.search(users.jamie.email);
      await usersPage.expectUserStatus(users.jamie.email, 'Active');

      await usersPage.lockUser(users.jamie.email);
      await expect(usersPage.toast(/Account locked/i)).toBeVisible({ timeout: 15_000 });
      await usersPage.expectUserStatus(users.jamie.email, 'Locked');

      await usersPage.unlockUser(users.jamie.email);
      await expect(usersPage.toast(/Account unlocked/i)).toBeVisible({ timeout: 15_000 });
      await usersPage.expectUserStatus(users.jamie.email, 'Active');
    } finally {
      await safeCleanup(async () => {
        await ensureStudentUnlocked(adminSession.accessToken, users.jamie.email);
      });
    }
  });

  test('admin can view Riley violations board', async ({ page, asAdmin }) => {
    void asAdmin;
    const warnings = new AdminWarningsPage(page);
    await warnings.goto();

    await warnings.expectFlaggedUser(users.riley.name, {
      risk: /Medium risk/i,
      email: users.riley.email,
    });

    const card = warnings.flaggedUserCard(users.riley.name);
    await expect(card.getByText('Spam content')).toBeVisible();
    await expect(card.getByText('Inappropriate language')).toBeVisible();
    await expect(card.getByText('Pending').first()).toBeVisible();
    await expect(card.getByRole('button', { name: 'Resolve' }).first()).toBeVisible();
  });

  test('admin can browse content management', async ({ page, asAdmin }) => {
    void asAdmin;
    const content = new AdminContentPage(page);
    await content.goto();
    await content.expectSeededSubjectVisible('Linear Algebra');
    await content.expectSeededDocumentVisible('Eigenvalues Cheat Sheet');
  });

  test('admin can log out from sidebar', async ({ page, asAdmin }) => {
    void asAdmin;
    await page.goto('/admin');
    await expect(page.getByRole('heading', { name: 'Admin Dashboard' })).toBeVisible({
      timeout: 15_000,
    });

    await page.getByRole('button', { name: 'Log out' }).click();
    await expect(page).toHaveURL(/\/login/, { timeout: 15_000 });
  });
});
