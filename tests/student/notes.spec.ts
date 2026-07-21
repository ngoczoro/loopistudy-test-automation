import { test, expect } from '../../fixtures/auth';
import { env } from '../../helpers/env';
import { waitForHealth } from '../../helpers/health';
import { waitForFrontend } from '../../helpers/frontend';
import { NotesPage } from '../../pages/NotesPage';
import { uniqueLabel } from '../../helpers/testData';

test.describe('notes', () => {
  test.skip(
    !env.requireServices,
    'Set REQUIRE_SERVICES=true and start frontend + backend (with db:seed:demo)',
  );

  test.beforeEach(async () => {
    await waitForHealth({ timeoutMs: 15_000 });
    await waitForFrontend({ timeoutMs: 15_000 });
  });

  test('student can create and delete a note', async ({ page, asStudent }) => {
    void asStudent;
    const notes = new NotesPage(page);
    const title = uniqueLabel('E2E Note');

    await notes.goto();
    await notes.createNote(title, 'Automation note body');

    await expect(notes.toast(/Note created successfully/i)).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(title, { exact: true })).toBeVisible();

    await notes.deleteNote(title);
    await expect(notes.toast(/Content deleted successfully/i)).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(title, { exact: true })).toHaveCount(0);
  });
});
