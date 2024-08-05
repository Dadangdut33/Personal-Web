import { ERR_AUTH_EXPIRED } from '@/lib/constants';
import { db } from '@/lib/db';
import { M_User, M_UserTwoFactorBackupCodes } from '@/lib/db/schema';
import { passValidation, stringTrimmed } from '@/lib/db/zod/utils';
import { logger } from '@/lib/logger';
import { getUserAuth } from '@/lib/lucia/utils';
import { ApiReturn, TypedFormData } from '@/lib/types';
import { and, eq } from 'drizzle-orm';
import { TimeSpan } from 'lucia';
import { revalidatePath } from 'next/cache';
import { alphabet, generateRandomString } from 'oslo/crypto';
import { decodeHex, encodeHex } from 'oslo/encoding';
import { createTOTPKeyURI, TOTPController } from 'oslo/otp';
import { Argon2id } from 'oslo/password';

export async function getTwoFactorURI(_csrf: string): Promise<ApiReturn> {
  const { session } = await getUserAuth();
  if (!session) return ERR_AUTH_EXPIRED;

  if (session.user.setupTwoFactor) return { success: 0, message: '2FA is already setup' };

  try {
    const twoFactorSecret = crypto.getRandomValues(new Uint8Array(20));
    const aMinuteTimespan = new TimeSpan(60, 's');
    const uri = createTOTPKeyURI("Dadangdut33's Site", session.user.username, twoFactorSecret, {
      period: aMinuteTimespan,
    });

    return { success: 1, data: { uri, secret: encodeHex(twoFactorSecret) } };
  } catch (error) {
    logger.error(error, 'Error getting two factor URI');
    return { success: 0, message: 'Error getting two factor URI! ' + error };
  }
}

export async function verifyTwoFactor(form: TypedFormData<{ token: string; secret: string }>): Promise<ApiReturn> {
  const { session } = await getUserAuth();
  if (!session) return ERR_AUTH_EXPIRED;

  try {
    const token = stringTrimmed.parse(form.get('token'));
    const secret = stringTrimmed.parse(form.get('secret'));
    const validOTP = await new TOTPController().verify(token, decodeHex(secret));
    if (!validOTP) return { success: 0, message: 'Invalid token' };

    const [user] = await db
      .update(M_User)
      .set({ twoFactorSecret: secret })
      .where(eq(M_User.id, session.user.id))
      .returning({ id: M_User.id });

    // remove previous backup codes
    await db.delete(M_UserTwoFactorBackupCodes).where(eq(M_UserTwoFactorBackupCodes.userId, user.id));

    // generate 12 random backup codes
    const backupCodes = Array.from({ length: 12 }, () => generateRandomString(6, alphabet('0-9')));
    await db.insert(M_UserTwoFactorBackupCodes).values(backupCodes.map((codes) => ({ userId: user.id, codes })));

    revalidatePath('/dashboard/account');
    return { success: 1, message: 'Successfully activated two factor authentication' };
  } catch (error) {
    logger.error(error, 'Error verifying two factor');
    return { success: 0, message: 'Error verifying two factor! ' + error };
  }
}

export async function loginToSeeBackupCodes(form: TypedFormData<{ password: string }>): Promise<ApiReturn> {
  const { session } = await getUserAuth();
  if (!session) return ERR_AUTH_EXPIRED;

  try {
    const password = passValidation.parse(form.get('password'));
    const [user] = await db.select().from(M_User).where(eq(M_User.id, session.user.id));
    const validPassword = await new Argon2id().verify(user!.hashedPassword, password);
    if (!validPassword) return { success: 0, message: 'Invalid password' };

    const codes = await db
      .select()
      .from(M_UserTwoFactorBackupCodes)
      .where(eq(M_UserTwoFactorBackupCodes.userId, user!.id));
    if (codes.length === 0)
      return { success: 1, message: 'No backup codes found. Please generate new backup codes', data: [] };

    return { success: 1, data: codes.map((code) => code.codes) };
  } catch (error) {
    logger.error(error, 'Error getting backup codes');
    return { success: 0, message: 'Error getting backup codes! ' + error };
  }
}

export async function regenerateBackupCodes(_csrf: string): Promise<ApiReturn> {
  const { session } = await getUserAuth();
  if (!session) return ERR_AUTH_EXPIRED;

  try {
    // remove previous backup codes
    await db.delete(M_UserTwoFactorBackupCodes).where(eq(M_UserTwoFactorBackupCodes.userId, session.user.id));

    // generate 12 random backup codes
    const backupCodes = Array.from({ length: 12 }, () => generateRandomString(6, alphabet('0-9')));
    await db
      .insert(M_UserTwoFactorBackupCodes)
      .values(backupCodes.map((codes) => ({ userId: session.user.id, codes })));

    return { success: 1, message: 'Successfully regenerated backup codes', data: backupCodes };
  } catch (error) {
    logger.error(error, 'Error regenerating backup codes');
    return { success: 0, message: 'Error regenerating backup codes! ' + error };
  }
}

export async function disableTwoFactor(form: TypedFormData<{ password: string; token: string }>): Promise<ApiReturn> {
  const { session } = await getUserAuth();
  if (!session) return ERR_AUTH_EXPIRED;

  try {
    const password = passValidation.parse(form.get('password'));
    const [user] = await db.select().from(M_User).where(eq(M_User.id, session.user.id));
    const validPassword = await new Argon2id().verify(user!.hashedPassword, password);
    if (!validPassword) return { success: 0, message: 'Invalid password' };

    const token = stringTrimmed.parse(form.get('token'));
    const validOTP = await new TOTPController().verify(token, decodeHex(user.twoFactorSecret!));
    if (!validOTP) {
      // check backup codes
      const [backupCode] = await db
        .delete(M_UserTwoFactorBackupCodes)
        .where(and(eq(M_UserTwoFactorBackupCodes.userId, user.id), eq(M_UserTwoFactorBackupCodes.codes, token)))
        .returning({ codes: M_UserTwoFactorBackupCodes.codes });

      if (!backupCode) return { success: 0, message: 'Invalid token' };
    }

    // disable two factor
    await db.update(M_User).set({ twoFactorSecret: null }).where(eq(M_User.id, session.user.id));

    // remove backup codes
    await db.delete(M_UserTwoFactorBackupCodes).where(eq(M_UserTwoFactorBackupCodes.userId, session.user.id));

    revalidatePath('/dashboard/account');
    return { success: 1, message: 'Successfully disabled two factor authentication' };
  } catch (error) {
    logger.error(error, 'Error disabling two factor');
    return { success: 0, message: 'Error disabling two factor! ' + error };
  }
}

export async function deleteAccount(form: TypedFormData<{ password: string }>): Promise<ApiReturn> {
  // this is used in the reauth component so the two factor will also get checked before this if enabled by user
  const { session } = await getUserAuth();
  if (!session) return ERR_AUTH_EXPIRED;

  try {
    const password = passValidation.parse(form.get('password'));
    const [user] = await db.select().from(M_User).where(eq(M_User.id, session.user.id));
    const validPassword = await new Argon2id().verify(user!.hashedPassword, password);
    if (!validPassword) return { success: 0, message: 'Invalid password' };

    await db.delete(M_User).where(eq(M_User.id, session.user.id));
    revalidatePath('/logout');
    return { success: 1, message: 'Successfully deleted account' };
  } catch (error) {
    logger.error(error, 'Error deleting account');
    return { success: 0, message: 'Error deleting account! ' + error };
  }
}
