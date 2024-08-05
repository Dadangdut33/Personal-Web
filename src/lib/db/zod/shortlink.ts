import { M_Shortlink } from '@/lib/db/schema';
import { csrf, Modify } from '@/lib/types';
import { createInsertSchema } from 'drizzle-zod';
import isURL from 'validator/lib/isURL';
import { z } from 'zod';

import { stringMeta } from './utils';

export const insertShortlinkSchema = createInsertSchema(M_Shortlink, {
  shorten: (schema) => schema.shorten.trim().transform((val) => encodeURIComponent(val).replaceAll('%20', '-')),
  url: (schema) => schema.url.trim().refine((value) => isURL(value), { message: 'Invalid URL' }),
});
export type CreateShortLinkZod = z.infer<typeof insertShortlinkSchema>;
export type CreateShortlink = Modify<CreateShortLinkZod, { clicks: string } & stringMeta> & csrf;
