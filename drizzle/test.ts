import * as schema from "@/lib/db/schema";
import { dbConfig } from "@/lib/db/utils";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const run = async () => {
  console.log("🚀 Connecting to database...");
  console.log("config:");
  console.log(dbConfig);
  const client = new Pool({ ...dbConfig, max: 1 });
  const db = drizzle(client, { schema });

  console.log("⏳ Testing...");

  const start = Date.now();

  // Test
  // to be added in detail later...
  const result = await client.query("SELECT VERSION()");
  console.log(result.rows[0].version);

  const end = Date.now();

  console.log("✅ Test completed in", end - start, "ms");

  process.exit(0);
};

run().catch((err) => {
  console.error("❌ Test failed");
  console.error(err);
  process.exit(1);
});
