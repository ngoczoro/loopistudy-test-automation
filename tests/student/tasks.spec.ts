import { test, expect } from '../../fixtures/auth';
import { env } from '../../helpers/env';
import { waitForHealth } from '../../helpers/health';
import { waitForFrontend } from '../../helpers/frontend';
import { DashboardPage } from '../../pages/DashboardPage';
import { uniqueLabel } from '../../helpers/testData';

test.describe('dashboard tasks', () => {
  test.skip(
    !env.requireServices,
    'Set REQUIRE_SERVICES=true and start frontend + backend (with db:seed:demo)',
  );

  test.beforeEach(async () => {
    await waitForHealth({ timeoutMs: 15_000 });
    await waitForFrontend({ timeoutMs: 15_000 });
  });

  test('student can add, complete, and delete a today task', async ({ page, asStudent }) => {
    void asStudent;
    const dashboard = new DashboardPage(page);
    const title = uniqueLabel('E2E Task');

    await dashboard.goto();
    await dashboard.addTask(title);

    await expect(dashboard.toast(/Task added/i)).toBeVisible({ timeout: 15_000 });
    await expect(dashboard.tasks.getByRole('button', { name: title })).toBeVisible();

    await dashboard.toggleTask(title);
    await expect(dashboard.toast(/Task completed/i)).toBeVisible({ timeout: 15_000 });

    await dashboard.deleteTask(title);
    await expect(dashboard.toast(/Task deleted/i)).toBeVisible({ timeout: 15_000 });
    await expect(dashboard.tasks.getByRole('button', { name: title })).toHaveCount(0);
  });
});
