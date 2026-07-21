import { test, expect } from '../../fixtures/auth';
import { env } from '../../helpers/env';
import { waitForFrontend } from '../../helpers/frontend';
import { LoginPage } from '../../pages/LoginPage';
import { AUTH_SESSION_STORAGE_KEY } from '../../helpers/session';

test.describe('logout', () => {
  test.skip(
    !env.requireServices,
    'Set REQUIRE_SERVICES=true and start frontend + backend (with db:seed:demo)',
  );

  test.beforeEach(async () => {
    await waitForFrontend({ timeoutMs: 15_000 });
  });

  test('student can log out and loses session', async ({ page, asStudent }) => {
    void asStudent;
    await expect(
      page.getByRole('heading', { name: /Ready for a cozy study session/i }),
    ).toBeVisible({ timeout: 15_000 });

    await page.getByRole('button', { name: 'Log out' }).click();

    await page.waitForURL(/\/login(\?|$)/, { timeout: 15_000 });

    const loginPage = new LoginPage(page);
    await expect(loginPage.emailInput).toBeVisible({ timeout: 15_000 });
    await expect
      .poll(async () =>
        page.evaluate((key) => window.localStorage.getItem(key), AUTH_SESSION_STORAGE_KEY),
      )
      .toBeNull();

    await page.goto('/subjects');
    await expect(page).toHaveURL(/\/login(\?|$)/, { timeout: 15_000 });
    await expect(loginPage.emailInput).toBeVisible({ timeout: 15_000 });
  });

  test('admin can log out', async ({ page, asAdmin }) => {
    void asAdmin;
    await expect(page.getByRole('heading', { name: 'Admin Dashboard' })).toBeVisible({
      timeout: 15_000,
    });

    await page.getByRole('button', { name: 'Log out' }).click();

    await page.waitForURL(/\/login(\?|$)/, { timeout: 15_000 });

    const loginPage = new LoginPage(page);
    await expect(loginPage.emailInput).toBeVisible({ timeout: 15_000 });
    await expect
      .poll(async () =>
        page.evaluate((key) => window.localStorage.getItem(key), AUTH_SESSION_STORAGE_KEY),
      )
      .toBeNull();
  });
});
