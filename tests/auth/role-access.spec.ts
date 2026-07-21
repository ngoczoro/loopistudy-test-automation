import { test, expect } from '../../fixtures/auth';
import { env } from '../../helpers/env';

test.describe('role access', () => {
  test.skip(
    !env.requireServices,
    'Set REQUIRE_SERVICES=true and start frontend + backend (with db:seed:demo)',
  );

  test('student cannot open admin routes', async ({ page, asStudent }) => {
    void asStudent;
    await page.goto('/admin');
    await expect(page.getByRole('heading', { name: '404' })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByText(/Oops! Page not found/i)).toBeVisible();
  });

  test('admin cannot open student dashboard route', async ({ page, asAdmin }) => {
    void asAdmin;
    await page.goto('/');
    await expect(page.getByRole('heading', { name: '404' })).toBeVisible({
      timeout: 15_000,
    });
  });
});
