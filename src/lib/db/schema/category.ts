import { XATA_STRING_LEN } from "@/lib/constants";
import { pgEnum, pgTable, text, uuid, varchar } from "drizzle-orm/pg-core";

export const CategoryOption = ["BLOG", "PORTOFOLIO"] as const;
export type CategoryType = (typeof CategoryOption)[number];

export const M_Category = pgTable("category", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: XATA_STRING_LEN }).notNull(),
  description: text("description"),
  type: pgEnum("type", CategoryOption)("type").notNull(),
});
