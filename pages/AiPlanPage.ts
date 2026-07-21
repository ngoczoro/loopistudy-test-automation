import { expect, type Page } from '@playwright/test';
import { toast } from '../helpers/testData';

export class AiPlanPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async gotoPlanner() {
    await this.page.goto('/planner');
    await expect(this.page.getByRole('heading', { name: 'Study Planner' })).toBeVisible({
      timeout: 15_000,
    });
    await expect(this.page.getByText('Loading planner…')).toHaveCount(0, { timeout: 15_000 });
  }

  async openWizard() {
    await this.page.getByRole('button', { name: 'AI Plan' }).click();
    await expect(this.page.getByRole('heading', { name: 'AI Study Plan' })).toBeVisible({
      timeout: 15_000,
    });
  }

  wizard() {
    return this.page.locator('div.fixed.inset-0').filter({
      has: this.page.getByRole('heading', { name: 'AI Study Plan' }),
    });
  }

  /** Generate a plan from existing subjects — local scheduler, no OpenAI. */
  async generateFromSubjects() {
    const wizard = this.wizard();
    await wizard.getByText('From my subjects', { exact: true }).click();

    const checkboxes = wizard.locator('input[type="checkbox"]');
    await expect(checkboxes.first()).toBeVisible({ timeout: 15_000 });
    const count = await checkboxes.count();
    expect(count).toBeGreaterThan(0);

    // Select first schedulable subject only (keeps apply/preview light)
    await checkboxes.first().check();
    await wizard.getByRole('button', { name: 'Generate Plan' }).click();

    await expect(wizard.getByRole('button', { name: 'Apply plan' })).toBeVisible({
      timeout: 45_000,
    });
  }

  async closeWizard() {
    await this.wizard().getByRole('button', { name: 'Close' }).click();
    await expect(this.page.getByRole('heading', { name: 'AI Study Plan' })).toHaveCount(0, {
      timeout: 10_000,
    });
  }

  toast(text: string | RegExp) {
    return toast(this.page, text);
  }
}
