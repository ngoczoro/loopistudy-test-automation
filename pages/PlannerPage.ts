import { expect, type Locator, type Page } from '@playwright/test';
import { toast } from '../helpers/testData';

export class PlannerPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto('/planner');
    await expect(this.page.getByRole('heading', { name: 'Study Planner' })).toBeVisible({
      timeout: 15_000,
    });
    await expect(this.page.getByText('Loading planner…')).toHaveCount(0, { timeout: 15_000 });
  }

  formModal(): Locator {
    return this.page.locator('div.fixed.inset-0').filter({
      has: this.page.getByRole('heading', { name: /Add Study Session|Edit Session/ }),
    });
  }

  async openCreateForm() {
    await this.page.getByRole('button', { name: 'Add Session' }).click();
    await expect(this.page.getByRole('heading', { name: 'Add Study Session' })).toBeVisible();
  }

  /**
   * Planner form uses stale setState spreads (`{ ...addForm, ... }`).
   * Always set day/time/duration FIRST, then subject LAST so title/subjectId aren't wiped.
   */
  async createSession(options: {
    subjectName: string;
    day: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';
    startTime: string;
    duration: string;
  }) {
    await this.openCreateForm();
    const modal = this.formModal();

    await modal.locator('select').nth(1).selectOption({ label: options.day });
    await modal.locator('div.grid.grid-cols-2 select').first().selectOption({
      label: options.startTime,
    });
    await modal.locator('div.grid.grid-cols-2 select').nth(1).selectOption({
      label: options.duration,
    });
    // Subject last — sets title via onChange; must not be overwritten by later selects
    await modal.locator('select').first().selectOption({ label: options.subjectName });

    await modal.getByRole('button', { name: 'Create Session' }).click();

    // Success = modal closes + block appears
    await expect(this.page.getByRole('heading', { name: 'Add Study Session' })).toHaveCount(0, {
      timeout: 15_000,
    });
    await expect(this.sessionBlock(options.subjectName)).toBeVisible({ timeout: 15_000 });
  }

  sessionBlock(title: string): Locator {
    return this.page.locator('div.group\\/sess').filter({ hasText: title }).first();
  }

  /**
   * Session card hover actions:
   * - ⋯ (top-right) → Edit / Delete
   * - Start (bottom-right, title="Start Study") → /pomodoro
   */
  async deleteSession(title: string) {
    const block = this.sessionBlock(title);
    await expect(block).toBeVisible({ timeout: 15_000 });
    await block.scrollIntoViewIfNeeded();
    await block.hover();

    await block.locator('div.absolute.top-1.right-1 > button').click({ force: true });

    const menu = this.page.locator('div.absolute.right-0.top-6.w-28').filter({
      has: this.page.getByRole('button', { name: 'Delete' }),
    });
    await expect(menu).toBeVisible({ timeout: 10_000 });
    await menu.getByRole('button', { name: 'Delete' }).click();

    await expect(this.sessionBlock(title)).toHaveCount(0, { timeout: 15_000 });
  }

  async startFocusFromSession(title: string) {
    const block = this.sessionBlock(title);
    await expect(block).toBeVisible({ timeout: 15_000 });
    await block.scrollIntoViewIfNeeded();
    await block.hover();
    await block.getByTitle('Start Study').click({ force: true });
  }

  toast(text: string | RegExp) {
    return toast(this.page, text);
  }
}
