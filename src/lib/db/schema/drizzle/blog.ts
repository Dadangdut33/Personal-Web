import { XATA_STRING_LEN } from "@/lib/constants";
import { PartialBlock } from "@blocknote/core";
import { bigint, boolean, integer, json, pgTable, text, uuid, varchar } from "drizzle-orm/pg-core";

import { visibilityEnum } from "../enum";
import { M_File } from "../xata/file";
import { M_Category } from "./category";
import { M_User } from "./user";

const schema = {
  id: uuid("id").defaultRandom().primaryKey(),
  title: varchar("title", { length: XATA_STRING_LEN }).notNull(),
  description: text("description").notNull(),
  content: json("content").notNull().$type<PartialBlock[]>(),
  tags: json("tags").notNull().default([]).$type<string[]>(),
  categoryId: uuid("categoryId").references(() => M_Category.id, { onDelete: "set null" }),
  thumbnailId: uuid("thumbnailId").references(() => M_File.id, { onDelete: "set null" }),
  authorId: uuid("authorId")
    .notNull()
    .references(() => M_User.id, { onDelete: "set null" }),
  lastEditorId: uuid("lastEditorId").references(() => M_User.id, { onDelete: "set null" }),
  visibility: visibilityEnum("visibility").default("draft").notNull(),
  pinned: boolean("pinned").notNull().default(false),
};

export const M_Blog = pgTable("blog", schema);
export const M_BlogRevision = pgTable("blog_revision", {
  ...schema,
  revision: integer("revision").notNull(),
  blogId: uuid("blogId").references(() => M_Blog.id, { onDelete: "cascade" }),
});

export const M_Like = pgTable("blog_like", {
  blogId: uuid("blogId")
    .references(() => M_Blog.id, { onDelete: "cascade" })
    .notNull()
    .primaryKey(),
  likes: bigint("likes", { mode: "number" }).notNull().default(0),
});
