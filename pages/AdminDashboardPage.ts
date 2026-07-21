import { expect, type Locator, type Page } from '@playwright/test';
import { toast } from '../helpers/testData';

export class AdminDashboardPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto('/admin');
    await expect(this.page.getByRole('heading', { name: 'Admin Dashboard' })).toBeVisible({
      timeout: 15_000,
    });
  }

  async expectLoaded() {
    await expect(this.page.getByText('Total Students')).toBeVisible({ timeout: 15_000 });
    await expect(this.page.getByText('Weekly Activity')).toBeVisible();
    await expect(this.page.getByText('Student Status')).toBeVisible();
    await expect(this.page.getByText('Recent Content')).toBeVisible();

    const studentsCard = this.page
      .locator('div.bg-card')
      .filter({ hasText: 'Total Students' })
      .first();
    await expect(studentsCard.getByText(/^\d+$/)).toBeVisible({ timeout: 15_000 });
  }

  toast(text: string | RegExp) {
    return toast(this.page, text);
  }
}
