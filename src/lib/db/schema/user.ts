import { XATA_STRING_LEN } from "@/lib/constants";
import { pgEnum, pgTable, text, uuid, varchar } from "drizzle-orm/pg-core";

import { M_File } from "./file";

export const RoleOption = ["USER", "ADMIN", "SUPER ADMIN"] as const;
export type RoleType = (typeof RoleOption)[number];

export const M_User = pgTable("user", {
  id: uuid("id").defaultRandom().primaryKey(),
  username: varchar("username", { length: XATA_STRING_LEN }).notNull().unique(),
  hashedPassword: varchar("hashedPassword", { length: XATA_STRING_LEN }).notNull(),
  twoFactorSecret: varchar("twoFactorSecret", { length: XATA_STRING_LEN }),
  role: pgEnum("role", RoleOption)("role").notNull().default("USER"),
});

export const M_Profile = pgTable("user_profile", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("userId")
    .notNull()
    .references(() => M_User.id, { onDelete: "cascade" }),
  avatarId: uuid("avatarId").references(() => M_File.id, {
    onDelete: "set null",
  }),
  name: varchar("name", { length: XATA_STRING_LEN }).notNull(),
  title: varchar("title", { length: XATA_STRING_LEN }), // ex: Developer
  description: text("description"),
});

export const M_UserTwoFactorBackupCodes = pgTable("user_two_factor_backup_codes", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("userId")
    .notNull()
    .references(() => M_User.id, { onDelete: "cascade" }),
  codes: varchar("codes", { length: XATA_STRING_LEN }).notNull(),
});
