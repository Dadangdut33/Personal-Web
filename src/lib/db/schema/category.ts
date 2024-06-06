import { MAX_VARCHAR } from "@/lib/constants";
import { pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

import { categoryTypeEnum } from "./_enum";

export const M_Category = pgTable("category", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: MAX_VARCHAR }).notNull(),
  description: text("description").notNull(),
  type: categoryTypeEnum("type").notNull(),
  createdAt: timestamp("createdAt", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updatedAt", { withTimezone: true, mode: "date" })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});
