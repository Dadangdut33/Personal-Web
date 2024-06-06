import { MAX_VARCHAR as VARCHAR_LEN } from "@/lib/constants";
import { sql } from "drizzle-orm";
import { pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

import { roleEnum } from "./_enum";
import { M_File } from "./file";

export const M_User = pgTable("user", {
  id: uuid("id").defaultRandom().primaryKey(),
  username: varchar("username", { length: VARCHAR_LEN }).notNull().unique(),
  hashedPassword: varchar("hashedPassword", { length: VARCHAR_LEN }).notNull(),
  twoFactorSecret: varchar("twoFactorSecret", { length: VARCHAR_LEN }),
  role: roleEnum("role")
    .array()
    .default(sql`ARRAY['user']::role[]`)
    .notNull(),
  createdAt: timestamp("createdAt", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updatedAt", { withTimezone: true, mode: "date" })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
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
  createdAt: timestamp("createdAt", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updatedAt", { withTimezone: true, mode: "date" })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const M_UserTwoFactorBackupCodes = pgTable("user_two_factor_backup_codes", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("userId")
    .notNull()
    .references(() => M_User.id, { onDelete: "cascade" }),
  codes: varchar("codes", { length: VARCHAR_LEN }).notNull(),
  createdAt: timestamp("createdAt", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updatedAt", { withTimezone: true, mode: "date" })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});
