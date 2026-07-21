import { test, expect } from '../../fixtures/auth';
import { env } from '../../helpers/env';
import { waitForHealth } from '../../helpers/health';
import { waitForFrontend } from '../../helpers/frontend';
import { PomodoroPage } from '../../pages/PomodoroPage';
import { cleanupActiveFocus, safeCleanup } from '../../helpers/apiCleanup';

test.describe('pomodoro', () => {
  test.skip(
    !env.requireServices,
    'Set REQUIRE_SERVICES=true and start frontend + backend (with db:seed:demo)',
  );

  test.beforeEach(async () => {
    await waitForHealth({ timeoutMs: 15_000 });
    await waitForFrontend({ timeoutMs: 15_000 });
  });

  test('student can start, pause, and stop a focus session', async ({
    page,
    asStudent,
    studentSession,
  }) => {
    void asStudent;
    const pomodoro = new PomodoroPage(page);

    try {
      await pomodoro.goto();
      await pomodoro.openSetup();
      await pomodoro.setFocusMinutes(1);
      await pomodoro.startSession();

      await expect(pomodoro.toast(/Focus session started/i)).toBeVisible({ timeout: 15_000 });
      await pomodoro.expectTimerVisible();

      await pomodoro.togglePause();
      await expect(page.getByText('Paused', { exact: true })).toBeVisible({ timeout: 15_000 });

      await pomodoro.togglePause();
      await expect(page.getByText('Running', { exact: true })).toBeVisible({ timeout: 15_000 });

      await pomodoro.stopSession();
      await expect(pomodoro.toast(/Focus session complete/i)).toBeVisible({ timeout: 15_000 });
      await expect(page.getByRole('button', { name: 'Start Study' })).toBeVisible({
        timeout: 15_000,
      });
    } finally {
      await safeCleanup(async () => {
        await cleanupActiveFocus(studentSession.accessToken);
      });
    }
  });
});
