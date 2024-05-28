import { env } from "@/lib/env.mjs";
import { defineConfig } from "drizzle-kit";

// only db:generate works, unless we use postgresql which is still in beta as of now
export default defineConfig({
  schema: "./src/lib/db/schema",
  out: "./drizzle/generated",
  dialect: "postgresql",
  dbCredentials: {
    url: (env.DATABASE_URL as string) ?? "",
  },
});
