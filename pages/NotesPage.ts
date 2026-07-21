import { expect, type Page } from '@playwright/test';
import { toast } from '../helpers/testData';

export class NotesPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto('/notes');
    await expect(this.page.getByRole('heading', { name: 'Documents & Notes' })).toBeVisible({
      timeout: 15_000,
    });
  }

  async createNote(title: string, body: string) {
    await this.page.getByRole('button', { name: 'Add Note' }).click();
    await expect(this.page.getByRole('heading', { name: 'Add Study Material' })).toBeVisible();
    await this.page.getByRole('button', { name: 'Write Note' }).click();
    await this.page.getByPlaceholder('Title').fill(title);
    await this.page.getByPlaceholder('Write your note here...').fill(body);
    await this.page.getByRole('button', { name: 'Save Note' }).click();
  }

  noteRow(title: string) {
    return this.page.locator('div.group').filter({ hasText: title }).first();
  }

  async deleteNote(title: string) {
    const row = this.noteRow(title);
    await row.hover();
    // View / Edit / Delete — last icon is trash
    await row.locator('div.opacity-0 button').last().click({ force: true });
    await expect(this.page.getByRole('heading', { name: 'Delete Document?' })).toBeVisible();
    await this.page.getByRole('button', { name: 'Delete', exact: true }).click();
  }

  toast(text: string | RegExp) {
    return toast(this.page, text);
  }
}
