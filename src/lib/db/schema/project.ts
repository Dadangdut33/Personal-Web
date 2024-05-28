import { XATA_STRING_LEN } from "@/lib/constants";
import { integer, json, pgEnum, pgTable, text, uuid, varchar } from "drizzle-orm/pg-core";

import { M_Category } from "./category";
import { M_File } from "./file";

export const VisibilityOption = ["DRAFT", "PRIVATE", "PUBLISHED"] as const;
export type VisibilityType = (typeof VisibilityOption)[number];
export const ProjectIconOption = ["github", "link", "download", "blog"] as const;
export type ProjectIconType = (typeof ProjectIconOption)[number];

export type ProjectLinkIcon = {
  url: string;
  icon: ProjectIconType;
};

export const M_Project = pgTable("project", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: varchar("title", { length: XATA_STRING_LEN }).notNull(),
  description: text("description").notNull(),
  tags: json("tags").default([]).$type<string[]>(),
  links: json("links").default([]).$type<ProjectLinkIcon[]>(),
  position: integer("position").notNull().default(0),
  categoryId: uuid("categoryId").references(() => M_Category.id),
  thumbnailId: uuid("thumbnailId").references(() => M_File.id, { onDelete: "set null" }),
  visibility: pgEnum("visibility", VisibilityOption)("visibility").notNull().default("DRAFT"),
});
