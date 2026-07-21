import { expect, type Page } from '@playwright/test';
import { toast } from '../helpers/testData';

export class PomodoroPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto('/pomodoro');
    await expect(this.page.getByRole('heading', { name: 'Focus Sessions' })).toBeVisible({
      timeout: 15_000,
    });
    await expect(this.page.getByText('Loading session…')).toHaveCount(0, { timeout: 15_000 });
  }

  setupModal() {
    return this.page
      .locator('div.fixed.inset-0')
      .filter({ has: this.page.getByRole('heading', { name: 'Session setup' }) });
  }

  async openSetup() {
    await this.page.getByRole('button', { name: 'Start Study' }).click();
    await expect(this.page.getByRole('heading', { name: 'Session setup' })).toBeVisible();
    await expect(this.setupModal().getByRole('button', { name: 'Start Session' })).toBeEnabled({
      timeout: 15_000,
    });
  }

  async setFocusMinutes(minutes: number) {
    const input = this.setupModal().locator('input[type="number"]').first();
    await input.fill(String(minutes));
    await expect(input).toHaveValue(String(minutes));
  }

  async startSession() {
    await this.setupModal().getByRole('button', { name: 'Start Session' }).click();
  }

  async expectTimerVisible() {
    await expect(this.page.getByText('focus', { exact: true })).toBeVisible({ timeout: 15_000 });
    await expect(this.page.getByText('Running', { exact: true })).toBeVisible();
  }

  pauseResumeButton() {
    // Primary circular control — no accessible name
    return this.page.locator('button.h-16.w-16.rounded-full').first();
  }

  async togglePause() {
    await this.pauseResumeButton().click();
  }

  async stopSession() {
    await this.page.getByRole('button', { name: '← Stop session' }).click();
  }

  toast(text: string | RegExp) {
    return toast(this.page, text);
  }
}
