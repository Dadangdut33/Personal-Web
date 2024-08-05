import { ERR_AUTH_EXPIRED, MAX_SAVED_REVISIONS } from '@/lib/constants';
import { db } from '@/lib/db';
import { M_Blog, M_BlogRevision, M_Category, M_File, M_Like } from '@/lib/db/schema';
import { BlogComplete, BlogWithRevision } from '@/lib/db/types';
import { CreateBlog, CreateBlogZod, insertBlogSchema } from '@/lib/db/zod/blog';
import { logger } from '@/lib/logger';
import { isAdmin } from '@/lib/lucia/utils';
import { ApiReturn, DeleteParams, MediaUpload, TypedFormData } from '@/lib/types';
import { PartialBlock } from '@blocknote/core';
import { count, desc, eq, getTableColumns, inArray } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { cache } from 'react';

import { increment } from '../db/utils';
import { handleMediaUpload } from './file/cloudinary';

const blog = getTableColumns(M_Blog);
const revision = getTableColumns(M_BlogRevision);
const category = getTableColumns(M_Category);
const thumbnail = getTableColumns(M_File);

export const getBlogById = cache(
  async (_csrf: string, id: string, withRevision = false): Promise<ApiReturn<BlogWithRevision>> => {
    const { session } = await isAdmin(false);
    if (!session) return ERR_AUTH_EXPIRED;

    try {
      const [data] = await db
        .select({ ...blog, category, thumbnail, revision: withRevision ? revision : {} })
        .from(M_Blog)
        .where(eq(M_Blog.id, id))
        .leftJoin(M_Category, eq(M_Category.id, M_Blog.categoryId))
        .leftJoin(M_File, eq(M_File.id, M_Blog.thumbnailId));

      if (!data) return { success: 0, message: 'Blog not found' };

      return { success: 1, data, message: 'Successfully fetched blog' };
    } catch (error) {
      logger.error(error, 'Error fetching blog');
      return { success: 0, message: `An error occured while fetching blog ${error}` };
    }
  }
);

export const getBlogRevisionCountById = cache(async (_csrf: string, id: string): Promise<ApiReturn<number>> => {
  const { session } = await isAdmin(false);
  if (!session) return ERR_AUTH_EXPIRED;

  try {
    const [data] = await db.select({ count: count() }).from(M_BlogRevision).where(eq(M_BlogRevision.blogId, id));

    return { success: 1, data: data.count, message: 'Successfully fetched blog revision count' };
  } catch (error) {
    logger.error(error, 'Error fetching blog revision count');
    return { success: 0, message: `An error occured while fetching blog revision count ${error}` };
  }
});

export const getAllBlogs = cache(async (): Promise<ApiReturn<BlogComplete[]>> => {
  const { session } = await isAdmin(false);
  if (!session) return ERR_AUTH_EXPIRED;

  try {
    const blogs = await db
      .select({ ...blog, category, thumbnail }) // no need to fetch revision, revision is get when getting per blog
      .from(M_Blog)
      .leftJoin(M_Category, eq(M_Category.id, M_Blog.categoryId))
      .leftJoin(M_File, eq(M_File.id, M_Blog.thumbnailId))
      .leftJoin(M_BlogRevision, eq(M_BlogRevision.blogId, M_Blog.id));

    return { success: 1, data: blogs, message: 'Successfully fetched blogs' };
  } catch (error) {
    logger.error(error, 'Error fetching blogs');
    return { success: 0, message: `An error occured while fetching blogs ${error}` };
  }
});

export const addBlog = async (form: TypedFormData<CreateBlog & MediaUpload>): Promise<ApiReturn> => {
  const { session } = await isAdmin(false);
  if (!session) return ERR_AUTH_EXPIRED;

  try {
    const { fileId } = await handleMediaUpload(form as unknown as TypedFormData<MediaUpload>);
    const { content, ...parsed } = insertBlogSchema.parse({
      title: form.get('title')!,
      description: form.get('description')!,
      categoryId: form.get('categoryId')!,
      thumbnailId: fileId,
      tags: JSON.parse(form.get('tags')!),
      content: JSON.parse(form.get('content')!),
      pinned: form.get('pinned')! === 'true',
      visibility: form.get('visibility')!,
      authorId: session.userId,
    } satisfies CreateBlogZod);

    const [data] = await db
      .insert(M_Blog)
      .values({
        ...parsed,
        content: content as PartialBlock[],
      })
      .returning();

    revalidatePath('/dashboard/blog');
    revalidatePath('/blog');
    revalidatePath(`/blog/${data.id}`);
    logger.info(data, 'Created blog');
    return { success: 1, message: 'Successfully created blog' };
  } catch (error) {
    logger.error(error, 'Error creating blog');
    return { success: 0, message: `An error occured while creating blog ${error}` };
  }
};

const limitRevision = async (id: string) => {
  const [revisionCount] = await db.select({ count: count() }).from(M_BlogRevision).where(eq(M_BlogRevision.blogId, id));

  if (revisionCount.count >= MAX_SAVED_REVISIONS) {
    logger.info({ id, count: revisionCount.count }, 'Reached max saved revisions');
    const [oldest] = await db
      .select()
      .from(M_BlogRevision)
      .where(eq(M_BlogRevision.blogId, id))
      .orderBy(desc(M_BlogRevision.createdAt))
      .limit(1);

    // delete oldest revision
    const [deleted] = await db.delete(M_BlogRevision).where(eq(M_BlogRevision.id, oldest.id!)).returning();
    logger.info(deleted, 'Deleted oldest blog revision');
  }
};

export const updateBlog = async (form: TypedFormData<CreateBlog & MediaUpload>): Promise<ApiReturn> => {
  const { session } = await isAdmin(false);
  if (!session) return ERR_AUTH_EXPIRED;

  try {
    const { fileId } = await handleMediaUpload(form as unknown as TypedFormData<MediaUpload>);
    const { content, ...parsed } = insertBlogSchema.parse({
      id: form.get('id')!,
      title: form.get('title')!,
      description: form.get('description')!,
      categoryId: form.get('categoryId')!,
      thumbnailId: fileId,
      tags: JSON.parse(form.get('tags')!),
      content: JSON.parse(form.get('content')!),
      pinned: form.get('pinned')! === 'true',
      visibility: form.get('visibility')!,
      lastEditorId: session.userId,
    } satisfies CreateBlogZod);

    const [{ id, ...data }] = await db
      .update(M_Blog)
      .set({
        ...parsed,
        content: content as PartialBlock[],
      })
      .where(eq(M_Blog.id, parsed.id!))
      .returning();

    logger.info(data, 'Updated blog');

    // first check if revision reached max
    limitRevision(id!);
    const [revision] = await db
      .insert(M_BlogRevision)
      .values({
        ...data, // id is not present in data
        blogId: id,
      })
      .returning();
    logger.info(revision, 'Created blog revision');

    revalidatePath('/dashboard/blog');
    revalidatePath('/blog');
    revalidatePath(`/blog/${id}`);
    return { success: 1, message: 'Successfully updated blog' };
  } catch (error) {
    logger.error(error, 'Error updating blog');
    return { success: 0, message: `An error occured while updating blog ${error}` };
  }
};

export const restoreBlogRevision = async (
  form: TypedFormData<{ csrf_token: string; id: string; revisionId: string }>
): Promise<ApiReturn> => {
  const { session } = await isAdmin(false);
  if (!session) return ERR_AUTH_EXPIRED;

  try {
    const id = form.get('id')!;
    const revisionId = form.get('revisionId')!;
    const [revision] = await db.select().from(M_BlogRevision).where(eq(M_BlogRevision.id, revisionId));
    if (!revision) return { success: 0, message: 'Revision not found' };

    // first check if revision reached max
    limitRevision(id!);
    const [{ id: _, ...currentBlog }] = await db.select().from(M_Blog).where(eq(M_Blog.id, id));

    await db
      .insert(M_BlogRevision)
      .values({
        ...currentBlog,
        blogId: id,
      })
      .returning();
    logger.info('Moved blog to revision');

    const { revisionDate, blogId, id: __, ...revisionData } = revision;
    const [data] = await db
      .update(M_Blog)
      .set({ ...revisionData })
      .where(eq(M_Blog.id, id))
      .returning();

    revalidatePath('/dashboard/blog');
    revalidatePath('/blog');
    revalidatePath(`/blog/${id}`);
    logger.info(data, `Restored blog revision of ${revisionDate} - ${blogId}`);
    return { success: 1, message: 'Successfully restored blog revision' };
  } catch (error) {
    logger.error(error, 'Error restoring blog revision');
    return { success: 0, message: `An error occured while restoring blog revision ${error}` };
  }
};

export const likeBlog = async (_csrf: string, id: string): Promise<ApiReturn> => {
  const { session } = await isAdmin(false);
  if (!session) return ERR_AUTH_EXPIRED;

  try {
    await db
      .update(M_Like)
      .set({ likes: increment(M_Like.likes, 1) })
      .where(eq(M_Like.blogId, id))
      .returning();

    revalidatePath(`/blog/${id}`);
    // no log to prevent spam (we are using free plan so we have limited logs)
    return { success: 1, message: 'Successfully liked blog' };
  } catch (error) {
    logger.error(error, 'Error liking blog');
    return { success: 0, message: `An error occured while liking blog ${error}` };
  }
};

export const deleteBlog = async (form: TypedFormData<DeleteParams>): Promise<ApiReturn> => {
  const { session } = await isAdmin(false);
  if (!session) return ERR_AUTH_EXPIRED;

  try {
    const id = form.get('id')!;
    await db.delete(M_Blog).where(eq(M_Blog.id, id!));

    revalidatePath('/dashboard/blog');
    revalidatePath('/blog');
    logger.info({ id }, 'Deleted blog');
    return { success: 1, message: 'Successfully deleted blog' };
  } catch (error) {
    logger.error(error, 'Error deleting blog');
    return { success: 0, message: `An error occured while deleting blog ${error}` };
  }
};

export const batchDeleteBlog = async (form: TypedFormData<DeleteParams>): Promise<ApiReturn> => {
  const { session } = await isAdmin(false);
  if (!session) return ERR_AUTH_EXPIRED;

  try {
    const ids = JSON.parse(form.get('id')!) as string[];
    await db.delete(M_Blog).where(inArray(M_Blog.id, ids));

    revalidatePath('/dashboard/blog');
    revalidatePath('/blog');
    logger.info({ ids }, 'Deleted blogs');
    return { success: 1, message: 'Successfully deleted blogs' };
  } catch (error) {
    logger.error(error, 'Error deleting blogs');
    return { success: 0, message: `An error occured while deleting blogs ${error}` };
  }
};
