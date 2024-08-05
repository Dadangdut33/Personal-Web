import { MAX_VARCHAR } from '@/lib/constants';
import { UploadApiResponse } from 'cloudinary';
import { json, pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

import { fileCategoryEnum } from './_enum';
import { M_User } from './user';

export const M_File = pgTable('file', {
  id: uuid('id').defaultRandom().primaryKey(),
  originalHash: varchar('originalHash', { length: MAX_VARCHAR }).notNull().unique(),
  file: json('file').notNull().$type<UploadApiResponse>(), // this is actually a file column in xata
  category: fileCategoryEnum('category').default('uncategorized'),
  uploaderId: uuid('uploaderId')
    .notNull()
    .references(() => M_User.id, { onDelete: 'set null' }),
  lastEditorId: uuid('lastEditorId').references(() => M_User.id, { onDelete: 'set null' }),
  createdAt: timestamp('createdAt', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updatedAt', { withTimezone: true, mode: 'date' })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});
