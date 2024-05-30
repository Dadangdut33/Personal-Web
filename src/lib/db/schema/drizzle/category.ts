import { XATA_STRING_LEN } from "@/lib/constants";
import { pgTable, text, uuid, varchar } from "drizzle-orm/pg-core";

import { categoryTypeEnum } from "../enum";

export const M_Category = pgTable("category", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: XATA_STRING_LEN }).notNull(),
  description: text("description"),
  type: categoryTypeEnum("type").notNull(),
});
