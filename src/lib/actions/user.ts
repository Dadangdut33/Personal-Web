"use server";

import { ERR_AUTH_EXPIRED, ERR_TOO_MANY_REQUESTS, ERR_UNAUTHORIZED } from "@/lib/constants";
import { db } from "@/lib/db/index";
import { M_Profile, M_User } from "@/lib/db/schema/drizzle/user";
import { M_File } from "@/lib/db/schema/xata/file";
import { ProfileComplete, UserComplete } from "@/lib/db/types";
import { BASE_XATA_RETURN } from "@/lib/db/utils";
import { createUserSchema, updatePasswordSchema, updateUserSchema } from "@/lib/db/zod/user";
import { passValidation, stringSchema } from "@/lib/db/zod/utils";
import { logger } from "@/lib/logger";
import { lucia } from "@/lib/lucia/auth";
import { isAdmin, isLoggedIn, roleIsAdmin, roleIsSuperAdmin } from "@/lib/lucia/utils";
import rateLimit from "@/lib/rateLimit";
import { ApiReturn, NeedsReAuth } from "@/lib/types";
import { getTimeMs } from "@/lib/utils";
import { eq, getTableColumns, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { Argon2id } from "oslo/password";
import { cache } from "react";

const { hashedPassword, ...rest } = getTableColumns(M_User);
const profile = getTableColumns(M_Profile);
const avatar = getTableColumns(M_File);

const limiter = rateLimit({
  uniqueTokenPerInterval: 250,
  interval: getTimeMs(15, "minute"),
});

export const fetchProfileData = cache(async (_csrf: string, userId: string): Promise<ApiReturn<ProfileComplete>> => {
  try {
    const [result] = (await db
      .select({ ...BASE_XATA_RETURN, ...profile, avatar })
      .from(M_Profile)
      .where(eq(M_Profile.userId, userId))
      .leftJoin(M_File, eq(M_File.id, M_Profile.avatarId))) as ProfileComplete[];

    return {
      success: true,
      data: result,
      message: "Successfully fetched profile data",
    };
  } catch (error) {
    logger.error(error, "Error fetching profile data");
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
      .select({ ...BASE_XATA_RETURN, ...rest, profile })
      .from(M_User)
      .leftJoin(M_Profile, eq(M_Profile.userId, M_User.id))
      .leftJoin(M_File, eq(M_File.id, M_Profile.avatarId))) as UserComplete[];

    return {
      success: true,
      data: result,
      message: "Successfully fecthed all users",
    };
  } catch (error) {
    logger.error(error, "Error fetching all users");
    return {
      success: false,
      message: `An error occured while fetching users ${error}`,
    };
  }
});

export const createUser = async (form: FormData): Promise<ApiReturn<NeedsReAuth>> => {
  const { session, user } = await isAdmin(false);
  if (!session) return ERR_AUTH_EXPIRED;

  try {
    const password = stringSchema.parse(form.get("password"));
    const data = createUserSchema.parse({
      username: form.get("username"),
      password: password,
      role: form.get("role"),
      name: form.get("name"),
      description: form.get("description"),
      title: form.get("title"),
    });
    const hashedPassword = await new Argon2id().hash(password);

    // make sure that only super_admin can create super_admin
    if (!roleIsSuperAdmin(user!.role) && data.role.includes("super_admin")) return ERR_UNAUTHORIZED;

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

    revalidatePath("/dashboard/user");
    return { success: 1, message: "Successfully created user" };
  } catch (error) {
    logger.error(error, "Error creating user");
    return { success: 0, message: "Error! " + error };
  }
};

export const updateUser = async (form: FormData): Promise<ApiReturn<NeedsReAuth>> => {
  const { session } = await isAdmin(false);
  if (!session) return ERR_AUTH_EXPIRED;

  try {
    const id = stringSchema.parse(form.get("id"));
    const data = updateUserSchema.parse({
      username: form.get("username"),
      role: form.get("role"),
      name: form.get("name"),
      description: form.get("description"),
      title: form.get("title"),
    });

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

    revalidatePath("/dashboard/user");
    return { success: 1, message: "Successfully updated user" };
  } catch (error) {
    logger.error(error, "Error updating user");
    return { success: 0, message: "Error! " + error };
  }
};

export const updateUserPassword = async (form: FormData): Promise<ApiReturn<NeedsReAuth>> => {
  const { session, user } = await isLoggedIn(false);
  if (!session) return ERR_AUTH_EXPIRED;

  try {
    const id = stringSchema.parse(form.get("id"));
    if (!roleIsAdmin(user!.role) && user!.id !== id) return ERR_UNAUTHORIZED;

    const { oldPassword: pass, newPassword: passConfirm } = updatePasswordSchema.parse({
      oldPassword: form.get("password"),
      newPassword: form.get("passwordConfirmation"),
    });
    if (pass !== passConfirm) return { success: 0, message: "Password confirmation does not match!" };

    const hashedPassword = await new Argon2id().hash(passConfirm);
    await db.update(M_User).set({ hashedPassword }).where(eq(M_User.id, id));
    await lucia.invalidateUserSessions(id); // Logout all sessions for this user

    revalidatePath("/dashboard/user");
    return { success: 1, message: "Successfully updated user password" };
  } catch (error) {
    logger.error(error, "Error updating user password");
    return { success: 0, message: "Error! " + error };
  }
};

export const changePassword = async (form: FormData): Promise<ApiReturn<NeedsReAuth>> => {
  const { session, user } = await isLoggedIn(false);
  if (!session) return ERR_AUTH_EXPIRED;

  // This is for user endpoint so add rate limit
  try {
    const readOnlyHeader = headers();
    const header = new Headers(readOnlyHeader);
    await limiter.check(header, 15, "CHANGE_PASSWORD");
  } catch (error) {
    return ERR_TOO_MANY_REQUESTS;
  }

  try {
    const id = stringSchema.parse(form.get("id"));

    if (!roleIsAdmin(user!.role) && user!.id !== id) return ERR_UNAUTHORIZED;

    // Verify old password
    const oldPassword = stringSchema.parse(form.get("passwordOld"));
    const [qUser] = await db.select().from(M_User).where(eq(M_User.id, id));
    const isMatch = await new Argon2id().verify(qUser.hashedPassword, oldPassword);
    if (!isMatch) return { success: 0, message: "Incorrect old password!" };

    const newPassword = passValidation.parse(form.get("password"));
    const newPasswordConfirmation = passValidation.parse(form.get("passwordConfirmation"));
    if (newPassword !== newPasswordConfirmation)
      return { success: 0, message: "Password confirmation does not match!" };

    const hashedPassword = await new Argon2id().hash(newPassword);
    await db.update(M_User).set({ hashedPassword }).where(eq(M_User.id, id));
    await lucia.invalidateUserSessions(session.userId); // Logout all sessions

    revalidatePath("/dashboard/user");
    return { success: 1, message: "Successfully changed password, please re-authenticate (login)" };
  } catch (error) {
    logger.error(error, "Error changing password");
    return { success: 0, message: "Error! " + error };
  }
};

// profile is already on delete cascade, others are left null
export const deleteUser = async (id: string): Promise<ApiReturn> => {
  const { session } = await isAdmin(false);
  if (!session) return ERR_AUTH_EXPIRED;

  try {
    await db.delete(M_User).where(eq(M_User.id, id));

    revalidatePath("/dashboard/user");
    return { success: 1, message: "Successfully deleted user" };
  } catch (error) {
    logger.error(error, "Error deleting user");
    return { success: 0, message: "Error! " + error };
  }
};

export const batchDeleteUser = async (ids: string[]): Promise<ApiReturn> => {
  const { session } = await isAdmin(false);
  if (!session) return ERR_AUTH_EXPIRED;

  try {
    await db.delete(M_User).where(inArray(M_User.id, ids));

    revalidatePath("/dashboard/user");
    return { success: 1, message: "Successfully deleted users" };
  } catch (error) {
    logger.error(error, "Error deleting users");
    return { success: 0, message: "Error! " + error };
  }
};
