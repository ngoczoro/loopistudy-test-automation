import { expect, type Page } from '@playwright/test';
import { toast } from '../helpers/testData';

export class SettingsPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto('/settings');
    await expect(this.page.getByText('Loading settings…')).toHaveCount(0, {
      timeout: 15_000,
    });
    await expect(this.page.getByRole('heading', { name: 'Settings' })).toBeVisible({
      timeout: 15_000,
    });
    await expect(this.displayNameInput()).toBeVisible();
  }

  displayNameInput() {
    return this.page
      .locator('label')
      .filter({ hasText: 'Display Name' })
      .locator('..')
      .locator('input')
      .first();
  }

  async updateDisplayName(name: string) {
    const input = this.displayNameInput();
    await input.click();
    await input.fill(name);
    // Ensure controlled React state caught the new value before save
    await expect(input).toHaveValue(name);

    const patchPromise = this.page.waitForResponse(
      (res) =>
        res.url().includes('/users/me') &&
        res.request().method() === 'PATCH' &&
        res.ok(),
    );

    await this.page.getByRole('button', { name: 'Save Profile' }).click();
    const response = await patchPromise;
    return response.json();
  }

  toast(text: string | RegExp) {
    return toast(this.page, text);
  }
}
