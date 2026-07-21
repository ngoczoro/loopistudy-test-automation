import { test, expect } from '../../fixtures/auth';
import { env } from '../../helpers/env';
import { waitForHealth } from '../../helpers/health';
import { waitForFrontend } from '../../helpers/frontend';
import { GoalsPage } from '../../pages/GoalsPage';
import { uniqueLabel } from '../../helpers/testData';
import { cleanupGoalsByTitle, safeCleanup } from '../../helpers/apiCleanup';

test.describe('goals', () => {
  test.skip(
    !env.requireServices,
    'Set REQUIRE_SERVICES=true and start frontend + backend (with db:seed:demo)',
  );

  test.beforeEach(async () => {
    await waitForHealth({ timeoutMs: 15_000 });
    await waitForFrontend({ timeoutMs: 15_000 });
  });

  test('student can create and delete a goal', async ({ page, asStudent, studentSession }) => {
    void asStudent;
    const goals = new GoalsPage(page);
    const title = uniqueLabel('E2E Goal');

    try {
      await goals.goto();
      await goals.createGoal(title, '3');

      await expect(goals.toast(/Goal created/i)).toBeVisible({ timeout: 15_000 });
      await expect(page.getByText(title)).toBeVisible();

      await goals.deleteGoal(title);
      await expect(goals.toast(/Goal deleted/i)).toBeVisible({ timeout: 15_000 });
      await expect(page.getByText(title)).toHaveCount(0);
    } finally {
      await safeCleanup(async () => {
        await cleanupGoalsByTitle(studentSession.accessToken, title);
      });
    }
  });
});
