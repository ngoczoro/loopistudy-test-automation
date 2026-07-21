import { request } from '@playwright/test';
import { env } from './env';

/**
 * Ensures the Vite frontend is reachable before UI navigation.
 * Vite on Windows often binds [::1] only — BASE_URL should stay as http://localhost:5173.
 */
export async function waitForFrontend(options?: {
  timeoutMs?: number;
  intervalMs?: number;
}): Promise<void> {
  const timeoutMs = options?.timeoutMs ?? 15_000;
  const intervalMs = options?.intervalMs ?? 1_000;
  const deadline = Date.now() + timeoutMs;
  const ctx = await request.newContext();
  let lastError = 'not started';

  try {
    while (Date.now() < deadline) {
      try {
        const response = await ctx.get(env.baseURL, { timeout: 5_000 });
        if (response.status() < 500) return;
        lastError = `status ${response.status()}`;
      } catch (err) {
        lastError = err instanceof Error ? err.message : String(err);
      }
      await new Promise((r) => setTimeout(r, intervalMs));
    }
  } finally {
    await ctx.dispose();
  }

  throw new Error(
    `Frontend not reachable at ${env.baseURL} (${lastError}). ` +
      `Start loopi-study-web (npm run dev). ` +
      `If you set BASE_URL=http://127.0.0.1:5173 but Vite only listens on [::1], switch back to http://localhost:5173.`,
  );
}
