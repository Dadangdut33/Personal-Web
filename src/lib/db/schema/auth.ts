import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import { M_User } from './user';

// Session that is automatically managed by Lucia
export const Session = pgTable('session', {
  id: text('id').primaryKey(),
  userId: uuid('userId')
    .notNull()
    .references(() => M_User.id),
  expiresAt: timestamp('expiresAt', {
    withTimezone: true,
    mode: 'date',
  }).notNull(),
});

// Our own temp session for checking temporary session with CRON that runs every 5 minutes
// the expiresAt is set in constants.ts as TEMP_SESSION_AGE
// we need seperate table because you can't set temporary session in Lucia
export const SessionTemp = pgTable('session_temp', {
  id: uuid('id').defaultRandom().primaryKey(),
  sessionId: text('sessionId')
    .notNull()
    .references(() => Session.id, { onDelete: 'cascade' }),
  expiresAt: timestamp('expiresAt', {
    withTimezone: true,
    mode: 'date',
  }).notNull(),
});
