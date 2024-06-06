import { bigint, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const M_Shortlink = pgTable("shortlink", {
  id: uuid("id").defaultRandom().primaryKey(),
  url: text("url").notNull(),
  shorten: text("shorten").notNull().unique(),
  clicks: bigint("clicks", { mode: "number" }).notNull().default(0),
  createdAt: timestamp("createdAt", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updatedAt", { withTimezone: true, mode: "date" })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});
