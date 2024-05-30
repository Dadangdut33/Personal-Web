import { sql } from "drizzle-orm";

// Xata automatically adds metadata to each record.
// it also automatically adds id, so the UUID that we define in the schema is actually not inserted by drizzle-orm.
export type XataMetaType = {
  xata_id: string;
  xata_version: number;
  xata_createdat: Date;
  xata_updatedat: Date;
};

export const BASE_XATA_RETURN = {
  xata_id: sql<string>`xata_id`,
  xata_version: sql<number>`xata_version`,
  xata_updatedat: sql<Date>`xata_updatedat`,
  xata_createdat: sql<Date>`xata_createdat`,
};
