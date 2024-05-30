import * as schema from "@/lib/db/schema";
import { BASE_XATA_RETURN } from "@/lib/db/utils";
import { getXataClient } from "@/lib/db/xata";
import { getTableColumns } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const userCol = getTableColumns(schema.M_User);
const run = async () => {
  const xata = getXataClient();
  const pg_client = new Pool({ connectionString: xata.sql.connectionString, max: 1 });
  const db = drizzle(pg_client, { schema });

  console.log("⏳ Testing...");

  const start = Date.now();

  // Test
  // to be added in detail later...
  const user = await db
    .select({
      ...userCol,
      ...BASE_XATA_RETURN,
    })
    .from(schema.M_User);
  console.log(user);

  const end = Date.now();

  console.log("✅ Test completed in", end - start, "ms");

  process.exit(0);
};

run().catch((err) => {
  console.error("❌ Test failed");
  console.error(err);
  process.exit(1);
});
