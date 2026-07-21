import { test, expect } from '@playwright/test';
import { env } from '../../helpers/env';
import { checkBackendHealth, waitForHealth } from '../../helpers/health';
import { users } from '../../data/users';

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
