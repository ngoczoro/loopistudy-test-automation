import { request, type APIRequestContext } from '@playwright/test';
import { env } from './env';

export type AuthUser = {
  id: string | number;
  email: string;
  fullName?: string;
  role: string;
  status?: string;
  avatarUrl?: string | null;
};

export type AuthSession = {
  user: AuthUser;
  accessToken: string;
  refreshToken: string | null;
};

type LoginApiBody = {
  success: boolean;
  message?: string;
  data?: {
    user: AuthUser;
    accessToken: string;
    refreshToken?: string | null;
  };
};

export async function loginViaApi(
  email: string,
  password: string,
  api?: APIRequestContext,
): Promise<AuthSession> {
  const own = !api;
  const ctx = api ?? (await request.newContext());

  try {
    const response = await ctx.post(`${env.apiURL}/api/v1/auth/login`, {
      data: { email, password },
      headers: { 'Content-Type': 'application/json' },
    });

    const body = (await response.json()) as LoginApiBody;

    if (!response.ok() || !body.success || !body.data?.accessToken || !body.data.user) {
      throw new Error(
        `API login failed for ${email}: ${body.message ?? response.status()}`,
      );
    }

    return {
      user: body.data.user,
      accessToken: body.data.accessToken,
      refreshToken: body.data.refreshToken ?? null,
    };
  } finally {
    if (own) {
      await ctx.dispose();
    }
  }
}
