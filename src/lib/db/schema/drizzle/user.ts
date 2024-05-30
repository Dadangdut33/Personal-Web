import { XATA_STRING_LEN as VARCHAR_LEN } from "@/lib/constants";
import { sql } from "drizzle-orm";
import { pgTable, text, uuid, varchar } from "drizzle-orm/pg-core";

import { roleEnum } from "../enum";
import { M_File } from "../xata";

export const M_User = pgTable("user", {
  id: uuid("id").defaultRandom().primaryKey(),
  username: varchar("username", { length: VARCHAR_LEN }).notNull().unique(),
  hashedPassword: varchar("hashedPassword", { length: VARCHAR_LEN }).notNull(),
  twoFactorSecret: varchar("twoFactorSecret", { length: VARCHAR_LEN }),
  role: roleEnum("role")
    .array()
    .default(sql`ARRAY['user']::role[]`)
    .notNull(),
});

export const M_Profile = pgTable("user_profile", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("userId")
    .notNull()
    .references(() => M_User.id, { onDelete: "cascade" }),
  avatarId: uuid("avatarId").references(() => M_File.id, {
    onDelete: "set null",
  }),
  name: varchar("name", { length: VARCHAR_LEN }).notNull(),
  title: varchar("title", { length: VARCHAR_LEN }), // ex: Developer
  description: text("description"),
});

export const M_UserTwoFactorBackupCodes = pgTable("user_two_factor_backup_codes", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("userId")
    .notNull()
    .references(() => M_User.id, { onDelete: "cascade" }),
  codes: varchar("codes", { length: VARCHAR_LEN }).notNull(),
});
