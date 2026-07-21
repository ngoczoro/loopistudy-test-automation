import { expect, type Locator, type Page } from '@playwright/test';
import { toast } from '../helpers/testData';

export class AdminWarningsPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto('/admin/warnings');
    await expect(this.page.getByRole('heading', { name: 'Violation Warnings' })).toBeVisible({
      timeout: 15_000,
    });
  }

  flaggedUserCard(name: string): Locator {
    return this.page
      .locator('div.bg-card')
      .filter({ has: this.page.getByText(name, { exact: true }) })
      .first();
  }

  async expectFlaggedUser(name: string, options?: { risk?: RegExp; email?: string }) {
    const card = this.flaggedUserCard(name);
    await expect(card).toBeVisible({ timeout: 15_000 });
    if (options?.risk) {
      await expect(card.getByText(options.risk)).toBeVisible();
    }
    if (options?.email) {
      await expect(card.getByText(options.email)).toBeVisible();
    }
  }

  toast(text: string | RegExp) {
    return toast(this.page, text);
  }
}
