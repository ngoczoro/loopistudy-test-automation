# Loopi Study — Playwright E2E

Automation suite for [Loopi Study](https://github.com/ngoczoro) (web + backend).

## Prerequisites

1. **Backend** on `http://127.0.0.1:5000` with demo seed  
   `npm run db:seed:demo` (or `db:reset:demo`)
2. **Frontend** on `http://localhost:5173` (`npm run dev`)
3. Copy env: `cp .env.example .env` then set `REQUIRE_SERVICES=true`

### Seeded accounts

| Role | Email | Password |
|------|-------|----------|
| Student | `alex.demo@loopi.com` | `Demo1234!` |
| Admin | `admin@loopi.com` | `admin123` |
| Locked | `sam.demo@loopi.com` | `Demo1234!` |
| Lock/unlock target | `jamie.demo@loopi.com` | `Demo1234!` |

## Install

```bash
npm ci
npx playwright install chromium
```

## Scripts

| Script | What it runs |
|--------|----------------|
| `npm run test:ci:smoke` | Env/config smoke (no live services) |
| `npm run test:ci` | All suites, Chromium only (needs services) |
| `npm run test:auth` | Auth |
| `npm run test:student` | Student CRUD |
| `npm run test:study` | Pomodoro + planner |
| `npm run test:quiz` | Quiz + AI-adjacent (no OpenAI key) |
| `npm run test:admin` | Admin dashboard / users / violations |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run report` | Open last HTML report |

## Layout

```
tests/
  smoke/     # always runnable
  auth/
  student/
  study/
  quiz/
  admin/
pages/       # page objects
helpers/     # env, health, session, API cleanup
fixtures/    # auth fixtures (asStudent / asAdmin)
```

## CI

GitHub Actions (`.github/workflows/playwright.yml`):

1. **Smoke (every PR/push)** — typecheck + smoke suite with `REQUIRE_SERVICES=false` (no FE/BE).
2. **E2E (manual `workflow_dispatch`)** — Chromium suite against a live stack. Configure repo secrets:

   - `E2E_BASE_URL`, `E2E_API_URL`
   - `E2E_STUDENT_EMAIL` / `E2E_STUDENT_PASSWORD`
   - `E2E_ADMIN_EMAIL` / `E2E_ADMIN_PASSWORD`
   - `E2E_LOCKED_EMAIL` / `E2E_LOCKED_PASSWORD`

Full local parity: start FE + BE + seed, then `REQUIRE_SERVICES=true npm run test:ci`.

## Notes

- Suites that need the app call `test.skip(!env.requireServices, …)`.
- Prefer API cleanup in `finally` so failed runs don’t leave Sat 22:00 / Jamie locked leftovers.
- AI generate-quiz flows need `OPENAI_API_KEY`; covered scenarios use seed data / non-LLM paths.
