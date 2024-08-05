'use server';

import { ERR_GENERIC, ERR_INVALID_AUTH, ERR_TOO_MANY_REQUESTS, TEMP_SESSION_AGE } from '@/lib/constants';
import { setRedirectMsgCookie } from '@/lib/cookies';
import { db } from '@/lib/db/index';
import { SessionTemp } from '@/lib/db/schema';
import { M_User, M_UserTwoFactorBackupCodes } from '@/lib/db/schema/user';
import { logger } from '@/lib/logger';
import { lucia } from '@/lib/lucia/auth';
import { validateAuthFormData } from '@/lib/lucia/form';
import { setAuthCookie } from '@/lib/lucia/utils';
import rateLimit from '@/lib/rateLimit';
import { ApiReturn, NeedsTwoFactor } from '@/lib/types';
import { getTimeMs } from '@/lib/utils';
import { and, eq } from 'drizzle-orm';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { decodeHex } from 'oslo/encoding';
import { TOTPController } from 'oslo/otp';
import { Argon2id } from 'oslo/password';

const limiter = rateLimit({
  uniqueTokenPerInterval: 250,
  interval: getTimeMs(15, 'minute'),
});

export async function signInAction(formData: FormData): Promise<ApiReturn<NeedsTwoFactor>> {
  logger.debug(formData, 'Sign in data 0');
  const reAuth = formData.get('reAuth') === 'true';
  try {
    const readOnlyHeader = headers();
    const header = new Headers(readOnlyHeader);
    await limiter.check(header, 15, reAuth ? 'REAUTH' : 'SIGN_IN');
  } catch (error) {
    return ERR_TOO_MANY_REQUESTS;
  }

  const { data, error } = validateAuthFormData(formData);
  if (error !== null) return { success: false, message: error };

  try {
    const [existingUser] = await db.select().from(M_User).where(eq(M_User.username, data.username));
    if (!existingUser) return ERR_INVALID_AUTH;

    const validPassword = await new Argon2id().verify(existingUser.hashedPassword, data.password);
    if (!validPassword) return ERR_INVALID_AUTH;

    // validate wether two factor is setup
    if (existingUser.twoFactorSecret)
      return {
        success: true,
        data: { needsTwoFactor: true },
        message: 'Continue login by inputting your two factor token',
      };

    const session = await lucia.createSession(existingUser.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    setAuthCookie(sessionCookie);
    logger.info(existingUser, `Signed in | No Two-FA | type: ${reAuth ? 'Reauth' : 'Login'}`);
    if (!reAuth && !data.rememberMe)
      // if not reauth, check remember or not
      await db.insert(SessionTemp).values({
        sessionId: session.id, // checked in CRON to delete sessions
        expiresAt: new Date(Date.now() + TEMP_SESSION_AGE),
      });
  } catch (e) {
    logger.error(e, 'Error signing in');
    return ERR_GENERIC;
  }

  if (!reAuth) {
    setRedirectMsgCookie('Welcome!');
    return redirect(decodeURIComponent(data.redirect || '/dashboard'));
  } else {
    return { success: true, data: { needsTwoFactor: false }, message: 'Reauthenticated!' };
  }
}

export async function verifyTwoFactorToken(formData: FormData): Promise<ApiReturn> {
  const reAuth = formData.get('reAuth') === 'true';
  try {
    const readOnlyHeader = headers();
    const header = new Headers(readOnlyHeader);
    await limiter.check(header, 15, 'VERIFY_TWO_FACTOR');
  } catch (error) {
    return ERR_TOO_MANY_REQUESTS;
  }

  const { data, error } = validateAuthFormData(formData);
  if (error !== null) return { success: false, message: error };

  if (!data.token) return { success: false, message: 'Invalid token!' };

  const [existingUser] = await db.select().from(M_User).where(eq(M_User.username, data.username));
  if (!existingUser) return ERR_INVALID_AUTH;

  try {
    const validPassword = await new Argon2id().verify(existingUser.hashedPassword, data.password);
    if (!validPassword) return ERR_INVALID_AUTH;

    const validOTP = await new TOTPController().verify(data.token, decodeHex(existingUser.twoFactorSecret!));
    if (!validOTP) {
      const [validBackupCode] = await db
        .select()
        .from(M_UserTwoFactorBackupCodes)
        .where(
          and(eq(M_UserTwoFactorBackupCodes.userId, existingUser.id), eq(M_UserTwoFactorBackupCodes.codes, data.token))
        );

      if (!validBackupCode) {
        return { success: false, message: 'Invalid token!' };
      } else {
        await db
          .delete(M_UserTwoFactorBackupCodes) //
          .where(eq(M_UserTwoFactorBackupCodes.id, validBackupCode.id));
      }
    }

    const session = await lucia.createSession(existingUser.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    setAuthCookie(sessionCookie);
    logger.info(existingUser, `Signed in | With Two-FA | type: ${reAuth ? 'Reauth' : 'Login'}`);
    if (!reAuth && !data.rememberMe)
      // if not reauth, check remember or not
      await db.insert(SessionTemp).values({
        sessionId: session.id,
        expiresAt: new Date(Date.now() + TEMP_SESSION_AGE),
      });
  } catch (e) {
    logger.error(e, 'Error verifying two factor token in login');
    return ERR_GENERIC;
  }

  if (!reAuth) {
    setRedirectMsgCookie('Welcome!');
    return redirect(decodeURIComponent(data.redirect || '/dashboard'));
  } else {
    return { success: true, message: 'Reauthenticated successfully!' };
  }
}
