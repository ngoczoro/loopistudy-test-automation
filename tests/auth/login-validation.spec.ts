import { test, expect } from '../../fixtures/auth';
import { env } from '../../helpers/env';
import { users } from '../../data/users';
import { waitForHealth } from '../../helpers/health';
import { waitForFrontend } from '../../helpers/frontend';

test.describe('login validation', () => {
  test.skip(
    !env.requireServices,
    'Set REQUIRE_SERVICES=true and start frontend + backend (with db:seed:demo)',
  );

  test.beforeEach(async () => {
    await waitForHealth({ timeoutMs: 15_000 });
    await waitForFrontend({ timeoutMs: 15_000 });
  });

  test('shows error when email is empty', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.passwordInput.fill('whatever');
    await loginPage.submitButton.click();

    await expect(loginPage.toast('Please enter your email')).toBeVisible();
    await expect(loginPage.page).toHaveURL(/\/login/);
  });

  test('shows error for invalid credentials', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.login(users.student.email, 'WrongPassword123!');

    await expect(loginPage.toast(/Invalid email or password/i)).toBeVisible({
      timeout: 10_000,
    });
    await expect(loginPage.page).toHaveURL(/\/login/);
  });
});
