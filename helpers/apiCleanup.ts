import { request } from '@playwright/test';
import { env } from './env';

type Json = {
  success?: boolean;
  data?: unknown;
  message?: string;
};

function mondayOfWeek(date = new Date()): string {
  const d = new Date(date);
  const day = (d.getDay() + 6) % 7; // Mon=0 … Sun=6
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - day);
  // Local YYYY-MM-DD — avoid toISOString() UTC day shift
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

async function apiGet<T = unknown>(
  token: string,
  path: string,
  query?: Record<string, string>,
): Promise<T | null> {
  const ctx = await request.newContext({
    baseURL: env.apiURL,
    extraHTTPHeaders: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  try {
    const response = await ctx.get(`/api/v1${path}`, { params: query });
    if (!response.ok()) return null;
    const body = (await response.json()) as Json;
    return (body.data as T) ?? null;
  } finally {
    await ctx.dispose();
  }
}

async function apiDelete(token: string, path: string): Promise<void> {
  const ctx = await request.newContext({
    baseURL: env.apiURL,
    extraHTTPHeaders: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  try {
    await ctx.delete(`/api/v1${path}`);
  } finally {
    await ctx.dispose();
  }
}

async function apiPost(token: string, path: string, data?: unknown): Promise<void> {
  const ctx = await request.newContext({
    baseURL: env.apiURL,
    extraHTTPHeaders: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  try {
    await ctx.post(`/api/v1${path}`, { data: data ?? {} });
  } finally {
    await ctx.dispose();
  }
}

function asArray<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === 'object' && Array.isArray((data as { items?: T[] }).items)) {
    return (data as { items: T[] }).items;
  }
  return [];
}

/** Stop any live focus session so later tests aren't blocked. */
export async function cleanupActiveFocus(token: string): Promise<void> {
  const active = await apiGet<{ id?: string }>(token, '/focus-sessions/active');
  if (!active?.id) return;
  await apiPost(token, `/focus-sessions/${active.id}/abandon`, {
    workElapsedSeconds: 0,
  });
}

export async function cleanupSubjectsByName(token: string, name: string): Promise<void> {
  const list = asArray<{ id: string; name: string }>(await apiGet(token, '/subjects'));
  for (const subject of list.filter((s) => s.name === name)) {
    // Remove planner sessions linked to this subject for the current week first
    await cleanupPlannerSessionsBySubjectId(token, subject.id);
    await apiDelete(token, `/subjects/${subject.id}`);
  }
}

export async function cleanupPlannerSessionsByTitle(token: string, title: string): Promise<void> {
  const weekStartDate = mondayOfWeek();
  const list = asArray<{ id: string; title: string }>(
    await apiGet(token, '/planner/sessions', { weekStartDate }),
  );
  for (const session of list.filter((s) => s.title === title)) {
    await apiDelete(token, `/planner/sessions/${session.id}`);
  }
}

export async function cleanupPlannerSessionsBySubjectId(
  token: string,
  subjectId: string,
): Promise<void> {
  const weekStartDate = mondayOfWeek();
  const list = asArray<{ id: string; subjectId?: string | null }>(
    await apiGet(token, '/planner/sessions', { weekStartDate }),
  );
  for (const session of list.filter((s) => s.subjectId === subjectId)) {
    await apiDelete(token, `/planner/sessions/${session.id}`);
  }
}

export async function cleanupGoalsByTitle(token: string, title: string): Promise<void> {
  const list = asArray<{ id: string; title: string }>(await apiGet(token, '/goals'));
  for (const goal of list.filter((g) => g.title === title)) {
    await apiDelete(token, `/goals/${goal.id}`);
  }
}

export async function cleanupTasksByTitle(token: string, title: string): Promise<void> {
  const list = asArray<{ id: string; title: string }>(await apiGet(token, '/tasks'));
  for (const task of list.filter((t) => t.title === title)) {
    await apiDelete(token, `/tasks/${task.id}`);
  }
}

export async function cleanupContentByTitle(token: string, title: string): Promise<void> {
  const list = asArray<{ id: string; title: string }>(await apiGet(token, '/content'));
  for (const item of list.filter((c) => c.title === title)) {
    await apiDelete(token, `/content/${item.id}`);
  }
}

/**
 * Delete any session that overlaps [startHour, startHour + durationHours) on dayOfWeek.
 * dayOfWeek: Mon=0 … Sun=6 (matches backend DAY_LABELS).
 */
export async function clearPlannerSlot(
  token: string,
  dayOfWeek: number,
  startHour: number,
  durationHours = 1,
): Promise<void> {
  const weekStartDate = mondayOfWeek();
  const sessions = asArray<{
    id: string;
    dayOfWeek: number;
    startHour: number;
    durationHours: number;
  }>(await apiGet(token, '/planner/sessions', { weekStartDate }));

  const end = startHour + durationHours;
  for (const session of sessions) {
    if (Number(session.dayOfWeek) !== dayOfWeek) continue;
    const existStart = Number(session.startHour);
    const existEnd = existStart + Number(session.durationHours);
    if (startHour < existEnd && end > existStart) {
      await apiDelete(token, `/planner/sessions/${session.id}`);
    }
  }
}

/** Remove leftover E2E planner subjects/sessions from previous failed runs. */
export async function cleanupE2ePlannerLeftovers(
  token: string,
  prefix = 'E2E Plan Sub',
): Promise<void> {
  const weekStartDate = mondayOfWeek();
  const sessions = asArray<{ id: string; title: string }>(
    await apiGet(token, '/planner/sessions', { weekStartDate }),
  );
  for (const session of sessions.filter((s) => s.title.startsWith(prefix))) {
    await apiDelete(token, `/planner/sessions/${session.id}`);
  }

  // Free slots used by planner specs (Sat 22:00, Sun 21:00) regardless of title
  await clearPlannerSlot(token, 5, 22, 1);
  await clearPlannerSlot(token, 6, 21, 1);

  const subjects = asArray<{ id: string; name: string }>(await apiGet(token, '/subjects'));
  for (const subject of subjects.filter((s) => s.name.startsWith(prefix))) {
    await cleanupPlannerSessionsBySubjectId(token, subject.id);
    await apiDelete(token, `/subjects/${subject.id}`);
  }
}

/**
 * Best-effort cleanup for E2E leftovers. Never throws — failures are ignored
 * so they don't mask the original test error.
 */
export async function safeCleanup(run: () => Promise<void>): Promise<void> {
  try {
    await run();
  } catch {
    // ignore cleanup errors
  }
}
