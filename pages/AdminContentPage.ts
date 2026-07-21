import { expect, type Page } from '@playwright/test';
import { toast } from '../helpers/testData';

export class AdminContentPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto('/admin/content');
    await expect(this.page.getByRole('heading', { name: 'Content Management' })).toBeVisible({
      timeout: 15_000,
    });
  }

  async expectSeededSubjectVisible(name: string) {
    await expect(this.page.getByText(/All Subjects \(\d+\)/)).toBeVisible({ timeout: 15_000 });
    await expect(this.page.getByText(name, { exact: true }).first()).toBeVisible();
  }

  async expectSeededDocumentVisible(title: string) {
    await expect(this.page.getByText(/All Documents \(\d+\)/)).toBeVisible({ timeout: 15_000 });
    await expect(this.page.getByText(title, { exact: true }).first()).toBeVisible();
  }

  toast(text: string | RegExp) {
    return toast(this.page, text);
  }
}
