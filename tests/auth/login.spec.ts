import { test, expect } from '../../fixtures/auth';
import { env } from '../../helpers/env';
import { users } from '../../data/users';
import { waitForHealth } from '../../helpers/health';
import { waitForFrontend } from '../../helpers/frontend';

test.describe('login', () => {
  test.skip(
    !env.requireServices,
    'Set REQUIRE_SERVICES=true and start frontend + backend (with db:seed:demo)',
  );

  test.beforeEach(async () => {
    await waitForHealth({ timeoutMs: 15_000 });
    await waitForFrontend({ timeoutMs: 15_000 });
  });

  test('student can log in and land on dashboard', async ({ loginPage, page }) => {
    await loginPage.goto();
    await loginPage.login(users.student.email, users.student.password);
    await loginPage.expectRedirectForRole('student');

    await expect(
      page.getByRole('heading', { name: /Ready for a cozy study session/i }),
    ).toBeVisible({ timeout: 15_000 });
    await expect(loginPage.toast(/Welcome back/i)).toBeVisible();
  });

  test('admin can log in and land on admin dashboard', async ({ loginPage, page }) => {
    await loginPage.goto();
    await loginPage.login(users.admin.email, users.admin.password);
    await loginPage.expectRedirectForRole('admin');

    await expect(
      page.getByRole('heading', { name: 'Admin Dashboard' }),
    ).toBeVisible({ timeout: 15_000 });
  });
});
