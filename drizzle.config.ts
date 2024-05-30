import { env } from "@/lib/env.mjs";
import { defineConfig } from "drizzle-kit";

/*
For now, pushing does not work when using Xata postgres beta.
Use this only for generate command. Read more about this in the drizzle folder readme.
 */
export default defineConfig({
  schema: "./src/lib/db/schema",
  out: "./drizzle/generated",
  dialect: "postgresql",
  dbCredentials: {
    url: (env.DATABASE_URL as string) ?? "",
  },
  verbose: true,
});
