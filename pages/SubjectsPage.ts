import { expect, type Locator, type Page } from '@playwright/test';
import { toast } from '../helpers/testData';

export class SubjectsPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto('/subjects');
    await expect(this.page.getByRole('heading', { name: 'My Subjects' })).toBeVisible({
      timeout: 15_000,
    });
  }

  formModal(): Locator {
    return this.page.locator('div.fixed.inset-0').filter({
      has: this.page.getByRole('heading', { name: /Add New Subject|Edit Subject/ }),
    });
  }

  async openCreateForm() {
    await this.page.getByRole('button', { name: 'Add Subject' }).first().click();
    await expect(this.page.getByRole('heading', { name: 'Add New Subject' })).toBeVisible();
  }

  async fillName(name: string) {
    await this.formModal().getByPlaceholder('Subject name').fill(name);
  }

  async fillHoursPerWeek(hours: string) {
    await this.formModal().getByPlaceholder('Study hours/week').fill(hours);
  }

  /** Pick a day in next month so create validation (future date) always passes. */
  async pickFutureExamDate() {
    await this.formModal().getByRole('button', { name: /Select exam date/i }).click();
    const calendar = this.page.getByRole('dialog');
    await calendar.getByRole('button', { name: /Go to the Next Month/i }).click();
    // react-day-picker names days like "Saturday, August 15th, 2026"
    await calendar.getByRole('button', { name: /15th,/ }).click();
  }

  async submitCreate() {
    await this.formModal().getByRole('button', { name: 'Add Subject' }).click();
  }

  subjectCard(name: string): Locator {
    return this.page
      .locator('div.group')
      .filter({ has: this.page.getByRole('heading', { name }) })
      .first();
  }

  async deleteSubject(name: string) {
    const card = this.subjectCard(name);
    await card.hover();
    await card.getByRole('button', { name: 'Delete subject' }).click({ force: true });
    await expect(this.page.getByRole('heading', { name: 'Delete Subject?' })).toBeVisible();
    await this.page.getByRole('button', { name: 'Delete', exact: true }).click();
  }

  toast(text: string | RegExp) {
    return toast(this.page, text);
  }
}
