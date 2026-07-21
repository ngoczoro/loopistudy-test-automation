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

export const env = {
  baseURL: required('BASE_URL', 'http://localhost:5173'),
  apiURL: required('API_URL', 'http://localhost:5000'),
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
