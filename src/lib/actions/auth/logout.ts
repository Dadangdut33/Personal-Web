'use server';

import { setRedirectMsgCookie } from '@/lib/cookies';
import { logger } from '@/lib/logger';
import { lucia, validateSignedIn } from '@/lib/lucia/auth';
import { setAuthCookie } from '@/lib/lucia/utils';
import { ApiReturn } from '@/lib/types';
import { redirect } from 'next/navigation';

export async function signOutAction(_csrf: string): Promise<ApiReturn> {
  const { session } = await validateSignedIn();
  if (!session) {
    return {
      success: false,
      message: 'Unauthorized',
    };
  }

  await lucia.invalidateSession(session.id);
  const sessionCookie = lucia.createBlankSessionCookie();
  logger.info(`User ${session.userId} signed out`);
  setAuthCookie(sessionCookie);
  setRedirectMsgCookie('You have been signed out successfully');
  redirect('/');
}
