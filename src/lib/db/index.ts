import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

// Generated client
import * as schema from "./schema";
import { getXataClient } from "./xata";

export const xata = getXataClient();
const pg_client = new Pool({ connectionString: xata.sql.connectionString, max: 20 });
export const db = drizzle(pg_client, { schema });
