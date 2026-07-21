import { test, expect } from '../../fixtures/auth';
import { env } from '../../helpers/env';
import { waitForFrontend } from '../../helpers/frontend';

test.describe('auth guard', () => {
  test.skip(
    !env.requireServices,
    'Set REQUIRE_SERVICES=true and start frontend + backend (with db:seed:demo)',
  );

  test.beforeEach(async () => {
    await waitForFrontend({ timeoutMs: 15_000 });
  });

  test('unauthenticated users are redirected to login', async ({ page }) => {
    await page.goto('/subjects');
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByPlaceholder('Email', { exact: true })).toBeVisible();
  });

  test('unauthenticated dashboard also redirects to login', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/login/);
  });
});
