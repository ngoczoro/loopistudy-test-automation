import { test as base, expect } from '@playwright/test';
import { waitForHealth } from '../helpers/health';
import { loginViaApi, type AuthSession } from '../helpers/authApi';
import { injectAuthSession } from '../helpers/session';
import { users } from '../data/users';
import { LoginPage } from '../pages/LoginPage';

type AuthFixtures = {
  loginPage: LoginPage;
  studentSession: AuthSession;
  adminSession: AuthSession;
  asStudent: void;
  asAdmin: void;
};

/**
 * Auth fixtures require live frontend + backend.
 * Specs should `test.skip(!env.requireServices, ...)` at describe level.
 */
export const test = base.extend<AuthFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  studentSession: async ({}, use) => {
    await waitForHealth({ timeoutMs: 15_000 });
    const session = await loginViaApi(users.student.email, users.student.password);
    await use(session);
  },

  adminSession: async ({}, use) => {
    await waitForHealth({ timeoutMs: 15_000 });
    const session = await loginViaApi(users.admin.email, users.admin.password);
    await use(session);
  },

  asStudent: async ({ page, studentSession }, use) => {
    await injectAuthSession(page, studentSession);
    await use();
  },

  asAdmin: async ({ page, adminSession }, use) => {
    await injectAuthSession(page, adminSession);
    await use();
  },
});

export { expect };
