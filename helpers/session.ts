import type { Page } from '@playwright/test';
import type { AuthSession } from './authApi';

export const AUTH_SESSION_STORAGE_KEY = 'loopi_auth_session';

function homePathForRole(role: string): string {
  return role === 'admin' ? '/admin' : '/';
}

/**
 * Seed auth in localStorage once (no addInitScript — that re-runs on every navigation
 * and would restore session after logout → /login reload).
 *
 * After setting storage, navigate to the role home URL. Reloading on /login while
 * authenticated leaves the URL at /login inside the student/admin shell → 404.
 */
export async function injectAuthSession(page: Page, session: AuthSession): Promise<void> {
  await page.goto('/login');
  await page.evaluate(
    ({ key, value }) => {
      window.localStorage.setItem(key, value);
    },
    { key: AUTH_SESSION_STORAGE_KEY, value: JSON.stringify(session) },
  );

  await page.goto(homePathForRole(session.user.role));
  await page.waitForLoadState('domcontentloaded');
}

export async function clearAuthSession(page: Page): Promise<void> {
  await page.evaluate((key) => {
    window.localStorage.removeItem(key);
  }, AUTH_SESSION_STORAGE_KEY);
}

export async function readAuthSession(page: Page): Promise<AuthSession | null> {
  return page.evaluate((key) => {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AuthSession;
    } catch {
      return null;
    }
  }, AUTH_SESSION_STORAGE_KEY);
}
