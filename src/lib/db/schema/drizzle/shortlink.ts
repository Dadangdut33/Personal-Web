import { pgTable, text, uuid } from "drizzle-orm/pg-core";

export const M_Shortlink = pgTable("shortlink", {
  id: uuid("id").defaultRandom().primaryKey(),
  url: text("url").notNull(),
  shorten: text("shorten").notNull().unique(),
});
