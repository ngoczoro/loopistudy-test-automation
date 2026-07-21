import { env } from '../helpers/env';

/** Seeded accounts from backend `npm run db:seed:demo` */
export const users = {
  student: env.student,
  admin: env.admin,
  locked: env.locked,
  /** Safe lock/unlock target — keep Sam locked for negative login tests */
  jamie: {
    email: 'jamie.demo@loopi.com',
    password: 'Demo1234!',
    name: 'Jamie Lee',
  },
  riley: {
    email: 'riley.demo@loopi.com',
    password: 'Demo1234!',
    name: 'Riley Chen',
  },
} as const;
