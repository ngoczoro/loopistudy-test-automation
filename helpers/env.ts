import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (value === undefined || value === '') {
    throw new Error(`Missing env var: ${name}. Copy .env.example to .env`);
  }
  return value;
}

/**
 * Prefer IPv4 for API only.
 * Vite often listens on ::1 only — keep BASE_URL as localhost so the browser can reach it.
 * Backend accepts 127.0.0.1 and avoids Playwright resolving localhost → ::1 inconsistently.
 */
function preferIpv4(url: string): string {
  return url.replace(/:\/\/localhost(?=[:/]|$)/i, '://127.0.0.1');
}

export const env = {
  // Do NOT force IPv4 here — FE may only be on [::1]
  baseURL: required('BASE_URL', 'http://localhost:5173'),
  apiURL: preferIpv4(required('API_URL', 'http://127.0.0.1:5000')),
  requireServices: (process.env.REQUIRE_SERVICES ?? 'false').toLowerCase() === 'true',
  student: {
    email: required('STUDENT_EMAIL', 'alex.demo@loopi.com'),
    password: required('STUDENT_PASSWORD', 'Demo1234!'),
  },
  admin: {
    email: required('ADMIN_EMAIL', 'admin@loopi.com'),
    password: required('ADMIN_PASSWORD', 'admin123'),
  },
  locked: {
    email: required('LOCKED_EMAIL', 'sam.demo@loopi.com'),
    password: required('LOCKED_PASSWORD', 'Demo1234!'),
  },
};
