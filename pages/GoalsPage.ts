import { expect, type Page } from '@playwright/test';
import { toast } from '../helpers/testData';

export class GoalsPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto('/goals');
    await expect(this.page.getByRole('heading', { name: 'Goals & Streak' })).toBeVisible({
      timeout: 15_000,
    });
  }

  dialog() {
    return this.page
      .locator('div.relative.bg-card')
      .filter({ has: this.page.getByRole('heading', { name: /New Goal|Edit Goal/ }) });
  }

  async createGoal(title: string, target = '5') {
    await this.page.getByRole('button', { name: 'New Goal' }).click();
    await expect(this.page.getByRole('heading', { name: 'New Goal' })).toBeVisible();
    const dialog = this.dialog();
    await dialog.getByPlaceholder('e.g. Study 10 hours this week').fill(title);
    await dialog.locator('input[type="number"]').fill(target);
    await dialog.getByRole('button', { name: 'Create Goal' }).click();
  }

  goalCard(title: string) {
    return this.page
      .locator('div.bg-card.rounded-2xl')
      .filter({ has: this.page.getByText(title, { exact: true }) })
      .first();
  }

  async deleteGoal(title: string) {
    await this.goalCard(title).getByRole('button', { name: 'Delete goal' }).click();
  }

  toast(text: string | RegExp) {
    return toast(this.page, text);
  }
}
