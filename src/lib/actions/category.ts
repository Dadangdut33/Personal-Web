import { ERR_AUTH_EXPIRED } from '@/lib/constants';
import { db } from '@/lib/db';
import { M_Category } from '@/lib/db/schema';
import { ProjectComplete } from '@/lib/db/types';
import { CreateCategory, CreateCategoryZod, insertCategorySchema } from '@/lib/db/zod/category';
import { logger } from '@/lib/logger';
import { isAdmin } from '@/lib/lucia/utils';
import { ApiReturn, DeleteParams, TypedFormData } from '@/lib/types';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { cache } from 'react';

export const getCategoryById = cache(async (_csrf: string, id: string): Promise<ApiReturn<ProjectComplete>> => {
  const { session } = await isAdmin(false);
  if (!session) return ERR_AUTH_EXPIRED;

  try {
    const [data] = await db.select().from(M_Category).where(eq(M_Category.id, id));

    if (!data) return { success: 0, message: 'Category not found' };

    return { success: 1, data, message: 'Successfully fetched category' };
  } catch (error) {
    logger.error(error, 'Error fetching category');
    return { success: 0, message: `An error occured while fetching category ${error}` };
  }
});

export const getAllCategories = cache(async (): Promise<ApiReturn<ProjectComplete[]>> => {
  const { session } = await isAdmin(false);
  if (!session) return ERR_AUTH_EXPIRED;

  try {
    const categories = await db.select().from(M_Category);
    return { success: 1, data: categories, message: 'Successfully fetched categories' };
  } catch (error) {
    logger.error(error, 'Error fetching categories');
    return { success: 0, message: `An error occured while fetching categories ${error}` };
  }
});

export const addCategory = async (form: TypedFormData<CreateCategory>): Promise<ApiReturn> => {
  const { session } = await isAdmin(false);
  if (!session) return ERR_AUTH_EXPIRED;

  try {
    const parsed = insertCategorySchema.parse({
      name: form.get('name')!,
      description: form.get('description')!,
      type: form.get('type')!,
    } satisfies CreateCategoryZod);
    const [data] = await db.insert(M_Category).values(parsed).returning();

    revalidatePath('/dashboard/category');
    logger.info(data, 'Created category');
    return { success: 1, message: 'Successfully created category' };
  } catch (error) {
    logger.error(error, 'Error creating category');
    return { success: 0, message: `An error occured while creating category ${error}` };
  }
};

export const updateCategory = async (form: TypedFormData<CreateCategory>): Promise<ApiReturn> => {
  const { session } = await isAdmin(false);
  if (!session) return ERR_AUTH_EXPIRED;

  try {
    const parsed = insertCategorySchema.parse({
      id: form.get('id')!,
      name: form.get('name')!,
      description: form.get('description')!,
      type: form.get('type')!,
    } satisfies CreateCategoryZod);
    const [data] = await db.update(M_Category).set(parsed).where(eq(M_Category.id, parsed.id!)).returning();

    revalidatePath('/dashboard/category');
    logger.info(data, 'Updated category');
    return { success: 1, message: 'Successfully updated category' };
  } catch (error) {
    logger.error(error, 'Error updating category');
    return { success: 0, message: `An error occured while updating category ${error}` };
  }
};

export const deleteCategory = async (form: TypedFormData<DeleteParams>): Promise<ApiReturn> => {
  const { session } = await isAdmin(false);
  if (!session) return ERR_AUTH_EXPIRED;

  try {
    const id = form.get('id')!;
    const [data] = await db.delete(M_Category).where(eq(M_Category.id, id)).returning();

    revalidatePath('/dashboard/category');
    logger.info(data, 'Deleted category');
    return { success: 1, message: 'Successfully deleted category' };
  } catch (error) {
    logger.error(error, 'Error deleting category');
    return { success: 0, message: `An error occured while deleting category ${error}` };
  }
};

export const batchDeleteCategory = async (form: TypedFormData<DeleteParams>): Promise<ApiReturn> => {
  const { session } = await isAdmin(false);
  if (!session) return ERR_AUTH_EXPIRED;

  try {
    const id = form.get('id')!;
    const [data] = await db.delete(M_Category).where(eq(M_Category.id, id)).returning();

    revalidatePath('/dashboard/category');
    logger.info(data, 'Deleted category');
    return { success: 1, message: 'Successfully deleted category' };
  } catch (error) {
    logger.error(error, 'Error deleting category');
    return { success: 0, message: `An error occured while deleting category ${error}` };
  }
};
