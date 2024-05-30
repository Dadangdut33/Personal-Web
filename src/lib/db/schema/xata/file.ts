import { XATA_STRING_LEN } from "@/lib/constants";
import { json, pgTable, uuid, varchar } from "drizzle-orm/pg-core";

import { fileCategoryEnum } from "../enum";

export type XataFileType = {
  id?: string;
  name?: string;
  mediaType?: string;
  // base64Content?: string;
  enablePublicUrl?: boolean;
  // signedUrlTimeout?: number;
  // uploadUrlTimeout?: number;
  size?: number;
  // version?: number;
  url?: string;
  // signedUrl?: string;
  // uploadUrl?: string;
  attributes?: Record<string, any>;
};
export const M_File = pgTable("file", {
  id: uuid("id").defaultRandom().primaryKey(),
  originalHash: varchar("originalHash", { length: XATA_STRING_LEN }).notNull().unique(),
  file: json("file").notNull().$type<XataFileType>(), // this is actually a file column in xata
  category: fileCategoryEnum("category").default("store"),
});
