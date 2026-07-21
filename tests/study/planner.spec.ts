import { test, expect } from '../../fixtures/auth';
import { env } from '../../helpers/env';
import { waitForHealth } from '../../helpers/health';
import { waitForFrontend } from '../../helpers/frontend';
import { PlannerPage } from '../../pages/PlannerPage';
import { SubjectsPage } from '../../pages/SubjectsPage';
import { uniqueLabel } from '../../helpers/testData';
import {
  cleanupActiveFocus,
  cleanupE2ePlannerLeftovers,
  cleanupSubjectsByName,
  safeCleanup,
} from '../../helpers/apiCleanup';

async function createTempSubject(page: import('@playwright/test').Page) {
  const subjects = new SubjectsPage(page);
  const name = uniqueLabel('E2E Plan Sub');
  await subjects.goto();
  await subjects.openCreateForm();
  await subjects.fillName(name);
  await subjects.fillHoursPerWeek('2');
  await subjects.pickFutureExamDate();
  await subjects.submitCreate();
  await expect(subjects.toast(/Subject added successfully/i)).toBeVisible({ timeout: 15_000 });
  return { subjects, name };
}

test.describe('planner', () => {
  test.skip(
    !env.requireServices,
    'Set REQUIRE_SERVICES=true and start frontend + backend (with db:seed:demo)',
  );

  // Same demo user — avoid parallel planner writes colliding
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ studentSession }) => {
    test.setTimeout(90_000);
    await waitForHealth({ timeoutMs: 15_000 });
    await waitForFrontend({ timeoutMs: 15_000 });
    // Clear leftover E2E sessions (e.g. Sat 22:00) from previous failed runs
    await safeCleanup(async () => {
      await cleanupActiveFocus(studentSession.accessToken);
      await cleanupE2ePlannerLeftovers(studentSession.accessToken);
    });
  });

  test('student can create and delete a study session', async ({
    page,
    asStudent,
    studentSession,
  }) => {
    void asStudent;
    const { name } = await createTempSubject(page);
    const planner = new PlannerPage(page);

    try {
      await planner.goto();
      await planner.createSession({
        subjectName: name,
        day: 'Sat',
        startTime: '22:00',
        duration: '1 hour',
      });

      await planner.deleteSession(name);
    } finally {
      await safeCleanup(async () => {
        await cleanupActiveFocus(studentSession.accessToken);
        await cleanupSubjectsByName(studentSession.accessToken, name);
      });
    }
  });

  test('student can start focus from a planner session', async ({
    page,
    asStudent,
    studentSession,
  }) => {
    void asStudent;
    const { name } = await createTempSubject(page);
    const planner = new PlannerPage(page);

    try {
      await planner.goto();
      await planner.createSession({
        subjectName: name,
        day: 'Sun',
        startTime: '21:00',
        duration: '1 hour',
      });

      await planner.startFocusFromSession(name);
      await expect(page).toHaveURL(/\/pomodoro\?.*subjectId=/, { timeout: 15_000 });
      await expect(page.getByRole('heading', { name: 'Focus Sessions' })).toBeVisible();
    } finally {
      await safeCleanup(async () => {
        await cleanupActiveFocus(studentSession.accessToken);
        await cleanupSubjectsByName(studentSession.accessToken, name);
      });
    }
  });
});
