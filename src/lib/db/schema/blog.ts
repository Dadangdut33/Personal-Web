import { MAX_VARCHAR } from "@/lib/constants";
import { PartialBlock } from "@blocknote/core";
import { sql } from "drizzle-orm";
import { bigint, boolean, json, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

import { visibilityEnum } from "./_enum";
import { M_Category } from "./category";
import { M_File } from "./file";
import { M_User } from "./user";

const schema = {
  id: uuid("id").defaultRandom().primaryKey(),
  title: varchar("title", { length: MAX_VARCHAR }).notNull(),
  description: text("description").notNull(),
  content: json("content").notNull().$type<PartialBlock[]>(),
  tags: text("tags")
    .array()
    .notNull()
    .default(sql`ARRAY[]::text[]`),
  categoryId: uuid("categoryId").references(() => M_Category.id, { onDelete: "set null" }),
  thumbnailId: uuid("thumbnailId").references(() => M_File.id, { onDelete: "set null" }),
  authorId: uuid("authorId").references(() => M_User.id, { onDelete: "set null" }),
  lastEditorId: uuid("lastEditorId").references(() => M_User.id, { onDelete: "set null" }),
  visibility: visibilityEnum("visibility").default("draft").notNull(),
  pinned: boolean("pinned").notNull().default(false),
  createdAt: timestamp("createdAt", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updatedAt", { withTimezone: true, mode: "date" })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
};

export const M_Blog = pgTable("blog", schema);
export const M_BlogRevision = pgTable("blog_revision", {
  ...schema,
  revisionDate: timestamp("revisionDate", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
  blogId: uuid("blogId").references(() => M_Blog.id, { onDelete: "cascade" }),
});

export const M_Like = pgTable("blog_like", {
  blogId: uuid("blogId")
    .references(() => M_Blog.id, { onDelete: "cascade" })
    .notNull()
    .primaryKey(),
  likes: bigint("likes", { mode: "number" }).notNull().default(0),
  createdAt: timestamp("createdAt", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updatedAt", { withTimezone: true, mode: "date" })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});
