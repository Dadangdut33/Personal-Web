import { XATA_STRING_LEN } from "@/lib/constants";
import { json, pgEnum, pgTable, uuid, varchar } from "drizzle-orm/pg-core";

export const FileCategoryOption = ["Projects Thumbnail", "Blog Thumbnail", "Blog Content", "Uncategorized"] as const;
export type FileCategoryType = (typeof FileCategoryOption)[number];

export type XataFileType = {
  id?: string;
  name?: string;
  mediaType?: string;
  // base64Content?: string;
  enablePublicUrl?: boolean;
  // signedUrlTimeout?: number;
  // uploadUrlTimeout?: number;
  size?: number;
  version?: number;
  url?: string;
  // signedUrl?: string;
  // uploadUrl?: string;
  attributes?: Record<string, any>;
};

export const M_File = pgTable("file", {
  id: uuid("id").defaultRandom().primaryKey(),
  originalHash: varchar("originalHash", { length: XATA_STRING_LEN }).notNull().unique(),
  file: json("file").notNull().$type<XataFileType>(),
  category: pgEnum("category", FileCategoryOption)("category").notNull(),
});
