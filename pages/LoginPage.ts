import { expect, type Locator, type Page } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly signUpTab: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByPlaceholder('Email', { exact: true });
    this.passwordInput = page.getByPlaceholder('Password', { exact: true });
    this.submitButton = page.locator('form').getByRole('button', { name: 'Log In' });
    this.signUpTab = page.getByRole('button', { name: 'Sign Up' }).first();
  }

  async goto() {
    await this.page.goto('/login');
    await expect(this.emailInput).toBeVisible();
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async expectRedirectForRole(role: 'student' | 'admin') {
    const pattern = role === 'admin' ? /\/admin(\/|$|\?)/ : /\/($|\?)/;
    await expect(this.page).toHaveURL(pattern, { timeout: 15_000 });
  }

  toast(text: string | RegExp) {
    return this.page.locator('[data-sonner-toast]').filter({ hasText: text });
  }
}
