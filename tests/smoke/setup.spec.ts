import { test, expect } from '@playwright/test';
import { env } from '../../helpers/env';
import { checkBackendHealth, waitForHealth } from '../../helpers/health';
import { waitForFrontend } from '../../helpers/frontend';
import { users } from '../../data/users';
import fs from 'fs';
import path from 'path';

test.describe('project setup', () => {
  test('loads base URL and API URL from env', () => {
    expect(env.baseURL).toMatch(/^https?:\/\//);
    expect(env.apiURL).toMatch(/^https?:\/\//);
  });

  test('exposes seeded user credentials', () => {
    expect(users.student.email).toContain('@');
    expect(users.student.password.length).toBeGreaterThan(0);
    expect(users.admin.email).toContain('@');
    expect(users.locked.email).toContain('@');
    expect(users.jamie.email).toContain('@');
    expect(users.riley.email).toContain('@');
  });

  test('keeps suite folders present', () => {
    const root = path.join(__dirname, '..');
    for (const suite of ['smoke', 'auth', 'student', 'study', 'quiz', 'admin']) {
      expect(fs.existsSync(path.join(root, suite))).toBe(true);
    }
  });
});

test.describe('backend health', () => {
  test.skip(!env.requireServices, 'Set REQUIRE_SERVICES=true when backend is running');

  test('GET /health responds ok', async ({ request }) => {
    await waitForHealth({ api: request, timeoutMs: 15_000 });
    const result = await checkBackendHealth(request);
    expect(result.ok).toBe(true);
    expect(result.status).toBe(200);
  });
});

test.describe('frontend health', () => {
  test.skip(!env.requireServices, 'Set REQUIRE_SERVICES=true when frontend is running');

  test('base URL responds', async ({ page }) => {
    await waitForFrontend({ timeoutMs: 15_000 });
    const response = await page.goto('/');
    expect(response?.ok() || response?.status() === 200 || response?.status() === 304).toBeTruthy();
  });
});
