import { M_Project } from '@/lib/db/schema';
import { csrf, Modify } from '@/lib/types';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

import { stringMeta } from './utils';

// Modify some types because formData can only send string / file

export const insertProjectSchema = createInsertSchema(M_Project, {
  title: (schema) => schema.title.trim(),
  description: (schema) =>
    schema.description.trim().min(10, { message: 'Description is required! (min 10 characters)' }),
  tags: (schema) => schema.tags.array(),
});
export type CreateProjectZod = z.infer<typeof insertProjectSchema>;
export type CreateProject = Modify<
  CreateProjectZod,
  { tags: string; links: string; position: string; thumbnailId: string; categoryId: string } & stringMeta
> &
  csrf;
