'use server';

import { ERR_AUTH_EXPIRED, ERR_TOO_MANY_REQUESTS, ERR_UNAUTHORIZED } from '@/lib/constants';
import { db } from '@/lib/db/index';
import { M_File } from '@/lib/db/schema/file';
import { M_Profile, M_User } from '@/lib/db/schema/user';
import { ProfileComplete, UserComplete } from '@/lib/db/types';
import {
  CreateUser,
  createUserSchema,
  CreateUserZod,
  UpdatePassword,
  updatePasswordSchema,
  UpdatePasswordZod,
  UpdateUser,
  updateUserSchema,
  UpdateUserZod,
} from '@/lib/db/zod/user';
import { passValidation, stringTrimmed } from '@/lib/db/zod/utils';
import { logger } from '@/lib/logger';
import { lucia } from '@/lib/lucia/auth';
import { roleIsAdmin, roleIsSuperAdmin } from '@/lib/lucia/rolechecker';
import { isAdmin, isLoggedIn } from '@/lib/lucia/utils';
import rateLimit from '@/lib/rateLimit';
import { ApiReturn, NeedsReAuth, TypedFormData } from '@/lib/types';
import { getTimeMs } from '@/lib/utils';
import { eq, getTableColumns, inArray } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { Argon2id } from 'oslo/password';
import { cache } from 'react';

const { hashedPassword, ...rest } = getTableColumns(M_User);
const profile = getTableColumns(M_Profile);
const avatar = getTableColumns(M_File);

const limiter = rateLimit({
  uniqueTokenPerInterval: 250,
  interval: getTimeMs(15, 'minute'),
});

export const getProfileDataById = cache(async (_csrf: string, userId: string): Promise<ApiReturn<ProfileComplete>> => {
  try {
    const [result] = (await db
      .select({ ...profile, avatar })
      .from(M_Profile)
      .where(eq(M_Profile.userId, userId))
      .leftJoin(M_File, eq(M_File.id, M_Profile.avatarId))) as ProfileComplete[];

    return {
      success: true,
      data: result,
      message: 'Successfully fetched profile data',
    };
  } catch (error) {
    logger.error(error, 'Error fetching profile data');
    return {
      success: false,
      message: `An error occured while fetching profile data ${error}`,
    };
  }
});

export const getAllUsers = cache(async (): Promise<ApiReturn<UserComplete[]>> => {
  await isAdmin(); // make sure user is admin
  try {
    const result = (await db
      .select({ ...rest, profile })
      .from(M_User)
      .leftJoin(M_Profile, eq(M_Profile.userId, M_User.id))
      .leftJoin(M_File, eq(M_File.id, M_Profile.avatarId))) as UserComplete[];

    return {
      success: true,
      data: result,
      message: 'Successfully fecthed all users',
    };
  } catch (error) {
    logger.error(error, 'Error fetching all users');
    return {
      success: false,
      message: `An error occured while fetching users ${error}`,
    };
  }
});

export const addUser = async (form: TypedFormData<CreateUser>): Promise<ApiReturn<NeedsReAuth>> => {
  const { session, user } = await isAdmin(false);
  if (!session) return ERR_AUTH_EXPIRED;

  try {
    const data = createUserSchema.parse({
      username: form.get('username')!,
      password: form.get('password')!,
      role: JSON.parse(form.get('role') as string),
      name: form.get('name')!,
      description: form.get('description')!,
      title: form.get('title')!,
    } satisfies CreateUserZod);
    const hashedPassword = await new Argon2id().hash(data.password);

    // make sure that only super_admin can create super_admin
    if (!roleIsSuperAdmin(user!.role) && data.role.includes('super_admin')) return ERR_UNAUTHORIZED;

    // create user
    const [createdUser] = await db
      .insert(M_User)
      .values({
        username: data.username,
        hashedPassword,
        role: data.role,
      })
      .returning({ insertedId: M_User.id });

    await db.insert(M_Profile).values({
      userId: createdUser.insertedId,
      name: data.name,
      description: data.description,
      title: data.title,
    });

    revalidatePath('/dashboard/user');
    return { success: 1, message: 'Successfully created user' };
  } catch (error) {
    logger.error(error, 'Error creating user');
    return { success: 0, message: 'Error! ' + error };
  }
};

export const updateUser = async (form: TypedFormData<UpdateUser & { id: string }>): Promise<ApiReturn<NeedsReAuth>> => {
  const { session } = await isAdmin(false);
  if (!session) return ERR_AUTH_EXPIRED;

  try {
    const id = stringTrimmed.parse(form.get('id'));
    const data = updateUserSchema.parse({
      username: form.get('username')!,
      role: JSON.parse(form.get('role')!),
      name: form.get('name')!,
      description: form.get('description'),
      title: form.get('title'),
    } satisfies UpdateUserZod);

    await db
      .update(M_User)
      .set({
        username: data.username,
        role: data.role,
      })
      .where(eq(M_User.id, id));

    await db
      .update(M_Profile)
      .set({
        name: data.name,
        description: data.description,
        title: data.title,
      })
      .where(eq(M_Profile.userId, id));

    revalidatePath('/dashboard/user');
    return { success: 1, message: 'Successfully updated user' };
  } catch (error) {
    logger.error(error, 'Error updating user');
    return { success: 0, message: 'Error! ' + error };
  }
};

export const admin_UpdateUserPassword = async (
  form: TypedFormData<UpdatePassword & { id: string }>
): Promise<ApiReturn<NeedsReAuth>> => {
  const { session, user } = await isLoggedIn(false);
  if (!session) return ERR_AUTH_EXPIRED;

  try {
    const id = stringTrimmed.parse(form.get('id'));
    if (!roleIsAdmin(user!.role) && user!.id !== id) return ERR_UNAUTHORIZED;

    const { passwordOld: pass, passwordNew: passConfirm } = updatePasswordSchema.parse({
      passwordOld: form.get('passwordOld')!,
      passwordNew: form.get('passwordNew')!,
    } satisfies UpdatePasswordZod);
    if (pass !== passConfirm) return { success: 0, message: 'Password confirmation does not match!' };

    const hashedPassword = await new Argon2id().hash(passConfirm);
    await db.update(M_User).set({ hashedPassword }).where(eq(M_User.id, id));
    await lucia.invalidateUserSessions(id); // Logout all sessions for this user

    revalidatePath('/dashboard/user');
    return { success: 1, message: 'Successfully updated user password' };
  } catch (error) {
    logger.error(error, 'Error updating user password');
    return { success: 0, message: 'Error! ' + error };
  }
};

// For user
export const user_ChangePassword = async (
  form: TypedFormData<UpdatePassword & { passwordConfirmation: string }>
): Promise<ApiReturn<NeedsReAuth>> => {
  const { session, user } = await isLoggedIn(false);
  if (!session) return ERR_AUTH_EXPIRED;

  // This is for user endpoint so add rate limit
  try {
    const readOnlyHeader = headers();
    const header = new Headers(readOnlyHeader);
    await limiter.check(header, 15, 'CHANGE_PASSWORD');
  } catch (error) {
    return ERR_TOO_MANY_REQUESTS;
  }

  try {
    // Verify old password
    const [qUser] = await db.select().from(M_User).where(eq(M_User.id, user?.id!));
    const isMatch = await new Argon2id().verify(qUser.hashedPassword, form.get('passwordOld')!);
    if (!isMatch) return { success: 0, message: 'Incorrect old password!' };

    const newPassword = passValidation.parse(form.get('passwordNew'));
    const newPasswordConfirmation = passValidation.parse(form.get('passwordConfirmation'));
    if (newPassword !== newPasswordConfirmation)
      return { success: 0, message: 'Password confirmation does not match!' };

    const hashedPassword = await new Argon2id().hash(newPassword);
    await db.update(M_User).set({ hashedPassword }).where(eq(M_User.id, user?.id!));
    await lucia.invalidateUserSessions(session.userId); // Logout all sessions

    revalidatePath('/dashboard/user');
    return { success: 1, message: 'Successfully changed password, please re-authenticate (login)' };
  } catch (error) {
    logger.error(error, 'Error changing password');
    return { success: 0, message: 'Error! ' + error };
  }
};

// profile is already on delete cascade, others are left null
export const deleteUser = async (id: string): Promise<ApiReturn> => {
  const { session } = await isAdmin(false);
  if (!session) return ERR_AUTH_EXPIRED;

  try {
    await db.delete(M_User).where(eq(M_User.id, id));

    revalidatePath('/dashboard/user');
    return { success: 1, message: 'Successfully deleted user' };
  } catch (error) {
    logger.error(error, 'Error deleting user');
    return { success: 0, message: 'Error! ' + error };
  }
};

export const batchDeleteUser = async (ids: string[]): Promise<ApiReturn> => {
  const { session } = await isAdmin(false);
  if (!session) return ERR_AUTH_EXPIRED;

  try {
    await db.delete(M_User).where(inArray(M_User.id, ids));

    revalidatePath('/dashboard/user');
    return { success: 1, message: 'Successfully deleted users' };
  } catch (error) {
    logger.error(error, 'Error deleting users');
    return { success: 0, message: 'Error! ' + error };
  }
};
