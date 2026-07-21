import { expect, type Locator, type Page } from '@playwright/test';
import { toast } from '../helpers/testData';

export class AdminUsersPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto('/admin/users');
    await expect(this.page.getByRole('heading', { name: 'User Management' })).toBeVisible({
      timeout: 15_000,
    });
  }

  async search(query: string) {
    await this.page.getByPlaceholder('Search by name or email…').fill(query);
    // Debounce is 300ms
    await this.page.waitForTimeout(500);
  }

  async filterStatus(status: 'All' | 'Active' | 'Locked') {
    await this.page.getByRole('button', { name: status, exact: true }).click();
  }

  userRow(emailOrName: string): Locator {
    return this.page.locator('tr').filter({ hasText: emailOrName }).first();
  }

  async expectUserStatus(emailOrName: string, status: 'Active' | 'Locked') {
    const row = this.userRow(emailOrName);
    await expect(row).toBeVisible({ timeout: 15_000 });
    await expect(row.getByText(status, { exact: true })).toBeVisible();
  }

  async lockUser(emailOrName: string, reason = 'E2E lock — temporary') {
    const row = this.userRow(emailOrName);
    await expect(row).toBeVisible({ timeout: 15_000 });
    await row.getByRole('button', { name: 'Lock', exact: true }).click();

    await expect(this.page.getByRole('heading', { name: 'Lock User Account' })).toBeVisible();
    await this.page.getByPlaceholder(/reason/i).or(this.page.locator('textarea')).fill(reason);
    await this.page.getByRole('button', { name: 'Lock Account', exact: true }).click();
  }

  async unlockUser(emailOrName: string) {
    const row = this.userRow(emailOrName);
    await expect(row).toBeVisible({ timeout: 15_000 });
    await row.getByRole('button', { name: 'Unlock', exact: true }).click();
    await expect(this.page.getByRole('heading', { name: new RegExp(`Unlock .+\\?`) })).toBeVisible();
    await this.page.getByRole('button', { name: 'Confirm', exact: true }).click();
  }

  toast(text: string | RegExp) {
    return toast(this.page, text);
  }
}
