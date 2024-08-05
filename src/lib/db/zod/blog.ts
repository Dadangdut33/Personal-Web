import { M_Blog } from '@/lib/db/schema';
import { csrf, Modify } from '@/lib/types';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

import { stringMeta } from './utils';

export const insertBlogSchema = createInsertSchema(M_Blog, {
  title: (schema) => schema.title.trim(),
  description: (schema) =>
    schema.description.trim().min(10, { message: 'Description is required! (min 10 characters)' }),
  tags: (schema) => schema.tags.array(),
});
export type CreateBlogZod = z.infer<typeof insertBlogSchema>;
export type CreateBlog = Modify<
  CreateBlogZod,
  {
    content: string;
    tags: string;
    pinned: string;
    thumbnailId: string;
    categoryId: string;
    authorId: string;
    lastEditorId: string;
  } & stringMeta
> &
  csrf;
