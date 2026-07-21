import { env } from '../helpers/env';

/** Seeded accounts from backend `npm run db:seed:demo` */
export const users = {
  student: env.student,
  admin: env.admin,
  locked: env.locked,
} as const;
