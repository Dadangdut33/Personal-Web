import { drizzle } from "drizzle-orm/xata-http";

// Generated client
import * as schema from "./schema";
import { getXataClient } from "./xata";

export const xata = getXataClient();
export const db = drizzle(xata, { schema });
