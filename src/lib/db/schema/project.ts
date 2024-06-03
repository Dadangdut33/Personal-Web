import { MAX_VARCHAR } from "@/lib/constants";
import { sql } from "drizzle-orm";
import { integer, json, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

import { visibilityEnum } from "./_enum";
import { M_Category } from "./category";
import { M_File } from "./file";

export const ProjectIconOption = ["github", "link", "download", "blog"] as const;
export type ProjectIconType = (typeof ProjectIconOption)[number];
export type ProjectLinkIcon = {
  url: string;
  icon: ProjectIconType;
};

export const M_Project = pgTable("project", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: varchar("title", { length: MAX_VARCHAR }).notNull(),
  description: text("description").notNull(),
  tags: text("tags")
    .array()
    .notNull()
    .default(sql`ARRAY[]::text[]`),
  links: json("links")
    .$type<ProjectLinkIcon>()
    .array()
    .notNull()
    .default(sql`'{}'::json[]`),
  position: integer("position").notNull().default(0),
  categoryId: uuid("categoryId").references(() => M_Category.id, { onDelete: "set null" }),
  thumbnailId: uuid("thumbnailId").references(() => M_File.id, { onDelete: "set null" }),
  visibility: visibilityEnum("visibility").default("draft").notNull(),
  createdAt: timestamp("createdAt", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updatedAt", { withTimezone: true, mode: "date" })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});
