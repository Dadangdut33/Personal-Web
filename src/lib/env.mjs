import { createEnv } from "@t3-oss/env-nextjs";
import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

export const env = createEnv({
  server: {
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    DATABASE_URL: z.string().min(1),
    XATA_BRANCH: z.enum(["main", "dev", "test"]).default("main"),
    XATA_API_KEY: z.string().min(1),
    LOGFLARE_API_KEY: z.string().min(1),
    LOGFLARE_SOURCE_TOKEN: z.string().min(1),
    CLEAN_SESSIONS_SECRET: z.string().min(1),
  },
  client: {
    // NEXT_PUBLIC_PUBLISHABLE_KEY: z.string().min(1),
    ANALYTICS_KEY: z.string().nullable(),
    ANALYTICS_PUBLIC_LINK: z.string().nullable(),
  },
  // If you're using Next.js < 13.4.4, you'll need to specify the runtimeEnv manually
  // runtimeEnv: {
  //   DATABASE_URL: process.env.DATABASE_URL,
  //   NEXT_PUBLIC_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_PUBLISHABLE_KEY,
  // },
  // For Next.js >= 13.4.4, you only need to destructure client variables:
  experimental__runtimeEnv: {
    // NEXT_PUBLIC_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_PUBLISHABLE_KEY,
  },
});

export const isProd = env.NODE_ENV === "production";