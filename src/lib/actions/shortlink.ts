import { ERR_AUTH_EXPIRED } from '@/lib/constants';
import { db } from '@/lib/db';
import { M_Shortlink } from '@/lib/db/schema';
import { QShortlink } from '@/lib/db/types';
import { increment } from '@/lib/db/utils';
import { CreateShortlink, CreateShortLinkZod, insertShortlinkSchema } from '@/lib/db/zod/shortlink';
import { logger } from '@/lib/logger';
import { isAdmin } from '@/lib/lucia/utils';
import { ApiReturn, DeleteParams, TypedFormData } from '@/lib/types';
import { eq, inArray } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { cache } from 'react';

export const getShortlinkById = cache(async (_csrf: string, shorten: string): Promise<ApiReturn<QShortlink>> => {
  const { session } = await isAdmin(false);
  if (!session) return ERR_AUTH_EXPIRED;

  try {
    const [shortlink] = await db
      .update(M_Shortlink)
      .set({ clicks: increment(M_Shortlink.clicks, 1) })
      .where(eq(M_Shortlink.shorten, shorten))
      .returning();

    if (!shortlink) return { success: 0, message: 'Shortlink not found' };

    return { success: 1, data: shortlink, message: 'Successfully fetched shortlink' };
  } catch (error) {
    logger.error(error, 'Error fetching shortlink');
    return { success: 0, message: `An error occured while fetching shortlink ${error}` };
  }
});

export const getAllShortlinks = cache(async (): Promise<ApiReturn<QShortlink>> => {
  const { session } = await isAdmin(false);
  if (!session) return ERR_AUTH_EXPIRED;

  try {
    const shortlinks = await db.select().from(M_Shortlink);
    return { success: 1, data: shortlinks, message: 'Successfully fetched shortlinks' };
  } catch (error) {
    logger.error(error, 'Error fetching shortlinks');
    return { success: 0, message: `An error occured while fetching shortlinks ${error}` };
  }
});

export const addShortLink = async (form: TypedFormData<CreateShortlink>): Promise<ApiReturn> => {
  const { session } = await isAdmin(false);
  if (!session) return ERR_AUTH_EXPIRED;

  try {
    const parsed = insertShortlinkSchema.parse({
      url: form.get('url')!,
      shorten: form.get('shorten')!,
    } satisfies CreateShortLinkZod);
    const [data] = await db.insert(M_Shortlink).values(parsed).returning();

    revalidatePath('/dashboard/shortlink');
    logger.info(data, 'Created shortlink');
    return { success: 1, message: 'Successfully created shortlink' };
  } catch (error) {
    logger.error(error, 'Error creating shortlink');
    return { success: 0, message: `An error occured while creating shortlink ${error}` };
  }
};

export const updateShortLink = async (form: TypedFormData<CreateShortlink>): Promise<ApiReturn> => {
  const { session } = await isAdmin(false);
  if (!session) return ERR_AUTH_EXPIRED;

  try {
    const { id, ...parsed } = insertShortlinkSchema.parse({
      id: form.get('id') as string,
      url: form.get('url') as string,
      shorten: form.get('shorten') as string,
    } satisfies CreateShortLinkZod);
    const [data] = await db.update(M_Shortlink).set(parsed).where(eq(M_Shortlink.id, id!)).returning();

    revalidatePath('/dashboard/shortlink');
    logger.info(data, 'Updated shortlink');
    return { success: 1, message: 'Successfully updated shortlink' };
  } catch (error) {
    logger.error(error, 'Error updating shortlink');
    return { success: 0, message: `An error occured while updating shortlink ${error}` };
  }
};

export const deleteShortLink = async (form: TypedFormData<DeleteParams>): Promise<ApiReturn> => {
  const { session } = await isAdmin(false);
  if (!session) return ERR_AUTH_EXPIRED;

  try {
    const id = form.get('id')!;
    const [data] = await db.delete(M_Shortlink).where(eq(M_Shortlink.id, id)).returning();

    revalidatePath('/dashboard/shortlink');
    logger.info(data, 'Deleted shortlink');
    return { success: 1, message: 'Successfully deleted shortlink' };
  } catch (error) {
    logger.error(error, 'Error deleting shortlink');
    return { success: 0, message: `An error occured while deleting shortlink ${error}` };
  }
};

export const batchDeleteShortLink = async (form: TypedFormData<DeleteParams>): Promise<ApiReturn> => {
  const { session } = await isAdmin(false);
  if (!session) return ERR_AUTH_EXPIRED;

  try {
    const ids = JSON.parse(form.get('id')!) as string[];
    const data = await db.delete(M_Shortlink).where(inArray(M_Shortlink.id, ids)).returning();

    revalidatePath('/dashboard/shortlink');
    logger.info(data, 'Deleted shortlinks');
    return { success: 1, message: 'Successfully deleted shortlinks' };
  } catch (error) {
    logger.error(error, 'Error deleting shortlinks');
    return { success: 0, message: `An error occured while deleting shortlinks ${error}` };
  }
};
