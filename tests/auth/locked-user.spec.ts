import { test, expect } from '../../fixtures/auth';
import { env } from '../../helpers/env';
import { users } from '../../data/users';
import { waitForHealth } from '../../helpers/health';
import { waitForFrontend } from '../../helpers/frontend';

test.describe('locked user', () => {
  test.skip(
    !env.requireServices,
    'Set REQUIRE_SERVICES=true and start frontend + backend (with db:seed:demo)',
  );

  test.beforeEach(async () => {
    await waitForHealth({ timeoutMs: 15_000 });
    await waitForFrontend({ timeoutMs: 15_000 });
  });

  test('cannot log in with a locked account', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.login(users.locked.email, users.locked.password);

    await expect(loginPage.toast(/locked/i)).toBeVisible({ timeout: 10_000 });
    await expect(loginPage.page).toHaveURL(/\/login/);
  });
});
