import { expect, type Locator, type Page } from '@playwright/test';
import { toast } from '../helpers/testData';

export class DashboardPage {
  readonly page: Page;
  readonly tasks: Locator;

  constructor(page: Page) {
    this.page = page;
    this.tasks = page.locator('#todays-tasks');
  }

  async goto() {
    await this.page.goto('/');
    await expect(
      this.page.getByRole('heading', { name: /Ready for a cozy study session/i }),
    ).toBeVisible({ timeout: 15_000 });
    await expect(this.tasks.getByRole('heading', { name: "Today's Tasks" })).toBeVisible();
  }

  async addTask(title: string) {
    const input = this.tasks.getByPlaceholder('Add a task…');
    await input.fill(title);
    await input.press('Enter');
  }

  taskRow(title: string): Locator {
    return this.tasks.locator('div').filter({ has: this.page.getByRole('button', { name: title }) }).first();
  }

  async toggleTask(title: string) {
    const row = this.taskRow(title);
    await row.locator('button').first().click();
  }

  async deleteTask(title: string) {
    const row = this.taskRow(title);
    await row.locator('button').last().click();
  }

  toast(text: string | RegExp) {
    return toast(this.page, text);
  }
}
