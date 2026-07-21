import { test, expect } from '../../fixtures/auth';
import { env } from '../../helpers/env';
import { waitForHealth } from '../../helpers/health';
import { waitForFrontend } from '../../helpers/frontend';
import { DashboardPage } from '../../pages/DashboardPage';
import { NotesPage } from '../../pages/NotesPage';
import { AiPlanPage } from '../../pages/AiPlanPage';
import { cleanupAiPlanSessions, safeCleanup } from '../../helpers/apiCleanup';

test.describe('ai features (no OpenAI required)', () => {
  test.skip(
    !env.requireServices,
    'Set REQUIRE_SERVICES=true and start frontend + backend (with db:seed:demo)',
  );

  test.beforeEach(async () => {
    test.setTimeout(90_000);
    await waitForHealth({ timeoutMs: 15_000 });
    await waitForFrontend({ timeoutMs: 15_000 });
  });

  test('student can search learning resources on dashboard', async ({ page, asStudent }) => {
    void asStudent;
    const dashboard = new DashboardPage(page);
    await dashboard.goto();

    await expect(page.getByRole('heading', { name: 'Learning Resources' })).toBeVisible({
      timeout: 15_000,
    });

    const panel = page
      .locator('div')
      .filter({ has: page.getByRole('heading', { name: 'Learning Resources' }) })
      .first();

    await panel
      .getByPlaceholder(/Java OOP|React Hook|SQL Normalization/i)
      .fill('React');
    await panel.getByRole('button', { name: 'Search', exact: true }).click();

    // Real OpenAI rank OR catalog fallback — either yields result cards / save affordance
    await expect(
      panel.getByRole('button', { name: /Save|Saved/ }).or(panel.getByText(/Relevant|http/i)),
    ).toBeVisible({ timeout: 45_000 });
  });

  test('student can search inside a seeded note document', async ({ page, asStudent }) => {
    void asStudent;
    const notes = new NotesPage(page);
    await notes.goto();

    const row = notes.noteRow('Eigenvalues Cheat Sheet');
    await expect(row).toBeVisible({ timeout: 15_000 });
    await row.click();

    await expect(page.getByText(/Search within Eigenvalues Cheat Sheet/i)).toBeVisible({
      timeout: 15_000,
    });

    await page.getByPlaceholder(/Search concepts, keywords/i).fill('eigen');
    await page.getByRole('button', { name: 'Search', exact: true }).click();

    await expect(page.getByText(/eigenvalue/i).first()).toBeVisible({ timeout: 20_000 });
  });

  test('student can generate AI study plan from subjects', async ({
    page,
    asStudent,
    studentSession,
  }) => {
    void asStudent;
    const aiPlan = new AiPlanPage(page);

    try {
      await aiPlan.gotoPlanner();
      await aiPlan.openWizard();
      await aiPlan.generateFromSubjects();
      // Preview only — applying would flood the planner week
      await expect(aiPlan.wizard().getByRole('button', { name: 'Apply plan' })).toBeVisible();
      await aiPlan.closeWizard();
    } finally {
      await safeCleanup(async () => {
        await cleanupAiPlanSessions(studentSession.accessToken);
      });
    }
  });
});
