import { request, type APIRequestContext } from '@playwright/test';
import { env } from './env';

export type HealthResult = {
  ok: boolean;
  status: number;
  body?: unknown;
  error?: string;
};

/**
 * Hits GET /health on the backend. Used before suites that need live services.
 */
export async function checkBackendHealth(api?: APIRequestContext): Promise<HealthResult> {
  const ownContext = !api;
  const ctx = api ?? (await request.newContext());

  try {
    const response = await ctx.get(`${env.apiURL}/health`, { timeout: 10_000 });
    const status = response.status();
    let body: unknown;
    try {
      body = await response.json();
    } catch {
      body = await response.text();
    }

    return {
      ok: response.ok(),
      status,
      body,
    };
  } catch (err) {
    return {
      ok: false,
      status: 0,
      error: err instanceof Error ? err.message : String(err),
    };
  } finally {
    if (ownContext) {
      await ctx.dispose();
    }
  }
}

/**
 * Polls backend health until ready or timeout.
 * Throws with a clear message if the API never comes up.
 */
export async function waitForHealth(options?: {
  timeoutMs?: number;
  intervalMs?: number;
  api?: APIRequestContext;
}): Promise<void> {
  const timeoutMs = options?.timeoutMs ?? 30_000;
  const intervalMs = options?.intervalMs ?? 1_000;
  const deadline = Date.now() + timeoutMs;

  let last: HealthResult = { ok: false, status: 0, error: 'not started' };

  while (Date.now() < deadline) {
    last = await checkBackendHealth(options?.api);
    if (last.ok) return;
    await new Promise((r) => setTimeout(r, intervalMs));
  }

  const detail = last.error ?? `status ${last.status}`;
  throw new Error(
    `Backend not healthy at ${env.apiURL}/health (${detail}). ` +
      `Start loopistudy-backend and run npm run db:seed:demo before E2E.`,
  );
}
