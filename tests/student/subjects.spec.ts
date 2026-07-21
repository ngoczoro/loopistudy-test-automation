import { test, expect } from '../../fixtures/auth';
import { env } from '../../helpers/env';
import { waitForHealth } from '../../helpers/health';
import { waitForFrontend } from '../../helpers/frontend';
import { SubjectsPage } from '../../pages/SubjectsPage';
import { uniqueLabel } from '../../helpers/testData';

test.describe('subjects', () => {
  test.skip(
    !env.requireServices,
    'Set REQUIRE_SERVICES=true and start frontend + backend (with db:seed:demo)',
  );

  test.beforeEach(async () => {
    await waitForHealth({ timeoutMs: 15_000 });
    await waitForFrontend({ timeoutMs: 15_000 });
  });

  test('student can create and delete a subject', async ({ page, asStudent }) => {
    void asStudent;
    const subjects = new SubjectsPage(page);
    const name = uniqueLabel('E2E Subject');

    await subjects.goto();
    await subjects.openCreateForm();
    await subjects.fillName(name);
    await subjects.fillHoursPerWeek('4');
    await subjects.pickFutureExamDate();
    await subjects.submitCreate();

    await expect(subjects.toast(/Subject added successfully/i)).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole('heading', { name })).toBeVisible({ timeout: 15_000 });

    await subjects.deleteSubject(name);
    await expect(subjects.toast(/Subject deleted/i)).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole('heading', { name })).toHaveCount(0);
  });
});
